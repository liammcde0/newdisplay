import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


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


const loginForm =
    document.getElementById("loginForm");

const staffIdInput =
    document.getElementById("staffId");

const passcodeInput =
    document.getElementById("passcode");

const loginButton =
    document.getElementById("loginButton");

const errorMessage =
    document.getElementById("errorMessage");


/*
If someone is already signed in,
send them straight to the dashboard.
*/

const existingSession =
    sessionStorage.getItem(
        "trinityDisplayUser"
    );

if (existingSession) {

    window.location.href =
        "dashboard.html";

}


/* LOGIN */

loginForm.addEventListener(
    "submit",

    async (event) => {

        event.preventDefault();


        const staffId =
            staffIdInput.value.trim();

        const passcode =
            passcodeInput.value;


        hideError();


        if (!staffId || !passcode) {

            showError(
                "Enter your Staff ID and passcode."
            );

            return;

        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing In...";


        try {

            const userReference =
                doc(
                    db,
                    "users",
                    staffId
                );


            const snapshot =
                await getDoc(
                    userReference
                );


            /*
            Don't say whether the ID or
            passcode was wrong.
            */

            if (!snapshot.exists()) {

                showError(
                    "Incorrect Staff ID or passcode."
                );

                resetButton();

                return;

            }


            const user =
                snapshot.data();


            if (user.enabled === false) {

                showError(
                    "This account has been disabled."
                );

                resetButton();

                return;

            }


            if (
                String(user.passcode) !==
                String(passcode)
            ) {

                showError(
                    "Incorrect Staff ID or passcode."
                );

                resetButton();

                return;

            }


            const session = {

                id: staffId,

                name:
                    user.name ||
                    "Staff Member",

                role:
                    user.role ||
                    "staff"

            };


            sessionStorage.setItem(

                "trinityDisplayUser",

                JSON.stringify(session)

            );


            window.location.href =
                "dashboard.html";

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            showError(
                "Unable to connect to the display system."
            );


            resetButton();

        }

    }
);


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}


function resetButton() {

    loginButton.disabled =
        false;

    loginButton.textContent =
        "Sign In";

}
