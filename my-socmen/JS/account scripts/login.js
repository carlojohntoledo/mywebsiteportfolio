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
const adminLoginBtn = document.getElementById("adminLoginBtn");
if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .catch(err => console.error("Google login error:", err));
  });
}

// ✅ Guest Login
const viewerLoginBtn = document.getElementById("viewerLoginBtn");
if (viewerLoginBtn) {
  viewerLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    firebase.auth().signInAnonymously()
      .catch(err => console.error("Guest login error:", err));
  });
}

// ✅ Email Login (basic, using Email/Password)
const loginForm = document.querySelector(".form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = "defaultPassword"; // replace with real password auth if needed

    if (!email) return alert("Please enter an email");

    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => {
        console.error("Email login error:", err);
        alert("Email login failed. Make sure password auth is enabled in Firebase.");
      });
  });
}

// ✅ Auth state listener
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  applyRoleUI(user);
  const isLoginPage = window.location.pathname.endsWith("login.html");

  try {
    // 🚨 Register user in Firestore
    if (user.isAnonymous) {
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

    } else if (ADMIN_EMAILS.includes(user.email)) {
      await firebase.firestore().collection("viewers").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        role: "admin",
        loggedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log("Admin signed in");

    } else {
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
    }
  } catch (err) {
    console.error("❌ Firestore logging failed:", err);
  }

  // 🚨 Do redirect once, after everything is done
  if (isLoginPage) {
    setTimeout(() => {
      if (user.isAnonymous) {
        window.location.replace("/activities.html");
      } else if (ADMIN_EMAILS.includes(user.email)) {
        window.location.replace("/profile.html");
      } else {
        window.location.replace("/activities.html");
      }
    }, 300); // give Firebase a short moment before navigating
  }
});



// ✅ Logout button handler
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await firebase.auth().signOut();
        console.log("✅ User logged out");
        window.location.href = "/login.html";
      } catch (err) {
        console.error("❌ Logout failed:", err);
        alert("Logout failed. Try again.");
      }
    });
  }
});
