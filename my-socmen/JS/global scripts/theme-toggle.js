document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("theme-toggle");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
            e.preventDefault(); // if <a>, prevents navigation

            document.body.classList.toggle("light-theme");

            // Save preference
            localStorage.setItem(
                "theme",
                document.body.classList.contains("light-theme") ? "light-theme" : ""
            );
        });
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }
});
