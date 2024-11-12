// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
    GestureRecognizer,
    FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const commandGroup1 = document.getElementById("command_group1");
const textareaGroup = document.getElementById("textarea_group");
const keyboardGroup = document.getElementById("keyboard_group");


// navigation buttons
const topLeftBtn = document.getElementById("top-left-btn");
const topRightBtn = document.getElementById("top-right-btn");

// operation buttons
const deleteBtn = document.getElementById("delete_btn");
const insertBtn = document.getElementById("insert_btn");
const replaceBtn = document.getElementById("replace_btn");

// textarea elements
const keyboardTextArea = document.getElementById("keyboard_text_area");
const micIcon = document.getElementById("mic_icon");
const respeakBtn = document.getElementById("respeak_btn");

const spaceBtn = document.getElementById("space_btn");
const backspaceBtn = document.getElementById("backspace_btn");

// state transition functions
function toBeginState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "hidden";
    keyboardGroup.style.visibility = "hidden";

    topRightBtn.style.visibility = "hidden";
    topLeftBtn.style.visibility = "hidden";
}

toBeginState();

function toTaskState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "hidden";
    keyboardGroup.style.visibility = "hidden";
    topRightBtn.innerHTML = "Show Indices<sup>90</sup>";
    topRightBtn.style.visibility = "visible";
    topLeftBtn.style.visibility = "hidden";
    topRightBtn.classList.remove("btn_highlight");
    keyboardTextArea.value = "|";
    document.getElementById("prompt").querySelectorAll("sup").forEach((element) => {
        element.style.visibility = "hidden";
    });
}

function toFirstSelectionState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "hidden";
    keyboardGroup.style.visibility = "hidden";
    topRightBtn.classList.remove("btn_highlight");
    topRightBtn.innerHTML = "Hide Indices<sup>99</sup>";
    topRightBtn.style.visibility = "visible";
    topLeftBtn.style.visibility = "hidden";
    tergetContainer.style.visibility = "hidden";
    keyboardTextArea.value = "|";
    document.getElementById("prompt").innerHTML = processPrompt(currentData["prompt"]);
    document.getElementById("prompt").querySelectorAll("sup").forEach((element) => {
        element.style.visibility = "visible";
    });
}

function toSecondSelectionState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "hidden";
    keyboardGroup.style.visibility = "hidden";
    topRightBtn.classList.remove("btn_highlight");
    topRightBtn.innerHTML = "Undo<sup>99</sup>";
    topRightBtn.style.visibility = "visible";
    topLeftBtn.style.visibility = "hidden";
    tergetContainer.style.visibility = "hidden";
    keyboardTextArea.value = "|";
    document.getElementById("prompt").innerHTML = processPrompt(currentData["prompt"]);
    document.getElementById(`${selectedIndex}`).classList.add("selected");
    document.getElementById("prompt").querySelectorAll("sup").forEach((element) => {
        element.style.visibility = "visible";
    });
}


function toCommandSelectionState() {
    commandGroup1.style.visibility = "visible";
    textareaGroup.style.visibility = "hidden";
    keyboardGroup.style.visibility = "hidden";

    topRightBtn.classList.remove("btn_highlight");
    topRightBtn.innerHTML = "Undo<sup>99</sup>";
    topRightBtn.style.visibility = "visible";
    insertBtn.classList.remove("btn_highlight");
    replaceBtn.classList.remove("btn_highlight");
    deleteBtn.classList.remove("btn_highlight");
    topLeftBtn.classList.remove("btn_highlight");
    topLeftBtn.innerHTML = "Select Range<sup>2</sup>";
    topLeftBtn.style.visibility = "visible";
    tergetContainer.style.visibility = "hidden";
    keyboardTextArea.value = "|";
    document.getElementById("prompt").querySelectorAll("sup").forEach((element) => {
        element.style.visibility = "hidden";
    });
}

function toSpeakTypeState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "visible";
    keyboardGroup.style.visibility = "visible";
    insertBtn.classList.remove("btn_highlight");
    replaceBtn.classList.remove("btn_highlight");
    deleteBtn.classList.remove("btn_highlight");
    topRightBtn.classList.remove("btn_highlight");
    topRightBtn.innerHTML = "Undo<sup>99</sup>";
    topRightBtn.style.visibility = "visible";

    topLeftBtn.classList.remove("btn_highlight");
    topLeftBtn.innerHTML = "Enter<sup>90</sup>";
    topLeftBtn.style.visibility = "visible";
    keyboardTextArea.value = "|";
    respeakBtn.style.display = "none";
    respeakBtn.classList.remove("btn_highlight");
}

function toTypingState() {
    commandGroup1.style.visibility = "hidden";
    textareaGroup.style.visibility = "visible";
    keyboardGroup.style.visibility = "visible";
    insertBtn.classList.remove("btn_highlight");
    replaceBtn.classList.remove("btn_highlight");

    topRightBtn.classList.remove("btn_highlight");
    topRightBtn.innerHTML = "Undo<sup>99</sup>";
    topRightBtn.style.visibility = "visible";

    topLeftBtn.classList.remove("btn_highlight");
    topLeftBtn.innerHTML = "Enter<sup>90</sup>";
    topLeftBtn.style.visibility = "visible";

    respeakBtn.style.display = "block";
    micIcon.classList.remove("active");
}

const keyboardMapping = {
    "1": "a",
    "2": "b",
    "3": "c",
    "4": "d",
    "5": "e",
    "6": "f",
    "7": "g",
    "8": "h",
    "9": "i",
    "10": "j",
    "11": "k",
    "12": "l",
    "13": "m",
    "14": "n",
    "15": "o",
    "16": "p",
    "17": "q",
    "18": "r",
    "19": "s",
    "20": "t",
    "21": "u",
    "22": "v",
    "23": "w",
    "24": "x",
    "25": "y",
    "26": "z",
}

let startTime = null;
let endTime = null;
let selectionTime = null;
let selectionTries = 0;
let operations = [];
const recognition = new window.webkitSpeechRecognition;

let gestureRecognizer = GestureRecognizer;
let webcamRunning = false;
const videoHeight = "360px";
let tempLetter = null;
let currentLetter = null;
let currentState = "begin state";
let command = 0;
let changeThreshold = 6;
let itr = 0;
let recognizedSpeech = "";
let selectedIndex = null;
let selectedIndex2 = null;


var audio = document.getElementById('Audio');
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const mainWindow = document.getElementById("main_window");
const tergetContainer = document.getElementById("target_container");

const beginBtn = document.getElementById("begin_btn");

var trial_order = [0];
var trial_number = 0;



const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],    // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],    // Index finger
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
    [9, 13], [13, 14], [14, 15], [15, 16],  // Ring finger
    [13, 17], [17, 18], [18, 19], [19, 20],  // Pinky
    [0, 17]   // Palm
];

var dataset = {
    0: {
        "target_sentence": "The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public.",
        "original_sentence": "The enforcement has responsibility for the safety of the public.",
        "target": "The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public.",
        "action": "add",
        "index": [34],
        "prompt": "The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public. The enforcement has responsibility for the safety of the public. The law enforcement has responsibility for the safety of the public."
    }
}

let fingerCount = 0;
let lastVideoTime = -1;
let results = undefined;
let currentData = dataset[trial_order[trial_number]];
let tempData = "";


var mapping = {};
for (let i = 1; i <= 99; i++) {
    mapping[i] = i.toString();
}

const videoWidth = "480px";


function setTrial(trial_number) {
    const trial = dataset[trial_order[trial_number]];
    document.getElementById("target").innerHTML = processTarget(trial["target"], trial["index"], trial["action"]);

    document.getElementById("prompt").innerHTML = processInitialPrompt(trial["prompt"]);
}

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
    // demosSection.classList.remove("invisible");
};

createGestureRecognizer();

// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    // beginBtn = document.getElementById("begin_btn");
    beginBtn.addEventListener("click", beginProgram);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}
//   gestureRecognizer.setOptions({ num_hands: 2 });

// Enable the live webcam view and start detection.
function beginProgram(event) {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }

    webcamRunning = true;

    // getUsermedia parameters.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });

    beginBtn.style.display = "none";
    mainWindow.style.visibility = "visible";
    setTrial(trial_number);
    currentState = "task state";
    toTaskState();
}

async function predictWebcam() {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.

    //runningMode = "VIDEO";
    // gestureRecognizer.setOptions({runningMode: "VIDEO", num_hands:2});
    //}
    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }


    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

    let isLeft = false;
    let left_key_points_transformed = [];
    let right_key_points_transformed = [];

    if (results) {


        for (const landmarks of results.landmarks) {


            const scale = 1.4; // Adjust this value to change the scaling

            // Apply scaling transformation
            canvasCtx.save();
            canvasCtx.scale(scale, scale);

            // console.log("Drawing hand landmarks"); // Debug statement
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
            // console.log("Drawing hand connectors"); // Debug statement
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });

            canvasCtx.restore();
        }
    } else {
        // console.log("No hand landmarks detected"); // Debug statement
    }



    const numberText = currentLetter ? currentLetter : "0";
    const numberX = canvasElement.width / 2;
    const numberY = 30; // Adjust this value to change the vertical position of the number

    canvasCtx.font = "28px Consolas";
    canvasCtx.fillStyle = "#646664";
    canvasCtx.textAlign = "center";
    canvasCtx.fillText(numberText, numberX, numberY);

    //gestureOutput.innerText = `Finger Count : ${fingerCount}\n Sentence : ${sentence} \n Error: ${error_sentence}\n Current State: ${currentState}`;
    if (results.landmarks.length != 0) {

        //console.log(results);
        for (let [gestures, Landmarks, worldLandmarks, handednesses] of Object.entries(results)) {

            if (results.handednesses.length == 2) {
                isLeft = true;
                [left_key_points_transformed, right_key_points_transformed] = DetectMultipleHand(results.landmarks, results.handednesses);

            }
            else {
                fingerCount = DetectOneHand(results.landmarks, results.handednesses);
            }
        }
        let leftSum = 0;
        let rightSum = 0;
        if (isLeft) {
            leftSum = getFingerCounts(left_key_points_transformed, 'left');
            rightSum = getFingerCounts(right_key_points_transformed, 'right');
        }
        fingerCount = leftSum + rightSum;



        if (typeof mapping[fingerCount] !== "undefined") {
            // there is a letter corresponding to the current finger count
            let letter = mapping[fingerCount];
            if (letter !== tempLetter) {
                tempLetter = letter;
                itr = 0;
            }
            else {
                if (currentLetter !== tempLetter) {
                    itr += 1;

                    if (itr >= changeThreshold) {
                        itr = 0;
                        if (currentLetter !== null) {
                            // there is already some current letter that is changing, remove corresponding button highlights
                            if (currentState === "task state") {
                                // task window state
                                if (parseInt(currentLetter) === 90) {
                                    topRightBtn.classList.remove("btn_highlight");
                                }
                            }

                            if (currentState === "first selection state") {
                                // first selection state
                                if (parseInt(currentLetter) === 99) {
                                    topRightBtn.classList.remove("btn_highlight");
                                }

                                else if (currentLetter <= currentData["prompt"].split(" ").length) {
                                    document.getElementById(`${currentLetter}`).classList.remove("highlight");
                                }
                            }

                            if (currentState === "second selection state") {
                                // first selection state
                                if (parseInt(currentLetter) === 99) {
                                    topRightBtn.classList.remove("btn_highlight");
                                }

                                else if (currentLetter <= currentData["prompt"].split(" ").length) {
                                    for (let i = selectedIndex + 1; i <= parseInt(currentLetter); i++) {
                                        document.getElementById(`${i}`).classList.remove("highlight");
                                    }
                                }
                            }

                            if (currentState === "command selection state") {
                                // command selection state
                                if (parseInt(currentLetter) === 99) {
                                    topRightBtn.classList.remove("btn_highlight");
                                }
                                else if (parseInt(currentLetter) === 2) {
                                    topLeftBtn.classList.remove("btn_highlight");
                                }
                                else if (parseInt(currentLetter) === 5) {
                                    insertBtn.classList.remove("btn_highlight");
                                }
                                else if (parseInt(currentLetter) === 55) {
                                    replaceBtn.classList.remove("btn_highlight");
                                }
                                else if (parseInt(currentLetter) === 50) {
                                    deleteBtn.classList.remove("btn_highlight");
                                }
                            }

                            if (currentState === "typing state") {
                                // command selection state
                                if (parseInt(currentLetter) === 99) {
                                    topRightBtn.classList.remove("btn_highlight");
                                }

                                else if (parseInt(currentLetter) === 90) {
                                    topLeftBtn.classList.remove("btn_highlight");
                                }
                                else if (parseInt(currentLetter) === 60) {
                                    respeakBtn.classList.remove("btn_highlight");
                                }

                                else if (parseInt(currentLetter) === 55) {
                                    spaceBtn.classList.remove("btn_highlight");
                                }

                                else if (parseInt(currentLetter) === 50) {
                                    backspaceBtn.classList.remove("btn_highlight");
                                }

                                else if (parseInt(currentLetter) >= 1 && parseInt(currentLetter) <= 26) {
                                    document.getElementById(`${keyboardMapping[currentLetter]}_btn`).classList.remove("btn_highlight");
                                }
                            }
                        }

                        currentLetter = tempLetter;
                        // textArea.innerHTML = `${currentLetter}`;

                        // current letter changed, add corresponding button highlights
                        if (currentState === "task state") {
                            if (parseInt(currentLetter) === 90) {
                                topRightBtn.classList.add("btn_highlight");
                            }
                        }

                        if (currentState === "first selection state") {
                            if (parseInt(currentLetter) === 99) {
                                topRightBtn.classList.add("btn_highlight");
                            }
                            else if (currentLetter <= currentData["prompt"].split(" ").length) {
                                document.getElementById(`${currentLetter}`).classList.add("highlight");
                            }
                        }

                        if (currentState === "second selection state") {
                            // first selection state
                            if (parseInt(currentLetter) === 99) {
                                topRightBtn.classList.add("btn_highlight");
                            }

                            else if (currentLetter <= currentData["prompt"].split(" ").length) {
                                for (let i = selectedIndex + 1; i <= parseInt(currentLetter); i++) {
                                    document.getElementById(`${i}`).classList.add("highlight");
                                }
                            }
                        }

                        if (currentState === "command selection state") {
                            // command selection state
                            if (parseInt(currentLetter) === 99) {
                                topRightBtn.classList.add("btn_highlight");
                            }

                            else if (parseInt(currentLetter) === 2) {
                                topLeftBtn.classList.add("btn_highlight");
                            }
                            else if (parseInt(currentLetter) === 5) {
                                insertBtn.classList.add("btn_highlight");
                            }
                            else if (parseInt(currentLetter) === 55) {
                                replaceBtn.classList.add("btn_highlight");
                            }
                            else if (parseInt(currentLetter) === 50) {
                                deleteBtn.classList.add("btn_highlight");
                            }
                        }

                        if (currentState === "typing state") {
                            // command selection state
                            if (parseInt(currentLetter) === 99) {
                                topRightBtn.classList.add("btn_highlight");
                            }

                            else if (parseInt(currentLetter) === 90) {
                                topLeftBtn.classList.add("btn_highlight");
                            }
                            else if (parseInt(currentLetter) === 60) {
                                respeakBtn.classList.add("btn_highlight");
                            }

                            else if (parseInt(currentLetter) === 55) {
                                spaceBtn.classList.add("btn_highlight");
                            }

                            else if (parseInt(currentLetter) === 50) {
                                backspaceBtn.classList.add("btn_highlight");
                            }

                            else if (parseInt(currentLetter) >= 1 && parseInt(currentLetter) <= 26) {
                                document.getElementById(`${keyboardMapping[currentLetter]}_btn`).classList.add("btn_highlight");
                            }
                        }

                        let temp = parseInt(currentLetter);
                    }
                }
            }
        }


        else {
            // there is no letter corresponding to the current finger count, including 0
            if (fingerCount === 0) {
                // count becomes 0, delimit the gesture
                // textArea.innerHTML = `Gesture:${fingerCount}`;
                itr = 0;
                if (currentLetter !== null) {
                    // there is already some gesture, perform the corresponding action
                    // console.log(currentState, currentLetter, index, command);

                    //logging.info(`%%%%%%%%%  ${currentLetter}  %%%%%%%%%`);
                    //typedChar += 1;

                    if (currentState === "task state") {
                        if (parseInt(currentLetter) === 90) {
                            currentState = "first selection state";
                            toFirstSelectionState();

                            // calculating selection metrics
                            startTime = window.performance.now();
                        }
                    }

                    else if (currentState === "first selection state") {
                        if (parseInt(currentLetter) === 99) {
                            // implement hide indices
                            currentState = "task state";
                            toTaskState();
                        }


                        if (parseInt(currentLetter) <= currentData["prompt"].split(" ").length) {
                            // first word selection
                            document.getElementById(`${currentLetter}`).classList.remove("highlight");
                            document.getElementById(`${currentLetter}`).classList.add("selected");
                            currentState = "command selection state";
                            toCommandSelectionState();

                            // calculating selection metrics
                            endTime = window.performance.now();
                            selectionTries += 1;
                            selectionTime = (endTime - startTime) / 1000;
                            selectedIndex = parseInt(currentLetter);
                        }
                    }

                    else if (currentState === "second selection state") {
                        if (parseInt(currentLetter) === 99) {
                            // implement hide indices
                            currentState = "command selection state";
                            toCommandSelectionState();
                        }


                        if (parseInt(currentLetter) <= currentData["prompt"].split(" ").length) {
                            // first word selection
                            for (let i = selectedIndex + 1; i <= parseInt(currentLetter); i++) {
                                document.getElementById(`${i}`).classList.remove("highlight");
                                document.getElementById(`${i}`).classList.add("selected");
                            }
                            currentState = "command selection state";
                            toCommandSelectionState();

                            // calculating selection metrics
                            endTime = window.performance.now();
                            selectionTries += 1;
                            selectionTime = (endTime - startTime) / 1000;
                            selectedIndex2 = parseInt(currentLetter);
                        }
                    }

                    else if (currentState === "command selection state") {
                        command = parseInt(currentLetter);

                        if (parseInt(currentLetter) === 2) {
                            // implement second selection
                            currentState = "second selection state";
                            toSecondSelectionState();
                        }

                        if (parseInt(currentLetter) === 99) {
                            // implement undo selection
                            if (selectedIndex2 !== null && selectedIndex2 != undefined) {
                                for (let i = selectedIndex + 1; i <= selectedIndex2; i++) {
                                    document.getElementById(`${selectedIndex}`).classList.remove("selected");
                                }
                                selectedIndex2 = null;
                                currentState = "second selection state";
                                toSecondSelectionState();
                            }
                            else {
                                document.getElementById(`${selectedIndex}`).classList.remove("selected");
                                selectedIndex = null;
                                currentState = "first selection state";
                                toFirstSelectionState();
                            }
                        }

                        if (parseInt(currentLetter) === 50) {
                            // implement delete selection
                            // deleteText(selectedIndex);
                            tempData = currentData["prompt"]
                            deleteTextTemp(selectedIndex, selectedIndex2);
                            currentState = "typing state";
                            toTypingState();
                        }

                        if (parseInt(currentLetter) === 55 || parseInt(currentLetter) === 5) {
                            // implement replace selection
                            currentState = "speak type state";
                            toSpeakTypeState();
                        }
                    }

                    else if (currentState === "typing state") {

                        if (parseInt(currentLetter) >= 1 && parseInt(currentLetter) <= 26) {
                            // implement typing
                            keyboardTextArea.value = keyboardTextArea.value.slice(0, -1) + keyboardMapping[currentLetter] + "|";
                            document.getElementById(`${keyboardMapping[currentLetter]}_btn`).classList.remove("btn_highlight");
                            tempData = currentData["prompt"]
                            if (command === 55) {
                                replaceTextTemp(keyboardTextArea.value.slice(0, -1), selectedIndex, selectedIndex2);
                            }
                            else if (command === 5) {
                                insertTextTemp(keyboardTextArea.value.slice(0, -1), selectedIndex);
                            }
                        }

                        if (parseInt(currentLetter) === 50) {
                            if (keyboardTextArea.value.length > 1) {
                                // implement backspace
                                keyboardTextArea.value = keyboardTextArea.value.slice(0, -1).slice(0, -1) + "|";

                            }

                            backspaceBtn.classList.remove("btn_highlight");

                            if (keyboardTextArea.value.length > 1) {
                                if (command === 55) {
                                    replaceTextTemp(keyboardTextArea.value.slice(0, -1), selectedIndex, selectedIndex2);
                                }
                                else if (command === 5) {
                                    insertTextTemp(keyboardTextArea.value.slice(0, -1), selectedIndex);
                                }
                            }
                            else {
                                tempData = currentData["prompt"]
                                let wordlist = currentData["prompt"].split(' ');
                                let word = wordlist[selectedIndex - 1];
                                if (command === 55) {
                                    replaceTextTemp(word, selectedIndex, selectedIndex2);
                                }
                                else if (command === 5) {
                                    insertTextTemp('<>', selectedIndex);
                                }
                                // replaceTextTemp(word, selectedIndex);
                            }
                        }

                        if (parseInt(currentLetter) === 55) {
                            keyboardTextArea.value = keyboardTextArea.value.slice(0, -1) + " |";
                            spaceBtn.classList.remove("btn_highlight");
                            replaceTextTemp(keyboardTextArea.value.slice(0, -1), selectedIndex, selectedIndex2);
                        }

                        if (parseInt(currentLetter) === 99) {
                            // implement undo
                            document.getElementById('prompt').innerHTML = processPrompt(currentData["prompt"]);
                            document.getElementById(`${selectedIndex}`).classList.add("selected");
                            currentState = "command selection state";
                            toCommandSelectionState();
                        }

                        if (parseInt(currentLetter) === 90) {
                            if (command === 50) {
                                deleteText(selectedIndex, selectedIndex2);
                            }

                            if (command === 55) {
                                if (keyboardTextArea.value.length > 1) {
                                    replaceText(keyboardTextArea.value.slice(0, -1), selectedIndex, selectedIndex2);
                                }
                                else {
                                    tempData = currentData["prompt"]
                                    // let wordlist = currentData["prompt"].split(' ');
                                    // let word = wordlist[selectedIndex - 1];
                                    // replaceText(word, selectedIndex, selectedIndex2);
                                    if (selectedIndex2 !== null && selectedIndex2 !== undefined) {
                                        // Select range of text
                                        let selectedText = wordlist.slice(selectedIndex - 1, selectedIndex2).join(' ');
                                        replaceText(selectedText, selectedIndex, selectedIndex2);
                                    } else {
                                        // Select single word
                                        let word = wordlist[selectedIndex - 1];
                                        replaceText(word, selectedIndex);
                                    }
                                }
                            }
                            else if (command === 5) {
                                if (keyboardTextArea.value.length > 1) {
                                    insertText(keyboardTextArea.value.slice(0, -1), selectedIndex);
                                }
                                else {
                                    insertText("", selectedIndex);
                                }
                            }
                            selectedIndex = null;
                            selectedIndex2 = null;
                            currentState = "first selection state";
                            toFirstSelectionState();
                        }

                        if (parseInt(currentLetter) === 60) {
                            tempData = currentData["prompt"]
                            let wordlist = currentData["prompt"].split(' ');
                            let word = wordlist[selectedIndex - 1];
                            if (command === 55) {
                                replaceTextTemp(word, selectedIndex, selectedIndex2);
                            }
                            else if (command === 5) {
                                insertTextTemp('<>', selectedIndex);
                            }

                            currentState = "speak type state";
                            toSpeakTypeState();
                        }
                    }
                }
                currentLetter = null;
                tempLetter = null;
            }
            else {
                if (tempLetter !== null) {
                    itr += 1;
                    if (itr >= changeThreshold) {
                        tempLetter = null;
                        currentLetter = null;
                        itr = 0;
                    }
                }
            }
        }

        if (currentState === "speak type state") {
            recognizedSpeech = ""
            if (command === 55) {
                operations.push("replace");
            }
            else if (command === 5) {
                operations.push("insert");
            }
            recognizeSpeech();
            currentState = "microphone running state";
        }


        if (currentState === "microphone running state") {
            if (recognizedSpeech !== "") {

                let wordlist = currentData["prompt"].split(' ');

                if (recognizedSpeech === "ERROR") {
                    // currentState = "keyboard active state";
                    if (command === 5) {
                        tempData = currentData["prompt"];
                        insertTextTemp('<>', selectedIndex);
                    }
                }

                else if (command === 55) {
                    keyboardTextArea.value = recognizedSpeech + "|";
                    tempData = currentData["prompt"];
                    replaceTextTemp(recognizedSpeech, selectedIndex, selectedIndex2);
                }

                else if (command === 5) {
                    keyboardTextArea.value = recognizedSpeech + "|";
                    tempData = currentData["prompt"];
                    insertTextTemp(recognizedSpeech, selectedIndex);
                }

                // recognizedSpeech = "";
                currentState = "typing state";
                toTypingState();
            }

        }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}


// Check if webcam access is supported.


function recognizeSpeech() {
    //let recognizedSpeech = "";

    if (recognizedSpeech === "") {

        let timeout;

        recognition.onstart = () => {
            console.log("Listening...");
            playBeep();
            micIcon.classList.add("active");

            timeout = setTimeout(() => {
                recognition.stop();
                console.log("No speech detected. Recognition stopped.");
            }, 5000);
        };

        recognition.onspeechstart = () => {
            // Clear the timeout if speech is detected
            clearTimeout(timeout);
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onresult = event => {
            const transcript = event.results[0][0].transcript;
            recognizedSpeech = transcript.toLowerCase();
            console.log("Did you say ", recognizedSpeech);
        };

        recognition.onend = () => {
            console.log("Stopped listening");
            if (recognizedSpeech === "") {
                recognizedSpeech = "ERROR"
            }
            console.log("Did you say ", recognizedSpeech);
            micIcon.classList.remove("active");
            playBeep();
        }

        recognition.onerror = event => {
            console.error("Recognition error:", event.error);
            playBeep();
            micIcon.classList.remove("active");
        };

        recognition.start();
    }
}


const frameWidth = 640;
const frameHeight = 480;

function playBeep() {
    audio.play();
}

function strDiff(str1, str2) {
    let diff = 0;
    let biggerStr = str1.length > str2.length ? str1 : str2;
    let smallerStr = str1.length > str2.length ? str2 : str1;
    for (let i = 0; i < smallerStr.length; i++) {
        if (smallerStr[i] !== biggerStr[i]) {
        }
    }
}

function DetectOneHand(landmarks, hands) {
    const thumbIsOpen = landmarks[0][4].x < landmarks[0][3].x;
    const indexIsOpen = landmarks[0][8].y < landmarks[0][6].y;
    const middleIsOpen = landmarks[0][12].y < landmarks[0][10].y;
    const ringIsOpen = landmarks[0][16].y < landmarks[0][14].y;
    const littleIsOpen = landmarks[0][20].y < landmarks[0][18].y;
    const fingerStates = [thumbIsOpen, indexIsOpen, middleIsOpen, ringIsOpen, littleIsOpen];
    fingerCount = fingerStates.filter(state => state).length;

    if (hands[0].displayName === "Right") {
        fingerCount = fingerCount * 10;
    }
    return fingerCount;
}

function DetectMultipleHand(landmark, hands) {

    let left_hand_points = []
    let right_hand_points = []
    let left_key_points_transformed = []
    let right_key_points_transformed = []


    if (hands[0][0].displayName === 'Left') {
        //isLeft = true;
        for (let i = 0; i < 21; i++) {
            right_hand_points.push([Math.floor(landmark[0][i].x * frameWidth), Math.floor(landmark[0][i].y * frameHeight), 1]);
            left_hand_points.push([Math.floor(landmark[1][i].x * frameWidth), Math.floor(landmark[1][i].y * frameHeight), 1]);

        }
        //console.log(left_hand_points)
        left_key_points_transformed = transformPoints(left_hand_points);
        right_key_points_transformed = transformPoints(right_hand_points);
    }
    else {
        //isLeft = true;
        for (let i = 0; i < 21; i++) {
            right_hand_points.push([Math.floor(landmark[1][i].x * frameWidth), Math.floor(landmark[1][i].y * frameHeight), 1]);
            left_hand_points.push([Math.floor(landmark[0][i].x * frameWidth), Math.floor(landmark[0][i].y * frameHeight), 1]);

        }
        // console.log(left_hand_points)
        left_key_points_transformed = transformPoints(left_hand_points);
        right_key_points_transformed = transformPoints(right_hand_points);

    }
    return [left_key_points_transformed, right_key_points_transformed];
}

function transformPoints(keypoints) {
    const x0 = keypoints[0][0];
    const y0 = keypoints[0][1];
    const x9 = keypoints[9][0];
    const y9 = keypoints[9][1];
    const a = Math.atan2(y9 - y0, x9 - x0) * (180 / Math.PI);
    let angle = (((a + 360) % 360) + 90) % 360;
    angle = angle * (Math.PI / 180);
    const keypointsTransformed = transform(x0, y0, angle, keypoints);
    return keypointsTransformed;
}

function transform(x, y, a, org) {
    a = 2 * Math.PI - a;
    const t = [
        [1, 0, -x],
        [0, 1, -y],
        [0, 0, 1]
    ];
    const s = [
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 1]
    ];
    const r = [
        [Math.cos(a), Math.sin(a), 0],
        [-Math.sin(a), Math.cos(a), 0],
        [0, 0, 1]
    ];

    const tranposeT = transpose(t)
    const orgMatrix = matrixMultiply(org, tranposeT);
    const orgTransposed = transpose(s);
    const orgTransformed = matrixMultiply(orgMatrix, orgTransposed);
    const orgTransformedTransposed = transpose(r);
    const result = matrixMultiply(orgTransformed, orgTransformedTransposed);
    return result;
}

function matrixMultiply(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = new Array(b[0].length);
        for (let j = 0; j < b[0].length; j++) {
            result[i][j] = 0;
            for (let k = 0; k < a[0].length; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}
function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function getFingerCounts(handLandmarks, label) {
    let count = 0;
    let sum = 0;
    let msg = '';
    const multiplier = label === 'left' ? 10 : 1;
    msg += `${label}: `;

    const dist_thumb_tip = handLandmarks[4][0];
    const dist_thumb_base = handLandmarks[3][0];
    const checker = dist_thumb_tip * dist_thumb_base;

    if (checker < 0) {
        // Do nothing
    } else if (Math.abs(dist_thumb_tip) > Math.abs(dist_thumb_base)) {
        count += 1;
        sum += 5 * multiplier;
        msg += `T${Math.floor(dist_thumb_tip)}, ${Math.floor(dist_thumb_base)} `;
    }

    const dist_index_tip = Math.abs(handLandmarks[8][1]);
    const dist_index_base = Math.abs(handLandmarks[6][1]);
    if (dist_index_tip > dist_index_base) {
        count += 1;
        sum += 1 * multiplier;
        msg += `I${Math.floor(dist_index_tip)}, ${Math.floor(dist_index_base)}`;
    }

    const dist_middle_tip = Math.abs(handLandmarks[12][1]);
    const dist_middle_base = Math.abs(handLandmarks[10][1]);
    if (dist_middle_tip > dist_middle_base) {
        count += 1;
        sum += 1 * multiplier;
        msg += `M${Math.floor(dist_middle_tip)}, ${Math.floor(dist_middle_base)} `;
    }

    const dist_ring_tip = Math.abs(handLandmarks[16][1]);
    const dist_ring_base = Math.abs(handLandmarks[14][1]);
    if (dist_ring_tip > dist_ring_base) {
        count += 1;
        sum += 1 * multiplier;
        msg += `R${Math.floor(dist_ring_tip)}, ${Math.floor(dist_ring_base)} `;
    }

    const dist_pinky_tip = Math.abs(handLandmarks[20][1]);
    const dist_pinky_base = Math.abs(handLandmarks[18][1]);
    if (dist_pinky_tip > dist_pinky_base) {
        count += 1;
        sum += 1 * multiplier;
        msg += `P${Math.floor(dist_pinky_tip)}, ${Math.floor(dist_pinky_base)} `;
    }

    return sum;
}


function processTarget(prompt, index, action) {
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    for (var i = 0; i < prompt_list.length; i++) {
        if (index.includes(i)) {
            html_prompt += `<span class='${action}'>${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `
        }
        else {
            html_prompt += `<span>${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
        }
    }
    return html_prompt;
}

function processInitialPrompt(prompt) {
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    for (var i = 0; i < prompt_list.length; i++) {
        html_prompt += `<span>${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
    }
    return html_prompt;
}

function processPrompt(prompt) {
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    for (var i = 0; i < prompt_list.length; i++) {
        html_prompt += `<span id="${i + 1}">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
    }
    return html_prompt;
}

function processPromptDelete(prompt, index1, index2) {
    console.log(index1, index2);
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    for (var i = 0; i < prompt_list.length; i++) {
        if (i + 1 >= index1 && i + 1 <= index2) {
            html_prompt += `<span id="${i + 1}" class="last-edited"><s>${prompt_list[i]}</s><sup style="visibility: hidden">${i + 1}</sup></span> `
        }
        else {
            html_prompt += `<span id="${i + 1}">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
        }
    }
    return html_prompt;
}

function processPromptReplace(prompt, startIndex, newText) {
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    var newWords = newText.split(" ");

    for (var i = 0; i < prompt_list.length; i++) {
        if (i === startIndex) {
            html_prompt += `<span id="${i + 1}" class="selected">${newWords.join(' ')}<sup style="visibility: hidden">${i + 1}</sup></span> `;
            i += newWords.length - 1; // Skip the indices of the replaced words
        } else {
            html_prompt += `<span id="${i + 1}">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
        }
    }
    return html_prompt;
}

function processPromptInsert(prompt, startIndex, insertedWordCount, originalInsertedText) {
    var prompt_list = prompt.split(" ");
    var html_prompt = "";
    var isSpace = originalInsertedText.trim() === '';

    for (var i = 0; i < prompt_list.length; i++) {
        if (i + 1 >= startIndex && i < startIndex + insertedWordCount) {
            if (isSpace) {
                html_prompt += `<span id="${i + 1}" class="selected">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `
            } else {
                let className = i + 1 < startIndex + insertedWordCount ? "last-edited" : "selected";
                html_prompt += `<span id="${i + 1}" class="${className}">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `
            }
        } else {
            html_prompt += `<span id="${i + 1}">${prompt_list[i]}<sup style="visibility: hidden">${i + 1}</sup></span> `;
        }
    }
    return html_prompt;
}

function insertText(text, index) {
    if (text != "") {
        let wordlist = currentData["prompt"].split(' ');
        wordlist.splice(index - 1, 0, text);
        currentData["prompt"] = wordlist.join(' ');
        console.log(currentData["prompt"], currentData["prompt"].length);
        console.log(currentData["target_sentence"], currentData["target_sentence"].length);
        strDiff(currentData["prompt"], currentData["target_sentence"])
    }
    document.getElementById("prompt").innerHTML = processPrompt(currentData["prompt"]);
}

function insertTextTemp(text, index) {
    let wordlist = currentData["prompt"].split(' ');
    let insertedWords = text.split(' ');
    wordlist.splice(index - 1, 0, ...insertedWords);
    document.getElementById("prompt").innerHTML = processPromptInsert(wordlist.join(' '), index, insertedWords.length, text);
}


function replaceText(text, index1, index2 = null) {
    console.log(text, index1, index2);
    let wordlist = currentData["prompt"].split(' ');

    index1 = Math.max(0, index1 - 1);

    if (index2 === null) {
        wordlist[index1] = text;
    } else {
        if (index1 > index2 - 1) {
            [index1, index2] = [index2 - 1, index1 + 1];
        }
        index2 = Math.min(wordlist.length, index2);
        const numToReplace = index2 - index1;
        wordlist.splice(index1, numToReplace, text);
    }

    currentData["prompt"] = wordlist.join(' ');
    strDiff(currentData["prompt"], currentData["target_sentence"]);
    document.getElementById("prompt").innerHTML = processPrompt(currentData["prompt"]);
}


function replaceTextTemp(text, index1, index2 = null) {
    let wordlist = tempData.split(' ');
    index1 = Math.max(0, index1 - 1);

    if (index2 === null) {
        wordlist.splice(index1, 1, text);
    } else {
        if (index1 > index2 - 1) {
            [index1, index2] = [index2 - 1, index1 + 1];
        }
        index2 = Math.min(wordlist.length, index2);
        const numToReplace = index2 - index1;
        wordlist.splice(index1, numToReplace, text);
    }

    tempData = wordlist.join(' ');
    document.getElementById("prompt").innerHTML = processPromptReplace(tempData, index1, text);
}


function deleteText(index1, index2 = null) {
    let wordlist = currentData["prompt"].split(' ');
    index1 = Math.max(0, index1 - 1);

    if (index2 === null) {
        wordlist.splice(index1, 1);
    } else {
        if (index1 > index2 - 1) {
            [index1, index2] = [index2 - 1, index1 + 1];
        }
        index2 = Math.min(wordlist.length, index2);
        const numToRemove = index2 - index1;
        wordlist.splice(index1, numToRemove);
    }

    currentData["prompt"] = wordlist.join(' ');
    strDiff(currentData["prompt"], currentData["target_sentence"]);
    document.getElementById("prompt").innerHTML = processPrompt(currentData["prompt"]);
}

function deleteTextTemp(index1, index2) {
    console.log(index1, index2);
    if (index2 === undefined) {
        index2 = index1;
    }
    document.getElementById("prompt").innerHTML = processPromptDelete(tempData, index1, index2);
}


function drawLandmarks(ctx, landmarks, style = {}) {
    const { color = 'white', radius = 5 } = style;
    ctx.fillStyle = color;

    for (const landmark of landmarks) {
        const x = canvasElement.width - landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawConnectors(ctx, landmarks, connections, style = {}) {
    const { color = 'white', lineWidth = 1 } = style;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    for (const [startIndex, endIndex] of connections) {
        const startLandmark = landmarks[startIndex];
        const endLandmark = landmarks[endIndex];

        const startX = canvasElement.width - startLandmark.x * canvasElement.width;
        const startY = startLandmark.y * canvasElement.height;
        const endX = canvasElement.width - endLandmark.x * canvasElement.width;
        const endY = endLandmark.y * canvasElement.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}