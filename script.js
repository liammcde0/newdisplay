
            "=== DISPLAY CONFIGURATION ==="
        );

        console.log(
            "ID:",
            DISPLAY_ID
        );

        console.log(
            "Name:",
            displayConfig.name || "Unnamed Display"
        );

        console.log(
            "Location:",
            displayConfig.location || "Unknown"
        );

        console.log(
            "Group:",
            displayConfig.group || "None"
        );

        console.log(
            "Enabled:",
            displayConfig.enabled === true
        );

    },

    (error) => {

        console.error(
            "Display configuration error:",
            error
        );

        setDisconnected();

    }

);
