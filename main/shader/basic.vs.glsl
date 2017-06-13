/**
 * empty basic vertex shader
 */

// attribute vec4 a_position;
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_modelView;
uniform mat4 u_normalMatrix;
uniform mat4 u_projection;

uniform float u_fudgeFactor;
varying vec4 v_color;

//like a C program main is the main function
void main() {
    vec4 position = u_modelView * a_position;


    gl_Position = position;
    // v_color = a_color;
}
