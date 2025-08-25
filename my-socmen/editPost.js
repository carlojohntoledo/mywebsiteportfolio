// ==========================
// editPost.js (EDIT MODE)
// ==========================

// Global arrays to track images in Edit mode
let existingImages = []; // holds images already saved in Firestore
let newFiles = [];       // holds files newly added during editing

// ---------------------------------------
// Helper: Render existing images (old ones)
// ---------------------------------------
function showExistingImages(images) {
    const container = document.querySelector(".preview-existing-images");
    container.innerHTML = ""; // clear old previews
    existingImages = [...images]; // copy to global

    images.forEach((img, index) => {
        const filePreview = document.createElement("div");
        filePreview.classList.add("file-preview");

        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("image-preview");

        const imageEl = document.createElement("img");
        imageEl.src = img.imageUrl;
        imageEl.alt = `Existing ${index + 1}`;

        // ❌ Remove button for existing images
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-preview");
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", function () {
            filePreview.remove();

            // Remove from global existingImages
            existingImages = existingImages.filter((_, i) => i !== index);
        });

        imgWrapper.appendChild(imageEl);
        filePreview.appendChild(imgWrapper);
        filePreview.appendChild(removeBtn);
        container.appendChild(filePreview);
    });
}

// ---------------------------------------
// Helper: Render newly added files
// ---------------------------------------
function showNewImages(files) {
    const container = document.querySelector(".preview-new-images");
    container.innerHTML = ""; // always refresh to avoid duplication
    newFiles = [...files]; // save to global

    newFiles.forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `New ${index + 1}`;

            // ❌ Remove button for new images
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";
            removeBtn.addEventListener("click", function () {
                filePreview.remove();

                // Remove from global newFiles
                newFiles = newFiles.filter((_, i) => i !== index);
                showNewImages(newFiles); // re-render updated list
            });

            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            container.appendChild(filePreview);
        };
        reader.readAsDataURL(file);
    });
}

// ---------------------------------------
// Open Edit Form
// ---------------------------------------
async function openEditForm(projectId) {
    try {
        const doc = await db.collection("projects").doc(projectId).get();
        if (!doc.exists) return;

        const project = doc.data();

        // 1. Show edit form
        const form = document.querySelector(".create-card-container-parent");
        form.style.display = "block";

        // 2. Fill input values
        document.querySelector(".input-project-title").value = project.title || "";
        document.querySelector(".input-project-description").value = project.description || "";
        document.querySelector(".input-project-date").value = project.date || "";
        document.querySelector(".input-project-status").value = project.status || "";
        document.querySelector(".input-project-tags").value = (project.tags || []).join(", ");
        document.querySelector(".input-project-pdf-link").value = project.pdfLink || "";
        document.querySelector(".input-project-link").value = project.projectLink || "";

        // 3. Switch form to "Edit" mode
        const titleElement = document.querySelector(".card-title");
        titleElement.textContent = "Edit Post";
        postBtn.textContent = "Save";

        // 4. Load existing images
        showExistingImages(project.images || []);

        // 5. Reset new images container
        document.querySelector(".preview-new-images").innerHTML = "";
        newFiles = [];

        // 6. Handle Save button (update Firestore)
        let oldBtn = document.getElementById("post-btn");
        // Clone the button to remove all previous event listeners (from create mode)
        let newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);

        // Re-select the replaced button
        const postBtn = document.getElementById("post-btn");
        postBtn.textContent = "Save";

        postBtn.onclick = async function () {
            const title = document.querySelector(".input-project-title").value.trim();
            const description = document.querySelector(".input-project-description").value.trim();
            const date = document.querySelector(".input-project-date").value.trim();
            const status = document.querySelector(".input-project-status").value.trim();
            const tagsInput = document.querySelector(".input-project-tags").value.trim();
            const pdfLink = document.querySelector(".input-project-pdf-link").value.trim();
            const projectLink = document.querySelector(".input-project-link").value.trim();

            const tagsArray = tagsInput.split(",").map(tag => tag.trim()).filter(Boolean);

            try {
                if (typeof showLoader === "function") showLoader();

                // 1. Upload new images
                const uploadedNewImages = [];
                for (const file of newFiles) {
                    const compressed = await compressImage(file);
                    const result = await uploadToCloudinary(compressed);
                    if (result) {
                        uploadedNewImages.push({
                            imageUrl: result.imageUrl,
                            publicId: result.publicId
                        });
                    }
                }

                // 2. Merge images
                const finalImages = [...existingImages, ...uploadedNewImages];

                // 3. Update Firestore doc (no new doc created!)
                await db.collection("projects").doc(projectId).update({
                    title,
                    description,
                    status,
                    date,
                    tags: tagsArray,
                    images: finalImages,
                    pdfLink,
                    projectLink,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log("✅ Project updated:", projectId);

                // reload list + close form
                await loadProjectsFromFirestore();
                form.style.display = "none";

            } catch (err) {
                console.error("❌ Error saving project:", err);
                alert("Error: " + err.message);
            } finally {
                if (typeof hideLoader === "function") hideLoader();
            }
        };


        // 7. Bind file input for new images
        const fileInput = document.getElementById("file");
        fileInput.onchange = function (e) {
            const files = Array.from(e.target.files);
            showNewImages(files);
        };

    } catch (err) {
        console.error("❌ Error opening edit form:", err);
    }
}
