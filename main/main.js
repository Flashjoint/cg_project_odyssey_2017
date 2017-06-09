//the OpenGL context
var gl = null,
    program = null;

// attributes
var positionAttLocation;

//uniforms
var colorUniformLocation,
  resolutionUniformLocation,
  matrixUniformLocation;

//buffer
var positionBuffer;

//basic transformations
var translation = [100, 150, 0];

var rotation = [-90, 0, 0];
var scale = [0.8, 0.8, 1];

loadResources({
    basic_vs: 'shader/basic.vs.glsl',
    basic_fs: 'shader/basic.fs.glsl',
    jupiter_c: 'models/jupiter-c.obj'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(800 /*width*/, 600 /*height*/);

  //compile and link shader program
  program = createProgram(gl, resources.basic_vs, resources.basic_fs);

  positionAttLocation = gl.getAttribLocation(program, 'a_position');
  colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');

  positionBuffer = gl.createBuffer();

  initInteraction(gl.canvas);
}


function randomInt(value){
  if(typeof value === 'number' && value > 0){
      return Math.random()*value;
  }
  return 0;
}

/**
 * render one frame
 */
function render() {

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

  gl.enableVertexAttribArray(positionAttLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;


  var matrix = mat3.create();
  var projectionMatrix = [
    2 / gl.canvas.clientWidth, 0 , 0,
    0, -2 / gl.canvas.clientHeight, 0,
    -1 , 1, 1,
  ]
  mat3.multiply(matrix, matrix, projectionMatrix);
  mat3.translate(matrix, matrix, [400, 300]);
  mat3.rotate(matrix, matrix, glMatrix.toRadian(-90));
  mat3.translate(matrix, matrix, [-50, -75]);
  gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
  setGeometry(gl, F_FIGURE_2D);

  count = 18;
  gl.drawArrays(primitiveType, offset, count);


  matrix = mat3.create();
  mat3.multiply(matrix, matrix, projectionMatrix);
  mat3.translate(matrix, matrix, [translation[0], translation[1]]);
  console.log('Matrix after translation: ' + matrix);
  mat3.rotate(matrix, matrix, glMatrix.toRadian(rotation[0]));
  console.log('Matrix after rotation: ' + matrix);
  mat3.scale(matrix, matrix, [scale[0], scale[1]]);
  mat3.translate(matrix, matrix, [-50, -75]);
  console.log('Matrix after scaling: ' + matrix);
  gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
  for(var i = 0; i < 5; i++){
    mat3.translate(matrix, matrix, [translation[0], translation[1]]);
    mat3.rotate(matrix, matrix, glMatrix.toRadian(rotation[0]));
    mat3.scale(matrix, matrix, [scale[0], scale[1]]);
    gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    setGeometry(gl, F_FIGURE_2D);

    count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }
}


function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    //TASK 0-1 add delta mouse to camera.rotation if the left mouse button is pressed
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x;
  		camera.rotation.y += delta.y;
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
  //register globally
  document.addEventListener('keypress', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    if (event.code === 'KeyR') {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
    }
  });
}
