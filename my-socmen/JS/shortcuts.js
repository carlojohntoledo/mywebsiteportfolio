// =============================================================
// ✅ Render Recent Projects Panel with clickable links (hash mode)
// =============================================================
function renderRecentProjects(collectionName = "projects") {
    // --- Get the panel container ---
    const recentPanel = document.querySelector(".recent-projects-panel");
    if (!recentPanel) return console.warn("⚠️ .recent-projects-panel not found");

    const recentList = recentPanel.querySelector(".recent-projects-list");
    if (!recentList) return console.warn("⚠️ .recent-projects-list not found");

    // --- Clear previous items ---
    recentList.innerHTML = "";

    // --- Fetch projects from Firestore ---
    db.collection(collectionName)
        .orderBy("pinned", "desc") // pinned projects first
        .orderBy("createdAt", "desc") // newest first
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                const uid = doc.id;

                // --- Create a link element pointing to the project via hash ---
                const link = document.createElement("a");
                link.href = `projects.html#${uid}`; // hash points to project ID
                link.classList.add("recent-project-link");

                // --- Create list item with project title ---
                const li = document.createElement("li");
                li.textContent = data.title || "Untitled Project";

                // --- Append li to link, and link to list ---
                link.appendChild(li);
                recentList.appendChild(link);
            });
        })
        .catch(err => console.error("❌ Error fetching recent projects:", err));
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
