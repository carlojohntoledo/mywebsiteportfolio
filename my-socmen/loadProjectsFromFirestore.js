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

        async function loadProjectsFromFirestore() {
            const parentContainer = document.querySelector(".project-container-parent");
            parentContainer.innerHTML = ""; // Clear container

            try {
                const snapshot = await db.collection("projects").orderBy("createdAt", "desc").get();

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const uid = doc.id;
                    const firstImage = data.images && data.images.length > 0 ? data.images[0] : "Assets/Images/placeholder.svg";

                    // Unique IDs for toggle/pin/edit/remove
                    const toggleId = `checkbox-${uid}`;
                    const pinId = `pin-post-${uid}`;
                    const editId = `edit-post-${uid}`;
                    const removeId = `remove-post-${uid}`;

                    const projectHTML = `
                <div class="project-container" data-pinned="false">
                    <div class="project-card">
                        <div class="project-content" style="position: relative;">
                            <div class="post-extra-popup">
                                <input type="checkbox" id="${toggleId}" class="checkbox">
                                <label for="${toggleId}" class="post-extra-btn"><strong>. . .</strong></label>
                                <div class="post-extra-list-container">
                                    <ul class="post-extra-list">
                                        <li>
                                            <input type="checkbox" id="${pinId}" hidden>
                                            <label for="${pinId}"><span>Pin Project</span></label>
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
                                    <h1 class="srv project-status">${data.status}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="display: none;">Pinned</h1>
                                </div>
                                <div class="project-logo-container">
                                    <h1 class="project-logo-panel">KOALO</h1>
                                </div>
                                <img src="${firstImage}" alt="project image" class="project-image" id="project-image-${uid}">
                            </div>
                            <div class="project-title-container">
                                <h1 class="project-title">${data.title}</h1>
                                <div class="project-details-container">
                                    <div class="project-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="project-status-container">
                                        <p class="project-date">${data.date}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="project-links-container scroll-fade">
                                <div class="project-tag-container project-tags">
                                    ${data.tags ? data.tags.map(tag => `<div>${tag}</div>`).join('') : ''}
                                </div>
                            </div>
                            <div class="project-desc-container">
                                <p class="desc-text project-description">${data.description}</p>
                                <button class="toggle-desc">See More</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

                    parentContainer.insertAdjacentHTML("beforeend", projectHTML);

                    // Start carousel if multiple images
                    if (data.images && data.images.length > 1) {
                        const imgElement = document.getElementById(`project-image-${uid}`);
                        startCarousel(imgElement, data.images);
                    }
                });
            } catch (error) {
                console.error("Error loading projects from Firestore:", error);
            }
        }

        // Call this when the page loads
        loadProjectsFromFirestore();
