// =============================================================
// ✅ PROFILE.JS - Handle Profile Page Logic
// Mirrors: edit.js, load.js, createToggle.js, submit.js
// =============================================================

// 🔹 Global references
const db = firebase.firestore();
let profileDocId = "mainProfile"; // you can store profile under a fixed ID
let currentProfile = {
    profilePhoto: null,
    coverPhoto: null,
    fullName: "",
    roles: "",
    skills: [],
    certificates: []
};

// =============================================================
// ✅ Init Profile Page
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    const editBtn = document.querySelector(".edit-profile-button");
    if (editBtn) {
        editBtn.addEventListener("click", () => openProfileForm());
    }

    // Load profile on page load
    loadProfileFromFirestore();
});

// =============================================================
// ✅ Load Profile Data
// =============================================================
async function loadProfileFromFirestore() {
    showLoader();
    try {
        const doc = await db.collection("profile").doc(profileDocId).get();
        if (doc.exists) {
            currentProfile = doc.data();
            renderProfile(currentProfile);
        }
    } catch (err) {
        console.error("❌ Error loading profile:", err);
    } finally {
        hideLoader();
    }
}

// =============================================================
// ✅ Render Profile UI
// =============================================================
function renderProfile(profile) {
    // Profile + cover photos
    document.querySelector(".coverphoto-container img").src = profile.coverPhoto || "Assets/Images/Cover Photos/default-cover-photo.png";
    document.querySelector(".profilephoto-container img").src = profile.profilePhoto || "Assets/Images/Profile Pictures/default-profile-picture.jpg";

    // Name + roles
    document.querySelector(".name-text-container h1").textContent = profile.fullName || "Your Name";
    document.querySelector(".profile-roles").textContent = profile.roles || "Your Profession";

    // Skills
    const skillsContainer = document.getElementById("skills-content");
    if (skillsContainer) {
        skillsContainer.innerHTML = "";
        (profile.skills || []).forEach(skill => {
            skillsContainer.insertAdjacentHTML("beforeend", `
                <div class="skill-card">
                    <div class="skill-img"><img src="${skill.imageUrl}" alt="${skill.name}"></div>
                    <div class="skill-name">${skill.name}</div>
                </div>
            `);
        });
    }

    // Certificates
    const certContainer = document.getElementById("certificates-content");
    if (certContainer) {
        certContainer.innerHTML = "";
        (profile.certificates || []).forEach(cert => {
            certContainer.insertAdjacentHTML("beforeend", `
                <div class="certificate-card">
                    <div class="certificate-container">
                        <div class="canvas">
                            <div id="card">
                                <div class="prompt-container">
                                    <p id="prompt-title">${cert.title}</p>
                                    <p id="prompt-description">${cert.description}</p>
                                    <p id="prompt-date">${cert.date}</p>
                                </div>
                                <img class="certificate-image" src="${cert.imageUrl}" alt="certificate-photo">
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }
}

// =============================================================
// ✅ Open Profile Edit Form
// =============================================================
function openProfileForm() {
    const formContainer = document.querySelector(".create-card-container-parent");
    if (!formContainer) return;

    formContainer.style.display = "block";

    // Prefill values
    const form = document.getElementById("create-profile-form");
    const nameParts = (currentProfile.fullName || "").split(" ");
    form.querySelectorAll(".input-profile-title")[0].value = nameParts[0] || "";
    form.querySelectorAll(".input-profile-title")[1].value = nameParts[1] || "";
    form.querySelectorAll(".input-profile-title")[2].value = nameParts[2] || "";
    form.querySelector(".input-profile-roles").value = currentProfile.roles || "";

    // Clear dynamic sections
    document.getElementById("skills-forms").innerHTML = "";
    document.getElementById("certificates-forms").innerHTML = "";

    // Load existing skills
    (currentProfile.skills || []).forEach(skill => {
        addSkillForm(skill);
    });

    // Load existing certificates
    (currentProfile.certificates || []).forEach(cert => {
        addCertificateForm(cert);
    });

    // Add new entry buttons
    document.getElementById("add-skill-btn").onclick = () => addSkillForm();
    document.getElementById("add-certificate-btn").onclick = () => addCertificateForm();

    // Cancel button
    const cancelBtn = document.getElementById("cancel-btn");
    cancelBtn.onclick = () => {
        formContainer.style.display = "none";
    };

    // Save button
    const saveBtn = document.getElementById("profile-post-btn");
    saveBtn.onclick = submitProfileForm;
}

// =============================================================
// ✅ Dynamic Skill Forms
// =============================================================
function addSkillForm(skill = {}) {
    const skillsContainer = document.getElementById("skills-forms");
    const skillId = "skill-" + Date.now();
    const div = document.createElement("div");
    div.className = "profile-group-form skill-entry";
    div.innerHTML = `
        <input type="text" class="input-skill-name" placeholder="Skill Name" value="${skill.name || ""}">
        <input type="text" class="input-skill-category" placeholder="Skill Category" value="${skill.category || ""}">
        <input type="file" class="input-skill-photo" accept="image/*">
        ${skill.imageUrl ? `<img src="${skill.imageUrl}" width="60">` : ""}
        <button type="button" class="remove-btn">Remove</button>
    `;
    skillsContainer.appendChild(div);

    div.querySelector(".remove-btn").onclick = () => div.remove();
}

// =============================================================
// ✅ Dynamic Certificate Forms
// =============================================================
function addCertificateForm(cert = {}) {
    const certsContainer = document.getElementById("certificates-forms");
    const div = document.createElement("div");
    div.className = "profile-group-form certificate-entry";
    div.innerHTML = `
        <input type="text" class="input-certificate-title" placeholder="Certificate Title" value="${cert.title || ""}">
        <input type="date" class="input-certificate-date" value="${cert.date || ""}">
        <textarea class="input-certificate-description" placeholder="Description">${cert.description || ""}</textarea>
        <input type="file" class="input-certificate-photo" accept="image/*">
        ${cert.imageUrl ? `<img src="${cert.imageUrl}" width="100">` : ""}
        <button type="button" class="remove-btn">Remove</button>
    `;
    certsContainer.appendChild(div);

    div.querySelector(".remove-btn").onclick = () => div.remove();
}

// =============================================================
// ✅ Submit Profile Form
// =============================================================
async function submitProfileForm() {
    showLoader();
    try {
        const form = document.getElementById("create-profile-form");

        // Collect inputs
        const firstName = form.querySelectorAll(".input-profile-title")[0].value.trim();
        const middleName = form.querySelectorAll(".input-profile-title")[1].value.trim();
        const lastName = form.querySelectorAll(".input-profile-title")[2].value.trim();
        const fullName = `${firstName} ${middleName} ${lastName}`.trim();
        const roles = form.querySelector(".input-profile-roles").value.trim();

        // Profile + cover photo
        const profilePhotoInput = document.getElementById("profile-photo");
        const coverPhotoInput = document.getElementById("cover-photo");

        let profilePhotoUrl = currentProfile.profilePhoto;
        let coverPhotoUrl = currentProfile.coverPhoto;

        if (profilePhotoInput && profilePhotoInput.files.length > 0) {
            const result = await uploadToCloudinary(profilePhotoInput.files[0], "profile");
            profilePhotoUrl = result.imageUrl;
        }
        if (coverPhotoInput && coverPhotoInput.files.length > 0) {
            const result = await uploadToCloudinary(coverPhotoInput.files[0], "cover");
            coverPhotoUrl = result.imageUrl;
        }

        // 🔹 Gather all skills
        const skills = [];
        const skillEntries = document.querySelectorAll(".skill-entry");
        for (let entry of skillEntries) {
            const name = entry.querySelector(".input-skill-name").value;
            const category = entry.querySelector(".input-skill-category").value;
            const fileInput = entry.querySelector(".input-skill-photo");

            let imageUrl = entry.querySelector("img") ? entry.querySelector("img").src : "";
            if (fileInput && fileInput.files.length > 0) {
                const result = await uploadToCloudinary(fileInput.files[0], "skills");
                imageUrl = result.imageUrl;
            }

            if (name) {
                skills.push({ name, category, imageUrl });
            }
        }

        // 🔹 Gather all certificates
        const certificates = [];
        const certEntries = document.querySelectorAll(".certificate-entry");
        for (let entry of certEntries) {
            const title = entry.querySelector(".input-certificate-title").value;
            const date = entry.querySelector(".input-certificate-date").value;
            const description = entry.querySelector(".input-certificate-description").value;
            const fileInput = entry.querySelector(".input-certificate-photo");

            let imageUrl = entry.querySelector("img") ? entry.querySelector("img").src : "";
            if (fileInput && fileInput.files.length > 0) {
                const result = await uploadToCloudinary(fileInput.files[0], "certificates");
                imageUrl = result.imageUrl;
            }

            if (title) {
                certificates.push({ title, date, description, imageUrl });
            }
        }

        // Build profile object
        const newProfile = {
            fullName,
            roles,
            profilePhoto: profilePhotoUrl,
            coverPhoto: coverPhotoUrl,
            skills,
            certificates
        };

        // Save to Firestore
        await db.collection("profile").doc(profileDocId).set(newProfile);

        // Refresh UI
        currentProfile = newProfile;
        renderProfile(newProfile);

        alert("✅ Profile successfully saved!");
        document.querySelector(".create-profile-form-container").style.display = "none";
    } catch (err) {
        console.error("❌ Error saving profile:", err);
        alert("Error saving profile.");
    } finally {
        hideLoader();
    }
}
