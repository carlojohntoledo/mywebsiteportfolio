// ======================
// SUBMIT POST HANDLER
// ======================
function initSubmitHandlers(page, mode = "create", postId = null, postData = null, currentImages = []) {
    const postBtnId = `${page}-post-btn`;
    const postBtn = document.getElementById(postBtnId);
    if (!postBtn) return;

    // ✅ Remove existing listeners to avoid duplicates
    const newBtn = postBtn.cloneNode(true);
    postBtn.parentNode.replaceChild(newBtn, postBtn);

    console.log(`🔔 Initializing submit handler for ${page} with button ID: ${postBtnId}, mode: ${mode}`);

    newBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        // ======================
        // Grab form fields
        // ======================
        const title = document.querySelector(`.input-${page}-title`);
        const description = document.querySelector(`.input-${page}-description`);
        const date = document.querySelector(`.input-${page}-date`);
        const status = document.querySelector(`.input-${page}-status`);
        const tagsInput = document.querySelector(`.input-${page}-tags`);
        const fileInput = document.getElementById("file");
        const errorElement = document.querySelector(".error");
        const postCard = document.querySelector(".create-card-container-parent");

        const pdfLink = document.querySelector(`.input-${page}-pdf-link`);
        const projectLink = document.querySelector(`.input-${page}-link`);

        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            if (errorElement) errorElement.style.display = "flex";
            return;
        }
        if (errorElement) errorElement.style.display = "none";
        if (postCard) postCard.style.display = "none";

        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        let pdfLinkValue = "";
        let projectLinkValue = "";
        if (page === "projects") {
            if (pdfLink?.value.trim()) {
                pdfLinkValue = /^https?:\/\//i.test(pdfLink.value.trim()) ? pdfLink.value.trim() : "https://" + pdfLink.value.trim();
            }
            if (projectLink?.value.trim()) {
                projectLinkValue = /^https?:\/\//i.test(projectLink.value.trim()) ? projectLink.value.trim() : "https://" + projectLink.value.trim();
            }
        }

        console.log("📤 Submitting", page, "mode:", mode);

        try {
            if (typeof showLoader === "function") showLoader();

            // ======================
            // Upload NEW Images
            // ======================
            const files = Array.from(fileInput?.files || []);
            const uploadedImages = [];
            for (const file of files) {
                const compressedFile = await compressImage(file);
                const result = await uploadToCloudinary(compressedFile, page);
                if (result) {
                    uploadedImages.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // ✅ Merge: keep old + new
            let finalImages = [...currentImages, ...uploadedImages];

            // ======================
            // Firestore Data
            // ======================
            const data = {
                title: title.value.trim(),
                description: description.value.trim(),
                status: status.value.trim(),
                date: date.value.trim(),
                tags: tagsArray,
                images: finalImages,
                pinned: postData?.pinned || false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (page === "projects") {
                data.pdfLink = pdfLinkValue;
                data.projectLink = projectLinkValue;
            }

            // ======================
            // Save (Create or Edit)
            // ======================
            if (mode === "edit" && postId) {
                await db.collection(page).doc(postId).update(data);
                console.log(`✅ Updated ${page} → ${postId}`);
            } else {
                await db.collection(page).add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Created new ${page}`);
            }

            await loadPostsFromFirestore(page);
            alert("✅ Post saved successfully!");

            // Reset if creating
            if (mode === "create") {
                title.value = "";
                description.value = "";
                date.value = "";
                status.value = "";
                tagsInput.value = "";
                if (fileInput) fileInput.value = "";
                if (pdfLink) pdfLink.value = "";
                if (projectLink) projectLink.value = "";
                const previewContainer = document.querySelector(".file-preview-container");
                if (previewContainer) previewContainer.innerHTML = "";
            }
        } catch (err) {
            console.error(`❌ Error submitting ${page}:`, err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
            console.log("✅ Save process complete.");
        }
    });
}
