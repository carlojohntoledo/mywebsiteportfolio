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

    const editSkillBtn = document.querySelector("#add-new-skill");
    if (editSkillBtn) {
        editSkillBtn.addEventListener("click", () => {
            console.log("✅ Add New Skill clicked");
            showAddSkillForm();
        });
    } else {
        console.warn("⚠️ Add New Skill button not found");
    }

    const editCertificateBtn = document.querySelector("#add-new-certificate");
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



// =============================================================
// ================= Load Skills & Render ======================
// =============================================================
async function loadSkillsFromFirestore(selectedCategory = "All") {
    const container = document.getElementById("skills-content");
    const menuContainer = document.querySelector(".skills-menu");

    if (!container || !menuContainer) return console.warn("⚠️ Skills container not found");

    try {
        showLoader();
        container.innerHTML = "";
        menuContainer.innerHTML = "";

        const snapshot = await db.collection(SKILLS_COLLECTION).orderBy("createdAt", "asc").get();

        const categories = new Set();
        const skills = [];

        snapshot.forEach(doc => {
            const s = doc.data();
            const docId = doc.id;

            const skill = {
                id: docId,
                name: s.name || "Untitled",
                category: s.category || "Other",
                logoUrl: s.logoUrl || "Assets/Images/placeholder.svg",
                logoPublicId: s.logoPublicId || ""
            };

            skills.push(skill);
            categories.add(skill.category);
        });

        // ✅ Always start with an "All" option
        menuContainer.insertAdjacentHTML("beforeend", `
            <label>
                <input type="radio" name="skills-category" value="All" ${selectedCategory === "All" ? "checked" : ""}>
                <span>All</span>
            </label>
        `);

        // Build menu dynamically from categories
        categories.forEach(cat => {
            const labelHtml = `
                <label>
                    <input type="radio" name="skills-category" value="${cat}" ${selectedCategory === cat ? "checked" : ""}>
                    <span>${cat}</span>
                </label>
            `;
            menuContainer.insertAdjacentHTML("beforeend", labelHtml);
        });

        // Render function
        function renderSkills(category) {
            container.innerHTML = "";
            skills
                .filter(s => category === "All" || s.category === category)
                .forEach(s => {
                    const cardHtml = `
                        <div class="skill-card" data-id="${s.id}" data-public-id="${s.logoPublicId}">
                            <div class="skill-img">
                                <img src="${s.logoUrl}" alt="${s.name}">
                            </div>
                            <div class="skill-name">${s.name}</div>
                            <div class="skill-actions">
                                <div class="skill-card-edit" title="Edit skill">Edit</div>
                                <div class="skill-card-remove" title="Remove skill">x</div>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML("beforeend", cardHtml);
                });

            // Hook edit & delete events for all rendered cards
            const cards = container.querySelectorAll(".skill-card");
            cards.forEach(card => {
                const id = card.dataset.id;
                const publicId = card.dataset.publicId;

                // Edit
                card.querySelector(".skill-card-edit").addEventListener("click", async () => {
                    const doc = await db.collection(SKILLS_COLLECTION).doc(id).get();
                    if (doc.exists) {
                        showAddSkillForm({ id: doc.id, ...doc.data() });
                    }
                });

                // Delete
                card.querySelector(".skill-card-remove").addEventListener("click", async () => {
                    if (!confirm("Are you sure you want to delete this skill?")) return;
                    try {
                        await db.collection(SKILLS_COLLECTION).doc(id).delete();
                        if (publicId) {
                            await deleteFromCloudinary(publicId); // optional cleanup
                        }
                        showMessage("🗑️ Skill deleted");
                        await loadSkillsFromFirestore(category); // reload same category
                    } catch (err) {
                        console.error("❌ Error deleting skill:", err);
                    }
                });
            });
        }

        // ✅ Initial render
        renderSkills(selectedCategory);

        // Handle menu switching
        menuContainer.querySelectorAll("input[name='skills-category']").forEach(input => {
            input.addEventListener("change", e => {
                renderSkills(e.target.value);
            });
        });

    } catch (err) {
        console.error("❌ Error loading skills:", err);
    } finally {
        hideLoader();
    }
}



// Example edit function
function editSkill(docId) {
    db.collection(SKILLS_COLLECTION).doc(docId).get().then(doc => {
        if (doc.exists) {
            showAddSkillForm({ id: doc.id, ...doc.data() });
        }
    });
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

document.querySelectorAll('input[name="certificates-filter"]').forEach(radio => {
    radio.addEventListener("change", () => {
        const sort = document.querySelector('input[name="certificates-filter"]:checked').value;
        loadCertificatesFromFirestore(sort);
    });
});

async function loadCertificatesFromFirestore(sort = "default") {
    const container = document.getElementById("certificates-content");
    if (!container) return console.warn("⚠️ #certificates-content container not found");

    try {
        container.innerHTML = `<div class="content-loader">
            <div class="wrapper">
                <div class="circle"></div>
                <div class="line-1"></div>
                <div class="line-2"></div>
                <div class="line-3"></div>
                <div class="line-4"></div>
            </div>
        </div>`; // clear

        let query = db.collection(CERTS_COLLECTION);

        // 🔹 Apply sorting based on filter
        if (sort === "bydate") {
            query = query.orderBy("certDate", "desc"); // user-inputted cert date
        } else if (sort === "alphabetical") {
            query = query.orderBy("title", "asc"); // alphabetical by title
        } else {
            query = query.orderBy("createdAt", "desc"); // default: newest first
        }

        const snapshot = await query.get();

        snapshot.forEach(doc => {
            const c = doc.data();
            const docId = doc.id;
            const title = c.title || "Untitled";
            const desc = c.description || c.desc || "";
            const date = c.certDate || c.date || "";
            const imgUrl = c.fileUrl || "Assets/Images/placeholder.svg";
            const publicId = c.filePublicId || "";

            const cardHtml = `
                <div class="certificate-card" data-id="${docId}" data-public-id="${publicId}">
                    <div class="certificate-actions">
                        <div class="certificate-card-edit" title="Edit certificate">Edit</div>
                        <div class="certificate-card-remove" title="Remove certificate">x</div>
                    </div>
                    <div class="certificate-container noselect">
                        <div class="canvas">
                            ${[...Array(25).keys()].map(i => `<div class="tracker tr-${i + 1}"></div>`).join("")}
                            <div class="certificate-card-inner" id="card">
                                <div class="prompt-container">
                                    <img class="cert-background" src="${imgUrl}" alt="${title}" />
                                    <p class="prompt-title">${title}</p>
                                    <p class="prompt-description">${desc}</p>
                                    <p class="prompt-date">${date}</p>
                                </div>
                                <img class="certificate-image" src="${imgUrl}" alt="${title}">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });

        // attach edit handler AFTER cards are added
        container.querySelectorAll(".certificate-card-edit").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.stopPropagation();
                const certCard = e.target.closest(".certificate-card");
                const docId = certCard.dataset.id;

                try {
                    const doc = await db.collection(CERTS_COLLECTION).doc(docId).get();
                    if (doc.exists) {
                        const cert = doc.data();
                        showCertificateEditForm(docId, cert);
                    }
                } catch (err) {
                    console.error("❌ Error fetching certificate for edit:", err);
                }
            });
        });

        // attach remove handler
        container.querySelectorAll(".certificate-card-remove").forEach(btn => {
            btn.addEventListener("click", handleCertificateRemove);
        });

    } catch (err) {
        console.error("❌ Error loading certificates:", err);
    }
}



// ================= REMOVE CERTIFICATE BUTTON =================
// =============================================================
// ✅ Certificate Remove Handler
// =============================================================
async function handleCertificateRemove(e) {
    if (!e.target.classList.contains("certificate-card-remove")) return;

    e.stopPropagation(); // ✅ prevent triggering lightbox

    const certCard = e.target.closest(".certificate-card");
    if (!certCard) return;

    const docId = certCard.dataset.id;
    const publicId = certCard.dataset.publicId;

    if (confirm("Are you sure you want to delete this certificate?")) {
        showLoader();
        try {
            // 🔹 Delete from Cloudinary
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }

            // 🔹 Delete from Firestore
            await db.collection(CERTS_COLLECTION).doc(docId).delete();

            // 🔹 Remove from DOM
            certCard.remove();

            console.log(`✅ Certificate deleted: ${docId}`);
        } catch (err) {
            console.error("❌ Error deleting certificate:", err);
            alert("Error deleting certificate.");
        } finally {
            hideLoader();
        }
    }
}


// =============================================================
// ================= Injected forms (original HTML kept) =======
// =============================================================

// ---------- showAddSkillForm (kept your original injected markup) ----------
function showAddSkillForm(existingData = null) {
    const editSkillContainer = document.querySelector(".create-card-container-parent");
    if (!editSkillContainer) {
        console.error("❌ Edit form container not found");
        return;
    }

    const isEdit = !!existingData;

    editSkillContainer.innerHTML = `
        <!-- SKILLS -->
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">${isEdit ? "Edit Skill" : "Add New Skill"}</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="profile-post-btn">
                        ${isEdit ? "Update" : "Save"}
                    </span>
                </div>

                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">
                        <div class="error__icon">⚠️</div>
                        <div class="error__title">Please fill-in required (*) details.</div>
                    </div>
                </div>

                <div class="create-profile-form-viewport scroll-fade">
                    <form id="create-profile-form">
                        <div class="profile-group-form">
                            <div class="skill-group-separator">
                                <div class="flex-container">
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-profile-title" id="skill-name" type="text" 
                                            value="${existingData?.name || ""}" required>
                                        <label>Skill Name*</label>
                                    </div>
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-profile-title" id="skill-category" type="text" 
                                            value="${existingData?.category || ""}" required>
                                        <label>Skill Category*</label>
                                    </div>
                                </div>
                                <div class="flex-container">
                                    <div class="create-profile-image-container">
                                        <p style="color: var(--text-color);">Upload Skill Photo</p>
                                        <div class="file-upload-form">
                                            <input id="skill-photo" type="file" 
                                                accept="image/*" style="height:2rem;width:90%;padding:0 1rem;" />
                                        </div>
                                        ${existingData?.logoUrl ? `<div class="current-img"><img src="${existingData.logoUrl}" alt="${existingData.name}" style="max-width:100%; margin-top:1rem; width: 100%"></div>`
            : ""

        }
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
    editSkillContainer.style.display = "grid";

    // Cancel button
    const cancelBtn = editSkillContainer.querySelector("#cancel-btn");
    cancelBtn?.addEventListener("click", () => {
        editSkillContainer.style.display = "none";
        editSkillContainer.innerHTML = "";
    });

    // Save / Update button
    const saveBtn = editSkillContainer.querySelector("#profile-post-btn");
    saveBtn?.addEventListener("click", async () => {
        const nameInput = document.getElementById("skill-name");
        const categoryInput = document.getElementById("skill-category");
        const fileInput = document.getElementById("skill-photo");

        const name = (nameInput?.value || "").trim();
        const category = (categoryInput?.value || "").trim();

        if (!name || !category) {
            document.getElementById("form-warning").style.display = "block";
            return;
        }

        showLoader();
        try {
            let logoUrl = existingData?.logoUrl || "";
            let logoPublicId = existingData?.logoPublicId || "";

            // If a new file is selected, upload to Cloudinary
            if (fileInput && fileInput.files.length > 0) {
                const uploaded = await uploadToCloudinary(
                    fileInput.files[0],
                    "profile",
                    "mysocmed/profile/skills-logo"
                );
                logoUrl = uploaded.imageUrl || logoUrl;
                logoPublicId = uploaded.publicId || logoPublicId;
            }

            const payload = {
                name,
                category,
                logoUrl,
                logoPublicId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (isEdit && existingData.id) {
                // 🔹 Update existing
                await db.collection(SKILLS_COLLECTION).doc(existingData.id).update(payload);
                showMessage("✏️ Skill updated!");
            } else {
                // 🔹 Add new
                payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection(SKILLS_COLLECTION).add(payload);
                showMessage("✅ Skill added!");
            }

            await loadSkillsFromFirestore();

            // Close form
            editSkillContainer.style.display = "none";
            editSkillContainer.innerHTML = "";
        } catch (err) {
            console.error("❌ Error saving skill:", err);
            showMessage("Failed to save skill. Check console for details.");
        } finally {
            hideLoader();
        }
    });
}



// ---------- showCertificateEditForm (kept your original injected markup) ----------
function showCertificateEditForm(docId = null, cert = {}) {
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
                    <h1 class="card-title">${docId ? "Edit Certificate" : "Add New Certificate"}</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="profile-post-btn">Save</span>
                </div>

                <div class="error" id="form-warning">
                    <div class="form-warning-cont">
                        <div class="error__icon">⚠️</div>
                        <div class="error__title">Please fill-in required (*) details.</div>
                        <div class="error__close" id="close-error">✖</div>
                    </div>
                </div>

                <div class="create-profile-form-viewport scroll-fade">
                    <form id="create-profile-form">
                        <div class="profile-group-form">
                            <div class="certificate-group-separator">
                                <div class="flex-container">
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-certificate-title" id="certificate-title" type="text" value="${cert.title || ""}">
                                        <label>Certificate Title</label>
                                    </div>
                                    <div class="create-profile-containers profile-label">
                                        <input class="input-certificate-date" id="certificate-date" type="date" value="${cert.certDate || ""}">
                                        <label>Certificate Date</label>
                                    </div>
                                </div>

                                <div class="create-profile-containers profile-label">
                                    <textarea class="input-certificate-description" id="certificate-description">${cert.description || ""}</textarea>
                                    <label>Certificate Description</label>
                                </div>

                                <div class="flex-container">
                                    <div class="create-profile-image-container">
                                        <p style="color: var(--text-color);">Upload Certificate Photo</p>
                                        <div class="file-upload-form">
                                            <input style="height: 2rem; align-content: center; padding: 0rem 1rem;" 
                                                id="certificate-photo" type="file" accept="image/*" />
                                        </div>
                                        ${cert.fileUrl ? `<img src="${cert.fileUrl}" alt="Certificate" style="max-width:100%;margin-top:8px;border-radius:6px;">` : ""}
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

    // Cancel button
    const cancelBtn = editCertificateContainer.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editCertificateContainer.style.display = "none";
            editCertificateContainer.innerHTML = "";
        });
    }

    // Get inputs
    const saveBtn = editCertificateContainer.querySelector('#profile-post-btn');
    const titleInput = editCertificateContainer.querySelector('#certificate-title');
    const dateInput = editCertificateContainer.querySelector('#certificate-date');
    const descInput = editCertificateContainer.querySelector('#certificate-description');
    const fileInput = editCertificateContainer.querySelector('#certificate-photo');

    // Save handler
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const title = titleInput.value.trim();
            const certDate = dateInput.value.trim();
            const description = descInput.value.trim();

            if (!title) {
                showMessage("Please enter certificate title.");
                return;
            }

            showLoader();
            try {
                let fileUrl = cert.fileUrl || "";
                let filePublicId = cert.filePublicId || "";

                if (fileInput.files.length > 0) {
                    const uploaded = await uploadToCloudinary(
                        fileInput.files[0],
                        "profile",
                        "mysocmed/profile/certificates"
                    );
                    fileUrl = uploaded.imageUrl;
                    filePublicId = uploaded.publicId;
                }

                if (docId) {
                    // Update existing
                    await db.collection(CERTS_COLLECTION).doc(docId).set({
                        title,
                        certDate,
                        description,
                        fileUrl,
                        filePublicId,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    showMessage("✅ Certificate updated!");
                } else {
                    // Add new
                    await db.collection(CERTS_COLLECTION).add({
                        title,
                        certDate,
                        description,
                        fileUrl,
                        filePublicId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showMessage("✅ Certificate added!");
                }

                await loadCertificatesFromFirestore();
                editCertificateContainer.style.display = "none";
                editCertificateContainer.innerHTML = "";
            } catch (err) {
                console.error("❌ Error saving certificate:", err);
                showMessage("Failed to save certificate.");
            } finally {
                hideLoader();
            }
        });
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
                                        <input id="profile-photo" type="file" accept="image/*" />
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
                                        <input id="cover-photo" type="file" accept="image/*" />
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
// window.showAddSkillForm = showAddSkillForm;
// window.showCertificateEditForm = showCertificateEditForm;
// window.loadSkillsFromFirestore = loadSkillsFromFirestore;
// window.loadCertificatesFromFirestore = loadCertificatesFromFirestore;

