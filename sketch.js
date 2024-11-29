let DIM = 35;
let rotX = 0;
let rotY = 0;
let touchStartX = 0;
let touchStartY = 0;
let zoom = 500;
let selectedPoint = null;
let points = [];
let isDragging = false;
let touchDelay = 0;

// Theme toggle variables
let isWhiteTheme = true;
let themeButton;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  camera(zoom, 0, 0, 0, 0, 0, 0, 1, 0);
  
  // Create theme toggle button
  themeButton = createButton('Switch Theme');
  themeButton.position(20, 20);
  themeButton.mousePressed(toggleTheme);
  themeButton.touchStarted(toggleTheme);
  themeButton.style('padding', '10px 20px');
  themeButton.style('font-size', '16px');
  themeButton.style('border-radius', '5px');
  themeButton.style('background-color', 'white');
  themeButton.style('border', '0px solid #000');
  
  // Pre-calculate all points
  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      for (let k = 0; k < DIM; k++) {
        let x = map(i, 0, DIM-1, -150, 150);
        let y = map(j, 0, DIM-1, -150, 150);
        let z = map(k, 0, DIM-1, -150, 150);
        points.push({x, y, z, i, j, k});
      }
    }
  }
}

function toggleTheme() {
  isWhiteTheme = !isWhiteTheme;
  if (isWhiteTheme) {
    themeButton.style('background-color', 'white');
    themeButton.style('color', 'rgb(255,255,255)');
  } else {
    themeButton.style('background-color', '#0066cc');
    themeButton.style('color', 'white');
  }
  return false;
}

function draw() {
  if (isWhiteTheme) {
    background(255, 0, 0);
  } else {
    background(0);
  }
  
  rotateY(rotY);
  rotateX(rotX);
  
  for (let p of points) {
    if (selectedPoint && p === selectedPoint) {
      strokeWeight(0.2);
    } else {
      if (isWhiteTheme) {
        stroke(255);
      } else {
        stroke(255);
      }
      strokeWeight(2);
    }
    point(p.x, p.y, p.z);
  }
  
  if (selectedPoint && !isDragging) {
    let screenPos = getScreenPosition(selectedPoint);
    
    push();
    translate(-width/2, -height/2, 0);
    if (isWhiteTheme) {
      fill(0);
    } else {
      fill(255);
    }
    noStroke();
    textSize(16);
    textAlign(LEFT, CENTER);
    text(`Position: (${selectedPoint.i}, ${selectedPoint.j}, ${selectedPoint.k})`, screenPos.x + 20, screenPos.y);
    pop();
  }
}

function getScreenPosition(point) {
  let rotatedX = point.x * cos(rotY) - point.z * sin(rotY);
  let rotatedZ = point.x * sin(rotY) + point.z * cos(rotY);
  let finalY = point.y * cos(rotX) + rotatedZ * sin(rotX);
  
  return {
    x: width/2 + rotatedX,
    y: height/2 + finalY
  };
}

function touchStarted() {
  touchStartX = mouseX;
  touchStartY = mouseY;
  touchDelay = millis();
  isDragging = false;
  
  let minDist = 20;
  let closest = null;
  let minD = Infinity;
  
  for (let p of points) {
    let screenPos = getScreenPosition(p);
    let d = dist(mouseX, mouseY, screenPos.x, screenPos.y);
    if (d < minDist && d < minD) {
      minD = d;
      closest = p;
    }
  }
  
  selectedPoint = closest;
  return false;
}

function touchMoved() {
  if (dist(mouseX, mouseY, touchStartX, touchStartY) > 10) {
    isDragging = true;
  }
  
  let dx = (mouseX - touchStartX) * 0.01;
  let dy = (mouseY - touchStartY) * 0.01;
  
  rotY += dx;
  rotX += dy;
  
  touchStartX = mouseX;
  touchStartY = mouseY;
  
  return false;
}

function touchEnded() {
  if (!isDragging && millis() - touchDelay < 200) {
    if (selectedPoint) {
      console.log(`Point tapped: (${selectedPoint.i}, ${selectedPoint.j}, ${selectedPoint.k})`);
    }
  }
  if (isDragging) {
    selectedPoint = null;
  }
  isDragging = false;
}

function mouseWheel(event) {
  zoom += event.delta;
  zoom = constrain(zoom, 200, 1000);
  camera(zoom, 0, 0, 0, 0, 0, 0, 1, 0);
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  themeButton.position(20, 20);
}