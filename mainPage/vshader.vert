// https://github.com/processing/p5.js-website/blob/main/src/data/examples/assets/uniforms.vert

// vert file and comments from adam ferriss
// https://github.com/aferriss/p5jsShaderExamples
  
  attribute vec3 aPosition;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = (aPosition.xy + 1.0) / 2.0;
    gl_Position = vec4(aPosition, 1.0);
  }


 