// ============================================================
// ✅ Profile Edit Form – Inject dynamically & handle logic
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const createBtn = document.getElementById("profile-button"); // adjust selector if different
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            console.log("✅ Edit Profile button clicked"); // test log
            showProfileEditForm();
        });
    } else {
        console.warn("⚠️ Edit Profile button not found");
    }
});

function showProfileEditForm() {
    const editFormCotainer = document.querySelector(".create-card-container-parent");
    if (!editFormCotainer) {
        console.error("❌ Edit form container not found");
        return;
    }
    editFormCotainer.innerHTML = `
                    <div class="create-post-container">
                        <div class="create-profile-form-container">
                            <div class="create-profile-header">
                                <h1 class="card-title">Edit Profile</h1>
                                <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                                <span class="create-profile-button-container green-btn"
                                    id="profile-post-btn">Save</span>
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

                            <div class="create-profile-form-viewport scroll-fade">
                                <form id="create-profile-form">

                                    <!-- PROFILE PHOTO UPLOAD -->
                                    <div class="create-profile-image-container">
                                        <h1>Add Profile Photo</h1>
                                        <div class="file-upload-form">
                                            <label for="file" class="file-upload-label">
                                                <div class="file-upload-design" style="overflow: hidden;">
                                                    <!-- PREVIEW -->
                                                    <div id="profile-profilephoto-preview"
                                                        class="file-preview-container" style="margin-top: 1rem;">
                                                        <div class="flex-container" style="justify-content: start;">
                                                            <img style="width: 10rem; border-radius: 100%;"
                                                                src="Assets/Images/Profile Pictures/default-profile-picture.jpg"
                                                                alt="Profilephoto">
                                                        </div>
                                                    </div>
                                                    <span class="browse-button">Upload Photo</span>
                                                    <input id="profile-photo" type="file" multiple accept="image/*"
                                                        onchange="previewImages(event, '#profile-profilephoto-preview')" />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <!-- COVER  PHOTO UPLOAD -->
                                    <div class="create-profile-image-container">
                                        <h1>Add Cover Photo</h1>
                                        <div class="file-upload-form">
                                            <label for="file" class="file-upload-label">
                                                <div class="file-upload-design" style="overflow: hidden;">
                                                    <!-- PREVIEW -->
                                                    <div id="profile-coverphoto-preview" class="file-preview-container"
                                                        style="margin-top: 1rem;">
                                                        <div class="flex-container" style="justify-content: start;">
                                                            <img src="Assets/Images/Cover Photos/default-cover-photo.png"
                                                                alt="coverphoto">
                                                        </div>
                                                    </div>
                                                    <span class="browse-button">Upload Photo</span>
                                                    <input id="cover-photo" type="file" multiple accept="image/*"
                                                        onchange="previewImages(event, '#profile-coverphoto-preview')" />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Full Name -->
                                    <div class="flex-container">
                                        <div class="create-profile-containers profile-label">
                                            <input class="input-profile-title" type="text" required>
                                            <label>Profile First Name*</label>
                                        </div>
                                        <div class="create-profile-containers profile-label">
                                            <input class="input-profile-title" type="text">
                                            <label>Profile Middle Name</label>
                                        </div>
                                        <div class="create-profile-containers profile-label">
                                            <input class="input-profile-title" type="text" required>
                                            <label>Profile Last Name*</label>
                                        </div>
                                    </div>


                                    <!-- Roles -->
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-profile-roles" placeholder="Web Dev, Game Dev, Sys Ad..."
                                            type="text">
                                        <label>Professional Roles</label>
                                    </div>

                                    <div class="flex-container" style="justify-content: space-evenly; gap: auto">
                                        <h1 style="width: 80%;">SKILLS</h1>
                                        <div class="add-new-skill">Add +</div>
                                    </div>

                                    <!-- SKILLS -->
                                    <div class="profile-group-form"
                                        style="border: 1px dashed; padding: 1rem 0.5rem; color: var(--secondary-color);">
                                        <div class="flex-container">
                                            <div class="create-profile-containers profile-label">
                                                <input class="input-profile-title" type="text" required>
                                                <label>Skill Name*</label>
                                            </div>
                                            <div class="create-profile-containers profile-label">
                                                <input class="input-profile-title" type="text" required>
                                                <label>Skill Category*</label>
                                            </div>
                                        </div>
                                        <div class="create-profile-image-container" style="margin-top: 1rem;">
                                            <h1>Add Skill Photo</h1>
                                            <div class="file-upload-form">
                                                <label for="file" class="file-upload-label">
                                                    <div class="file-upload-design" style="overflow: hidden;">
                                                        <!-- PREVIEW -->
                                                        <div id="profile-skillphoto-preview"
                                                            class="file-preview-container" style="margin-top: 1rem;">
                                                            <div class="flex-container" style="justify-content: start;">
                                                                <img src="Assets/Images/Cover Photos/default-cover-photo.png"
                                                                    alt="skill photo">
                                                            </div>
                                                        </div>
                                                        <span class="browse-button">Upload Photo</span>
                                                        <input id="skill-photo" type="file" multiple accept="image/*"
                                                            onchange="previewImages(event, '#profile-skillphoto-preview')" />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="profile-remove-form">Delete Skill</div>
                                    </div>

                                    <!-- Certificate -->
                                    <div class="flex-container" style="justify-content: space-evenly; gap: auto">
                                        <h1 style="width: 80%;">CERTIFICATES</h1>
                                        <div class="add-new-skill">Add +</div>
                                    </div>

                                    <div class="profile-group-form"
                                        style="border: 1px dashed; padding: 1rem 0.5rem; color: var(--secondary-color); display: grid; gap: 1rem;">
                                        <div class="flex-container">
                                            <div class="create-profile-containers profile-label">
                                                <input class="input-certificate-title" type="text">
                                                <label>Certificate Title</label>
                                            </div>
                                            <div class="create-profile-containers profile-label">
                                                <input class="input-certificate-date" type="date">
                                                <label>Certificate Date</label>
                                            </div>
                                        </div>

                                        <div class="create-profile-containers profile-label">
                                            <textarea class="input-certificate-description"></textarea>
                                            <label>Certificate Description</label>
                                        </div>

                                        <div class="create-profile-image-container">
                                            <h1>Add Certificate Photo</h1>
                                            <div class="file-upload-form">
                                                <label for="file" class="file-upload-label">
                                                    <div class="file-upload-design" style="overflow: hidden;">
                                                        <!-- PREVIEW -->
                                                        <div id="profile-certificatephoto-preview"
                                                            class="file-preview-container" style="margin-top: 1rem;">
                                                            <div class="flex-container" style="justify-content: start;">
                                                                <img src="Assets/Images/Cover Photos/default-cover-photo.png"
                                                                    alt="certificatephoto">
                                                            </div>
                                                        </div>
                                                        <span class="browse-button">Upload Photo</span>
                                                        <input id="cover-photo" type="file" multiple accept="image/*"
                                                            onchange="previewImages(event, '#profile-certificatephoto-preview')" />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="profile-remove-form">Delete Certificate</div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>`;

    editFormCotainer.style.display = "grid"; // Show the form container


}