self.addEventListener('message', function(e) {
  let config = e.data.config;
  let imagePixels = e.data.data;
  let width = e.data.width;
  let height = e.data.height;
  let squiggleData = [];
  let startx = 0.0;
  let starty = 0.0;
  let r  = 5;
  let a = 0.0;
  let b;
  let z;
  let coords = [];
  let currentVerticalPixelIndex = 0;
  let currentHorizontalPixelIndex = 0;
  let contrastFactor = (259 * (config.CONTRAST_ADJUSTMENT + 255)) / (255 * (259 - config.CONTRAST_ADJUSTMENT));
  for (let y = 0; y < height; y+= Math.floor(height/config.LINE_COUNT)) {
    a = 0.0;
    coords = [];
    currentVerticalPixelIndex = y*width;
    startx = 0;
    if (config.CONTRAST_ADJUSTMENT !== 0) {
      b =  parseInt((0.2125 * ( (contrastFactor* (imagePixels.data[4*currentVerticalPixelIndex]-128)+128) + config.BRIGHTNESS_ADJUSTMENT)) + (0.7154 * ((contrastFactor*(imagePixels.data[4*(currentVerticalPixelIndex + 1)] -128)+128) + config.BRIGHTNESS_ADJUSTMENT)) + (0.0721 * ((contrastFactor*(imagePixels.data[4*(currentVerticalPixelIndex+2)]-128)+128) + config.BRIGHTNESS_ADJUSTMENT)), 10);
    } else {
      b =  parseInt((0.2125 * (imagePixels.data[4*currentVerticalPixelIndex] + config.BRIGHTNESS_ADJUSTMENT)) + (0.7154 * (imagePixels.data[4*(currentVerticalPixelIndex + 1)] + config.BRIGHTNESS_ADJUSTMENT)) + (0.0721 * (imagePixels.data[4*(currentVerticalPixelIndex+2)]+ config.BRIGHTNESS_ADJUSTMENT)), 10);
    }

    z = 255 - b;
    starty = y + Math.sin(a)*r;
    coords.push([startx, starty]);

    for (let x = 1;x < width; x += config.SPACING ) {
      currentHorizontalPixelIndex = x+y*width;
      if (config.CONTRAST_ADJUSTMENT !== 0) {
        b =  parseInt((0.2125 * ( (contrastFactor* (imagePixels.data[4*currentHorizontalPixelIndex]-128)+128) + config.BRIGHTNESS_ADJUSTMENT)) + (0.7154 * ((contrastFactor*(imagePixels.data[4*(currentHorizontalPixelIndex + 1)] -128)+128) + config.BRIGHTNESS_ADJUSTMENT)) + (0.0721 * ((contrastFactor*(imagePixels.data[4*(currentHorizontalPixelIndex+2)]-128)+128) + config.BRIGHTNESS_ADJUSTMENT)), 10);
      } else {
        b = parseInt((0.2125 * (imagePixels.data[4*currentHorizontalPixelIndex] + config.BRIGHTNESS_ADJUSTMENT)) + (0.7154 * (imagePixels.data[4*(currentHorizontalPixelIndex + 1)]+ config.BRIGHTNESS_ADJUSTMENT)) + (0.0721 * (imagePixels.data[4*(currentHorizontalPixelIndex+2)] + config.BRIGHTNESS_ADJUSTMENT)), 10);
      }

      b = Math.max(config.MIN_BRIGHTNESS,b);
      z = Math.max(config.MAX_BRIGHTNESS-b,0);
      r = z/config.LINE_COUNT*config.AMPLITUDE;
      a += z/config.FREQUENCY;
      coords.push([x,y + Math.sin(a)*r]);
    }
    squiggleData.push(coords);
  }
  self.postMessage(squiggleData);

}, false);