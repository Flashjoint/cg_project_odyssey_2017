//the OpenGL context
var gl = null,
    program = null;

// attributes
var positionAttLocation;

//uniforms
var colorUniformLocation,
  resolutionUniformLocation,
  matrixUniformLocation,
  fudgeFactorUniformLocation;

//buffer
var positionBuffer,
  colorBuffer;

//basic transformations
var translation = [100, -100, -500];

var rotation = [-45, 45, 45];
var scale = [0.8, 0.8, 1];


var matrix, camera;
var fudgeFactor = 1;

var cubeColorMatrix = [
  [0, 0.392157, 0, 1], //green, front
  [1, 1, 1, 1], // black, right
  [0, 0, 0, 1], //white, left
  [0.545098, 0, 0, 1], //red, top
  [1, 0.843137, 0, 1], //yellow, bottom
  [0, 0, 1, 1] //blue, back
]

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

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  positionAttLocation = gl.getAttribLocation(program, 'a_position');
  colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');
  fudgeFactorUniformLocation = gl.getUniformLocation(program, 'u_fudgeFactor');

  positionBuffer = gl.createBuffer();

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl, QUAD_FIGURE_3D);

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
function render(timeInMilliseconds) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

  gl.enableVertexAttribArray(positionAttLocation);


  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;


  matrix = mat4.create();
  camera = mat4.create();

  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var numFs = 5;
  var radius = 200;

  mat4.fromYRotation(camera, glMatrix.toRadian(radius));
  mat4.translate(camera, camera, [0,0, radius * 1.5]);
  var viewMatrix = mat4.create();

  mat4.invert(viewMatrix, camera);

  mat4.perspective(matrix, glMatrix.toRadian(45), aspect, 1, 2000);

  mat4.translate(matrix, matrix, [translation[0], translation[1], translation[2]]);
  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, matrix, viewMatrix);
  //
  // var depth = 400;
  // var orthographicMatrix = mat4.create();
  //
  // mat4.ortho(orthographicMatrix, 0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -400, 400);
  //
  // mat4.multiply(matrix, matrix, orthographicMatrix);

  // mat4.rotateX(matrix, matrix, glMatrix.toRadian(rotation[0]));
  // mat4.rotateY(matrix, matrix, glMatrix.toRadian(rotation[1]));
  // mat4.rotateZ(matrix, matrix, glMatrix.toRadian(rotation[2]));
  // mat4.translate(matrix, matrix, [-50, -50, -50]);
  for(var ii = 0; ii < numFs; ii++){
    var angle = ii * Math.PI * 2 / numFs;
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;

    mat4.translate(matrix, viewProjectionMatrix, [x, 0, y]);

    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
    count = 6;
    for(var i = 0; i < 6; i++){
      gl.uniform1f(fudgeFactorUniformLocation, fudgeFactor);
      gl.uniform4f(colorUniformLocation, cubeColorMatrix[i][0], cubeColorMatrix[i][1], cubeColorMatrix[i][2], cubeColorMatrix[i][3]);
      gl.drawArrays(primitiveType, offset + (i * count), count);
    }
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
