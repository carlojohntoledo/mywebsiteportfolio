// ✅ Helper: Compress large images before upload
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

// ✅ Upload a single file to Cloudinary
async function uploadToCloudinary(file, type = "projects") {
    try {
        if (!["projects", "services", "activities"].includes(type)) {
            console.warn(`⚠️ Unknown type "${type}", defaulting to projects`);
            type = "projects";
        }

        console.log(`📤 Uploading to Cloudinary (${type}):`, file.name);

        const url = `https://api.cloudinary.com/v1_1/dglegfflv/upload`;
        const formData = new FormData();
        formData.append("file", file);

        const presetMap = {
            projects: "mysocmed_projects",
            services: "mysocmed_services",
            activities: "mysocmed_activities"
        };

        formData.append("upload_preset", presetMap[type]);
        formData.append("folder", `mysocmed/${type}`);

        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok) {
            console.error("❌ Cloudinary upload failed:", response.status, await response.text());
            return null;
        }

        const data = await response.json();

        return {
            imageUrl: data.secure_url || "",
            publicId: data.public_id || ""
        };
    } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        return null;
    }
}

