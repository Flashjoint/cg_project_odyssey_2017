/**
 * empty basic fragment shader
 */

//need to specify how "precise" float should be
precision mediump float;
uniform vec4 u_color;
varying vec4 v_color;

//entry point again
void main() {
  gl_FragColor = u_color;
}
