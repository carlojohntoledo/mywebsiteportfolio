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

