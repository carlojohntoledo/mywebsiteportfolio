// =============================================================
// ✅ Helper: Compress large images before upload
// =============================================================
async function compressImage(file, maxMB = 2, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) return resolve(file); // not an image → skip

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Scale image down if too large (target max width/height ~2000px)
            const MAX_SIZE = 2000;
            let { width, height } = img;
            if (width > height && width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Compression failed"));
                    // Force JPEG output
                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, ".jpg"),
                        { type: "image/jpeg" }
                    );
                    resolve(compressedFile);
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// =============================================================
// ✅ Upload a single file to Cloudinary
//    - Supports projects, services, activities, profile
//    - Profile supports sub-folders: profile-pictures, cover-photos,
//      certificates, skills-logo
// =============================================================
async function uploadToCloudinary(file, type = "projects", folder = "") {
    const url = `https://api.cloudinary.com/v1_1/dglegfflv/upload`;
    const formData = new FormData();

    // ✅ Compress before upload
    const compressed = await compressImage(file);
    formData.append("file", compressed);

    // ✅ Map presets per type
    const presetMap = {
        projects: "mysocmed_projects",
        services: "mysocmed_services",
        activities: "mysocmed_activities",
        profile: "mysocmed_profile" // 🔥 NEW preset for profile
    };

    // ✅ Default to projects if no match
    formData.append("upload_preset", presetMap[type] || "mysocmed_projects");

    // ✅ Optional: send folder for better organization
    if (folder) {
        formData.append("folder", folder); 
        // Example: "mysocmed/profile/profile-pictures"
    }

    const response = await fetch(url, { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok || data.error) {
        console.error("❌ Cloudinary Upload Error:", data.error);
        throw new Error(data.error?.message || "Upload failed");
    }

    return {
        imageUrl: data.secure_url || "",
        publicId: data.public_id || ""
    };
}
