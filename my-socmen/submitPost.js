// SUBMIT POST JS

function previewImages(event) {
    const files = event.target.files;
    const previewContainer = document.querySelector(".file-preview-container");
    previewContainer.innerHTML = "";
    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader(); reader.onload = function (e) {
            const filePreview = document.createElement("div");

            filePreview.classList.add("file-preview");
            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");
            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `Preview ${index + 1}`;
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";
            removeBtn.addEventListener("click", function () {
                filePreview.remove();
                const dt = new DataTransfer();
                Array.from(files).filter((_, i) => i !== index).forEach(f => dt.items.add(f));
                event.target.files = dt.files;
            });
            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            previewContainer.appendChild(filePreview);
        };
        reader.readAsDataURL(file);
    });
}
function postSorter() {
    const parentContainer = document.querySelector(".project-container-parent");

    // Convert HTMLCollection/NodeList to array
    const posts = Array.from(parentContainer.querySelectorAll(".project-container"));

    // Sort by date (YYYY-MM-DD format from input-project-date)
    posts.sort((a, b) => {
        const dateA = new Date(a.querySelector("#project-date").textContent);
        const dateB = new Date(b.querySelector("#project-date").textContent);
        return dateB - dateA; // newest first
    });

    // Re-append in sorted order
    posts.forEach(post => parentContainer.appendChild(post));
}

async function SubmitPost() {
    document.getElementById("post-btn").addEventListener("click", async function () {
        const title = document.querySelector(".input-project-title");
        const description = document.querySelector(".input-project-description");
        const date = document.querySelector(".input-project-date");
        const status = document.querySelector(".input-project-status");
        const fileInput = document.getElementById("file");
        const errorElement = document.querySelector(".error");
        const postCard = document.querySelector('.create-card-container-parent');

        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            errorElement.style.display = "flex";
            return;
        }
        errorElement.style.display = "none";
        postCard.style.display = 'none';

        const parentContainer = document.querySelector(".project-container-parent");
        parentContainer.style.display = "grid";

        const files = Array.from(fileInput.files);
        const uploadedImages = [];
        for (const file of files) {
            const url = await uploadToCloudinary(file);
            uploadedImages.push(url);
        }

        // 3️⃣ Prepare Firestore data
        const projectData = {
            title: title.value,
            description: description.value,
            status: status.value,
            date: date.value,
            images: uploadedImages, // Cloudinary URLs
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 4️⃣ Save to Firestore
        const docId = await saveProjectToFirestore(projectData);
        console.log("Saved project ID:", docId);


        const uid = Date.now();
        const toggleId = `checkbox-${uid}`;
        const pinId = `pin-post-${uid}`;
        const editId = `edit-post-${uid}`;
        const removeId = `remove-post-${uid}`;

        const firstImage = uploadedImages.length > 0 ? uploadedImages[0] : "Assets/Images/placeholder.svg";

        const newProjectHTML = `
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
                                    <h1 class="srv" >Projects</h1>
                                    <h1 class="srv project-status">${status.value}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="display: none;">Pinned</h1>
                                </div>
                                <div class="project-logo-container">
                                    <h1 class="project-logo-panel">KOALO</h1>
                                </div>
                                <img src="${firstImage}" alt="project image" class="project-image" id="project-image-${uid}">
                            </div>
                            <div class="project-title-container">
                                <h1 class="project-title">${title.value}</h1>
                                <div class="project-details-container">
                                    <div class="project-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="project-status-container">
                                        <p class="project-date">${date.value}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="project-links-container scroll-fade">
                                <div class="project-tag-container project-tags">
                                </div>
                            </div>
                            <div class="project-desc-container">
                                <p class="desc-text project-description">${description.value}</p>
                                <button class="toggle-desc">See More</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        parentContainer.insertAdjacentHTML("beforeend", newProjectHTML);

        if (uploadedImages.length > 1) {
            const imgElement = document.getElementById(`project-image-${uid}`);
            startCarousel(imgElement, uploadedImages);
        }

        // Sort after adding
        postSorter();

        // Clear inputs
        title.value = "";
        description.value = "";
        date.value = "";
        status.value = "";
        fileInput.value = ""; document.getElementById("file-preview-container").innerHTML = "";
    });

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('toggle-desc')) {
            const container = e.target.closest('.project-desc-container');
            const text = container.querySelector('.desc-text');
            text.classList.toggle('expanded');
            e.target.textContent = text.classList.contains('expanded') ? 'See Less' : 'See More';
        }
    });

    // Event delegation for pin/edit/remove remains unchanged
    document.addEventListener("change", function (e) {
        const target = e.target;
        const card = target.closest(".project-container");
        const parentContainer = document.querySelector(".project-container-parent");
        if (!card) return;

        if (target.id.startsWith("pin-post")) {
            const pinIndicator = card.querySelector("#pinned-post-indicator");
            if (target.checked) {
                card.dataset.pinned = "true";
                pinIndicator.style.display = "block";
                const allCards = Array.from(parentContainer.children);
                const firstUnpinned = allCards.find(c => c.dataset.pinned === "false");
                if (firstUnpinned) {
                    parentContainer.insertBefore(card, firstUnpinned);
                } else {
                    parentContainer.insertBefore(card, parentContainer.firstChild);
                }
            } else {
                card.dataset.pinned = "false";
                pinIndicator.style.display = "none";
                const allCards = Array.from(parentContainer.children);
                const lastPinned = allCards.filter(c => c.dataset.pinned === "true").pop();
                if (lastPinned) {
                    parentContainer.insertBefore(card, lastPinned.nextSibling);
                } else {
                    parentContainer.appendChild(card);
                }
            }
        }

        if (target.id.startsWith("edit-post")) {
            alert("Edit functionality here!");
            target.checked = false;
        }

        if (target.id.startsWith("remove-post")) {
            card.remove();
        }
    });

    
}

// Initialize
SubmitPost();