// =============================================================
// ✅ MAIN FUNCTION → Load posts (Projects, Services, Activities)
// =============================================================
async function loadPostsFromFirestore(type = "projects") {
    const container = document.querySelector(`.${type}-container-parent`);
    if (!container) {
        console.warn(`⚠️ .${type}-container-parent not found. Skipping render.`);
        return Promise.resolve([]);
    }

    container.innerHTML = ""; // clear old cards
    if (typeof showLoader === "function") showLoader();

    try {
        // NOTE: We still fetch by pinned + createdAt desc.
        // We'll apply a second pass sort on the DOM to handle the
        // "projects by date" vs "services/activities by createdAt" rule.
        const snapshot = await db.collection(type)
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        const postsArray = [];

        snapshot.forEach(doc => {
            const uid = doc.id;
            const data = doc.data();

            // ✅ Get first image URL (used by projects/services hero image)
            const firstImage = getFirstImage(data.images);

            postsArray.push({ id: uid, ...data });

            // ✅ unique ids for popup menu inputs
            const toggleId = `toggle-${uid}`;
            const pinId = `pin-${uid}`;
            const editId = `edit-${uid}`;
            const removeId = `remove-${uid}`;
            const pinLabelText = data.pinned ? `Unpin ${capitalize(type)}` : `Pin ${capitalize(type)}`;

            // --- Build post card container ---
            const containerDiv = document.createElement("div");
            containerDiv.classList.add(`${type}-container`);
            containerDiv.setAttribute("data-id", uid);
            containerDiv.setAttribute("data-pinned", data.pinned ? "true" : "false");

            // ✅ compute sort-time: projects use user-input date; others use createdAt
            const createdAtMs = data.createdAt && typeof data.createdAt.toMillis === "function"
                ? data.createdAt.toMillis()
                : (data.createdAt ? new Date(data.createdAt).getTime() : 0);
            const projectDateMs = Date.parse(data.date || "") || 0;
            const sortTime = (type === "projects") ? projectDateMs : createdAtMs;

            // keep original `data-date` for legacy; but use `data-sort-time` for sorter
            containerDiv.setAttribute("data-date", data.date || data.createdAt || "");
            containerDiv.setAttribute("data-sort-time", String(sortTime));
            containerDiv.id = uid; // ✅ for hash scrolling

            // =============================================================
            // ✅ TEMPLATE PER TYPE (switch-case)
            // =============================================================
            let cardInnerHTML = "";

            switch (type) {
                // =============================================================
                // ✅ ACTIVITIES POST TEMPLATE
                // - No carousel
                // - Grid image display with +N overlay
                // - Time-ago from createdAt
                // - Uses classes based on `${type}` so your CSS `.activities-*` applies
                // =============================================================
                case "activities": {
                    const createdAtDate = data.createdAt?.toDate?.() || new Date();
                    const timeAgo = getTimeAgo(createdAtDate);

                    // ✅ Generate image grid with +N overlay
                    const images = Array.isArray(data.images) ? data.images : [];
                    const totalImages = images.length;

                    // Build frames depending on count
                    let imagesHTML = "";
                    if (totalImages === 1) {
                        imagesHTML = `
                            <div class="frame single" data-index="0">
                                <img src="${images[0].imageUrl}" alt="activity image">
                            </div>`;
                    } else if (totalImages === 2) {
                        imagesHTML = images.map((img, i) => `
                            <div class="frame" data-index="${i}">
                                <img src="${img.imageUrl}" alt="activity image">
                            </div>`).join("");
                    } else if (totalImages === 3) {
                        // 2 on top + 1 full-width below (you can refine with CSS)
                        imagesHTML = `
                            <div class="frame" data-index="0"><img src="${images[0].imageUrl}" alt="activity image"></div>
                            <div class="frame" data-index="1"><img src="${images[1].imageUrl}" alt="activity image"></div>
                            <div class="frame full-width" data-index="2"><img src="${images[2].imageUrl}" alt="activity image"></div>`;
                    } else if (totalImages === 4) {
                        imagesHTML = images.map((img, i) => `
                            <div class="frame" data-index="${i}">
                                <img src="${img.imageUrl}" alt="activity image">
                            </div>`).join("");
                    } else if (totalImages > 4) {
                        const firstFour = images.slice(0, 4);
                        imagesHTML = firstFour.map((img, i) => {
                            if (i === 3) {
                                return `
                                    <div class="frame more-images" data-index="${i}">
                                        <img src="${img.imageUrl}" alt="activity image">
                                        <div class="overlay">+${totalImages - 4}</div>
                                    </div>`;
                            }
                            return `
                                <div class="frame" data-index="${i}">
                                    <img src="${img.imageUrl}" alt="activity image">
                                </div>`;
                        }).join("");
                    }

                    cardInnerHTML = `
                    <div class="${type}-card">
                        <!-- Header -->
                        <div class="${type}-header-panel">
                            <div class="${type}-profile-pic">
                                <img src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="ProfilePicture">
                            </div>
                            <div class="${type}-info-panel">
                                <div class="${type}-user-name">${data.userName || "Anonymous"}</div>
                                <div class="${type}-post-date">${timeAgo}</div>
                            </div>
                            <div class="${type}-extras-panel">. . .</div>
                        </div>

                        <!-- Description -->
                        <div class="${type}-description-panel">${data.description || ""}</div>

                        <!-- Attachments -->
                        <div class="${type}-attachment-panel">
                            ${imagesHTML}
                        </div>

                        <!-- Reactions (placeholder for later) -->
                        <div class="${type}-reaction-panel">
                            <div class="reaction-counts-panel">👍 0 · 💬 0</div>
                            <div class="reaction-panel">
                                <div class="reaction-button">Like</div>
                                <div class="reaction-button">Comment</div>
                                <div class="reaction-button">Share</div>
                            </div>
                        </div>
                    </div>`;
                }
                break;

                // =============================================================
                // ✅ SERVICES POST TEMPLATE (carousel + tags + status)
                // =============================================================
                case "services":
                    cardInnerHTML = `
                    <div class="${type}-card">
                        <div class="${type}-content" style="position: relative;">
                            <!-- Extra Menu -->
                            <div class="post-extra-popup">
                                <input type="checkbox" id="${toggleId}" class="checkbox">
                                <label for="${toggleId}" class="post-extra-btn"><strong>. . .</strong></label>
                                <div class="post-extra-list-container">
                                    <ul class="post-extra-list">
                                        <li><input type="checkbox" id="${pinId}" hidden><label for="${pinId}"><span>${pinLabelText}</span></label></li>
                                        <li><input type="checkbox" id="${editId}" hidden><label for="${editId}"><span>Edit ${capitalize(type)}</span></label></li>
                                        <li><input type="checkbox" id="${removeId}" hidden><label for="${removeId}"><span>Remove ${capitalize(type)}</span></label></li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Image + Indicators -->
                            <div class="${type}-image-container">
                                <div class="post-indicators">
                                    <h1 class="srv">${capitalize(type)}</h1>
                                    <h1 class="srv ${type}-status">${data.status || ''}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="${data.pinned ? 'display:block' : 'display:none'};">Pinned</h1>
                                </div>
                                <div class="${type}-logo-container"><h1 class="${type}-logo-panel">KOALO</h1></div>
                                <img src="${firstImage}" alt="${type} image" class="${type}-image" id="${type}-image-${uid}">
                            </div>

                            <!-- Title + Profile -->
                            <div class="${type}-title-container">
                                <h1 class="${type}-title">${data.title || ''}</h1>
                                <div class="${type}-details-container">
                                    <div class="${type}-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="${type}-status-container">
                                        <p class="${type}-date">${data.date || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="${type}-links-container scroll-fade">
                                <div class="${type}-tags-container ${type}-tags">
                                    ${(data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="${type}-desc-container">
                                <p class="desc-text ${type}-description">${data.description || ''}</p>
                                <button class="toggle-desc">See More</button>
                            </div>

                            <!-- Addons -->
                            <div class="addons-container">
                                ${data.pdfLink ? `<a href="${data.pdfLink}" class="${type}-pdf-download" target="_blank">Download PDF</a>` : ""}
                                ${data.projectLink ? `<a href="${data.projectLink}" class="${type}-link" target="_blank">Live Demo</a>` : ""}
                            </div>
                        </div>
                    </div>`;
                break;

                // =============================================================
                // ✅ PROJECTS POST TEMPLATE (carousel + tags + status)
                // =============================================================
                case "projects":
                    cardInnerHTML = `
                    <div class="${type}-card">
                        <div class="${type}-content" style="position: relative;">
                            <!-- Extra Menu -->
                            <div class="post-extra-popup">
                                <input type="checkbox" id="${toggleId}" class="checkbox">
                                <label for="${toggleId}" class="post-extra-btn"><strong>. . .</strong></label>
                                <div class="post-extra-list-container">
                                    <ul class="post-extra-list">
                                        <li><input type="checkbox" id="${pinId}" hidden><label for="${pinId}"><span>${pinLabelText}</span></label></li>
                                        <li><input type="checkbox" id="${editId}" hidden><label for="${editId}"><span>Edit ${capitalize(type)}</span></label></li>
                                        <li><input type="checkbox" id="${removeId}" hidden><label for="${removeId}"><span>Remove ${capitalize(type)}</span></label></li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Image + Indicators -->
                            <div class="${type}-image-container">
                                <div class="post-indicators">
                                    <h1 class="srv">${capitalize(type)}</h1>
                                    <h1 class="srv ${type}-status">${data.status || ''}</h1>
                                    <h1 class="srv" id="pinned-post-indicator" style="${data.pinned ? 'display:block' : 'display:none'};">Pinned</h1>
                                </div>
                                <div class="${type}-logo-container"><h1 class="${type}-logo-panel">KOALO</h1></div>
                                <img src="${firstImage}" alt="${type} image" class="${type}-image" id="${type}-image-${uid}">
                            </div>

                            <!-- Title + Profile -->
                            <div class="${type}-title-container">
                                <h1 class="${type}-title">${data.title || ''}</h1>
                                <div class="${type}-details-container">
                                    <div class="${type}-name-container">
                                        <img class="xs-profilepic" src="Assets/Images/Profile Pictures/default-profile-picture.jpg" alt="profile picture">
                                        <p>Carlo John Toledo</p>
                                    </div>
                                    <div class="${type}-status-container">
                                        <p class="${type}-date">${data.date || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="${type}-links-container scroll-fade">
                                <div class="${type}-tags-container ${type}-tags">
                                    ${(data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="${type}-desc-container">
                                <p class="desc-text ${type}-description">${data.description || ''}</p>
                                <button class="toggle-desc">See More</button>
                            </div>

                            <!-- Addons -->
                            <div class="addons-container">
                                ${data.pdfLink ? `<a href="${data.pdfLink}" class="${type}-pdf-download" target="_blank">Download PDF</a>` : ""}
                                ${data.projectLink ? `<a href="${data.projectLink}" class="${type}-link" target="_blank">Live Demo</a>` : ""}
                            </div>
                        </div>
                    </div>`;
                break;

                default:
                    console.warn(`⚠️ Unknown type: ${type}`);
            }

            // ✅ inject the card markup
            containerDiv.innerHTML = cardInnerHTML;

            // ✅ Random pastel tags (projects/services only)
            const tagsContainer = containerDiv.querySelector(`.${type}-tags-container`);
            if (tagsContainer) {
                const tagsHtml = (data.tags || [])
                    .map(tag => `<span class="tag" style="background-color:${getRandomPastelColor()}">${tag}</span>`)
                    .join("");
                tagsContainer.innerHTML = tagsHtml;
            }

            // ✅ Append to parent
            container.appendChild(containerDiv);

            // ✅ Start carousel for projects/services only
            if (type !== "activities") {
                const imgElement = containerDiv.querySelector(`#${type}-image-${uid}`);
                if (imgElement) startCarousel(imgElement, data.images);
            }

            // ✅ Attach lightbox for activities images
            if (type === "activities" && Array.isArray(data.images) && data.images.length > 0) {
                const frames = containerDiv.querySelectorAll(`.${type}-attachment-panel .frame`);
                frames.forEach(frameEl => {
                    frameEl.addEventListener("click", () => {
                        const startIndex = parseInt(frameEl.getAttribute("data-index"), 10) || 0;
                        openLightbox(data.images, startIndex);
                    });
                });
            }

            // --- Extra Menu Actions ---
            const pinEl = containerDiv.querySelector(`#${pinId}`);
            if (pinEl) {
                pinEl.addEventListener("change", async () => {
                    if (typeof showLoader === "function") showLoader();
                    await db.collection(type).doc(uid).update({ pinned: !data.pinned });
                    await loadPostsFromFirestore(type);
                    if (typeof hideLoader === "function") hideLoader();
                });
            }

            const removeEl = containerDiv.querySelector(`#${removeId}`);
            if (removeEl) {
                removeEl.addEventListener("change", async () => {
                    if (confirm(`Are you sure you want to delete this ${type}?`)) {
                        if (typeof showLoader === "function") showLoader();
                        try {
                            if (data.images && data.images.length > 0) {
                                await Promise.all(
                                    data.images.map(img => {
                                        const pid = img?.publicId || img?.public_id;
                                        return pid ? deleteFromCloudinary(pid) : null;
                                    })
                                );
                            }
                            await db.collection(type).doc(uid).delete();
                            await loadPostsFromFirestore(type);
                        } catch (err) {
                            console.error(err);
                            alert(`Error deleting ${type}.`);
                        } finally {
                            if (typeof hideLoader === "function") hideLoader();
                        }
                    }
                    removeEl.checked = false;
                });
            }

            const editEl = containerDiv.querySelector(`#${editId}`);
            if (editEl) {
                editEl.addEventListener("change", () => {
                    openPostForm(type, "edit", data, uid);   // ✅ use the new unified form
                    editEl.checked = false;
                });
            }
        });

        // ✅ Sort cards per type (pinned first; then project date or createdAt)
        postSorter(type);

        return postsArray;
    } catch (err) {
        console.error(`Error loading ${type}:`, err);
        return [];
    } finally {
        if (typeof hideLoader === "function") hideLoader();
    }
}

// =============================================================
// ✅ INITIAL PAGE LOADER → Detects current page and loads posts
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    let attempts = 0;
    const interval = setInterval(async () => {
        const container = document.querySelector(".projects-container-parent, .services-container-parent, .activities-container-parent");
        if (container || attempts > 20) { // wait max ~2s
            clearInterval(interval);
            if (document.querySelector(".projects-container-parent")) {
                await loadPostsFromFirestore("projects");
            } else if (document.querySelector(".services-container-parent")) {
                await loadPostsFromFirestore("services");
            } else if (document.querySelector(".activities-container-parent")) {
                await loadPostsFromFirestore("activities");
            }
        }
        attempts++;
    }, 100);
});

// =============================================================
// ✅ Sort cards per type
// - projects: pinned first, then by user-input date (data-sort-time set above)
// - services/activities: pinned first, then by createdAt (data-sort-time set above)
// =============================================================
function postSorter(type = "projects") {
    const parent = document.querySelector(`.${type}-container-parent`);
    if (!parent) return;

    const cards = Array.from(parent.querySelectorAll(`.${type}-container`));
    cards.sort((a, b) => {
        const aPinned = a.getAttribute('data-pinned') === 'true';
        const bPinned = b.getAttribute('data-pinned') === 'true';
        if (aPinned !== bPinned) return bPinned - aPinned;

        // unified sort-time (ms) set per card depending on type
        const aTime = parseInt(a.getAttribute('data-sort-time'), 10) || 0;
        const bTime = parseInt(b.getAttribute('data-sort-time'), 10) || 0;
        return bTime - aTime; // newest (largest ms) first
    });

    cards.forEach(card => parent.appendChild(card));
}

// =============================================================
// ✅ Utility → Capitalize text
// =============================================================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================
// ✅ Utility → Time Ago formatter for activities
// =============================================================
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// =============================================================
// ✅ Lightbox for Activities images (simple viewer)
// - Click any image in activities grid to open fullscreen viewer
// - Use prev/next buttons or keyboard arrows
// =============================================================
function openLightbox(images, startIndex = 0) {
    if (!Array.isArray(images) || images.length === 0) return;

    let currentIndex = Math.max(0, Math.min(startIndex, images.length - 1));

    // remove any existing lightbox first
    const old = document.getElementById("lightbox-overlay");
    if (old) old.remove();

    // overlay container
    const overlay = document.createElement("div");
    overlay.id = "lightbox-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    // image element
    const img = document.createElement("img");
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";
    img.style.objectFit = "contain";

    // controls
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "‹";
    prevBtn.style.position = "absolute";
    prevBtn.style.left = "20px";
    prevBtn.style.top = "50%";
    prevBtn.style.transform = "translateY(-50%)";
    prevBtn.style.fontSize = "2rem";
    prevBtn.style.background = "transparent";
    prevBtn.style.color = "#fff";
    prevBtn.style.border = "none";
    prevBtn.style.cursor = "pointer";

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "›";
    nextBtn.style.position = "absolute";
    nextBtn.style.right = "20px";
    nextBtn.style.top = "50%";
    nextBtn.style.transform = "translateY(-50%)";
    nextBtn.style.fontSize = "2rem";
    nextBtn.style.background = "transparent";
    nextBtn.style.color = "#fff";
    nextBtn.style.border = "none";
    nextBtn.style.cursor = "pointer";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "20px";
    closeBtn.style.right = "20px";
    closeBtn.style.fontSize = "1.5rem";
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";

    function render() {
        const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
        img.src = images[safeIndex]?.imageUrl || images[safeIndex] || "";
    }

    function prev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render();
    }

    function next() {
        currentIndex = (currentIndex + 1) % images.length;
        render();
    }

    function close() {
        window.removeEventListener("keydown", onKey);
        overlay.remove();
    }

    function onKey(e) {
        if (e.key === "Escape") return close();
        if (e.key === "ArrowLeft") return prev();
        if (e.key === "ArrowRight") return next();
    }

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        // close if clicking the background (not the image)
        if (e.target === overlay) close();
    });
    window.addEventListener("keydown", onKey);

    overlay.appendChild(img);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    render();
}
