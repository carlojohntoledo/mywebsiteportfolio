// ======================
// SUBMIT POST HANDLER
// ======================
function initSubmitHandlers(page) {
    // Example: page = "projects" | "activities" | "services"
    const postBtnId = `${page}-post-btn`;
    const postBtn = document.getElementById(postBtnId);
    if (!postBtn) return; // button not found

    // ✅ Remove old listeners by replacing with a clone
    const newBtn = postBtn.cloneNode(true);
    postBtn.parentNode.replaceChild(newBtn, postBtn);

    // ✅ Attach click listener
    newBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log(`📌 ${page.toUpperCase()} post button clicked`);

        const title = document.querySelector(`.input-${page}-title`);
        const description = document.querySelector(`.input-${page}-description`);
        const date = document.querySelector(`.input-${page}-date`);
        const status = document.querySelector(`.input-${page}-status`);
        const tagsInput = document.querySelector(`.input-${page}-tags`);
        const pdfLink = document.querySelector(`.input-${page}-pdf-link`);
        const projectLink = document.querySelector(`.input-${page}-link`);
        const fileInput = document.getElementById("file");
        const errorElement = document.querySelector(".error");
        const postCard = document.querySelector(".create-card-container-parent");

        // ❌ Required validation
        if (!title.value.trim() || !description.value.trim() || !date.value.trim() || !status.value.trim()) {
            errorElement.style.display = "flex";
            return;
        }
        errorElement.style.display = "none";
        if (postCard) postCard.style.display = "none";

        const parentContainer = document.querySelector(`.${page}-container-parent`);
        if (parentContainer) parentContainer.style.display = "grid";

        // ✅ Tags to array
        const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(Boolean);

        // ✅ Ensure links start with https://
        let pdfLinkValue = pdfLink.value.trim();
        if (pdfLinkValue && !/^https?:\/\//i.test(pdfLinkValue)) {
            pdfLinkValue = "https://" + pdfLinkValue;
        }

        let projectLinkValue = projectLink.value.trim();
        if (projectLinkValue && !/^https?:\/\//i.test(projectLinkValue)) {
            projectLinkValue = "https://" + projectLinkValue;
        }

        console.log("📤 Submitting", page);

        try {
            if (typeof showLoader === "function") showLoader();

            // ======================
            // 1. Upload Images
            // ======================
            const files = Array.from(fileInput.files || []);
            const uploadedImages = [];

            for (const file of files) {
                const compressedFile = await compressImage(file);
                const result = await uploadToCloudinary(compressedFile);
                if (result) {
                    uploadedImages.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // ======================
            // 2. Save to Firestore
            // ======================
            const data = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: uploadedImages,
                pdfLink: pdfLinkValue,
                projectLink: projectLinkValue,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection(page).add(data);
            console.log(`✅ Saved ${page} ID:`, docRef.id);

            // ======================
            // 3. Reload + Clear Form
            // ======================
            await loadPostsFromFirestore(page); // ✅ unified loader

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
            console.error(`❌ Error submitting ${page}:`, err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });
}
