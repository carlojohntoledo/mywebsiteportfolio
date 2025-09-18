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

  if (user && !user.isAnonymous && ADMIN_EMAILS.includes(user.email)) {
    // Admin → show
    adminElements.forEach(el => el.style.display = "block");
    document.body.classList.add("admin");
  } else {
    // Guest or viewer → hide
    adminElements.forEach(el => el.style.display = "none");
    document.body.classList.remove("admin");
  }
}


// ✅ Google Sign-in
document.getElementById("adminLoginBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .catch(err => console.error("Google login error:", err));
});

// ✅ Guest Login
document.getElementById("viewerLoginBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  firebase.auth().signInAnonymously()
    .catch(err => console.error("Guest login error:", err));
});

// ✅ Email Login (basic, using Email/Password)
document.querySelector(".form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = "defaultPassword"; // Replace if using real passwords

  if (!email) return alert("Please enter an email");

  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(err => {
      console.error("Email login error:", err);
      alert("Email login failed. Make sure password auth is enabled in Firebase.");
    });
});

// ✅ Auth state listener
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    applyRoleUI(user);

    if (user.isAnonymous) {
      // Guest flow
      if (sessionStorage.getItem("guestAssigned") === "false") {
        const counterRef = firebase.firestore().collection("meta").doc("viewerCounter");

        await firebase.firestore().runTransaction(async (tx) => {
          const doc = await tx.get(counterRef);
          let count = doc.exists ? doc.data().count : 0;
          count++;
          tx.set(counterRef, { count }, { merge: true });

          await firebase.firestore().collection("viewers").add({
            name: `Anonymous-${count}`,
            role: "guest",
            loggedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        sessionStorage.setItem("guestAssigned", "true");
      }
      console.log("Guest signed in");
      window.location.href = "/activities.html";

    } else if (ADMIN_EMAILS.includes(user.email)) {
      // Admin flow
      await firebase.firestore().collection("viewers").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        role: "admin",
        loggedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log("Admin signed in");
      window.location.href = "/profile.html";

    } else {
      // Viewer flow
      await firebase.firestore().collection("viewers").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(-1)[0] || "",
        role: "viewer",
        loggedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log("Viewer signed in");
      window.location.href = "/activities.html";
    }
  }
});

// Logout button event
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await firebase.auth().signOut();
      console.log("✅ User logged out");
      // Redirect to login page after logout
      window.location.href = "/login.html";
    } catch (err) {
      console.error("❌ Logout failed:", err);
      alert("Logout failed. Try again.");
    }
  });
}
