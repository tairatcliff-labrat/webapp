// Set constraints for the video stream
var constraints = { video: { facingMode: "user" }, audio: false };
var fs = require('fs');

// Define constants
const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")
    cameraUpload = document.querySelector("#camera--upload")

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    })
    .catch(function(error) {
        console.error("Oops. Something is broken.", error);
    });
}

cameraUpload.onclick = function() {
  document.getElementById("#uploadPhoto").click();
}

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/webp");
    cameraOutput.classList.add("taken");

    // Capture the uploaded photo as a high quality jpeg
    userPhoto = cameraSensor.toDataURL('image/jpeg', 1.0);
    fs.writeFile('userPhoto.jpeg', userPhoto, function (err) {
      if (err) throw err;
      console.log('Saved Photo');
    });
};
// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
