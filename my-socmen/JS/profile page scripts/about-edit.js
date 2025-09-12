document.addEventListener("click", (e) => {
    // Wire up the main buttons that open the injected forms
    const addOccupation = e.target.closest("#add-new-occupation");
    if (addOccupation) {
        console.log("✅ Add Occupation button clicked");
        showAddOccupationForm(); // injects and opens form; prefill handled inside function
    }

    const addEducation = e.target.closest("#add-new-education");
    if (addEducation) {
        console.log("✅ Add Education button clicked");
        showAddEducationForm(); // injects and opens form; prefill handled inside function
    }

    const addContact = e.target.closest("#add-new-contact");
    if (addContact) {
        console.log("✅ Add Contact Info button clicked");
        showAddContactInfoForm(); // injects and opens form; prefill handled inside function
    }

    const addPersonal = e.target.closest("#add-new-personal");
    if (addPersonal) {
        console.log("✅ Add Personal Info button clicked");
        showAddPersonalInfoForm(); // injects and opens form; prefill handled inside function
    }

});



function showAddOccupationForm(existingData = null) {
    const addOcuppationCont = document.querySelector(".create-card-container-parent");
    addOcuppationCont.style.display = "grid";
    if (!addOcuppationCont) {
        console.error("❌ Occupation form container not found");
        return;
    }

    const isEdit = !!existingData;

    addOcuppationCont.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">About Me</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="occupation-post-btn">
                        ${isEdit ? "Update" : "Save"}
                    </span>
                </div>
                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">Please fill-in required (*) details.</div>
                </div>
                <div class="create-profile-form-viewport scroll-fade">
                    <form id="create-profile-form">
                    <h1>${isEdit ? "Edit Employment History" : "Employment History"}</h1>
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-companyname" type="text"
                                    required value="${existingData?.company || ''}">
                                <label>Company Name*</label>
                            </div>
                        </div>
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-jobtitle" type="text"
                                    required value="${existingData?.jobTitle || ''}">
                                <label>Job Title*</label>
                            </div>
                        </div>
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-date" id="profile-from" type="date" required
                                    value="${existingData?.from || ''}">
                                <label>From*</label>
                            </div>
                            <div class="create-profile-containers profile-label">
                                <select class="input-profile-date" id="profile-to" required>
                                    <option value="Present" ${existingData?.to === "Present" ? "selected" : ""}>Present</option>
                                    <option value="date">Choose Date</option>
                                </select>
                                <input class="input-profile-date" id="profile-to-date" type="date" 
                                    style="display:${existingData?.to && existingData.to !== "Present" ? "block" : "none"}"
                                    value="${existingData?.to && existingData.to !== "Present" ? existingData.to : ''}">
                                <label>To*</label>
                            </div>
                        </div>
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <textarea class="input-profile-description" id="profile-desc" required>${existingData?.description || ''}</textarea>
                                <label>Description*</label>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // cancel
    const cancelBtn = addOcuppationCont.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addOcuppationCont.style.display = "none";
            addOcuppationCont.innerHTML = "";
        });
    }

    // toggle To date field if "date" is selected
    const toSelect = addOcuppationCont.querySelector("#profile-to");
    const toDateInput = addOcuppationCont.querySelector("#profile-to-date");
    toSelect.addEventListener("change", () => {
        toDateInput.style.display = toSelect.value === "date" ? "block" : "none";
    });

    // save/update
    const saveBtn = addOcuppationCont.querySelector("#occupation-post-btn");
    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const payload = {
            company: document.getElementById("profile-companyname").value.trim(),
            jobTitle: document.getElementById("profile-jobtitle").value.trim(),
            from: document.getElementById("profile-from").value,
            to: (toSelect.value === "Present") ? "Present" : toDateInput.value,
            description: document.getElementById("profile-desc").value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        try {
            if (isEdit) {
                await db.collection("occupations").doc(existingData.id).update(payload);
                console.log("✏️ Occupation updated");
            } else {
                payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection("occupations").add(payload);
                console.log("✅ Occupation saved");
            }
            addOcuppationCont.style.display = "none";
            addOcuppationCont.innerHTML = "";
            showOccupationDetails(); // refresh list
        } catch (err) {
            console.error("❌ Error saving occupation:", err);
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.id === "profile-todate") {
            const customDateInput = document.getElementById("profile-todate-custom");
            if (e.target.value === "custom") {
                customDateInput.classList.remove("hidden");
                customDateInput.required = true;
            } else {
                customDateInput.classList.add("hidden");
                customDateInput.required = false;
            }
        }
    });

}

// =============================================================
// ✅ ADD SUBMIT/SAVE FOR OCCUPATION FORM
// =============================================================
document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("#occupation-post-btn");
    if (saveBtn) {

        try {
            e.preventDefault();
            saveOccupation();
        } catch (err) {
            console.error("❌ Error saving occupation:", err);
            alert(err.message || "Error saving occupation.");
        } finally {
            showOccupationDetails();
        }
    }
});

async function saveOccupation() {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) return;

    const companyEl = document.getElementById("profile-companyname");
    const jobTitleEl = document.getElementById("profile-jobtitle");
    const fromDateEl = document.getElementById("profile-fromdate");
    const toDateSelect = document.getElementById("profile-todate");
    const toDateCustom = document.getElementById("profile-todate-custom");
    const descEl = container.querySelector(".input-profile-description");
    const errorEl = container.querySelector("#form-warning");

    // Simple validation
    if (!companyEl.value.trim() || !jobTitleEl.value.trim() || !fromDateEl.value || !descEl.value.trim()) {
        if (errorEl) errorEl.style.display = "flex";
        return;
    } else if (errorEl) {
        errorEl.style.display = "none";
    }

    // Handle toDate
    let toDate = "Present";
    if (toDateSelect.value === "custom" && toDateCustom.value) {
        toDate = toDateCustom.value;
    }

    // Prepare payload
    const payload = {
        company: companyEl.value.trim(),
        jobTitle: jobTitleEl.value.trim(),
        from: fromDateEl.value,
        to: toDate,
        description: descEl.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (typeof showLoader === "function") showLoader();

        await db.collection("occupations").add(payload);

        console.log("✅ Occupation saved successfully");

        container.style.display = "none";
        container.innerHTML = "";



    } catch (err) {
        console.error("❌ Error saving occupation:", err);
        alert(err.message || "Error saving occupation.");
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}


// =============================================================
// ✅ SHOW ADD EDUCATION FORM
// =============================================================
function showAddEducationForm(existingData = null) {
    const addEducationCont = document.querySelector(".create-card-container-parent");
    if (!addEducationCont) {
        console.error("❌ Education form container not found");
        return;
    }

    // Show form container
    addEducationCont.style.display = "grid";

    // Check if we're editing or creating new
    const isEdit = !!existingData;

    // Render the form HTML
    addEducationCont.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <!-- Header -->
                <div class="create-profile-header">
                    <h1 class="card-title">About Me</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="profile-post-btn">
                        ${isEdit ? "Update" : "Save"}
                    </span>
                </div>

                <!-- Error warning -->
                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">Please fill-in required (*) details.</div>
                </div>

                <!-- Scrollable content -->
                <div class="create-profile-form-viewport scroll-fade">
                    <form id="create-profile-form">
                        <h1>${isEdit ? "Edit Educational Background" : "Educational Background"}</h1>

                        <!-- Education Level -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <select class="input-profile-date" id="edu-level" required>
                                    <option value="">Select Level</option>
                                    <option value="primary" ${existingData?.level === "primary" ? "selected" : ""}>Primary</option>
                                    <option value="secondary" ${existingData?.level === "secondary" ? "selected" : ""}>Secondary</option>
                                    <option value="tertiary" ${existingData?.level === "tertiary" ? "selected" : ""}>Tertiary</option>
                                    <option value="vocational" ${existingData?.level === "vocational" ? "selected" : ""}>Vocational</option>
                                    <option value="masters" ${existingData?.level === "masters" ? "selected" : ""}>Masters</option>
                                    <option value="doctorate" ${existingData?.level === "doctorate" ? "selected" : ""}>Doctorate</option>
                                </select>
                                <label>Education Level*</label>
                            </div>
                        </div>

                        <!-- Details section (hidden until a level is chosen) -->
                        <div id="edu-details-section" class="edu-details-group" style="display:none;">
                            <!-- School Name -->
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="edu-schoolname" type="text" 
                                        required value="${existingData?.school || ''}">
                                    <label>University/School Name*</label>
                                </div>
                            </div>

                            <!-- School Address -->
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="edu-schooladdress" type="text" 
                                        required value="${existingData?.address || ''}">
                                    <label>University/School Address*</label>
                                </div>
                            </div>

                            <!-- Course Title (conditionally required) -->
                            <div class="flex-container" id="course-container" style="display:none;">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="edu-course" type="text"
                                        placeholder="Bachelor of Science in..." 
                                        value="${existingData?.course || ''}">
                                    <label>Course Title*</label>
                                </div>
                            </div>

                            <!-- Enrollment Status -->
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <select class="input-profile-date" id="edu-status" required>
                                        <option value="">Select Status</option>
                                        <option value="Graduate" ${existingData?.status === "Graduate" ? "selected" : ""}>Graduate</option>
                                        <option value="Under Graduate" ${existingData?.status === "Under Graduate" ? "selected" : ""}>Under Graduate</option>
                                        <option value="Drop Out" ${existingData?.status === "Drop Out" ? "selected" : ""}>Drop Out</option>
                                        <option value="On Leave" ${existingData?.status === "On Leave" ? "selected" : ""}>On Leave</option>
                                    </select>
                                    <label>Enrollment Status*</label>
                                </div>
                            </div>

                            <!-- Dates -->
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-date" id="edu-from" type="date" 
                                        required value="${existingData?.from || ''}">
                                    <label>From*</label>
                                </div>
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-date" id="edu-to" type="date" 
                                        required value="${existingData?.to || ''}">
                                    <label>To*</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // 🔴 Cancel button → hide and clear form
    const cancelBtn = addEducationCont.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addEducationCont.style.display = "none";
            addEducationCont.innerHTML = "";
        });
    }

    // ⚡ Handle field toggling
    const eduLevelSelect = addEducationCont.querySelector("#edu-level");
    const detailsSection = addEducationCont.querySelector("#edu-details-section");
    const courseContainer = addEducationCont.querySelector("#course-container");
    const courseInput = addEducationCont.querySelector("#edu-course");

    function toggleEducationFields() {
        const level = eduLevelSelect.value;

        // Show details only when a level is chosen
        detailsSection.style.display = level ? "grid" : "none";

        // Course field is required only for tertiary+ levels
        if (level === "primary" || level === "secondary") {
            courseContainer.style.display = "none";
            courseInput.required = false;
            courseInput.value = "";
        } else if (level) {
            courseContainer.style.display = "flex";
            courseInput.required = true;
        }
    }

    eduLevelSelect.addEventListener("change", toggleEducationFields);
    toggleEducationFields(); // initialize (important in edit mode)

    // ✅ Save / Update button
    const saveBtn = addEducationCont.querySelector("#profile-post-btn");
    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        // Collect payload
        const payload = {
            level: eduLevelSelect.value,
            school: document.getElementById("edu-schoolname")?.value.trim() || "",
            address: document.getElementById("edu-schooladdress")?.value.trim() || "",
            course: courseInput.required ? (courseInput.value.trim() || "") : "",
            status: document.getElementById("edu-status")?.value || "",
            from: document.getElementById("edu-from")?.value || "",
            to: document.getElementById("edu-to")?.value || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Basic validation
        if (!payload.level || !payload.school || !payload.address || !payload.status || !payload.from || !payload.to || (courseInput.required && !payload.course)) {
            const errorEl = addEducationCont.querySelector("#form-warning");
            if (errorEl) errorEl.style.display = "flex";
            return;
        }

        try {

            showLoader();
            if (isEdit) {
                // Update existing doc
                await db.collection("education").doc(existingData.id).update(payload);
                console.log("✏️ Education updated");
            } else {
                // Add new doc
                payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection("education").add(payload);
                console.log("✅ Education saved");
            }

            // Close form and refresh list
            addEducationCont.style.display = "none";
            addEducationCont.innerHTML = "";
            showEducationDetails();
        } catch (err) {
            console.error("❌ Error saving education:", err);
        } finally {
            hideLoader();

        }
    });
}



function showAddContactInfoForm(existingData = null) {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) {
        console.error("❌ Contact form container not found");
        return;
    }

    container.style.display = "grid";
    const isEdit = !!existingData;

    container.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <!-- Header -->
                <div class="create-profile-header">
                    <h1 class="card-title">Contact Info</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="contact-save-btn">
                        ${isEdit ? "Update" : "Save"}
                    </span>
                </div>

                <!-- Error warning -->
                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">Please fill-in required (*) details.</div>
                </div>

                <!-- Scrollable content -->
                <div class="create-profile-form-viewport scroll-fade">
                    <form id="contact-form">
                        <h1>${isEdit ? "Edit Contact Info" : "New Contact Info"}</h1>

                        <!-- Contact Type -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <select class="input-profile-date" id="contact-type" required>
                                    <option value="">Select Contact Type</option>
                                    <option value="contactNumber" ${existingData?.type === "contactNumber" ? "selected" : ""}>Contact Number</option>
                                    <option value="emailAddress" ${existingData?.type === "emailAddress" ? "selected" : ""}>Email Address</option>
                                    <option value="socialMedia" ${existingData?.type === "socialMedia" ? "selected" : ""}>Social Media</option>
                                    <option value="websiteLinks" ${existingData?.type === "websiteLinks" ? "selected" : ""}>Website Links</option>
                                </select>
                                <label>Contact Type*</label>
                            </div>
                        </div>

                        <!-- 🔹 Contact Number -->
                        <div class="contact-info-group" id="group-contactNumber" style="display:none;">
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-num" type="number" 
                                        value="${existingData?.contactNum || ''}">
                                    <label>Contact Number*</label>
                                </div>
                            </div>
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-num-platform" type="text" 
                                        value="${existingData?.contactNumPlatform || ''}">
                                    <label>Platform*</label>
                                </div>
                            </div>
                        </div>

                        <!-- 🔹 Email -->
                        <div class="contact-info-group" id="group-emailAddress" style="display:none;">
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-email" type="email" 
                                        value="${existingData?.contactEmail || ''}">
                                    <label>Email Address*</label>
                                </div>
                            </div>
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-email-platform" type="text" 
                                        value="${existingData?.contactEmailPlatform || ''}">
                                    <label>Platform*</label>
                                </div>
                            </div>
                        </div>

                        <!-- 🔹 Social Media -->
                        <div class="contact-info-group" id="group-socialMedia" style="display:none;">
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-socmed" type="text" 
                                        value="${existingData?.contactSocMed || ''}">
                                    <label>Social Media*</label>
                                </div>
                            </div>
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-socmed-platform" type="text" 
                                        value="${existingData?.contactSocMedPlatform || ''}">
                                    <label>Platform*</label>
                                </div>
                            </div>
                        </div>

                        <!-- 🔹 Website Links -->
                        <div class="contact-info-group" id="group-websiteLinks" style="display:none;">
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-link" type="text" 
                                        value="${existingData?.contactLink || ''}">
                                    <label>Website Link*</label>
                                </div>
                            </div>
                            <div class="flex-container">
                                <div class="create-profile-containers profile-label">
                                    <input class="input-profile-title" id="contact-link-platform" type="text" 
                                        value="${existingData?.contactLinkPlatform || ''}">
                                    <label>Platform*</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Cancel button
    const cancelBtn = container.querySelector("#cancel-btn");
    cancelBtn.addEventListener("click", () => {
        container.style.display = "none";
        container.innerHTML = "";
    });

    // Toggle field groups
    const typeSelect = container.querySelector("#contact-type");
    const groups = container.querySelectorAll(".contact-info-group");

    function toggleGroups() {
        groups.forEach(g => g.style.display = "none");
        const value = typeSelect.value;
        if (value) {
            const section = container.querySelector(`#group-${value}`);
            if (section) section.style.display = "grid";
        }
    }
    typeSelect.addEventListener("change", toggleGroups);
    toggleGroups();

    // Save/Update handler
    const saveBtn = container.querySelector("#contact-save-btn");
    saveBtn.addEventListener("click", async () => {
        const type = typeSelect.value;
        if (!type) {
            container.querySelector("#form-warning").style.display = "flex";
            return;
        }

        let payload = { type, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

        if (type === "contactNumber") {
            payload.contactNum = document.getElementById("contact-num").value.trim();
            payload.contactNumPlatform = document.getElementById("contact-num-platform").value.trim();
        } else if (type === "emailAddress") {
            payload.contactEmail = document.getElementById("contact-email").value.trim();
            payload.contactEmailPlatform = document.getElementById("contact-email-platform").value.trim();
        } else if (type === "socialMedia") {
            payload.contactSocMed = document.getElementById("contact-socmed").value.trim();
            payload.contactSocMedPlatform = document.getElementById("contact-socmed-platform").value.trim();
        } else if (type === "websiteLinks") {
            payload.contactLink = document.getElementById("contact-link").value.trim();
            payload.contactLinkPlatform = document.getElementById("contact-link-platform").value.trim();
        }

        // Validate required fields
        if (Object.values(payload).some(v => v === "")) {
            container.querySelector("#form-warning").style.display = "flex";
            return;
        }

        try {
            showLoader();

            if (isEdit) {
                await db.collection("contacts").doc(existingData.id).update(payload);
                console.log("✏️ Contact updated:", existingData.id);
            } else {
                payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection("contacts").add(payload);
                console.log("✅ New contact added");
            }

            // Close form
            container.style.display = "none";
            container.innerHTML = "";

            // 🔄 Refresh contact list
            if (typeof showContactInfoDetails === "function") {
                await showContactInfoDetails();
            }
        } catch (err) {
            console.error("❌ Error saving contact:", err);
        } finally {
            hideLoader();
        }
    });
}

function showAddPersonalInfoForm(existingData = null) {
    const addPersonalInfo = document.querySelector(".create-card-container-parent");
    if (!addPersonalInfo) {
        console.error("❌ Contact form addPersonalInfo not found");
        return;
    }
    addPersonalInfo.style.display = "grid";
    const isEdit = !!existingData;

    addPersonalInfo.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <!-- Header -->
                <div class="create-profile-header">
                    <h1 class="card-title">Personal Info</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="profile-post-btn">
                        ${isEdit ? "Update" : "Save"}
                    </span>
                </div>

                <!-- Error warning -->
                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">Please fill-in required (*) details.</div>
                </div>

                <!-- Scrollable content -->
                <div class="create-profile-form-viewport scroll-fade">
                    <form id="contact-form">
                        <h1>${isEdit ? "Edit Personal Info" : "New Personal Info"}</h1>

                    <div class="flex-container">
                        <div class="create-profile-containers profile-label">
                            <textarea class="input-profile-description" id="profile-desc">${existingData?.personalSummary || ''}</textarea>
                            <label>Professional Summary</label>
                        </div>
                    </div>

                    <div class="flex-container">
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-address" type="text" 
                                value="${existingData?.personalAddress || ''}">
                            <label>Address</label>
                        </div>
                    </div>

                    <div class="flex-container">
                        <div class="create-profile-containers profile-label">
                            <select class="input-profile-date" id="personal-gender">
                                <option value="">Choose Gender</option>
                                <option value="male" ${existingData?.personalGender === "male" ? "selected" : ""}>Male</option>
                                <option value="female" ${existingData?.personalGender === "female" ? "selected" : ""}>Female</option>
                                <option value="skip" ${existingData?.personalGender === "skip" ? "selected" : ""}>Rather Not Say</option>
                            </select>
                            <label>Gender</label>
                        </div>
                        
                        <div class="create-profile-containers profile-label">
                            <select class="input-profile-date" id="personal-language">
                                <option value="">Choose Language</option>
                                <option value="filipino" ${existingData?.personalLanguage === "filipino" ? "selected" : ""}>Filipino</option>
                                <option value="english" ${existingData?.personalLanguage === "english" ? "selected" : ""}>English</option>
                                <option value="english-filipino" ${existingData?.personalLanguage === "english-filipino" ? "selected" : ""}>English - Filipino</option>
                                <option value="japanese" ${existingData?.personalLanguage === "japanese" ? "selected" : ""}>Japanese</option>
                                <option value="chinese" ${existingData?.personalLanguage === "chinese" ? "selected" : ""}>Chinese</option>
                                <option value="korean" ${existingData?.personalLanguage === "korean" ? "selected" : ""}>Korean</option>
                                <option value="indonesian" ${existingData?.personalLanguage === "indonesian" ? "selected" : ""}>Indonesian</option>
                                <option value="malaysian" ${existingData?.personalLanguage === "malaysian" ? "selected" : ""}>Malaysian</option>
                                <option value="other" ${existingData?.personalLanguage === "other" ? "selected" : ""}>Other</option>
                                </select>
                            <label>Language</label>
                        </div>
                    </div>

                    <div class="flex-container">
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-citizenship" type="text" 
                                value="${existingData?.personalCitizenship || ''}">
                            <label>Citizenship</label>
                        </div>
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-status" type="text" 
                                value="${existingData?.personalStatus || ''}">
                            <label>Marital Status</label>
                        </div>
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-religion" type="text" 
                                value="${existingData?.personalReligion || ''}">
                            <label>Religion</label>
                        </div>
                    </div>

                    <div class="flex-container">
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-weight" type="text" 
                                value="${existingData?.personalWeight || ''}">
                            <label>Weight</label>
                        </div>
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-title" id="personal-height" type="text" 
                                value="${existingData?.personalHeight || ''}">
                            <label>Height</label>
                        </div>
                        <div class="create-profile-containers profile-label">
                            <input class="input-profile-date" id="personal-birthdate" type="date" 
                                required value="${existingData?.personalBirthdate || ''}">
                            <label>Birthday</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const cancelBtn = addPersonalInfo.querySelector("#cancel-btn");
    cancelBtn.addEventListener("click", () => {
        addPersonalInfo.style.display = "none";
        addPersonalInfo.innerHTML = "";
    });

    const saveBtn = addPersonalInfo.querySelector("#profile-post-btn");
    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const payload = {
            personalSummary: document.getElementById("personal-summary")?.value.trim() || "",
            personalAddress: document.getElementById("personal-address")?.value.trim() || "",
            personalGender: document.getElementById("personal-gender")?.value || "",
            personalLanguage: document.getElementById("personal-language")?.value || "",
            personalCitizenship: document.getElementById("personal-citizenship")?.value.trim() || "",
            personalStatus: document.getElementById("personal-status")?.value.trim() || "",
            personalReligion: document.getElementById("personal-religion")?.value.trim() || "",
            personalWeight: document.getElementById("personal-weight")?.value.trim() || "",
            personalHeight: document.getElementById("personal-height")?.value.trim() || "",
            personalBirthdate: document.getElementById("personal-birthdate")?.value || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (isEdit) {
                await db.collection("personal_details").doc(existingData.id).update(payload);
                console.log("✏️ Personal Details updated");
            } else {
                payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection("personal_details").add(payload);
                console.log("✅ Personal Details saved");
            }

            addPersonalInfo.style.display = "none";
            addPersonalInfo.innerHTML = "";
            showPersonalInfoDetails();
        } catch (err) {
            console.error("❌ Error saving personal details:", err);
        }
    });
}