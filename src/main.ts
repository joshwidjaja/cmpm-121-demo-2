/* eslint-disable @typescript-eslint/no-magic-numbers */
import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";

document.title = gameName;

interface Point {
  x: number;
  y: number;
}

class LineCommand {
  points: Point[];

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
app.append(canvas);

const drawingChanged = new Event("drawing-changed");
canvas.addEventListener("drawing-changed", () => redraw);

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];
let currentLineCommand: LineCommand | null = null;

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(context));
}

function tick() {
  redraw();
  requestAnimationFrame(tick);
}
tick();

// https://shoddy-paint.glitch.me/paint0.html
canvas.addEventListener("mousedown", (event) => {
  currentLineCommand = new LineCommand(event.offsetX, event.offsetY);
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);
  //currentLine.push(new Point(cursor.x, cursor.y));

  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mousemove", (event) => {
  // if cursor/left click is active
  if (event.buttons == 1) {
    currentLineCommand!.points.push({ x: event.offsetX, y: event.offsetY });
    canvas.dispatchEvent(drawingChanged);
  }
});

window.addEventListener("mouseup", () => {
  currentLineCommand = null;
  canvas.dispatchEvent(drawingChanged);
});

app.append(document.createElement("br"));
const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);

clear.addEventListener("click", () => {
  commands.splice(0, commands.length);
  canvas.dispatchEvent(drawingChanged);
});

const undo = document.createElement("button");
undo.innerHTML = "undo";
app.append(undo);

undo.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    canvas.dispatchEvent(drawingChanged);
  }
});

const redo = document.createElement("button");
redo.innerHTML = "redo";
app.append(redo);

redo.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    canvas.dispatchEvent(drawingChanged);
  }
});
