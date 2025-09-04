
// ===================================================
// Create post toggle
// ===================================================

// Show "Create Service" form

function showCreateForm() {
    const page = document.body.dataset.page;
    const container = getPageContainer();

    if (!container) {
        console.warn("⚠️ No container found for page", page);
        return;
    }

    container.innerHTML = getFormTemplate(page);
    console.log("Injected form HTML:", container.innerHTML.slice(0, 100)); // preview only first 100 chars

    container.style.display = "grid";

    // rebind cancel button
    const cancelBtn = container.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            container.style.display = "none";
            container.innerHTML = "";
        });
    } else {
        console.warn("⚠️ Cancel button not found in injected form.");
    }

    // error close button
    const errorClose = container.querySelector('.error__close');
    if (errorClose) {
        errorClose.addEventListener("click", function () {
            const errorElement = document.querySelector(".error");
            if (errorElement) errorElement.style.display = "none";
        });
    }

    initSubmitHandlers(page);
}


document.addEventListener("DOMContentLoaded", () => {
    const createBtn = document.getElementById("create-new-post"); // adjust selector if different
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            console.log("✅ Create button clicked");
            showCreateForm();
        });
    } else {
        console.warn("⚠️ Create button not found");
    }
});


function getFormTemplate(page) {
    const type = page.charAt(0).toUpperCase() + page.slice(0); // Projects → "Projects"


    switch (page) {
        case "activities":
            return `
            <div class="create-post-container">
            <div class="create-${page}-form-container">
                <div class="create-${page}-header">
                <h1 class="card-title">Create ${singular} </h1>
                <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                <span class="create-${page}-button-container green-btn" id="activities-post-btn">Post</span>
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
                </div>

                <div class="create-${page}-form-viewport scroll-fade">
                <form id="create-${page}-form">

                    <!-- DESCRIPTION -->
                    <div class="create-${page}-containers ${page}-label">
                    <textarea class="input-${page}-description" ></textarea>
                    <label>Description</label>
                    </div>

                    <!-- TAGS -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-tags" placeholder="html, css, js..." type="text">
                    <label>Tags</label>
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
                            <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event, '#activities-preview')" />
                        </div>
                        </label>
                    </div>
                    </div>

                    <!-- PREVIEW -->
                    <div id="activities-preview" class="file-preview-container"></div>
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
                    <h1 class="card-title">Create ${singular} </h1>
                    <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-${page}-button-container green-btn" id="services-post-btn">Post</span>
                    </div>

                    <!-- ERROR MESSAGE -->
                    <div class="error" id="form-warning"> 
                        <div class="form-warning-cont">
                            <div class="error__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path fill="#393a37"
                                        d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z">
                                    </path>
                                </svg>
                            </div>
                            <div class="error__title">Please fill-in required (*) details.</div>
                            <div class="error__close" id="close-error"><svg xmlns="http://www.w3.org/2000/svg"
                                    width="20" height="20" viewBox="0 0 20 20">
                                    <path fill="#393a37"
                                        d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="create-${page}-form-viewport scroll-fade">
                    <form id="create-${page}-form">

                        <!-- TITLE -->
                        <div class="create-${page}-containers ${page}-label">
                            <input class="input-${page}-title" type="text" required>
                            <label> Title*</label>
                        </div>

                        <!-- DESCRIPTION -->
                        <div class="create-${page}-containers ${page}-label">
                            <textarea class="input-${page}-description" required></textarea>
                            <label> Description*</label>
                        </div>

                        <!-- EXPERIENCE + STATUS -->
                        <div class="flex-container">
                            <!-- Replace DATE with EXPERIENCE SELECT -->
                            <div class="create-${page}-containers ${page}-label">
                                <select class="input-${page}-date" required>
                                    <option value="<1yr">Less than 1 year</option>
                                    <option value="1-2yrs">1 - 2 years</option>
                                    <option value="2-5yrs">2 - 5 years</option>
                                    <option value="5-10yrs">5 - 10 years</option>
                                    <option value="10+yrs">More than 10 years</option>
                                </select>
                                <label> Experience*</label>
                            </div>

                            <!-- Updated STATUS OPTIONS -->
                            <div class="create-${page}-containers ${page}-label">
                                <select class="input-${page}-status" required>
                                    <option value="Active">Active</option>
                                    <option value="Paused">Paused</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                                <label> Status*</label>
                            </div>
                        </div>

                        <!-- TAGS -->
                        <div class="create-${page}-containers ${page}-label">
                            <input class="input-${page}-tags" placeholder="design, seo, consulting..." type="text">
                            <label> Tags</label>
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
                                        <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event, '#services-preview')" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- PREVIEW -->
                        <div id="services-preview" class="file-preview-container"></div>
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
                <h1 class="card-title">Create ${singular} </h1>
                <span class="create-${page}-button-container red-btn" id="cancel-btn">Cancel</span>
                <span class="create-${page}-button-container green-btn" id="projects-post-btn">Post</span>
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
                </div>

                <div class="create-${page}-form-viewport scroll-fade">
                <form id="create-${page}-form">

                    <!-- TITLE -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-title" type="text" required>
                    <label> Title*</label>
                    </div>

                    <!-- DESCRIPTION -->
                    <div class="create-${page}-containers ${page}-label">
                    <textarea class="input-${page}-description" required></textarea>
                    <label> Description*</label>
                    </div>

                    <!-- DATE + STATUS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-date" type="date" required>
                        <label> Date*</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <select class="input-${page}-status" required>
                        <option value="Published">Published</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Planned">Planned</option>
                        </select>
                        <label> Status*</label>
                    </div>
                    </div>

                    <!-- TAGS -->
                    <div class="create-${page}-containers ${page}-label">
                    <input class="input-${page}-tags" placeholder="html, css, js..." type="text">
                    <label> Tags</label>
                    </div>

                    <!-- LINKS -->
                    <div class="flex-container">
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-pdf-link" type="url" placeholder="https://...">
                        <label> PDF Link</label>
                    </div>
                    <div class="create-${page}-containers ${page}-label">
                        <input class="input-${page}-link" type="url" placeholder="https://...">
                        <label> Link</label>
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
                            <input id="file" type="file" multiple accept="image/*" onchange="previewImages(event, '#projects-preview')" />
                        </div>
                        </label>
                    </div>
                    </div>

                    <!-- PREVIEW -->
                    <div id="projects-preview" class="file-preview-container"></div>
                </form>
                </div>
            </div>
            </div>
        `;

        default:
            return `<p>Unknown page type: ${page}</p>`;
    }
}

const fileSelections = {};

function previewImages(event, containerSelector = ".file-preview-container") {
    const input = event.target;
    const previewContainer = document.querySelector(containerSelector);

    if (!previewContainer) {
        console.warn(`⚠️ Preview container ${containerSelector} not found`);
        return;
    }

    // Initialize storage for this input
    if (!fileSelections[input.id]) {
        fileSelections[input.id] = [];
    }

    // Add newly selected files to existing ones
    const newFiles = Array.from(input.files);
    fileSelections[input.id].push(...newFiles);

    // Remove duplicates (if same file selected twice)
    fileSelections[input.id] = Array.from(new Map(fileSelections[input.id].map(f => [f.name, f])).values());

    // Clear and rebuild preview
    previewContainer.innerHTML = "";

    fileSelections[input.id].forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-preview");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = `Preview ${index + 1}`;

            // ❌ Remove button
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-preview");
            removeBtn.innerHTML = "&times;";

            removeBtn.addEventListener("click", function () {
                // Remove from DOM
                filePreview.remove();

                // Remove from storage
                fileSelections[input.id].splice(index, 1);

                // Update <input type="file"> FileList
                const dt = new DataTransfer();
                fileSelections[input.id].forEach(f => dt.items.add(f));
                input.files = dt.files;

                // Re-render previews (to fix index order)
                previewImages({ target: input }, containerSelector);
            });

            imgWrapper.appendChild(img);
            filePreview.appendChild(imgWrapper);
            filePreview.appendChild(removeBtn);
            previewContainer.appendChild(filePreview);
        };
        reader.readAsDataURL(file);
    });
}

