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
            <div class="edit-card-container-parent">
                <div class="edit-card-container">
                    <h2>Edit Project</h2>
                    <div class="error">All required fields must be filled</div>

                    <input type="text" class="input-project-title" placeholder="Project Title" />
                    <textarea class="input-project-description" placeholder="Project Description"></textarea>
                    <input type="date" class="input-project-date" />
                    
                    <select class="input-project-status">
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                    
                    <input type="text" class="input-project-tags" placeholder="Tags (comma separated)" />
                    <input type="url" class="input-project-pdf-link" placeholder="PDF Link" />
                    <input type="url" class="input-project-link" placeholder="Project Link" />

                    <!-- ✅ File input for new uploads -->
                    <input type="file" id="file" multiple accept="image/*" onchange="previewEditImages(event)" />

                    <!-- ✅ Two separate preview containers -->
                    <div class="preview-existing-images"></div>
                    <div class="preview-new-images"></div>

                    <!-- Action buttons -->
                    <div class="edit-actions">
                        <button id="save-edit-btn">Save</button>
                        <button id="cancel-edit-btn">Cancel</button>
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