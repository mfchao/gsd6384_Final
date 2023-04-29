async function loadAndPredict() {

  // Load the model
  const net = await bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    quantBytes: 2
  });

  // Get access to the webcam
  const video = document.getElementById('video');

  // Add event listener for loadeddata event
  video.addEventListener('loadeddata', async () => {
    await video.play();

    // Create a canvas for rendering the segmentation
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    const predict = async () => {

        // Get width and height of video element
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const segmentation = await net.segmentMultiPerson(video);
      const maskBackground = true;
      // Convert the segmentation into a mask to darken the background.
      const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
      const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
      const backgroundDarkeningMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor, true);
    
      // Define opacity and maskBlurAmount values
      const opacity = 1;
      const maskBlurAmount = 3; 
    
      // bodyPix.drawMask(canvas, video, backgroundDarkeningMask, opacity, maskBlurAmount);

      contourList = GetContour(videoWidth, videoHeight, ctx)

      //test image
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const radius = 100;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.fill();

      const sdf = calculateSDF(canvas, ctx);

      // Color the signed distance field
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const value = sdf[y * canvas.width + x];
          const color = value < 0 ? 'red' : 'green';
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      
     // const signedDistanceField = computeSignedDistanceField(contour, videoWidth, videoHeight);

            
      requestAnimationFrame(predict);
    }

    // Start running the segmentation
    predict();
  });

  // Request access to webcam
  await navigator.mediaDevices.getUserMedia({video: true})
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error('Error accessing webcam: ', error);
    });

}

loadAndPredict();

//Get the contours of a person
function GetContour(videoWidth, videoHeight, ctx){
  // Get the contour from the canvas data
  const contourImageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
  const contour = [];
  for (let y = 0; y < videoHeight; y++) {
    for (let x = 0; x < videoWidth; x++) {
      const offset = (y * videoWidth + x) * 4;
      const r = contourImageData.data[offset];
      const g = contourImageData.data[offset + 1];
      const b = contourImageData.data[offset + 2];
      //if color is not black or white, it is the contour
      const isContour = (r > 0 || g > 0 || b > 0) && (r < 255 || g < 255 || b < 255);
      if (isContour) {
        contour.push({x, y});
      
      }
    }
  }
  return contour
}


function calculateSDF(canvas, ctx) {
  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Create an array to hold the signed distance field values
  const sdf = new Float32Array(canvas.width * canvas.height);

  // Loop through each pixel and calculate the signed distance field value
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Get the pixel index for this (x, y) coordinate
      const pixelIndex = (y * canvas.width + x) * 4;

      // Check if the pixel is black or white
      const isBlack = imageData.data[pixelIndex] === 0;
      const isWhite = imageData.data[pixelIndex] === 255;

      if (!isBlack && !isWhite) {
        // The pixel is not black or white, so its distance is 0
        sdf[y * canvas.width + x] = 0;
      } else {
        // Find the distance to the nearest non-black/white pixel
        let minDistance = Infinity;
        for (let j = 0; j < canvas.height; j++) {
          for (let i = 0; i < canvas.width; i++) {
            const index = (j * canvas.width + i) * 4;
            if (imageData.data[index] !== 0 && imageData.data[index] !== 255) {
              const distance = Math.sqrt((x - i) ** 2 + (y - j) ** 2);
              if (distance < minDistance) {
                minDistance = distance;
              }
            }
          }
        }

        // Set the signed distance field value for this pixel
        sdf[y * canvas.width + x] = isBlack ? minDistance : -minDistance;
      }
    }
  }

  console.log("got sdf")

  // Return the signed distance field values
  return sdf;
}

// function computeSignedDistanceField(contour, width, height) {

//   if (!contour) {
//     return null;
//   }
//   // Allocate a new image to store the signed distance field
//   const signedDistanceField = new ImageData(width, height);

//   // Compute the distance field for each pixel
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       // Compute the distance to the nearest point on the contour
//       for (let i = 0; i < contour.length; i++) {
//         const dx = x - contour[i].x;
//         const dy = y - contour[i].y;
//         const dist = Math.sqrt(dx * dx + dy * dy);   

        
//         // Set the signed distance based on whether the pixel is inside or outside the contour
//         const inside = pointInPolygon(contour[i]);

//         // Set the signed distance based on whether the pixel is inside or outside the contour
//         const sign = inside ? -1 : 1;
//         const sdf = sign * dist;
         
//         //plot sdf for each pixel

       
//       }
//     }
//   }

//   return signedDistanceField;
// }

// function pointInPolygon(x, y) {
//   let inside = false;
  
//   //if point is black, inside = false

//   //if point is white, inside = true
  
//   return inside;
// }
