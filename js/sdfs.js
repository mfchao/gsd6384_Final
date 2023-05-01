// Signed Distance Functions
// Adapted from https://iquilezles.org/articles/distfunctions2d/

/**
 * 2D Circle
 * @param {*} pixel 
 * @param {*} center 
 * @param {*} radius 
 * @returns 
 */
function sdCircle(pixel, center, radius) {
    // float sdCircle( vec2 p, float r )
    // {
    //   return length(p) - r;
    // }
  
    const dx = pixel[0] - center[0];
    const dy = pixel[1] - center[1];
  
    return Math.sqrt(dx * dx + dy * dy) - radius;
  }
  
  /**
   * 2D Rectangle
   * @param {*} pixel 
   * @param {*} center 
   * @param {*} size 
   * @returns 
   */
  function sdRect(pixel, center, size) {
    // float sdBox( in vec2 p, in vec2 b )
    // {
    //   vec2 d = abs(p)-b;
    //   return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    // }
  
    const px = pixel[0] - center[0];
    const py = pixel[1] - center[1];
  
    const dx = Math.abs(px) - size[0];
    const dy = Math.abs(py) - size[1];
  
    const dxmax = Math.max(dx, 0);
    const dymax = Math.max(dy, 0);
  
    return Math.sqrt(dxmax * dxmax + dymax * dymax) +
      Math.min(Math.max(dx, dy), 0);
  }
  

//   function sdEquilateralTriangle(pixel) {
//     const k = sqrt(3.0);
//     pixel[0] = abs(pixel[0]) - 1.0;
//     pixel[1] = pixel[1] + 1.0/k;
//     if( pixel[0]+k*pixel[1]>0.0 ) p = vec2(pixel[0]-k*pixel[1],-k*pixel[0]-pixel[1])/2.0;
//     pixel[0] -= clamp( pixel[0], -2.0, 0.0 );
//     return -length(p)*sign(pixel[1]);
// }
  
  
  
  
  
  
  
  // SDF intersections: https://iquilezles.org/articles/distfunctions/
  // Interesting post on SDF combination (in ): https://www.ronja-tutorials.com/post/035-2d-sdf-combination/
  
  
  /**
   * Union of 2 SDFs
   * @param {*} d1 
   * @param {*} d2 
   * @returns 
   */
  function opUnion(d1, d2) {
    return Math.min(d1, d2);
  }
  
  /**
   * Intersection of 2 SDFs
   * @param {*} d1 
   * @param {*} d2 
   * @returns 
   */
  function opIntersection(d1, d2) {
    return Math.max(d1, d2);
  }
  
  /**
   * Subtraction of SDF1 - SDF2
   * @param {*} d1 
   * @param {*} d2 
   * @returns 
   */
  function opSubtraction(d1, d2) {
    return Math.max(d1, -d2);
  }
  
  
  /**
   * Smooth union of 2 SDFs
   * @param {*} d1 
   * @param {*} d2 
   * @param {*} k 
   * @returns 
   */
  function opSmoothUnion(d1, d2, k) {
    const h = Math.max(k - Math.abs(d1 - d2), 0);
    return Math.min(d1, d2) - 0.25 * h * h / k;
  }
  
  /**
   * Smooth subtraction of SDF1 - SDF2
   * @param {*} d1 
   * @param {*} d2 
   * @param {*} k 
   * @returns 
   */
  function opSmoothSubtraction(d1, d2, k) {
    //float h = max(k-abs(-d1-d2),0.0);
    //return max(-d1, d2) + h*h*0.25/k;
  
    return -opSmoothUnion(d1, -d2, k);
  }
  
  /**
   * Smooth inersection of 2 SDFs
   * @param {*} d1 
   * @param {*} d2 
   * @param {*} k 
   * @returns 
   */
  function opSmoothIntersection(d1, d2, k) {
    //float h = max(k-abs(d1-d2),0.0);
    //return max(d1, d2) + h*h*0.25/k;
  
    return -opSmoothUnion(-d1, -d2, k);
  }