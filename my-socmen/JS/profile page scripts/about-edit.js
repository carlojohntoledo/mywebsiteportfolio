document.addEventListener("click", (e) => {
    // Wire up the main buttons that open the injected forms
    const addOccupation = e.target.closest("#add-new-occupation");
    if (addOccupation) {
        console.log("✅ Add Occupation button clicked");
        showAddOccupationForm(); // injects and opens form; prefill handled inside function
    }

});


function showAddOccupationForm() {
    const addOcuppationCont = document.querySelector(".create-card-container-parent");
    addOcuppationCont.style.display = "grid";
    if (!addOcuppationCont) {
        console.error("❌ Occupation form container not found");
        return;
    }

    addOcuppationCont.innerHTML = `
        <div class="create-post-container">
            <div class="create-profile-form-container">
                <div class="create-profile-header">
                    <h1 class="card-title">About Me</h1>
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
                        <h1>Employment History</h1>

                        <!-- Company Name -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-companyname" type="text"
                                    required>
                                <label>Company Name*</label>
                            </div>
                        </div>

                        <!-- Job Title -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-title" id="profile-jobtitle" type="text"
                                    required>
                                <label>Job Title*</label>
                            </div>
                        </div>

                        <!-- Date -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-date" type="date" required>
                                <label>From*</label>
                            </div>
                            <div class="create-profile-containers profile-label">
                                <input class="input-profile-date" type="date" required>
                                <label>To*</label>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="flex-container">
                            <div class="create-profile-containers profile-label">
                                <textarea class="input-profile-description" required></textarea>
                                <label>Description*</label>
                            </div>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    `;

    const cancelBtn = addOcuppationCont.querySelector('#cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addOcuppationCont.style.display = "none";
            addOcuppationCont.innerHTML = "";
        });
    } else {
        console.warn("⚠️ Cancel button not found in injected skill form.");
    }
}

// =============================================================
// ✅ ADD SUBMIT/SAVE FOR OCCUPATION FORM
// =============================================================
document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("#profile-post-btn");
    if (saveBtn) {
        e.preventDefault();
        saveOccupation();
    }
});

async function saveOccupation() {
    const container = document.querySelector(".create-card-container-parent");
    if (!container) return;

    const companyEl = document.getElementById("profile-companyname");
    const jobTitleEl = document.getElementById("profile-jobtitle");
    const fromDateEl = container.querySelectorAll(".input-profile-date")[0];
    const toDateEl = container.querySelectorAll(".input-profile-date")[1];
    const descEl = container.querySelector(".input-profile-description");
    const errorEl = container.querySelector("#form-warning");

    // Simple validation
    if (!companyEl.value.trim() || !jobTitleEl.value.trim() || !fromDateEl.value || !toDateEl.value || !descEl.value.trim()) {
        if (errorEl) errorEl.style.display = "flex";
        return;
    } else if (errorEl) {
        errorEl.style.display = "none";
    }

    // Prepare payload
    const payload = {
        company: companyEl.value.trim(),
        jobTitle: jobTitleEl.value.trim(),
        from: fromDateEl.value,
        to: toDateEl.value,
        description: descEl.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Optionally show loader
        if (typeof showLoader === "function") showLoader();

        // Add to Firestore (collection: "occupations")
        await db.collection("occupations").add(payload);

        console.log("✅ Occupation saved successfully");

        // Clear form + hide container
        container.style.display = "none";
        container.innerHTML = "";

        // Refresh occupation list
        if (typeof loadOccupationsFromFirestore === "function") {
            await loadOccupationsFromFirestore();
        }

        alert("✅ Occupation saved successfully!");
    } catch (err) {
        console.error("❌ Error saving occupation:", err);
        alert(err.message || "Error saving occupation.");
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}
