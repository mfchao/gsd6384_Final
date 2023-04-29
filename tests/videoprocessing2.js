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
      const segmentation = await net.segmentMultiPerson(video);
      const maskBackground = true;
      // Convert the segmentation into a mask to darken the background.
      const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
      const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
      const backgroundDarkeningMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor, true);
    
      // Define opacity and maskBlurAmount values
      const opacity = 1;
      const maskBlurAmount = 3; 
    
      bodyPix.drawMask(canvas, video, backgroundDarkeningMask, opacity, maskBlurAmount);
      
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

