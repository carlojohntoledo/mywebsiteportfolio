// ✅ Upload a single file to Cloudinary
async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/dglegfflv/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mysocmed_projects");
    formData.append("folder", "mysocmed/projects");

    try {
        const response = await fetch(url, { method: "POST", body: formData });
        const data = await response.json();

        // ✅ Always return the same keys
        return {
            imageUrl: data.secure_url,   // string → use for <img src="">
            publicId: data.public_id     // string → use for deletion
        };
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return null;
    }
}