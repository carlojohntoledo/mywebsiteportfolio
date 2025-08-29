// ======================
// SUBMIT POST HANDLER
// ======================
function initSubmitHandlers(page) {
    // Example: page = "projects" | "activities" | "services"
    const postBtnId = `${page}-post-btn`;
    console.log(`🔔 Initializing submit handler for ${page} with button ID: ${postBtnId}`);

    // Remove any previous listener to avoid duplicates
    document.removeEventListener("click", handlePostClick);

    // ✅ define handler inside so it can close over `page`
    async function handlePostClick(e) {
        if (e.target && e.target.id === postBtnId) {
            e.preventDefault();
            console.log(`📌 ${page.toUpperCase()} post button clicked`);

            // Common fields (all pages)
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

            console.log("📤 Submitting", page);

            try {
                if (typeof showLoader === "function") showLoader();

                // ======================
                // 1. Upload Images
                // ======================
                const files = Array.from(fileInput?.files || []);
                const uploadedImages = [];

                for (const file of files) {
                    const compressedFile = await compressImage(file);
                    const result = await uploadToCloudinary(compressedFile, page); // pass page
                    if (result) {
                        uploadedImages.push({
                            imageUrl: result.imageUrl,
                            publicId: result.publicId
                        });
                    }
                }

                // ======================
                // 2. Prepare Firestore Data
                // ======================
                const data = {
                    title: title.value.trim(),
                    description: description.value.trim(),
                    status: status.value.trim(),
                    date: date.value.trim(),
                    tags: tagsArray,
                    images: uploadedImages,
                    pinned: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Add project-only fields
                if (page === "projects") {
                    data.pdfLink = pdfLinkValue;
                    data.projectLink = projectLinkValue;
                }

                // ======================
                // 3. Save to Firestore
                // ======================
                const docRef = await db.collection(page).add(data);
                console.log(`✅ Saved ${page} ID:`, docRef.id);

                // ======================
                // 4. Reload + Clear Form
                // ======================
                await loadPostsFromFirestore(page); // ✅ unified loader

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
