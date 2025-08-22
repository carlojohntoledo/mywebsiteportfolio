// ✅ Helper: safely extract first valid image
function getFirstImage(images) {
    if (!images || images.length === 0) return "Assets/Images/placeholder.svg";

    for (const img of images) {
        if (typeof img === "string" && img.trim() !== "") return img;
        if (typeof img === "object" && img.url) return img.url;
    }

    return "Assets/Images/placeholder.svg"; // fallback
}

// ✅ Carousel: normalize images and loop safely
function startCarousel(imgElement, images) {
    // Convert mixed array (strings or {url}) to clean URLs
    const urls = images
        .map(img => {
            if (typeof img === "string" && img.trim() !== "") return img;
            if (typeof img === "object" && img.url) return img.url;
            return null;
        })
        .filter(Boolean);

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

// ✅ Main Firestore Loader
async function loadProjectsFromFirestore() {
    const parentContainer = document.querySelector('.project-container-parent');
    parentContainer.innerHTML = ''; // Clear container

    showLoader();

    try {
        const snapshot = await db.collection('projects').get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const uid = doc.id;

            const firstImage = getFirstImage(data.images);

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

            // Conditionally show PDF & Project link
            if (data.pdfLink) {
                card.querySelector('.project-pdf-download').style.display = "inline-block";
            }
            if (data.projectLink) {
                card.querySelector('.project-link').style.display = "inline-block";
            }

            // Tags with pastel colors
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

            // ✅ Carousel only if more than 1 valid image
            if (data.images && data.images.length > 1) {
                const imgElement = document.getElementById(`project-image-${uid}`);
                startCarousel(imgElement, data.images);
            }
        });

        postSorter();
        attachProjectListHandlers();
    } catch (error) {
        console.error('Error loading projects from Firestore:', error);
    } finally {
        hideLoader();
    }
}
