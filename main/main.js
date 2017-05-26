//the OpenGL context
var gl = null,
    program = null,
    posAttLocation = null;

//Buffer
var positionBuffer = null;

//attributes
var posAttLocation = null;

//uniforms
var colorUniformLocation = null,
    resolutionUniformLocation = null;

var testRectanglePos = [
    -0.8, -0.8,
    0.8, -0.8,
    0.8, 0.8,
    -0.8, -0.8,
    -0.8, 0.8,
    0.8, 0.8,
];

var testRectangleTranslation = {
  tranlsation: [0, 0],
  width: 100,
  height: 30,
  color: [Math.random(), Math.random(), Math.random(), 1]
};

var testTrianglePos = [
  0, 0,
  0, 0.5,
  0.7, 0,
];

loadResources({
    basic_vs: 'shader/basic2d.vs.glsl',
    basic_fs: 'shader/basic.fs.glsl',
    jupiter_c: 'models/jupiter-c.obj'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});


//  ===================================================================
//  * Dedending on how many attributes/uniforms/varyings and what not *
//  * We should consider using a seperate file for our const names    *
//  ===================================================================
/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(800 /*width*/, 600 /*height*/);

  //compile and link shader program
  program = createProgram(gl, resources.basic_vs, resources.basic_fs);

  //Getting attributes
  posAttLocation = gl.getAttribLocation(program, 'a_position');

  //Geetings Uniforms
  colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

  positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(testRectanglePos), gl.STATIC_DRAW);


  initInteraction(gl.canvas);
}

/**
 * render one frame
 */
function render() {
  checkForWindowResize(gl);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.9, 0.5, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);


  gl.uniform4f(colorUniformLocation, 0.5, 0.2, 1, 1);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  // setRectangle(gl, Math.random(),Math.random(),Math.random());

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
  //   0,0,
  //   1,0,
  //   1,1,
  //   0,0,
  //   0,1,
  //   1,1), gl.STATIC_DRAW);

  //  ====== In case we need this Attribute again ======
  gl.enableVertexAttribArray(posAttLocation);
  gl.vertexAttribPointer(posAttLocation, 2, gl.FLOAT, false, 0, 0);
  //  ===================================================

  setRectangle(gl,
    testRectangleTranslation.tranlsation[0],
    testRectangleTranslation.tranlsation[1],
    testRectangleTranslation.width,
    testRectangleTranslation.height);

  gl.uniform4f(colorUniformLocation,
    testRectangleTranslation.color[0],
    testRectangleTranslation.color[1],
    testRectangleTranslation.color[2],
    testRectangleTranslation.color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

// randomized rectangles
 for(var i = 0; i < 10; i++){
   setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
   gl.uniform4f(colorUniformLocation,
     Math.random(),
     Math.random(),
     Math.random(),
     1);

     gl.drawArrays(gl.TRIANGLES, 0, 6);
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
