/* eslint-disable @typescript-eslint/no-magic-numbers */
import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sticker Sketchpad";

document.title = gameName;

interface Point {
  x: number;
  y: number;
}

let thickness = 1;
const thinWidth = 1;
const thickWidth = 4;
let utensil = "🖊️";

let emoji = false;
let selectedEmoji = "";
class LineCommand {
  points: Point[];

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = thickness;
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

class ToolCommand {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "32px monospace";
    if (emoji) {
      ctx.fillText(selectedEmoji, this.x, this.y);
    } else {
      ctx.fillText(utensil, this.x, this.y);
    }
  }
}

class StickerCommand {
  points: Point[];
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.points = [];
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "32px monospace";
    ctx.fillText(selectedEmoji, this.x, this.y);
  }

  grow(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class StickerButton {
  emoji: string;

  constructor(emoji: string) {
    this.emoji = emoji;
  }

  setup() {
    const button = document.createElement("button");
    button.innerHTML = this.emoji;
    app.append(button);

    button.addEventListener("click", () => {
      emoji = true;
      selectedEmoji = this.emoji;
      canvas.dispatchEvent(toolChanged);
    });
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
const toolChanged = new Event("tool-changed");
canvas.addEventListener("drawing-changed", () => redraw);
canvas.addEventListener("tool-changed", () => redraw);

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];
const stickerButtons: StickerButton[] = [];
let currentLineCommand: LineCommand | null = null;
let toolCommand: ToolCommand | null = null;

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(context));
  if (toolCommand) toolCommand.draw(context);
}

function tick() {
  redraw();
  requestAnimationFrame(tick);
}
tick();

canvas.addEventListener("mouseout", () => {
  toolCommand = null;
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mouseenter", (event) => {
  toolCommand = new ToolCommand(event.offsetX, event.offsetY);
  canvas.dispatchEvent(toolChanged);
});

// https://shoddy-paint.glitch.me/paint0.html
canvas.addEventListener("mousedown", (event) => {
  toolCommand = null;
  if (emoji) {
    currentLineCommand = new StickerCommand(event.offsetX, event.offsetY);
  } else {
    currentLineCommand = new LineCommand(event.offsetX, event.offsetY);
  }
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);

  canvas.dispatchEvent(drawingChanged);
  canvas.dispatchEvent(toolChanged);
});

canvas.addEventListener("mousemove", (event) => {
  toolCommand = new ToolCommand(event.offsetX, event.offsetY);
  // if cursor/left click is active
  if (event.buttons == 1) {
    toolCommand = null;
    currentLineCommand!.points.push({ x: event.offsetX, y: event.offsetY });
    canvas.dispatchEvent(drawingChanged);
  }

  canvas.dispatchEvent(toolChanged);
});

window.addEventListener("mouseup", (event) => {
  currentLineCommand = null;
  toolCommand = new ToolCommand(event.offsetX, event.offsetY);
  canvas.dispatchEvent(drawingChanged);
  canvas.dispatchEvent(toolChanged);
});

app.append(document.createElement("br"));
const thin = document.createElement("button");
thin.innerHTML = "thin";
app.append(thin);

thin.addEventListener("click", () => {
  emoji = false;
  thickness = thinWidth;
  utensil = "🖊️";
  canvas.dispatchEvent(drawingChanged);
});

const thick = document.createElement("button");
thick.innerHTML = "thick";
app.append(thick);

thick.addEventListener("click", () => {
  emoji = false;
  thickness = thickWidth;
  utensil = "🖌️";
  canvas.dispatchEvent(drawingChanged);
});

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

const newColor = document.createElement("button");
newColor.innerHTML = "new color";
newColor.className = "random-color";
newColor.style.color = randomColor();
app.append(newColor);

// sets pen to random color, then randomizes the color again
newColor.addEventListener("click", () => {
  context.strokeStyle = newColor.style.color;
  newColor.style.color = randomColor();
});

const clear = document.createElement("button");
clear.innerHTML = "clear";
app.append(clear);

clear.addEventListener("click", () => {
  commands.splice(0, commands.length);
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.dispatchEvent(drawingChanged);
});

const undo = document.createElement("button");
undo.innerHTML = "undo";
app.append(undo);

undo.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    //context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dispatchEvent(drawingChanged);
  }
});

const redo = document.createElement("button");
redo.innerHTML = "redo";
app.append(redo);

redo.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    //context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dispatchEvent(drawingChanged);
  }
});

app.append(document.createElement("br"));
const custom = document.createElement("button");
custom.innerHTML = "custom";
app.append(custom);

custom.addEventListener("click", () => {
  const text = prompt("Custom sticker text", "🧽");
  const sb = new StickerButton(text!);
  stickerButtons.push(sb);
  sb.setup();
});

stickerButtons.push(new StickerButton("🎲"));
stickerButtons.push(new StickerButton("❓"));
stickerButtons.push(new StickerButton("☂️"));

stickerButtons.forEach((sb) => sb.setup());

const exporter = document.createElement("button");
exporter.innerHTML = "export";
app.append(exporter);

exporter.addEventListener("click", () => {
  const biggerCanvas = document.createElement("canvas");
  biggerCanvas.width = 1024;
  biggerCanvas.height = 1024;
  const ctx = biggerCanvas.getContext("2d")!;
  ctx.scale(4, 4);
  commands.forEach((cmd) => cmd.display(ctx));

  const anchor = document.createElement("a");
  anchor.href = biggerCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});
