firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!user) {
        // not logged in → always send to login page
        if (!isLoginPage) {
            window.location.replace("/login.html");
        }
        return;
    }

    // already logged in → if they try to access login page, push them out
    if (isLoginPage) {
        // don't decide here, let login.js handle redirect
        return;
    }

    // otherwise just apply UI roles, no navigation
    applyRoleUI(user);
});
