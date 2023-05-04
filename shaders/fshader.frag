#ifdef GL_ES
precision mediump float;
#endif

// Define constant values
#define TAU 6.2831853071

// Define uniforms that can be passed to this shader.
// We will use 'book of shaders' naming convention.
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform float u_shapeRed;
uniform float u_shapeGreen;
uniform float u_shapeBlue;

uniform vec3 u_circle;
uniform vec3 u_trapezoid;
// uniform vec2 u_boxDim;
uniform vec4 u_star1;
uniform vec4 u_star2;
uniform float u_starR;

uniform vec4 u_planA;
uniform vec4 u_planB;


uniform vec2 u_position;

uniform int u_shapeType;
uniform int u_edgeNumType;
uniform int u_edgeType;
uniform int u_colorType;
uniform int u_bandType;
uniform bool u_showSinRings;

const float aa = 2.0;



float sdStar(in vec2 p, in float r, in float n, in float m)
{
    // next 4 lines can be precomputed for a given shape
    float an = 3.141593/float(n);
    float en = 3.141593/m;  // m is between 2 and n
    vec2  acs = vec2(cos(an),sin(an));
    vec2  ecs = vec2(cos(en),sin(en)); // ecs=vec2(0,1) for regular polygon

    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));
    p -= r*acs;
    p += ecs*clamp( -dot(p,ecs), 0.0, r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}


float sdBlobbyCross( in vec2 pos, float he )
{
    pos = abs(pos);
    pos = vec2(abs(pos.x-pos.y),1.0-pos.x-pos.y)/sqrt(2.0);

    float p = (he-pos.y-0.25/he)/(6.0*he);
    float q = pos.x/(he*he*16.0);
    float h = q*q - p*p*p;
    
    float x;
    if( h>0.0 ) { float r = sqrt(h); x = pow(q+r,1.0/3.0)-pow(abs(q-r),1.0/3.0)*sign(r-q); }
    else        { float r = sqrt(p); x = 2.0*r*cos(acos(q/(p*r))/3.0); }
    x = min(x,sqrt(2.0)/2.0);
    
    vec2 z = vec2(x,he*(1.0-2.0*x*x)) - pos;
    return length(z) * sign(z.y);
}

float dot2(vec2 v) {
return v.x*v.x + v.y*v.y;
}

float sdTrapezoid( in vec2 p, in float r1, float r2, float he )
{
    vec2 k1 = vec2(r2,he);
    vec2 k2 = vec2(r2-r1,2.0*he);
    p.x = abs(p.x);
    vec2 ca = vec2(p.x-min(p.x,(p.y<0.0)?r1:r2), abs(p.y)-he);
    vec2 cb = p - k1 + k2*clamp( dot(k1-p,k2)/dot2(k2), 0.0, 1.0 );
    float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
    return s*sqrt( min(dot2(ca),dot2(cb)) );
}



float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec3 calculateColor(vec2 coord, int shapeIndex, int edgeNumIndex, int edgeIndex, int colorIndex, int bandIndex, bool showSinRings) {
  float r, g, b;
  float sdfValue = 0.0;
  float gray;
  float bandwidth = 0.0;
  float circleFactor = 60.;
  float star2Factor = 10.;
  float planSDF = 0.0;

    float circleR =  u_circle.z;
    // float boxR = u_box.z;
    float star1M = u_star1.w;
    float star2N = u_star2.z;
    float star2M = u_star2.w;
    // vec2 boxDims = u_boxDim.xy;
    float starRadius = u_starR;
    float trapTop = u_trapezoid.x;
    float trapBottom =  u_trapezoid.y; 
    float trapHeight = u_trapezoid.z;

    vec2 center = vec2(250,250);

    //finish button pressed
    if (u_mouse == vec2(0,0)) {
        center = vec2(250,250);
    } else {
        center = u_mouse;

        //scale down
        circleFactor *= 0.5; 
        star2Factor *= 0.5;
        // boxDims *= 0.5;
        starRadius *= 0.5;
    }

    
 
    // Apply edge complexity
  if (edgeNumIndex == 1) {
    circleR = -150.0;
    // boxR = 120.0;
    trapTop *= 0.2;
    star1M = 2.8;
    star2N = 20.;
    star2M = 18.;
  }
  else if (edgeNumIndex == 2) {
    circleR = -100.;
    // boxR = 10.;
    trapTop *= 0.5;
    star1M = 2.5;
    star2N = 10.;
    star2M = 8.;
  }
  else if (edgeNumIndex == 3) {
   circleR = -50.;
    // boxR = -20.;
    trapTop *= 1.2;
    star1M = 2.2;
    star2N = 7.;
    star2M = 2.;
  }
  else if (edgeNumIndex == 4) {
    circleR = -20.;
    // boxR = -70.;
    trapTop *= 1.5;
    star1M = 1.9;
    star2N = 5.;
    star2M = 6.;
  }
  
  
  // Compute the SDF for the current pixel based on the selected shape
  if (shapeIndex == 0) {
    sdfValue = sdBlobbyCross(center.xy - gl_FragCoord.xy, circleR) - circleFactor;
    }
    else if (shapeIndex == 1) {
    sdfValue = sdTrapezoid(center.xy - gl_FragCoord.xy, trapTop, trapBottom, trapHeight);
    }
    else if (shapeIndex == 2) {
    sdfValue = sdStar(center.xy - gl_FragCoord.xy, starRadius, u_star1.z, star1M);
    }
    else if (shapeIndex == 3) {
    sdfValue = sdStar(center.xy - gl_FragCoord.xy, starRadius, star2N, star2M) - star2Factor;
    }
    else {
    // handle the case where shapeIndex is not one of the expected values
    }
  
  
  
  // Apply edge roundness
    float edgeRoundness = 1.0;
    float curveCorner = 0.0;

    if (edgeIndex == 1) {
    edgeRoundness = 0.1;
    curveCorner = 0.2;
    } else if (edgeIndex == 2) {
    edgeRoundness = 0.2;
    curveCorner = 0.5;
    } else if (edgeIndex == 3) {
    edgeRoundness = 0.3;
    curveCorner = 0.9;
    } else if (edgeIndex == 4) {
    edgeRoundness = 0.5;
    curveCorner = 5.0;
    }

    sdfValue = sdfValue * edgeRoundness - curveCorner;


    // modify your rendering code to only render sin rings if showSinRings is true
    if (showSinRings) {
    if (bandIndex == 0) {
        bandwidth = 5.;
    } else if (bandIndex == 1) {
        bandwidth = 10.;
    } else if (bandIndex == 2) {
        bandwidth = 15.;
    } else if (bandIndex == 3) {
        bandwidth = 20.;
    } else if (bandIndex == 4) {
        bandwidth = 25.;
    }
    gray = sign(max(0.0, sdfValue)) * 0.5 * (cos(TAU * sdfValue / bandwidth) + 1.0);
    sdfValue = gray;
    }


    // Apply color
    vec3 finalColor;

    if (colorIndex == 1) {
    
    if (sdfValue <= 0.5) {
        finalColor = vec3(1.0, 0.686, 0.098); // orange
    } else {
    finalColor = vec3(1.0); // white
    }
    } else if (colorIndex == 2) {
       
        if (sdfValue <= 0.5) {
         finalColor = vec3(0.85, 0.212, 0.212); // red
        } else {
    finalColor = vec3(1.0); // white
    }
    } else if (colorIndex == 3) {
        
        if (sdfValue <= 0.5) {
           finalColor = vec3(0.071, 0.631, 0.769); // blue
        }  else {
    finalColor = vec3(1.0); // white
    }
    } else if (colorIndex == 4) {
       
        if (sdfValue <= 0.5) {
             finalColor = vec3(0.361, 0.588, 0.255); // green
        }  else {
    finalColor = vec3(1.0); // white
    }
    } else if (colorIndex == 5) {
       
        if (sdfValue <= 0.5) {
            finalColor = vec3(0.835, 0.541, 0.871); // purple
        }  else {
    finalColor = vec3(1.0); // white
    }
    } else {
        finalColor = vec3(sdfValue);
    }

    if (u_planA != vec4(0,0,0,0)) {
        float planA_sdf = sdBox(u_planA.xy - gl_FragCoord.xy, u_planA.zw);
        float planB_sdf = sdBox(u_planB.xy - gl_FragCoord.xy, u_planB.zw);
        float sdfPlan = opUnion(planA_sdf, planB_sdf);

        // Solid AA stroke
        float dw = abs(sdfPlan);
        float gray = smoothstep(10. - 0.5 * aa, 10. + 0.5 * aa, dw);
        

         float unionWall = opSmoothUnion(gray, sdfValue, -0.2);

         vec3 planColor = vec3(unionWall,unionWall,unionWall);

        // Linearly interpolate each of the color channels between
        planColor = mix(planColor, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(sdfPlan)));

        float planSmoothness = 0.4;
        // Combine the final color with the plan SDF
        finalColor = mix(finalColor, planColor, smoothstep(0.0, planSmoothness, sdfPlan));
    }

    return finalColor;
    

    return finalColor;

}



void main() {
  // Calculate the pixel position
  

  vec2 fragCoord = (2.0 * (gl_FragCoord.xy / u_resolution.xy)) - 1.0;
  
  // Calculate the RGB color based on the shapeType, edgeNumType, edgeType, colorType, and bandType
  vec3 color = calculateColor(fragCoord.xy, u_shapeType, u_edgeNumType, u_edgeType, u_colorType, u_bandType, u_showSinRings);


//   if (u_planA != vec4(0,0,0,0)) {
//     float planA = sdBox(u_planA.xy - gl_FragCoord.xy, u_planA.zw);
//     float planB = sdBox(u_planB.xy - gl_FragCoord.xy, u_planB.zw);
//     float sdfPlan = opUnion(planA, planB);
    
//     // // Solid AA stroke
//     float dw = abs(sdfPlan);
//     float gray = smoothstep(10. - 0.5 * aa, 10. + 0.5 * aa, dw);
//     vec3 u_planColor = vec3(gray,gray,gray);

//     // Set pixel color based on SDF sign
//     // vec3 u_planColor = (sdfPlan > 0.0) ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);

//     //wavy
//     // u_planColor *= 0.8 + 0.2 * cos(150.0 * sdfPlan);

//     // Linearly interpolate each of the color channels between
//     u_planColor = mix(u_planColor, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(sdfPlan)));

//     float u_planSmoothness = 0.4;
//     // Combine the final color with the plan SDF
//     vec3 finalCol = mix(color, u_planColor, smoothstep(0.0, u_planSmoothness, sdfPlan));
//     color = finalCol;


//   } 
  gl_FragColor = vec4(color, 1.0);
}
// void main() {
    // float d = sdCircle(u_circle.xy - gl_FragCoord.xy, circleR);

    //   float d = 0.0;
    //   vec4 show;
      
    
    //determine shape
//     if (u_circle != vec3(0,0,0)) {
//         // Draw a circle
//         d = sdCircle(u_circle.xy - gl_FragCoord.xy, circleR);
//     } else if (u_box != vec2(0,0) && u_boxDim != vec2(0,0)) {
//         // Draw a square
//         d = sdBox(u_box.xy - gl_FragCoord.xy, u_boxDim);
//     } else if (u_triangle != vec2(0,0)) {
//         // Draw a triangle
//         d = sdEquilateralTriangle((2.0 * gl_FragCoord.xy - u_triangle.xy - 250.0)/u_triangle.y);
//         d = abs(d);
//     } 
//     else {
//         // Draw an irregular shape
//         d = sdBlobbyCross(u_cross.xy - gl_FragCoord.xy, u_cross.z);
//     }
//     show = vec4(d, d, d, 1.0);
    

//     //edge roundness
//    if (u_edgeType <= 0.0) {
//     edgeRoundness = 2.0;
//     } else if (u_edgeType == 1.0) {
//         edgeRoundness = 3.0;
//     } else if (u_edgeType == 2.0) {
//         edgeRoundness = 4.0;
//     } else {
//         edgeRoundness = 5.0;
//     }
//     d = d * edgeRoundness;
//     show = vec4(d, d, d, 1.0);


//     //color
//     if (u_colorType == float(0)) {
//         show = vec4(d, d, d, 1.);
//     } else if (u_colorType == float(1)) {
//         show = vec4(d , d/ 255., d, 1.);
//     } else if (u_colorType == float(2)) {
//         show = vec4(d , d, d/ 255., 1.);
//     } 
//      else if (u_colorType == float(3)) {
//         show = vec4(d , d, d/ 255., 1.);
//     } 
//     else {
//        show = vec4(d, d, d, 1.);
//     }

   


    // // Solid AA stroke
    

    //solid
    //  float gray = smoothstep(circleR - 0.5 * aa, circleR + 0.5 * aa, d);
    
    // Solid + wavy pattern
    // float gray = sign(max(0.0, d)) * 0.5 * (cos(TAU * d / 50.0) + 1.0);

    // Assign fragment color to built-in `gl_FragColor` variable

//     vec2 fragCoord = (2.0 * (u_position.xy / u_resolution.xy)) - 1.0;
//     float fragWidth = u_resolution.x;
//     float fragHeight = u_resolution.y;


//    vec4 color = vec4(u_shapeRed, u_shapeGreen, u_shapeGreen, 1.0);
//     gl_FragColor = color;
// }


