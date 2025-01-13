import { createShader, makeBuffer, makeBufferAndSetAttributeNum, updateBuffer } from "../utils/glUtils";
import { Triangle, Circle, Sphere } from "../Geometry/GeometryJS";
import { Camera } from "../utils/Camera";
import {glMatrix, mat4, vec3} from "gl-matrix";

export class Renderer {
  /**
   * Class for Rendering the Contents of a SolarSystemSimulator.
   * @param {function} getGL - Function that returns the gl-Object
   * @param {SolarSystemSimulator} simulator - The SolarSystemSimulator to render
   */
  constructor(getGL, simulator) {
    this.vs = `#version 300 es
      in vec3 a;
      
      uniform mat4 u_projmat;
      uniform mat4 u_viewmat;
      uniform mat4 u_worldmat;
      
      void main() {
        //World-, View- and Projection-Matrix
        vec4 pos = u_projmat * u_viewmat * u_worldmat * vec4(a, 1.0);
        gl_Position = pos / pos.w;
      }
      `;

    this.fs = `#version 300 es
      precision highp float;
      
      out vec4 outColor;
      uniform vec4 u_color;
      
      void main() {
        //Color the Fragments in the same color as inputted by the uniform
        outColor = u_color;
      }
      `;

    this.getGL = getGL;
    this.simulator = simulator;
    this.doSimulationStep = false;
    this.timestep = 1;

    this.time_rl = performance.now();

    this.getDatetime = () => Date.now();
    this.setDatetime = (newDatetime) => {};

    this.sub_steps = 1;   //Number sub steps in one simulation step

    this.isInitted = false;
  }

  /**
   * Inits this Renderer.
   * Important: This Function calls the getGL-Function passed to the Constructor. The GL-Canvas needs to be generated beforehand.
   */
  initObject() {
    this.gl = this.getGL();

    this.cam = new Camera(
        this.gl.canvas,
        [0, 1, 1],
        [0, 0, 0],
        [0, 0, 1]
    );

    this.cam.update(0.0);

    this.setupProgram();
    this.setupInputBuffers(3);
    this.assembleProgram();
    this.setupUniforms();

    this.clearCanvas();
  }

  /**
   * Sets up and Attaches Shaders. Creates the Program.
   */
  setupProgram() {
    this.vShader = createShader(this.gl, this.gl.VERTEX_SHADER, this.vs);
    this.fShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, this.fs);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, this.vShader);
    this.gl.attachShader(this.program, this.fShader);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramParameter(this.program));
    }
  }

  /**
   * Sets up the Input-Buffers (e.g. Vertex Buffer).
   * @param {number} vertexDimensionality - Number of Dimensions per Vertex. (Generally 3)
   */
  setupInputBuffers(vertexDimensionality) {
    this.vertexDimensionality = vertexDimensionality;

    this.aLoc = this.gl.getAttribLocation(this.program, 'a');

    // Create a vertex array object (attribute state)
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    //Fill the Buffer with the Vertices of a Sphere as a Text-Image
    let sphere = new Sphere(1, 8, 16);
    this.a = sphere.getArrayBufferContent();
    this.aBuffer = makeBufferAndSetAttributeNum(this.gl, this.a, this.aLoc, this.vertexDimensionality);
  }

  /**
   * Sets up the Uniforms (e.g. Projection Matrix).
   */
  setupUniforms() {
    //Get Locations of the Variables in the Shader-Program
    this.projMatLocation = this.gl.getUniformLocation(this.program, "u_projmat");
    this.viewMatLocation = this.gl.getUniformLocation(this.program, "u_viewmat");
    this.worldMatLocation = this.gl.getUniformLocation(this.program, "u_worldmat");

    this.colorLocation = this.gl.getUniformLocation(this.program, "u_color");

    //Set Uniform Values (e.g. Matrices)
    this.projMat = mat4.create();
    mat4.perspective(
        this.projMat,
        glMatrix.toRadian(80),
        this.gl.canvas.width / this.gl.canvas.height,
        0.1,
        100.0
    );

    this.viewMat = this.cam.getViewMat();

    this.worldMat = mat4.create();
    mat4.fromTranslation(this.worldMat, vec3.fromValues(0.0, 0.0, 0.0));

    this.activeColor = [1.0, 0.0, 0.0, 1.0];

    //Upload the Uniform-Values to the Shader-Program
    this.updateUniforms();
  }

  /**
   * Uploads the Uniform-Values in the Member-Variables to the Shader-Program.
   */
  updateUniforms() {
    this.gl.uniformMatrix4fv(this.projMatLocation, this.gl.FALSE, this.projMat);
    this.gl.uniformMatrix4fv(this.viewMatLocation, this.gl.FALSE, this.viewMat);
    this.gl.uniformMatrix4fv(this.worldMatLocation, this.gl.FALSE, this.worldMat);
    this.gl.uniform4fv(this.colorLocation, this.activeColor);
  }

  /**
   * Uploads Values from the Member-Variable of the Vertex-Buffer to the Shader Program.
   */
  updateInputBuffers() {
    updateBuffer(this.gl, this.aBuffer, this.a);
  }

  /**
   * Assembles the Shader-Program and Enables Front-Face-Culling and Depth-Test.
   */
  assembleProgram() {
    this.gl.useProgram(this.program);

    //Bind our input attribute state for the buffer
    this.gl.bindVertexArray(this.vao);

    //Setup Culling and Depth Testing
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.FRONT);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  /**
   * Clears the Canvas and Depth-Buffer with black/zero.
   */
  clearCanvas() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Starts Rendering the Contents in the Vertex-Buffer.
   */
  startRender() {
    //If the Renderer is not initted, call initObject()
    if (!this.isInitted) {
      this.initObject();
      this.isInitted = true;
    }

    //Start Render-Loop
    this.doSimulationStep = true;
    this.time_rl = performance.now();
    requestAnimationFrame(this.render.bind(this));
  }

  /**
   * Stops the Rendering of the Contents in the Vertex-Buffer.
   */
  stopRender() {
    this.doSimulationStep = false;
  }

  /**
   * Set Data to Render from an Array of GravitationalObjects
   * @param {GravitationalObject[]} objects
   */
  setRenderData(objects) {
    //Arrays containing the specified Information for all GravitationalObjects
    this.vertexBufferContents = [];
    this.positions = [];
    this.lastPositions = [];
    this.colors = [];

    //Push specified Information to respective Array
    for (let item of objects) {
      this.vertexBufferContents.push(item.bufferContent);
      this.positions.push(item.position);
      this.lastPositions.push(item.lastPositions);
      this.colors.push(item.color);
    }
  }

  /**
   * Draws the whole Scene once.
   */
  draw() {
    //Get Data from Simulator and clear Canvas
    this.setRenderData(this.simulator.objects);
    this.clearCanvas();

    //For each Object from the Simulator
    for (let i = 0; i < this.vertexBufferContents.length; i++) {
      /**
       * Draw-Procedure of Sphere of one GravitationalObject
       */
      //Set Vertex-Buffer to Vertices of a single GravitationalObject and upload to GPU
      this.a = this.vertexBufferContents[i];
      this.updateInputBuffers();

      //Set Position of the GravitationalObject to the respected Uniform, Set Color and upload to GPU
      mat4.fromTranslation(this.worldMat, vec3.fromValues(this.positions[i][0], this.positions[i][1], this.positions[i][2]));
      this.activeColor = this.colors[i];
      this.updateUniforms();

      //Draw the Object
      this.gl.drawArrays(this.gl.TRIANGLES, 0, Math.floor(this.vertexBufferContents[i].length / 3));

      /**
       * Draw-Procedure of Trajectory of one GravitationalObject
       */
      //Set Translation to zero because the Translation is already in the Vertex-Buffer, Set Color and upload to GPU
      mat4.fromTranslation(this.worldMat, vec3.fromValues(0.0, 0.0, 0.0));
      this.activeColor = this.colors[i];
      this.updateUniforms();

      //Set Vertex-Buffer to Trajectory and upload to GPU
      this.a = new Float32Array(this.lastPositions[i]);
      this.updateInputBuffers();

      //Draw the Trajectory
      this.gl.drawArrays(this.gl.LINE_STRIP, 0, Math.floor(this.lastPositions[i].length / 3))
    }
  }

  /**
   * Performs Simulation-Step and draws the whole scene once.
   */
  render() {
    //Calculate dt_rl (delta time real life)
    const dt_rl = performance.now() - this.time_rl;
    this.time_rl = performance.now();

    //Perform Simulator Step
    if (this.doSimulationStep) {
      const dt = 0.001 * this.timestep * dt_rl;   //Time in seconds that passes between two render-calls
      let datetime_copy = new Date(this.getDatetime());
      datetime_copy.setMilliseconds(datetime_copy.getMilliseconds() + 1000 * dt);
      this.setDatetime(datetime_copy);
      this.simulator.simulateMultiple(dt, this.sub_steps);
    }

    //Update Camera Position, View-Matrix and Viewport to fit a potentially resized screen
    this.cam.update(dt_rl);
    this.viewMat = this.cam.getViewMat();
    this.updateUniforms();
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    //Draw and rerun Render-Loop
    this.draw();
    requestAnimationFrame(this.render.bind(this));
  }
}
