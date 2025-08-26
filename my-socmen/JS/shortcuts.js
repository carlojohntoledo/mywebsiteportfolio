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
                    // same page → scroll to hash
                    link.href = `#${uid}`;
                } else {
                    // different page → go to projects.html then hash
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
// ✅ Smooth scroll to project if hash exists (run on projects page)
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Only attempt scroll if there’s a hash in the URL
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            // Smooth scroll to the target card
            target.scrollIntoView({ behavior: "smooth", block: "center" });

            // Optional: briefly highlight the card
            target.style.transition = "background 0.5s";
            target.style.backgroundColor = "rgba(255,255,0,0.3)";
            setTimeout(() => { target.style.backgroundColor = ""; }, 1500);
        }
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // ✅ Render recent projects panel on any page
    renderRecentProjects("projects");

    // ✅ Smooth scroll if URL has a hash (works on projects.html)
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });

            // Optional: highlight
            target.style.transition = "background 0.5s";
            target.style.backgroundColor = "rgba(255,255,0,0.3)";
            setTimeout(() => { target.style.backgroundColor = ""; }, 1500);
        }
    }
});