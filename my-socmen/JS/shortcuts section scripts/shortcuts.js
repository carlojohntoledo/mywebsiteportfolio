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
async function renderRecentProjects() {
    const recentList = document.querySelector(".recent-projects-list");
    if (!recentList) return;

    recentList.innerHTML = SHORTCUTS_LOADER_HTML;


    try {
        const snapshot = await db.collection("projects").get();
        let projects = [];

        recentList.innerHTML = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            projects.push({ id: doc.id, ...data });
        });

        // Sort: prefer createdAt, else fall back to string date field
        projects.sort((a, b) => {
            const aDate = a.createdAt?.toDate?.() || new Date(a.date || 0);
            const bDate = b.createdAt?.toDate?.() || new Date(b.date || 0);
            return bDate - aDate; // newest first
        });

        // Take latest 4
        projects.slice(0, 4).forEach(proj => {
            const link = document.createElement("a");
            if (window.location.pathname.endsWith("projects.html")) {
                link.href = `#${proj.id}`;
            } else {
                link.href = `projects.html#${proj.id}`;
            }

            const li = document.createElement("li");
            li.textContent = proj.title || "Untitled Project";
            link.appendChild(li);
            recentList.appendChild(link);

            // smooth scroll on projects page
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
// ✅ Render Pinned Projects in Shortcuts (max 5)
// =============================================================
async function renderPinnedProjects() {
    const pinnedList = document.querySelector(".pinned-projects-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = SHORTCUTS_LOADER_HTML; // clear old list

    try {

        const snapshot = await db.collection("projects")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

        pinnedList.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const link = document.createElement("a");

            // if on projects page → use hash; else → full URL
            if (window.location.pathname.endsWith("projects.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `projects.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = data.title || "Untitled Project";
            link.appendChild(li);
            pinnedList.appendChild(link);

            // smooth scroll when already on projects page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("projects.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
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
        "index.html": loadPostsFromFirestore
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
                    target.style.backgroundColor = "rgba(255,255,0,0.3)";
                    setTimeout(() => target.style.backgroundColor = "", 1500);

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
            if (window.location.pathname.endsWith("index.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `index.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = getActivityPreview(data.description);
            link.appendChild(li);
            pinnedList.appendChild(link);

            // smooth scroll if already on activities page
            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("index.html")) {
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

            if (window.location.pathname.endsWith("index.html")) {
                link.href = `#${uid}`;
            } else {
                link.href = `index.html#${uid}`;
            }

            const li = document.createElement("li");
            li.textContent = getActivityPreview(data.description);
            link.appendChild(li);
            recentList.appendChild(link);

            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("index.html")) {
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
                <input class="inputBox" id="inputBox" type="text" placeholder="Search">
            </div>
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
            <div class="recent-search-panel blue-bordered">
                <h2>Recent Search</h2>
                <ul class="recent-search-list">
                    <a href="#"><li>Recent Search Title 1</li></a>
                    <a href="#"><li>Recent Search Title 2</li></a>
                    <a href="#"><li>Recent Search Title 3</li></a>
                    <a href="#"><li>Recent Search Title 4</li></a>
                </ul>
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
    // 1. Build structure first
    await renderShortcutsSection();

    // 2. Then fill data
    await renderPinnedActivities();
    await renderRecentActivities();
    await renderPinnedServices();
});
