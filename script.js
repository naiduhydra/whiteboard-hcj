const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const brush = document.getElementById('brush');
const eraser = document.getElementById('eraser');
const triangle = document.getElementById('triangle');
const square = document.getElementById('square');
const circle = document.getElementById('circle');
const colorPicker = document.getElementById('colorPicker');
const sizeChanger = document.getElementById('sizeChanger');
const fillToggle = document.getElementById('fillToggle');
const clear = document.getElementById('clear');
const save = document.getElementById('save');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let drawing = false;
let tool = 'brush'; // Default tool is brush
let color = colorPicker.value;
let size = sizeChanger.value;
let fillShape = fillToggle.checked;
let startX, startY;
let savedState = null; // To save the canvas state for shape previewing

// Undo/Redo
let history = [];
let redoStack = [];

// Save the current state
function saveState() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = []; // Clear redo stack on new actions
}

// Undo the last action
function undo() {
  if (history.length > 0) {
    const previousState = history.pop();
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    redoStack.push(previousState);
  }
}

// Redo the last undone action
function redo() {
  if (redoStack.length > 0) {
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    history.push(nextState);
  }
}

// Start drawing
function startDrawing(e) {
  startX = e.offsetX;
  startY = e.offsetY;
  drawing = true;
  if (tool === 'brush' || tool === 'eraser') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  } else {
    savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  saveState();
}

// Draw dynamically
function draw(e) {
  if (!drawing) return;

  const endX = e.offsetX;
  const endY = e.offsetY;

  if (tool === 'brush') {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (tool === 'eraser') {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = size;
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else {
    // Restore the previous state for shape preview
    ctx.putImageData(savedState, 0, 0);
    drawShape(tool, startX, startY, endX, endY, false);
  }
}

// Stop drawing
function stopDrawing(e) {
  if (!drawing) return;
  drawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  if (tool !== 'brush' && tool !== 'eraser') {
    drawShape(tool, startX, startY, endX, endY, true); // Finalize shape
  }

  ctx.beginPath(); // Reset path for brush/eraser
}

// Draw shapes
function drawShape(shape, startX, startY, endX, endY, finalize) {
  const width = endX - startX;
  const height = endY - startY;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size;

  ctx.beginPath();
  if (shape === 'triangle') {
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + width, startY);
    ctx.lineTo(startX + width / 2, startY - height);
    ctx.closePath();
    if (fillShape && finalize) ctx.fill();
    if (!finalize) ctx.stroke(); // For preview
  } else if (shape === 'square') {
    if (fillShape && finalize) {
      ctx.fillRect(startX, startY, width, height);
    } else {
      ctx.strokeRect(startX, startY, width, height);
    }
  } else if (shape === 'circle') {
    const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
    ctx.arc(startX + width / 2, startY + height / 2, radius, 0, Math.PI * 2);
    if (fillShape && finalize) ctx.fill();
    if (!finalize) ctx.stroke(); // For preview
  }

  if (finalize) {
    ctx.stroke(); // Finalize the shape
  }
}

// Tool button event listeners
brush.addEventListener('click', () => tool = 'brush');
eraser.addEventListener('click', () => tool = 'eraser');
triangle.addEventListener('click', () => tool = 'triangle');
square.addEventListener('click', () => tool = 'square');
circle.addEventListener('click', () => tool = 'circle');
colorPicker.addEventListener('input', (e) => color = e.target.value);
sizeChanger.addEventListener('input', (e) => size = e.target.value);
fillToggle.addEventListener('change', (e) => fillShape = e.target.checked);

// Event listeners for canvas interactions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Clear canvas
clear.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history = []; // Clear history stack
  redoStack = [];
});

// Save canvas as image
save.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'canvas-image.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Undo and Redo buttons
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
