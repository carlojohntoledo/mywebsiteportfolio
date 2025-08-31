// ======================
// SUBMIT POST HANDLER (FIXED)
// ======================
function initSubmitHandlers(page, mode = "create", postId = null, postData = null, currentImages = []) {
    const postBtnId = `${page}-post-btn`;
    console.log(`🔔 Initializing submit handler for ${page}, mode: ${mode}, postId: ${postId}`);

    // Remove previous listener to avoid duplicates
    document.removeEventListener("click", handlePostClick);

    async function handlePostClick(e) {
        if (e.target && e.target.id === postBtnId) {
            e.preventDefault();
            console.log(`📌 ${page.toUpperCase()} ${mode.toUpperCase()} triggered`);

            // Fields
            const title = document.querySelector(`.input-${page}-title`);
            const description = document.querySelector(`.input-${page}-description`);
            const date = document.querySelector(`.input-${page}-date`);
            const status = document.querySelector(`.input-${page}-status`);
            const tagsInput = document.querySelector(`.input-${page}-tags`);
            const fileInput = document.getElementById("file");
            const errorElement = document.querySelector(".error");

            // Project-only
            const pdfLink = document.querySelector(`.input-${page}-pdf-link`);
            const projectLink = document.querySelector(`.input-${page}-link`);

            // ❌ Required validation
            if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
                if (errorElement) errorElement.style.display = "flex";
                return;
            }
            if (errorElement) errorElement.style.display = "none";

            // Tags
            const tagsArray = tagsInput.value.split(",").map(t => t.trim()).filter(Boolean);

            // Links
            let pdfLinkValue = "";
            let projectLinkValue = "";
            if (page === "projects") {
                if (pdfLink?.value.trim()) {
                    pdfLinkValue = /^https?:\/\//i.test(pdfLink.value.trim())
                        ? pdfLink.value.trim()
                        : "https://" + pdfLink.value.trim();
                }
                if (projectLink?.value.trim()) {
                    projectLinkValue = /^https?:\/\//i.test(projectLink.value.trim())
                        ? projectLink.value.trim()
                        : "https://" + projectLink.value.trim();
                }
            }

            try {
                if (typeof showLoader === "function") showLoader();
                console.log("🔄 Processing save...");

                // ======================
                // 1. Upload new files
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

                // ======================
                // 2. Handle image diffs (edit only)
                // ======================
                let finalImages = [...currentImages, ...uploadedImages];

                if (mode === "edit" && postId) {
                    const docSnap = await db.collection(page).doc(postId).get();
                    let oldImages = docSnap.exists ? docSnap.data().images || [] : [];

                    // Find removed images (were in oldImages but not in finalImages)
                    const removedImages = oldImages.filter(
                        old => !finalImages.some(newImg => newImg.publicId === old.publicId)
                    );

                    console.log("🗑️ Removing from Cloudinary:", removedImages);
                    for (const img of removedImages) {
                        if (img.publicId) await deleteFromCloudinary(img.publicId);
                    }
                }

                // ======================
                // 3. Build Firestore data
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

                if (mode === "create") {
                    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                } else {
                    data.createdAt = postData?.createdAt || firebase.firestore.FieldValue.serverTimestamp();
                }

                if (page === "projects") {
                    data.pdfLink = pdfLinkValue;
                    data.projectLink = projectLinkValue;
                }

                // ======================
                // 4. Save to Firestore
                // ======================
                if (mode === "edit" && postId) {
                    await db.collection(page).doc(postId).update(data);
                    console.log(`✅ Edited ${page} → ${postId}`);
                } else {
                    const docRef = await db.collection(page).add(data);
                    console.log(`✅ Created ${page} → ${docRef.id}`);
                }

                // ======================
                // 5. Refresh + notify
                // ======================
                await loadPostsFromFirestore(page);
                alert("✅ Post saved successfully!");

                // Reset form only on create
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
                console.error(`❌ Error saving ${page}:`, err);
                alert("Error: " + err.message);
            } finally {
                if (typeof hideLoader === "function") hideLoader();
                console.log("✅ Save complete.");
            }
        }
    }

    document.addEventListener("click", handlePostClick);
}
