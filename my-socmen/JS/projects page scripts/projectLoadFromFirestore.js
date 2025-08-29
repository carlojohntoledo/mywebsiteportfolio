
window.showLoader = window.showLoader || function () 
{ 
    const loader = document.querySelector('.loader-container'); 
    if (loader) loader.style.display = 'flex';
}; 

window.hideLoader = window.hideLoader || function () 
{ 
    const loader = document.querySelector('.loader-container'); 
    if (loader) loader.style.display = 'none'; 
};


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
    showLoader();

    try {
        const snapshot = await db.collection(type)
            .orderBy("pinned", "desc")
            .orderBy("createdAt", "desc")
            .get();

        const postsArray = [];

        snapshot.forEach(doc => {
            const uid = doc.id;
            const data = doc.data();
            const firstImage = getFirstImage(data.images);

            postsArray.push({ id: uid, ...data });

            const toggleId = `toggle-${uid}`;
            const pinId = `pin-${uid}`;
            const editId = `edit-${uid}`;
            const removeId = `remove-${uid}`;
            const pinLabelText = data.pinned ? `Unpin ${capitalize(type)}` : `Pin ${capitalize(type)}`;

            // --- Build post card ---
            const containerDiv = document.createElement("div");
            containerDiv.classList.add(`${type}-container`);
            containerDiv.setAttribute("data-id", uid);
            containerDiv.setAttribute("data-pinned", data.pinned ? "true" : "false");
            containerDiv.setAttribute("data-date", data.date || "");
            containerDiv.id = uid; // ✅ for hash scrolling

            containerDiv.innerHTML = `
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
                </div>
            `;

            // Random pastel tags
            const tagsHtml = (data.tags || [])
                .map(tag => `<span class="tag" style="background-color:${getRandomPastelColor()}">${tag}</span>`)
                .join("");
            containerDiv.querySelector(`.${type}-tags-container`).innerHTML = tagsHtml;

            container.appendChild(containerDiv);

            // Start carousel
            const imgElement = containerDiv.querySelector(`#${type}-image-${uid}`);
            startCarousel(imgElement, data.images);

            // --- Extra Menu Actions ---
            containerDiv.querySelector(`#${pinId}`).addEventListener("change", async () => {
                showLoader();
                await db.collection(type).doc(uid).update({ pinned: !data.pinned });
                await loadPostsFromFirestore(type);
                hideLoader();
            });

            containerDiv.querySelector(`#${removeId}`).addEventListener("change", async () => {
                if (confirm(`Are you sure you want to delete this ${type}?`)) {
                    showLoader();
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
                        hideLoader();
                    }
                }
                containerDiv.querySelector(`#${removeId}`).checked = false;
            });

            containerDiv.querySelector(`#${editId}`).addEventListener("change", () => {
                openPostForm(type, "edit", data, uid);   // ✅ use the new unified form
                containerDiv.querySelector(`#${editId}`).checked = false;
            });

        });

        // ✅ Sort cards: pinned first, newest date next
        postSorter(type);

        return postsArray;
    } catch (err) {
        console.error(`Error loading ${type}:`, err);
        return [];
    } finally {
        hideLoader();
    }
}

// =============================================================
// ✅ INITIAL PAGE LOADER → Detects current page and loads posts
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof showLoader === "function") showLoader();

    // detect which container exists
    if (document.querySelector(".projects-container-parent")) {
        await loadPostsFromFirestore("projects");
    } else if (document.querySelector(".services-container-parent")) {
        await loadPostsFromFirestore("services");
    } else if (document.querySelector(".activities-container-parent")) {
        await loadPostsFromFirestore("activities");
    }

    if (typeof hideLoader === "function") hideLoader();
});

// =============================================================
// ✅ Sort cards per type
// =============================================================
function postSorter(type = "projects") {
    const parent = document.querySelector(`.${type}-container-parent`);
    if (!parent) return;
    const cards = Array.from(parent.querySelectorAll(`.${type}-container`));
    cards.sort((a, b) => {
        const aPinned = a.getAttribute('data-pinned') === 'true';
        const bPinned = b.getAttribute('data-pinned') === 'true';
        if (aPinned !== bPinned) return bPinned - aPinned;
        const aTime = Date.parse(a.getAttribute('data-date')) || 0;
        const bTime = Date.parse(b.getAttribute('data-date')) || 0;
        return bTime - aTime;
    });
    cards.forEach(card => parent.appendChild(card));
}

// =============================================================
// ✅ Utility → Capitalize text
// =============================================================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
