/**
 * empty basic vertex shader
 */

// attribute vec4 a_position;
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_matrix;
uniform float u_fudgeFactor;
varying vec4 v_color;

//like a C program main is the main function
void main() {
    vec4 position = u_matrix * a_position;


    gl_Position = position;
    // v_color = a_color;
}
