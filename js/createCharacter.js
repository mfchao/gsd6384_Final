// Our main render shader
// let myShader;

const circle = {
  center: [250, 250],
  r: 2,
};

const box = {
  center: [250, 250],
  dim: [100,100],
  r: 1
};

const cross = {
  center: [250, 250],
  diameter: 10,
};

const star1 = {
  center: [250, 250],
  radius: 80,
  n: 3,
  m: 2,
}

const star2 = {
  center: [250, 250],
  radius: 80,
  n: 8,
  m: 3,
}

let shapeType = 0;
let edgeNumType = 0;
let edgeType = 0;
let colorType = 0;
let bandType = 0;
let showSinRings = false; // initially set to false



// function preload() {
//   myShader = loadShader('shaders/vshader.vert', 'shaders/fshader.frag');
// }

function setup() {
  // Use WEBGL renderer for shaders
  createCanvas(500, 500);
  pixelDensity(1);
}

// function draw() {
//   background(255);
//   // Set the active shader
//   // shader(myShader);

//   // Send whichever information we want to pass to the shader
//   // using uniforms
//   // myShader.setUniform('u_resolution', [width, height]);
//   // myShader.setUniform('u_mouse', [mouseX, height - mouseY]);
//   // myShader.setUniform('u_time', 0.001 * millis()); // time in secs
//   // // myShader.setUniform('u_circle', [circle.center[0], circle.center[1], circle.r]);
//   // myShader.setUniform('u_border', [circle.border]);
//   // myShader.setUniform('u_box', [box.center[0], box.center[1], box.dimensions[0], box.dimensions[0]]);
//   // myShader.setUniform('u_triangle', [triangle.center[0], triangle.center[1]]);
//   // myShader.setUniform('u_cross', [cross.center[0], cross.center[1], cross.diameter]);

//   // Draw a full screen rectangle to apply the shader to
//   // rect(0, 0, width, height);

//       // // Plot the SDF as you choose!
//       const gray = 255 * sdf;

//       // Update the pixels
//       const index = 4 * (x + y * width);
//       pixels[index + 0] = gray;
//       pixels[index + 1] = gray;
//       pixels[index + 2] = gray;
//       pixels[index + 3] = 255;
//     }
//   }
//   updatePixels();

// }


function redrawCanvas(shapeIndex, edgeNumIndex, edgeIndex, colorIndex, bandIndex) {
  background(255);
  loadPixels();
  

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r, g, b;
      let sdfValue = 0;
      let gray;
      let bandwidth = 0;
      // Compute the SDF for the current pixel based on the selected shape
      switch (shapeIndex) {
        case 0:
          sdfValue = sdBlobbyCross([x, y], circle.center, circle.r) - 80;
          break;
        case 1:
          sdfValue = sdCross([x, y], box.center, box.dim, box.r);
          break;
        case 2:
          sdfValue = sdStar([x, y], star1.center, star1.radius, star1.n, star1.m);
          break;
        case 3:
          sdfValue = sdStar([x, y], star2.center, star2.radius, star2.n, star2.m) - 20;
          break;
          
        default:
          break;
      }
      // Apply edge complexity
      switch (edgeNumIndex) {
        case 1:
          circle.r = -150;
          box.r = 120;
          star1.m = 2.8;
          star2.n = 20;
          star2.m = 18;
          break;
        case 2:
          circle.r = -100;
          box.r = 80;
          star1.m = 2.5;
          star2.n = 10;
          star2.m = 8;
          break;
        case 3:
          circle.r = -50;
          box.r = -20;
          star1.m = 2.2;
          star2.n = 7;
          star2.m = 2;
          break;
        case 4:
          circle.r = -20;
          box.r = -70;
          star1.m = 1.9;
          star2.n = 5;
          star2.m = 6;
          break;
        default:
          break;
      }
      

      // Apply edge roundness
      let edgeRoundness = 1.0;
      let curveCorner = 0;
      switch (edgeIndex) {
        case 1:
          edgeRoundness = 0.1;
          curveCorner = 0.2;
          break;
        case 2:
          edgeRoundness = 0.2;
          curveCorner = 0.5;
          break;
        case 3:
          edgeRoundness = 0.3;
          curveCorner = 0.9;
          break;
        case 4:
          edgeRoundness = 0.5;
          curveCorner = 5;
          break;
        default:
          break;
      }
      sdfValue = sdfValue * edgeRoundness - curveCorner;

      // modify your rendering code to only render sin rings if showSinRings is true
      if (showSinRings) {
        switch (bandIndex) {
          case 0:
            bandwidth = 5;
            break;
          case 1:
            bandwidth = 10;
            break;
          case 2:
            bandwidth = 15;
            break;
          case 3:
            bandwidth = 20;
            break;
          case 4:
            bandwidth = 25;
            break;
          default:
            break;
        }
        gray = Math.sign(Math.max(0, sdfValue)) * 0.5 * (Math.cos(TAU * sdfValue / bandwidth) + 1);
        sdfValue = gray;
      }
      

      // Apply color
      switch (colorIndex) {
        case 1:
          if (sdfValue < 0.2) {
            r = 255 ;
            g = 175 ;
            b = 25;
          } 
          break;
        case 2:
          if (sdfValue < 0.2) {
            r = 217;
            g = 54;
            b = 54;
          } 
          break;
        case 3:
          if (sdfValue < 0.2) {
            r = 18;
            g = 161;
            b = 196;
          } 
          break;
        case 4:
          if (sdfValue < 0.2) {
            r = 92;
            g = 150;
            b = 65;
          } 
          break;
        case 5:
          if (sdfValue < 0.2) {
            r = 213;
            g = 138;
            b = 222;
          } 
          break;
        default:
          r = 255 * sdfValue;
          g = 255 * sdfValue;
          b = 255 * sdfValue;
          break;
      }

      // Update the pixels only when necessary
      const index = 4 * (x + y * width);
      if (r !== undefined) pixels[index + 0] = r;
      if (g !== undefined) pixels[index + 1] = g;
      if (b !== undefined) pixels[index + 2] = b;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
}


function getIndexes(optionValue) {
  // set shape type
  if (optionValue === "0-option1") {
    shapeType = 0;
    console.log("got shape 0");
  } else if (optionValue === "0-option2") {
    shapeType = 1;
    console.log("got shape 1");
  } else if (optionValue === "0-option3") {
    shapeType = 2;
    console.log("got shape 2");
  } else if (optionValue === "0-option4") {
    shapeType = 3;
    console.log("got shape 3");
  }

  //set edge number
  if (optionValue === "1-option1") {
    edgeNumType = 1;
    console.log("got edge num 0");
  } else if (optionValue === "1-option2") {
    edgeNumType = 2;
    console.log("got edge num 1");
  } else if (optionValue === "1-option3") {
    edgeNumType = 3;
    console.log("got edge num 2");
  } else if (optionValue === "1-option4") {
    edgeNumType = 4;
    console.log("got edge num 3");
  }

  //set edge type
  if (optionValue === "2-option1") {
    edgeType = 1;
    console.log("got edge 0");
  } else if (optionValue === "2-option2") {
    edgeType = 2;
    console.log("got edge 1");
  } else if (optionValue === "2-option3") {
    edgeType = 3;
    console.log("got edge 2");
  } else if (optionValue === "2-option4") {
    edgeType = 4;
    console.log("got edge 3");
  }

  //set band type
  if (optionValue === "3-option1") {
    bandType = 1;
    showSinRings = true;
    console.log("got band 0");
  } else if (optionValue === "3-option2") {
    bandType = 2;
    showSinRings = true;
    console.log("got band 1");
  } else if (optionValue === "3-option3") {
    bandType = 3;
    showSinRings = true;
    console.log("got band 2");
  } else if (optionValue === "3-option4") {
    bandType = 4;
    showSinRings = true;
    console.log("got band 3");
  }

  //set color type
  if (optionValue === "4-option1") {
    colorType = 1;
    console.log("got color 0");
  } else if (optionValue === "4-option2") {
    colorType = 2;
    console.log("got color 1");
  } else if (optionValue === "4-option3") {
    colorType = 3;
    console.log("got color 2");
  } else if (optionValue === "4-option4") {
    colorType = 4;
    console.log("got color 3");
  } else if (optionValue === "4-option5") {
    colorType = 5;
    console.log("got color 5");
  }

  redrawCanvas(shapeType, edgeNumType, edgeType, colorType, bandType);
}



let currentQuestionIndex = 0;

function nextQuestion() {
  // Get the number of questions
  const numQuestions = 6;

  // If we're not already at the last question
  if (currentQuestionIndex < numQuestions - 1) {
    // Hide the current question
    const currentQuestion = document.getElementById(
      "question-" + currentQuestionIndex
    );
    if (currentQuestion) {
      currentQuestion.classList.add("hidden");
    }

    // Show the next question
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = document.getElementById(
      "question-" + nextQuestionIndex
    );
    if (nextQuestion) {
      nextQuestion.classList.remove("hidden");
    }

    // Update the current question index
    currentQuestionIndex = nextQuestionIndex;
    console.log(currentQuestionIndex);

    // If this was the last question, hide the next button
    if (currentQuestionIndex === numQuestions - 1) {
      const nextButton = document.getElementById("next-button");
      nextButton.style.display = "none";
    }
  }
}

function previousQuestion() {
  // Get the number of questions
  const numQuestions = 6;

  // If we're not already at the first question
  if (currentQuestionIndex > 0) {
    // Hide the current question
    const currentQuestion = document.getElementById(
      "question-" + currentQuestionIndex
    );
    if (currentQuestion) {
      currentQuestion.classList.add("hidden");
    }

    // Show the previous question
    const previousQuestionIndex = currentQuestionIndex - 1;
    const previousQuestion = document.getElementById(
      "question-" + previousQuestionIndex
    );
    if (previousQuestion) {
      previousQuestion.classList.remove("hidden");
    }

    // Update the current question index
    currentQuestionIndex = previousQuestionIndex;

    // If we're not at the last question, show the next button
    if (currentQuestionIndex < numQuestions - 1) {
      const nextButton = document.getElementById("next-button");
      nextButton.style.display = "block";
    }
  }
}

// function updateShapeType(optionValue) {
// let shapeType;
// // optionValue is the unique value assigned to the clicked option
// if (optionValue === 'option1') {
//   shapeType = circle;
//   myShader.setUniform('u_circle', [shapeType.center[0], shapeType.center[1], shapeType.r]);
//   console.log(shapeType)
// } else if (optionValue === 'option2') {
//   shapeType = box;
//   myShader.setUniform('u_box', [shapeType.center[0], shapeType.center[1]]);
//   myShader.setUniform('u_boxDim', shapeType.dimensions[0], shapeType.dimensions[1]);
//   console.log(shapeType)
// } else if (optionValue === 'option3') {
//   shapeType = triangle;
//   myShader.setUniform('u_triangle', [shapeType.center[0], shapeType.center[1]]);
//   console.log(shapeType)
// } else if (optionValue === 'option4') {
//   shapeType = cross;
//   myShader.setUniform('u_cross', [shapeType.center[0], shapeType.center[1], shapeType.diameter]);
//   console.log(shapeType);
// }
// // myShader.setUniform('shapeType', shapeType);
// console.log("set uniform")
//}

// function updateEdgeType(optionValue) {
  // let edgeIndex;
  // // optionValue is the unique value assigned to the clicked option
  // if (optionValue === 'option1') {
  //   edgeIndex = 0;
  //   console.log(edgeIndex)
  // } else if (optionValue === 'option2') {
  //   edgeIndex = 1;
  //   console.log(edgeIndex)
  // } else if (optionValue === 'option3') {
  //   edgeIndex = 2;
  //   console.log(edgeIndex)
  // } else if (optionValue === 'option4') {
  //   edgeIndex = 3;
  //   console.log(edgeIndex)
  // }
  // myShader.setUniform('edgeIndex', edgeIndex);
  // console.log("set uniform")
// }


function finish() {
  // hide the question container
  document.getElementById("question-container").style.display = "none";

  //  // show the larger image
  //  const planImage = document.getElementById("plan");
  //   if (planImage) {
  //     planImage.classList.remove("hidden");
  //   }

  // Get the canvas object
  let canvas = createCanvas(windowWidth, windowHeight);

  // Set the canvas to be fullscreen
  canvas.style("position", "absolute");
  canvas.style("top", "0");
  canvas.style("left", "0");
  canvas.style("z-index", "-1");
}
