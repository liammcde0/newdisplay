/* =========================================================
   TRINITY HIGH SCHOOL
   DIGITAL INFORMATION DISPLAY
   ========================================================= */


/* =========================================================
   FIREBASE IMPORTS
   ========================================================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    doc,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyBXrj6SEcEVl0ThXUQn2xSDw9KfxC07GlM",

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


/* =========================================================
   START FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);




/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const timeElement =
    document.getElementById("time");

const dayElement =
    document.getElementById("day");

const dateElement =
    document.getElementById("date");

const periodNameElement =
    document.getElementById("periodName");

const periodEndElement =
    document.getElementById("periodEnd");


const assemblyContainer =
    document.getElementById("assemblyContainer");

const assemblyYearElement =
    document.getElementById("assemblyYear");


const noticeList =
    document.getElementById("noticeList");

const noticeCount =
    document.getElementById("noticeCount");


const announcementContainer =
    document.getElementById("announcementContainer");

const announcementTitle =
    document.getElementById("announcementTitle");

const announcementMessage =
    document.getElementById("announcementMessage");

const announcementIndicators =
    document.getElementById("announcementIndicators");


const takeoverScreen =
    document.getElementById("takeoverScreen");

const mainScreen =
    document.getElementById("mainScreen");

const takeoverLabel =
    document.getElementById("takeoverLabel");

const takeoverTitle =
    document.getElementById("takeoverTitle");

const takeoverSubtitle =
    document.getElementById("takeoverSubtitle");

const takeoverMessage =
    document.getElementById("takeoverMessage");


const connectionStatus =
    document.getElementById("connectionStatus");


/* =========================================================
   TIME HELPER

   Converts:

   14:40

   into minutes since midnight.
   ========================================================= */

function minutes(timeString) {

    const [hours, mins] =
        timeString.split(":").map(Number);

    return (hours * 60) + mins;
}


/* =========================================================
   NORMAL SCHOOL PERIODS
   ========================================================= */

const periods = [

    ["08:45", "09:35", "Period 1"],

    ["09:35", "10:25", "Period 2"],

    ["10:25", "10:40", "Break"],

    ["10:40", "11:30", "Period 3"],

    ["11:30", "12:20", "Period 4"],

    ["12:20", "13:10", "Period 5"],

    ["13:10", "13:50", "Lunch"],

    ["13:50", "14:40", "Period 6"]

];


/* =========================================================
   GET CURRENT PERIOD
   ========================================================= */

function getCurrentPeriod() {

    const now = new Date();

    const day = now.getDay();

    const currentMinutes =
        (now.getHours() * 60) +
        now.getMinutes();


    /* -----------------------------------------------------
       WEEKENDS
       ----------------------------------------------------- */

    if (day === 0 || day === 6) {

        return {
            name: "School Closed",
            end: ""
        };

    }


    /* -----------------------------------------------------
       BEFORE SCHOOL
       ----------------------------------------------------- */

    if (currentMinutes < minutes("08:45")) {

        return {
            name: "Before School",
            end: ""
        };

    }


    /* -----------------------------------------------------
       PERIODS 1 - 6
       ----------------------------------------------------- */

    for (const period of periods) {

        if (
            currentMinutes >= minutes(period[0]) &&
            currentMinutes < minutes(period[1])
        ) {

            return {
                name: period[2],
                end: period[1]
            };

        }

    }


    /* -----------------------------------------------------
       MONDAY + WEDNESDAY

       Tutor Time
       14:40 - 15:05
       ----------------------------------------------------- */

    if (day === 1 || day === 3) {

        if (
            currentMinutes >= minutes("14:40") &&
            currentMinutes < minutes("15:05")
        ) {

            return {
                name: "Tutor Time",
                end: "15:05"
            };

        }

    }


    /* -----------------------------------------------------
       TUESDAY + THURSDAY

       Period 7
       14:40 - 15:30
       ----------------------------------------------------- */

    if (day === 2 || day === 4) {

        if (
            currentMinutes >= minutes("14:40") &&
            currentMinutes < minutes("15:30")
        ) {

            return {
                name: "Period 7",
                end: "15:30"
            };

        }

    }


    /* -----------------------------------------------------
       SCHOOL HAS FINISHED
       ----------------------------------------------------- */

    return {
        name: "School Finished",
        end: ""
    };

}


/* =========================================================
   CLOCK + PERIOD DISPLAY
   ========================================================= */

function updateClock() {

    const now = new Date();


    /* TIME */

    timeElement.textContent =
        now.toLocaleTimeString(
            "en-GB",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    /* DAY */

    dayElement.textContent =
        now.toLocaleDateString(
            "en-GB",
            {
                weekday: "long"
            }
        ).toUpperCase();


    /* DATE */

    dateElement.textContent =
        now.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    /* CURRENT PERIOD */

    const period =
        getCurrentPeriod();

    periodNameElement.textContent =
        period.name;


    if (period.end) {

        periodEndElement.textContent =
            `Finishes at ${period.end}`;

    } else {

        periodEndElement.textContent = "";

    }


    /* Assembly visibility depends partly on timetable */

    updateAssemblyDisplay();

}


/* =========================================================
   FIREBASE CONNECTION STATUS
   ========================================================= */

function setConnected() {

    connectionStatus.textContent =
        "Connected";

    connectionStatus.classList.add(
        "connected"
    );

    connectionStatus.classList.remove(
        "disconnected"
    );

}


function setDisconnected() {

    connectionStatus.textContent =
        "Connection Error";

    connectionStatus.classList.remove(
        "connected"
    );

    connectionStatus.classList.add(
        "disconnected"
    );

}


/* =========================================================
   SCHOOL NOTICES

   Firestore:

   config
       notices

   Field:

   items: [
       "Notice one",
       "Notice two"
   ]
   ========================================================= */

const noticesReference =
    doc(
        db,
        "config",
        "notices"
    );


onSnapshot(

    noticesReference,

    (snapshot) => {

        setConnected();


        /* Clear old notices */

        noticeList.innerHTML = "";


        if (!snapshot.exists()) {

            showNoNotices();

            return;

        }


        const data =
            snapshot.data();


        const notices =
            Array.isArray(data.items)
                ? data.items
                : [];


        if (notices.length === 0) {

            showNoNotices();

            return;

        }


        /* Show number of notices */

        noticeCount.textContent =
            notices.length;


        /* Add notices to screen */

        notices.forEach((notice) => {

            const listItem =
                document.createElement("li");

            listItem.textContent =
                notice;

            noticeList.appendChild(
                listItem
            );

        });

    },

    (error) => {

        console.error(
            "Notice listener error:",
            error
        );

        setDisconnected();

    }

);


/* =========================================================
   NO NOTICES MESSAGE
   ========================================================= */

function showNoNotices() {

    noticeCount.textContent = "0";


    const listItem =
        document.createElement("li");

    listItem.textContent =
        "There are currently no school notices.";

    noticeList.appendChild(
        listItem
    );

}


/* =========================================================
   ASSEMBLY

   Firestore:

   config
       assembly

   Fields:

   enabled: true
   yearGroup: "S3"

   The banner will only appear during Tutor Time
   on Monday or Wednesday.
   ========================================================= */

let assemblyData = {

    enabled: false,

    yearGroup: ""

};


const assemblyReference =
    doc(
        db,
        "config",
        "assembly"
    );


onSnapshot(

    assemblyReference,

    (snapshot) => {

        setConnected();


        if (!snapshot.exists()) {

            assemblyData = {
                enabled: false,
                yearGroup: ""
            };

            updateAssemblyDisplay();

            return;

        }


        const data =
            snapshot.data();


        assemblyData = {

            enabled:
                data.enabled === true,

            yearGroup:
                data.yearGroup || ""

        };


        updateAssemblyDisplay();

    },

    (error) => {

        console.error(
            "Assembly listener error:",
            error
        );

        setDisconnected();

    }

);


/* =========================================================
   UPDATE ASSEMBLY DISPLAY
   ========================================================= */

function updateAssemblyDisplay() {

    const now =
        new Date();

    const day =
        now.getDay();

    const period =
        getCurrentPeriod();


    const tutorTime =
        (
            day === 1 ||
            day === 3
        )
        &&
        period.name ===
        "Tutor Time";


    if (
        assemblyData.enabled &&
        tutorTime &&
        assemblyData.yearGroup
    ) {

        assemblyYearElement.textContent =
            assemblyData.yearGroup;

        assemblyContainer.classList.remove(
            "hidden"
        );

    } else {

        assemblyContainer.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   ROTATING ANNOUNCEMENTS

   Firestore:

   config
       announcements

   Field:

   items: [
       {
           title: "School Photos",
           message: "School photos are tomorrow."
       },
       {
           title: "Drama",
           message: "Rehearsal after school."
       }
   ]
   ========================================================= */

let announcements = [];

let currentAnnouncement = 0;

let announcementTimer = null;


/* Time each announcement stays on screen */

const ANNOUNCEMENT_TIME = 10000;


const announcementsReference =
    doc(
        db,
        "config",
        "announcements"
    );


onSnapshot(

    announcementsReference,

    (snapshot) => {

        setConnected();


        if (!snapshot.exists()) {

            announcements = [];

            hideAnnouncements();

            return;

        }


        const data =
            snapshot.data();


        announcements =
            Array.isArray(data.items)
                ? data.items
                : [];


        /* Remove empty/invalid announcements */

        announcements =
            announcements.filter(
                (announcement) =>

                    announcement &&

                    (
                        announcement.title ||
                        announcement.message
                    )
            );


        currentAnnouncement = 0;


        startAnnouncements();

    },

    (error) => {

        console.error(
            "Announcement listener error:",
            error
        );

        setDisconnected();

    }

);


/* =========================================================
   START ANNOUNCEMENT ROTATION
   ========================================================= */

function startAnnouncements() {

    if (announcementTimer) {

        clearInterval(
            announcementTimer
        );

        announcementTimer = null;

    }


    if (announcements.length === 0) {

        hideAnnouncements();

        return;

    }


    announcementContainer.classList.remove(
        "hidden"
    );


    createAnnouncementIndicators();


    showAnnouncement(
        currentAnnouncement
    );


    /* Only rotate if there is more than one */

    if (announcements.length > 1) {

        announcementTimer =
            setInterval(
                nextAnnouncement,
                ANNOUNCEMENT_TIME
            );

    }

}


/* =========================================================
   SHOW ANNOUNCEMENT
   ========================================================= */

function showAnnouncement(index) {

    if (announcements.length === 0) {

        hideAnnouncements();

        return;

    }


    const announcement =
        announcements[index];


    announcementTitle.textContent =
        announcement.title || "";


    announcementMessage.textContent =
        announcement.message || "";


    updateAnnouncementIndicators();

}


/* =========================================================
   NEXT ANNOUNCEMENT
   ========================================================= */

function nextAnnouncement() {

    currentAnnouncement++;


    if (
        currentAnnouncement >=
        announcements.length
    ) {

        currentAnnouncement = 0;

    }


    showAnnouncement(
        currentAnnouncement
    );

}


/* =========================================================
   ANNOUNCEMENT DOTS
   ========================================================= */

function createAnnouncementIndicators() {

    announcementIndicators.innerHTML = "";


    /* Don't need dots for only one announcement */

    if (announcements.length <= 1) {

        return;

    }


    announcements.forEach(
        (_, index) => {

            const dot =
                document.createElement("span");


            dot.classList.add(
                "announcement-dot"
            );


            dot.dataset.index =
                index;


            announcementIndicators.appendChild(
                dot
            );

        }
    );


    updateAnnouncementIndicators();

}


/* =========================================================
   UPDATE ACTIVE DOT
   ========================================================= */

function updateAnnouncementIndicators() {

    const dots =
        announcementIndicators.querySelectorAll(
            ".announcement-dot"
        );


    dots.forEach(
        (dot, index) => {

            if (
                index ===
                currentAnnouncement
            ) {

                dot.classList.add(
                    "active"
                );

            } else {

                dot.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   HIDE ANNOUNCEMENT AREA
   ========================================================= */

function hideAnnouncements() {

    announcementContainer.classList.add(
        "hidden"
    );


    announcementIndicators.innerHTML = "";


    if (announcementTimer) {

        clearInterval(
            announcementTimer
        );

        announcementTimer = null;

    }

}


/* =========================================================
   FULL SCREEN TAKEOVER

   Firestore:

   config
       display

   Fields:

   takeoverEnabled: true

   takeoverLabel:
       "SCHOOL ANNOUNCEMENT"

   takeoverTitle:
       "S6 ASSEMBLY"

   takeoverSubtitle:
       "THEATRE"

   takeoverMessage:
       "Please proceed immediately"
   ========================================================= */

const displayReference =
    doc(
        db,
        "config",
        "display"
    );


onSnapshot(

    displayReference,

    (snapshot) => {

        setConnected();


        if (!snapshot.exists()) {

            disableTakeover();

            return;

        }


        const data =
            snapshot.data();


        if (
            data.takeoverEnabled === true
        ) {

            enableTakeover(data);

        } else {

            disableTakeover();

        }

    },

    (error) => {

        console.error(
            "Display listener error:",
            error
        );

        setDisconnected();

    }

);


/* =========================================================
   ENABLE TAKEOVER
   ========================================================= */

function enableTakeover(data) {

    takeoverLabel.textContent =
        data.takeoverLabel ||
        "SCHOOL ANNOUNCEMENT";


    takeoverTitle.textContent =
        data.takeoverTitle ||
        "";


    takeoverSubtitle.textContent =
        data.takeoverSubtitle ||
        "";


    takeoverMessage.textContent =
        data.takeoverMessage ||
        "";


    mainScreen.classList.add(
        "hidden"
    );


    takeoverScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   DISABLE TAKEOVER
   ========================================================= */

function disableTakeover() {

    takeoverScreen.classList.add(
        "hidden"
    );


    mainScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   INTERNET CONNECTION EVENTS
   ========================================================= */

window.addEventListener(
    "offline",
    () => {

        connectionStatus.textContent =
            "Offline";

        connectionStatus.classList.remove(
            "connected"
        );

        connectionStatus.classList.add(
            "disconnected"
        );

    }
);


window.addEventListener(
    "online",
    () => {

        connectionStatus.textContent =
            "Reconnecting...";

        connectionStatus.classList.remove(
            "disconnected"
        );

    }
);


/* =========================================================
   START DISPLAY
   ========================================================= */

updateClock();


/* Update clock every second */

setInterval(
    updateClock,
    1000
);


console.log(
    "Trinity High School display started."
);

console.log("TEST 123");

const params = new URLSearchParams(window.location.search);
const DISPLAY_ID = params.get("display") || "unknown";

console.log("Display ID:", DISPLAY_ID);
