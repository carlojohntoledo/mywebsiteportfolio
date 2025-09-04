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
    // Prefill normal inputs (skip title for activities)
    if (page !== "activities" && data.title) {
      const titleInput = container.querySelector(`.input-${page}-title`);
      const dateInput = container.querySelector(`.input-${page}-date`);
      const statusInput = container.querySelector(`.input-${page}-status`);
      const pdfLinkInput = container.querySelector(`.input-${page}-pdf-link`);
      const linkInput = container.querySelector(`.input-${page}-link`);
      
      // Set values if inputs exist
      if (pdfLinkInput) pdfLinkInput.value = data.pdfLink || "";  
      if (linkInput) linkInput.value = data.link || "";
      if (titleInput) titleInput.value = data.title || "";
      if (dateInput) dateInput.value = data.date || "";
      if (statusInput) statusInput.value = data.status || "draft"; // Default to "draft" if not set
    }


    if (data.description) container.querySelector(`.input-${page}-description`).value = data.description || "";
    if (data.tags) container.querySelector(`.input-${page}-tags`).value = data.tags || "";
    if (data.link) container.querySelector(`.input-${page}-link`).value = data.link || "";

    // ==============================
    // Prefill images for edit mode
    // ==============================
    if (mode === "edit" && data.images) {
        const previewContainer = container.querySelector(`#${page}-preview`);
        previewContainer.innerHTML = "";

        data.images.forEach((img, index) => {
            let url = "";
            if (typeof img === "string") url = img;
            else if (img.imageUrl) url = img.imageUrl;
            else if (img.url) url = img.url;
            else if (img.secure_url) url = img.secure_url;

            console.log("➡️ using url:", url);

            if (url) {
                previewContainer.insertAdjacentHTML("beforeend", `
                  <div class="file-preview">
                    <div class="image-preview">
                      <img src="${url}" alt="Preview ${index + 1}">
                    </div>
                    <button class="remove-preview">&times;</button>
                  </div>
                `);
            }
        });

        // Bind remove buttons
        previewContainer.querySelectorAll(".remove-preview").forEach(btn => {
            btn.addEventListener("click", e => {
                e.target.closest(".file-preview").remove();
            });
        });
    }

    // Cancel button
    container.querySelector("#cancel-btn").addEventListener("click", () => {
        container.style.display = "none";
        container.innerHTML = "";
    });

    // ✅ Attach preview handlers (my code)
    bindPreviewHandlers(page);

    // ==============================
    // Pass correct args to handler
    // - uid → Firestore doc id
    // - data → full post data
    // - data.images → preserve current images
    // ==============================
    initSubmitHandlers(page, mode, uid, data, data.images || []);
}

// ==========================
// Bind preview handlers (no duplication)
// ==========================
function bindPreviewHandlers(page) {
  const container = getPageContainer();
  if (!container) return;

  const previewContainer = container.querySelector(`#${page}-preview`);
  const fileInput = container.querySelector("#file");

  if (!previewContainer || !fileInput) return;

  // --- Remove only logic (delegated, attaches ONCE) ---
  previewContainer.onclick = function (e) {
    if (e.target.classList.contains("remove-preview")) {
      e.preventDefault();
      const wrapper = e.target.closest(".file-preview");
      if (wrapper) wrapper.remove();
    }
  };

  // --- Reset file input change handler before adding new one ---
  fileInput.onchange = function () {
    Array.from(fileInput.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewContainer.insertAdjacentHTML("beforeend", `
          <div class="file-preview">
            <div class="image-preview">
              <img src="${ev.target.result}" alt="Preview">
            </div>
            <button class="remove-preview">&times;</button>
          </div>
        `);
      };
      reader.readAsDataURL(file);
    });
  };
}
