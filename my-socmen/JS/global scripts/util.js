// =============================================================
// ✅ Global Loader
// =============================================================
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};

window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

window.showContentLoader = window.showContentLoader || function () {
    const loader = document.querySelector('.content-loader-container');
    if (loader) loader.style.display = 'flex';
};

window.hideContentLoader = window.hideContentLoader || function () {
    const loader = document.querySelector('.content-loader-container');
    if (loader) loader.style.display = 'none';
};
