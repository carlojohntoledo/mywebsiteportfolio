// =============================================================
// ✅ Firestore → Load Projects + Render UI (Custom HTML structure)
// =============================================================

// --- Normalize any image item into a usable URL ---
function getImageUrl(item) {
    if (!item) return null;
    if (typeof item === "string" && item.trim() !== "") return item;
    if (typeof item === "object") return item.imageUrl || item.url || null;
    return null;
}

// --- Pick first valid image or fallback placeholder ---
function getFirstImage(images) {
    if (!images || images.length === 0) return "Assets/Images/placeholder.svg";
    for (const img of images) {
        const url = getImageUrl(img);
        if (url) return url;
    }
    return "Assets/Images/placeholder.svg";
}

// --- Carousel for multiple images ---
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

// =============================================================
// ✅ Load Firestore projects
// =============================================================
async function loadProjectsFromFirestore() {
    const container = document.querySelector(".project-container-parent");
    container.innerHTML = "";

    try {
        const snapshot = await db.collection("projects")
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            // Normalize first image
            const firstImage = getFirstImage(data.images);

            // Unique IDs for menu checkboxes
            const toggleId = `toggle-${uid}`;
            const pinId = `pin-${uid}`;
            const editId = `edit-${uid}`;
            const removeId = `remove-${uid}`;

            const pinLabelText = data.pinned ? "Unpin Project" : "Pin Project";

            // --- Inject HTML as per your design ---
            const card = document.createElement("div");
            card.innerHTML = `
                <div class="project-container"
                    data-id="${uid}"
                    data-pinned="${data.pinned ? "true" : "false"}"
                    data-date="${data.date || ""}">
                    <div class="project-card">
                        <div class="project-content" style="position: relative;">
                            <div class="post-extra-popup">
                                <input type="checkbox" id="${toggleId}" class="checkbox">
                                <label for="${toggleId}" class="post-extra-btn"><strong>. . .</strong></label>
                                <div class="post-extra-list-container">
                                    <ul class="post-extra-list">
                                        <li>
                                            <input type="checkbox" id="${pinId}" hidden>
                                            <label for="${pinId}"><span>${pinLabelText}</span></label>
                                        </li>
                                        <li>
                                            <input type="checkbox" id="${editId}" hidden>
                                            <label for="${editId}"><span>Edit Project</span></label>
                                        </li>
                                        <li>
                                            <input type="checkbox" id="${removeId}" hidden>
                                            <label for="${removeId}"><span>Remove Project</span></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="project-image-container">
                                <div class="post-indicators">
                                    <h1 class="srv">Projects</h1>
                                    <h1 class="srv project-status">${data.status || ""}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="${data.pinned ? "display:block" : "display:none"};">Pinned</h1>
                                </div>
                                <div class="project-logo-container">
                                    <h1 class="project-logo-panel">KOALO</h1>
                                </div>
                                <img src="${firstImage}" alt="project image" class="project-image" id="project-image-${uid}">
                            </div>

                            <div class="project-title-container">
                                <h1 class="project-title">${data.title || ""}</h1>
                                <div class="project-details-container">
                                    <div class="project-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="project-status-container">
                                        <p class="project-date">${data.date || ""}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="project-links-container scroll-fade">
                                <div class="project-tags-container project-tags">
                                    ${(data.tags || []).map(tag => `<span>${tag}</span>`).join(" ")}
                                </div>
                            </div>

                            <div class="project-desc-container">
                                <p class="desc-text project-description">${data.description || ""}</p>
                                <button class="toggle-desc">See More</button>
                            </div>

                            <div class="addons-container">
                                ${data.pdfLink ? `<a href="${data.pdfLink}" class="project-pdf-download" target="_blank" rel="noopener noreferrer">Download PDF</a>` : ""}
                                ${data.projectLink ? `<a href="${data.projectLink}" class="project-link" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card.firstElementChild);

            // --- Image Carousel ---
            const imgElement = document.getElementById(`project-image-${uid}`);
            startCarousel(imgElement, data.images);

            // --- Pin toggle ---
            const pinInput = card.querySelector(`#${pinId}`);
            pinInput.addEventListener("change", async () => {
                await db.collection("projects").doc(uid).update({
                    pinned: !data.pinned
                });
                loadProjectsFromFirestore();
            });

            // --- Edit ---
            const editInput = card.querySelector(`#${editId}`);
            editInput.addEventListener("change", () => {
                alert("Edit feature not implemented yet");
            });

            // --- Remove ---
            const removeInput = card.querySelector(`#${removeId}`);
            removeInput.addEventListener("change", async () => {
                if (confirm("Are you sure you want to delete this project?")) {
                    if (data.images && data.images.length > 0) {
                        for (const img of data.images) {
                            const pid = img?.publicId || img?.public_id;
                            if (pid) {
                                await deleteFromCloudinary(pid);
                            }
                        }
                    }
                    await db.collection("projects").doc(uid).delete();
                    loadProjectsFromFirestore();
                }
            });
        });

    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadProjectsFromFirestore);
