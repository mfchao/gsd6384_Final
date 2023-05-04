// Shader variables
let sdfShader;
let graphics;

// Circle variables
let circleCenter;
let dragging = false;
let clickOffset = { x: 0, y: 0 };

let num_people = 0;

// Vertex shader code


function preload() {
  sdfShader = loadShader('vshader.vert', 'fshader.frag');;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  graphics = createGraphics(windowWidth, windowHeight, WEBGL);
  graphics.noStroke();

  // Initialize circle center
  circleCenter = createVector(0.5, 0.5);
}

function draw() {
  graphics.shader(sdfShader);
  sdfShader.setUniform('resolution', [width, height]);
  sdfShader.setUniform('circleCenter', [circleCenter.x, circleCenter.y]);
  sdfShader.setUniform('numContours', 100.0); // Change this value to set the number of contours
  sdfShader.setUniform('numPeople', num_people);
  sdfShader.setUniform('time', 0.001 * millis());
  sdfShader.setUniform('altContourColor', [0.0, 0.3, 1.0]); // Set the alternative contour color to blue
  
  graphics.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  image(graphics, -width / 2, -height / 2);
}

function mousePressed() {
    let aspectRatio = width / height;
    let mousePos = createVector((mouseX / width) * aspectRatio, 1 - mouseY / height);
    let distanceToCircle = p5.Vector.dist(mousePos, circleCenter);
    if (distanceToCircle < 0.3) {
      dragging = true;
      clickOffset.x = circleCenter.x - mousePos.x;
      clickOffset.y = circleCenter.y - mousePos.y;
    }
  }
  
  function mouseDragged() {
    if (dragging) {
      let aspectRatio = width / height;
      circleCenter.x = (mouseX / width) * aspectRatio + clickOffset.x;
      circleCenter.y = 1 - mouseY / height + clickOffset.y;
    }
  }
  
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    graphics.resizeCanvas(windowWidth, windowHeight);
  }

  document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowUp') {
      if (num_people <= 10) {
        num_people++;
      }
    } else if (event.code === 'ArrowDown') {
      if (num_people >= 1) {
        num_people--;
      }
    }
    console.log(num_people); // log current integer value to console
  });
  
  
