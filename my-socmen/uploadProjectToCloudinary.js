async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/dglegfflv/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mysocmed_projects");
    formData.append("folder", "mysocmed/projects"); // specify folder

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        // Returns the image URL after successful upload
        return data.secure_url;
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return null;
    }
}
loadProjectsFromFirestore();