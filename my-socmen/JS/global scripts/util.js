// =============================================================
// ✅ Global Loader
// =============================================================
window.showLoader = window.showLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'flex';
};

window.hideLoader = window.hideLoader || function () {
    const loader = document.querySelector('.loader-container');
    if (loader) loader.style.display = 'none';
};

window.showContentLoader = window.showContentLoader || function () {
    const loader = document.querySelector('.content-loader-container');
    if (loader) loader.style.display = 'flex';
};

window.hideContentLoader = window.hideContentLoader || function () {
    const loader = document.querySelector('.content-loader-container');
    if (loader) loader.style.display = 'none';
};

// ================= LIGHTBOX SCRIPT =================
(function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    let images = [];   // all images in the current post
    let currentIndex = 0;

    // Open lightbox
    function openLightbox(imgList, index) {
        images = imgList;
        currentIndex = index;
        lightboxImg.src = images[currentIndex];
        lightbox.classList.remove("hidden");

        // ✅ Hide/show navigation buttons
        if (images.length <= 1) {
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        } else {
            prevBtn.style.display = "";
            nextBtn.style.display = "";
        }
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.add("hidden");
        images = [];
        currentIndex = 0;
    }

    // Navigate
    function showPrev() {
        if (images.length <= 1) return; // prevent navigation when only 1 image
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function showNext() {
        if (images.length <= 1) return; // prevent navigation when only 1 image
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    // Event listeners
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (lightbox.classList.contains("hidden")) return;
        if (e.key === "Escape") closeLightbox();
        if (images.length <= 1) return; // ✅ disable arrow keys when only 1 image
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
    });

    // Attach click handlers to activity, project, service, and certificate images dynamically
    document.body.addEventListener("click", function (e) {
        // Case 1: Activity grid
        const img = e.target.closest(".activity-images img, .projects-image-container img, .services-image-container img, .profilephoto-container img");
        if (img) {
            const activityContainer = img.closest(".activity-images");
            if (activityContainer) {
                const imgEls = activityContainer.querySelectorAll("img");
                const imgList = Array.from(imgEls).map(el => el.src);
                const index = imgList.indexOf(img.src);
                openLightbox(imgList, index);
                return;
            }

            if (carouselData.has(img)) {
                const data = carouselData.get(img);
                openLightbox(data.urls, data.index); // ✅ full list + current index
                return;
            }
        }

        // Case 2: Certificates (catch clicks on trackers OR image)
        const certCard = e.target.closest(".certificate-card");
        if (certCard) {

            if (e.target.classList.contains("certificate-card-remove")) {
                handleCertificateRemove(e);
                return; // ⛔ stop lightbox
            }

            const certImg = certCard.querySelector("img.certificate-image");
            if (!certImg) return;

            // always 1 image per certificate
            openLightbox([certImg.src], 0);
            return;
        }

        // Case 3: Intro (cover photo & profile photo)
        const coverImg = e.target.closest(".coverphoto-container img");
        if (coverImg) {
            openLightbox([coverImg.src], 0);
            return;
        }

        const profileImg = e.target.closest(".profilephoto-container img");
        if (profileImg) {
            openLightbox([profileImg.src], 0);
            return;
        }
    });

})();


// =============================================================
// Helper: Render images in grid for activities (with hidden extras)
// =============================================================
function renderActivityImages(images) {
    if (!images || images.length === 0) return "";

    const urls = images.map(img =>
        typeof img === "string"
            ? img
            : img.imageUrl || img.url || img.secure_url || ""
    ).filter(Boolean);

    if (urls.length === 0) return "";

    let html = "";
    const count = urls.length;

    if (count === 1) {
        html = `<div class="grid-1"><img src="${urls[0]}" alt="activity image"></div>`;
    } else if (count === 2) {
        html = `<div class="grid-2">
                  <img src="${urls[0]}" alt="">
                  <img src="${urls[1]}" alt="">
                </div>`;
    } else if (count === 3) {
        html = `<div class="grid-3">
                  <div class="big"><img src="${urls[0]}" alt=""></div>
                  <div class="small">
                    <img src="${urls[1]}" alt="">
                    <img src="${urls[2]}" alt="">
                  </div>
                </div>`;
    } else if (count === 4) {
        html = `<div class="grid-4">
                  ${urls.map(u => `<img src="${u}" alt="">`).join("")}
                </div>`;
    } else {
        // 5+ → show first 4, overlay on 4th, hide the rest
        const extra = count - 4;
        html = `<div class="grid-5">
                  <img src="${urls[0]}" alt="">
                  <img src="${urls[1]}" alt="">
                  <img src="${urls[2]}" alt="">
                  <div class="overlay-wrapper">
                    <img src="${urls[3]}" alt="">
                    <div class="overlay">+${extra}</div>
                  </div>
                  ${urls.slice(4).map(u => `<img src="${u}" alt="" style="display:none;">`).join("")}
                </div>`;
    }

    return `<div class="activity-images">${html}</div>`;
}

