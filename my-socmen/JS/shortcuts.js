function renderRecentProjects(projects) {
    const listContainer = document.querySelector(".recent-projects-list");
    if (!listContainer) return;

    listContainer.innerHTML = ""; // reset

    // Sort by date (latest first)
    const sortedProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

    // Take up to 4 recent projects
    sortedProjects.slice(0, 4).forEach(project => {
        const a = document.createElement("a");
        a.href = `#project-${project.id}`; // anchor link
        a.addEventListener("click", (e) => {
            e.preventDefault(); // prevent default jump
            const target = document.getElementById(`project-${project.id}`);
            if (target) {
                // scroll smoothly, center the target in viewport
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });

        const li = document.createElement("li");
        li.textContent = project.title;

        a.appendChild(li);
        listContainer.appendChild(a);
    });
}
