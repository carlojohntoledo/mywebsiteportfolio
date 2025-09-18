document.querySelectorAll('.menu-radio').forEach(radio => {
    radio.addEventListener('click', () => {
        const href = radio.getAttribute('data-href');
        if (href) window.location.href = href;
    });
});


function showMenuNav() {
    const menuNav = document.querySelector(".menu-nav");

    if (!menuNav) return;

    const bodyData = document.body.getAttribute("data-page");

    menuNav.innerHTML = `
        <div class="logo-panel blue-bordered">
        <!-- From Uiverse.io by satyamchaudharydev -->
        <button class="logo" data-text="Awesome">
            <span class="actual-text">&nbsp;KOALO&nbsp;</span>
            <span aria-hidden="true" class="hover-text">&nbsp;KOALO&nbsp;</span>
        </button>
    </div>
    <div class="menu-btn-panel blue-bordered">
        <div class="radio-inputs">
            <label class="menu-radio" data-href="activities.html">
            <input name="radio" type="radio" ${bodyData === "activities" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path d="M4,8.931V20a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V8.931a1,1,0,0,0-.441-.828L12,3,4.441,8.1A1,1,0,0,0,4,8.931ZM10,14a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v5H10Z"></path>
                    </g>
                </svg>
                <p class="name">Activity</p>
            </label>
            <label class="menu-radio" data-href="profile.html">
                <input name="radio" type="radio" ${bodyData === "profile" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <path fill="#ffffff" d="M9 0a9 9 0 0 0-9 9 8.654 8.654 0 0 0 .05.92 9 9 0 0 0 17.9 0A8.654 8.654 0 0 0 18 9a9 9 0 0 0-9-9zm5.42 13.42c-.01 0-.06.08-.07.08a6.975 6.975 0 0 1-10.7 0c-.01 0-.06-.08-.07-.08a.512.512 0 0 1-.09-.27.522.522 0 0 1 .34-.48c.74-.25 1.45-.49 1.65-.54a.16.16 0 0 1 .03-.13.49.49 0 0 1 .43-.36l1.27-.1a2.077 2.077 0 0 0-.19-.79v-.01a2.814 2.814 0 0 0-.45-.78 3.83 3.83 0 0 1-.79-2.38A3.38 3.38 0 0 1 8.88 4h.24a3.38 3.38 0 0 1 3.1 3.58 3.83 3.83 0 0 1-.79 2.38 2.814 2.814 0 0 0-.45.78v.01a2.077 2.077 0 0 0-.19.79l1.27.1a.49.49 0 0 1 .43.36.16.16 0 0 1 .03.13c.2.05.91.29 1.65.54a.49.49 0 0 1 .25.75z"></path> 
                    </g>
                </svg>
                <span class="name">Profile</span>
            </label>
            <label class="menu-radio" data-href="services.html">
                <input name="radio" type="radio" ${bodyData === "services" ? "checked" : ""}/>
                <svg class="menu-icon" id="menu-service-icon" width="2rem" height="2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <g> 
                            <path d="M14.121 10.48a1 1 0 0 0-1.414 0l-.707.706a2 2 0 1 1-2.828-2.828l5.63-5.632a6.5 6.5 0 0 1 6.377 10.568l-2.108 2.135-4.95-4.95zM3.161 4.468a6.503 6.503 0 0 1 8.009-.938L7.757 6.944a4 4 0 0 0 5.513 5.794l.144-.137 4.243 4.242-4.243 4.243a2 2 0 0 1-2.828 0L3.16 13.66a6.5 6.5 0 0 1 0-9.192z"></path> 
                        </g> 
                    </g>
                </svg>
                <span class="name">Services</span>
            </label>
            <label class="menu-radio" data-href="projects.html">
                <input name="radio" type="radio" ${bodyData === "projects" ? "checked" : ""}/>
                <svg class="menu-icon" width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.4 3h13.2A2.4 2.4 0 0 1 21 5.4v13.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 18.6V5.4A2.4 2.4 0 0 1 5.4 3ZM9 4h2v5h9v2h-9v9H9v-9H4V9h5V4Z" fill="#ffffff"></path>
                    </g>
                </svg>
                <span class="name">Projects</span>
            </label>
        </div>

    </div>
    <div class="extras-panel blue-bordered">

        <div class="extras-dropdown-button-container">
            <input hidden="" class="check-icon" id="check-icon" name="check-icon" type="checkbox">
            <label class="icon-menu" for="check-icon">
                <div class="bar bar--1"></div>
                <div class="bar bar--2"></div>
                <div class="bar bar--3"></div>
            </label>
            <!-- Popup -->
            <div class="extras-popup">
                <h2>MENU</h2>
                <ul>
                    <div class="search-section red-bordered" style="background-color: transparent;">
                        <div class="search-container">
                            <svg class="search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
                                alt="search icon">
                                <path
                                    d="M46.599 46.599a4.498 4.498 0 0 1-6.363 0l-7.941-7.941C29.028 40.749 25.167 42 21 42 9.402 42 0 32.598 0 21S9.402 0 21 0s21 9.402 21 21c0 4.167-1.251 8.028-3.342 11.295l7.941 7.941a4.498 4.498 0 0 1 0 6.363zM21 6C12.717 6 6 12.714 6 21s6.717 15 15 15c8.286 0 15-6.714 15-15S29.286 6 21 6z">
                                </path>
                            </svg>
                            <input class="inputBox" id="inputBox" type="text" placeholder="Search">
                        </div>
                    </div>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <hr>
                    </hr>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <a href="#">
                        <li>Option 1</li>
                    </a>
                    <button id="logoutBtn" class="oauthButton">
                        <li>Log out</li>
                    </button>
                </ul>
            </div>
        </div>
    </div>

    `;

    const radios = menuNav.querySelectorAll(".menu-radio");
    radios.forEach(label => {
        label.addEventListener("click", () => {
            const href = label.getAttribute("data-href");
            if (href) {
                window.location.href = href;
            }
        });
    });
}

showMenuNav();