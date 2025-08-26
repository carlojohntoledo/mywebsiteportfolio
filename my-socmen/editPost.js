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

                checkFormChanges(); // re-check for changes
            });

            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            previewContainer.appendChild(filePreview);
        };
        reader.readAsDataURL(file);
    });

    checkFormChanges();
}

// ======================
// OPEN EDIT FORM
// ======================
async function openEditForm(projectId) {
    try {
        const doc = await db.collection("projects").doc(projectId).get();
        if (!doc.exists) return alert("Project not found!");
        const data = doc.data();

        const section = document.querySelector(".project-section");
        const wrapper = document.createElement("div");
        wrapper.classList.add("edit-card-container-parent");
        wrapper.style.display = "block";

        wrapper.innerHTML = `
            <div class="edit-project-container">
                <div class="edit-project-form-container">
                    <div class="edit-project-header">
                        <h1 class="card-title">Edit Project</h1>
                        <span class="edit-project-button-container red-btn" id="cancel-edit-btn">Cancel</span>
                        <span class="edit-project-button-container green-btn" id="save-edit-btn" disabled>Save</span>
                    </div>
                    <div class="error" id="form-warning">
                        <div class="form-warning-cont">
                            <div class="error__icon">⚠️</div>
                            <div class="error__title">Please fill-in required (*) details.</div>
                            <div class="error__close" id="close-error">✖</div>
                        </div>
                    </div>

                    <div class="edit-project-form-viewport scroll-fade">
                        <form id="edit-project-form">

                            <!-- EDIT PROJECT TITLE CONTAINER -->
                            <div class="edit-project-containers project-label">
                                <input class="input-project-title" type="text" required>
                                <label>Project Title*</label>
                            </div>

                            <!--  edit PROJECT DESCRIPTION CONTAINER -->
                            <div class="edit-project-containers project-label">
                                <textarea class="input-project-description" required></textarea>
                                <label>Project Description*</label>
                            </div>

                            <!-- EDIT PROJECT DETAILS CONTAINER -->
                            <div class="flex-container">
                                <div class="edit-project-containers project-label">
                                    <input class="input-project-date" type="date" required>
                                    <label>Project Start Date*</label>
                                </div>
                                <div class="edit-project-containers project-label">
                                    <select class="input-project-status" required>
                                        <option value="Published">Published</option>
                                        <option value="Under Development">Under Development</option>
                                        <option value="Planned">Planned</option>
                                    </select>
                                    <label>Project Status*</label>
                                </div>
                            </div>

                            <!-- EDIT PROJECT TAGS CONTAINER -->
                            <div class="edit-project-containers project-label">
                                <input class="input-project-tags" placeholder="html, css, js..." type="text">
                                <label>Project Tags</label>
                            </div>

                            <!-- EDIT PROJECT ADD-ONS CONTAINER -->
                            <div class="flex-container">
                                <div class="edit-project-containers project-label">
                                    <div class="pdf-upload">
                                        <input class="input-project-pdf-link" placeholder="https//:..." type="url">
                                        <label>PDF Link</label>
                                    </div>
                                </div>
                                <div class="edit-project-containers project-label">
                                    <input class="input-project-link" placeholder="https//:..." type="url">
                                    <label>Project Link</label>
                                </div>
                            </div>

                            <!-- EDIT PROJECT IMAGE CONTAINER -->
                            <div class="edit-project-image-container">
                                <h1>Add Photos</h1>
                                <div class="file-upload-form">
                                    <label class="file-upload-label">
                                        <div class="file-upload-design">
                                            <p>Drag and Drop</p>
                                            <p>or</p>
                                            <span class="browse-button">Browse file</span>
                                            <input id="file" type="file" multiple accept="image/*"
                                                onchange="previewEditImages(event)" />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- IMAGE PREVIEWS -->
                            <div class="preview-new-images"></div>
                            <div class="preview-existing-images"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        section.appendChild(wrapper);

        const saveBtn = wrapper.querySelector("#save-edit-btn");

        // ✅ Track removed images (publicIds)
        const removedImages = [];

        // ✅ Show existing images
        const existingPreviewContainer = wrapper.querySelector(".preview-existing-images");
        if (data.images && data.images.length > 0) {
            data.images.forEach((img, index) => {
                const filePreview = document.createElement("div");
                filePreview.classList.add("file-preview");

                const imgWrapper = document.createElement("div");
                imgWrapper.classList.add("image-preview");

                const image = document.createElement("img");
                image.src = img.imageUrl;
                image.alt = `Existing ${index + 1}`;

                const removeBtn = document.createElement("button");
                removeBtn.classList.add("remove-preview");
                removeBtn.innerHTML = "&times;";
                removeBtn.addEventListener("click", function () {
                    filePreview.remove();
                    image.dataset.removed = "true";

                    // ✅ store publicId for later deletion
                    if (img.publicId) {
                        removedImages.push(img.publicId);
                    }

                    checkFormChanges();
                });

                imgWrapper.appendChild(image);
                filePreview.appendChild(imgWrapper);
                filePreview.appendChild(removeBtn);
                existingPreviewContainer.appendChild(filePreview);
            });
        }

        // ✅ Cancel button (does not delete anything, just discard)
        wrapper.querySelector("#cancel-edit-btn").addEventListener("click", () => {
            wrapper.remove(); // removedImages array is discarded here
        });

        // ✅ Save button
        saveBtn.addEventListener("click", async () => {
            await saveEdit(projectId, data, wrapper, removedImages);
        });

        // ... checkFormChanges + input listeners (same as before) ...

    } catch (err) {
        console.error("❌ Error opening edit form:", err);
    }
}

// ======================
// SAVE EDITED PROJECT
// ======================
async function saveEdit(projectId, oldData, wrapper, removedImages = []) {
    const title = wrapper.querySelector(".input-project-title");
    const description = wrapper.querySelector(".input-project-description");
    const date = wrapper.querySelector(".input-project-date");
    const status = wrapper.querySelector(".input-project-status");
    const tagsInput = wrapper.querySelector(".input-project-tags");
    const pdfLink = wrapper.querySelector(".input-project-pdf-link");
    const projectLink = wrapper.querySelector(".input-project-link");
    const fileInput = wrapper.querySelector("#file");
    const errorElement = wrapper.querySelector(".error");

    if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
        errorElement.style.display = "flex";
        return;
    }
    errorElement.style.display = "none";

    try {
        showLoader();

        // ✅ Delete removed images from Cloudinary first
        for (const publicId of removedImages) {
            await deleteFromCloudinary(publicId);
        }

        // ✅ Tags
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        // 1. Handle existing images (skip removed ones)
        let updatedImages = (oldData.images || []).filter(img => {
            const imgEl = [...wrapper.querySelectorAll(".preview-existing-images img")]
                .find(el => el.src === img.imageUrl);
            return imgEl && !imgEl.dataset.removed;
        });

        // 2. Upload new images
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

        // 3. Update Firestore
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

        // 4. Remove edit form and reload
        wrapper.remove();
        await loadProjectsFromFirestore();

    } catch (err) {
        console.error("❌ Error saving edit:", err);
        alert("Error: " + err.message);
    } finally {
        hideLoader();
    }
}
