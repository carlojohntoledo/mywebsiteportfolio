// =============================================================
// ✅ edit-profile.js (FULL rewrite)
//    - keeps your injected forms exactly as they were
//    - integrates Firestore + Cloudinary for save/delete
//    - prefill profile form on open
//    - add-only for skills & certificates (no prefill)
//    - delete skill/certificate with Cloudinary + Firestore cleanup
//    - default photo reset with confirmation and Cloudinary delete
//    - loader wrapping using try / catch / finally where appropriate
// =============================================================

// NOTE: This script expects these globals to exist:
// - db (Firestore instance), e.g. from your index.js
// - uploadToCloudinary(file, type, folder)
// - deleteFromCloudinary(publicId)
// - showLoader(), hideLoader()

document.addEventListener("DOMContentLoaded", () => {
    // Wire up the main buttons that open the injected forms
    const editProfileBtn = document.getElementById("edit-profile-button");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            console.log("✅ Edit Profile button clicked");
            showProfileEditForm(); // injects and opens form; prefill handled inside function
        });
    } else {
        console.warn("⚠️ Edit Profile button not found");
    }

    const editSkillBtn = document.querySelector(".add-new-skill");
    if (editSkillBtn) {
        editSkillBtn.addEventListener("click", () => {
            console.log("✅ Add New Skill clicked");
            showSkillEditForm();
        });
    } else {
        console.warn("⚠️ Add New Skill button not found");
    }

    const editCertificateBtn = document.querySelector(".add-new-certificate");
    if (editCertificateBtn) {
        editCertificateBtn.addEventListener("click", () => {
            console.log("✅ Add New Certificate clicked");
            showCertificateEditForm();
        });
    } else {
        console.warn("⚠️ Add New Certificate button not found");
    }

    // Load skills & certificates on page load so profile shows latest data
    loadSkillsFromFirestore();       // populates #skills-content
    loadCertificatesFromFirestore(); // populates #certificates-content
    prefillProfileDisplay();         // prefills top-of-page profile (profile-name, profile-roles, images)
});

// =============================================================
// ================= Helper: Firestore collection names ========
// =============================================================
const PROFILE_DOC_COLLECTION = "profile";    // collection used to store the single user profile doc
const PROFILE_DOC_ID = "user";              // doc id (you can change if you use different id)
const SKILLS_COLLECTION = "skills";         // collection for skills
const CERTS_COLLECTION = "certificates";    // collection for certificates

// =============================================================
// ================= Utility functions =========================
// =============================================================

/**
 * safeGet(el) => returns element or null; logs warning if missing
 */
function safeGet(selector) {
    const el = document.querySelector(selector);
    if (!el) console.warn(`⚠️ Element not found: ${selector}`);
    return el;
}

/**
 * showMessage: small wrapper for alerts — can be replaced later
 */
function showMessage(msg) {
    // keep simple for now — you can adapt to your UI toast system later
    alert(msg);
}

/**
 * getProfileDisplayElements
 * returns references to top-of-page profile display fields (if present)
 */
function getProfileDisplayElements() {
    return {
        nameEl: document.getElementById("profile-name") || document.querySelector(".name-text-container-cont h1"),
        rolesEl: document.querySelector(".profile-roles"),
        profileImgEl: document.querySelector(".profilephoto-container img"),
        coverImgEl: document.querySelector(".coverphoto-container img")
    };
}



// =============================================================
// ================= Load Skills & Render ======================
// =============================================================
/**
 * loadSkillsFromFirestore()
 * Loads skills from Firestore and renders them into .skills-card-container (#skills-content)
 * Renders markup to match your example skill-card design:
 * <div class="skill-card" data-id="docId" data-public-id="publicId"> ... </div>
 */
async function loadSkillsFromFirestore() {
    const container = document.getElementById("skills-content");
    if (!container) return console.warn("⚠️ #skills-content container not found");

    try {
        showLoader();
        container.innerHTML = ""; // clear

        const snapshot = await db.collection(SKILLS_COLLECTION).orderBy("createdAt", "asc").get();
        snapshot.forEach(doc => {
            const s = doc.data();
            const docId = doc.id;
            // fallback fields
            const name = s.name || "Untitled";
            const imgUrl = s.logoUrl || "Assets/Images/placeholder.svg";
            const publicId = s.logoPublicId || "";

            const cardHtml = `
                <div class="skill-card" data-id="${docId}" data-public-id="${publicId}">
                    <div class="skill-img">
                        <img src="${imgUrl}" alt="${name}">
                    </div>
                    <div class="skill-name">${name}</div>
                    <div class="skill-card-remove" title="Remove skill">X</div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });
    } catch (err) {
        console.error("❌ Error loading skills:", err);
    } finally {
        hideLoader();
    }
}

// =============================================================
// ================= Load Certificates & Render ===============
// =============================================================
/**
 * loadCertificatesFromFirestore()
 * Loads certificates and injects cards into #certificates-content
 * Each certificate-card will include data-id and data-public-id for deletion
 * We will mimic the card structure to fit your CSS and visual design.
 */
async function loadCertificatesFromFirestore() {
    const container = document.getElementById("certificates-content");
    if (!container) return console.warn("⚠️ #certificates-content container not found");

    try {
        showLoader();
        container.innerHTML = ""; // clear

        const snapshot = await db.collection(CERTS_COLLECTION).orderBy("createdAt", "desc").get();
        snapshot.forEach(doc => {
            const c = doc.data();
            const docId = doc.id;
            const title = c.title || "Untitled";
            const desc = c.description || c.desc || "";
            const date = c.certDate || c.date || "";
            const imgUrl = c.fileUrl || "Assets/Images/placeholder.svg";
            const publicId = c.filePublicId || "";

            // We'll produce a card similar to your generateCertificateCard markup so CSS matches
            const cardHtml = `
                <div class="certificate-card" data-id="${docId}" data-public-id="${publicId}">
                  <div class="certificate-container noselect">
                    <div class="canvas">
                      <div class="tracker tr-1"></div>
                      <div class="tracker tr-2"></div>
                      <div class="tracker tr-3"></div>
                      <div class="tracker tr-4"></div>
                      <div class="tracker tr-5"></div>
                      <div class="tracker tr-6"></div>
                      <div class="tracker tr-7"></div>
                      <div class="tracker tr-8"></div>
                      <div class="tracker tr-9"></div>
                      <div class="tracker tr-10"></div>
                      <div class="tracker tr-11"></div>
                      <div class="tracker tr-12"></div>
                      <div class="tracker tr-13"></div>
                      <div class="tracker tr-14"></div>
                      <div class="tracker tr-15"></div>
                      <div class="tracker tr-16"></div>
                      <div class="tracker tr-17"></div>
                      <div class="tracker tr-18"></div>
                      <div class="tracker tr-19"></div>
                      <div class="tracker tr-20"></div>
                      <div class="tracker tr-21"></div>
                      <div class="tracker tr-22"></div>
                      <div class="tracker tr-23"></div>
                      <div class="tracker tr-24"></div>
                      <div class="tracker tr-25"></div>
                      <div class="certificate-card-inner" id="card">
                          <div class="prompt-container">
                              <img class="cert-background" src="${imgUrl}" alt="${title}" />
                              <p class="prompt-title">${title}</p>
                              <p class="prompt-description">${desc}</p>
                              <p class="prompt-date">${date}</p>
                          </div>
                          <img class="certificate-image" src="${imgUrl}" alt="${title}">
                          <div class="certificate-card-remove" title="Remove certificate">X</div>
                      </div>
                    </div>
                  </div>
                  
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });
    } catch (err) {
        console.error("❌ Error loading certificates:", err);
    } finally {
        hideLoader();
    }
}

// =============================================================
// ================= Injected forms (original HTML kept) =======
// =============================================================

// ---------- showSkillEditForm (kept your original injected markup) ----------
function showSkillEditForm() {
    const editSkillContainer = document.querySelector(".create-card-container-parent");
    if (!editSkillContainer) {
        console.error("❌ Edit form container not found");
        return;
    }

    editSkillContainer.innerHTML = `
        <!-- SKILLS -->
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">Add New Skill</h1>
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
                        <div class="profile-group-form">
                            <div class="skill-group-separator">
                                <div class="flex-container">
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-profile-title" id="skill-name" type="text" required>
                                        <label>Skill Name*</label>
                                    </div>
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-profile-title" id="skill-category" type="text" required>
                                        <label>Skill Category*</label>
                                    </div>
                                </div>
                                <div class="flex-container">
                                    <div class="create-profile-image-container">
                                        <p style="color: var(--text-color);">Upload Skill Photo</p>
                                        <div class="file-upload-form">
                                                    <input style="height: 2rem; align-content: center; padding: 0rem 1rem;" id="skill-photo" type="file" multiple accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <!-- SKILLS END -->
    `;
    editSkillContainer.style.display = "grid"; // Show the form container

    // hook cancel button
    const cancelBtn = editSkillContainer.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editSkillContainer.style.display = "none";
            editSkillContainer.innerHTML = "";
        });
    } else {
        console.warn("⚠️ Cancel button not found in injected skill form.");
    }

    // Hook Save button for skills (profile-post-btn inside injected template)
    const saveBtn = editSkillContainer.querySelector('#profile-post-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            // Save skill: upload file (if present) then add Firestore doc
            const nameInput = editSkillContainer.querySelector('#skill-name');
            const categoryInput = editSkillContainer.querySelector('#skill-category');
            const fileInput = editSkillContainer.querySelector('#skill-photo');

            const name = (nameInput?.value || "").trim();
            const category = (categoryInput?.value || "").trim();

            if (!name || !category) {
                showMessage("Please enter skill name and category.");
                return;
            }

            showLoader();
            try {
                let logoUrl = "";
                let logoPublicId = "";

                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    // upload to Cloudinary under profile/skills-logo
                    const uploaded = await uploadToCloudinary(fileInput.files[0], "profile", "mysocmed/profile/skills-logo");
                    logoUrl = uploaded.imageUrl || "";
                    logoPublicId = uploaded.publicId || "";
                }

                // Save to Firestore
                await db.collection(SKILLS_COLLECTION).add({
                    name,
                    category,
                    logoUrl,
                    logoPublicId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showMessage("✅ Skill added!");
                // refresh UI
                await loadSkillsFromFirestore();
                // close injected form
                editSkillContainer.style.display = "none";
                editSkillContainer.innerHTML = "";
            } catch (err) {
                console.error("❌ Error adding skill:", err);
                showMessage("Failed to add skill. Check console for details.");
            } finally {
                hideLoader();
            }
        });
    } else {
        console.warn("⚠️ Save button not found in injected skill form.");
    }
}

// ---------- showCertificateEditForm (kept your original injected markup) ----------
function showCertificateEditForm() {
    const editCertificateContainer = document.querySelector(".create-card-container-parent");
    if (!editCertificateContainer) {
        console.error("❌ Edit form container not found");
        return;
    }

    editCertificateContainer.innerHTML = `
        <!-- Certificate -->
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">Add New Certificate</h1>
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
                        <div class="profile-group-form">
                            <div class="certificate-group-separator">
                                <div class="flex-container">
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-certificate-title" id="certificate-title" type="text">
                                        <label>Certificate Title</label>
                                    </div>
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-certificate-date" id="certificate-date" type="date">
                                        <label>Certificate Date</label>
                                    </div>
                                </div>

                                <div class="create-profile-containers profile-label">
                                    <textarea class="input-certificate-description" id="certificate-description"></textarea>
                                    <label>Certificate Description</label>
                                </div>

                                <div class="flex-container">
                                    <div class="create-profile-image-container">
                                        <p style="color: var(--text-color);">Upload Certificate Photo</p>
                                        <div class="file-upload-form">
                                            <input style="height: 2rem; align-content: center; padding: 0rem 1rem;" id="certificate-photo" type="file" multiple accept="image/*" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    editCertificateContainer.style.display = "grid"; // Show the form container

    // hook cancel button
    const cancelBtn = editCertificateContainer.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editCertificateContainer.style.display = "none";
            editCertificateContainer.innerHTML = "";
        });
    } else {
        console.warn("⚠️ Cancel button not found in injected certificate form.");
    }

    // Hook Save button for certificate
    const saveBtn = editCertificateContainer.querySelector('#profile-post-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const titleInput = editCertificateContainer.querySelector('#certificate-title');
            const dateInput = editCertificateContainer.querySelector('#certificate-date');
            const descInput = editCertificateContainer.querySelector('#certificate-description');
            const fileInput = editCertificateContainer.querySelector('#certificate-photo');

            const title = (titleInput?.value || "").trim();
            const certDate = (dateInput?.value || "").trim();
            const description = (descInput?.value || "").trim();

            if (!title) {
                showMessage("Please enter certificate title.");
                return;
            }

            showLoader();
            try {
                let fileUrl = "";
                let filePublicId = "";

                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    const uploaded = await uploadToCloudinary(fileInput.files[0], "profile", "mysocmed/profile/certificates");
                    fileUrl = uploaded.imageUrl || "";
                    filePublicId = uploaded.publicId || "";
                }

                await db.collection(CERTS_COLLECTION).add({
                    title,
                    certDate,
                    description,
                    fileUrl,
                    filePublicId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showMessage("✅ Certificate added!");
                await loadCertificatesFromFirestore();
                editCertificateContainer.style.display = "none";
                editCertificateContainer.innerHTML = "";
            } catch (err) {
                console.error("❌ Error adding certificate:", err);
                showMessage("Failed to add certificate. Check console.");
            } finally {
                hideLoader();
            }
        });
    } else {
        console.warn("⚠️ Save button not found in injected certificate form.");
    }
}

// ---------- showProfileEditForm (kept your original injected markup but enhanced to prefill and save) ----------
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
                        <h1>Profile Details</h1>
                        <!-- PROFILE PHOTO UPLOAD -->
                        <div class="create-profile-image-container">
                            <h1>Add Profile Photo</h1>
                            <div class="file-upload-form">
                                <p class="default-btn" id="profile-default-btn" data-target="profile">default</p>
                                <label for="profile-photo" class="file-upload-label">
                                    <div class="file-upload-design" style="overflow: hidden;">
                                        <!-- PREVIEW -->
                                        <div id="profile-profilephoto-preview"
                                            class="file-preview-container" style="margin-top: 1rem;">
                                            <div class="flex-container" style="justify-content: start;">
                                                <img style="width: 10rem; border-radius: 100%;"
                                                    src="Assets/Images/Profile Pictures/default-profile-picture.jpg"
                                                    alt="Profilephoto" id="profile-preview-img">
                                            </div>
                                        </div>
                                        <span class="browse-button">Upload Photo</span>
                                        <input id="profile-photo" type="file" multiple accept="image/*" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- COVER  PHOTO UPLOAD -->
                        <div class="create-profile-image-container">
                            <h1>Add Cover Photo</h1>
                            <div class="file-upload-form">
                                <p class="default-btn" id="cover-default-btn" data-target="cover">default</p>
                                <label for="cover-photo" class="file-upload-label">
                                    <div class="file-upload-design" style="overflow: hidden;">
                                        <!-- PREVIEW -->
                                        <div id="profile-coverphoto-preview" class="file-preview-container"
                                            style="margin-top: 1rem;">
                                            <div class="flex-container" style="justify-content: start;">
                                                <img src="Assets/Images/Cover Photos/default-cover-photo.png"
                                                    alt="coverphoto" id="cover-preview-img">
                                            </div>
                                        </div>
                                        <span class="browse-button">Upload Photo</span>
                                        <input id="cover-photo" type="file" multiple accept="image/*" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Full Name -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-firstname" type="text" required>
                                <label>Profile First Name*</label>
                            </div>
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-middlename" type="text">
                                <label>Profile Middle Name</label>
                            </div>
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-lastname" type="text" required>
                                <label>Profile Last Name*</label>
                            </div>
                        </div>


                        <!-- Roles -->
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-roles" id="profile-roles" placeholder="Web Dev, Game Dev, Sys Ad..."
                                type="text">
                            <label>Professional Roles</label>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

    editFormCotainer.style.display = "grid"; // Show the form container

    // ====== Cancel button behavior (closes & clears injected DOM) ======
    const cancelBtn = editFormCotainer.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editFormCotainer.style.display = "none";
            editFormCotainer.innerHTML = "";
        });
    } else {
        console.warn("⚠️ Cancel button not found in injected profile form.");
    }

    // ====== Prefill the profile inputs and set preview images/publicIds ======
    (async function prefillProfileFormInputs() {
        try {
            showLoader();
            const docRef = db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID);
            const doc = await docRef.get();
            if (!doc.exists) {
                console.log("ℹ️ Profile doc not found (prefill form) — using defaults");
                return;
            }
            const data = doc.data() || {};

            // Fill inputs
            const firstInput = editFormCotainer.querySelector('#profile-firstname');
            const midInput = editFormCotainer.querySelector('#profile-middlename');
            const lastInput = editFormCotainer.querySelector('#profile-lastname');
            const rolesInput = editFormCotainer.querySelector('#profile-roles');

            if (firstInput) firstInput.value = data.firstname || "";
            if (midInput) midInput.value = data.middlename || "";
            if (lastInput) lastInput.value = data.lastname || "";
            if (rolesInput) rolesInput.value = data.roles || "";

            // Previews: store publicId in data-* for later deletion
            const profilePreviewImg = editFormCotainer.querySelector('#profile-preview-img');
            const coverPreviewImg = editFormCotainer.querySelector('#cover-preview-img');

            if (profilePreviewImg) {
                profilePreviewImg.src = data.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";
                profilePreviewImg.dataset.publicId = data.profilePhotoPublicId || "";
            }
            if (coverPreviewImg) {
                coverPreviewImg.src = data.coverPhotoUrl || "Assets/Images/Cover Photos/default-cover-photo.png";
                coverPreviewImg.dataset.publicId = data.coverPhotoPublicId || "";
            }
        } catch (err) {
            console.error("❌ Error pre-filling profile form inputs:", err);
        } finally {
            hideLoader();
        }
    })();

    // ====== Preview selected images when user chooses files (instant preview) ======
    const profileFileInput = editFormCotainer.querySelector('#profile-photo');
    const coverFileInput = editFormCotainer.querySelector('#cover-photo');
    const profilePreviewImg = editFormCotainer.querySelector('#profile-preview-img');
    const coverPreviewImg = editFormCotainer.querySelector('#cover-preview-img');

    if (profileFileInput && profilePreviewImg) {
        profileFileInput.addEventListener('change', (ev) => {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            profilePreviewImg.src = URL.createObjectURL(f);
            // When selecting a new file, we temporarily clear stored publicId since a new image will be uploaded
            profilePreviewImg.dataset.publicId = "";
        });
    }

    if (coverFileInput && coverPreviewImg) {
        coverFileInput.addEventListener('change', (ev) => {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            coverPreviewImg.src = URL.createObjectURL(f);
            coverPreviewImg.dataset.publicId = "";
        });
    }

    // ====== Default buttons: revert to default w/ confirmation & Cloudinary delete ======
    const profileDefaultBtn = editFormCotainer.querySelector('#profile-default-btn');
    const coverDefaultBtn = editFormCotainer.querySelector('#cover-default-btn');

    if (profileDefaultBtn && profilePreviewImg) {
        profileDefaultBtn.addEventListener('click', async () => {
            const publicId = profilePreviewImg.dataset.publicId || "";
            const defaultUrl = "Assets/Images/Profile Pictures/default-profile-picture.jpg";
            if (publicId) {
                const confirmed = confirm("This will permanently delete your uploaded profile photo from Cloudinary and revert to default. Continue?");
                if (!confirmed) return;
                showLoader();
                try {
                    await deleteFromCloudinary(publicId);
                    // update Firestore to clear photo url/publicId
                    await db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID).set({
                        profilePhotoUrl: defaultUrl,
                        profilePhotoPublicId: ""
                    }, { merge: true });
                    profilePreviewImg.src = defaultUrl;
                    profilePreviewImg.dataset.publicId = "";
                    // Also update the top-of-page display
                    const { profileImgEl } = getProfileDisplayElements();
                    if (profileImgEl) profileImgEl.src = defaultUrl;
                    showMessage("✅ Profile photo reset to default");
                } catch (err) {
                    console.error("❌ Error deleting profile photo from Cloudinary:", err);
                    showMessage("Failed to reset profile photo. Check console.");
                } finally {
                    hideLoader();
                }
            } else {
                profilePreviewImg.src = defaultUrl;
            }
        });
    }

    if (coverDefaultBtn && coverPreviewImg) {
        coverDefaultBtn.addEventListener('click', async () => {
            const publicId = coverPreviewImg.dataset.publicId || "";
            const defaultUrl = "Assets/Images/Cover Photos/default-cover-photo.png";
            if (publicId) {
                const confirmed = confirm("This will permanently delete your uploaded cover photo from Cloudinary and revert to default. Continue?");
                if (!confirmed) return;
                showLoader();
                try {
                    await deleteFromCloudinary(publicId);
                    // update Firestore
                    await db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID).set({
                        coverPhotoUrl: defaultUrl,
                        coverPhotoPublicId: ""
                    }, { merge: true });
                    coverPreviewImg.src = defaultUrl;
                    coverPreviewImg.dataset.publicId = "";
                    const { coverImgEl } = getProfileDisplayElements();
                    if (coverImgEl) coverImgEl.src = defaultUrl;
                    showMessage("✅ Cover photo reset to default");
                } catch (err) {
                    console.error("❌ Error deleting cover photo from Cloudinary:", err);
                    showMessage("Failed to reset cover photo. Check console.");
                } finally {
                    hideLoader();
                }
            } else {
                coverPreviewImg.src = defaultUrl;
            }
        });
    }

    // ====== Save profile changes (Save button on injected form) ======
    const saveProfileBtn = editFormCotainer.querySelector('#profile-post-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            // collect inputs
            const firstnameInput = editFormCotainer.querySelector('#profile-firstname');
            const middlenameInput = editFormCotainer.querySelector('#profile-middlename');
            const lastnameInput = editFormCotainer.querySelector('#profile-lastname');
            const rolesInput = editFormCotainer.querySelector('#profile-roles');

            const profileFileInput = editFormCotainer.querySelector('#profile-photo');
            const coverFileInput = editFormCotainer.querySelector('#cover-photo');

            const firstname = (firstnameInput?.value || "").trim();
            const middlename = (middlenameInput?.value || "").trim();
            const lastname = (lastnameInput?.value || "").trim();
            const roles = (rolesInput?.value || "").trim();

            if (!firstname || !lastname) {
                showMessage("Please fill in required name fields.");
                return;
            }

            showLoader();
            try {
                // Load current profile doc (to obtain existing publicIds if we need to delete old images)
                const docRef = db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID);
                const doc = await docRef.get();
                const existing = (doc.exists && doc.data()) ? doc.data() : {};

                let profilePhotoUrl = existing.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";
                let profilePhotoPublicId = existing.profilePhotoPublicId || "";
                let coverPhotoUrl = existing.coverPhotoUrl || "Assets/Images/Cover Photos/default-cover-photo.png";
                let coverPhotoPublicId = existing.coverPhotoPublicId || "";

                // If user selected a new profile image file -> upload it, and delete previous one if it had a cloudinary publicId
                if (profileFileInput && profileFileInput.files && profileFileInput.files.length > 0) {
                    // if previous had publicId, delete it first (optional)
                    if (profilePhotoPublicId) {
                        try {
                            await deleteFromCloudinary(profilePhotoPublicId);
                        } catch (err) {
                            console.warn("⚠️ Could not delete old profile image; continuing with upload", err);
                        }
                    }
                    const uploaded = await uploadToCloudinary(profileFileInput.files[0], "profile", "mysocmed/profile/profile-pictures");
                    profilePhotoUrl = uploaded.imageUrl || profilePhotoUrl;
                    profilePhotoPublicId = uploaded.publicId || "";
                }

                // Cover photo upload
                if (coverFileInput && coverFileInput.files && coverFileInput.files.length > 0) {
                    if (coverPhotoPublicId) {
                        try {
                            await deleteFromCloudinary(coverPhotoPublicId);
                        } catch (err) {
                            console.warn("⚠️ Could not delete old cover image; continuing with upload", err);
                        }
                    }
                    const uploaded = await uploadToCloudinary(coverFileInput.files[0], "profile", "mysocmed/profile/cover-photos");
                    coverPhotoUrl = uploaded.imageUrl || coverPhotoUrl;
                    coverPhotoPublicId = uploaded.publicId || "";
                }

                // Save back to Firestore (merge)
                await db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID).set({
                    firstname,
                    middlename,
                    lastname,
                    roles,
                    profilePhotoUrl,
                    profilePhotoPublicId,
                    coverPhotoUrl,
                    coverPhotoPublicId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                showMessage("✅ Profile saved successfully!");
                // Close/destroy injected form
                editFormCotainer.style.display = "none";
                editFormCotainer.innerHTML = "";

                // Update top-of-page display immediately
                await prefillProfileDisplay();
            } catch (err) {
                console.error("❌ Error saving profile:", err);
                showMessage("Failed to save profile. Check console.");
            } finally {
                hideLoader();
            }
        });
    } else {
        console.warn("⚠️ Save button not found in injected profile form.");
    }
}

// =============================================================
// ================= Delete handlers (delegated) ===============
// =============================================================

// Listen to clicks for removing skill cards or certificate cards (delegation)
document.addEventListener("click", async (e) => {
    // Skill delete (X button)
    if (e.target && e.target.classList && e.target.classList.contains("skill-card-remove")) {
        const card = e.target.closest(".skill-card");
        if (!card) return;
        const docId = card.dataset.id;
        const publicId = card.dataset.publicId;

        const confirmed = confirm("Delete this skill permanently?");
        if (!confirmed) return;

        showLoader();
        try {
            if (publicId) {
                // delete from cloudinary via your cloud function
                await deleteFromCloudinary(publicId);
            }
            await db.collection(SKILLS_COLLECTION).doc(docId).delete();
            card.remove();
            showMessage("✅ Skill deleted");
        } catch (err) {
            console.error("❌ Error deleting skill:", err);
            showMessage("Failed to delete skill. Check console.");
        } finally {
            hideLoader();
        }
        return;
    }

    // Certificate delete (delete btn added next to certificate-card)
    if (e.target && e.target.classList && e.target.classList.contains("certificate-card-remove")) {
        const card = e.target.closest(".certificate-card");
        if (!card) return;
        const docId = card.dataset.id;
        const publicId = card.dataset.publicId;

        const confirmed = confirm("Delete this certificate permanently?");
        if (!confirmed) return;

        showLoader();
        try {
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
            await db.collection(CERTS_COLLECTION).doc(docId).delete();
            card.remove();
            showMessage("✅ Certificate deleted");
        } catch (err) {
            console.error("❌ Error deleting certificate:", err);
            showMessage("Failed to delete certificate. Check console.");
        } finally {
            hideLoader();
        }
        return;
    }
});

// =============================================================
// ================= Exported (optional) =======================
// =============================================================
// If you want these functions available globally (for debugging or legacy calls),
// you can attach them to window. Otherwise they remain local to this module.
// Example:
// window.showProfileEditForm = showProfileEditForm;
// window.showSkillEditForm = showSkillEditForm;
// window.showCertificateEditForm = showCertificateEditForm;
// window.loadSkillsFromFirestore = loadSkillsFromFirestore;
// window.loadCertificatesFromFirestore = loadCertificatesFromFirestore;

