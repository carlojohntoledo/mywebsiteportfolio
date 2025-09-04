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


// ================= helpers.js =================
// Returns full name string from profile collection

async function getProfileFullName() {
    try {
        const docRef = db.collection("profile").doc("user"); // adjust doc ID if needed
        const doc = await docRef.get();
        if (!doc.exists) return "Unknown User";

        const data = doc.data() || {};
        const firstName = data.firstName || "";
        const middleName = data.middleName || "";
        const lastName = data.lastName || "";

        return [firstName, middleName, lastName]
            .filter(Boolean) // remove empty parts
            .join(" ");      // "Carlo John Toledo"
    } catch (err) {
        console.error("❌ Error fetching profile name:", err);
        return "Unknown User";
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
        const docRef = db.collection(PROFILE_DOC_COLLECTION).doc(PROFILE_DOC_ID);
        const doc = await docRef.get();
        if (!doc.exists) return "";

        const data = doc.data() || {};
        const firstname = data.firstname || "";
        const middlename = data.middlename ? ` ${data.middlename}` : "";
        const lastname = data.lastname ? ` ${data.lastname}` : "";
        return `${firstname}${middlename}${lastname}`.trim();
    } catch (err) {
        console.error("❌ Error fetching profile full name:", err);
        return "";
    }
}
