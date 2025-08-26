// =============================================================
// ✅ Render Recent Projects List (hash mode compatible)
// =============================================================
function renderRecentProjects(projectsArrayOrCollectionName) {
    const recentPanel = document.querySelector(".recent-projects-panel");
    if (!recentPanel) return;

    const recentList = recentPanel.querySelector(".recent-projects-list");
    if (!recentList) return;

    recentList.innerHTML = ""; // clear previous

    // If passed an array (from loadProjectsFromFirestore), use it directly
    if (Array.isArray(projectsArrayOrCollectionName)) {
        projectsArrayOrCollectionName.slice(0, 5).forEach(project => {
            const link = document.createElement("a");
            if (window.location.pathname.endsWith("projects.html")) {
                link.href = `#${project.id}`;
            } else {
                link.href = `projects.html#${project.id}`;
            }

            const li = document.createElement("li");
            li.textContent = project.title || "Untitled Project";
            link.appendChild(li);
            recentList.appendChild(link);

            link.addEventListener("click", e => {
                if (link.hash && window.location.pathname.endsWith("projects.html")) {
                    e.preventDefault();
                    const target = document.querySelector(link.hash);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            });
        });
    } else {
        // Fallback: collection name string, fetch from Firestore
        db.collection(projectsArrayOrCollectionName)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const uid = doc.id;
                    const link = document.createElement("a");
                    if (window.location.pathname.endsWith("projects.html")) {
                        link.href = `#${uid}`;
                    } else {
                        link.href = `projects.html#${uid}`;
                    }
                    const li = document.createElement("li");
                    li.textContent = data.title || "Untitled Project";
                    link.appendChild(li);
                    recentList.appendChild(link);
                });
            });
    }
}

// =============================================================
// ✅ Handle hash scroll on projects page after load
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const hash = window.location.hash;

    if (window.location.pathname.endsWith("projects.html")) {
        showLoader();

        // Wait for projects to fully load and get array
        let projectsArray = [];
        if (typeof loadProjectsFromFirestore === "function") {
            projectsArray = await loadProjectsFromFirestore();
        }

        // Scroll to hash after DOM fully rendered
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                    target.style.transition = "background 0.5s";
                    target.style.backgroundColor = "rgba(255,255,0,0.3)";
                    setTimeout(() => target.style.backgroundColor = "", 1500);
                }, 50); // small delay
            }
        }

        hideLoader();

        // Render recent projects links
        renderRecentProjects(projectsArray);
    } else {
        // On other pages, just render recent projects
        renderRecentProjects("projects");
    }
});
