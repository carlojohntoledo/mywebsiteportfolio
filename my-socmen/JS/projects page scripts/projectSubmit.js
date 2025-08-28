// ======================
// SUBMIT POST HANDLER
// ======================
async function SubmitPost() {
    const page = document.body.dataset.page; // "projects" | "services" | "activities"
    const singular = page.slice(0, -1); // "project" | "service" | "activity"

    let postBtn = document.querySelector(`#${page}-post-btn, #post-btn`);
    if (!postBtn) {
        console.warn("Post button not found");
        return; // fail-safe
    }

    // 🔹 Replace button with a fresh clone (removes any old listeners)
    postBtn.replaceWith(postBtn.cloneNode(true));
    postBtn = document.querySelector(`#${page}-post-btn, #post-btn`);

    postBtn.addEventListener("click", async function () {
        // Grab inputs dynamically per page
        const title = document.querySelector(`.input-${singular}-title`);
        const description = document.querySelector(`.input-${singular}-description`);
        const date = document.querySelector(`.input-${singular}-date`);
        const status = document.querySelector(`.input-${singular}-status`);
        const tagsInput = document.querySelector(`.input-${singular}-tags`);
        const pdfLink = document.querySelector(`.input-${singular}-pdf-link`);
        const linkInput = document.querySelector(`.input-${singular}-link`);
        const fileInput = document.getElementById("file");
        const errorElement = document.querySelector(".error");
        const postCard = getPageContainer();

        // ❌ Stop if required fields are empty
        if (!title?.value.trim() || !description?.value.trim() || !date?.value.trim() || !status?.value.trim()) {
            if (errorElement) errorElement.style.display = "flex";
            return;
        }
        if (errorElement) errorElement.style.display = "none";
        if (postCard) postCard.style.display = "none";

        const parentContainer = document.querySelector(`.${page}-container-parent`);
        if (parentContainer) parentContainer.style.display = "grid";

        // ✅ Tags: comma-separated string → array
        const tagsArray = tagsInput?.value
            .split(",")
            .map(tag => tag.replace(/\s+/g, ""))
            .filter(Boolean) || [];

        // Ensure links start with https://
        const normalizeLink = (val) => {
            val = val?.trim();
            return val && !/^https?:\/\//i.test(val) ? "https://" + val : val;
        };

        let pdfLinkValue = normalizeLink(pdfLink?.value);
        let projectLinkValue = normalizeLink(linkInput?.value);

        console.log(`📱 Submitting ${singular}...`);

        try {
            if (typeof showLoader === "function") showLoader();

            // ======================
            // 1. UPLOAD IMAGES
            // ======================
            const files = Array.from(fileInput?.files || []);
            const uploadedImages = [];

            for (const file of files) {
                const compressedFile = await compressImage(file); // must exist globally
                const result = await uploadToCloudinary(compressedFile, page); // 🔹 pass page here

                if (result) {
                    uploadedImages.push({
                        imageUrl: result.imageUrl,
                        publicId: result.publicId
                    });
                }
            }

            // ======================
            // 2. SAVE TO FIRESTORE
            // ======================
            const postData = {
                title: title.value,
                description: description.value,
                status: status.value,
                date: date.value,
                tags: tagsArray,
                images: uploadedImages,
                pdfLink: pdfLinkValue,
                link: projectLinkValue,
                pinned: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection(page).add(postData);
            console.log(`✅ Saved ${singular} ID:`, docRef.id);

            // ======================
            // 3. RELOAD + CLEAR FORM
            // ======================
            if (page === "projects") {
                await loadProjectsFromFirestore();
            } else if (page === "services") {
                await loadServicesFromFirestore();
            } else if (page === "activities") {
                await loadActivitiesFromFirestore();
            }

            // Clear form
            title.value = "";
            description.value = "";
            date.value = "";
            status.value = "";
            if (tagsInput) tagsInput.value = "";
            if (pdfLink) pdfLink.value = "";
            if (linkInput) linkInput.value = "";
            if (fileInput) fileInput.value = "";
            const previewContainer = document.querySelector(".file-preview-container");
            if (previewContainer) previewContainer.innerHTML = "";

        } catch (err) {
            console.error(`❌ Error submitting ${singular}:`, err);
            alert("Error: " + err.message);
        } finally {
            if (typeof hideLoader === "function") hideLoader();
        }
    });
}

// ======================
// GLOBAL LISTENERS
// ======================

// 🔹 Only bind once to prevent duplicates
if (!document.toggleDescBound) {
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("toggle-desc")) {
            const container = e.target.closest(".project-desc-container");
            const text = container.querySelector(".desc-text");
            text.classList.toggle("expanded");
            e.target.textContent = text.classList.contains("expanded") ? "See Less" : "See More";
        }
    });
    document.toggleDescBound = true;
}

document.addEventListener("DOMContentLoaded", () => {
    SubmitPost();
});
