import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";

document.title = gameName;

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

// https://shoddy-paint.glitch.me/paint0.html
canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
    context.beginPath();
    context.moveTo(cursor.x, cursor.y);
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  }
});

window.addEventListener("mouseup", () => {
  cursor.active = false;
});

const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);

clear.addEventListener("click", () => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  context.clearRect(0, 0, canvas.width, canvas.height);
});
