import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getFirestore,
    doc,
    collection,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBXrj6SEcEVl0ThXUQn2xSDw9KfxC07GlM",

    authDomain:
        "trinity-display-8a44c.firebaseapp.com",

    projectId:
        "trinity-display-8a44c",

    storageBucket:
        "trinity-display-8a44c.firebasestorage.app",

    messagingSenderId:
        "41795584168",

    appId:
        "1:41795584168:web:2bb0f156a6bcceb423029d"
};


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);




/* =========================================================
   CURRENT USER
   ========================================================= */

const storedUser =
    sessionStorage.getItem(
        "trinityDisplayUser"
    );


if (!storedUser) {

    window.location.replace(
        "login.html"
    );

    throw new Error(
        "No active login session."
    );

}


const currentUser =
    JSON.parse(storedUser);


document.getElementById(
    "signedInUser"
).textContent =
    `SIGNED ON: ${currentUser.name.toUpperCase()}`;


/*
Only administrators can see
User Management.
*/

if (currentUser.role !== "admin") {

    document
        .querySelectorAll(".admin-only")
        .forEach(element => {

            element.classList.add(
                "hidden"
            );

        });

}


/* SIGN OUT */

document
    .getElementById("signOutButton")
    .addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "trinityDisplayUser"
            );

            window.location.replace(
                "login.html"
            );

        }
    );


/* =========================================================
   REFERENCES
   ========================================================= */

const noticesRef =
    doc(db, "config", "notices");

const announcementsRef =
    doc(db, "config", "announcements");

const assemblyRef =
    doc(db, "config", "assembly");

const displayRef =
    doc(db, "config", "display");


/* =========================================================
   LOCAL DATA
   ========================================================= */

let notices = [];

let announcements = [];


/* =========================================================
   NAVIGATION
   ========================================================= */

const navButtons =
    document.querySelectorAll(".nav-button");

const pages =
    document.querySelectorAll(".page");


function openPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active");

    });


    navButtons.forEach(button => {

        button.classList.remove("active");

    });


    document
        .getElementById(`page-${pageName}`)
        ?.classList.add("active");


    document
        .querySelector(
            `[data-page="${pageName}"]`
        )
        ?.classList.add("active");

}


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            openPage(
                button.dataset.page
            );

        }
    );

});


document
    .querySelectorAll("[data-open-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    button.dataset.openPage
                );

            }
        );

    });


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent =
        message;

    toast.classList.add("show");


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================================
   CONNECTION
   ========================================================= */

function connected() {

    document.getElementById(
        "connectionStatus"
    ).textContent =
        "Firebase Connected";

}


/* =========================================================
   NOTICES LISTENER
   ========================================================= */

onSnapshot(

    noticesRef,

    snapshot => {

        connected();


        notices =
            snapshot.exists()
                ? snapshot.data().items || []
                : [];


        renderNotices();


        document.getElementById(
            "noticeStatus"
        ).textContent =
            notices.length;

    }

);


/* =========================================================
   RENDER NOTICES
   ========================================================= */

function renderNotices() {

    const container =
        document.getElementById(
            "noticeManager"
        );


    container.innerHTML = "";


    if (notices.length === 0) {

        container.textContent =
            "No notices.";

        return;

    }


    notices.forEach(
        (notice, index) => {

            const item =
                document.createElement("div");

            item.className =
                "manager-item";


            const text =
                document.createElement("div");

            text.className =
                "manager-content";

            text.textContent =
                notice;


            const remove =
                document.createElement("button");

            remove.className =
                "delete-button";

            remove.textContent =
                "Remove";


            remove.addEventListener(
                "click",
                () => removeNotice(index)
            );


            item.append(
                text,
                remove
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   ADD NOTICE
   ========================================================= */

document
    .getElementById("addNotice")
    .addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "newNotice"
                );


            const text =
                input.value.trim();


            if (!text) {

                showToast(
                    "Enter a notice first."
                );

                return;

            }


            const updated = [
                ...notices,
                text
            ];


            await setDoc(

                noticesRef,

                {
                    items: updated
                },

                {
                    merge: true
                }

            );


            input.value = "";


            showToast(
                "Notice added."
            );

        }
    );


/* =========================================================
   REMOVE NOTICE
   ========================================================= */

async function removeNotice(index) {

    const updated =
        notices.filter(
            (_, i) => i !== index
        );


    await setDoc(

        noticesRef,

        {
            items: updated
        },

        {
            merge: true
        }

    );


    showToast(
        "Notice removed."
    );

}


/* =========================================================
   ANNOUNCEMENTS LISTENER
   ========================================================= */

onSnapshot(

    announcementsRef,

    snapshot => {

        connected();


        announcements =
            snapshot.exists()
                ? snapshot.data().items || []
                : [];


        renderAnnouncements();


        document.getElementById(
            "announcementStatus"
        ).textContent =
            announcements.length;

    }

);


/* =========================================================
   RENDER ANNOUNCEMENTS
   ========================================================= */

function renderAnnouncements() {

    const container =
        document.getElementById(
            "announcementManager"
        );


    container.innerHTML = "";


    if (announcements.length === 0) {

        container.textContent =
            "No announcements.";

        return;

    }


    announcements.forEach(
        (announcement, index) => {

            const item =
                document.createElement("div");

            item.className =
                "manager-item";


            const content =
                document.createElement("div");

            content.className =
                "manager-content";


            const title =
                document.createElement("strong");

            title.textContent =
                announcement.title || "";


            const message =
                document.createElement("span");

            message.textContent =
                announcement.message || "";


            content.append(
                title,
                message
            );


            const remove =
                document.createElement("button");

            remove.className =
                "delete-button";

            remove.textContent =
                "Remove";


            remove.addEventListener(
                "click",
                () =>
                    removeAnnouncement(index)
            );


            item.append(
                content,
                remove
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   ADD ANNOUNCEMENT
   ========================================================= */

document
    .getElementById(
        "addAnnouncement"
    )
    .addEventListener(
        "click",
        async () => {

            const title =
                document
                    .getElementById(
                        "announcementTitle"
                    )
                    .value
                    .trim();


            const message =
                document
                    .getElementById(
                        "announcementMessage"
                    )
                    .value
                    .trim();


            if (!title && !message) {

                showToast(
                    "Enter an announcement."
                );

                return;

            }


            const updated = [

                ...announcements,

                {
                    title,
                    message
                }

            ];


            await setDoc(

                announcementsRef,

                {
                    items: updated
                },

                {
                    merge: true
                }

            );


            document.getElementById(
                "announcementTitle"
            ).value = "";


            document.getElementById(
                "announcementMessage"
            ).value = "";


            showToast(
                "Announcement added."
            );

        }
    );


/* =========================================================
   REMOVE ANNOUNCEMENT
   ========================================================= */

async function removeAnnouncement(index) {

    const updated =
        announcements.filter(
            (_, i) => i !== index
        );


    await setDoc(

        announcementsRef,

        {
            items: updated
        },

        {
            merge: true
        }

    );


    showToast(
        "Announcement removed."
    );

}


/* =========================================================
   ASSEMBLY
   ========================================================= */

onSnapshot(

    assemblyRef,

    snapshot => {

        connected();


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.data();


        document.getElementById(
            "assemblyEnabled"
        ).checked =
            data.enabled === true;


        document.getElementById(
            "assemblyYear"
        ).value =
            data.yearGroup || "";


        document.getElementById(
            "assemblyStatus"
        ).textContent =
            data.enabled
                ? data.yearGroup || "Enabled"
                : "Disabled";

    }

);


document
    .getElementById(
        "saveAssembly"
    )
    .addEventListener(
        "click",
        async () => {

            const enabled =
                document.getElementById(
                    "assemblyEnabled"
                ).checked;


            const yearGroup =
                document.getElementById(
                    "assemblyYear"
                ).value;


            await setDoc(

                assemblyRef,

                {
                    enabled,
                    yearGroup
                },

                {
                    merge: true
                }

            );


            showToast(
                "Assembly settings saved."
            );

        }
    );


/* =========================================================
   SCREEN TAKEOVER
   ========================================================= */

onSnapshot(

    displayRef,

    snapshot => {

        connected();


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.data();


        document.getElementById(
            "takeoverLabel"
        ).value =
            data.takeoverLabel ||
            "SCHOOL ANNOUNCEMENT";


        document.getElementById(
            "takeoverTitle"
        ).value =
            data.takeoverTitle || "";


        document.getElementById(
            "takeoverSubtitle"
        ).value =
            data.takeoverSubtitle || "";


        document.getElementById(
            "takeoverMessage"
        ).value =
            data.takeoverMessage || "";


        const active =
            data.takeoverEnabled === true;


        document.getElementById(
            "takeoverWarning"
        ).classList.toggle(
            "hidden",
            !active
        );


        document.getElementById(
            "displayStatus"
        ).textContent =
            active
                ? "TAKEOVER ACTIVE"
                : "Normal";

    }

);


/* =========================================================
   ACTIVATE TAKEOVER
   ========================================================= */

document
    .getElementById(
        "activateTakeover"
    )
    .addEventListener(
        "click",
        async () => {

            await setDoc(

                displayRef,

                {
                    takeoverEnabled: true,

                    takeoverLabel:
                        document.getElementById(
                            "takeoverLabel"
                        ).value.trim(),

                    takeoverTitle:
                        document.getElementById(
                            "takeoverTitle"
                        ).value.trim(),

                    takeoverSubtitle:
                        document.getElementById(
                            "takeoverSubtitle"
                        ).value.trim(),

                    takeoverMessage:
                        document.getElementById(
                            "takeoverMessage"
                        ).value.trim()

                },

                {
                    merge: true
                }

            );


            showToast(
                "Screen takeover activated."
            );

        }
    );


/* =========================================================
   STOP TAKEOVER
   ========================================================= */

document
    .getElementById(
        "stopTakeover"
    )
    .addEventListener(
        "click",
        async () => {

            await setDoc(

                displayRef,

                {
                    takeoverEnabled: false
                },

                {
                    merge: true
                }

            );


            showToast(
                "Normal display restored."
            );

        }
    );


/* =========================================================
   USER MANAGEMENT

   Firestore collection:

   users
       1001
       1002
       etc.
   ========================================================= */

async function loadUsers() {

    const container =
        document.getElementById(
            "userManager"
        );


    container.innerHTML =
        "Loading...";


    const snapshot =
        await getDocs(
            collection(db, "users")
        );


    container.innerHTML = "";


    if (snapshot.empty) {

        container.textContent =
            "No users have been created.";

        return;

    }


    snapshot.forEach(
        userDocument => {

            const user =
                userDocument.data();


            const item =
                document.createElement("div");

            item.className =
                "manager-item";


            const content =
                document.createElement("div");

            content.className =
                "manager-content";


            const name =
                document.createElement("strong");

            name.textContent =
                user.name || userDocument.id;


            const details =
                document.createElement("span");

            details.textContent =
                `${userDocument.id} • ${user.role || "staff"}`;


            content.append(
                name,
                details
            );


            const remove =
                document.createElement("button");

            remove.className =
                "delete-button";

            remove.textContent =
                "Delete";


            remove.addEventListener(
                "click",
                async () => {

if (
    userDocument.id ===
    currentUser.id
) {

    showToast(
        "You cannot delete the account you are currently using."
    );

    return;

}
                
                    const confirmed =
                        confirm(
                            `Delete ${user.name}?`
                        );


                    if (!confirmed) {

                        return;

                    }


                    await deleteDoc(

                        doc(
                            db,
                            "users",
                            userDocument.id
                        )

                    );


                    showToast(
                        "User deleted."
                    );


                    loadUsers();

                }
            );


            item.append(
                content,
                remove
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   CREATE USER
   ========================================================= */

document
    .getElementById(
        "createUser"
    )
    .addEventListener(
        "click",
        async () => {

            const name =
                document
                    .getElementById(
                        "newUserName"
                    )
                    .value
                    .trim();


            const staffId =
                document
                    .getElementById(
                        "newUserId"
                    )
                    .value
                    .trim();


            const passcode =
                document
                    .getElementById(
                        "newUserPasscode"
                    )
                    .value;


            const role =
                document.getElementById(
                    "newUserRole"
                ).value;


            if (
                !name ||
                !staffId ||
                !passcode
            ) {

                showToast(
                    "Complete all user fields."
                );

                return;

            }


            await setDoc(

                doc(
                    db,
                    "users",
                    staffId
                ),

                {
                    name,
                    passcode,
                    role,
                    enabled: true
                }

            );


            document.getElementById(
                "newUserName"
            ).value = "";


            document.getElementById(
                "newUserId"
            ).value = "";


            document.getElementById(
                "newUserPasscode"
            ).value = "";


            showToast(
                "User created."
            );


            loadUsers();

        }
    );


/* =========================================================
   START
   ========================================================= */

loadUsers();

console.log(
    "Trinity Display Admin loaded."
);
