// create post toggle
// Show "Create Project" form
document.getElementById('create-new-post').addEventListener('click', function () {
    const postCard = document.querySelector('.create-card-container-parent');
    postCard.style.display = 'grid';

    // Reset all input fields
    const form = postCard.querySelector('#create-project-form');
    form.reset(); // resets text inputs, textareas, selects

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


loadProjectsFromFirestore();