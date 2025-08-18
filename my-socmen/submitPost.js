// SUBMIT POST JS (clean - only creates posts)

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

async function SubmitPost() {
    // CREATE new post
    document.getElementById("post-btn").addEventListener("click", async function () {
        const title = document.querySelector(".input-project-title");
        const description = document.querySelector(".input-project-description");
        const date = document.querySelector(".input-project-date");
        const status = document.querySelector(".input-project-status");
        const tagsInput = document.querySelector(".input-project-tags");
        const fileInput = document.getElementById("file");
        const errorElement = document.querySelector(".error");
        const postCard = document.querySelector(".create-card-container-parent");

        // Validate
        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            errorElement.style.display = "flex";
            return;
        }
        errorElement.style.display = "none";
        postCard.style.display = "none";

        const parentContainer = document.querySelector(".project-container-parent");
        parentContainer.style.display = "grid";

        // Tags
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        try {
            showLoader(); // 👉 show loader while uploading + saving

            // Upload images
            const files = Array.from(fileInput.files);
            const uploadedImages = [];
            for (const file of files) {
                const url = await uploadToCloudinary(file);
                uploadedImages.push(url);
            }

            // Firestore data for creation only
            const projectData = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: uploadedImages,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Save once
            const docRef = await db.collection("projects").add(projectData);
            console.log("✅ Saved project ID:", docRef.id);

            // Reload from Firestore (render with handlers)
            await loadProjectsFromFirestore();

            // Clear inputs
            title.value = "";
            description.value = "";
            date.value = "";
            status.value = "";
            tagsInput.value = "";
            fileInput.value = "";
            document.querySelector(".file-preview-container").innerHTML = "";
        } catch (err) {
            console.error("Error submitting project:", err);
        } finally {
            hideLoader(); // 👉 always hide loader when finished
        }
    });

    // Toggle description only (no pin/remove here)
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("toggle-desc")) {
            const container = e.target.closest(".project-desc-container");
            const text = container.querySelector(".desc-text");
            text.classList.toggle("expanded");
            e.target.textContent = text.classList.contains("expanded") ? "See Less" : "See More";
        }
    });

    //pin/remove are handled in loadProjectsFromFirestore()
}

SubmitPost();
