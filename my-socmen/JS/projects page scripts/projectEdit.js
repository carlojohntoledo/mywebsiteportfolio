// =============================================================
// ✅ Open Form (Create or Edit)
// =============================================================
function openPostForm(type = "projects", mode = "create", postData = {}, postId = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-wrapper");
    document.body.appendChild(wrapper);

    // ✅ Inject your existing Create Post HTML form here
    wrapper.innerHTML = getCreatePostFormHTML(type);

    const form = wrapper.querySelector("form");
    const saveBtn = form.querySelector(".submit-btn");

    // If editing, populate fields
    if (mode === "edit" && postData) {
        form.querySelector("#title").value = postData.title || "";
        form.querySelector("#description").value = postData.description || "";
        form.querySelector("#date").value = postData.date || "";
        form.querySelector("#tags").value = (postData.tags || []).join(", ");
        form.querySelector("#status").value = postData.status || "";
        form.querySelector("#pdfLink").value = postData.pdfLink || "";
        form.querySelector("#projectLink").value = postData.projectLink || "";

        // Preview images
        if (postData.images && postData.images.length > 0) {
            const previewContainer = wrapper.querySelector(".file-preview-container");
            previewContainer.innerHTML = "";
            postData.images.forEach((img, index) => {
                const filePreview = document.createElement("div");
                filePreview.classList.add("file-preview");
                filePreview.innerHTML = `
                    <div class="image-preview">
                        <img src="${img.url || img}" alt="Preview ${index+1}">
                    </div>
                    <button type="button" class="remove-preview">&times;</button>
                `;
                previewContainer.appendChild(filePreview);
            });
        }

        // Change button label
        saveBtn.textContent = "Save Changes";
    }

    // Handle form submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showLoader();

        const formData = {
            title: form.querySelector("#title").value,
            description: form.querySelector("#description").value,
            date: form.querySelector("#date").value,
            tags: form.querySelector("#tags").value.split(",").map(t => t.trim()).filter(t => t),
            status: form.querySelector("#status").value,
            pdfLink: form.querySelector("#pdfLink").value,
            projectLink: form.querySelector("#projectLink").value,
            createdAt: mode === "create" ? firebase.firestore.FieldValue.serverTimestamp() : postData.createdAt,
            pinned: postData.pinned || false
        };

        try {
            if (mode === "create") {
                await db.collection(type).add(formData);
            } else {
                await db.collection(type).doc(postId).update(formData);
            }

            await loadPostsFromFirestore(type);
            wrapper.remove();
        } catch (err) {
            console.error("Error saving:", err);
            alert("Error saving post.");
        } finally {
            hideLoader();
        }
    });
}
