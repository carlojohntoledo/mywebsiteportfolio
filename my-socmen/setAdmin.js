const admin = require("firebase-admin");

// Path to your downloaded service account JSON
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with the UID you copied earlier
const uid = "xjKEREW26gQX12V2GZQEyhPqV7y1";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Admin claim set successfully!");
    process.exit();
  })
  .catch(err => {
    console.error("Error setting admin claim:", err);
    process.exit(1);
  });
