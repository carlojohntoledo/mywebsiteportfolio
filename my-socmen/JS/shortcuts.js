
// =============================================================
// ✅ Render Recent Projects Panel
// =============================================================
function renderRecentProjects(projectsArray) {
    const listContainer = document.querySelector(".recent-projects-list");
    if (!listContainer) return;

    listContainer.innerHTML = ""; // clear old

    // Take up to 4 most recent (already sorted by Firestore query)
    const recent = projectsArray.slice(0, 4);

    recent.forEach(project => {
        const a = document.createElement("a");
        a.href = `#project-${project.id}`;
        a.addEventListener("click", e => {
            e.preventDefault();
            const target = document.getElementById(`project-${project.id}`);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        const li = document.createElement("li");
        li.textContent = project.title || "Untitled Project";

        a.appendChild(li);
        listContainer.appendChild(a);
    });
}