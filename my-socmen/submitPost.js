// ==========================
// submitPost.js (CREATE MODE)
// ==========================

// --- Safe fallbacks so submitPost.js never crashes ---
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};
window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

// =============================================================
// IMAGE PREVIEW HANDLER (used by both CREATE + EDIT forms)
// =============================================================

// 🔹 Shared state
let existingImages = []; // for EDIT mode → already in Firestore
let newFiles = [];       // new files selected from <input>

// --- Renders both existing & new images into preview container ---
function renderPreview(previewContainer) {
    previewContainer.innerHTML = "";

    // === 1. Show existing Firestore images ===
    existingImages.forEach((imgObj, index) => {
        const filePreview = document.createElement("div");
        filePreview.classList.add("file-preview");

        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("image-preview");

        const img = document.createElement("img");
        img.src = imgObj.imageUrl;
        img.alt = `Existing ${index + 1}`;

        // ❌ Remove button for existing images
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-preview");
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", function () {
            existingImages = existingImages.filter((_, i) => i !== index);
            renderPreview(previewContainer);
        });

        imgWrapper.appendChild(img);
        filePreview.appendChild(imgWrapper);
        filePreview.appendChild(removeBtn);
        previewContainer.appendChild(filePreview);
    });

    // === 2. Show new (local) files ===
    newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `New ${index + 1}`;

            // ❌ Remove button for new files
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";
            removeBtn.addEventListener("click", function () {
                newFiles = newFiles.filter((_, i) => i !== index);
                renderPreview(previewContainer);
            });

            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            previewContainer.appendChild(filePreview);
        };
        reader.readAsDataURL(file);
    });
}

// --- Called when user picks new files ---
function previewImages(event, isEditMode = false) {
    const previewContainer = document.querySelector(".file-preview-container");
    const files = Array.from(event.target.files);

    if (isEditMode) {
        // EDIT MODE → keep old images, add new ones
        newFiles = newFiles.concat(files);
    } else {
        // CREATE MODE → reset everything
        existingImages = [];
        newFiles = files;
    }

    renderPreview(previewContainer);
}

// =============================================================
// SUBMIT POST HANDLER (CREATE MODE)
// =============================================================
async function SubmitPost() {
    document.getElementById("post-btn").addEventListener("click", async function () {
        const title = document.querySelector(".input-project-title");
        const description = document.querySelector(".input-project-description");
        const date = document.querySelector(".input-project-date");
        const status = document.querySelector(".input-project-status");
        const tagsInput = document.querySelector(".input-project-tags");
        const pdfLink = document.querySelector(".input-project-pdf-link");
        const projectLink = document.querySelector(".input-project-link");
        const errorElement = document.querySelector(".error");
        const postCard = document.querySelector(".create-card-container-parent");

        // ❌ Stop if required fields are empty
        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            errorElement.style.display = "flex";
            return;
        }
        errorElement.style.display = "none";
        postCard.style.display = "none";

        const parentContainer = document.querySelector(".project-container-parent");
        parentContainer.style.display = "grid";

        // ✅ Tags: comma-separated string → array
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        try {
            if (typeof showLoader === "function") showLoader();

            // ======================
            // 1. UPLOAD NEW IMAGES
            // ======================
            const uploadedImages = [];

            for (const file of newFiles) {
                const compressedFile = await compressImage(file);
                const result = await uploadToCloudinary(compressedFile);

                if (result) {
                    uploadedImages.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // ======================
            // 2. SAVE TO FIRESTORE
            // ======================
            const projectData = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: uploadedImages, // 🔹 CREATE → only new uploads
                pdfLink: pdfLink.value,
                projectLink: projectLink.value,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection("projects").add(projectData);
            console.log("✅ Saved project ID:", docRef.id);

            // ======================
            // 3. RELOAD + CLEAR FORM
            // ======================
            await loadProjectsFromFirestore();

            // reset inputs
            title.value = "";
            description.value = "";
            date.value = "";
            status.value = "";
            tagsInput.value = "";
            pdfLink.value = "";
            projectLink.value = "";
            newFiles = [];
            existingImages = [];
            document.querySelector(".file-preview-container").innerHTML = "";

        } catch (err) {
            console.error("❌ Error submitting project:", err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });
}

SubmitPost();
