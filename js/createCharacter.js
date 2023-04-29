

// Our main render shader
let myShader;

const circle = {
  center: [250, 250],
  r: 75,
  border: 5
};

const box = {
  center: [250, 250],
  dimensions: [100,200],
};

const triangle = {
  center: [250, 250],
};

const cross = {
  center: [250, 250],
  diameter: 10,
};

// Always use `preload` in p5 for any async functions that may take long
// to execute but are needed before program starts.
function preload() {
  myShader = loadShader('shaders/vshader.vert', 'shaders/fshader.frag');
}

function setup() {
  // Use WEBGL renderer for shaders
  createCanvas(500, 500, WEBGL);
  pixelDensity(1);
}

function draw() {
  // Set the active shader
  shader(myShader);

  // Send whichever information we want to pass to the shader
  // using uniforms
  myShader.setUniform('u_resolution', [width, height]);
  myShader.setUniform('u_mouse', [mouseX, height - mouseY]);
  myShader.setUniform('u_time', 0.001 * millis()); // time in secs
  // myShader.setUniform('u_circle', [circle.center[0], circle.center[1], circle.r]);
  myShader.setUniform('u_border', [circle.border]);
  // myShader.setUniform('u_box', [box.center[0], box.center[1], box.dimensions[0], box.dimensions[0]]);
  // myShader.setUniform('u_triangle', [triangle.center[0], triangle.center[1]]);
  // myShader.setUniform('u_cross', [cross.center[0], cross.center[1], cross.diameter]);

  // let u_shapeType = 0;
  // myShader.setUniform('u_shapeType', u_shapeType);




  // Draw a full screen rectangle to apply the shader to
  rect(0, 0, width, height);
  

}

let currentQuestionIndex = 0;


function nextQuestion() {
  // Get the number of questions
  const numQuestions = 5;

  // If we're not already at the last question
  if (currentQuestionIndex < numQuestions - 1) {
    // Hide the current question
    const currentQuestion = document.getElementById("question-" + currentQuestionIndex);
    if (currentQuestion) {
      currentQuestion.classList.add("hidden");
    }

    // Show the next question
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = document.getElementById("question-" + nextQuestionIndex);
    if (nextQuestion) {
      console.log("found")
      nextQuestion.classList.remove("hidden");
    }

    // Update the current question index
    currentQuestionIndex = nextQuestionIndex;
    console.log(currentQuestionIndex)

    // If this was the last question, hide the next button
    if (currentQuestionIndex === numQuestions - 1) {
      const nextButton = document.getElementById("next-button");
      nextButton.style.display = "none";
    }
  }
}

function previousQuestion() {
  // Get the number of questions
  const numQuestions = 5;

  // If we're not already at the first question
  if (currentQuestionIndex > 0) {
    // Hide the current question
    const currentQuestion = document.getElementById("question-" + currentQuestionIndex);
    if (currentQuestion) {
      currentQuestion.classList.add("hidden");
    }

    // Show the previous question
    const previousQuestionIndex = currentQuestionIndex - 1;
    const previousQuestion = document.getElementById("question-" + previousQuestionIndex);
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






function updateShapeType(optionValue) {
  let u_shapeType;
  // optionValue is the unique value assigned to the clicked option
  if (optionValue === 'option1') {
    u_shapeType = circle;
    myShader.setUniform('u_circle', [u_shapeType.center[0], u_shapeType.center[1], u_shapeType.r]);
    console.log(u_shapeType)
  } else if (optionValue === 'option2') {
    u_shapeType = box;
    myShader.setUniform('u_box', [u_shapeType.center[0], u_shapeType.center[1]]);
    myShader.setUniform('u_boxDim', u_shapeType.dimensions[0], u_shapeType.dimensions[1]);
    console.log(u_shapeType)
  } else if (optionValue === 'option3') {
    u_shapeType = triangle;
    myShader.setUniform('u_triangle', [u_shapeType.center[0], u_shapeType.center[1]]);
    console.log(u_shapeType)
  } else if (optionValue === 'option4') {
    u_shapeType = cross;
    myShader.setUniform('u_cross', [u_shapeType.center[0], u_shapeType.center[1], u_shapeType.diameter]);
    console.log(u_shapeType);
  }
  // myShader.setUniform('u_shapeType', u_shapeType);
  console.log("set uniform")
}

function updateEdgeType(optionValue) {
  let u_edgeType;
  // optionValue is the unique value assigned to the clicked option
  if (optionValue === 'option1') {
    u_edgeType = 0;
    console.log(u_edgeType)
  } else if (optionValue === 'option2') {
    u_edgeType = 1;
    console.log(u_edgeType)
  } else if (optionValue === 'option3') {
    u_edgeType = 2;
    console.log(u_edgeType)
  } else if (optionValue === 'option4') {
    u_edgeType = 3;
    console.log(u_edgeType)
  }
  myShader.setUniform('u_edgeType', u_edgeType);
  console.log("set uniform")
}


function updateColorType(optionValue) {
  let u_colorType = 1;
  // optionValue is the unique value assigned to the clicked option
  if (optionValue === 'option1') {
    u_colorType = 0;
   
  } else if (optionValue === 'option2') {
    u_colorType = 1;

  } else if (optionValue === 'option3') {
    u_colorType = 2;
  
  } else if (optionValue === 'option4') {
    u_colorType = 3;

  }
  myShader.setUniform('u_colorType', u_colorType);
  console.log("set uniform")
}

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

