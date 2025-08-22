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


function previewImages(event) {
    const files = event.target.files;
    const previewContainer = document.querySelector(".file-preview-container");
    previewContainer.innerHTML = "";
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
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";
            removeBtn.addEventListener("click", function () {
                filePreview.remove();
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

// ✅ Submit a new project post
async function SubmitPost() {
    // CREATE new post
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

        // ❌ Prevent saving incomplete project
        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            errorElement.style.display = "flex";
            return;
        }
        errorElement.style.display = "none";
        postCard.style.display = "none";

        const parentContainer = document.querySelector(".project-container-parent");
        parentContainer.style.display = "grid";

        // ✅ Tags: comma separated → array
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        console.log("📱 Submitting post...");
        alert("Submit button clicked!");

        try {
            if (typeof showLoader === "function") showLoader();

            // ✅ Upload images
            const files = Array.from(fileInput.files);
            alert("Files length: " + fileInput.files.length);

            const uploadedImages = [];
            for (const file of files) {
                const result = await uploadToCloudinary(file);
                console.log("📱 Uploading:", file.name, file.type, file.size);

                if (result) {
                    // Store consistently so rendering/deletion works
                    uploadedImages.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // ✅ Save to Firestore
            const projectData = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: uploadedImages, // [{ imageUrl, publicId }]
                pdfLink: pdfLink.value,
                projectLink: projectLink.value,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection("projects").add(projectData);
            console.log("✅ Saved project ID:", docRef.id);

            // ✅ Reload list
            await loadProjectsFromFirestore();

            // ✅ Clear form
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
            console.error("Error submitting project:", err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });

    // Toggle description expand/collapse
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("toggle-desc")) {
            const container = e.target.closest(".project-desc-container");
            const text = container.querySelector(".desc-text");
            text.classList.toggle("expanded");
            e.target.textContent = text.classList.contains("expanded") ? "See Less" : "See More";
        }
    });

    // pin/remove handled in loadProjectsFromFirestore()
}

SubmitPost();