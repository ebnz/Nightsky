//Global information
//Global SearchMap, that maps Constellation-Names to LookAt-Positions
let searchMap;

{
    // The 3 divs that make up the ui.
    const controlsDiv = document.getElementById("controls");
    const infoDiv = document.getElementById("info");
    const starSignDiv = document.getElementById("starSign");
    // Should the ui be visible?
    // Yes:    true
    // NO :    false
    // The ui will be invisible on startup and will be set to visible as soon
    // as the scene is loaded.
    // To change the visibility use the function changeUiVisibility().
    let uiVisibility = false;
    
    // Text displaying information about the currently selected object.
    const infoText = document.getElementById("infoText");

    // Button to pause / unpause the orbit of the objects in the scene.
    // Pressing the button will call onPause().
    const pauseButton = document.getElementById("pause");
    pauseButton.onclick = onPause.bind(this);
    // Image of the pause button.
    const pauseImg = document.getElementById("pauseImg");
    // Current pause state - true if paused.
    let pause = false;

    //(Done by Eric)
    // button to pause and unpause the Stars from drifting
    const pauseStarsButton = document.getElementById('pauseStars');
    pauseStarsButton.onclick = onPauseStars.bind(this);
    // image displaying the pause button
    const pauseStarsImg = document.getElementById('pauseStarsImg');
    // current pause state - true if paused
    let pauseStars = true;

    // Slider controlling orbit speed. Changing the value of the slider
    // will call onSlider().
    const speedSlider = document.getElementById("speed");
    speedSlider.oninput = onSlider.bind(this);
    // Text displaying current orbit speed.
    const speedText = document.getElementById("speedText");
    // Get the current orbit speed and set the speed text.
    let speed = speedSlider.value;
    speedText.textContent = speed;

    //(Done by Eric)
    // slider controlling stars speed
    const speedStarsSlider = document.getElementById('speedStars');
    speedStarsSlider.oninput = onStarsSlider.bind(this);
    // text displaying current stars speed
    const speedStarsText = document.getElementById('speedStarsText');
    // current speed
    let speedStars = speedStarsSlider.value;
    speedStarsText.textContent = speedStars;

    //(Done by Eric)
    //Text on displaying the Simulation-Time
    const millenniumText = document.getElementById("millennium");
    let currentMillennium = 2;     //The current Millennium of the visualization (data from year 2000 -> Mil 2)

    //(Done by Eric)
    //Search Field to Search for Stars and Focus them
    const searchField = document.getElementById("searchField");
    searchField.onkeyup = onSearchFieldButtonDown.bind(this);
    const searchFieldButton = document.getElementById("searchFieldButton");
    searchFieldButton.onclick = onSearchButton.bind(this);

    /**
     * Listener-Function triggered by Key-Press while the searchField is focused
     * (Done by Eric)
     * @param event
     */
    function onSearchFieldButtonDown(event) {
        if (event.key === "Enter") {
            onSearchButton();
        }
    }

    /**
     * Listener-Function triggered by the searchFieldButton
     * (Done by Eric)
     */
    function onSearchButton() {
        const searchValue = searchField.value.toLowerCase();

        if (searchMap.has(searchValue)) {
            const newLookAt = searchMap.get(searchValue);
            const cam = getCam();
            cam.newLookAt(newLookAt);
            //Activate StarSign's Connections
            changeSigns(searchValue);
            //Toggle Checkbox
            nodelist = document.getElementsByName(searchValue);
            element = [...nodelist].filter((item) => item.type === "checkbox")[0];
            element.checked = !element.checked;
        }
    }

    /**
     * This function toggles the visibility of the ui.
     */
    function changeUiVisibility() {
        // If the ui is visible, make it invisible. Else, make it visible.
        if (uiVisibility) {
            // Put the divs that make up the ui below the canvases.
            controlsDiv.style.zIndex = "-1";
            infoDiv.style.zIndex = "-1";
            starSignDiv.style.zIndex = "-1";
        } else {
            // Put the divs that make up the ui above the canvases.
            controlsDiv.style.zIndex = "3";
            infoDiv.style.zIndex = "3";
            starSignDiv.style.zIndex = "3";
        }
        // Change the visibility value.
        uiVisibility = !uiVisibility;
    }

    /**
    * This function allows to change the info text to a new string.
    * (Partly Done by Eric)
    * @param {string} text - string to be set as the info text 
    */
    function setInfoText(text) {
        infoText.textContent = text;
    }
    
    /**
    * Getter function for the info text. Returns the value as a string.
    * @returns {string} current infotext as a string.
    */
    function getInfoText() {
        return infoText.textContent;
    }
    
    /**
    * Gets called by the onclick event of the pause button.
    * The function changes the pause state and changes the pause button image.
    */
    function onPause() {
        // Change the image.
        if (pause) {
            pauseImg.src = "./images/pause.png";
        } else {
            pauseImg.src = "./images/start.png";
        }
        // Change the pause state.
        pause = !pause;
    }
    
    /**
    * Getter function for the pause state.
    * @returns {boolean} current pause state
    */
    function getPause() {
        return pause;
    }

    /**
     * Gets called by the onclick event of the pauseStars button.
     * The function changes the pauseStars image and pauses / unpauses the star drifting
     * (Done by Eric)
     */
    function onPauseStars() {
        // change the image
        if (pauseStars) {
            pauseStarsImg.src = "./images/pause.png";
        } else {
            pauseStarsImg.src = "./images/start.png";
        }
        // pause / unpause
        pauseStars = !pauseStars;
    }

    /**
     * getter function for the pauseStars state
     * (Done by Eric)
     * @returns {boolean} current pauseStars state
     */
    function getPauseStars() {
        return pauseStars;
    }

    /**
    * Gets called by the oninput event of the speed slider.
    * The function changes the speed and the speed text according
    * to the slider value.
    */
    function onSlider() {
        speedText.textContent = speedSlider.value;
        speed = speedSlider.value;
    }

    /**
     * Gets called by the oninput event of the speedStars slider.
     * The function changes the speed and the speedStarsText according to the slider
     * (Done by Eric)
     */
    function onStarsSlider() {
        speedStarsText.textContent = speedStarsSlider.value;
        speedStars = speedStarsSlider.value;
    }

    /**
    * Getter function for the orbit speed.
    * @returns {number} current speed
    */
    function getSpeed() {
        return speed;
    }

    /**
     * getter function for the stars speed
     * (Done by Eric)
     * @returns {number} current speed
     */
    function getStarsSpeed() {
        return speedStars;
    }

    /**
     * This Function updates the Year-Display which shows the current Year, the BackgroundStar-Simulation is in.
     * This Function gets called each Simulation-Step
     * (Done by Eric)
     * @param dt - Length of the Simulation-Step
     * @param speed - Current Speed used in the Simulation-Step
     */
    function updateMillennium(dt, speed) {
        currentMillennium += speed * dt;

        const orderMagnitude = Math.log10(currentMillennium);

        if (orderMagnitude < 3) {
            millenniumText.textContent = `${parseInt(currentMillennium)}k A.D.`;
        }
        else if (orderMagnitude < 6) {
            millenniumText.textContent = `${parseInt(currentMillennium / 1000)}M A.D.`;
        }
        else if (orderMagnitude < 9) {
            millenniumText.textContent = `${parseInt(currentMillennium / 1000000)}B A.D.`;
        }
        else {
            millenniumText.textContent = `${parseInt(currentMillennium / 1000000000)}T A.D.`;
        }
    }

    /**
     * This function fills the signList with checkboxes for all the
     * star signs given as a list of names.
     * @param {!string[]} starSigns - list of names
     */
    function starSignList(starSigns) {
        // Get the signList.
        const signList = document.getElementById("signList");
        // Empty the current list.
        signList.innerHTML = "";

        // For every name in the given list.
        for (let i = 0; i < starSigns.length; i++) {
            // Create a list element for the list.
            const listElement = document.createElement("li");
            // Create a checkbox for the list element.
            const checkBox = document.createElement("input");
            // Change the parameter of the checkbox.
            checkBox.type = "checkbox";
            checkBox.name = starSigns[i].toLowerCase();
            checkBox.onclick = function () {
                changeSigns(checkBox.name); // This is defined in scene.js.
            }
            // Create a text element for the lost element.
            const signText = document.createElement("text");
            // Create the text content for the text element.
            const signTextCont = document.createTextNode(starSigns[i]);
            signText.classList.add("contentList");

            // Append everything to each other.
            signText.appendChild(signTextCont);
            listElement.appendChild(checkBox);
            listElement.appendChild(signText);
            signList.appendChild(listElement);
        }

        // Make the list visible.
        signList.style.opacity = "1";
    }
}

/**
 * This Function generates a SearchMap that maps the names of each BackgroundStar to it's Look-At.
 * This SearchMap is used for the Search-Feature with Look-At
 * (Done by Eric)
 * @returns {Map<any, any>} - The generated SearchMap
 */
function generateSearchMap() {
    let searchMap = new Map();      //The Map, containing all names and mapping them to the middle point of the object
    let signMap = new Map();        //Contains all starSigns with all of their stars
    for(let i = 0; i < gaia[4].length; i++) {
        //If Trivial Name of star is not "", add it with current Position
        if (gaia[4][i][0].length != 0) {
            //Calculate Look-At
            let position = vec3.fromValues(gaia[0][i][0], gaia[0][i][1], gaia[0][i][2]);
            let direction = vec3.clone(position);
            vec3.normalize(direction, direction);
            vec3.scale(direction, direction, 100);
            vec3.add(position, position, direction);
            vec3.scale(position, position, 20);
            searchMap.set(gaia[4][i][0].toLowerCase(), position);
        }
        //If Cst is not "" and signMap doesn't contain the current Cst, add it with current Position
        if (gaia[4][i][1].length != 0) {
            //Calculate Look-At
            let position = vec3.fromValues(gaia[0][i][0], gaia[0][i][1], gaia[0][i][2]);
            let direction = vec3.clone(position);
            vec3.normalize(direction, direction);
            vec3.scale(direction, direction, 100);
            vec3.add(position, position, direction);
            vec3.scale(position, position, 20);
            if (signMap.has(gaia[4][i][1].toLowerCase())) {
                signMap.get(gaia[4][i][1].toLowerCase()).push(position);
            }
            else {
                signMap.set(gaia[4][i][1].toLowerCase(), [position]);
            }
        }
    }

    //Calculate the middle point of each star sign and append it to the searchMap
    signMap.forEach((val, key) => {
        const sum = vec3.create();
        val.forEach((vec) => {
            vec3.add(sum, sum, vec);
        });
        vec3.divide(sum, sum, vec3.fromValues(val.length, val.length, val.length));
        searchMap.set(key, sum);
    });

    return searchMap;
}

/**
 * Init-Function that triggers the Computation of the SearchMap
 * (Done by Eric)
 */
function initUI() {
    searchMap = generateSearchMap();
}