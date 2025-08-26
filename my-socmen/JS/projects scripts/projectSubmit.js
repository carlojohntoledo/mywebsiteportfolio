// SUBMIT POST JS

// --- Safe fallbacks so submitPost.js never crashes ---
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};
window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

// ======================
// IMAGE PREVIEW HANDLER
// ======================
function previewImages(event) {
    const files = event.target.files;
    const previewContainer = document.querySelector(".file-preview-container");
    previewContainer.innerHTML = "";

    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return; // only preview images

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
// SUBMIT POST HANDLER
// ======================
async function SubmitPost() {
    document.getElementById("post-btn").addEventListener("click", async function () {
        const title = document.querySelector(".input-project-title");
        const description = document.querySelector(".input-project-description");
        const date = document.querySelector(".input-project-date");
        const status = document.querySelector(".input-project-status");
        const tagsInput = document.querySelector(".input-project-tags");
        const pdfLink = document.querySelector(".input-project-pdf-link");
        const projectLink = document.querySelector(".input-project-link");
        const fileInput = document.getElementById("file");
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
        const tagsArray = tagsInput.value.split(",").map(tag => tag.replace(/\s+/g, '')).filter(Boolean);

        // Ensure PDF link and project link start with https://
        let pdfLinkValue = pdfLink.value.trim();
        if (pdfLinkValue && !/^https?:\/\//i.test(pdfLinkValue)) {
            pdfLinkValue = 'https://' + pdfLinkValue;
        }

        let projectLinkValue = projectLink.value.trim();
        if (projectLinkValue && !/^https?:\/\//i.test(projectLinkValue)) {
            projectLinkValue = 'https://' + projectLinkValue;
        }

        console.log("📱 Submitting post...");

        try {
            if (typeof showLoader === "function") showLoader();

            // ======================
            // 1. UPLOAD IMAGES
            // ======================
            const files = Array.from(fileInput.files);
            const uploadedImages = [];

            for (const file of files) {
                // 🔹 Step 1: compress
                const compressedFile = await compressImage(file);

                // 🔹 Step 2: upload to Cloudinary
                const result = await uploadToCloudinary(compressedFile);

                console.log("📤 Upload result:", {
                    name: file.name,
                    originalSize: file.size,
                    uploaded: result
                });

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
                images: uploadedImages, // array of { imageUrl, publicId }
                pdfLink: pdfLinkValue,
                projectLink: projectLinkValue,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection("projects").add(projectData);
            console.log("✅ Saved project ID:", docRef.id);

            // ======================
            // 3. RELOAD + CLEAR FORM
            // ======================
            await loadProjectsFromFirestore();

            title.value = "";
            description.value = "";
            date.value = "";
            status.value = "";
            tagsInput.value = "";
            fileInput.value = "";
            pdfLink.value = "";
            projectLink.value = "";
            document.querySelector(".file-preview-container").innerHTML = "";

        } catch (err) {
            console.error("❌ Error submitting project:", err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });

    // Expand/Collapse description toggle
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("toggle-desc")) {
            const container = e.target.closest(".project-desc-container");
            const text = container.querySelector(".desc-text");
            text.classList.toggle("expanded");
            e.target.textContent = text.classList.contains("expanded") ? "See Less" : "See More";
        }
    });

}

SubmitPost();
