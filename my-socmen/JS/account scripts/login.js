// ✅ Import Firebase
import { auth, db } from "../../firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ✅ Define admin accounts
const ADMIN_EMAILS = [
  "toledocarlojohn@gmail.com"
];

// ✅ Session flag for guest
if (!sessionStorage.getItem("guestAssigned")) {
  sessionStorage.setItem("guestAssigned", "false");
}

// ✅ Role-based UI toggle
function applyRoleUI(user) {
  const adminElements = document.querySelectorAll(".admin-only");
  if (user && ADMIN_EMAILS.includes(user.email)) {
    adminElements.forEach(el => el.style.display = "block");
  } else {
    adminElements.forEach(el => el.style.display = "none");
  }
}

// ✅ Google Sign-in
document.getElementById("adminLoginBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Google login error:", err);
  }
});

// ✅ Guest Login
document.getElementById("viewerLoginBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error("Guest login error:", err);
  }
});

// ✅ Email Login (very simple)
document.querySelector(".form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = "defaultPassword"; // ⚠️ replace with real password input if needed

  if (!email) return alert("Please enter an email");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Email login error:", err);
    alert("Email login failed. Did you configure password auth in Firebase?");
  }
});

// ✅ Auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    applyRoleUI(user);

    if (user.isAnonymous) {
      // Guest flow
      if (sessionStorage.getItem("guestAssigned") === "false") {
        const counterRef = doc(db, "meta", "viewerCounter");

        await runTransaction(db, async (tx) => {
          const snap = await tx.get(counterRef);
          let count = snap.exists() ? snap.data().count : 0;
          count++;
          tx.set(counterRef, { count }, { merge: true });

          await setDoc(doc(db, "viewers", `guest-${count}`), {
            name: `Anonymous-${count}`,
            role: "guest",
            loggedAt: serverTimestamp()
          });
        });

        sessionStorage.setItem("guestAssigned", "true");
      }
      console.log("Guest signed in");
      window.location.href = "/activities.html";
    } else if (ADMIN_EMAILS.includes(user.email)) {
      // Admin flow
      await setDoc(doc(db, "viewers", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        role: "admin",
        loggedAt: serverTimestamp()
      }, { merge: true });

      console.log("Admin signed in");
      window.location.href = "/profile.html";
    } else {
      // Viewer flow
      await setDoc(doc(db, "viewers", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(-1)[0] || "",
        role: "viewer",
        loggedAt: serverTimestamp()
      }, { merge: true });

      console.log("Viewer signed in");
      window.location.href = "/activities.html";
    }
  }
});
