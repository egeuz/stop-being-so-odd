/*** HTML ELEMENTS ***/
const webcamCapture = document.getElementById("webcam-capture");
const canvasContainer = document.getElementById("canvas-container");
const controls = document.getElementById("controls");
const drawModeButtons = document.querySelectorAll("input[type=radio]");
const radiusRange = document.getElementById("radius-range");
const framerateRange = document.getElementById("framerate-range");
const saveImage = document.getElementById("save-image");

/*** DEFAULT SETTINGS ***/
let video;
let imageLoaded = false;
let radius = parseInt(radiusRange.value);
let drawMode = document.querySelector("input[type=radio]:checked").value;

/*** RUNTIME ***/
function setup() {
  frameRate(parseInt(framerateRange.value));
  const canvas = createCanvas(0, 0);
  canvas.parent('canvas-container');
  video = createCapture(VIDEO, () => { webcamCapture.querySelector("p").style.display = "block" });
  video.parent('webcam-capture');
}

function draw() {
  if (imageLoaded) fixSelfImageOddsOnly();
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
//split canvas into equal areas then apply the filter to each of them separately [BROKEN]
function fixSelfImage4() {
  for(let x = 0; x < width; x++) {
    for(let y = 0; y < height; y++) {
      const basePixel = get(x, y);
      if(!pixelIsOdd(basePixel)) {
        for(let rx = x - radius; rx < x + radius; rx++) {
          for(let ry = y - radius; ry < y + radius; ry++) {
            if (rx < 0 || rx >= width || ry < 0 || ry >= height) continue;
            if (dist(rx, ry, x, y) > radius) continue;
            const pixel = get(rx, ry);
            if(pixelIsOdd(pixel)) {
              const newColor = getColorAverage(basePixel, pixel);
              set(x, y, newColor);
            }
          }
        }
      }
    }
  }
  console.log("completed");
  updatePixels();
}


//finds an even point, then fixes only OTHER odd pixels in the selection radius
function fixSelfImageOddsOnly() {
  const point = getPixel(drawMode);
  const basePixel = get(point.x, point.y);

  if (!pixelIsOdd(basePixel)) {
    for (let x = point.x - radius; x < point.x + radius; x++) {
      for (let y = point.y - radius; y < point.y + radius; y++) {
        //brush ignores area outside image
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        //make brush circular
        if (dist(point.x, point.y, x, y) > radius) continue;
        //average the pixel
        const pixel = get(x, y);
        if (pixelIsOdd(pixel)) {
          const newColor = getColorAverage(basePixel, pixel);
          set(x, y, newColor);
        }
      }
    }
    updatePixels();
  }

}

function fixSelfImageWhole() {
  const point = getPixel(drawMode);
  const basePixel = get(point.x, point.y);
  if (reduceNumber(sumColors(...basePixel)) % 2 === 0) {
    for (let x = point.x - radius; x < point.x + radius; x++) {
      for (let y = point.y - radius; y < point.y + radius; y++) {
        //brush ignores edges
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        //make brush circular;
        if (dist(point.x, point.y, x, y) > radius) continue;

        const pixel = get(x, y);
        const newColor = getColorAverage(basePixel, pixel);
        set(x, y, newColor);
      }
    }
    updatePixels();
  }

}


function fixSelfImage() {
  const point = getPixel(drawMode);
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
  button.addEventListener("change", function (event) {
    drawMode = document.querySelector("input[type=radio]:checked").value;
  });
});

radiusRange.addEventListener("change", function (event) {
  document.getElementById("current-radius").innerHTML = event.target.value;
  radius = parseInt(event.target.value);
});

framerateRange.addEventListener("change", function (event) {
  document.getElementById("current-framerate").innerHTML = event.target.value;
  frameRate(parseInt(event.target.value));
});

saveImage.addEventListener("click", function () {
  saveCanvas("fixed-self-image", "jpg");
});

/*** HELPER METHODS ***/


//getting pixel out of point
const getPixel = mode => (mode === "mouse") ? createVector(mouseX, mouseY) : createVector(random(0, width), random(0, height));
const pixelIsOdd = (pixel) => reduceNumber(sumColors(...pixel)) % 2 === 1;
//recursive odd/even algorithm
const sumColors = (r, g, b) => r + g + b;
const reduceNumber = num => (num - 1) % 9 + 1;
//color shift algorithm #2
const getColorAverage = (pixel1, pixel2) => {
  const result = [0, 0, 0, 255];
  return result.map((value, index) => {
    if (index !== 3) {
      return Math.sqrt((pixel1[index] ** 2 + pixel2[index] ** 2) / 2);
    } else {
      return 255;
    }
  });
}
//color shift algorithm #1
const colorShift = pixel => pixel.map((v, i) => (i !== 3) ? offsetColorValue(v) : v);
const offsetColorValue = n => n + (n <= 0 || n >= 255) ? rng(0, 255) : randomFlip(sumOfDigits(n));
const sumOfDigits = n => (n + "").split("").map(d => parseInt(d)).reduce((a, b) => a + b);
const randomFlip = n => Math.random() < 0.5 ? n : -n;
const rng = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);