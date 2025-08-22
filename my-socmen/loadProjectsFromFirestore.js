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

// --- Helper: random pastel color for tag chips ---
function getRandomPastelColor() {
    const colors = [
        "#70d6ff", "#ff70a6", "#ff9770", "#e9ff70", "#91f291"
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
    return "Assets/Images/placeholder.svg"; // fallback
}

// --- Helper: start carousel rotation for project images ---
function startCarousel(imgElement, images) {
    const urls = (images || []).map(getImageUrl).filter(Boolean);
    if (urls.length === 0) {
        imgElement.src = "Assets/Images/placeholder.svg";
        return;
    }

    let currentIndex = 0;
    imgElement.src = urls[currentIndex]; // show first image

    // Rotate every 10s with smooth fade
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
// ✅ MAIN FUNCTION → Load from Firestore
// =============================================================
async function loadProjectsFromFirestore() {
    const container = document.querySelector(".project-container-parent");
    container.innerHTML = ""; // clear old cards before re-render

    showLoader(); // 🔵 Show loader while fetching projects

    try {
        // Pull all projects: pinned first, newest on top
        const snapshot = await db.collection("projects")
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        snapshot.forEach(doc => {
            const uid = doc.id;
            const data = doc.data();

            const firstImage = getFirstImage(data.images);

            // Unique IDs for checkboxes in the extra menu
            const toggleId = `toggle-${uid}`;
            const pinId = `pin-${uid}`;
            const editId = `edit-${uid}`;
            const removeId = `remove-${uid}`;
            const pinLabelText = data.pinned ? "Unpin Project" : "Pin Project";

            // --- Build main project card container ---
            const containerDiv = document.createElement("div");
            containerDiv.classList.add("project-container");
            containerDiv.setAttribute("data-id", uid);
            containerDiv.setAttribute("data-pinned", data.pinned ? "true" : "false");
            containerDiv.setAttribute("data-date", data.date || "");

            // Card Markup
            containerDiv.innerHTML = `
                <div class="project-card">
                    <div class="project-content" style="position: relative;">
                        <!-- Extra Menu (Pin / Edit / Remove) -->
                        <div class="post-extra-popup">
                            <input type="checkbox" id="${toggleId}" class="checkbox">
                            <label for="${toggleId}" class="post-extra-btn"><strong>. . .</strong></label>
                            <div class="post-extra-list-container">
                                <ul class="post-extra-list">
                                    <li><input type="checkbox" id="${pinId}" hidden><label for="${pinId}"><span>${pinLabelText}</span></label></li>
                                    <li><input type="checkbox" id="${editId}" hidden><label for="${editId}"><span>Edit Project</span></label></li>
                                    <li><input type="checkbox" id="${removeId}" hidden><label for="${removeId}"><span>Remove Project</span></label></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Image + Indicators -->
                        <div class="project-image-container">
                            <div class="post-indicators">
                                <h1 class="srv">Projects</h1>
                                <h1 class="srv project-status">${data.status || ''}</h1>
                                <h1 class="srv" id="pinned-post-indicator" style="${data.pinned ? 'display:block' : 'display:none'};">Pinned</h1>
                            </div>
                            <div class="project-logo-container"><h1 class="project-logo-panel">KOALO</h1></div>
                            <img src="${firstImage}" alt="project image" class="project-image" id="project-image-${uid}">
                        </div>

                        <!-- Title + Profile -->
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

                        <!-- Tags -->
                        <div class="project-links-container scroll-fade">
                            <div class="project-tags-container project-tags">
                                ${(data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="project-desc-container">
                            <p class="desc-text project-description">${data.description || ''}</p>
                            <button class="toggle-desc">See More</button>
                        </div>

                        <!-- Addons -->
                        <div class="addons-container">
                            ${data.pdfLink ? `<a href="${data.pdfLink}" class="project-pdf-download" target="_blank">Download PDF</a>` : ""}
                            ${data.projectLink ? `<a href="${data.projectLink}" class="project-link" target="_blank">Live Demo</a>` : ""}
                        </div>
                    </div>
                </div>
            `;

            // --- Apply random pastel colors to each tag ---
            const tagsHtml = (data.tags || [])
                .map(tag => `<span class="tag" style="background-color:${getRandomPastelColor()}">${tag}</span>`)
                .join("");
            containerDiv.querySelector(".project-tags-container").innerHTML = tagsHtml;

            // Append finished card
            container.appendChild(containerDiv);

            // Start rotating carousel
            const imgElement = containerDiv.querySelector(`#project-image-${uid}`);
            startCarousel(imgElement, data.images);

            // --- Hook up Extra Menu Actions ---
            const pinCheckbox = containerDiv.querySelector(`#${pinId}`);
            pinCheckbox.addEventListener("change", async () => {
                showLoader(); // 🔵 Show loader while pinning/unpinning
                await db.collection("projects").doc(uid).update({ pinned: !data.pinned });
                await loadProjectsFromFirestore();
                hideLoader(); // 🟢 Hide after reload
            });

            const removeCheckbox = containerDiv.querySelector(`#${removeId}`);
            removeCheckbox.addEventListener("change", async () => {
                if (confirm("Are you sure you want to delete this project?")) {
                    showLoader(); // 🔵 Show loader during delete
                    try {
                        if (data.images && data.images.length > 0) {
                            await Promise.all(
                                data.images.map(img => {
                                    const pid = img?.publicId || img?.public_id;
                                    return pid ? deleteFromCloudinary(pid) : null;
                                })
                            );
                        }
                        await db.collection("projects").doc(uid).delete();
                        await loadProjectsFromFirestore();
                    } catch (err) {
                        console.error("❌ Error deleting project:", err);
                        alert("Something went wrong while deleting the project.");
                    } finally {
                        hideLoader(); // 🟢 Hide loader no matter what
                    }
                }
                removeCheckbox.checked = false; // close menu toggle
            });

            const editCheckbox = containerDiv.querySelector(`#${editId}`);
            editCheckbox.addEventListener("change", () => {
                alert("Edit feature not implemented yet");
            });
        });

    } catch (err) {
        console.error("Error loading projects:", err);
    } finally {
        hideLoader(); // 🟢 Always hide loader after Firestore load
    }
}

// =============================================================
// ✅ Run loader on page start
// =============================================================
document.addEventListener("DOMContentLoaded", loadProjectsFromFirestore);
