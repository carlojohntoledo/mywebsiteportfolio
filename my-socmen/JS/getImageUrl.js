// =============================================================
// ✅ Firestore → Load Projects + Render UI
// Handles mixed image formats: string, { url }, { imageUrl }
// =============================================================

// --- Helper: normalize any image item into a usable URL ---
function getImageUrl(item) {
    if (!item) return null;
    if (typeof item === "string" && item.trim() !== "") return item;
    if (typeof item === "object") return item.imageUrl || item.url || null;
    return null;
}

// --- Helper: random pastel color for tag chips ---
function getRandomPastelColor() {
    const colors = [
        "var(--pastel-blue)", "var(--pastel-red)", "var(--pastel-orange)", 
        "var(--pastel-yellow)", "var(--pastel-green)"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// --- Helper: get the first valid image or fallback placeholder ---
function getFirstImage(images) {
    if (!images || images.length === 0) return "Assets/Images/placeholder.svg";
    for (const img of images) {
        const url = getImageUrl(img);
        if (url) return url;
    }
    return "Assets/Images/placeholder.svg";
}
