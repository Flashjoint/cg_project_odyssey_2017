/**
 * empty basic vertex shader
 */

// attribute vec4 a_position;
attribute vec2 a_position;

uniform vec2 u_resolution;

uniform mat3 u_matrix;

//like a C program main is the main function
void main() {

    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
