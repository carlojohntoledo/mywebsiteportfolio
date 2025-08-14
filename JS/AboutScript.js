
// Function to change the content of row two when "Overview" link is clicked
function showOverviewDetails() {
    var rowTwo = document.getElementById('row-two');
    rowTwo.innerHTML = `
    <div class="row-two" id="row-two">
        <div id="row-two-container">
            <div class="content-container">
                <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
                <div class="text-container">
                    <h3>System Administrator at Intelligent Touch Corporation</h3>
                    <p>Past: Cavite State University Trece Campus and Office of the Provincial
                        Health Officer -
                        Cavite</p>
                </div>
            </div>
            <div class="content-container">
                <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>

                <div class="text-container">
                    <h3>Studied Bachelor of Science in Information Technology at Cavite State
                        University Trece
                        Martires City Campus</h3>
                    <p>Attended from 2016 to 2022</p>
                </div>
            </div>
            <div class="content-container">
                <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>

                <div class="text-container">
                    <h3>0997 899 4298</h3>
                    <p>Contact number • Email • Social media accounts • Links</p>
                </div>
            </div>
            <div class="content-container">
                <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <div class="text-container">
                    <h3>Lives in Trece Martires City</h3>
                    <p>Cavite • Philippines</p>
                </div>
            </div>
            <div class="content-container">
                <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>

                <div class="text-container">
                    <h3>A diligent Information Technology Graduate</h3>
                    <p>From CvSU Trece Martires City Campus</p>
                </div>
            </div>
        </div>
    </div>`;

}

// Add an event listener to the "Overview" link
var overviewLink = document.querySelector('#row-one-container a[href="#Overview"]');
if (overviewLink) {
    overviewLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        showOverviewDetails(); // Call the function to show overview details
    });
    // Get all the links inside #row-one-container
    const links = document.querySelectorAll('#row-one-container a');

    // Add click event listeners to each link
    links.forEach(link => {
        link.addEventListener('click', function (event) {
            // Prevent the default behavior of the link
            event.preventDefault();

            // Remove the 'active' class from all links
            links.forEach(link => link.classList.remove('active'));

            // Add the 'active' class to the clicked link
            this.classList.add('active');
        });
    });
}



// Function to change the content of row two when "Occupation" link is clicked
function showOccupationDetails() {
    var rowTwo = document.getElementById('row-two');
    rowTwo.innerHTML = `
    <h1>Occupation</h1>
    <div id="row-two-container">
        <div class="content-container">
            <img class="companies" src="Assets/Images/itc logo.png" alt="itc">
            <div class="text-container">
                <h3>System Administrator at Intelligent Touch Corporation</h3>
                <p>August 7, 2023 - Present <br> <br>
                    Responsible for the deployment of the LMS, 
                    IFS and other system software updated and working. Helping the client's 
                    tech to setup system environment for the software. Always support and 
                    troubleshoot the error of the software. Also, helping the co-workers 
                    needs in the network environment.
                </p>
            </div>
        </div>
        <div class="content-container">
            <img class="companies" src="Assets/Images/cvsu logo.png" alt="cvsu">
            <div class="text-container">
                <h3>Former IT INSTRUCTOR at Cavite State University Trece Campus</h3>
                <p>
                    October 10, 2022 - February 2023 <br> <br>
                    Prepare lesson plans, course outlines, schedules, and assignments. 
                    Identify the main objectives and skills or concepts that participants need to learn. 
                    Explain key concepts and principles, and create assignments or hands-on activities to 
                    allow students to develop practical skills.
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="companies" src="Assets/Images/usaid.jpg" alt="usaid">
            <div class="text-container">
                <h3>Former Cavite Provincial Health Office Mobile Vaccine Team Encoder under U.S. Agency for International Development (USAID)</h3>
                <p>
                    March 2022 - September 2022 <br> <br>
                    USAID is the world’s premier international development agency and catalytic actor 
                    driving development results. In partnership with Cavite Provincial Health Office 
                    to form the Cavite Mobile Vaccine Team giving COVID-19 Vaccines around the province. 
                    As an Encoder, the task is to record all data in the vaccine cards of the patients 
                    and encode it using Excel or DVAS, which includes their name, address, age, birthdate, 
                    telephone number, category, and vaccine inoculated to the patient. 
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="companies" src="Assets/Images/cvsu logo.png" alt="cvsu">
            <div class="text-container">
                <h3>Front-End Website Developer (On the Job Training) Cavite State University - Trece Martires City Campus Website. </h3>
                <p>
                    June 2021 - August 2021 <br> <br>
                    Cavite State University – Trece Martires City Campus Website (cvsutrececampus.com) 
                    is a website that contains information about the said campus including the student and 
                    staff portal. As a Front-End Developer of the website, the task given is to input the data 
                    needed for the creation of the website through the database. 
                </p>
            </div> 
        </div>
        
    </div>`;
}

// Add an event listener to the "Occupation" link
var occupationLink = document.querySelector('#row-one-container a[href="#Occupation"]');
if (occupationLink) {
    occupationLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        showOccupationDetails(); // Call the function to show occupation details
    });
}



// Function to change the content of row two when "Education" link is clicked
function showEducationDetails() {
    var rowTwo = document.getElementById('row-two');
    rowTwo.innerHTML = `
    <h1>Education</h1>
    <div id="row-two-container">
        <h1>Tertiary Education</h1>
        <div class="content-container">
            <img class="companies" src="Assets/Images/cvsu logo.png" alt="cvsu">
            <div class="text-container">
                <h3>Studied Bachelor of Science in Information Technology at Cavite State University Trece Campus</h3>
                <p>
                    Trece Martires City Cavite <br>
                    Class of 2017 - 2022
                </p>
            </div>
        </div>
        <h1>Secondary School</h1>
        <div class="content-container">
            <img class="companies" src="Assets/Images/lanhs.jpg" alt="lanhs">
            <div class="text-container">
                <h3>Studied at Luis Aguado National High School</h3>
                <p>
                    Trece Martires City Cavite <br>
                    Class of 2015
                </p>
            </div> 
        </div>
        <h1>Primary School</h1>
        <div class="content-container">
            <img class="companies" src="Assets/Images/malagasangelem.png" alt="malagasang">
            <div class="text-container">
                <h3>Studied at Malagasang 1-E Elementary School</h3>
                <p>
                    Imus Cavite <br>
                    Class of 2011
                </p>
            </div> 
        </div>
    </div>`;
}

// Add an event listener to the "Education" link
var educationLink = document.querySelector('#row-one-container a[href="#Education"]');
if (educationLink) {
    educationLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        showEducationDetails(); // Call the function to show education details
    });
}




// Function to change the content of row two when "Contact Info" link is clicked
function showContactInfoDetails() {
    var rowTwo = document.getElementById('row-two');
    rowTwo.innerHTML = `
    <h1>Contact info</h1>
    <div id="row-two-container">
        <h1>Contact number</h1>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/phone.png" alt="phone">
            <div class="text-container">
                <h3>0997 899 4298</h3>
                <p>
                    Phone number
                </p>
            </div>
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/whatsapp.png" alt="whatsapp">
            <div class="text-container">
                <h3>0997 899 4298</h3>
                <p>
                    Whatsapp contact number
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/viber.png" alt="viber">
            <div class="text-container">
                <h3>0997 899 4298</h3>
                <p>
                    Viber contact number
                </p>
            </div> 
        </div>
    </div>
    <div id="row-two-container">
        <h1>Emails</h1>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/gmail.png" alt="gmail">
            <div class="text-container">
                <h3>toledocarlojohn@gmail.com</h3>
                <p>
                    Gmail Account
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/outlook.png" alt="outlook">
            <div class="text-container">
                <h3>toledocarlojohn@outlook.com</h3>
                <p>
                    Outlook Account
                </p>
            </div> 
        </div>
    </div>
    <div id="row-two-container">
        <h1>Social media accounts</h1>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/facebook.png" alt="facebook">
            <div class="text-container">
                <h3>facebook.com/carlo.toledo0105/</h3>
                <p>
                    Facebook account link
                </p>
            </div> 
        </div>
        <div class="content-container">
        <img class="icons" src="Assets/Images/Icons/youtube.png" alt="youtube">
        <div class="text-container">
            <h3>youtube.com/@carlojohntoledo5971</h3>
            <p>
                Youtube account link
            </p>
        </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/instagram.png" alt="instagram">
            <div class="text-container">
                <h3>instagram.com/koalomusic.ph</h3>
                <p>
                    Instagram account link
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/tiktok.png" alt="tiktok">
            <div class="text-container">
                <h3>tiktok.com/koalomusic.ph</h3>
                <p>
                    Tiktok account link
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/threads.png" alt="threads">
            <div class="text-container">
                <h3>threads.net/koalomusic.ph</h3>
                <p>
                    Threads account link
                </p>
            </div> 
        </div>
    </div>
    <div id="row-two-container">
        <h1>Links</h1>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/spotify.png" alt="spotify">
            <div class="text-container">
            <a text-decoration="none" href="https://open.spotify.com/artist/5XbyT2tunaCbetacxld6ZM?si=MSZkIPRFRa-bKmTrKhQ37w">
                <h3>spotify/artist/Koalo</h3>
                <p>
                    Spotify account link
                </p>
            </a>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/itchio.svg" alt="itch.io">
            <div class="text-container">
            <a text-decoration="none" href="https://carlojohntoledo.itch.io/">
                <h3>carlojohntoledo.itch.io/Koalo</h3>
                <p>
                    Itch.io account link
                </p>
            </a>
            </div> 
        </div>
    </div>
    `;
}

// Add an event listener to the "Contact info" link
var contactinfoLink = document.querySelector('#row-one-container a[href="#ContactInfo"]');
if (contactinfoLink) {
    contactinfoLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        showContactInfoDetails(); // Call the function to show Contact info details
    });
}



// Function to change the content of row two when "Education" link is clicked
function showAboutmeDetails() {
    var rowTwo = document.getElementById('row-two');
    rowTwo.innerHTML = `
    <h1>Details about Carlo</h1>
    <div id="row-two-container">
        <h1>Biography</h1>
        <div class="biography-content-container">
            <div class="biography-text-container">
                <p>
                <strong>Carlo John Toledo Pabien</strong>, born on May 12, 1999, in Bacoor City, Cavite, came into this world as the third of four siblings,
                raised by his parents Dynna Pabien and Jovito Pabien. His early years were shaped by the vibrant atmosphere of Imus Cavite, 
                where he developed a curiosity and eagerness to explore. <br> <br>

                Carlo embarked on his academic journey in Malagasang 1-E Elementary School, Imus, Cavite, for his elementary education. Later, 
                he transitioned to Luis Aguado National High School in Trece Martires City during his first year of high school. Throughout his 
                formative years, Carlo exhibited a keen interest in various skills, particularly in the realm of music and arts. <br> <br>
                
                In pursuit of his passion, Carlo initially set his sights on a career in architecture when he entered college. However, 
                his journey took an unexpected turn, leading him to a different path—Bachelor of Science in Information Technology (BSIT). 
                Despite the initial deviation from his original plan, Carlo discovered his aptitude for working with computers, turning the 
                change of course into a valuable and fulfilling experience. <br> <br>
                
                Carlo successfully navigated the challenges of college life and emerged as a proud graduate of Cavite State University Trece 
                Martires City Campus, belonging to the class of 2017 to 2022. His dedication and perseverance were further exemplified when he 
                achieved success in the Civil Service Commission exam of 2023, showcasing his commitment to personal and professional development. <br> <br>
                
                Now equipped with a solid educational foundation and the distinction of a BSIT graduate, Carlo is poised to embark on a promising 
                career in Information Technology. Fueled by a passion for delivering efficient and impactful services, he is actively seeking opportunities 
                to elevate his IT career to new heights. With a blend of skills, education, and determination, Carlo John Toledo Pabien is ready to make meaningful 
                contributions to the dynamic world of Information Technology. <br> <br>
                </p>
            </div>
        </div>
        <h1>Basic info</h1>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/user.png" alt="user">
            <div class="text-container">
                <h3>Male</h3>
                <p>
                    Gender
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/information-button.png" alt="info">
            <div class="text-container">
                <h3>English - Filipino</h3>
                <p>
                    Language
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/location.png" alt="location">
            <div class="text-container">
                <h3>Trece Martires City, Cavite</h3>
                <p>
                    Location
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/internet.png" alt="citizen">
            <div class="text-container">
                <h3>Filipino</h3>
                <p>
                    Citizenship
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/height.png" alt="height">
            <div class="text-container">
                <h3>160cm</h3>
                <p>
                    Height
                </p>
            </div> 
        </div>
        <div class="content-container">
            <img class="icons" src="Assets/Images/Icons/weight-scale.png" alt="weight">
            <div class="text-container">
                <h3>50kg</h3>
                <p>
                    Weight
                </p>
            </div> 
        </div>
    </div>`;
}

// Add an event listener to the "Aboutme" link
var aboutmeLink = document.querySelector('#row-one-container a[href="#Aboutme"]');
if (aboutmeLink) {
    aboutmeLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        showAboutmeDetails(); // Call the function to show Aboutme details
    });
}