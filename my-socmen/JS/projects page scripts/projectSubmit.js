// ======================
// SUBMIT POST HANDLER
// ======================
function initSubmitHandlers(page, mode = "create", postId = null, postData = null, currentImages = []) {
    // Example: page = "projects" | "activities" | "services"
    const postBtnId = `${page}-post-btn`;
    console.log(`🔔 Initializing submit handler for ${page} with button ID: ${postBtnId}, mode: ${mode}`);

    // Remove any previous listener to avoid duplicates
    document.removeEventListener("click", handlePostClick);

    // ✅ define handler inside so it can close over `page`, `mode`, `postId`
    async function handlePostClick(e) {
        if (e.target && e.target.id === postBtnId) {
            e.preventDefault();

            // Common fields
            const title = document.querySelector(`.input-${page}-title`);
            const description = document.querySelector(`.input-${page}-description`);
            const date = document.querySelector(`.input-${page}-date`);
            const status = document.querySelector(`.input-${page}-status`);
            const tagsInput = document.querySelector(`.input-${page}-tags`);
            const fileInput = document.getElementById("file");
            const errorElement = document.querySelector(".error");
            const postCard = document.querySelector(".create-card-container-parent");

            // Optional (only exists on "projects")
            const pdfLink = document.querySelector(`.input-${page}-pdf-link`);
            const projectLink = document.querySelector(`.input-${page}-link`);

            // ❌ Required validation
            if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
                if (errorElement) errorElement.style.display = "flex";
                return;
            }
            if (errorElement) errorElement.style.display = "none";
            if (postCard) postCard.style.display = "none";

            const parentContainer = document.querySelector(`.${page}-container-parent`);
            if (parentContainer) parentContainer.style.display = "grid";

            // ✅ Tags to array
            const tagsArray = tagsInput.value
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

            // ✅ Page-specific links (only for projects)
            let pdfLinkValue = "";
            let projectLinkValue = "";
            if (page === "projects") {
                if (pdfLink && pdfLink.value.trim()) {
                    pdfLinkValue = pdfLink.value.trim();
                    if (!/^https?:\/\//i.test(pdfLinkValue)) {
                        pdfLinkValue = "https://" + pdfLinkValue;
                    }
                }
                if (projectLink && projectLink.value.trim()) {
                    projectLinkValue = projectLink.value.trim();
                    if (!/^https?:\/\//i.test(projectLinkValue)) {
                        projectLinkValue = "https://" + projectLinkValue;
                    }
                }
            }

            console.log("📤 Submitting", page, "mode:", mode);

            try {
                if (typeof showLoader === "function") showLoader();

                // ======================
                // 1. Upload NEW Images
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

                // ✅ Merge images (keep existing + add new ones)
                const finalImages = [...currentImages, ...uploadedImages];

                // ======================
                // 2. Prepare Firestore Data
                // ======================
                const data = {
                    title: title.value.trim(),
                    description: description.value.trim(),
                    status: status.value.trim(),
                    date: date.value.trim(),
                    tags: tagsArray,
                    images: finalImages,
                    pinned: postData?.pinned || false,
                    createdAt: mode === "create"
                        ? firebase.firestore.FieldValue.serverTimestamp()
                        : postData?.createdAt || firebase.firestore.FieldValue.serverTimestamp()
                };

                if (page === "projects") {
                    data.pdfLink = pdfLinkValue;
                    data.projectLink = projectLinkValue;
                }

                // ======================
                // 3. Save to Firestore (create or update)
                // ======================
                try {
                    if (typeof showLoader === "function") showLoader();
                    console.log("🔄 Starting save process...");

                    let oldImages = [];
                    if (mode === "edit" && postId) {
                        const docSnap = await db.collection(page).doc(postId).get();
                        if (docSnap.exists) {
                            oldImages = docSnap.data().images || [];
                        }
                    }

                    // --- Compare image sets ---
                    const newImageIds = uploadedImages.map(img => img.publicId);
                    const oldImageIds = oldImages.map(img => img.publicId);

                    const removedImages = oldImages.filter(img => !newImageIds.includes(img.publicId));
                    console.log("🗑️ Removed images:", removedImages);

                    // Delete removed images from Cloudinary
                    for (const img of removedImages) {
                        if (img.publicId) {
                            console.log(`🗑️ Deleting from Cloudinary → ${img.publicId}`);
                            await deleteFromCloudinary(img.publicId);
                        }
                    }

                    // --- Final data object ---
                    const finalData = {
                        title: title.value.trim(),
                        description: description.value.trim(),
                        status: status.value.trim(),
                        date: date.value.trim(),
                        tags: tagsArray,
                        images: [...currentImages, ...uploadedImages], // ✅ keep old + new
                        pinned: postData?.pinned || false,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    if (page === "projects") {
                        finalData.pdfLink = pdfLinkValue;
                        finalData.projectLink = projectLinkValue;
                    }

                    if (mode === "edit" && postId) {
                        await db.collection(page).doc(postId).update(finalData);
                        console.log(`✅ Updated ${page} → ${postId}`);
                    } else if (mode === "create") {
                        const docRef = await db.collection(page).add({
                            ...finalData,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        console.log(`✅ Created ${page} → ${docRef.id}`);
                    }

                    // Reload posts
                    await loadPostsFromFirestore(page);

                    alert("✅ Post saved successfully!");
                } catch (err) {
                    console.error(`❌ Error saving ${page}:`, err);
                    alert("Error: " + err.message);
                } finally {
                    if (typeof hideLoader === "function") hideLoader();
                    console.log("✅ Save process complete.");
                }

                // ======================
                // 4. Reload + Clear/Close
                // ======================
                await loadPostsFromFirestore(page);

                console.log("✅ Post saved successfully!");
                alert("Your changes have been saved successfully.");

                // Reset form if creating
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
            }
        }
    }

    // ✅ Attach global listener (delegation)
    document.addEventListener("click", handlePostClick);
}
