
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

// =============================================================
// ✅ Unified Occupation Details (Real-time with full actions)
// =============================================================
async function showOccupationDetails() {
    const rowTwo = document.getElementById("row-two");
    if (!rowTwo) return;

    // 🔹 Inject header + add button
    rowTwo.innerHTML = `
        <div class="abt-flex-container">
            <h1>Employment History</h1>
            <div class="add-new-form-btn" id="add-new-occupation">+</div>
        </div>
        <div id="row-two-container" class="flex justify-center items-center min-h-[200px]"></div>
    `;

    const container = document.getElementById("row-two-container");
    if (!container) return;

    // 🔹 Show Tailwind skeleton loader while waiting
    container.innerHTML = `
        <div class="content-loader">
            <div class="wrapper">
                <div class="circle"></div>
                <div class="line-1"></div>
                <div class="line-2"></div>
                <div class="line-3"></div>
                <div class="line-4"></div>
            </div>
        </div>
    `;

    // =============================================================
    // 🔹 Real-time Firestore snapshot listener
    // =============================================================
    db.collection("occupations")
        .orderBy("from", "desc") // newest job first
        .onSnapshot(snapshot => {
            container.innerHTML = ""; // clear loader + old content

            if (snapshot.empty) {
                container.innerHTML = `<p>No occupations found.</p>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();

                // 🔹 Date formatting
                const fromDate = data.from ? new Date(data.from).toLocaleDateString() : "";
                let displayToDate = "Present";
                if (data.to && data.to !== "Present") {
                    displayToDate = new Date(data.to).toLocaleDateString();
                }

                // 🔹 Add "Former" if ended before today
                let jobTitle = data.jobTitle || "Untitled Job";
                if (data.to && data.to !== "Present" && new Date(data.to) < new Date()) {
                    jobTitle = `Former ${data.jobTitle}`;
                }

                // 🔹 Build occupation card
                const occupationDiv = document.createElement("div");
                occupationDiv.classList.add("content-container");
                occupationDiv.dataset.id = doc.id;

                occupationDiv.innerHTML = `
                    <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" 
                        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18
                                 -2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42
                                 c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 
                                 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081
                                 -.768-2.015-1.837-2.175a48.114 48.114 0 0 
                                 0-3.413-.387m4.5 8.006c-.194.165-.42.295
                                 -.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 
                                 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 
                                 1-.673-.38m0 0A2.18 2.18 0 0 1 3 
                                 12.489V8.706c0-1.081.768-2.015 1.837-2.175
                                 a48.111 48.111 0 0 1 3.413-.387m7.5 
                                 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 
                                 2.25 0 0 0-2.25 2.25v.894m7.5 
                                 0a48.667 48.667 0 0 0-7.5 0M12 
                                 12.75h.008v.008H12v-.008Z">
                        </path>
                    </svg>
                    <div class="text-container">
                        <h3>${jobTitle} at ${data.company || "Unknown Company"}</h3>
                        <p>${fromDate} - ${displayToDate} <br><br>
                        ${data.description || ""}</p>
                    </div>
                    <div class="occupation-actions">
                        <button class="occupation-edit">Edit</button>
                        <button class="occupation-delete">✖</button>
                    </div>
                `;

                container.appendChild(occupationDiv);

                // =============================================================
                // 🔹 DELETE Handler
                // =============================================================
                const delBtn = occupationDiv.querySelector(".occupation-delete");
                if (delBtn) {
                    delBtn.addEventListener("click", async () => {
                        if (confirm("Delete this occupation?")) {
                            await db.collection("occupations").doc(doc.id).delete();
                            console.log("❌ Occupation deleted:", doc.id);
                        }
                    });
                }

                // =============================================================
                // 🔹 EDIT Handler
                // =============================================================
                const editBtn = occupationDiv.querySelector(".occupation-edit");
                if (editBtn) {
                    editBtn.addEventListener("click", () => {
                        showAddOccupationForm({
                            id: doc.id,
                            company: data.company || "",
                            jobTitle: data.jobTitle || "",
                            from: data.from ? new Date(data.from).toISOString().split("T")[0] : "",
                            to: data.to || "Present",
                            description: data.description || ""
                        });
                    });
                }
            });
        }, err => {
            console.error("❌ Error loading occupations:", err);
            container.innerHTML = `<p style="color:red;">Failed to load occupations.</p>`;
        });
}

// =============================================================
// ✅ Expose globally + link handler
// =============================================================
window.showOccupationDetails = showOccupationDetails;

const occupationLink = document.querySelector('#row-one-container a[href="#Occupation"]');
if (occupationLink) {
    occupationLink.addEventListener("click", function (event) {
        event.preventDefault();
        showOccupationDetails();
    });
}


// =============================================================
// ✅ SHOW EDUCATION DETAILS
// =============================================================
async function showEducationDetails() {
    const rowTwo = document.getElementById("row-two");
    if (!rowTwo) return;

    // Header layout
    rowTwo.innerHTML = `
        <div class="abt-flex-container">
            <h1>Educational Background</h1>
            <div class="add-new-form-btn" id="add-new-education">+</div>
        </div>
        <div id="row-two-container" class="edu-details-group"></div>
    `;

    const container = rowTwo.querySelector("#row-two-container");

    // 🔹 Show Tailwind skeleton loader while waiting
    container.innerHTML = `
        <div class="content-loader">
            <div class="wrapper">
                <div class="circle"></div>
                <div class="line-1"></div>
                <div class="line-2"></div>
                <div class="line-3"></div>
                <div class="line-4"></div>
            </div>
        </div>
    `;

    try {
        const snapshot = await db.collection("education")
            .orderBy("from", "desc")
            .get();

        if (snapshot.empty) {
            container.innerHTML = ``; // nothing if no education
            return;
        }

        // Group by education level
        const groups = {
            tertiary: [],
            secondary: [],
            primary: [],
            vocational: [],
            masters: [],
            doctorate: []
        };

        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (groups[data.level]) {
                groups[data.level].push(data);
            }
        });

        // Helper to render each section
        function renderSection(levelName, entries, label) {
            if (!entries.length) return null;

            const section = document.createElement("div");
            section.className = `${levelName}-section`;

            // Header
            const header = document.createElement("h1");
            header.className = `${levelName}-school`;
            header.textContent = label;
            section.appendChild(header);

            // Each education entry
            entries.forEach(edu => {
                const eduDiv = document.createElement("div");
                eduDiv.className = "content-container";
                eduDiv.style.position = "relative";

                eduDiv.innerHTML = `
                    <svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" 
                         viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M4.26 10.147a60.438 60.438 0 0 0-.491 
                            6.347A48.62 48.62 0 0 1 12 20.904a48.62 
                            48.62 0 0 1 8.232-4.41 60.46 60.46 0 
                            0 0-.491-6.347m-15.482 0a50.636 
                            50.636 0 0 0-2.658-.813A59.906 
                            59.906 0 0 1 12 3.493a59.903 
                            59.903 0 0 1 10.399 5.84c-.896.248
                            -1.783.52-2.658.814m-15.482 
                            0A50.717 50.717 0 0 1 12 
                            13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 
                            15a.75.75 0 1 0 0-1.5.75.75 
                            0 0 0 0 1.5Zm0 0v-3.675A55.378 
                            55.378 0 0 1 12 8.443m-7.007 
                            11.55A5.981 5.981 0 0 0 
                            6.75 15.75v-1.5"></path>
                    </svg>
                    <div class="text-container">
                        <h3>
                            ${edu.course ? `Studied ${edu.course} at ${edu.school}` : `Studied at ${edu.school}`}
                        </h3>
                        <p>
                            ${edu.address} <br>
                            Class of ${edu.from} - ${edu.to}
                        </p>
                    </div>

                    <!-- 🔹 Actions -->
                    <div class="education-actions">
                        <button class="education-edit">Edit</button>
                        <button class="education-delete">✖</button>
                    </div>
                `;

                section.appendChild(eduDiv);

                // =============================================================
                // 🔹 DELETE Handler (with loader)
                // =============================================================
                const delBtn = eduDiv.querySelector(".education-delete");
                delBtn.addEventListener("click", async () => {
                    if (confirm("Delete this education record?")) {
                        try {
                            showLoader();
                            await db.collection("education").doc(edu.id).delete();
                            console.log("❌ Education deleted:", edu.id);
                            await showEducationDetails(); // refresh
                        } catch (err) {
                            console.error("❌ Delete failed:", err);
                        } finally {
                            hideLoader();
                        }
                    }
                });

                // =============================================================
                // 🔹 EDIT Handler (with loader)
                // =============================================================
                const editBtn = eduDiv.querySelector(".education-edit");
                editBtn.addEventListener("click", async () => {
                    try {
                        showLoader();
                        showAddEducationForm({
                            id: edu.id,
                            level: edu.level || "",
                            school: edu.school || "",
                            address: edu.address || "",
                            course: edu.course || "",
                            status: edu.status || "",
                            from: edu.from ? new Date(edu.from).toISOString().split("T")[0] : "",
                            to: edu.to || "Present"
                        });
                    } catch (err) {
                        console.error("❌ Edit failed:", err);
                    } finally {
                        hideLoader();
                    }
                });
            });

            return section;
        }

        // Render all sections in order
        container.innerHTML = ""; // clear first
        const order = [
            ["tertiary", "Tertiary Education"],
            ["secondary", "Secondary School"],
            ["primary", "Primary School"],
            ["vocational", "Vocational"],
            ["masters", "Masters"],
            ["doctorate", "Doctorate"]
        ];

        order.forEach(([level, label]) => {
            const section = renderSection(level, groups[level], label);
            if (section) container.appendChild(section);
        });

    } catch (err) {
        console.error("❌ Error loading education:", err);
        container.innerHTML = `<p class="error">Failed to load education details.</p>`;
    }

    // 🔹 Wire the Add button
    const addBtn = rowTwo.querySelector("#add-new-education");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            showAddEducationForm();
        });
    }
}
window.showEducationDetails = showEducationDetails;



// Add click listener to the "Education" link
const educationLink = document.querySelector('#row-one-container a[href="#Education"]');
if (educationLink) {
    educationLink.addEventListener("click", function (event) {
        event.preventDefault();
        showEducationDetails();
    });
}

// =============================================================
// ✅ SHOW CONTACT DETAILS (with proper SVG icons)
// =============================================================
async function showContactInfoDetails() {
    const rowTwo = document.getElementById("row-two");
    if (!rowTwo) return;

    // Header layout
    rowTwo.innerHTML = `
        <div class="abt-flex-container">
            <h1>Contact Information</h1>
            <div class="add-new-form-btn" id="add-new-contact">+</div>
        </div>
        <div id="row-two-container" class="contact-details-group"></div>
    `;

    const container = rowTwo.querySelector("#row-two-container");

    // Loader
    container.innerHTML = `
        <div class="content-loader">
            <div class="wrapper">
                <div class="circle"></div>
                <div class="line-1"></div>
                <div class="line-2"></div>
                <div class="line-3"></div>
                <div class="line-4"></div>
            </div>
        </div>
    `;

    try {
        const snapshot = await db.collection("contacts")
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            container.innerHTML = `<p>No contact info yet.</p>`;
            return;
        }

        // Group by type
        const groups = {
            contactNumber: [],
            emailAddress: [],
            socialMedia: [],
            websiteLinks: []
        };

        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (groups[data.type]) {
                groups[data.type].push(data);
            }
        });

        // Helper to render each section
        function renderSection(typeKey, entries, label, svgIcon) {
            if (!entries.length) return null;

            const section = document.createElement("div");
            section.className = `${typeKey}-section`;

            const header = document.createElement("h1");
            header.textContent = label;
            header.style.fontSize = "var(--font-lg)"
            section.appendChild(header);

            entries.forEach(info => {
                const infoDiv = document.createElement("div");
                infoDiv.className = "content-container";
                infoDiv.style.position = "relative";

                let value = "";
                let platform = "";

                if (typeKey === "contactNumber") {
                    value = info.contactNum || "";
                    platform = info.contactNumPlatform || "";
                } else if (typeKey === "emailAddress") {
                    value = info.contactEmail || "";
                    platform = info.contactEmailPlatform || "";
                } else if (typeKey === "socialMedia") {
                    value = info.contactSocMed || "";
                    platform = info.contactSocMedPlatform || "";
                } else if (typeKey === "websiteLinks") {
                    value = info.contactLink || "";
                    platform = info.contactLinkPlatform || "";
                }

                infoDiv.innerHTML = `
                    <div class="icon">${svgIcon}</div>
                    <div class="text-container">
                        ${typeKey === "websiteLinks"
                        ? `<a href="${value}" target="_blank"><h3>${value}</h3></a>`
                        : `<h3>${value}</h3>`}
                        <p>${platform}</p>
                    </div>

                    <div class="contact-actions">
                        <button class="contact-edit">Edit</button>
                        <button class="contact-delete">✖</button>
                    </div>
                `;

                section.appendChild(infoDiv);

                // Delete
                const delBtn = infoDiv.querySelector(".contact-delete");
                delBtn.addEventListener("click", async () => {
                    if (confirm("Delete this contact info?")) {
                        try {
                            showLoader();
                            await db.collection("contacts").doc(info.id).delete();
                            console.log("❌ Contact deleted:", info.id);
                            await showContactInfoDetails();
                        } catch (err) {
                            console.error("❌ Delete failed:", err);
                        } finally {
                            hideLoader();
                        }
                    }
                });

                // Edit
                const editBtn = infoDiv.querySelector(".contact-edit");
                editBtn.addEventListener("click", () => {
                    showAddContactInfoForm(info);
                });
            });

            return section;
        }

        // Render sections with SVGs
        container.innerHTML = "";
        const order = [
            ["contactNumber", "Contact Numbers", `<svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"></path></svg>`],
            ["emailAddress", "Emails", `<svg class="icons" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12ZM16 12V13.5C16 14.8807 17.1193 16 18.5 16V16C19.8807 16 21 14.8807 21 13.5V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21H16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`],
            ["socialMedia", "Social Media Accounts", `<svg class="icons" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"></path></svg>`],
            ["websiteLinks", "Website Links", `<svg class="icons" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.63605 5.63605C7.19815 4.07395 9.73081 4.07395 11.2929 5.63605L14.1213 8.46448C15.6834 10.0266 15.6834 12.5592 14.1213 14.1213C13.7308 14.5119 13.0976 14.5119 12.7071 14.1213C12.3166 13.7308 12.3166 13.0976 12.7071 12.7071C13.4882 11.9261 13.4882 10.6597 12.7071 9.87869L9.87869 7.05026C9.09764 6.26922 7.83131 6.26922 7.05026 7.05026C6.26922 7.83131 6.26922 9.09764 7.05026 9.87869L7.75737 10.5858C8.1479 10.9763 8.14789 11.6095 7.75737 12C7.36685 12.3905 6.73368 12.3905 6.34316 12L5.63605 11.2929C4.07395 9.73081 4.07395 7.19815 5.63605 5.63605ZM11.2929 9.8787C11.6834 10.2692 11.6834 10.9024 11.2929 11.2929C10.5119 12.074 10.5119 13.3403 11.2929 14.1213L14.1213 16.9498C14.9024 17.7308 16.1687 17.7308 16.9498 16.9498C17.7308 16.1687 17.7308 14.9024 16.9498 14.1213L16.2427 13.4142C15.8521 13.0237 15.8521 12.3905 16.2427 12C16.6332 11.6095 17.2663 11.6095 17.6569 12L18.364 12.7071C19.9261 14.2692 19.9261 16.8019 18.364 18.364C16.8019 19.9261 14.2692 19.9261 12.7071 18.364L9.8787 15.5356C8.3166 13.9735 8.3166 11.4408 9.8787 9.8787C10.2692 9.48817 10.9024 9.48817 11.2929 9.8787Z" ></path></svg>`]
        ];

        order.forEach(([key, label, svg]) => {
            const section = renderSection(key, groups[key], label, svg);
            if (section) container.appendChild(section);
        });

    } catch (err) {
        console.error("❌ Error loading contact info:", err);
        container.innerHTML = `<p class="error">Failed to load contact details.</p>`;
    }

    // Add button
    const addBtn = rowTwo.querySelector("#add-new-contact");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            showAddContactInfoForm();
        });
    }
}
window.showContactInfoDetails = showContactInfoDetails;




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
    <div class="abt-flex-container">
        <h1>Personal Info</h1>
        <div class="add-new-form-btn" id="add-new-contact">+</div>
    </div>
    <div id="row-two-container">
        <h1>Biography</h1>
        <div class="biography-content-container">
            <div class="biography-text-container">
                <p>
                <strong>Carlo John Toledo Pabien</strong>, born on May 12, 1999, in Bacoor City, Cavite, came into this world as the third of four siblings,
                raised by his parents Dynna Pabien and Jovito Pabien. His early years were shaped by the vibrant atmosphere of Imus Cavite, 
                where he developed a curiosity and eagerness to explore.
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