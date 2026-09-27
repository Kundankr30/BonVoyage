const fs = require('fs');

function uuid() {
  return Math.random().toString(36).substring(2, 15);
}

const elements = [];

function addBox(x, y, w, h, text, bgColor="#ffffff", textColor="#000000") {
  const boxId = uuid();
  const textId = uuid();
  
  elements.push({
    type: "rectangle",
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    id: boxId,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: x,
    y: y,
    strokeColor: "#1e1e1e",
    backgroundColor: bgColor,
    width: w,
    height: h,
    seed: Math.floor(Math.random() * 10000),
    groupIds: [],
    boundElements: [{ type: "text", id: textId }]
  });

  elements.push({
    type: "text",
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    id: textId,
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: x + 10,
    y: y + h/2 - 12,
    strokeColor: textColor,
    backgroundColor: "transparent",
    width: w - 20,
    height: 25,
    seed: Math.floor(Math.random() * 10000),
    groupIds: [],
    text: text,
    fontSize: 20,
    fontFamily: 1, // 1 for Virgil, 2 for Helvetica, 3 for Cascadia
    textAlign: "center",
    verticalAlign: "middle",
    containerId: boxId
  });

  return boxId;
}

function addArrow(x, y, points, label) {
  const arrowId = uuid();
  elements.push({
    type: "arrow",
    version: 1,
    versionNonce: 0,
    isDeleted: false,
    id: arrowId,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    x: x,
    y: y,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    width: Math.abs(points[points.length-1][0]),
    height: Math.abs(points[points.length-1][1]),
    seed: Math.floor(Math.random() * 10000),
    groupIds: [],
    points: points,
    startArrowhead: null,
    endArrowhead: "arrow"
  });
  
  if (label) {
      elements.push({
        type: "text",
        version: 1,
        versionNonce: 0,
        isDeleted: false,
        id: uuid(),
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        x: x + points[1][0]/2 - 30,
        y: y + points[1][1]/2 - 15,
        strokeColor: "#000000",
        backgroundColor: "#ffffff",
        width: 60,
        height: 20,
        seed: Math.floor(Math.random() * 10000),
        groupIds: [],
        text: label,
        fontSize: 16,
        fontFamily: 2,
        textAlign: "center",
        verticalAlign: "middle"
      });
  }
}

const w = 250;
const h = 80;

// Draw nodes
const clientNode = addBox(50, 200, w, h, "User Browser\n(React, Vite, Tailwind)", "#e0f7fa");
const apiNode = addBox(400, 200, w, h, "Main API Server\n(Express, TS, Bun)", "#e8f5e9");
const mlNode = addBox(750, 100, w, h, "ML Engine Service\n(Python, FastAPI, XGBoost)", "#fff3e0");
const dbNode = addBox(750, 300, w, h, "Database\n(PostgreSQL, Prisma)", "#f3e5f5");

// Arrows
addArrow(300, 240, [[0, 0], [100, 0]], "REST");
addArrow(650, 220, [[0, 0], [100, -80]], "HTTP POST");
addArrow(650, 260, [[0, 0], [100, 80]], "TCP (SQL)");

const fileData = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements: elements,
  appState: { viewBackgroundColor: "#ffffff" },
  files: {}
};

fs.writeFileSync('/home/kundan/BonVoyage/architecture.excalidraw', JSON.stringify(fileData, null, 2));
console.log("Created /home/kundan/BonVoyage/architecture.excalidraw");
