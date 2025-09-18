import { auth, googleProvider, signInWithPopup, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ✅ Define admin accounts
const ADMIN_EMAILS = [
  "toledocarlojohn@gmail.com" // your admin account
];

// ✅ Session flag for guest
if (!sessionStorage.getItem("role")) {
  sessionStorage.setItem("role", "guest");
}

// ✅ Role-based UI toggle
function applyRoleUI(user) {
  const adminElements = document.querySelectorAll(".admin-only");

  if (user && ADMIN_EMAILS.includes(user.email)) {
    sessionStorage.setItem("role", "admin");
    adminElements.forEach(el => el.style.display = ""); // show admin-only
  } else {
    sessionStorage.setItem("role", "guest");
    adminElements.forEach(el => el.style.display = "none"); // hide admin-only
  }
}

// ✅ Google Login (Admin)
document.getElementById("google-login")?.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (ADMIN_EMAILS.includes(user.email)) {
      sessionStorage.setItem("role", "admin");
      window.location.href = "activities.html"; // redirect after login
    } else {
      alert("⚠️ This Google account is not authorized as admin.");
      await auth.signOut();
    }
  } catch (error) {
    console.error("❌ Google login error:", error);
  }
});

// ✅ Guest Login (Anonymous)
document.getElementById("guest-login")?.addEventListener("click", async () => {
  try {
    await signInAnonymously(auth);
    sessionStorage.setItem("role", "guest");
    window.location.href = "activities.html"; // redirect after login
  } catch (error) {
    console.error("❌ Guest login error:", error);
  }
});

// ✅ Logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  try {
    await auth.signOut();
    sessionStorage.clear();
    window.location.href = "login.html";
  } catch (error) {
    console.error("❌ Logout error:", error);
  }
});

// ✅ Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in → always redirect to login
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
  } else {
    // logged in → apply role UI
    applyRoleUI(user);
  }
});
