function openPostForm(page, mode = "edit", data = {}, uid) {
    const container = getPageContainer();
    if (!container) return;

    // Load template
    container.innerHTML = getFormTemplate(page);
    container.style.display = "grid";

    // Adjust title + button
    if (mode === "edit") {
        container.querySelector(".card-title").textContent = `Edit ${singular}`;
        container.querySelector(`#${page}-post-btn`).textContent = "Save";
    }

    // Prefill normal inputs
    if (data.title) container.querySelector(`.input-${page}-title`).value = data.title;
    if (data.description) container.querySelector(`.input-${page}-description`).value = data.description;
    if (data.date) container.querySelector(`.input-${page}-date`).value = data.date;
    if (data.status) container.querySelector(`.input-${page}-status`).value = data.status;
    if (data.tags) container.querySelector(`.input-${page}-tags`).value = data.tags;
    if (data.pdfLink) container.querySelector(`.input-${page}-pdf-link`).value = data.pdfLink;
    if (data.link) container.querySelector(`.input-${page}-link`).value = data.link;

    // Prefill images (use same preview system)
    if (mode === "edit" && data.images) {
        const previewContainer = container.querySelector(`#${page}-preview`);
        previewContainer.innerHTML = "";

        data.images.forEach((img, index) => {
            let url = "";
            if (typeof img === "string") url = img;
            else if (img.url) url = img.url;
            else if (img.secure_url) url = img.secure_url;

            console.log("➡️ using url:", url);

            if (url) {
                previewContainer.insertAdjacentHTML("beforeend", `
              <div class="file-preview">
                <div class="image-preview">
                  <img src="${url}" alt="Preview ${index + 1}" style="max-width:100px;max-height:100px;">
                </div>
                <button class="remove-preview">&times;</button>
              </div>
            `);
            }
        });
    }



    // Cancel button
    container.querySelector("#cancel-btn").addEventListener("click", () => {
        container.style.display = "none";
        container.innerHTML = "";
    });

    // Submit handler
    initSubmitHandlers(page, mode, uid);
}
