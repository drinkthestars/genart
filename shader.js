const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

// Setup our sketch
const settings = {
  dimensions: [512, 512],
  context: "webgl",
  animate: true,
  duration: 5,
  fps: 24,
};

// Your glsl code
const frag = glsl(/* glsl */ `
  precision highp float;

  uniform float time;
  uniform float aspect;
  varying vec2 vUv;

  #pragma glslify: noise = require("glsl-noise/simplex/3d");
  #pragma glslify: hsl2rgb = require("glsl-hsl2rgb");

  void main () {
    // vec3 colorA = sin(time * 1.0) + vec3(0.2, 0.6, 0.9);
    // vec3 colorB = vec3(0.1, 0.6, 0.2);

    vec2 center = vUv - 0.5;
    center.x *= aspect;
    
    float dist = length(center);
    float alpha = smoothstep(0.25, 0.24495, dist);

    // float mixStep = sin(time)/vUv.x * (vUv.y/0.7);
    // float mixStep = (vUv.y/2.0) + (vUv.x/3.0) * cos(time/4.0);

    // vec3 color = mix(colorA, colorB, mixStep);
    // gl_FragColor = vec4(color, alphaStep);

    float n = noise(vec3(center * 1.0, time)); 

    vec3 color = hsl2rgb(
      0.6 + (n * 0.19),
      0.4,
      0.5
    );

    gl_FragColor = vec4(color, alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: "white",
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      aspect: ({ width, height }) => width / height,
    },
  });
};

canvasSketch(sketch, settings);
