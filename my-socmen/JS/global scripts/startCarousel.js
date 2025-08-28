

// --- Helper: start carousel rotation for project images ---
function startCarousel(imgElement, images) {
    const urls = (images || []).map(getImageUrl).filter(Boolean);
    if (urls.length === 0) {
        imgElement.src = "Assets/Images/placeholder.svg";
        return;
    }

    let currentIndex = 0;
    imgElement.src = urls[currentIndex];

    setInterval(() => {
        imgElement.style.opacity = 0;
        imgElement.style.transform = "scale(1)";
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % urls.length;
            imgElement.src = urls[currentIndex];
            imgElement.style.opacity = 1;
            imgElement.style.transform = "scale(1.15)";
        }, 1000);
    }, 10000);
}