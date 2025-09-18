firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // redirect to login if not signed in
        window.location.href = "login.html";
    }
});
