firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        applyRoleUI(user);
    } else {
        // if not logged in, kick them to login page
        window.location.href = "/login.html";
    }
});
