// 1️⃣ Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqIrj2qzOCCH-121R7bKTC7V7txPm7yl8", // typo fixed: apiKey not aapiKey
    authDomain: "my-socmed-bea3a.firebaseapp.com",
    projectId: "my-socmed-bea3a",
    storageBucket: "my-socmed-bea3a.firebasestorage.app",
    messagingSenderId: "530230105836",
    appId: "1:530230105836:web:e329797c9ed468d0ef77c9"
};

// 2️⃣ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 3️⃣ Initialize Firestore
const db = firebase.firestore();

// Call cloud function
// =============================================================
// ✅ Delete from Cloudinary via Express Server (Render)
// =============================================================
async function deleteFromCloudinary(publicId) {
    try {
        const response = await fetch("https://mywebsiteportfolio-l0gc.onrender.com/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ public_id: publicId })
        });

        const data = await response.json();

        if (!data.success) {
            console.error("❌ Cloudinary deletion failed:", data.error);
        } else {
            console.log("✅ Cloudinary deletion success:", data.result);
        }
    } catch (err) {
        console.error("Error calling Cloudinary delete API:", err);
    }
}


async function saveProjectToFirestore(projectData) {
    try {
        const docRef = await db.collection("projects").add(projectData);
        console.log("Project saved with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error saving project to Firestore:", error);
        return null;
    }
}


const page = document.body.dataset.page;
const singularMap = {
    projects: "Project",
    services: "Service",
    activities: "Activity"
};
const singular = singularMap[page] || page; // fallback
const plural = singular + "s"; // just in case you need plural again

// 🔧 Global helper
function getPageContainer() {

    return document.querySelector(`.${page}-create-card`);

}

// =============================================================
// Helper: Format timestamps into "time ago"
// =============================================================
function formatTimeAgo(timestamp) {
    if (!timestamp) return "";
    let date;

    // Firestore timestamps → JS Date
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }

    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;

    // Check if it's the same year
    const optionsShort = { month: "short", day: "numeric" };
    const optionsLong = { month: "short", day: "numeric", year: "numeric" };
    return date.getFullYear() === now.getFullYear()
        ? date.toLocaleDateString(undefined, optionsShort)
        : date.toLocaleDateString(undefined, optionsLong);
}


// =============================================================
// Helper: Render images in grid for activities (with hidden extras)
// =============================================================
function renderActivityImages(images) {
    if (!images || images.length === 0) return "";

    const urls = images.map(img =>
        typeof img === "string"
            ? img
            : img.imageUrl || img.url || img.secure_url || ""
    ).filter(Boolean);

    if (urls.length === 0) return "";

    let html = "";
    const count = urls.length;

    if (count === 1) {
        html = `<div class="grid-1"><img src="${urls[0]}" alt="activity image"></div>`;
    } else if (count === 2) {
        html = `<div class="grid-2">
                  <img src="${urls[0]}" alt="">
                  <img src="${urls[1]}" alt="">
                </div>`;
    } else if (count === 3) {
        html = `<div class="grid-3">
                  <div class="big"><img src="${urls[0]}" alt=""></div>
                  <div class="small">
                    <img src="${urls[1]}" alt="">
                    <img src="${urls[2]}" alt="">
                  </div>
                </div>`;
    } else if (count === 4) {
        html = `<div class="grid-4">
                  ${urls.map(u => `<img src="${u}" alt="">`).join("")}
                </div>`;
    } else {
        // 5+ → show first 4, overlay on 4th, hide the rest
        const extra = count - 4;
        html = `<div class="grid-5">
                  <img src="${urls[0]}" alt="">
                  <img src="${urls[1]}" alt="">
                  <img src="${urls[2]}" alt="">
                  <div class="overlay-wrapper">
                    <img src="${urls[3]}" alt="">
                    <div class="overlay">+${extra}</div>
                  </div>
                  ${urls.slice(4).map(u => `<img src="${u}" alt="" style="display:none;">`).join("")}
                </div>`;
    }

    return `<div class="activity-images">${html}</div>`;
}

// ================= LIGHTBOX SCRIPT =================
(function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    let images = [];   // all images in the current post
    let currentIndex = 0;

    // Open lightbox
    function openLightbox(imgList, index) {
        images = imgList;
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.classList.remove("hidden");

        // ✅ Hide/show navigation buttons
        if (images.length <= 1) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        } else {
            prevBtn.style.display = "";
            nextBtn.style.display = "";
        }
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.add("hidden");
        images = [];
        currentIndex = 0;
    }

    // Navigate
    function showPrev() {
        if (images.length <= 1) return; // prevent navigation when only 1 image
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function showNext() {
        if (images.length <= 1) return; // prevent navigation when only 1 image
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    // Event listeners
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (lightbox.classList.contains("hidden")) return;
        if (e.key === "Escape") closeLightbox();
        if (images.length <= 1) return; // ✅ disable arrow keys when only 1 image
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
    });

    // Attach click handlers to activity, project, service, and certificate images dynamically
    document.body.addEventListener("click", function (e) {
        // Case 1: Activity grid
        const img = e.target.closest(".activity-images img, .projects-image-container img, .services-image-container img, .profilephoto-container img");
        if (img) {
            const activityContainer = img.closest(".activity-images");
            if (activityContainer) {
                const imgEls = activityContainer.querySelectorAll("img");
                const imgList = Array.from(imgEls).map(el => el.src);
                const index = imgList.indexOf(img.src);
                openLightbox(imgList, index);
                return;
            }

            if (carouselData.has(img)) {
                const data = carouselData.get(img);
                openLightbox(data.urls, data.index); // ✅ full list + current index
                return;
            }
        }

        // Case 2: Certificates (catch clicks on trackers OR image)
        const certCard = e.target.closest(".certificate-card");
        if (certCard) {

            if (e.target.classList.contains("certificate-card-remove")) {
                handleCertificateRemove(e);
                return; // ⛔ stop lightbox
            }

            const certImg = certCard.querySelector("img.certificate-image");
            if (!certImg) return;

            // always 1 image per certificate
            openLightbox([certImg.src], 0);
            return;
        }

        // Case 3: Intro (cover photo & profile photo)
        const coverImg = e.target.closest(".coverphoto-container img");
        if (coverImg) {
            openLightbox([coverImg.src], 0);
            return;
        }

        const profileImg = e.target.closest(".profilephoto-container img");
        if (profileImg) {
            openLightbox([profileImg.src], 0);
            return;
        }
    });

})();

// ================= profile-photo-loader.js =================
// Loads current user's profile photo from Firestore and updates all pages that use it

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const docRef = db.collection("profile").doc("user"); // update if your doc ID differs
        const doc = await docRef.get();
        if (!doc.exists) {
            console.log("ℹ️ Profile doc not found, using default profile photo.");
            return;
        }

        const data = doc.data() || {};
        const profilePhotoUrl = data.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";

        // Find all img elements that should show profile photo
        // Add a shared class "profile-photo" to all of them in your HTML
        const imgs = document.querySelectorAll("img.profile-photo");
        imgs.forEach(img => {
            img.src = profilePhotoUrl;
        });
    } catch (err) {
        console.error("❌ Error loading profile photo:", err);
    }
});

async function getProfilePhotoUrl() {
    try {
        const docRef = db.collection("profile").doc("user"); // adjust doc id
        const doc = await docRef.get();
        if (!doc.exists) return "Assets/Images/Profile Pictures/default-profile-picture.jpg";
        const data = doc.data();
        return data.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";
    } catch (err) {
        console.error("❌ Error fetching profile photo:", err);
        return "Assets/Images/Profile Pictures/default-profile-picture.jpg";
    }
}

// =============================================================
// ================= Prefill top-of-page profile ==============
// =============================================================
/**
 * prefillProfileDisplay()
 * Loads the profile doc and populates the visible profile fields at top of page.
 * Called on DOMContentLoaded and after profile save.
 */

function getProfileDisplayElements() {
    return {
        nameEl: document.getElementById("profile-name") || document.querySelector(".name-text-container-cont h1"),
        rolesEl: document.querySelector(".profile-roles"),
        profileImgEl: document.querySelector(".profilephoto-container img"),
        coverImgEl: document.querySelector(".coverphoto-container img")
    };
}

async function prefillProfileDisplay() {
    try {
        const { nameEl, rolesEl, profileImgEl, coverImgEl } = getProfileDisplayElements();

        const docRef = db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID);
        const doc = await docRef.get();
        if (!doc.exists) {
            console.log("ℹ️ Profile doc not found (prefill display)");
            return;
        }

        const data = doc.data() || {};

        // Build full name
        const firstname = data.firstname || "";
        const middlename = data.middlename ? ` ${data.middlename}` : "";
        const lastname = data.lastname ? ` ${data.lastname}` : "";
        const fullName = `${firstname}${middlename}${lastname}`.trim() || nameEl?.textContent || "";

        // --- Update "main" display elements
        if (nameEl) nameEl.textContent = fullName;
        if (rolesEl) rolesEl.textContent = data.roles || rolesEl?.textContent || "";

        if (profileImgEl) {
            profileImgEl.src = data.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";
        }
        if (coverImgEl) {
            coverImgEl.src = data.coverPhotoUrl || "Assets/Images/Cover Photos/default-cover-photo.png";
        }

        // --- NEW: Update all shared elements across pages
        document.querySelectorAll(".profile-name").forEach(el => {
            el.textContent = fullName;
        });
        document.querySelectorAll(".profile-role").forEach(el => {
            el.textContent = data.roles || "";
        });
        document.querySelectorAll("img.profile-photo").forEach(img => {
            img.src = data.profilePhotoUrl || "Assets/Images/Profile Pictures/default-profile-picture.jpg";
        });
        document.querySelectorAll("img.cover-photo").forEach(img => {
            img.src = data.coverPhotoUrl || "Assets/Images/Cover Photos/default-cover-photo.png";
        });

    } catch (err) {
        console.error("❌ Error pre-filling profile display:", err);
    }
}

// ================= profile-utils.js =================
// Returns the full name (First Middle Last) from Firestore profile doc

async function getProfileFullName() {
    try {
        const docRef = db.collection("profile").doc("user"); // same as photo function
        const doc = await docRef.get();
        if (!doc.exists) return "";

        const data = doc.data() || {};
        const firstname = data.firstName || data.firstname || "";
        const middlename = data.middleName || data.middlename || "";
        const lastname = data.lastName || data.lastname || "";

        return [firstname, middlename, lastname].filter(Boolean).join(" ");
    } catch (err) {
        console.error("❌ Error fetching profile full name:", err);
        return "";
    }
}

function showMenuNav() {
    const menuNav = document.querySelector(".menu-nav");

    const bodyData = document.body.getAttribute("data-page");

    menuNav.innerHTML = `
        <div class="logo-panel blue-bordered">
        <!-- From Uiverse.io by satyamchaudharydev -->
        <button class="logo" data-text="Awesome">
            <span class="actual-text">&nbsp;KOALO&nbsp;</span>
            <span aria-hidden="true" class="hover-text">&nbsp;KOALO&nbsp;</span>
        </button>
    </div>
    <div class="menu-btn-panel blue-bordered">
        <div class="radio-inputs">
            <label class="menu-radio" data-href="index.html">
            <input name="radio" type="radio" ${bodyData === "activities" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path d="M4,8.931V20a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V8.931a1,1,0,0,0-.441-.828L12,3,4.441,8.1A1,1,0,0,0,4,8.931ZM10,14a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v5H10Z"></path>
                    </g>
                </svg>
                <span class="name">Activity</span>
            </label>
            <label class="menu-radio" data-href="profile.html">
                <input name="radio" type="radio" ${bodyData === "profile" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <path fill="#ffffff" d="M9 0a9 9 0 0 0-9 9 8.654 8.654 0 0 0 .05.92 9 9 0 0 0 17.9 0A8.654 8.654 0 0 0 18 9a9 9 0 0 0-9-9zm5.42 13.42c-.01 0-.06.08-.07.08a6.975 6.975 0 0 1-10.7 0c-.01 0-.06-.08-.07-.08a.512.512 0 0 1-.09-.27.522.522 0 0 1 .34-.48c.74-.25 1.45-.49 1.65-.54a.16.16 0 0 1 .03-.13.49.49 0 0 1 .43-.36l1.27-.1a2.077 2.077 0 0 0-.19-.79v-.01a2.814 2.814 0 0 0-.45-.78 3.83 3.83 0 0 1-.79-2.38A3.38 3.38 0 0 1 8.88 4h.24a3.38 3.38 0 0 1 3.1 3.58 3.83 3.83 0 0 1-.79 2.38 2.814 2.814 0 0 0-.45.78v.01a2.077 2.077 0 0 0-.19.79l1.27.1a.49.49 0 0 1 .43.36.16.16 0 0 1 .03.13c.2.05.91.29 1.65.54a.49.49 0 0 1 .25.75z"></path> 
                    </g>
                </svg>
                <span class="name">Profile</span>
            </label>
            <label class="menu-radio" data-href="services.html">
                <input name="radio" type="radio" ${bodyData === "services" ? "checked" : ""}/>
                <svg class="menu-icon" id="menu-service-icon" width="2rem" height="2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <g> 
                            <path d="M14.121 10.48a1 1 0 0 0-1.414 0l-.707.706a2 2 0 1 1-2.828-2.828l5.63-5.632a6.5 6.5 0 0 1 6.377 10.568l-2.108 2.135-4.95-4.95zM3.161 4.468a6.503 6.503 0 0 1 8.009-.938L7.757 6.944a4 4 0 0 0 5.513 5.794l.144-.137 4.243 4.242-4.243 4.243a2 2 0 0 1-2.828 0L3.16 13.66a6.5 6.5 0 0 1 0-9.192z"></path> 
                        </g> 
                    </g>
                </svg>
                <span class="name">Services</span>
            </label>
            <label class="menu-radio" data-href="projects.html">
                <input name="radio" type="radio" ${bodyData === "projects" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.4 3h13.2A2.4 2.4 0 0 1 21 5.4v13.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 18.6V5.4A2.4 2.4 0 0 1 5.4 3ZM9 4h2v5h9v2h-9v9H9v-9H4V9h5V4Z" fill="#ffffff"></path>
                    </g>
                </svg>
                <span class="name">Projects</span>
            </label>
        </div>

    </div>
    <div class="extras-panel blue-bordered">

        <div class="extras-dropdown-button-container">
            <input hidden="" class="check-icon" id="check-icon" name="check-icon" type="checkbox">
            <label class="icon-menu" for="check-icon">
                <div class="bar bar--1"></div>
                <div class="bar bar--2"></div>
                <div class="bar bar--3"></div>
            </label>
            <!-- Popup -->
            <div class="extras-popup">
                <h2>MENU</h2>
                <ul>
                    <div class="search-section red-bordered" style="background-color: transparent;">
                        <div class="search-container">
                            <svg class="search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
                                alt="search icon">
                                <path
                                    d="M46.599 46.599a4.498 4.498 0 0 1-6.363 0l-7.941-7.941C29.028 40.749 25.167 42 21 42 9.402 42 0 32.598 0 21S9.402 0 21 0s21 9.402 21 21c0 4.167-1.251 8.028-3.342 11.295l7.941 7.941a4.498 4.498 0 0 1 0 6.363zM21 6C12.717 6 6 12.714 6 21s6.717 15 15 15c8.286 0 15-6.714 15-15S29.286 6 21 6z">
                                </path>
                            </svg>
                            <input class="inputBox" id="inputBox" type="text" placeholder="Search">
                        </div>
                    </div>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <hr>
                    </hr>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                </ul>
            </div>
        </div>
    </div>

    `;

    const radios = menuNav.querySelectorAll(".menu-radio");
    radios.forEach(label => {
        label.addEventListener("click", () => {
            const href = label.getAttribute("data-href");
            if (href) {
                window.location.href = href;
            }
        });
    });
}

showMenuNav();