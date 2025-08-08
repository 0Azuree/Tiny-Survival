const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const TILE_SIZE = 16;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 100;

let world = [];
let player = {
    x: 10,
    y: 0,
    width: 1,
    height: 2,
    vx: 0,
    vy: 0,
    onGround: false,
    health: 10,
    hunger: 10,
    inventory: {},
    selectedBlock: "dirt"
};

let dayTime = 0;
let mobs = [];
let sheep = [];
let keys = {};

const blockColors = {
    air: "#87CEEB",
    grass: "#3BB143",
    dirt: "#8B4513",
    stone: "#777777",
    coal: "#333333",
    iron: "#D4AF37",
    wood: "#A0522D",
    leaves: "#228B22",
    crafting: "#A07B48"
};

function generateWorld() {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        world[y] = [];
        for (let x = 0; x < WORLD_WIDTH; x++) {
            if (y > 70) world[y][x] = "stone";
            else if (y > 60) world[y][x] = "dirt";
            else if (y === 60) world[y][x] = "grass";
            else world[y][x] = "air";

            // Random ores
            if (y > 70 && Math.random() < 0.02) world[y][x] = "coal";
            if (y > 75 && Math.random() < 0.015) world[y][x] = "iron";
        }
    }
    generateTrees();
}

function generateTrees() {
    for (let x = 5; x < WORLD_WIDTH; x += Math.floor(Math.random() * 10) + 5) {
        let groundY = findGround(x);
        if (groundY !== -1) {
            for (let y = 0; y < 4; y++) world[groundY - y][x] = "wood";
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 0; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) < 4) {
                        world[groundY - 4 + dy][x + dx] = "leaves";
                    }
                }
            }
        }
    }
}

function findGround(x) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (world[y][x] !== "air") return y;
    }
    return -1;
}

function drawWorld() {
    let offsetX = Math.floor(player.x - canvas.width / TILE_SIZE / 2);
    let offsetY = Math.floor(player.y - canvas.height / TILE_SIZE / 2);
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            let screenX = (x - offsetX) * TILE_SIZE;
            let screenY = (y - offsetY) * TILE_SIZE;
            if (screenX + TILE_SIZE < 0 || screenY + TILE_SIZE < 0 || screenX > canvas.width || screenY > canvas.height) continue;
            ctx.fillStyle = blockColors[world[y][x]] || "#000";
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect((player.x - camera.x) * TILE_SIZE, (player.y - camera.y) * TILE_SIZE, player.width * TILE_SIZE, player.height * TILE_SIZE);
}

let camera = {x: 0, y: 0};

function updateCamera() {
    camera.x = player.x - (canvas.width / TILE_SIZE) / 2;
    camera.y = player.y - (canvas.height / TILE_SIZE) / 2;
}

function physics() {
    player.vy += 0.1;
    player.x += player.vx;
    player.y += player.vy;
    collide();
}

function collide() {
    player.onGround = false;
    if (getBlock(player.x, player.y + player.height) !== "air") {
        player.y = Math.floor(player.y + player.height) - player.height;
        player.vy = 0;
        player.onGround = true;
    }
}

function getBlock(x, y) {
    let bx = Math.floor(x);
    let by = Math.floor(y);
    if (bx < 0 || bx >= WORLD_WIDTH || by < 0 || by >= WORLD_HEIGHT) return "air";
    return world[by][bx];
}

function setBlock(x, y, type) {
    let bx = Math.floor(x);
    let by = Math.floor(y);
    if (bx < 0 || bx >= WORLD_WIDTH || by < 0 || by >= WORLD_HEIGHT) return;
    world[by][bx] = type;
}

function input() {
    if (keys["a"]) player.vx = -0.1;
    else if (keys["d"]) player.vx = 0.1;
    else player.vx = 0;

    if (keys["w"] && player.onGround) player.vy = -0.3;
}

function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    input();
    physics();
    updateCamera();
    drawWorld();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

generateWorld();
gameLoop();
