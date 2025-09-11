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
    if (!addEducationCont) return;
    addEducationCont.style.display = "grid";

    addEducationCont.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">About Me</h1>
                    <span class="create-profile-button-container red-btn" id="cancel-btn">Cancel</span>
                    <span class="create-profile-button-container green-btn" id="education-post-btn">
                        ${existingData ? "Update" : "Save"}
                    </span>
                </div>
                <div class="error" id="form-warning" style="display:none;">
                    <div class="form-warning-cont">Please fill-in required (*) details.</div>
                </div>
                <div class="create-profile-form-viewport scroll-fade">
                    <form id="create-profile-form">
                        <!-- Education Level -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <select class="input-profile-date" id="edu-level" required>
                                    <option value="primary">Primary</option>
                                    <option value="secondary">Secondary</option>
                                    <option value="vocational">Vocational</option>
                                    <option value="tertiary">Tertiary</option>
                                    <option value="masters">Masters</option>
                                    <option value="doctorate">Doctorate</option>
                                </select>
                                <label>Education Level*</label>
                            </div>
                        </div>

                        <!-- School name, address, course, status, dates ... -->
                        <!-- (same as what you already had) -->
                    </form>
                </div>
            </div>
        </div>
    `;

    // cancel
    const cancelBtn = addEducationCont.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            addEducationCont.style.display = "none";
            addEducationCont.innerHTML = "";
        });
    }
}

// =============================================================
// ✅ GLOBAL SAVE LISTENER
// =============================================================
document.addEventListener("click", async (e) => {
    const saveBtn = e.target.closest("#education-post-btn");
    if (!saveBtn) return;
    e.preventDefault();

    try {
        await saveEducation();
        showEducationDetails(); // call renderer (from about-js.js)
    } catch (err) {
        console.error("❌ Error saving education:", err);
        alert(err.message || "Error saving education.");
    }
});

// =============================================================
// ✅ SAVE EDUCATION FUNCTION
// =============================================================
async function saveEducation() {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) return;

    const levelEl = container.querySelector("#edu-level");
    const schoolEl = container.querySelector("#edu-schoolname");
    const addressEl = container.querySelector("#edu-schooladdress");
    const courseEl = container.querySelector("#edu-course");
    const statusEl = container.querySelector("#edu-status");
    const fromEl = container.querySelector("#edu-from");
    const toEl = container.querySelector("#edu-to");
    const errorEl = container.querySelector("#form-warning");

    const isPrimaryOrSecondary = levelEl.value === "primary" || levelEl.value === "secondary";

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

    let toDate = "Present";
    if (toEl.value) {
        toDate = toEl.value;
    }

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

    if (typeof showLoader === "function") showLoader();

    try {
        await db.collection("education").add(payload);
        console.log("✅ Education saved successfully");

        container.style.display = "none";
        container.innerHTML = "";
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}


// =============================================================
// ✅ ADD SUBMIT/SAVE FOR EDUCATION FORM
// =============================================================
document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("#education-post-btn");
    if (saveBtn) {
        try {
            e.preventDefault();
            saveEducation();
        } catch (err) {
            console.error("❌ Error saving education:", err);
            alert(err.message || "Error saving education.");
        } finally {
            showEducationDetails();
        }
    }
});

async function saveEducation() {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) return;

    const levelEl = container.querySelector("#edu-level");
    const schoolEl = container.querySelector("#edu-schoolname");
    const addressEl = container.querySelector("#edu-schooladdress");
    const courseEl = container.querySelector("#edu-course");
    const statusEl = container.querySelector("#edu-status");
    const fromEl = container.querySelector("#edu-from");
    const toEl = container.querySelector("#edu-to");
    const errorEl = container.querySelector("#form-warning");

    // Validation rules
    const isPrimaryOrSecondary = levelEl.value === "primary" || levelEl.value === "secondary";

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

    // Handle toDate
    let toDate = "Present";
    if (toEl.value) {
        toDate = toEl.value;
    }

    // Prepare payload
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

        await db.collection("education").add(payload);

        console.log("✅ Education saved successfully");

        // Close and clear form
        container.style.display = "none";
        container.innerHTML = "";

    } catch (err) {
        console.error("❌ Error saving education:", err);
        alert(err.message || "Error saving education.");
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}
