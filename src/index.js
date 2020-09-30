"use_strict";
import { createProgramFromSources, resizeCanvas } from 'webgl-helper';
import './styles.css';

let vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;

uniform vec2 u_translation;

void main() {
    vec2 position = a_position + u_translation;

    vec2 zeroToOne = position / u_resolution;

    vec2 zertoToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zertoToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

let fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`
function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#c');

    const gl = canvas.getContext('webgl2');
    if (!gl) {
        // no webgl for you!
        console.error("You don't have webGL!");
    }

    const program = createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource);

    // Create a buffer
    const positionBuffer = gl.createBuffer();

    // set the buff we want to work with
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const translationLocation = gl.getUniformLocation(program, "u_translation");

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);

    // how to pull the data out of the buffer
    let size = 2;             // 2 components per iteration
    let type = gl.FLOAT;      // the data is 32 bit floats
    let normalize = false;    // don't normalize the data
    let stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;           // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type,
        normalize, stride, offset
    );

    // first let's make some vars to hold the translation,
    // width and height of the rectangle
    const translation = [0, 0];
    const color = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    // setup a UI
    webglLessonsUI.setupSlider("#x", { slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { slide: updatePosition(1), max: gl.canvas.height });

    function updatePosition(index) {
        return (event, ui) => {
            translation[index] = ui.value;
            drawScene();
        };
    }

    function drawScene() {
        resizeCanvas(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // tell it to use our program
        gl.useProgram(program);

        gl.bindVertexArray(vao);

        // pass in the canvas resolution so we can convert from pixels
        // to clip space in the shader
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // Set a random color.
        gl.uniform4fv(colorLocation, color);

        gl.uniform2fv(translationLocation, translation);

        // Draw the rectangle.
        const primitiveType = gl.TRIANGLES;
        offset = 0;
        const count = 18;
        gl.drawArrays(primitiveType, offset, count);
    }
}

// Fill the buffer with the values that define a rectangle.
function setGeometry(gl) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // left column
        0, 0,
        30, 0,
        0, 150,
        0, 150,
        30, 0,
        30, 150,

        // top rung
        30, 0,
        100, 0,
        30, 30,
        30, 30,
        100, 0,
        100, 30,

        // middle rung
        30, 60,
        67, 60,
        30, 90,
        30, 90,
        67, 60,
        67, 90
    ]), gl.STATIC_DRAW);
}

main();