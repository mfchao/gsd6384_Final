function onOpenCvReady() {
    // OpenCV is ready
    navigator.mediaDevices.getUserMedia({ video: true }) // Access the webcam
    .then(function(stream) {
      var videoElement = document.getElementById('videoElement');
      // Set the webcam stream as the source for the video element
      videoElement.srcObject = stream; 
    //   videoElement.play(); // Start playing the video
      
      var canvasElement = document.getElementById('canvasElement');
      var ctx = canvasElement.getContext('2d');

        // Create background subtractor
      var backgroundSubtractor = new cv.BackgroundSubtractorMOG2(3, 16, false);

      
      function processVideo() {
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); 
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height); 
        var src = cv.imread(canvasElement); // Read image data from canvas

        // Remove background from video frame
        var fgMask = new cv.Mat();
        backgroundSubtractor.apply(src, fgMask);
        var maskedSrc = new cv.Mat();
        cv.bitwise_and(src, src, maskedSrc, fgMask);

        var dst = convertToGrayscale(maskedSrc); // Convert masked image to grayscale

        // Find contours
        var contours = new cv.MatVector();
        var hierarchy = new cv.Mat();
        cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        // Filter contours based on area and hierarchy
        var filteredContours = [];
        for (var i = 0; i < contours.size(); ++i) {
        var cnt = contours.get(i);
        var area = cv.contourArea(cnt);
        var hierarchyItem = hierarchy.intPtr(0, i);
        // Filter out small contours and contours with child contours
        if (area > 500 && hierarchyItem[3] == -1) {
            filteredContours.push(cnt);
        }
        }

        // Approximate contours to smoother polygons
        var poly = new cv.MatVector();
        for (var i = 0; i < filteredContours.length; ++i) {
        var tmp = new cv.Mat();
        var cnt = filteredContours[i];
        // You can try different epsilon values to control the smoothness of the contour
        cv.approxPolyDP(cnt, tmp, 10, true);
        poly.push_back(tmp);
        cnt.delete();
        }

        // Draw contours with random Scalar
        for (var i = 0; i < filteredContours.length; ++i) {
        var color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                    Math.round(Math.random() * 255));
        cv.drawContours(dst, poly, i, color, 2, 8, hierarchy, 0);
        }

        cv.imshow(canvasElement, dst); // Display image with contours on canvas
        
        // Clean up memory
        src.delete(); 
        maskedSrc.delete(); 
        fgMask.delete();
        dst.delete(); 
        contours.delete(); 
        hierarchy.delete(); 
        poly.delete();

        setTimeout(processVideo, 0); // Repeat the process for the next video frame
      }

      function convertToGrayscale(src) {
        var dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY); // Convert image to grayscale
        return dst;
      }
      
      
      setTimeout(processVideo, 0); // Start processing the video frames
    })
    .catch(function(err) {
      console.error('Error accessing webcam:', err);
    });
  }


