// =============================================================
// ✅ Global Loader
// =============================================================
function showLoader() {
    let loader = document.getElementById("global-loader");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "global-loader";
        loader.style.cssText = `
            display:flex;
            position:fixed;
            inset:0;
            background:rgba(255,255,255,0.7);
            z-index:9999;
            align-items:center;
            justify-content:center;
        `;
        loader.innerHTML = `<div class="spinner"></div>`;
        document.body.appendChild(loader);

        // add spinner style
        const style = document.createElement("style");
        style.innerHTML = `
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #ddd;
                border-top: 4px solid #333;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
    loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("global-loader");
    if (loader) loader.style.display = "none";
}
