
// ===================================================
// Create post toggle
// ===================================================

// Show "Create Service" form

function showCreateForm() {
  const page = document.body.dataset.page; // "projects" | "services" | "activities"
  const container = getPageContainer();    // our earlier helper

  if (!container) return;

  container.innerHTML = getFormTemplate(page); // inject form HTML
  container.style.display = "grid";

  // rebind cancel button after injection
  container.querySelector('#cancel-btn').addEventListener('click', () => {
    container.style.display = "none";
    container.innerHTML = ""; // optional clear
  });

  container.querySelector('.error__close').addEventListener("click", function () {
    const errorElement = document.querySelector(".error");
    if (errorElement) errorElement.style.display = "none";
});
}

// Example: open form when clicking "Create New"
document.getElementById("create-new-post").addEventListener("click", showCreateForm);



function getFormTemplate(page) { 
  const type = page.charAt(0).toUpperCase() + page.slice(1); // Projects → "Projects"
  switch (page) {
    case "activities":
        return `
            <div class="create-post-container">
            <div class="create-${page}-form-container">
                <div class="create-${page}-header">
                <h1 class="card-title">Create ${type.slice(0, -1)}</h1>
                <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                <span class="create-${page}-button-container green-btn" id="post-btn">Post</span>
                </div>

                <div class="error" id="form-warning"> ... </div>

                <div class="create-${page}-form-viewport scroll-fade">
                <form id="create-${page}-form">

                    <!-- TITLE -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-title" type="text" required>
                    <label>${type.slice(0, -1)} Title*</label>
                    </div>

                    <!-- DESCRIPTION -->
                    <div class="create-${page}-containers ${page}-label">
                    <textarea class="input-${page}-description" required></textarea>
                    <label>${type.slice(0, -1)} Description*</label>
                    </div>

                    <!-- DATE + STATUS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-date" type="date" required>
                        <label>${type.slice(0, -1)} Date*</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <select class="input-${page}-status" required>
                        <option value="Published">Published</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Planned">Planned</option>
                        </select>
                        <label>${type.slice(0, -1)} Status*</label>
                    </div>
                    </div>

                    <!-- TAGS -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-tags" placeholder="html, css, js..." type="text">
                    <label>${type.slice(0, -1)} Tags</label>
                    </div>

                    <!-- LINKS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-pdf-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} PDF Link</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} Link</label>
                    </div>
                    </div>

                    <!-- IMAGE UPLOAD -->
                    <div class="create-${page}-image-container">
                    <h1>Add Photos</h1>
                    <div class="file-upload-form">
                        <label for="file" class="file-upload-label">
                        <div class="file-upload-design">
                            <p>Drag and Drop</p>
                            <p>or</p>
                            <span class="browse-button">Browse file</span>
                            <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event)" />
                        </div>
                        </label>
                    </div>
                    </div>

                    <!-- PREVIEW -->
                    <div id="file-preview-container" class="file-preview-container"></div>
                </form>
                </div>
            </div>
            </div>
        `;

        case "services":
        return `
            <div class="create-post-container">
            <div class="create-${page}-form-container">
                <div class="create-${page}-header">
                <h1 class="card-title">Create ${type.slice(0, -1)}</h1>
                <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                <span class="create-${page}-button-container green-btn" id="post-btn">Post</span>
                </div>

                <div class="error" id="form-warning"> ... </div>

                <div class="create-${page}-form-viewport scroll-fade">
                <form id="create-${page}-form">

                    <!-- TITLE -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-title" type="text" required>
                    <label>${type.slice(0, -1)} Title*</label>
                    </div>

                    <!-- DESCRIPTION -->
                    <div class="create-${page}-containers ${page}-label">
                    <textarea class="input-${page}-description" required></textarea>
                    <label>${type.slice(0, -1)} Description*</label>
                    </div>

                    <!-- DATE + STATUS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-date" type="date" required>
                        <label>${type.slice(0, -1)} Date*</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <select class="input-${page}-status" required>
                        <option value="Published">Published</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Planned">Planned</option>
                        </select>
                        <label>${type.slice(0, -1)} Status*</label>
                    </div>
                    </div>

                    <!-- TAGS -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-tags" placeholder="html, css, js..." type="text">
                    <label>${type.slice(0, -1)} Tags</label>
                    </div>

                    <!-- LINKS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-pdf-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} PDF Link</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} Link</label>
                    </div>
                    </div>

                    <!-- IMAGE UPLOAD -->
                    <div class="create-${page}-image-container">
                    <h1>Add Photos</h1>
                    <div class="file-upload-form">
                        <label for="file" class="file-upload-label">
                        <div class="file-upload-design">
                            <p>Drag and Drop</p>
                            <p>or</p>
                            <span class="browse-button">Browse file</span>
                            <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event)" />
                        </div>
                        </label>
                    </div>
                    </div>

                    <!-- PREVIEW -->
                    <div id="file-preview-container" class="file-preview-container"></div>
                </form>
                </div>
            </div>
            </div>
        `;

        case "projects":
        return `
            <div class="create-post-container">
            <div class="create-${page}-form-container">
                <div class="create-${page}-header">
                <h1 class="card-title">Create ${type.slice(0, -1)}</h1>
                <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                <span class="create-${page}-button-container green-btn" id="post-btn">Post</span>
                </div>

                <div class="error" id="form-warning"> ... </div>

                <div class="create-${page}-form-viewport scroll-fade">
                <form id="create-${page}-form">

                    <!-- TITLE -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-title" type="text" required>
                    <label>${type.slice(0, -1)} Title*</label>
                    </div>

                    <!-- DESCRIPTION -->
                    <div class="create-${page}-containers ${page}-label">
                    <textarea class="input-${page}-description" required></textarea>
                    <label>${type.slice(0, -1)} Description*</label>
                    </div>

                    <!-- DATE + STATUS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-date" type="date" required>
                        <label>${type.slice(0, -1)} Date*</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <select class="input-${page}-status" required>
                        <option value="Published">Published</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Planned">Planned</option>
                        </select>
                        <label>${type.slice(0, -1)} Status*</label>
                    </div>
                    </div>

                    <!-- TAGS -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-tags" placeholder="html, css, js..." type="text">
                    <label>${type.slice(0, -1)} Tags</label>
                    </div>

                    <!-- LINKS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-pdf-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} PDF Link</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-link" type="url" placeholder="https://...">
                        <label>${type.slice(0, -1)} Link</label>
                    </div>
                    </div>

                    <!-- IMAGE UPLOAD -->
                    <div class="create-${page}-image-container">
                    <h1>Add Photos</h1>
                    <div class="file-upload-form">
                        <label for="file" class="file-upload-label">
                        <div class="file-upload-design">
                            <p>Drag and Drop</p>
                            <p>or</p>
                            <span class="browse-button">Browse file</span>
                            <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event)" />
                        </div>
                        </label>
                    </div>
                    </div>

                    <!-- PREVIEW -->
                    <div id="file-preview-container" class="file-preview-container"></div>
                </form>
                </div>
            </div>
            </div>
        `;

        default:
        return `<p>Unknown page type: ${page}</p>`; 
    }
}
