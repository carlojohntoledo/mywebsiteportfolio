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
// ✅ Handle scrolling to hash AFTER projects page loaded
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const hash = window.location.hash;

    // Only do this on projects.html
    if (window.location.pathname.endsWith("projects.html")) {

        // Show loader while rendering cards
        if (typeof showLoader === "function") showLoader();

        // Ensure projects are loaded once (no duplication)
        if (typeof loadProjectsFromFirestore === "function") {
            await loadProjectsFromFirestore();
        }

        // Scroll to hash if exists
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                // Smooth scroll to target
                target.scrollIntoView({ behavior: "smooth", block: "center" });

                // Optional: briefly highlight the card
                target.style.transition = "background 0.5s";
                target.style.backgroundColor = "rgba(255,255,0,0.3)";
                setTimeout(() => target.style.backgroundColor = "", 1500);
            }
        }

        // Hide loader after projects are loaded & scroll complete
        if (typeof hideLoader === "function") hideLoader();
    }

    // Always render recent projects list (all pages)
    renderRecentProjects("projects");
});
