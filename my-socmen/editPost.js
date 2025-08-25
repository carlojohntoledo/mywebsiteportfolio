// ==========================
// editPost.js (EDIT MODE)
// ==========================

// Open edit form with project data prefilled
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
        const postBtn = document.getElementById("post-btn");
        titleElement.textContent = "Edit Post";
        postBtn.textContent = "Save";

        // 4. Load existing images into global state
        existingImages = project.images || [];
        newFiles = [];

        // 5. Render preview with old images
        renderPreview(document.querySelector(".file-preview-container"));

        // 6. Change button behavior to SAVE instead of CREATE
        postBtn.onclick = async function () {
            const title = document.querySelector(".input-project-title");
            const description = document.querySelector(".input-project-description");
            const date = document.querySelector(".input-project-date");
            const status = document.querySelector(".input-project-status");
            const tagsInput = document.querySelector(".input-project-tags");
            const pdfLink = document.querySelector(".input-project-pdf-link");
            const projectLink = document.querySelector(".input-project-link");

            const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

            try {
                if (typeof showLoader === "function") showLoader();

                // 1. Upload NEW images
                const uploadedNewImages = [];
                for (const file of newFiles) {
                    const compressed = await compressImage(file);
                    const result = await uploadToCloudinary(compressed);
                    if (result) uploadedNewImages.push(result);
                }

                // 2. Merge remaining existing images + uploaded new ones
                const finalImages = [...existingImages, ...uploadedNewImages];

                // 3. Save updated data
                await db.collection("projects").doc(projectId).update({
                    title: title.value,
                    description: description.value,
                    status: status.value,
                    date: date.value,
                    tags: tagsArray,
                    images: finalImages,
                    pdfLink: pdfLink.value,
                    projectLink: projectLink.value,
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
    } catch (err) {
        console.error("❌ Error opening edit form:", err);
    }
}
