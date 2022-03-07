const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const DarkGrey = "#353752";
const LightGrey = "#878896";

random.setSeed(random.getRandomSeed());
console.log("Random Seed = " + random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: [2048, 2048],
  pixelsPerInch: 400,
};

const sketch = () => {
  const colorRangeMin = random.rangeFloor(0, 3);
  const colorRangeMax = random.rangeFloor(3, 6);
  const palette = random
    .shuffle(random.pick(palettes))
    .slice(colorRangeMin, colorRangeMax);

  // create local state
  const createGrid = () => {
    const points = [];
    const count = 100;
    const divider = count - 1;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // working in u v space
        const u = count <= 1 ? 0.5 : x / divider;
        const v = count <= 1 ? 0.5 : y / divider;

        // add noise - affect radius/rotation, etc
        const radius = Math.abs(random.noise2D(u, v)) * 0.07 + 0.009;

        points.push({
          color: random.pick(palette),
          radius,
          rotation: random.noise2D(u, v),
          position: [u, v],
        });
      }
    }

    return points;
  };

  // random.setSeed(70089000);
  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 200;
  const rectSize = 20;

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    points.forEach((point) => {
      const { color, radius, rotation, position } = point;
      const [u, v] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      // ------------ text ------------
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.fillStyle = color;
      context.font = `${radius * width}px "Helvetica"`;
      context.fillText("-", u, v);
      context.restore();

      // ------------ circles ------------
      // context.fillStyle = color;
      // context.beginPath();
      // context.arc(x, y, width * radius, 0, Math.PI * 2, false);
      // context.fill();

      // ------------ rect ------------
      // context.fillRect(x, y, rectSize, rectSize);

      // ------------ stroke ------------
      // context.strokeStyle = "#c1ff7a";
      // context.lineWidth = 1;
      // context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
