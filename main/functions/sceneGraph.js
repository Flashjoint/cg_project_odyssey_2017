var rotateLight,
    rotateLight2,
    rotateBarrenPlanetLight,
    rotateNode;

function createSceneGraph(gl, resources) {
  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.phong_vs, resources.phong_fs));

  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.single_vs, resources.single_fs), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

  {
    let floor = new MaterialNode([
      new RenderSGNode(makeRect(2, 2))
    ]);

    //dark
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.1, 0.1, 0.1, 1];
    floor.specular = [0.5, 0.5, 0.5, 1];
    floor.shininess = 0.7;

    root.append(new TransformationSGNode(glm.transform({ translate: [0, -1.5,0], rotateX: -90, scale: 10}), [
      floor
    ]));
  }


  {
    let barrenPlanet = new MaterialNode([
      new RenderSGNode(makeSphere(1, 10, 10))
    ]);

      //chocolate color
      barrenPlanet.ambient = [0.823529, 0.411765, 0.117647, 1];
      barrenPlanet.diffuse = [0.1, 0.1, 0.1, 1];
      barrenPlanet.specular = [0.5, 0.9, 0.5, 1];
      barrenPlanet.shininess = 0.6;

      let barrenPlanetLightNode = new LightNode();
      barrenPlanetLightNode.ambient = [1, 0.843137, 0, 1];
      barrenPlanetLightNode.diffuse = [1, 1, 1, 1];
      barrenPlanetLightNode.specular = [1, 1, 1, 1];
      barrenPlanetLightNode.position = [0, 2, 2];
      barrenPlanetLightNode.append(createLightSphere());
      rotateBarrenPlanetLight = new TransformationSGNode(mat4.create(), barrenPlanetLightNode);

      barrenPlanet.append(rotateBarrenPlanetLight);

      root.append(new TransformationSGNode(glm.transform({translate: [-4, 3, 0,], rotateY: 90, scale: 4}),
        [barrenPlanet]
      ));
  }

  return root;
}


/**
 * a material node contains the material properties for the underlying models
 */
class MaterialNode extends SGNode {

  constructor(children) {
    super(children);
    this.ambient = [0.2, 0.2, 0.2, 1.0];
    this.diffuse = [0.8, 0.8, 0.8, 1.0];
    this.specular = [0, 0, 0, 1];
    this.emission = [0, 0, 0, 1];
    this.shininess = 0.0;
    this.uniform = 'u_material';
  }

  setMaterialUniforms(context) {
    const gl = context.gl,
      shader = context.shader;

    //hint setting a structure element using the dot notation, e.g. u_material.test
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.ambient'), this.ambient);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.diffuse'), this.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.specular'), this.specular);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.emission'), this.emission);
    gl.uniform1f(gl.getUniformLocation(shader, this.uniform+'.shininess'), this.shininess);
  }

  render(context) {
    this.setMaterialUniforms(context);

    //render children
    super.render(context);
  }
}

/**
 * a light node represents a light including light position and light properties (ambient, diffuse, specular)
 * the light position will be transformed according to the current model view matrix
 */
class LightNode extends TransformationSGNode {

  constructor(position, children) {
    super(children);
    this.position = position || [0, 0, 0];
    this.ambient = [0, 0, 0, 1];
    this.diffuse = [1, 1, 1, 1];
    this.specular = [1, 1, 1, 1];
    //uniform name
    this.uniform = 'u_light';
  }

  /**
   * computes the absolute light position in world coordinates
   */
  computeLightPosition(context) {
    //transform with the current model view matrix
    const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    const pos = [this.position[0], this.position[1],this.position[2], 1];
    return vec4.transformMat4(vec4.create(), pos, modelViewMatrix);
  }

  setLightUniforms(context) {
    const gl = context.gl,
      shader = context.shader,
      position = this.computeLightPosition(context);

    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.ambient'), this.ambient);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.diffuse'), this.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shader, this.uniform+'.specular'), this.specular);

    gl.uniform3f(gl.getUniformLocation(shader, this.uniform+'Pos'), position[0], position[1], position[2]);
  }

  render(context) {
    this.setLightUniforms(context);

    //since this a transformation node update the matrix according to my position
    this.matrix = glm.translate(this.position[0], this.position[1], this.position[2]);

    //render children
    super.render(context);
  }
}
