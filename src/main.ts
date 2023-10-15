/* eslint-disable @typescript-eslint/no-magic-numbers */
import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";

document.title = gameName;

interface Point {
  x: number;
  y: number;
}

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const cursor = { active: false, x: 0, y: 0 };
//const paths = [];

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
app.append(canvas);

const lines: Point[][] = [];
const drawingChanged = new Event("drawing-changed");
let currentLine: Point[] | null = null;

// https://shoddy-paint.glitch.me/paint0.html
canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });

  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    currentLine!.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(drawingChanged);
  }
});

window.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  canvas.dispatchEvent(drawingChanged);
});

app.append(document.createElement("br"));
const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);

clear.addEventListener("click", () => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  context.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      context.beginPath();
      const { x, y } = line[0];
      context.moveTo(x, y);
      for (const { x, y } of line) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
});
