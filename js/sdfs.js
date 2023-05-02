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
function sdStar(pixel, center, radius, n, m) {
    const an = Math.PI / n;
    const en = Math.PI / m;
    const acs = { x: Math.cos(an), y: Math.sin(an) };
    const ecs = { x: Math.cos(en), y: Math.sin(en) };
  
    let bn = Math.atan2(pixel[1] - center[1], pixel[0] - center[0]);
    bn = ((bn % (2 * an)) + 2 * an) % (2 * an) - an;
    const distToCenter = Math.sqrt((pixel[0] - center[0]) * (pixel[0] - center[0]) + (pixel[1] - center[1]) * (pixel[1] - center[1]));
    const x = distToCenter * Math.cos(bn);
    const y = Math.abs(distToCenter * Math.sin(bn));
    const p = { x, y };
  
    p.x -= radius * acs.x;
    p.y -= radius * acs.y;
    const proj = (p.x * ecs.x + p.y * ecs.y) / (ecs.x * ecs.x + ecs.y * ecs.y);
    p.x += ecs.x * Math.max(-proj, 0);
    p.y += ecs.y * Math.max(-proj, 0);
  
    return Math.sqrt(p.x * p.x + p.y * p.y) * Math.sign(p.x);
  }

  function sdBlobbyCross(pixel, center, he) {
    let pos = [Math.abs(pixel[0] - center[0]), Math.abs(pixel[1] - center[1])];
    pos = [Math.abs(pos[0] - pos[1]), 1.0 - pos[0] - pos[1]].map(x => x / Math.sqrt(2.0));
  
    const p = (he - pos[1] - 0.25 / he) / (6.0 * he);
    const q = pos[0] / (he * he * 16.0);
    const h = q * q - p * p * p;
  
    let x;
    if (h > 0.0) {
      const r = Math.sqrt(h);
      x = Math.pow(q + r, 1.0 / 3.0) - Math.pow(Math.abs(q - r), 1.0 / 3.0) * Math.sign(r - q);
    } else {
      const r = Math.sqrt(p);
      x = 2.0 * r * Math.cos(Math.acos(q / (p * r)) / 3.0);
    }
    x = Math.min(x, Math.sqrt(2.0) / 2.0);
  
    const z = [x, he * (1.0 - 2.0 * x * x)].map((v, i) => v - pos[i]);
    return Math.sqrt(z[0] * z[0] + z[1] * z[1]) * Math.sign(z[1]);
  }

function sdCross(pixel, center, size, radius) {
  const px = Math.abs(pixel[0] - center[0]);
  const py = Math.abs(pixel[1] - center[1]);
  const p = [py, px];

  const q = [p[0] - size[1], p[1] - size[0]];
  const k = Math.max(q[0], q[1]);
  const w = k > 0 ? q : [size[1] - p[1], -k];

  const d = Math.sqrt(w[0] * w[0] + w[1] * w[1]);
  return (k > 0 ? d : -d) + radius;
}

function sdRoundedCross(p, h, center) {
    const k = 0.5 * (h + 1.0 / h); // k should be const at modeling time
    p = [Math.abs(p[0] - center[0]), Math.abs(p[1] - center[1])];
    const d1 = p[0] - (k - h);
    const d2 = Math.max(p[0] - k, p[1] - h);
    return Math.sqrt(Math.min(Math.max(d1, d2), dot(p, p)));
    
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  
  
  
  
  
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