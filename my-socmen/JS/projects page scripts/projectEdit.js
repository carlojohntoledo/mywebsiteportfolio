// =============================================================
// ✅ Open Create/Edit Post Form (reuses the same HTML template)
// =============================================================
async function openPostForm(page = "projects", mode = "create", postData = {}, postId = null) {
    const container = getPageContainer();
    if (!container) return;

    showLoader();

    // Inject the existing template (same one used for create)
    container.innerHTML = getFormTemplate(page);
    container.style.display = "grid";

    const form = container.querySelector(`#create-${page}-form`);
    const titleEl = container.querySelector(".card-title"); 
    const postBtn = container.querySelector(`#${page}-post-btn`);
    const cancelBtn = container.querySelector("#cancel-btn");
    const fileInput = form.querySelector(`#${page}-file-input`);
    const previewContainer = form.querySelector(`#${page}-preview`);

    // Local state for images
    let currentImages = (postData.images || []).map(img => ({
        url: img.url || img,
        publicId: img.publicId || null,
        isNew: false
    }));

    // Cancel button
    cancelBtn.addEventListener("click", () => {
        container.style.display = "none";
        container.innerHTML = "";
    });

    // =========================================================
    // EDIT MODE → adjust UI and prefill
    // =========================================================
    if (mode === "edit" && postData) {
        const singular = page.slice(0, -1);
        if (titleEl) titleEl.textContent = `Edit ${singular.charAt(0).toUpperCase() + singular.slice(1)}`;
        postBtn.textContent = "Save";

        // Prefill fields
        form.querySelector(`.input-${page}-title`).value = postData.title || "";
        form.querySelector(`.input-${page}-description`).value = postData.description || "";

        if (page === "projects" || page === "activities") {
            form.querySelector(`.input-${page}-date`).value = postData.date || "";
        }
        if (page === "services") {
            form.querySelector(`.input-${page}-date`).value = postData.experience || "";
        }

        form.querySelector(`.input-${page}-status`).value = postData.status || "";
        form.querySelector(`.input-${page}-tags`).value = (postData.tags || []).join(", ");

        if (page === "projects") {
            form.querySelector(`.input-${page}-pdf-link`).value = postData.pdfLink || "";
            form.querySelector(`.input-${page}-link`).value = postData.projectLink || "";
        }

        // Show old images in preview
        previewContainer.innerHTML = "";
        currentImages.forEach((img, i) => addImagePreview(img, i));
    }

    hideLoader(); // Form + images are ready

    // =========================================================
    // HANDLE NEW FILE INPUT
    // =========================================================
    fileInput.addEventListener("change", async () => {
        const files = Array.from(fileInput.files || []);
        if (files.length === 0) return;

        showLoader();
        for (const file of files) {
            const compressedFile = await compressImage(file);
            const result = await uploadToCloudinary(compressedFile, page); // pass page if you want folder separation
            if (result) {
                const newImg = { url: result.imageUrl, publicId: result.publicId, isNew: true };
                currentImages.unshift(newImg); // new first
                addImagePreview(newImg, 0);
            }
        }
        hideLoader();
        fileInput.value = ""; // reset input
    });

    // =========================================================
    // ADD IMAGE PREVIEW HELPER
    // =========================================================
    function addImagePreview(imgObj, index) {
        const preview = document.createElement("div");
        preview.classList.add("file-preview");

        preview.innerHTML = `
            <div class="image-preview">
                <img src="${imgObj.url}" alt="Preview">
            </div>
            <button type="button" class="remove-preview">&times;</button>
        `;

        const removeBtn = preview.querySelector(".remove-preview");
        removeBtn.addEventListener("click", () => {
            preview.remove();
            currentImages = currentImages.filter(im => im.url !== imgObj.url);
        });

        // Insert at top (new images first)
        if (previewContainer.firstChild) {
            previewContainer.insertBefore(preview, previewContainer.firstChild);
        } else {
            previewContainer.appendChild(preview);
        }
    }

    // =========================================================
    // SUBMIT HANDLER
    // =========================================================
    postBtn.addEventListener("click", async () => {
        showLoader();

        const formData = {
            title: form.querySelector(`.input-${page}-title`).value,
            description: form.querySelector(`.input-${page}-description`).value,
            tags: form.querySelector(`.input-${page}-tags`).value.split(",").map(t => t.trim()).filter(Boolean),
            status: form.querySelector(`.input-${page}-status`).value,
            createdAt: mode === "create" ? firebase.firestore.FieldValue.serverTimestamp() : postData.createdAt,
            pinned: postData.pinned || false,
            images: currentImages.map(img => ({ url: img.url, publicId: img.publicId }))
        };

        if (page === "projects" || page === "activities") {
            formData.date = form.querySelector(`.input-${page}-date`).value;
        }
        if (page === "services") {
            formData.experience = form.querySelector(`.input-${page}-date`).value;
        }
        if (page === "projects") {
            formData.pdfLink = form.querySelector(`.input-${page}-pdf-link`).value;
            formData.projectLink = form.querySelector(`.input-${page}-link`).value;
        }

        try {
            if (mode === "create") {
                await db.collection(page).add(formData);
            } else {
                await db.collection(page).doc(postId).update(formData);
            }

            await loadPostsFromFirestore(page);
            container.style.display = "none";
            container.innerHTML = "";
        } catch (err) {
            console.error("❌ Error saving post:", err);
            alert("Error saving post.");
        } finally {
            hideLoader();
        }
    });
}
