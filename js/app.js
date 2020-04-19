/*** HTML ELEMENTS ***/
const webcamCapture = document.getElementById("webcam-capture");
const canvasContainer = document.getElementById("canvas-container");
const controls = document.getElementById("controls");
const drawModeButtons = document.querySelectorAll("input[type=radio]");
const radiusRange = document.getElementById("radius-range");
const saveImage = document.getElementById("save-image");

/*** DEFAULT SETTINGS ***/
let video;
let imageLoaded = false;
let radius = parseInt(radiusRange.value);
let drawMode = document.querySelector("input[type=radio]:checked").value;

/*** RUNTIME ***/
function setup() {
  frameRate(5);
  const canvas = createCanvas(0,0);
  canvas.parent('canvas-container');
  video = createCapture(VIDEO);
  video.parent('webcam-capture');
}

function draw() {
  if (imageLoaded) fixSelfImage();
}

/*** VIDEO CAPTURE ***/
webcamCapture.addEventListener("click", init);

function init() {
  webcamCapture.style.display = "none";
  canvasContainer.style.visibility = "visible";
  controls.style.visibility = "visible";
  resizeCanvas(video.width, video.height);
  image(video, 0, 0);
  video.remove();
  imageLoaded = true;
}

/*** IMAGE ALTERATION ***/
function fixSelfImage() {
  const point = getPixel(drawMode);
  console.log(point.y);
  console.log(point.y + radius);
  for (let x = point.x - radius; x < point.x + radius; x++) {
    for (let y = point.y - radius; y < point.y + radius; y++) {
      const pixel = get(x, y);
      if (reduceNumber(sumColors(...pixel)) % 2 === 1) set(x, y, colorShift(pixel));
    }
  }
  updatePixels();
}

/*** ALTERATION CONTROLS ***/
drawModeButtons.forEach(button => {
  button.addEventListener("change", function(event) {
    drawMode = document.querySelector("input[type=radio]:checked").value;
  });
});

radiusRange.addEventListener("change", function(event) {
  radius = parseInt(event.target.value);
});

saveImage.addEventListener("click", function() {
  saveCanvas("fixed-self-image", "jpg");
});

/*** HELPER METHODS ***/
const getPixel = mode => (mode === "mouse") ? createVector(mouseX, mouseY) : createVector(random(0, width), random(0, height));
const colorShift = pixel => pixel.map((v, i) => (i !== 3) ? offsetColorValue(v) : v);
const sumColors = (r, g, b) => r + g + b;
const reduceNumber = num => (num - 1) % 9 + 1;
const offsetColorValue = n => n + (n <= 0 || n >= 255) ? rng(0, 255) : randomFlip(sumOfDigits(n));
const sumOfDigits = n => (n + "").split("").map(d => parseInt(d)).reduce((a, b) => a + b);
const randomFlip = n => Math.random() < 0.5 ? n : -n;
const rng = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);