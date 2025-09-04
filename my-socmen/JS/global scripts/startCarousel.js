// =============================================================
// Carousel (projects/services) with tracking for lightbox
// =============================================================
const carouselData = new WeakMap(); // map: <imgElement> → { urls, currentIndex }

function startCarousel(imgElement, images) {
    const urls = (images || []).map(getImageUrl).filter(Boolean);
    if (urls.length === 0) {
        imgElement.src = "Assets/Images/placeholder.svg";
        return;
    }

    let currentIndex = 0;
    imgElement.src = urls[currentIndex];

    // 🔹 store data for lightbox
    carouselData.set(imgElement, {
        urls,
        get index() { return currentIndex; },
        set index(v) { currentIndex = v; }
    });

    setInterval(() => {
        imgElement.style.opacity = 0;
        imgElement.style.transform = "translate(-50%, -50%) scale(1)";
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % urls.length;
            imgElement.src = urls[currentIndex];

            // reset scale instantly (no transition)
            imgElement.style.transition = "none";
            imgElement.style.transform = "translate(-50%, -50%) scale(1)";
            void imgElement.offsetWidth; // force reflow to apply reset

            imgElement.style.transition = "opacity 1s ease, transform 10s ease";
            imgElement.style.opacity = 1;
            imgElement.style.transform = "translate(-50%, -50%) scale(1.1)";
        }, 1000);
    }, 5000);
}
