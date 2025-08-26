// create post toggle
// Show "Create Project" form
document.getElementById('create-new-project').addEventListener('click', function () {
    const postCard = document.querySelector('.create-card-container-parent');
    postCard.style.display = 'grid';

    // Clear file previews
    const previewContainer = postCard.querySelector('#file-preview-container');
    previewContainer.innerHTML = "";

    const errorElement = document.querySelector(".error");
    errorElement.style.display = "none";
});


document.getElementById('cancel-btn').addEventListener('click', function () {
    const postCard = document.querySelector('.create-card-container-parent');
    postCard.style.display = 'none';
});

document.querySelector('.error__close').addEventListener("click", function (e) {
        const errorElement = document.querySelector(".error");
        errorElement.style.display="none";
    });