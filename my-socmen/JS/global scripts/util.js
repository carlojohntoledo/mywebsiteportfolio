// =============================================================
// ✅ Global Loader
// =============================================================
window.showLoader = window.showLoader || function () 
{ 
    const loader = document.querySelector('.loader-container'); 
    if (loader) loader.style.display = 'flex';
}; 

window.hideLoader = window.hideLoader || function () 
{ 
    const loader = document.querySelector('.loader-container'); 
    if (loader) loader.style.display = 'none'; 
};