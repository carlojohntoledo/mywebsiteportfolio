
// ===================================================
// Create post toggle
// ===================================================

// Show "Create Project" form
document.getElementById('create-new-post').addEventListener('click', function () {
    const postCard = getPageContainer();
    if (!postCard) return; // fail-safe

    postCard.style.display = 'grid';

    // Clear file previews
    const previewContainer = postCard.querySelector('#file-preview-container');
    if (previewContainer) previewContainer.innerHTML = "";

    const errorElement = document.querySelector(".error");
    if (errorElement) errorElement.style.display = "none";
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', function () {
    const postCard = getPageContainer();
    if (postCard) postCard.style.display = 'none';
});

// Error close button
document.querySelector('.error__close').addEventListener("click", function () {
    const errorElement = document.querySelector(".error");
    if (errorElement) errorElement.style.display = "none";
});
