function startCarousel(imgElement, images) {
    let currentIndex = 0;
    imgElement.src = images[currentIndex];
    setInterval(() => {
        imgElement.style.opacity = 0;
        imgElement.style.transform = 'scale(1)';
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % images.length;
            imgElement.src = images[currentIndex];
            imgElement.style.opacity = 1;
            imgElement.style.transform = 'scale(1.15)';
        }, 1000);
    }, 10000);
}

function showLoader() {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
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


async function loadProjectsFromFirestore() {
    const parentContainer = document.querySelector('.project-container-parent');
    parentContainer.innerHTML = ''; // Clear container

    showLoader();

    try {
        // No Firestore ordering needed; we sort client-side by the user-entered date.
        const snapshot = await db.collection('projects').get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const firstImage =
                data.images && data.images.length > 0
                    ? (data.images[0].url || data.images[0]) // backward-compatible
                    : 'Assets/Images/placeholder.svg';


            // IDs for menu controls
            const toggleId = `checkbox-${uid}`;
            const pinId = `pin-post-${uid}`;
            const editId = `edit-post-${uid}`;
            const removeId = `remove-post-${uid}`;

            const pinLabelText = data.pinned ? 'Unpin Project' : 'Pin Project';

            const projectHTML = `
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

            parentContainer.insertAdjacentHTML('beforeend', projectHTML);

            const card = parentContainer.querySelector('.project-container:last-child');

            // 👉 Conditionally show PDF & Project link
            if (data.pdfLink) {
                card.querySelector('.project-pdf-download').style.display = "inline-block";
            }
            if (data.projectLink) {
                card.querySelector('.project-link').style.display = "inline-block";
            }

            // Tags + random pastel colors
            if (data.tags && data.tags.length > 0) {
                const tagsContainer = card.querySelector('.project-tags-container');
                tagsContainer.innerHTML = data.tags.map(tag => `<div>${tag}</div>`).join('');
                const pastelColors = [
                    'var(--pastel-blue)',
                    'var(--pastel-red)',
                    'var(--pastel-orange)',
                    'var(--pastel-yellow)',
                    'var(--pastel-green)',
                ];
                tagsContainer.querySelectorAll('div').forEach(tagDiv => {
                    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
                    tagDiv.style.backgroundColor = color;
                });
            }

            // Carousel if multiple images
            if (data.images && data.images.length > 1) {
                const imgElement = document.getElementById(`project-image-${uid}`);
                startCarousel(imgElement, data.images);
            }
        });

        // Sort after rendering all cards
        postSorter();

        // Single event delegation for pin/unpin/remove (no duplicates)
        attachProjectListHandlers();

    } catch (error) {
        console.error('Error loading projects from Firestore:', error);
    } finally {
        hideLoader(); // 👉 always hide at the end
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
