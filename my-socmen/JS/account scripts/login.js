import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const tokenResult = await userCredential.user.getIdTokenResult();
  
  if (tokenResult.claims.admin) {
    console.log("Admin mode enabled");
    document.body.classList.add("admin-mode"); // Show admin UI
  } else {
    console.log("Viewer mode");
  }
}
