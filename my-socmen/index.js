// 1️⃣ Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAqIrj2qzOCCH-121R7bKTC7V7txPm7yl8",
    authDomain: "my-socmed-bea3a.firebaseapp.com",
    projectId: "my-socmed-bea3a",
    storageBucket: "my-socmed-bea3a.firebasestorage.app",
    messagingSenderId: "530230105836",
    appId: "1:530230105836:web:e329797c9ed468d0ef77c9"
};

// 2️⃣ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 3️⃣ Firestore
const db = firebase.firestore();

// 4️⃣ Functions (⚠️ this line was missing before)
const functions = firebase.app().functions("asia-southeast1"); 
// replace "asia-southeast1" with your actual region

// 5️⃣ Cloud Function delete
async function deleteFromCloudinary(publicId) {
    const callable = functions.httpsCallable("deleteFromCloudinary");
    return await callable({ public_id: publicId });
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

