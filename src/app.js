import * as d3 from "d3";
import Squiggle from "./Squiggle";
//import quicksettings from 'quicksettings';
import io from 'socket.io-client';
//import Controller from 'cncjs-controller';
import rangesliderJs from 'rangeslider-js';
import Noty from 'noty';

let worker = new Worker('analyzer.js');
let imagePixels = [];

const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
const video = document.querySelector('video');
const selfieWidth = 550;
const selfieHeight = 550;
const serverIPAddress = 'https://192.168.42.1';
const serverPort = '3000';
const socket = io.connect(serverIPAddress + ':' + serverPort);

// HTML Elements
const lineCountValueEl = document.getElementById('lineCountValue');
const amplitudeValueEl = document.getElementById('amplitudeValue');
const lineSpacingValueEl = document.getElementById('lineSpacingValue');
const frequencyValueEl = document.getElementById('frequencyValue');
const brightnessValueEl = document.getElementById('brightnessValue');
const contrastValueEl = document.getElementById('contrastValue');
const lineCountValue = document.getElementById('lineCount');
const amplitudeValue = document.getElementById('amplitude');
const lineSpacingValue = document.getElementById('lineSpacing');
const frequencyValue = document.getElementById('frequency');
const brightnessValue = document.getElementById('brightness');
const contrastValue = document.getElementById('contrast');
const connectionStatusEl = document.getElementById('connectionStatus');
const captureButton = document.getElementById('captureButton');
const drawButton = document.getElementById('drawButton');

const config = {
  LINE_COUNT: 90,
  AMPLITUDE: 1.2,
  SPACING: 1,
  FREQUENCY: 135,
  LINE_WIDTH: 2,
  BRIGHTNESS_ADJUSTMENT: 0,
  CONTRAST_ADJUSTMENT: 0,
  MIN_BRIGHTNESS : 0,
  MAX_BRIGHTNESS: 255,
};

const svgContainer = d3.select("#svg-placeholder").append("svg")
  .attr("version", 1.1)
  .attr("width", selfieWidth)
  .attr("height", selfieHeight)
  .attr("viewBox", "0 0 "+ selfieWidth + " "+selfieHeight)
  .attr("xmlns", "http://www.w3.org/2000/svg");

const squiggle = new Squiggle({
  element: svgContainer,
  data: [],
  thickness : config.LINE_WIDTH
});

captureButton.addEventListener('click', () => {
  drawButton.style.display = 'inline-block';
  video.setAttribute('width', selfieWidth);
  video.setAttribute('height', selfieHeight);
  canvas.width = selfieWidth;
  canvas.height = selfieHeight;
  context.clearRect(0, 0, selfieWidth, selfieHeight);
  context.drawImage(video, 0, 0, selfieWidth, selfieHeight);
  imagePixels = context.getImageData(0, 0, selfieWidth, selfieHeight);
  processImage();
});

drawButton.addEventListener('click', () => {
  drawButton.classList.add('disabled');

  new Noty({
    type: 'success',
    layout: 'bottomRight',
    timeout: 25000,
    text: 'Your drawing has been sent to the robot and is currently processing!'
  }).show();

  const oReq = new XMLHttpRequest();
  oReq.open("POST", serverIPAddress + ':3000/upload', true);
  oReq.onload = function (oEvent) {
    console.log('uploaded!', oEvent);
    //drawButton.classList.remove('disabled');
  };

  oReq.onreadystatechange = () => {
    if (oReq.readyState === 4 && oReq.status === 200) {
      //const response = JSON.parse(oReq.responseText);
      //fileName = response.gcodeName;
      //loadFileForDrawing(fileName);
      drawButton.classList.remove('disabled');
    }
  };
  const svgDoctype = '<?xml version="1.0" standalone="no"?>'
    + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  // serialize our SVG XML to a string.
  let svgString = (new XMLSerializer()).serializeToString(d3.select('svg').node());

  // optimize the SVG path by cutting off floating point values after the first digit beyond floating point
  svgString = svgString.replace(/([\-+]?\d{1,}\.\d{3,}([eE][\-+]?\d+)?)/g, function (x) {
    return (+x).toFixed(1)
  });

  const blob = new Blob([svgDoctype + svgString], {type: 'image/svg+xml;charset=utf-8'});

  oReq.send(blob);
});


//var front = false;
//document.getElementById('flip-button').onclick = function() { front = !front; };

//var constraints = { video: { facingMode: (front? "user" : "environment") } };

const mediaConstraints = {
  audio: false,
  video: {
    width: selfieWidth,
    aspectRatio: {
      exact: selfieWidth / selfieHeight
    }
  }
};

navigator.mediaDevices.getUserMedia(mediaConstraints)
  .then((mediaStream) => {
    video.srcObject = mediaStream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
  })
  .catch((err) => { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

worker.addEventListener('message', function(e) {
  squiggle.setData(e.data);
}, false);

worker.onerror = function(error) {
  console.log('Worker error: ' + error.message + '\n');
  throw error;
};

function processImage() {
  worker.postMessage({ data: imagePixels, config: config, width: selfieWidth, height: selfieHeight});
}

rangesliderJs.create(lineCountValue, {
  onSlideEnd: (val) => {
    lineCountValueEl.innerHTML = val;
    config.LINE_COUNT = val;
    processImage();
  },
  onSlide: (val) => {
    lineCountValueEl.innerHTML = val;
  }
});

rangesliderJs.create(amplitudeValue, {
  onSlideEnd: (val) => {
    amplitudeValueEl.innerHTML = val;
    config.AMPLITUDE = val;
    processImage();
  },
  onSlide: (val) => {
    amplitudeValueEl.innerHTML = val;
  }
});

rangesliderJs.create(lineSpacingValue, {
  onSlideEnd: (val) => {
    lineSpacingValueEl.innerHTML = val;
    config.SPACING = val;
    processImage();
  },
  onSlide: (val) => {
    lineSpacingValueEl.innerHTML = val;
  }
});

rangesliderJs.create(frequencyValue, {
  onSlideEnd: (val) => {
    frequencyValueEl.innerHTML = val;
    config.FREQUENCY = val;
    processImage();
  },
  onSlide: (val) => {
    frequencyValueEl.innerHTML = val;
  }
});

rangesliderJs.create(brightnessValue, {
  onSlideEnd: (val) => {
    brightnessValueEl.innerHTML = val;
    config.BRIGHTNESS_ADJUSTMENT = val;
    processImage();
  },
  onSlide: (val) => {
    brightnessValueEl.innerHTML = val;
  }
});

rangesliderJs.create(contrastValue, {
  onSlideEnd: (val) => {
    contrastValueEl.innerHTML = val;
    config.CONTRAST_ADJUSTMENT = val;
    processImage();
  },
  onSlide: (val) => {
    contrastValueEl.innerHTML = val;
  }
});


socket.on('disconnect', function () {
  connectionStatusEl.innerHTML = 'Not Connected';
  connectionStatusEl.classList.remove('success');
  connectionStatusEl.classList.add('error');
});

socket.on('connect', function () {
  connectionStatusEl.innerHTML = 'Connected';
  connectionStatusEl.classList.remove('error');
  connectionStatusEl.classList.add('success');
});

socket.on('message', function(data) {
  console.log(data);
});

socket.on('serialport:open', function(data) {
  console.log(data);
});
socket.on('serialport:read', function(data) {
  console.log(data);
});
