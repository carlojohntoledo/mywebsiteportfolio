// ✅ Carousel: handle string URLs, object {url}, and skip invalid entries
function startCarousel(imgElement, images) {
    let currentIndex = 0;

    // Normalize + filter invalid
    const urls = images
        .map(img => {
            if (typeof img === "string") return img;
            if (typeof img === "object" && img.url) return img.url;
            return null; // skip invalid
        })
        .filter(Boolean);

    // If no valid images, fallback placeholder
    if (urls.length === 0) {
        imgElement.src = "Assets/Images/placeholder.svg";
        return;
    }

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


// 👉 Sorter: pinned first, then within each group by user-entered date (newest first)
function postSorter() {
    const parent = document.querySelector('.project-container-parent');
    if (!parent) return;

    const cards = Array.from(parent.querySelectorAll('.project-container'));

    cards.sort((a, b) => {
        const aPinned = a.getAttribute('data-pinned') === 'true';
        const bPinned = b.getAttribute('data-pinned') === 'true';
        if (aPinned !== bPinned) return bPinned - aPinned; // pinned above unpinned

        // Date comes from user input (assumed YYYY-MM-DD). Fallback to 0 if invalid.
        const aTime = Date.parse(a.getAttribute('data-date')) || 0;
        const bTime = Date.parse(b.getAttribute('data-date')) || 0;
        return bTime - aTime; // newest first
    });

    cards.forEach(card => parent.appendChild(card));
}

// ✅ Helper to call your deployed backend for image deletion
async function deleteFromCloudinary(publicId) {
    const response = await fetch("https://mywebsiteportfolio-l0gc.onrender.com/delete", {
        method: "POST", // match your Express route
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId })
    });

    const result = await response.json();
    if (!result.success) {
        console.error("Cloudinary deletion failed:", result.error);
    } else {
        console.log("Deleted from Cloudinary:", publicId);
    }

}
// loadProjectsFromFirestore.js

async function loadProjectsFromFirestore() {
    const parentContainer = document.querySelector(".project-container-parent");
    parentContainer.innerHTML = ""; // clear old projects

    try {
        const snapshot = await db.collection("projects")
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const uid = doc.id;

            // fallback if images missing
            const firstImage = data.images && data.images.length > 0
                ? data.images[0].url
                : "Assets/Images/placeholder.png"; // ✅ use placeholder instead of undefined

            // generate unique IDs for controls
            const toggleId = `toggle-${uid}`;
            const pinId = `pin-${uid}`;
            const editId = `edit-${uid}`;
            const removeId = `remove-${uid}`;
            const pinLabelText = data.pinned ? "Unpin Project" : "Pin Project";

            // create wrapper
            const card = document.createElement("div");

            // inject EXACT HTML structure you gave
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
                                    <h1 class="srv" id="pinned-post-indicator"
                                        style="${data.pinned ? "display:block" : "display:none"};">
                                        Pinned
                                    </h1>
                                </div>
                                <div class="project-logo-container">
                                    <h1 class="project-logo-panel">KOALO</h1>
                                </div>
                                <img src="${firstImage}" alt="project image"
                                    class="project-image" id="project-image-${uid}">
                            </div>

                            <div class="project-title-container">
                                <h1 class="project-title">${data.title || ""}</h1>
                                <div class="project-details-container">
                                    <div class="project-name-container">
                                        <img class="xs-profilepic"
                                            src="Assets/Images/Profile Pictures/default-profile-picture.jpg"
                                            alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="project-status-container">
                                        <p class="project-date">${data.date || ""}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="project-links-container scroll-fade">
                                <div class="project-tags-container project-tags"></div>
                            </div>

                            <div class="project-desc-container">
                                <p class="desc-text project-description">${data.description || ""}</p>
                                <button class="toggle-desc">See More</button>
                            </div>
                            <div class="addons-container">
                                <a href="${data.pdfLink || ""}" class="project-pdf-download"
                                    target="_blank" rel="noopener noreferrer">Download PDF</a>
                                <a href="${data.projectLink || ""}" class="project-link"
                                    target="_blank" rel="noopener noreferrer">Live Demo</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // ✅ Attach event listeners safely

            // Pin
            const pinInput = card.querySelector(`#${pinId}`);
            if (pinInput) {
                pinInput.addEventListener("change", async () => {
                    await db.collection("projects").doc(uid).update({
                        pinned: !data.pinned,
                    });
                    loadProjectsFromFirestore(); // reload to update UI
                });
            }

            // Edit
            const editInput = card.querySelector(`#${editId}`);
            if (editInput) {
                editInput.addEventListener("change", () => {
                    console.log("Edit project:", uid);
                    // 👉 implement edit modal later
                });
            }

            // Remove
            const removeInput = card.querySelector(`#${removeId}`);
            if (removeInput) {
                removeInput.addEventListener("change", async () => {
                    if (confirm("Are you sure you want to delete this project?")) {
                        await db.collection("projects").doc(uid).delete();
                        loadProjectsFromFirestore();
                    }
                });
            }

            // Tags
            const tagsContainer = card.querySelector(".project-tags");
            if (tagsContainer && data.tags) {
                data.tags.forEach(tag => {
                    const tagEl = document.createElement("span");
                    tagEl.classList.add("project-tag");
                    tagEl.textContent = tag;
                    tagsContainer.appendChild(tagEl);
                });
            }

            // Description toggle
            const toggleDescBtn = card.querySelector(".toggle-desc");
            const descText = card.querySelector(".desc-text");
            if (toggleDescBtn && descText) {
                toggleDescBtn.addEventListener("click", () => {
                    descText.classList.toggle("expanded");
                    toggleDescBtn.textContent =
                        descText.classList.contains("expanded") ? "See Less" : "See More";
                });
            }

            // Append to parent
            parentContainer.appendChild(card.firstElementChild);
        });
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}


// Attach only once
function attachProjectListHandlers() {
    const parent = document.querySelector('.project-container-parent');
    if (parent.__handlersAttached) return; // guard against multiple attachments
    parent.__handlersAttached = true;

    parent.addEventListener('click', async (e) => {
        const label = e.target.closest('label');
        if (!label) return;

        const card = e.target.closest('.project-container');
        if (!card) return;

        const docId = card.getAttribute('data-id');
        const forAttr = label.getAttribute('for');

        // Close the menu helper
        const closeMenu = () => {
            const toggleInput = card.querySelector('.post-extra-popup input.checkbox');
            if (toggleInput) toggleInput.checked = false;
        };

        // Pin / Unpin (intercept the label click so it doesn’t toggle hidden checkbox)
        if (forAttr && forAttr.startsWith('pin-post-')) {
            e.preventDefault();
            e.stopPropagation();

            const currentlyPinned = card.getAttribute('data-pinned') === 'true';
            const newPinned = !currentlyPinned;

            try {
                await db.collection('projects').doc(docId).update({ pinned: newPinned });

                // Update UI
                card.setAttribute('data-pinned', newPinned ? 'true' : 'false');

                const indicator = card.querySelector('#pinned-post-indicator');
                if (indicator) indicator.style.display = newPinned ? 'block' : 'none';

                const span = label.querySelector('span');
                if (span) span.textContent = newPinned ? 'Unpin Project' : 'Pin Project';

                // Re-sort with the new state
                postSorter();
            } catch (err) {
                console.error('Error updating pin:', err);
            } finally {
                hideLoader(); // 👉 always hide at the end
            }

            closeMenu();
            return;
        }

        // Remove
        if (forAttr && forAttr.startsWith('remove-post-')) {
            e.preventDefault();
            e.stopPropagation();

            if (!confirm('Are you sure you want to delete this project?')) {
                closeMenu();
                return;
            }

            try {
                const projectDoc = await db.collection('projects').doc(docId).get();
                const projectData = projectDoc.data();

                // 🔥 Delete Cloudinary images if they exist
                if (projectData.images && projectData.images.length > 0) {
                    for (const img of projectData.images) {
                        if (img.public_id) {
                            await deleteFromCloudinary(img.public_id);
                        }
                    }
                }

                // Delete Firestore doc
                await db.collection('projects').doc(docId).delete();
                card.remove();
            } catch (err) {
                console.error('Error removing project:', err);
            } finally {
                hideLoader();
            }

            closeMenu();
            return;
        }


        // Edit (placeholder)
        if (forAttr && forAttr.startsWith('edit-post-')) {
            e.preventDefault();
            e.stopPropagation();
            alert('Edit functionality here!');
            closeMenu();
            return;
        }
    });
}

// Load on page start
loadProjectsFromFirestore();
