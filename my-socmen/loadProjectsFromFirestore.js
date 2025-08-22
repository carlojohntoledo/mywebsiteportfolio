// =============================================================
// ✅ Firestore → Load Projects + Render UI
// Handles mixed image formats: string, { url }, { imageUrl }
// =============================================================

// --- Helper: normalize any image item into a usable URL ---
function getImageUrl(item) {
    if (!item) return null;

    // Old saved projects: just a plain string URL
    if (typeof item === "string" && item.trim() !== "") return item;

    // Newer saved projects: object formats
    if (typeof item === "object") {
        return item.imageUrl || item.url || null;
    }

    return null;
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

// --- Helper: start carousel rotation for project images ---
function startCarousel(imgElement, images) {
    // Extract only valid URLs
    const urls = (images || [])
        .map(getImageUrl)
        .filter(Boolean);

    if (urls.length === 0) {
        imgElement.src = "Assets/Images/placeholder.svg";
        return;
    }

    let currentIndex = 0;
    imgElement.src = urls[currentIndex]; // show first image immediately

    setInterval(() => {
        imgElement.style.opacity = 0;
        imgElement.style.transform = "scale(1)";

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % urls.length;
            imgElement.src = urls[currentIndex]; // swap to next image
            imgElement.style.opacity = 1;
            imgElement.style.transform = "scale(1.15)";
        }, 1000); // fade transition time
    }, 10000); // every 10 seconds
}

// =============================================================
// ✅ MAIN FUNCTION → Load from Firestore
// =============================================================
async function loadProjectsFromFirestore() {
    const container = document.querySelector(".project-container-parent");
    container.innerHTML = ""; // clear old cards

    try {
        const snapshot = await db.collection("projects")
            .orderBy("pinned", "desc")   // pinned projects come first
            .orderBy("createdAt", "desc") // newest first
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const docId = doc.id;

            // --- Normalize first image (safe fallback if missing) ---
            const firstImage = getFirstImage(data.images);

            // --- Create card element ---
            const card = document.createElement("div");
            card.classList.add("project-card");
            card.innerHTML = `
                <div class="project-container"
                    data-id="${uid}"
                    data-pinned="${data.pinned ? 'true' : 'false'}"
                    data-date="${data.date || ''}">
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
                                    <h1 class="srv project-status">${data.status || ''}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="${data.pinned ? 'display:block' : 'display:none'};">Pinned</h1>
                                </div>
                                <div class="project-logo-container">
                                    <h1 class="project-logo-panel">KOALO</h1>
                                </div>
                                <img src="${firstImage}" alt="project image" class="project-image" id="project-image-${uid}">
                            </div>

                            <div class="project-title-container">
                                <h1 class="project-title">${data.title || ''}</h1>
                                <div class="project-details-container">
                                    <div class="project-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="project-status-container">
                                        <p class="project-date">${data.date || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="project-links-container scroll-fade">
                                <div class="project-tags-container project-tags"></div>
                            </div>

                            <div class="project-desc-container">
                                <p class="desc-text project-description">${data.description || ''}</p>
                                <button class="toggle-desc">See More</button>
                            </div>
                            <div class="addons-container">
                                <a href="${data.pdfLink || ''}" class="project-pdf-download" target="_blank" rel="noopener noreferrer">Download PDF</a>
                                <a href="${data.projectLink || ''}" class="project-link" target="_blank" rel="noopener noreferrer">Live Demo</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(card);

            // --- Start carousel for this card if it has multiple images ---
            const imgElement = card.querySelector(`#project-image-${docId}`);
            startCarousel(imgElement, data.images);

            // --- Hook up Pin Button ---
            const pinBtn = card.querySelector(".pin-project");
            pinBtn.addEventListener("click", async () => {
                await db.collection("projects").doc(docId).update({
                    pinned: !data.pinned
                });
                loadProjectsFromFirestore(); // reload to update order
            });

            // --- Hook up Delete Button ---
            const deleteBtn = card.querySelector(".delete-project");
            deleteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this project?")) {
                    try {
                        // Delete Cloudinary images first
                        if (data.images && data.images.length > 0) {
                            for (const img of data.images) {
                                const pid = img?.publicId || img?.public_id;
                                if (pid) {
                                    await deleteFromCloudinary(pid);
                                }
                            }
                        }

                        // Delete Firestore doc
                        await db.collection("projects").doc(docId).delete();
                        console.log("🗑️ Deleted project:", docId);

                        loadProjectsFromFirestore(); // reload
                    } catch (err) {
                        console.error("Error deleting project:", err);
                    }
                }
            });

            // --- Hook up Edit Button (optional implementation) ---
            const editBtn = card.querySelector(".edit-project");
            editBtn.addEventListener("click", () => {
                alert("Edit feature not implemented yet");
            });
        });

    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

// =============================================================
// ✅ Run loader on page start
// =============================================================
document.addEventListener("DOMContentLoaded", loadProjectsFromFirestore);
