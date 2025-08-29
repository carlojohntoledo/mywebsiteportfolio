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

// 🔧 Global helper
function getPageContainer() {
  const page = document.body.dataset.page; // "home", "service", "project"
  return document.querySelector(`.${page}-create-card`);
}
