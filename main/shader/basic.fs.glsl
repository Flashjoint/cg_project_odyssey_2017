/**
 * empty basic fragment shader
 */

//need to specify how "precise" float should be
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
  // gl_FragColor = vec4(0.5,0.2,0.9, 1);
}
