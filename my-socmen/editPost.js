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
        showLoader();

        const doc = await db.collection("projects").doc(projectId).get();
        if (!doc.exists) return alert("Project not found!");
        const data = doc.data();

        const section = document.querySelector(".project-section");
        const wrapper = document.createElement("div");
        wrapper.classList.add("edit-card-container-parent");
        wrapper.style.display = "block";

        // Inject the edit form
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

                            <!-- PROJECT TITLE -->
                            <div class="edit-project-containers project-label">
                                <input class="input-project-title" type="text" required>
                                <label>Project Title*</label>
                            </div>

                            <!-- PROJECT DESCRIPTION -->
                            <div class="edit-project-containers project-label">
                                <textarea class="input-project-description" required></textarea>
                                <label>Project Description*</label>
                            </div>

                            <!-- PROJECT DETAILS -->
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

                            <!-- PROJECT TAGS -->
                            <div class="edit-project-containers project-label">
                                <input class="input-project-tags" placeholder="html, css, js..." type="text">
                                <label>Project Tags</label>
                            </div>

                            <!-- ADD-ONS -->
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

                            <!-- IMAGE UPLOAD -->
                            <div class="edit-project-image-container">
                                <h1>Add Photos</h1>
                                <div class="file-upload-form">
                                    <label class="file-upload-label">
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

        // ✅ Get form inputs
        const titleInput = wrapper.querySelector(".input-project-title");
        const descInput = wrapper.querySelector(".input-project-description");
        const dateInput = wrapper.querySelector(".input-project-date");
        const statusInput = wrapper.querySelector(".input-project-status");
        const tagsInput = wrapper.querySelector(".input-project-tags");
        const pdfLinkInput = wrapper.querySelector(".input-project-pdf-link");
        const projectLinkInput = wrapper.querySelector(".input-project-link");

        // ✅ Prefill inputs with existing data
        titleInput.value = data.title || "";
        descInput.value = data.description || "";
        dateInput.value = data.date || "";
        statusInput.value = data.status || "Published";
        tagsInput.value = data.tags ? data.tags.join(", ") : "";
        pdfLinkInput.value = data.pdfLink || "";
        projectLinkInput.value = data.projectLink || "";

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

                    if (img.publicId) removedImages.push(img.publicId);

                    checkFormChanges();
                });

                imgWrapper.appendChild(image);
                filePreview.appendChild(imgWrapper);
                filePreview.appendChild(removeBtn);
                existingPreviewContainer.appendChild(filePreview);
            });

            checkFormChanges();
        }

        const form = wrapper.querySelector("#edit-project-form");
        form.dataset.originalValues = JSON.stringify({
            title: titleInput.value,
            description: descInput.value,
            date: dateInput.value,
            status: statusInput.value,
            tags: tagsInput.value,
            pdfLink: pdfLinkInput.value,
            projectLink: projectLinkInput.value,
            fileCount: 0,
            existingImagesCount: (data.images || []).length
        });


        // ======================
        // Cancel button
        // ======================
        wrapper.querySelector("#cancel-edit-btn").addEventListener("click", () => {
            wrapper.remove();
        });

        // ======================
        // Save button
        // ======================
        saveBtn.addEventListener("click", async () => {
            await saveEdit(projectId, data, wrapper, removedImages);
        });


        checkFormChanges();

        // Add input listeners to detect changes
        [titleInput, descInput, dateInput, statusInput, tagsInput, pdfLinkInput, projectLinkInput]
            .forEach(input => input.addEventListener("input", checkFormChanges));

    } catch (err) {
        console.error("❌ Error opening edit form:", err);
        alert("Error: " + err.message);
    } finally {
        hideLoader(); 
    }
}

// ======================
// Detect changes in form
// ======================
// ======================
// TRACK CHANGES TO ENABLE SAVE BUTTON
// ======================
function checkFormChanges() {
    const form = document.querySelector("#edit-project-form");
    if (!form) return;

    const saveBtn = document.querySelector("#save-edit-btn");
    if (!saveBtn) return;

    // Original values (when form opened)
    const originalValues = form.dataset.originalValues
        ? JSON.parse(form.dataset.originalValues)
        : {};

    // Current values
    const currentValues = {
        title: form.querySelector(".input-project-title")?.value || "",
        description: form.querySelector(".input-project-description")?.value || "",
        date: form.querySelector(".input-project-date")?.value || "",
        status: form.querySelector(".input-project-status")?.value || "",
        tags: form.querySelector(".input-project-tags")?.value || "",
        pdfLink: form.querySelector(".input-project-pdf-link")?.value || "",
        projectLink: form.querySelector(".input-project-link")?.value || "",
        fileCount: form.querySelector("#file")?.files.length || 0,
        existingImagesCount: form.querySelectorAll(".preview-existing-images img:not([data-removed])").length
    };

    // Compare values
    let changed = false;
    for (let key in currentValues) {
        if (currentValues[key] !== originalValues[key]) {
            changed = true;
            break;
        }
    }

    // Enable or disable save button
    saveBtn.disabled = !changed;
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
    fileInput.addEventListener("change", checkFormChanges);
    const errorElement = wrapper.querySelector(".error");

    if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
        errorElement.style.display = "flex";
        return;
    }
    errorElement.style.display = "none";

    // Ensure PDF link and project link start with https://
        let pdfLinkValue = pdfLink.value.trim();
        if (pdfLinkValue && !/^https?:\/\//i.test(pdfLinkValue)) {
            pdfLinkValue = 'https://' + pdfLinkValue;
        }

        let projectLinkValue = projectLink.value.trim();
        if (projectLinkValue && !/^https?:\/\//i.test(projectLinkValue)) {
            projectLinkValue = 'https://' + projectLinkValue;
        }

    try {
        showLoader();

        // ✅ Delete removed images from Cloudinary
        for (const publicId of removedImages) {
            await deleteFromCloudinary(publicId);
        }

        // ✅ Tags
        const tagsArray = tagsInput.value.split(",").map(tag => tag.replace(/\s+/g, '')).filter(Boolean);

        // 1. Keep existing images (skip removed ones)
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
            pdfLink: pdfLinkValue,
            projectLink: projectLinkValue,
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
