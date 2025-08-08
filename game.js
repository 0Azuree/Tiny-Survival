const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// World settings
const TILE_SIZE = 32;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 50;

// Tile types
const AIR = 0, GRASS = 1, DIRT = 2, STONE = 3, ORE = 4, WOOD = 5, LEAF = 6;

// Player
let player = {
  x: 50,
  y: 0,
  width: TILE_SIZE,
  height: TILE_SIZE * 2,
  dx: 0,
  dy: 0,
  speed: 3,
  jumpPower: -10,
  grounded: false,
  health: 100,
  hunger: 100
};

// World array
let world = [];

// Generate terrain
function generateWorld() {
  let groundHeight = 20;
  for (let x = 0; x < WORLD_WIDTH; x++) {
    world[x] = [];
    let heightVariation = Math.sin(x / 5) * 2;
    let colHeight = groundHeight + heightVariation;
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      if (y < colHeight) {
        world[x][y] = AIR;
      } else if (y === colHeight) {
        world[x][y] = GRASS;
      } else if (y > colHeight && y < colHeight + 3) {
        world[x][y] = DIRT;
      } else {
        world[x][y] = (Math.random() < 0.05) ? ORE : STONE;
      }
    }

    // Trees
    if (Math.random() < 0.1) {
      let treeHeight = 4 + Math.floor(Math.random() * 3);
      for (let t = 0; t < treeHeight; t++) {
        world[x][colHeight - t] = WOOD;
      }
      for (let lx = -2; lx <= 2; lx++) {
        for (let ly = -2; ly <= 2; ly++) {
          if (Math.abs(lx) + Math.abs(ly) < 4) {
            if (world[x + lx] && colHeight - treeHeight + ly > 0) {
              world[x + lx][colHeight - treeHeight + ly] = LEAF;
            }
          }
        }
      }
    }
  }
}

// Draw world
function drawWorld() {
  for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      let tile = world[x][y];
      if (tile !== AIR) {
        switch (tile) {
          case GRASS: ctx.fillStyle = "#228B22"; break;
          case DIRT: ctx.fillStyle = "#8B4513"; break;
          case STONE: ctx.fillStyle = "#808080"; break;
          case ORE: ctx.fillStyle = "#FFD700"; break;
          case WOOD: ctx.fillStyle = "#A0522D"; break;
          case LEAF: ctx.fillStyle = "#006400"; break;
        }
        ctx.fillRect(x * TILE_SIZE - camera.x, y * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// Camera
let camera = { x: 0, y: 0 };

// Controls
let keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// Collision check
function isSolid(tile) {
  return tile !== AIR && tile !== LEAF;
}

// Update player
function updatePlayer() {
  player.dx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.dx = -player.speed;
  if (keys["ArrowRight"] || keys["KeyD"]) player.dx = player.speed;
  if ((keys["ArrowUp"] || keys["Space"] || keys["KeyW"]) && player.grounded) {
    player.dy = player.jumpPower;
    player.grounded = false;
  }

  player.dy += 0.5; // gravity

  // Horizontal movement
  player.x += player.dx;
  handleCollision("x");

  // Vertical movement
  player.y += player.dy;
  handleCollision("y");

  // Camera follow
  camera.x = player.x - canvas.width / 2 + player.width / 2;
  camera.y = player.y - canvas.height / 2 + player.height / 2;
}

// Handle collisions
function handleCollision(axis) {
  let px = Math.floor(player.x / TILE_SIZE);
  let py = Math.floor(player.y / TILE_SIZE);

  for (let x = px - 1; x <= px + 1; x++) {
    for (let y = py - 2; y <= py + 2; y++) {
      if (x >= 0 && y >= 0 && x < WORLD_WIDTH && y < WORLD_HEIGHT) {
        if (isSolid(world[x][y])) {
          let tileRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
          let playerRect = { x: player.x, y: player.y, w: player.width, h: player.height };

          if (rectIntersect(playerRect, tileRect)) {
            if (axis === "x") {
              if (player.dx > 0) player.x = tileRect.x - player.width;
              if (player.dx < 0) player.x = tileRect.x + tileRect.w;
            }
            if (axis === "y") {
              if (player.dy > 0) {
                player.y = tileRect.y - player.height;
                player.dy = 0;
                player.grounded = true;
              }
              if (player.dy < 0) {
                player.y = tileRect.y + tileRect.h;
                player.dy = 0;
              }
            }
          }
        }
      }
    }
  }
}

// Rectangle collision detection
function rectIntersect(r1, r2) {
  return !(r2.x > r1.x + r1.w ||
           r2.x + r2.w < r1.x ||
           r2.y > r1.y + r1.h ||
           r2.y + r2.h < r1.y);
}

// Draw player
function drawPlayer() {
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWorld();
  updatePlayer();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// Init
generateWorld();
gameLoop();
