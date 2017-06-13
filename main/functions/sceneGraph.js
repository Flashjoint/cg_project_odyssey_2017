var rotateLight,
    rotateLight2,
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
    //TASK 3-6 create white light node at [0, -2, 2]
    let light = new LightNode();
    light.ambient = [0, 0, 0, 1];
    light.diffuse = [1, 1, 1, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [0, 2, 2];
    light.append(createLightSphere());
    //TASK 4-1 animated light using rotateLight transformation node
    rotateLight = new TransformationSGNode(mat4.create(), [
        light
    ]);
    root.append(rotateLight);
  }


  {
    //TASK 5-1 create red light node at [2, 0.2, 0]
    let light2 = new LightNode();
    light2.uniform = 'u_light2';
    light2.diffuse = [1, 0, 0, 1];
    light2.specular = [1, 0, 0, 1];
    light2.position = [2, -0.5, 0];
    light2.append(createLightSphere());
    rotateLight2 = new TransformationSGNode(mat4.create(), [
        light2
    ]);
    root.append(rotateLight2);
  }

  // {
  //   //TASK 2-4 wrap with material node
  //   let c3po = new MaterialNode([
  //     new RenderSGNode(resources.model)
  //   ]);
  //   //gold
  //   c3po.ambient = [0.24725, 0.1995, 0.0745, 1];
  //   c3po.diffuse = [0.75164, 0.60648, 0.22648, 1];
  //   c3po.specular = [0.628281, 0.555802, 0.366065, 1];
  //   c3po.shininess = 0.4;
  //
  //   rotateNode = new TransformationSGNode(mat4.create(), [
  //     new TransformationSGNode(glm.translate(0,-1.5, 0),  [
  //       c3po
  //     ])
  //   ]);
  //   root.append(rotateNode);
  // }

  {
    //TASK 2-5 wrap with material node
    let floor = new MaterialNode([
      new RenderSGNode(makeRect(2, 2))
    ]);

    //dark
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.1, 0.1, 0.1, 1];
    floor.specular = [0.5, 0.5, 0.5, 1];
    floor.shininess = 0.7;

    root.append(new TransformationSGNode(glm.transform({ translate: [0, -1.5,0], rotateX: -90, scale: 3}), [
      floor
    ]));
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

    //TASK 3-5 set uniforms
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
