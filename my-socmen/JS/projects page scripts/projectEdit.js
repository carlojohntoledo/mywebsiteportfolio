// ===================================================
// Edit Post Form
// ===================================================

function openPostForm(page, mode = "edit", data = {}, uid) {
    const container = getPageContainer();

    if (!container) {
        console.warn("⚠️ No container found for page", page);
        return;
    }

    // Inject the form from the existing create template
    container.innerHTML = getFormTemplate(page);
    container.style.display = "grid";

    // --- Adjust header + button text for edit mode ---
    if (mode === "edit") {
        const headerTitle = container.querySelector(".card-title");
        if (headerTitle) headerTitle.textContent = `Edit ${singular}`;

        const saveBtn = container.querySelector(`#${page}-post-btn, #activities-post-btn, #services-post-btn, #projects-post-btn`);
        if (saveBtn) saveBtn.textContent = "Save";
    }

    // --- Prefill fields ---
    if (data) {
        if (data.title) container.querySelector(`.input-${page}-title`).value = data.title;
        if (data.description) container.querySelector(`.input-${page}-description`).value = data.description;
        if (data.date) container.querySelector(`.input-${page}-date`).value = data.date;
        if (data.status) container.querySelector(`.input-${page}-status`).value = data.status;
        if (data.tags) container.querySelector(`.input-${page}-tags`).value = data.tags;
        if (data.pdfLink) container.querySelector(`.input-${page}-pdf-link`).value = data.pdfLink;
        if (data.link) container.querySelector(`.input-${page}-link`).value = data.link;

        // --- Prefill images ---
        if (data.images && Array.isArray(data.images)) {
            const previewContainer = container.querySelector(`#${page}-preview`);
            if (previewContainer) {
                previewContainer.innerHTML = "";
                data.images.forEach((imgUrl, index) => {
                    const filePreview = document.createElement("div");
                    filePreview.classList.add("file-preview");

                    const imgWrapper = document.createElement("div");
                    imgWrapper.classList.add("image-preview");

                    const img = document.createElement("img");
                    img.src = imgUrl;
                    img.alt = `Preview ${index + 1}`;

                    // ❌ Remove button
                    const removeBtn = document.createElement("button");
                    removeBtn.classList.add("remove-preview");
                    removeBtn.innerHTML = "&times;";

                    removeBtn.addEventListener("click", function () {
                        filePreview.remove();
                    });

                    imgWrapper.appendChild(img);
                    filePreview.appendChild(imgWrapper);
                    filePreview.appendChild(removeBtn);
                    previewContainer.appendChild(filePreview);
                });
            }
        }
    }

    // --- Rebind cancel button ---
    const cancelBtn = container.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            container.style.display = "none";
            container.innerHTML = "";
        });
    }

    // --- Error close button ---
    const errorClose = container.querySelector('.error__close');
    if (errorClose) {
        errorClose.addEventListener("click", function () {
            const errorElement = document.querySelector(".error");
            if (errorElement) errorElement.style.display = "none";
        });
    }

    // --- Submit handler (Save changes) ---
    initSubmitHandlers(page, mode, uid);
}
