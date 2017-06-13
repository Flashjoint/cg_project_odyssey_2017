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
var translation = [-0.01, 0, 0];
var rotation = [-45, 45, 45];
var scale = [0.8, 0.8, 1];


//global matrices and matrix properties
var matrix;
var zNear = 0.01, zFar = 600;
var fudgeFactor = 1;
var zoom = 0.0;
var camera = {
  rotation: {
    x: 0,
    y: 0
  }
};

var rotationTimer = 0;

var cubeColorMatrix = [
  [0, 0.392157, 0, 1], //green, front
  [1, 1, 1, 1], // black, right
  [0, 0, 0, 1], //white, left
  [0.545098, 0, 0, 1], //red, top
  [1, 0.843137, 0, 1], //yellow, bottom
  [0, 0, 1, 1] //blue, back
];

var customSphere;

//root of the scenegraph
var sceneGraph_root;

loadResources({
    basic_vs: 'shader/basic.vs.glsl',
    basic_fs: 'shader/basic.fs.glsl',
    phong_vs: 'shader/basic.vs.glsl',
    phong_fs: 'shader/basic.fs.glsl',
    single_vs: 'shader/single.vs.glsl',
    single_fs: 'shader/single.fs.glsl',
    jupiter_c: 'models/jupiter-c.obj'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  requestAnimationFrame(render);
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(800 /*width*/, 600 /*height*/);

  //compile and link shader program
  // program = createProgram(gl, resources.single_vs, resources.single_fs);

  // gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);


  sceneGraph_root = createSceneGraph(gl, resources);

  initInteraction(gl.canvas);
}


/**
 * render one frame
 */
function render(timeInMilliseconds) {
  checkForWindowResize(gl);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // gl.useProgram(program);

  const sceneGraph_context = createSGContext(gl);

  //Creating and setting projectionMatrix (thats the Fulcrum-look-alike cone defining at what point objects are being cut off)
  sceneGraph_context.projectionMatrix = mat4.perspective(mat4.create(), glMatrix.toRadian(45), gl.drawingBufferWidth / gl.drawingBufferHeight, zNear, zFar);

  //creating and setting viewMatrix (basically thats the direction we want to look)
  sceneGraph_context.viewMatrix = mat4.lookAt(mat4.create(), [0,1,-10], [0,0,0], [0,1,0]);


  var cameraMatrix = mat4.create();
  mat4.multiply(cameraMatrix, glm.rotateY(camera.rotation.x), glm.rotateX(camera.rotation.y));
  mat4.translate(cameraMatrix, cameraMatrix, [0,0,zoom/100]);
  sceneGraph_context.sceneMatrix = cameraMatrix;


  sceneGraph_root.render(sceneGraph_context);
  // gl.drawArrays(primitiveType, 0, customSphere.position.length / 3);

  requestAnimationFrame(render);
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
  canvas.addEventListener('wheel', function(event){
    // console.log('Somethings happening', event);
    zoom += event.deltaY;
    // console.log('Current zoom-level: ' + zoom);
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
