
document.querySelector('.projects-section').addEventListener('click', function (e) {
    if (e.target.id === 'theme-toggle') {
        const body = document.body;
        body.classList.toggle('light-theme');
        localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light-theme' : '');
    }
});

// 2. Keep saved theme on reload
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.classList.add(savedTheme);
}