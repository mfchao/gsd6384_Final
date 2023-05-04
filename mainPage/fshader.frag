#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.2831853071;

uniform vec2 resolution;
uniform float time;
uniform vec2 circleCenter;
uniform float numContours;
varying vec2 vTexCoord;
uniform vec3 altContourColor;


uniform int numPeople;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}


float circleSDF(vec2 uv, vec2 center, float radius) {
  return length(uv - center) - radius;
}

float lineSegmentSDF(vec2 uv, vec2 a, vec2 b, float thickness) {
  vec2 pa = uv - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - thickness;
}

float smoothmin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * (1.0 / 4.0);
}

float smoothminUnion(float distances[11], float k) {
    float res = distances[0];
    for (int i = 1; i < 11; ++i) {
      res = smoothmin(res, distances[i], k);
    }
    return res;
}

float smoothminUnion2(float distances2[17], float k) {
    float res = distances2[0];
    for (int i = 1; i < 17; ++i) {
      res = smoothmin(res, distances2[i], k);
    }
    return res;
}

float smoothminUnion3(float distances3[12], float k) {
    float res = distances3[0];
    for (int i = 1; i < 12; ++i) {
      res = smoothmin(res, distances3[i], k);
    }
    return res;
}

float sdStar(vec2 p, float r, int n, float m) {
  float an = 3.141593 / float(n);
  float en = 3.141593 / m;
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));

  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));

  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x);
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

float randomRange(float minVal, float maxVal, float seed) {
  float range = maxVal - minVal;
  float randomValue = fract(sin(dot(vec2(seed, seed), vec2(12.9898, 78.233))) * 43758.5453);
  return minVal + (randomValue * range);
}
  
void main() {

    vec2 uv = vTexCoord;
    uv.x *= resolution.x / resolution.y; // Adjust for aspect ratio
    
    // Create an array to hold the distances for each shape
    float distances[11];
    float distances3[12];

    float distances2[17];
    float k2 =  0.05;
    float lineThickness2 = 0.002;
  
    vec2 sline1Start = vec2(0.4, 0.9);
    vec2 sline1End = vec2(0.6, 0.9);
    float sline1Dist = lineSegmentSDF(uv, sline1Start, sline1End, lineThickness2);

    vec2 sline2Start = vec2(0.6, 0.9);
    vec2 sline2End = vec2(0.6, 0.7);
    float sline2Dist = lineSegmentSDF(uv, sline2Start, sline2End, lineThickness2);

    vec2 sline3Start = vec2(0.6, 0.9);
    vec2 sline3End = vec2(0.6, 0.7);
    float sline3Dist = lineSegmentSDF(uv, sline3Start, sline3End, lineThickness2);

    vec2 sline4Start = vec2(0.1, 0.7);
    vec2 sline4End = vec2(1.46, 0.7);
    float sline4Dist = lineSegmentSDF(uv, sline4Start, sline4End, lineThickness2);

    vec2 sline5Start = vec2(1.46, 0.7);
    vec2 sline5End = vec2(1.46, 0.65);
    float sline5Dist = lineSegmentSDF(uv, sline5Start, sline5End, lineThickness2);

    vec2 sline6Start = vec2(1.8, 0.65);
    vec2 sline6End = vec2(1.8, 0.2);
    float sline6Dist = lineSegmentSDF(uv, sline6Start, sline6End, lineThickness2);

    vec2 sline7Start = vec2(1.85, 0.2);
    vec2 sline7End = vec2(1.85, 0.17);
    float sline7Dist = lineSegmentSDF(uv, sline7Start, sline7End, lineThickness2);

    vec2 sline8Start = vec2(1.85, 0.17);
    vec2 sline8End = vec2(1., 0.17);
    float sline8Dist = lineSegmentSDF(uv, sline8Start, sline8End, lineThickness2);

    vec2 sline9Start = vec2(1., 0.17);
    vec2 sline9End = vec2(1., 0.09);
    float sline9Dist = lineSegmentSDF(uv, sline9Start, sline9End, lineThickness2);

    vec2 sline10Start = vec2(1., 0.09);
    vec2 sline10End = vec2(1.05, 0.09);
    float sline10Dist = lineSegmentSDF(uv, sline10Start, sline10End, lineThickness2);

    vec2 sline11Start = vec2(1.05, 0.17);
    vec2 sline11End = vec2(1.05, 0.06);
    float sline11Dist = lineSegmentSDF(uv, sline11Start, sline11End, lineThickness2);

    vec2 sline12Start = vec2(1.05, 0.06);
    vec2 sline12End = vec2(0.04, 0.06);
    float sline12Dist = lineSegmentSDF(uv, sline12Start, sline12End, lineThickness2);

    vec2 sline13Start = vec2(0.04, 0.06);
    vec2 sline13End = vec2(0.04, 0.2);
    float sline13Dist = lineSegmentSDF(uv, sline13Start, sline13End, lineThickness2);

    vec2 sline14Start = vec2(0.04, 0.2);
    vec2 sline14End = vec2(0.1, 0.2);
    float sline14Dist = lineSegmentSDF(uv, sline14Start, sline14End, lineThickness2);

    vec2 sline15Start = vec2(0.5, 0.1);
    vec2 sline15End = vec2(0.7, 0.1);
    float sline15Dist = lineSegmentSDF(uv, sline15Start, sline15End, lineThickness2);

    vec2 sline16Start = vec2(0.7, 0.1);
    vec2 sline16End = vec2(0.7,0.45);
    float sline16Dist = lineSegmentSDF(uv, sline16Start, sline16End, lineThickness2);

    vec2 sline17Start = vec2(0.7, 0.45);
    vec2 sline17End = vec2(0.1,0.45);
    float sline17Dist = lineSegmentSDF(uv, sline17Start, sline17End, lineThickness2);
        
    distances2[0] = sline1Dist;
    distances2[1] = sline2Dist;
    distances2[2] = sline3Dist;
    distances2[3] = sline4Dist;
    distances2[4] = sline5Dist;
    distances2[5] = sline6Dist;
    distances2[6] = sline7Dist;
    distances2[7] = sline8Dist;
    distances2[8] = sline9Dist;
    distances2[9] = sline10Dist;
    distances2[10] = sline11Dist;
    distances2[11] = sline12Dist;
    distances2[12] = sline13Dist;
    distances2[13] = sline14Dist;
    distances2[14] = sline15Dist;
    distances2[15] = sline16Dist;
    distances2[16] = sline17Dist;

    
    // Set circle radius and line thickness
    float radius = 0.05;
    float lineThickness = 0.007;
  
    // Calculate distance to the circle
  
    // Calculate distance to the star
    float starRadius = 0.05;
    int starSides = 3;
    float starM = 2.2;
    float starDist = sdStar(uv - circleCenter, starRadius, starSides, starM);

    // Set line segment start and end points
    vec2 hLineStart = vec2(0.55, 0.6);
    vec2 hLineEnd = vec2(1.0, 0.6);
    float hLineDist = lineSegmentSDF(uv, hLineStart, hLineEnd, lineThickness);
  
    // Add three more line segments and calculate their distances (defined)
    vec2 line1Start = vec2(0.1, 0.1);
    vec2 line1End = vec2(0.1, 0.9);
    float line1Dist = lineSegmentSDF(uv, line1Start, line1End, lineThickness);
    // left wall defined
    vec2 line2Start = vec2(0.4, 0.7); 
    vec2 line2End = vec2(0.4, 0.9);
    float line2Dist = lineSegmentSDF(uv, line2Start, line2End, lineThickness);
    // left wall defined
    vec2 line11Start = vec2(0.1, 0.9); 
    vec2 line11End = vec2(0.4, 0.9);
    float line11Dist = lineSegmentSDF(uv, line11Start, line11End, lineThickness);
    // left wall defined
    vec2 line3Start = vec2(0.5, 0.1);
    vec2 line3End = vec2(0.1, 0.1);
    float line3Dist = lineSegmentSDF(uv, line3Start, line3End, lineThickness);
    // middle wall defined
    vec2 line4Start = vec2(0.85, 0.3);
    vec2 line4End = vec2(1.25, 0.3);
    float line4Dist = lineSegmentSDF(uv, line4Start, line4End, lineThickness);
    // middle wall defined
    vec2 line5Start = vec2(1.1, 0.5);
    vec2 line5End = vec2(1.5, 0.5);
    float line5Dist = lineSegmentSDF(uv, line5Start, line5End, lineThickness);
    // middle wall defined
    vec2 line6Start = vec2(1.15, 0.3);
    vec2 line6End = vec2(1.15, 0.5);
    float line6Dist = lineSegmentSDF(uv, line6Start, line6End, lineThickness);
    // right wall defined
    vec2 line7Start = vec2(1.4, 0.4);
    vec2 line7End = vec2(1.65, 0.4);
    float line7Dist = lineSegmentSDF(uv, line7Start, line7End, lineThickness);
    // right wall defined
    vec2 line8Start = vec2(1.4, 0.65);
    vec2 line8End = vec2(1.95, 0.65);
    float line8Dist = lineSegmentSDF(uv, line8Start, line8End, lineThickness);
    // right wall defined
    vec2 line9Start = vec2(1.95, 0.2);
    vec2 line9End = vec2(1.95, 0.65);
    float line9Dist = lineSegmentSDF(uv, line9Start, line9End, lineThickness);
    // right wall defined
    vec2 line10Start = vec2(1.95, 0.2);
    vec2 line10End = vec2(1.1, 0.2);
    float line10Dist = lineSegmentSDF(uv, line10Start, line10End, lineThickness);

    // Add distances to an array
    // float distances[13];
    // distances[0] = circleDist;
    distances[0] = starDist;

    distances3[0] = hLineDist;
    distances3[1] = line1Dist;
    distances3[2] = line2Dist;
    distances3[3] = line3Dist;
    distances3[4] = line4Dist;
    distances3[5] = line5Dist;
    distances3[6] = line6Dist;
    distances3[7] = line7Dist;
    distances3[8] = line8Dist;
    distances3[9] = line9Dist;
    distances3[10] = line10Dist;
    distances3[11] = line11Dist;

 
    float speed = 0.1; // movement speed scaling factor

    //Move people
    vec2 circleDist1_center = vec2(
    0.4 + 0.2 * cos(time * speed),
    0.3 + 0.2 * sin(time * speed)
    );

    vec2 starDist1_center = vec2(
    0.75 + 0.1 * -cos(time * speed),
    0.42 + 0.1 * sin(time * speed)
    );

    vec2 trapDist1_center = vec2(
    0.4 + 0.2 * -cos(time * speed),
    0.2 + 0.3 * sin(time * speed)
    );

    vec2 crossDist1_center = vec2(
    0.5 + 0.4 * cos(time * speed),
    0.4 + 0.3 * -sin(time * speed*.1)
    );

    vec2 crossDist2_center = vec2(
    0.23 + 0.1 * -cos(time * speed),
    0.6 + 0.3 * sin(time * speed)
    );

    vec2 starDist2_center = vec2(
    0.4 + 0.3 * sin(time * speed),
    0.2 + 0.1 * cos(time * speed)
    );

    vec2 starDist3_center = vec2(
    1.3 + 0.8 * sin(time * speed),
    0.26 + 0.1* cos(time * speed)
    );

    vec2 trapDist2_center = vec2(
    1.1 + 0.4 * sin(time * speed),
    0.43 + 0.1 * -cos(time * speed)
    );

    vec2 starDist4_center = vec2(
    0.85 + 0.4 * cos(time * speed),
    0.5 + 0.3 * cos(time * speed)
    );

    vec2 starDist5_center = vec2(
    0.6 + 0.4 * sin(time * speed),
    0.6 + 0.3 * -cos(time * speed)
    );
    
    float circleDist1 = 0.0;
    float starDist1 = 0.0;
    float trapDist1 = 0.0;
    float crossDist1 = 0.0;
    float circleDist2 = 0.0;
    float starDist2 = 0.0;
    float starDist3 = 0.0;
    float trapDist2 = 0.0;
    float starDist4 = 0.0;
    float starDist5 = 0.0;

    if (numPeople >= 1) {
        circleDist1 = circleSDF(uv, circleDist1_center, 0.03);
        distances[1] = circleDist1;
    } else {
        distances[1] = 1.;
    }
    if (numPeople >= 2) {
        starDist1 = sdStar(uv - starDist1_center, 0.03, 6, 2.3);
        distances[2] = starDist1;
    } else {
        distances[2] = 1.;
    }
    if (numPeople >= 3) {
        trapDist1 = sdTrapezoid(uv - trapDist1_center, 0.03, 0.015, 0.02);
        distances[3] = trapDist1;
    } else {
        distances[3] = 1.;
    }
    if (numPeople >= 4) {
        crossDist1 = sdBlobbyCross(uv - crossDist1_center, -0.02) + 0.7;
        distances[4] = crossDist1;
    } else {
        distances[4] = 1.;
    }
    if (numPeople >= 5) {
        circleDist2 = circleSDF(uv, crossDist2_center, 0.02);
        distances[5] = circleDist2;
    } else {
        distances[5] = 1.;
    }
    if (numPeople >= 6) {
        starDist2 = sdStar(uv - starDist2_center , 0.06, 12, 5.) + 0.006;
        distances[6] = starDist2;
    } else {
        distances[6] = 1.;
    }
    if (numPeople >= 7) {
        starDist3 = sdStar(uv - starDist3_center, 0.025, 4, 1.6);
        distances[7] = starDist3;
    } else {
        distances[7] = 1.;
    }  
    if (numPeople >= 8) {  
        trapDist2 = sdTrapezoid(uv - trapDist2_center, 0.01, 0.037, 0.015) - 0.008;
        distances[8] = trapDist2;
    } else {
        distances[8] = 1.;
    } 
    if (numPeople >= 9) { 
        starDist4 = sdStar(uv - starDist4_center, 0.03, 4, 3.) - 0.005;
        distances[9] = starDist4;
    } else {
        distances[9] = 1.;
    } 
    if (numPeople >= 10) { 
        starDist5 = sdStar(uv - starDist5_center, 0.035, 5, 6.2) - 0.005;
        distances[10] = starDist5;
    } else {
        distances[10] = 1.;
    } 

    
// Perform SDF union operation with smoothmin
    float k = 0.1; // Blending parameter
    vec3 backgroundColor = vec3(0.94, 0.94, 0.93);
    vec3 fillColor = vec3(0.0);
    vec3 contourColor = vec3(1.0, 0.0, 0.0);
    vec3 circleColor1 = vec3(1.0, 0.8, 0.8); 

    vec3 Color2 = vec3(0.92,0.85, 0.80); 

    vec3 Color3 = vec3(0.827, 0.92, 0.80); 

    vec3 Color4 = vec3(0.8, 0.91, 0.929); 

    vec3 Color5 = vec3(0.92, 0.89, 0.80);

    vec3 Color6 = vec3(0.8, 0.84, 0.929); 

    vec3 Color7 = vec3(0.804, 0.929, 0.914); 

    vec3 Color8 = vec3(0.9, 0.92, 0.8);

    vec3 Color9 = vec3(0.81, 0.804, 0.92); 
    vec3 Color10 = vec3(0.835, 0.8, 0.929);

    vec3 Color11 = vec3(0.875, 0.92, 0.804); 

    vec3 color = mix(backgroundColor, circleColor1, smoothstep(1.0, 0.0, starDist * 10.));


    
    if (circleDist1 > 0.) {
        color = mix(color, Color2, smoothstep(1.0, 0.0, circleDist1 * 10.));
    }
    if (starDist1 > 0.) {
        color = mix(color, Color3, smoothstep(1.0, 0.0, starDist1 * 10.));
    }
    if (trapDist1 > 0.) {
        color = mix(color, Color4, smoothstep(1.0, 0.0, trapDist1 * 10.));
    }
    if (crossDist1 > 0.) {
        color = mix(color, Color5, smoothstep(1.0, 0.0, crossDist1 * 10.));
    }
    if (circleDist2 > 0.) {
        color = mix(color, Color6, smoothstep(1.0, 0.0, circleDist2 * 10.));
    }
    if (starDist2 > 0.) {
        color = mix(color, Color7, smoothstep(1.0, 0.0, starDist2 * 10.));
    }
    if (starDist3 > 0.) {
        color = mix(color, Color8, smoothstep(1.0, 0.0, starDist3 * 10.));
    }
    if (trapDist2 > 0.) {
        color = mix(color, Color9, smoothstep(1.0, 0.0, trapDist2 * 10.));
    }
    if (starDist4 > 0.) {
        color = mix(color, Color10, smoothstep(1.0, 0.0, starDist4 * 10.));
    }
    if (starDist5 > 0.) {
        color = mix(color, Color11, smoothstep(1.0, 0.0, starDist5 * 10.));
    }
    
    float sdBigLines = smoothminUnion3(distances3, 0.01);



    float sdfUnion = smoothminUnion(distances, k);


    float sLineUnions = smoothminUnion2(distances2, 0.005);

    float finalSDF = smoothmin(sdfUnion, sdBigLines, k);
  
    // Set colors for background, fill, and contours

    

  
    // Calculate the minimum distance between the star and the line segments
    float minLineDist = min(min(min(hLineDist, line1Dist), line2Dist), line3Dist);
    for (int i = 4; i < 13; ++i) {
      minLineDist = min(minLineDist, distances[i]);
    }

    // Calculate the blending factor based on the distance between the star and the closest line segment
    float blendFactor = smoothstep(0.0, 0.15, minLineDist); // Adjust the second parameter for the transition range

    // Blend the contour colors based on the blending factor
    vec3 finalContourColor = mix(contourColor, altContourColor, blendFactor);

    // Create contours and fill the inside with the fillColor
    float lineWidth = 0.005;
    // vec3 color = backgroundColor;
    if (finalSDF < 0.0) {
      color = mix(fillColor, vec3(0.43,0.0,0.0), smoothstep(1.0, 0.0, sdfUnion * 10.));
    } else {
    float contourDist = (1.0 + cos(finalSDF * numContours * 3.14159)) * 0.5;
    if (contourDist > 1.0 - lineWidth && contourDist < 1.0) {
      color = finalContourColor;
      }
      if (sLineUnions < 0.0) {
        color = vec3(0.59, 0.59, 0.59);
      }
    }

    gl_FragColor = vec4(color, 1.0);
  
  }