// ======================
// SUBMIT POST HANDLER
// ======================
function initSubmitHandlers(page, mode = "create", postId = null, postData = null, currentImages = []) {
    const postBtnId = `${page}-post-btn`;
    let postBtn = document.getElementById(postBtnId);
    if (!postBtn) return;

    // 🔄 Remove old listeners by cloning button
    const newBtn = postBtn.cloneNode(true);
    postBtn.parentNode.replaceChild(newBtn, postBtn);
    postBtn = newBtn;

    console.log(`🔔 Initialized handler for ${page} → mode: ${mode}`);

    postBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        // ==================
        // 1. Collect fields
        // ==================
        const title = document.querySelector(`.input-${page}-title`).value.trim();
        const description = document.querySelector(`.input-${page}-description`).value.trim();
        const date = document.querySelector(`.input-${page}-date`).value.trim();
        const status = document.querySelector(`.input-${page}-status`).value.trim();
        const tags = document.querySelector(`.input-${page}-tags`).value.split(",").map(t => t.trim()).filter(Boolean);

        if (!title || !description || !date || !status) {
            alert("⚠️ Please fill in all required fields.");
            return;
        }

        showLoader(); // ✅ Always show loader before saving

        // ==================
        // 2. Handle images
        // ==================
        const fileInput = document.getElementById("file");
        const files = Array.from(fileInput?.files || []);
        const uploadedImages = [];

        for (const file of files) {
            const compressed = await compressImage(file);
            const result = await uploadToCloudinary(compressed, page);
            if (result) uploadedImages.push(result);
        }

        // ✅ Start with old images
        let finalImages = [...currentImages];

        // ✅ Add new uploads
        if (uploadedImages.length > 0) {
            finalImages = [...finalImages, ...uploadedImages];
        }

        // ✅ Check which previews user removed manually
        const previewContainer = document.getElementById(`${page}-preview`);
        if (previewContainer) {
            const stillVisibleUrls = Array.from(previewContainer.querySelectorAll("img"))
                .map(img => img.getAttribute("src"));

            finalImages = finalImages.filter(imgObj => {
                const url = imgObj.imageUrl || imgObj.url || imgObj.secure_url || imgObj;
                return stillVisibleUrls.includes(url);
            });
        }

        // ==================
        // 3. Prepare data
        // ==================
        const data = {
            title,
            description,
            date,
            status,
            tags,
            images: finalImages,
            pinned: postData?.pinned || false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // ==================
        // 4. Firestore save
        // ==================
        try {
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
        } catch (err) {
            console.error("❌ Error:", err);
            alert("Error: " + err.message);
        } finally {
            hideLoader(); // ✅ Always hide loader at the end
        }
    });
}
