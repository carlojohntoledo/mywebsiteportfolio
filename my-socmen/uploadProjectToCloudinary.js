async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/dglegfflv/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mysocmed_projects");
    formData.append("folder", "mysocmed/projects");

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        // ✅ Save both URL and public_id
        return {
            url: data.secure_url,
            public_id: data.public_id
        };
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return null;
    }
}
