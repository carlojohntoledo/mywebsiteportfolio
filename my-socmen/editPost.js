// =============================
// EDIT POST JS
// =============================

// --- Safe fallbacks for loader (same as submitPost.js) ---
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};
window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

// =============================================================
// OPEN EDIT FORM
// Called when user clicks "Edit" on a project card
// =============================================================
async function openEditForm(projectId) {
    try {
        // Fetch current project data from Firestore
        const docRef = await db.collection("projects").doc(projectId).get();
        if (!docRef.exists) {
            console.error("❌ Project not found for editing:", projectId);
            return;
        }
        const projectData = docRef.data();

        // --- Show the edit form (reuse the create form container) ---
        const postCard = document.querySelector(".create-card-container-parent");
        postCard.style.display = "block";

        // --- Change labels/buttons ---
        document.querySelector(".card-title").textContent = "Edit Post";
        const saveBtn = document.getElementById("post-btn");
        saveBtn.textContent = "Save Changes";
        saveBtn.setAttribute("data-edit-id", projectId); // mark which doc we are editing

        // --- Pre-fill text inputs ---
        document.querySelector(".input-project-title").value = projectData.title || "";
        document.querySelector(".input-project-description").value = projectData.description || "";
        document.querySelector(".input-project-date").value = projectData.date || "";
        document.querySelector(".input-project-status").value = projectData.status || "";
        document.querySelector(".input-project-tags").value = (projectData.tags || []).join(", ");
        document.querySelector(".input-project-pdf-link").value = projectData.pdfLink || "";
        document.querySelector(".input-project-link").value = projectData.projectLink || "";

        // --- Load existing images into preview area ---
        const previewContainer = document.querySelector(".file-preview-container");
        previewContainer.innerHTML = ""; // clear old previews

        (projectData.images || []).forEach((imgObj) => {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");

            const img = document.createElement("img");
            img.src = imgObj.imageUrl;
            img.alt = "Existing Image";

            // ❌ Remove button for existing images
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";

            removeBtn.addEventListener("click", async function () {
                try {
                    if (typeof showLoader === "function") showLoader();

                    // 1️⃣ Remove preview from DOM
                    filePreview.remove();

                    // 2️⃣ If it's an existing Cloudinary image, delete it
                    if (imgData.publicId) {
                        await deleteFromCloudinary(imgData.publicId);
                        console.log("🗑️ Deleted from Cloudinary:", imgData.publicId);

                        // Remove from local array so it doesn’t get saved again
                        projectData.images = projectData.images.filter(
                            (img) => img.publicId !== imgData.publicId
                        );

                        // Update Firestore with new images array
                        await db.collection("projects").doc(projectId).update({
                            images: projectData.images
                        });
                        console.log("✅ Firestore updated without deleted image");
                    }
                } catch (err) {
                    console.error("❌ Error deleting image:", err);
                    alert("Failed to delete image. Please try again.");
                } finally {
                    if (typeof hideLoader === "function") hideLoader();
                }
            });

            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            previewContainer.appendChild(filePreview);
        });

        // --- Attach save handler (only once) ---
        attachSaveHandler(saveBtn, projectId, projectData);

    } catch (err) {
        console.error("Error opening edit form:", err);
    }
}

// =============================================================
// ATTACH SAVE HANDLER
// Handles when user clicks "Save Changes"
// =============================================================
function attachSaveHandler(saveBtn, projectId, projectData) {
    // Prevent attaching multiple listeners
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newSaveBtn.addEventListener("click", async function () {
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

        // ✅ Tags: string → array
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        console.log("✏️ Saving edited post...");

        try {
            if (typeof showLoader === "function") showLoader();

            // =============================================================
            // 1. Upload NEW images (existing ones already preserved)
            // =============================================================
            const files = Array.from(fileInput.files);
            for (const file of files) {
                const compressedFile = await compressImage(file);
                const result = await uploadToCloudinary(compressedFile);

                if (result) {
                    projectData.images.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // =============================================================
            // 2. Update project data in Firestore
            // =============================================================
            const updatedData = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: projectData.images, // merged (kept + new - deleted)
                pdfLink: pdfLink.value,
                projectLink: projectLink.value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection("projects").doc(projectId).update(updatedData);
            console.log("✅ Project updated:", projectId);

            // =============================================================
            // 3. Reload + Clear form
            // =============================================================
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
            console.error("❌ Error saving project:", err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });
}
