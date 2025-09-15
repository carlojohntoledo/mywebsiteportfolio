// =============================================================
// ✅ Render Recent Projects List (hash mode compatible)
// =============================================================
function renderRecentProjects(collectionName) {
    const recentPanel = document.querySelector(".recent-projects-panel");
    if (!recentPanel) return;

    const recentList = recentPanel.querySelector(".recent-projects-list");
    if (!recentList) return;

    recentList.innerHTML = ""; // clear previous items

    db.collection(collectionName)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                const uid = doc.id;

                const link = document.createElement("a");

                // 🔹 Hash if on projects page, full URL if on other page
                if (window.location.pathname.endsWith("projects.html")) {
                    link.href = `#${uid}`;
                } else {
                    link.href = `projects.html#${uid}`;
                }

                const li = document.createElement("li");
                li.textContent = data.title || "Untitled Project";
                link.appendChild(li);
                recentList.appendChild(link);

                // 🔹 Smooth scroll on same page
                link.addEventListener("click", e => {
                    if (link.hash && window.location.pathname.endsWith("projects.html")) {
                        // Prevent default anchor behavior
                        e.preventDefault();

                        const target = document.querySelector(link.hash);
                        if (target) {
                            // Smoothly scroll to target project card
                            target.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    } else if (!window.location.pathname.endsWith("projects.html")) {
                        // 🔹 On other pages: show loader immediately before navigating
                        e.preventDefault();
                        if (typeof showLoader === "function") showLoader();
                        window.location.href = link.href;
                    }
                });
            });
        });
}

// =============================================================
// ✅ Render Pinned Projects in Shortcuts (max 5)
// =============================================================
async function renderPinnedProjects() {
    const pinnedList = document.querySelector(".pinned-projects-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = ""; // clear old list

    try {
        const snapshot = await db.collection("projects")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

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
}

document.addEventListener("DOMContentLoaded", async () => {
    // This ensures pinned projects always show up
    await renderPinnedProjects();
});



// =============================================================
// ✅ Handle scrolling to hash AFTER projects page loaded
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const hash = window.location.hash;

    if (window.location.pathname.endsWith("projects.html")) {
        if (typeof showLoader === "function") showLoader();

        if (typeof loadProjectsFromFirestore === "function") {
            await loadProjectsFromFirestore();
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

    renderRecentProjects("projects");
});



// ----------------------------------------SERVICES-----------------------------------------

// ===================== PINNED SERVICES =====================
// =============================================================
// ✅ Render Pinned Services in Shortcuts (max 5)
// =============================================================
async function renderPinnedServices() {
    const pinnedList = document.querySelector(".pinned-services-list");
    if (!pinnedList) return;

    pinnedList.innerHTML = ""; // clear old list

    try {
        const snapshot = await db.collection("services")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

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

document.addEventListener("DOMContentLoaded", async () => {
    await renderPinnedServices();
});



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

    pinnedList.innerHTML = ""; // clear old list

    try {
        const snapshot = await db.collection("activities")
            .where("pinned", "==", true)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();

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
}


// =============================================================
// ✅ Render Recent Activities (latest 4)
// =============================================================
async function renderRecentActivities() {
    const recentList = document.querySelector(".recent-activities-list");
    if (!recentList) return;

    recentList.innerHTML = "";

    try {
        const snapshot = await db.collection("activities")
            .orderBy("createdAt", "desc")
            .limit(4)
            .get();

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
}


document.addEventListener("DOMContentLoaded", async () => {
    await renderPinnedActivities();
    await renderRecentActivities();
});
