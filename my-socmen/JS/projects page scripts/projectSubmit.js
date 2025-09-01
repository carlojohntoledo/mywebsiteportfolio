// ======================
// SUBMIT POST HANDLER (stable, single-run, edit/create safe)
// ======================
function initSubmitHandlers(page, mode = "create", postId = null, postData = null, currentImagesParam = []) {
  const postBtnId = `${page}-post-btn`;
  const postBtn = document.getElementById(postBtnId);
  if (!postBtn) {
    console.warn(`⚠️ Post button ${postBtnId} not found. Skipping initSubmitHandlers.`);
    return;
  }

  // --- Helper: extract URL from image object/string ---
  const urlOf = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.imageUrl || img.url || img.secure_url || img.path || "";
  };

  // --- Remove previous listeners by replacing the button node (clean slate) ---
  const newBtn = postBtn.cloneNode(true);
  postBtn.parentNode.replaceChild(newBtn, postBtn);

  // --- Global guard to avoid double-handling if other listeners exist ---
  if (!window.__postSubmitState) window.__postSubmitState = {};
  window.__postSubmitState[postBtnId] = window.__postSubmitState[postBtnId] || { submitting: false };

  newBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    // Prevent double-run
    if (window.__postSubmitState[postBtnId].submitting) {
      console.log("⚠️ Submission already in progress — ignoring duplicate click.");
      return;
    }
    window.__postSubmitState[postBtnId].submitting = true;

    try {
      // ✅ Show loader immediately and yield to let UI paint it
      if (typeof showLoader === "function") showLoader();
      await new Promise(res => setTimeout(res, 10));

      // Collect form and fields
      const form = document.querySelector(`#create-${page}-form`);
      const titleEl = document.querySelector(`.input-${page}-title`);
      const descEl = document.querySelector(`.input-${page}-description`);
      const dateEl = document.querySelector(`.input-${page}-date`);
      const statusEl = document.querySelector(`.input-${page}-status`);
      const tagsEl = document.querySelector(`.input-${page}-tags`);
      const fileInput = document.getElementById("file");
      const pdfLinkEl = document.querySelector(`.input-${page}-pdf-link`);
      const linkEl = document.querySelector(`.input-${page}-link`);
      const errorElement = document.querySelector(".error");

      // Validation
      const title = titleEl?.value?.trim() || "";
      const description = descEl?.value?.trim() || "";
      const date = dateEl?.value?.trim() || "";
      const status = statusEl?.value?.trim() || "";

      // --- Validation ---
      let validationError = null;
      if (page === "activities") {
        if (!description) {
          validationError = "Description is required";
        }
      } else {
        if (!title || !description || !date || !status) {
          validationError = "Please fill in all required fields";
        }
      }

      if (validationError) {
        if (errorElement) {
          errorElement.textContent = validationError; // optional
          errorElement.style.display = "flex";
        }
        window.__postSubmitState[postBtnId].submitting = false;
        if (typeof hideLoader === "function") hideLoader();
        return;
      } else if (errorElement) {
        errorElement.style.display = "none";
      }


      const tagsArray = (tagsEl?.value || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      // === Determine existing images ===
      let existingImages = Array.isArray(currentImagesParam) && currentImagesParam.length
        ? currentImagesParam.slice()
        : Array.isArray(postData?.images) && postData.images.length
          ? postData.images.slice()
          : [];

      if (existingImages.length === 0 && form?.dataset?.existingUrls) {
        try {
          const parsed = JSON.parse(form.dataset.existingUrls);
          if (Array.isArray(parsed)) existingImages = parsed.slice();
        } catch (_) { /* ignore parse errors */ }
      }

      // === Which images are still visible in preview ===
      const previewContainer = document.querySelector(`#${page}-preview`) || form?.querySelector(".file-preview-container");
      let visibleSrcs = [];
      if (previewContainer) {
        visibleSrcs = Array.from(previewContainer.querySelectorAll("img"))
          .map(img => img.getAttribute("src"))
          .filter(Boolean);
      }

      const removedImages = existingImages.filter(img => {
        const u = urlOf(img);
        return u && !visibleSrcs.includes(u);
      });

      const keptExisting = existingImages.filter(img => {
        const u = urlOf(img);
        return u && visibleSrcs.includes(u);
      });

      // === Upload new files ===
      const files = fileInput?.files ? Array.from(fileInput.files) : [];
      const uploadedImages = [];
      if (files.length > 0) {
        for (const f of files) {
          const compressed = await compressImage(f);
          const res = await uploadToCloudinary(compressed, page);
          if (res) {
            uploadedImages.push({
              imageUrl: res.imageUrl,
              publicId: res.publicId
            });
          }
        }
      }

      // === Final images ===
      const finalImages = [...keptExisting, ...uploadedImages];

      // === Delete removed images ===
      if (removedImages.length > 0) {
        for (const img of removedImages) {
          const pid = img?.publicId || img?.public_id;
          if (pid) {
            try {
              console.log(`🗑️ Deleting from Cloudinary → ${pid}`);
              await deleteFromCloudinary(pid);
            } catch (err) {
              console.warn("⚠️ Failed to delete Cloudinary image", pid, err);
            }
          }
        }
      }

      // === Prepare Firestore payload ===
      const payload = {
        title,
        description,
        status,
        date,
        tags: tagsArray,
        pinned: postData?.pinned || false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Only include images if they exist
      if (finalImages.length > 0) {
        payload.images = finalImages;
      }


      if (page === "projects") {
        let pdfLink = (pdfLinkEl?.value || "").trim();
        let projectLink = (linkEl?.value || "").trim();
        if (pdfLink && !/^https?:\/\//i.test(pdfLink)) pdfLink = "https://" + pdfLink;
        if (projectLink && !/^https?:\/\//i.test(projectLink)) projectLink = "https://" + projectLink;
        payload.pdfLink = pdfLink || postData?.pdfLink || "";
        payload.projectLink = projectLink || postData?.projectLink || "";
      }

      // === Save to Firestore ===
      if (mode === "edit" && postId) {
        await db.collection(page).doc(postId).update(payload);
        console.log(`✅ Updated ${page} → ${postId}`);
      } else {
        await db.collection(page).add({
          ...payload,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Created ${page} (new doc)`);
      }

      await loadPostsFromFirestore(page);

      const container = getPageContainer();
      if (container) { container.style.display = "none"; container.innerHTML = ""; }

      alert("✅ Post saved successfully!");
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert(err.message || "Error saving post.");
    } finally {
      window.__postSubmitState[postBtnId].submitting = false;
      if (typeof hideLoader === "function") hideLoader();
    }
  });
}
