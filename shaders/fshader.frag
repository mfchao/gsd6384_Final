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
uniform vec3 u_circle;
uniform vec2 u_box;
uniform vec2 u_boxDim;
uniform vec2 u_triangle;
uniform float u_border;
uniform vec3 u_cross;



// uniform float u_shapeType;
uniform float u_edgeType;
uniform float u_colorType;





const float aa = 3.0;
float edgeRoundness = 3.0;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdEquilateralTriangle( in vec2 p )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - 1.0;
    p.y = p.y + 1.0/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0, 0.0 );
    return -length(p)*sign(p.y);
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

// float opRound( in vec2 p, in float r )
// {
//   return p - r;
// }



void main() {
    // float d = sdCircle(u_circle.xy - gl_FragCoord.xy, u_circle.z);

      float d = 0.0;
      vec4 show;
      
    
    //determine shape
    if (u_circle != vec3(0,0,0)) {
        // Draw a circle
        d = sdCircle(u_circle.xy - gl_FragCoord.xy, u_circle.z);
    } else if (u_box != vec2(0,0) && u_boxDim != vec2(0,0)) {
        // Draw a square
        d = sdBox(u_box.xy - gl_FragCoord.xy, u_boxDim);
    } else if (u_triangle != vec2(0,0)) {
        // Draw a triangle
        d = sdEquilateralTriangle((2.0 * gl_FragCoord.xy - u_triangle.xy - 250.0)/u_triangle.y);
        d = abs(d);
    } 
    else {
        // Draw an irregular shape
        d = sdBlobbyCross(u_cross.xy - gl_FragCoord.xy, u_cross.z);
    }
    show = vec4(d, d, d, 1.0);
    

    //edge roundness
   if (u_edgeType <= 0.0) {
    edgeRoundness = 2.0;
    } else if (u_edgeType == 1.0) {
        edgeRoundness = 3.0;
    } else if (u_edgeType == 2.0) {
        edgeRoundness = 4.0;
    } else {
        edgeRoundness = 5.0;
    }
    d = d * edgeRoundness;
    show = vec4(d, d, d, 1.0);


    //color
    if (u_colorType == float(0)) {
        show = vec4(d, d, d, 1.);
    } else if (u_colorType == float(1)) {
        show = vec4(d , d/ 255., d, 1.);
    } else if (u_colorType == float(2)) {
        show = vec4(d , d, d/ 255., 1.);
    } 
     else if (u_colorType == float(3)) {
        show = vec4(d , d, d/ 255., 1.);
    } 
    else {
       show = vec4(d, d, d, 1.);
    }

   


    // // Solid AA stroke
    

    //solid
    //  float gray = smoothstep(u_circle.z - 0.5 * aa, u_circle.z + 0.5 * aa, d);
    
    // Solid + wavy pattern
    // float gray = sign(max(0.0, d)) * 0.5 * (cos(TAU * d / 50.0) + 1.0);

    // Assign fragment color to built-in `gl_FragColor` variable
    gl_FragColor = show;
}


