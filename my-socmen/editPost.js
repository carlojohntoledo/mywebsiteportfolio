// ======================
// EDIT POST JS
// ======================

// --- Safe fallbacks so editPost.js never crashes ---
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};
window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

// ======================
// IMAGE PREVIEW HANDLER FOR EDIT FORM
// ======================
function previewEditImages(event) {
    const files = event.target.files;
    const previewContainer = document.querySelector(".preview-new-images");
    previewContainer.innerHTML = ""; // reset only "new" previews

    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `Preview ${index + 1}`;

            // ❌ Remove preview button
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";
            removeBtn.addEventListener("click", function () {
                filePreview.remove();

                // Update FileList in <input type="file">
                const dt = new DataTransfer();
                Array.from(files)
                    .filter((_, i) => i !== index)
                    .forEach((f) => dt.items.add(f));
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

// ======================
// OPEN EDIT FORM
// ======================
async function openEditForm(projectId) {
    try {
        const doc = await db.collection("projects").doc(projectId).get();
        if (!doc.exists) return alert("Project not found!");

        const data = doc.data();

        // 🔹 Inject the full edit form directly
        const section = document.querySelector(".project-section");
        section.innerHTML = `
            <!-- Edit Project Form -->
            <div class="edit-card-container-parent" style="display: block;">
                <div class="edit-project-container">
                    <div class="edit-project-form-container">
                        <div class="edit-project-header">
                            <h1 class="card-title">Edit Project</h1>
                            <span class="edit-project-button-container red-btn" id="cancel-edit-btn">Cancel</span>
                            <span class="edit-project-button-container green-btn" id="save-edit-btn">Save</span>
                        </div>
                        <div class="error" id="form-warning">
                            <div class="form-warning-cont">
                                <div class="error__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"
                                        height="24" fill="none">
                                        <path fill="#393a37"
                                            d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z">
                                        </path>
                                    </svg>
                                </div>
                                <div class="error__title">Please fill-in required (*) details.</div>
                                <div class="error__close" id="close-error"><svg xmlns="http://www.w3.org/2000/svg"
                                        width="20" viewBox="0 0 20 20" height="20">
                                        <path fill="#393a37"
                                            d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="edit-project-form-viewport scroll-fade">
                            <form id="edit-project-form">

                                <!-- EDIT PROJECT TITLE CONTAINER -->
                                <div class="edit-project-containers project-label">
                                    <input class="input-project-title" type="text" required>
                                    <label for="input-project-title">Project Title*</label>
                                </div>

                                <!--  edit PROJECT DESCRIPTION CONTAINER -->
                                <div class="edit-project-containers project-label">
                                    <textarea class="input-project-description" required></textarea>
                                    <label for="input-project-description">Project Description*</label>
                                </div>

                                <!-- EDIT PROJECT DETAILS CONTAINER -->
                                <div class="flex-container">
                                    <div class="edit-project-containers project-label">
                                        <input class="input-project-date" placeholder="" type="date" required>
                                        <label for="input-project-date">Project Start Date*</label>
                                    </div>
                                    <div class="edit-project-containers project-label">
                                        <select class="input-project-status" required>
                                            <option value="Published">Published</option>
                                            <option value="Under Development">Under Development</option>
                                            <option value="Planned">Planned</option>
                                        </select>
                                        <label for="project-status">Project Status*</label>
                                    </div>
                                </div>

                                <!-- EDIT PROJECT TAGS CONTAINER -->
                                <div class="edit-project-containers project-label">
                                    <input class="input-project-tags" placeholder="html, css, js..." type="text">
                                    <label for="input-project-tags">Project Tags</label>
                                </div>

                                <!-- EDIT PROJECT ADD-ONS CONTAINER -->
                                <div class="flex-container">
                                    <div class="edit-project-containers project-label">
                                        <div class="pdf-upload">
                                            <input class="input-project-pdf-link"
                                                placeholder="https//:www.projects-pdf.app" type="url">
                                            <label for="input-project-pdf-link">PDF Link</label>
                                        </div>
                                    </div>
                                    <div class="edit-project-containers project-label">
                                        <input class="input-project-link"
                                            placeholder="https//:www.projects-link.app" type="url">
                                        <label for="input-project-link">Project Link</label>
                                    </div>
                                </div>

                                <!-- EDIT PROJECT IMAGE CONTAINER -->
                                <div class="edit-project-image-container">
                                    <h1>Add Photos</h1>
                                    <div class="file-upload-form">
                                        <label for="file" class="file-upload-label">
                                            <div class="file-upload-design">
                                                <svg viewBox="0 0 640 512" height="1em">
                                                    <path
                                                        d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z">
                                                    </path>
                                                </svg>
                                                <p>Drag and Drop</p>
                                                <p>or</p>
                                                <span class="browse-button">Browse file</span>
                                                <input id="file" type="file" multiple accept="image/*"
                                                    onchange="previewEditImages(event)" />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <!-- EDIT PROJECT IMAGE PREVIEW CONTAINER -->
                                <div class="preview-new-images"></div> <!-- for new uploads -->
                                <div class="preview-existing-images"></div> <!-- for old images -->
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ✅ Fill in existing values
        document.querySelector(".input-project-title").value = data.title || "";
        document.querySelector(".input-project-description").value = data.description || "";
        document.querySelector(".input-project-date").value = data.date || "";
        document.querySelector(".input-project-status").value = data.status || "Published";
        document.querySelector(".input-project-tags").value = data.tags ? data.tags.join(", ") : "";
        document.querySelector(".input-project-pdf-link").value = data.pdfLink || "";
        document.querySelector(".input-project-link").value = data.projectLink || "";

        // ✅ Show existing images
        const existingPreviewContainer = document.querySelector(".preview-existing-images");
        existingPreviewContainer.innerHTML = "";
        if (data.images && data.images.length > 0) {
            data.images.forEach((img, index) => {
                const filePreview = document.createElement("div");
                filePreview.classList.add("file-preview");

                const imgWrapper = document.createElement("div");
                imgWrapper.classList.add("image-preview");

                const image = document.createElement("img");
                image.src = img.imageUrl;
                image.alt = `Existing ${index + 1}`;

                // ❌ Remove existing image
                const removeBtn = document.createElement("button");
                removeBtn.classList.add("remove-preview");
                removeBtn.innerHTML = "&times;";
                removeBtn.addEventListener("click", function () {
                    filePreview.remove();
                    image.dataset.removed = "true"; // mark for removal
                });

                imgWrapper.appendChild(image);
                filePreview.appendChild(imgWrapper);
                filePreview.appendChild(removeBtn);
                existingPreviewContainer.appendChild(filePreview);
            });
        }

        // ✅ Buttons
        document.getElementById("cancel-edit-btn").addEventListener("click", () => {
            section.innerHTML = ""; // close form
            loadProjectsFromFirestore();
        });
        document.getElementById("save-edit-btn").addEventListener("click", () => saveEdit(projectId, data));

    } catch (err) {
        console.error("❌ Error opening edit form:", err);
    }
}



// ======================
// SAVE EDITED PROJECT
// ======================
async function saveEdit(projectId, oldData) {
    const title = document.querySelector(".input-project-title");
    const description = document.querySelector(".input-project-description");
    const date = document.querySelector(".input-project-date");
    const status = document.querySelector(".input-project-status");
    const tagsInput = document.querySelector(".input-project-tags");
    const pdfLink = document.querySelector(".input-project-pdf-link");
    const projectLink = document.querySelector(".input-project-link");
    const fileInput = document.getElementById("file");
    const errorElement = document.querySelector(".error");

    // ❌ Stop if required fields are empty
    if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
        errorElement.style.display = "flex";
        return;
    }
    errorElement.style.display = "none";

    try {
        if (typeof showLoader === "function") showLoader();

        // ✅ Tags: comma-separated → array
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        // ======================
        // 1. Handle existing images
        // ======================
        let updatedImages = (oldData.images || []).filter(img => {
            const imgEl = [...document.querySelectorAll(".preview-existing-images img")].find(el => el.src === img.imageUrl);
            return imgEl && !imgEl.dataset.removed; // keep if not removed
        });

        // ======================
        // 2. Upload new images
        // ======================
        const files = Array.from(fileInput.files);
        for (const file of files) {
            const compressedFile = await compressImage(file);
            const result = await uploadToCloudinary(compressedFile);
            if (result) {
                updatedImages.push({
                    imageUrl: result.imageUrl,
                    publicId: result.publicId
                });
            }
        }

        // ======================
        // 3. Update Firestore
        // ======================
        await db.collection("projects").doc(projectId).update({
            title: title.value,
            description: description.value,
            status: status.value,
            date: date.value,
            tags: tagsArray,
            images: updatedImages,
            pdfLink: pdfLink.value,
            projectLink: projectLink.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Project updated:", projectId);

        // ======================
        // 4. Reload + close form
        // ======================
        document.querySelector(".edit-card-container-parent").style.display = "none";
        await loadProjectsFromFirestore();

    } catch (err) {
        console.error("❌ Error saving edit:", err);
        alert("Error: " + err.message);
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}