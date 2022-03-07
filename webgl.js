// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const eases = require("eases");
const BezierEasing = require("bezier-easing");
// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");

const settings = {
  dimensions: [512, 512],
  fps: 24,
  duration: 4,
  playbackRate: "throttle",
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });

  // WebGL background color
  const hslcolor = `hsl(0, 0%, 95%)`;
  const bgColor = "#1f1f29";
  renderer.setClearColor(hslcolor, 1);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();
  // camera.position.set(4, 2, 2);
  // camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Palette
  const palette = random.pick(palettes);

  // Setup a geometry
  // const geometry = new THREE.SphereGeometry(1, 32, 16);
  const geo = new THREE.SphereGeometry(1, 34, 34);
  const scene = new THREE.Scene();
  const ambience = new THREE.AmbientLight("#6d5094");
  const light = new THREE.DirectionalLight("#dac4ff", 2);
  light.position.set(4, 2, -2).multiplyScalar(5);
  const ease = BezierEasing(0.74, -0.01, 0.21, 0.99);

  const meshes = [];

  const vertexShader = glslify(/* glsl */ `
    varying vec2 vUv;
    uniform float playhead;

    #pragma glslify: noise = require("glsl-noise/simplex/4d");

    void main() {
      vUv = uv;

      vec3 pos = position.xyz;

      pos += 0.05 * normal * noise(vec4(position.xyz * 10.0, playhead));
      pos += 0.25 * normal * noise(vec4(position.xyz * 4.0, playhead));
      pos += 0.55 * normal * noise(vec4(position.xyz * 400.0, playhead));


      // this line just needs to be memorized
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  const fragmentShader = glslify(/* glsl */ `
    varying vec2 vUv;
    uniform vec3 color;
    uniform float playhead;

    #pragma glslify: noise = require("glsl-noise/simplex/3d");

    void main () {
      float offset = 0.3 * noise(vec3(vUv.xy * 2000.0, playhead));
      gl_FragColor = vec4(vec3(color * vUv.y + offset), 1.0);
    }
  `);

  for (let i = 0; i < 1; i++) {
    // Setup a material
    // const material = new THREE.MeshBasicMaterial({
    //   color: bgColor,
    //   wireframe: true,
    // });
    const shaderMat = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        color: { value: new THREE.Color(random.pick(palette)) },
        playhead: { value: 0.1 },
      },
    });
    // const material = new THREE.MeshStandardMaterial({
    //   color: random.pick(palette),
    //   metalness: 0.3,
    //   roughness: 0.75,
    //   flatShading: true,
    // });

    // Setup a mesh with geometry + material + lighting
    // const mesh = new THREE.Mesh(geometry, material);
    const mesh = new THREE.Mesh(geo, shaderMat);
    // mesh.position.set(
    //   random.range(-1, 1),
    //   random.range(-1, 1),
    //   random.range(-1, 1)
    // );
    // mesh.scale.set(
    //   random.range(-0.6, 0.6),
    //   random.range(-1, 1),
    //   random.range(-0.9, 0, 9)
    // );
    meshes.push(mesh);
    scene.add(mesh);
  }

  // Setup your scene
  scene.add(ambience);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 2.8;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead }) {
      meshes.forEach((mesh) => {
        mesh.material.uniforms.playhead.value = playhead;
      });

      // boxMesh.rotation.y = time * 0.1;
      scene.rotation.y = ease(playhead) * Math.PI * 2;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);
