// ============================================================
// ✅ Profile Edit Form – Inject dynamically & handle logic
// ============================================================

// --- Firestore + Cloudinary config ---
const PROFILE_COLLECTION = "profile"; // Firestore collection
const CLOUDINARY_FOLDER = {
  profile: "profile-pictures",
  cover: "cover-photos",
  skill: "skills-logo",
  certificate: "certificates",
};

// ================================
// Toggle open profile form
// ================================
function openProfileForm(data = {}) {
  const containerParent = document.querySelector(".create-card-container-parent");
  if (!containerParent) return;

  // inject form
  containerParent.innerHTML = getProfileFormTemplate(data);
  containerParent.style.display = "grid";

  // bind handlers
  bindProfileFormHandlers(data);
}

// ================================
// Build Form HTML
// ================================
function getProfileFormTemplate(data = {}) {
  return `
  <div class="create-post-container">
    <div class="card">
      <div class="card-title">Edit Profile</div>
      <div class="card-body">
        
        <!-- Profile Photo -->
        <div class="form-group">
          <label>Profile Photo</label>
          <input type="file" id="profile-photo-input" accept="image/*">
          <div class="preview" id="profile-photo-preview">
            <img src="${data.profilePhoto || 'Assets/Images/default-profile.png'}" alt="Profile Preview">
          </div>
        </div>

        <!-- Cover Photo -->
        <div class="form-group">
          <label>Cover Photo</label>
          <input type="file" id="cover-photo-input" accept="image/*">
          <div class="preview" id="cover-photo-preview">
            <img src="${data.coverPhoto || 'Assets/Images/default-cover.png'}" alt="Cover Preview">
          </div>
        </div>

        <!-- Skills -->
        <div class="form-group">
          <label>Skills</label>
          <div id="skills-container"></div>
          <button type="button" id="add-skill-btn">+ Add Skill</button>
        </div>

        <!-- Certificates -->
        <div class="form-group">
          <label>Certificates</label>
          <div id="certificates-container"></div>
          <button type="button" id="add-cert-btn">+ Add Certificate</button>
        </div>

      </div>
      <div class="card-footer">
        <button id="save-profile-btn">Save</button>
        <button id="cancel-profile-btn">Cancel</button>
      </div>
    </div>
  </div>
  `;
}

// ================================
// Add Skill / Cert Groups
// ================================
function createSkillGroup(skill = {}) {
  return `
    <div class="group skill-group">
      <input type="text" class="skill-name" placeholder="Skill name" value="${skill.name || ""}">
      <input type="file" class="skill-logo-input" accept="image/*">
      <div class="preview"><img src="${skill.logo || 'Assets/Images/default-skill.png'}"></div>
      <button type="button" class="remove-group">×</button>
    </div>
  `;
}

function createCertGroup(cert = {}) {
  return `
    <div class="group cert-group">
      <input type="text" class="cert-name" placeholder="Certificate name" value="${cert.name || ""}">
      <input type="file" class="cert-logo-input" accept="image/*">
      <div class="preview"><img src="${cert.logo || 'Assets/Images/default-cert.png'}"></div>
      <button type="button" class="remove-group">×</button>
    </div>
  `;
}

// ================================
// Bind Handlers
// ================================
function bindProfileFormHandlers(data) {
  const parent = document.querySelector(".create-post-container");
  if (!parent) return;

  // Profile / Cover preview
  setupSinglePreview("#profile-photo-input", "#profile-photo-preview img");
  setupSinglePreview("#cover-photo-input", "#cover-photo-preview img");

  // Skills
  const skillsContainer = parent.querySelector("#skills-container");
  parent.querySelector("#add-skill-btn").onclick = () => {
    skillsContainer.insertAdjacentHTML("beforeend", createSkillGroup());
    bindDynamicPreview(skillsContainer, ".skill-logo-input", "img");
  };

  // Certificates
  const certContainer = parent.querySelector("#certificates-container");
  parent.querySelector("#add-cert-btn").onclick = () => {
    certContainer.insertAdjacentHTML("beforeend", createCertGroup());
    bindDynamicPreview(certContainer, ".cert-logo-input", "img");
  };

  // Delegated remove
  parent.addEventListener("click", e => {
    if (e.target.classList.contains("remove-group")) {
      e.target.closest(".group").remove();
    }
  });

  // Save
  parent.querySelector("#save-profile-btn").onclick = () => saveProfile(data.id);

  // Cancel
  parent.querySelector("#cancel-profile-btn").onclick = () => {
    parent.remove();
    document.querySelector(".create-card-container-parent").style.display = "none";
  };
}

// ================================
// Preview helpers
// ================================
function setupSinglePreview(inputSel, imgSel) {
  const input = document.querySelector(inputSel);
  const img = document.querySelector(imgSel);
  if (!input || !img) return;

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => img.src = e.target.result;
    reader.readAsDataURL(file);
  };
}

function bindDynamicPreview(container, inputSel, imgSel) {
  const inputs = container.querySelectorAll(inputSel);
  inputs.forEach(input => {
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const img = input.closest(".group").querySelector(imgSel);
      const reader = new FileReader();
      reader.onload = e => img.src = e.target.result;
      reader.readAsDataURL(file);
    };
  });
}

// ================================
// Save profile
// ================================
async function saveProfile(uid) {
  const parent = document.querySelector(".create-post-container");
  if (!parent) return;

  const profileInput = parent.querySelector("#profile-photo-input").files[0];
  const coverInput = parent.querySelector("#cover-photo-input").files[0];

  // Upload profile + cover
  const profileUrl = profileInput ? (await uploadToCloudinary(profileInput, "profile")).imageUrl : document.querySelector("#profile-photo-preview img").src;
  const coverUrl = coverInput ? (await uploadToCloudinary(coverInput, "cover")).imageUrl : document.querySelector("#cover-photo-preview img").src;

  // Skills
  const skills = [];
  for (let group of parent.querySelectorAll(".skill-group")) {
    const name = group.querySelector(".skill-name").value;
    const file = group.querySelector(".skill-logo-input").files[0];
    const imgEl = group.querySelector("img");
    let logo = imgEl.src;

    if (file) {
      const res = await uploadToCloudinary(file, "skill");
      logo = res.imageUrl;
    }
    skills.push({ name, logo });
  }

  // Certificates
  const certificates = [];
  for (let group of parent.querySelectorAll(".cert-group")) {
    const name = group.querySelector(".cert-name").value;
    const file = group.querySelector(".cert-logo-input").files[0];
    const imgEl = group.querySelector("img");
    let logo = imgEl.src;

    if (file) {
      const res = await uploadToCloudinary(file, "certificate");
      logo = res.imageUrl;
    }
    certificates.push({ name, logo });
  }

  // Save to Firestore
  await db.collection(PROFILE_COLLECTION).doc(uid || "default").set({
    profilePhoto: profileUrl,
    coverPhoto: coverUrl,
    skills,
    certificates,
    updatedAt: new Date(),
  }, { merge: true });

  alert("✅ Profile saved!");
  parent.remove();
  document.querySelector(".create-card-container-parent").style.display = "none";
}
// ============================================================
// Open form when "Edit Profile" button is clicked
// ============================================================
document.addEventListener("click", async (e) => {
  if (e.target.id === "edit-profile-button") {
    // 🔹 Optionally fetch the current profile data from Firestore
    let data = {};
    try {
      const doc = await db.collection(PROFILE_COLLECTION).doc("default").get();
      if (doc.exists) data = doc.data();
    } catch (err) {
      console.error("Error loading profile:", err);
    }

    // 🔹 Open form with existing profile data
    openProfileForm(data);
  }
});
