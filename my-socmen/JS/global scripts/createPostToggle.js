
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

                <div class="error" id="form-warning"> 
                    <div class="form-warning-cont">
                    <div class="error__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"
                            height="24" fill="none">
                            <path fill="#393a37"
                                d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z">
                            </path>
                        </svg>
                    </div>
                    <div class="error__title">Please fill-in required (*) details.</div>
                    <div class="error__close" id="close-error"><svg xmlns="http://www.w3.org/2000/svg"
                            width="20" viewBox="0 0 20 20" height="20">
                            <path fill="#393a37"
                                d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z">
                            </path>
                        </svg>
                    </div>
                </div>

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
                            <svg viewBox="0 0 640 512" height="1em">
                                <path
                                    d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z">
                                </path>
                            </svg>
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

                <div class="error" id="form-warning"> 
                    <div class="form-warning-cont">
                    <div class="error__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"
                            height="24" fill="none">
                            <path fill="#393a37"
                                d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z">
                            </path>
                        </svg>
                    </div>
                    <div class="error__title">Please fill-in required (*) details.</div>
                    <div class="error__close" id="close-error"><svg xmlns="http://www.w3.org/2000/svg"
                            width="20" viewBox="0 0 20 20" height="20">
                            <path fill="#393a37"
                                d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z">
                            </path>
                        </svg>
                    </div>
                </div>

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
                            <svg viewBox="0 0 640 512" height="1em">
                                <path
                                    d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z">
                                </path>
                            </svg>
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

                <div class="error" id="form-warning"> 
                    <div class="form-warning-cont">
                    <div class="error__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"
                            height="24" fill="none">
                            <path fill="#393a37"
                                d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z">
                            </path>
                        </svg>
                    </div>
                    <div class="error__title">Please fill-in required (*) details.</div>
                    <div class="error__close" id="close-error"><svg xmlns="http://www.w3.org/2000/svg"
                            width="20" viewBox="0 0 20 20" height="20">
                            <path fill="#393a37"
                                d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z">
                            </path>
                        </svg>
                    </div>
                </div>

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
                            <svg viewBox="0 0 640 512" height="1em">
                                <path
                                    d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z">
                                </path>
                            </svg>
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
