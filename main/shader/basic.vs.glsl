/**
 * empty basic vertex shader
 */

attribute vec4 a_position;
uniform vec2 u_resoltuion;

//like a C program main is the main function
void main() {
  gl_Position = a_position;
}
