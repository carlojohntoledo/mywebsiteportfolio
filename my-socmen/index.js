// 1️⃣ Your Firebase configuration
const firebaseConfig = {
    aapiKey: "AIzaSyAqIrj2qzOCCH-121R7bKTC7V7txPm7yl8",
    authDomain: "my-socmed-bea3a.firebaseapp.com",
    projectId: "my-socmed-bea3a",
    storageBucket: "my-socmed-bea3a.firebasestorage.app",
    messagingSenderId: "530230105836",
    appId: "1:530230105836:web:e329797c9ed468d0ef77c9"
};

// 2️⃣ Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// 3️⃣ Initialize Firestore
const db = firebase.firestore();

async function saveProjectToFirestore(projectData) {
    try {
        const db = firebase.firestore(); // or getFirestore() if using modular SDK
        const docRef = await db.collection("projects").add(projectData);
        console.log("Project saved with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error saving project to Firestore:", error);
        return null;
    }
}
