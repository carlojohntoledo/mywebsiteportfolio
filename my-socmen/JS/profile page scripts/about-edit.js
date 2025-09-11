document.addEventListener("click", (e) => {
    // Wire up the main buttons that open the injected forms
    const addOccupation = e.target.closest("#add-new-occupation");
    if (addOccupation) {
        console.log("✅ Add Occupation button clicked");
        showAddOccupationForm(); // injects and opens form; prefill handled inside function
    }

});

document.addEventListener("click", (e) => {
    // Wire up the main buttons that open the injected forms
    const addEducation = e.target.closest("#add-new-education");
    if (addEducation) {
        console.log("✅ Add Education button clicked");
        showAddEducationForm(); // injects and opens form; prefill handled inside function
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
        }
    });
}


// =============================================================
// ✅ SAVE EDUCATION FUNCTION
// =============================================================
async function saveEducation() {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) return;

    // Collect form elements
    const levelEl = container.querySelector("#edu-level");
    const schoolEl = container.querySelector("#edu-schoolname");
    const addressEl = container.querySelector("#edu-schooladdress");
    const courseEl = container.querySelector("#edu-course");
    const statusEl = container.querySelector("#edu-status");
    const fromEl = container.querySelector("#edu-from");
    const toEl = container.querySelector("#edu-to");
    const errorEl = container.querySelector("#form-warning");

    // Check if Course is required (only tertiary+)
    const isPrimaryOrSecondary = levelEl.value === "primary" || levelEl.value === "secondary";

    // =====================
    // 🔎 VALIDATION
    // =====================
    if (
        !levelEl.value ||
        !schoolEl.value.trim() ||
        !addressEl.value.trim() ||
        (!isPrimaryOrSecondary && !courseEl.value.trim()) ||
        !statusEl.value ||
        !fromEl.value
    ) {
        if (errorEl) errorEl.style.display = "flex";
        return;
    } else if (errorEl) {
        errorEl.style.display = "none";
    }

    // "To" field (support Present)
    const toDate = toEl.value ? toEl.value : "Present";

    // =====================
    // 📦 PAYLOAD
    // =====================
    const payload = {
        level: levelEl.value,
        school: schoolEl.value.trim(),
        address: addressEl.value.trim(),
        course: isPrimaryOrSecondary ? "" : courseEl.value.trim(),
        status: statusEl.value,
        from: fromEl.value,
        to: toDate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (typeof showLoader === "function") showLoader();

        // Save to Firestore
        await db.collection("education").add(payload);
        console.log("✅ Education saved successfully");

        // Hide and reset form
        container.style.display = "none";
        container.innerHTML = "";

        // Refresh the education list
        if (typeof showEducationDetails === "function") {
            showEducationDetails();
        }

    } catch (err) {
        console.error("❌ Error saving education:", err);
        alert(err.message || "Error saving education.");
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}

// =============================================================
// ✅ ATTACH SAVE HANDLER TO SAVE BUTTON
// =============================================================
document.addEventListener("click", (e) => {
    // Button should match ID from showAddEducationForm
    const saveBtn = e.target.closest("#profile-post-btn");
    if (saveBtn) {
        e.preventDefault();
        saveEducation();
    }
});
