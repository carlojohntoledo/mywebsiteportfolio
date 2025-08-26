// =============================================================
// ✅ Render Recent Projects List (hash mode compatible)
// =============================================================
function renderRecentProjects(collectionName) {
    const recentPanel = document.querySelector(".recent-projects-panel");
    if (!recentPanel) return;

    const recentList = recentPanel.querySelector(".recent-projects-list");
    if (!recentList) return;

    recentList.innerHTML = ""; // clear previous

    db.collection(collectionName)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                const uid = doc.id;

                const link = document.createElement("a");

                // 🔹 Use hash for same page, full URL for different page
                if (window.location.pathname.endsWith("projects.html")) {
                    link.href = `#${uid}`;
                } else {
                    link.href = `projects.html#${uid}`;
                }

                const li = document.createElement("li");
                li.textContent = data.title || "Untitled Project";

                link.appendChild(li);
                recentList.appendChild(link);

                // 🔹 Smooth scroll if on same page
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
        });
}

// =============================================================
// ✅ Handle scrolling to hash AFTER projects loaded
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const hash = window.location.hash;

    if (window.location.pathname.endsWith("projects.html")) {
        showLoader();

        // Wait for projects to render once
        await loadProjectsFromFirestore();

        // Scroll if hash exists
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                target.style.transition = "background 0.5s";
                target.style.backgroundColor = "rgba(255,255,0,0.3)";
                setTimeout(() => target.style.backgroundColor = "", 1500);
            }
        }

        hideLoader();
    }
});

