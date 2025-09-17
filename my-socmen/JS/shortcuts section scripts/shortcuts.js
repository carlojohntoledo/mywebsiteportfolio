const SHORTCUTS_LOADER_HTML = `
<div class="shortcuts-content-loader-container">
    <div class="content-loader">
        <div class="wrapper">
            <div class="circle"></div>
            <div class="line-1"></div>
            <div class="line-2"></div>
            <div class="line-3"></div>
            <div class="line-4"></div>
        </div>
    </div>
</div>`;

// =============================================================
// ✅ Render Recent Projects List (hash mode compatible)
// =============================================================
// =============================================================
// ✅ Render Recent Projects List (manual date compatible)
// =============================================================
async function renderRecentProjects() {
    const recentList = document.querySelector(".recent-projects-list");
    if (!recentList) return;

    recentList.innerHTML = SHORTCUTS_LOADER_HTML;

    try {
        const snapshot = await db.collection("projects").get(); // ❌ no orderBy
        let projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        // ✅ Sort with your postSorter (uses manual date)
        projects = postSorter("projects", projects).slice(0, 4);

        recentList.innerHTML = "";

        projects.forEach(data => {
            const link = document.createElement("a");
            link.href = window.location.pathname.endsWith("projects.html")
                ? `#${data.id}`
                : `projects.html#${data.id}`;

            const li = document.createElement("li");
            li.textContent = data.title || "Untitled Project";
            link.appendChild(li);
            recentList.appendChild(link);

            // smooth scroll if already on projects page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("projects.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    } catch (err) {
        console.error("Error loading recent projects:", err);
    }

    togglePanelVisibility(".recent-projects-panel", ".recent-projects-list");
}

// =============================================================
// ✅ Render Pinned Projects (manual date compatible)
// =============================================================
async function renderPinnedProjects() {
    const pinnedList = document.querySelector(".pinned-projects-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = SHORTCUTS_LOADER_HTML;

    try {
        const snapshot = await db.collection("projects")
            .where("pinned", "==", true)
            .get(); // ❌ no orderBy

        let projects = [];
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        // ✅ Sort pinned projects using manual date
        projects = postSorter("projects", projects).slice(0, 5);

        pinnedList.innerHTML = "";

        projects.forEach(data => {
            const link = document.createElement("a");
            link.href = window.location.pathname.endsWith("projects.html")
                ? `#${data.id}`
                : `projects.html#${data.id}`;

            const li = document.createElement("li");
            li.textContent = data.title || "Untitled Project";
            link.appendChild(li);
            pinnedList.appendChild(link);

            // smooth scroll if already on projects page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("projects.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    } catch (err) {
        console.error("Error loading pinned projects:", err);
    }

    togglePanelVisibility(".pinned-projects-panel", ".pinned-projects-list");
}


// =============================================================
// ✅ Handle scrolling to hash AFTER page loaded (projects, services, activities)
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    // Map each page to its loader function
    const pageMap = {
        "projects.html": loadPostsFromFirestore,
        "services.html": loadPostsFromFirestore,
        "activities.html": loadPostsFromFirestore
    };

    // Find current page's loader
    const loaderFn = Object.entries(pageMap).find(([page]) => path.endsWith(page));

    if (loaderFn) {
        if (typeof showLoader === "function") showLoader();

        const [, fn] = loaderFn;
        if (typeof fn === "function") {
            await fn();
        }

        if (hash) {
            const tryScroll = () => {
                const target = document.querySelector(hash);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });

                    // highlight briefly
                    target.style.transition = "background 0.5s";
                    target.style.backgroundColor = "var(--accent-color)";
                    setTimeout(() => target.style.backgroundColor = "", 1000);

                    if (typeof hideLoader === "function") hideLoader();
                    return true;
                }
                return false;
            };

            // ✅ Keep checking until target exists (up to 2s)
            let attempts = 0;
            const interval = setInterval(() => {
                if (tryScroll() || attempts > 20) {
                    clearInterval(interval);
                }
                attempts++;
            }, 100);
        } else {
            if (typeof hideLoader === "function") hideLoader();
        }
    }
});


// ----------------------------------------SERVICES-----------------------------------------

// ===================== PINNED SERVICES =====================
// =============================================================
// ✅ Render Pinned Services in Shortcuts (max 5)
// =============================================================
async function renderPinnedServices() {
    const pinnedList = document.querySelector(".pinned-services-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = SHORTCUTS_LOADER_HTML; // clear old list

    try {
        const snapshot = await db.collection("services")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        pinnedList.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const link = document.createElement("a");

            // if on services page → hash; else → full URL
            if (window.location.pathname.endsWith("services.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `services.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = data.title || "Untitled Service";
            link.appendChild(li);
            pinnedList.appendChild(link);

            // smooth scroll if already on services page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("services.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });
    } catch (err) {
        console.error("Error loading pinned services:", err);
    }
}




// -----------------------------------------ACTIVITIES-----------------------------------------

function getActivityPreview(desc) {
    if (!desc) return "Untitled Activity";

    // ✅ Take first line only, strip extra spaces
    let firstLine = desc.split("\n")[0].trim();

    // ✅ Limit to 20 chars + ellipsis if longer
    return firstLine.length > 20
        ? firstLine.slice(0, 20) + "..."
        : firstLine;
}


// =============================================================
// ✅ Render Pinned Activities (max 5)
// =============================================================
async function renderPinnedActivities() {
    const pinnedList = document.querySelector(".pinned-activities-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = SHORTCUTS_LOADER_HTML; // clear old list

    try {
        const snapshot = await db.collection("activities")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        pinnedList.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const link = document.createElement("a");

            // if on activities page → hash; else → full URL
            if (window.location.pathname.endsWith("activities.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `activities.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = getActivityPreview(data.description);
            link.appendChild(li);
            pinnedList.appendChild(link);

            // smooth scroll if already on activities page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("activities.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });
    } catch (err) {
        console.error("Error loading pinned activities:", err);
    }

    togglePanelVisibility(".pinned-activities-panel", ".pinned-activities-list");
}


// =============================================================
// ✅ Render Recent Activities (latest 4)
// =============================================================
async function renderRecentActivities() {
    const recentList = document.querySelector(".recent-activities-list");
    if (!recentList) return;

    recentList.innerHTML = SHORTCUTS_LOADER_HTML;

    try {
        const snapshot = await db.collection("activities")
            .orderBy("createdAt", "desc")
            .limit(4)
            .get();

        recentList.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const link = document.createElement("a");

            if (window.location.pathname.endsWith("activities.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `activities.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = getActivityPreview(data.description);
            link.appendChild(li);
            recentList.appendChild(link);

            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("activities.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });
    } catch (err) {
        console.error("Error loading recent activities:", err);
    }

    togglePanelVisibility(".recent-activities-panel", ".recent-activities-list");
}


function togglePanelVisibility(panelSelector, listSelector) {
    const panel = document.querySelector(panelSelector);
    if (!panel) return;

    const list = panel.querySelector(listSelector);
    if (!list) return;

    // Hide panel if list is empty, show otherwise
    panel.style.display = list.children.length === 0 ? "none" : "";
}


// =============================================================
// ✅ Render Shortcuts Section
// =============================================================
async function renderShortcutsSection() {
    const shortcutsSection = document.querySelector(".shortcuts-section");
    if (!shortcutsSection) return;

    // Base HTML
    shortcutsSection.innerHTML = `
        <div class="search-section red-bordered">
            <div class="search-container">
                <svg class="search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" alt="search icon">
                    <path d="M46.599 46.599a4.498 4.498 0 0 1-6.363 0l-7.941-7.941C29.028 40.749 25.167 42 21 42 9.402 42 0 32.598 0 21S9.402 0 21 0s21 9.402 21 21c0 4.167-1.251 8.028-3.342 11.295l7.941 7.941a4.498 4.498 0 0 1 0 6.363zM21 6C12.717 6 6 12.714 6 21s6.717 15 15 15c8.286 0 15-6.714 15-15S29.286 6 21 6z"></path>
                </svg>
                <input class="inputBox" id="shortcuts-search-input" type="text" placeholder="Search">
            </div>
            <div id="shortcuts-search-results" class="search-results-popup"></div>
        </div>

        <div class="pinned-section red-bordered">
            <div class="pinned-activities-panel blue-bordered">
                <h2>Pinned Activities</h2>
                <ul class="pinned-activities-list"></ul>
            </div>
            <div class="pinned-projects-panel blue-bordered">
                <h2>Pinned Projects</h2>
                <ul class="pinned-projects-list"></ul>
            </div>
            <div class="pinned-skills-panel blue-bordered">
                <h2>Pinned Services</h2>
                <ul class="pinned-services-list"></ul>
            </div>
        </div>

        <div class="recent-section red-bordered">
            <div class="recent-activities-panel blue-bordered">
                <h2>Recent Activities</h2>
                <ul class="recent-activities-list"></ul>
            </div>
            <div class="recent-projects-panel blue-bordered">
                <h2>Recent Projects</h2>
                <ul class="recent-projects-list"></ul>
            </div>
        </div>
    `;

    // --- Hide empty pinned panels ---
    ["activities", "projects", "services"].forEach(type => {
        const list = shortcutsSection.querySelector(`.pinned-${type}-list`);
        const panel = shortcutsSection.querySelector(`.pinned-${type}-panel`);

        if (list && panel && list.children.length === 0) {
            panel.style.display = "none";
        }
    });
}



document.addEventListener("DOMContentLoaded", async () => {
    // 1. Build base HTML
    await renderShortcutsSection();

    // 2. Load posts for search
    await loadAllPosts();

    // 3. Render pinned/recent shortcuts
    await renderPinnedActivities();
    await renderRecentActivities();
    await renderPinnedServices();
    await renderPinnedProjects();
    await renderRecentProjects();

    // 4. Setup search functionality
    setupSearch();

    await loadAllPosts();

});


async function loadAllPosts() {
    const types = ["activities", "projects", "services"];
    const seen = new Set();   // ✅ track unique posts
    allPosts = [];

    for (const type of types) {
        const snapshot = await db.collection(type)
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const uniqueKey = `${type}_${doc.id}`; // ✅ unique key per type+id

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);

                allPosts.push({
                    id: doc.id,
                    type,
                    title: data.title || "",
                    description: data.description || "",
                    tags: data.tags || [],
                    link: `${type}.html#${doc.id}`,
                    createdAt: data.createdAt || null
                });
            }
        });
    }

    console.log("✅ All posts loaded for search:", allPosts.length);
}
function searchPosts(query) {
    query = query.toLowerCase().trim();
    if (!query) return [];

    const results = allPosts.filter(post => {
        const inTags = post.tags.some(tag => tag.toLowerCase().includes(query));
        const inTitle = post.title.toLowerCase().includes(query);
        const inDesc = post.description.toLowerCase().includes(query);
        return inTags || inTitle || inDesc;
    });

    // ✅ remove duplicates by "id"
    const seen = new Set();
    return results.filter(post => {
        if (seen.has(post.id)) return false;
        seen.add(post.id);
        return true;
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("shortcuts-search-input");
    const resultsContainer = document.getElementById("shortcuts-search-results");

    // live search as user types
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        const results = searchPosts(query);
        showSearchResults(query, results, resultsContainer);
    });

    // ❌ remove saving on Enter, only save when result is clicked
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });
});
// =============================================================
// ✅ Search Helper (no recent search list, just popup results)
// =============================================================
function showSearchResults(query, results, container) {
    container.innerHTML = `<h1 class="search-label" style="margin: 0 0.5rem; position: sticky;">Search Results</h1>`;

    if (!query || results.length === 0) {
        container.style.display = "none";
        return;
    }

    const ul = document.createElement("ul");
    results.forEach(post => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${post.title || "(No Title)"}</strong>
            <small>(${post.type})</small><br>
            <span>${post.description.substring(0, 60)}...</span>
        `;

        li.addEventListener("click", () => {
            // ✅ Hide popup
            container.style.display = "none";

            // ✅ Navigate to clicked post
            window.location.href = post.link;
        });

        ul.appendChild(li);
    });

    container.appendChild(ul);
    container.style.display = "block";
}

// =============================================================
// ✅ Setup Search
// =============================================================
function setupSearch() {
    const searchInput = document.getElementById("shortcuts-search-input");
    const resultsContainer = document.getElementById("shortcuts-search-results");

    if (!searchInput || !resultsContainer) return;

    // live search as user types
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        const results = searchPosts(query);
        showSearchResults(query, results, resultsContainer);
    });

    // prevent Enter from submitting
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });
}
