const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const Player = require(__dirname + "/player.js").player;

app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

server.listen(3000, () => {
  console.log("Listening on port 3000.");
});

/*           Game Variables            */
const players = {};
const inputs = [];
roles = {};
let state = "LOBBY";
let playerCount = 0;

/*          Game Constants             */
SPEED = 5;

setInterval(serverLoop, 1000 / 60);

io.on("connection", (socket) => {
  // Socket.IO Code Goes Here
  players[socket.id] = new Player(50, 50, 0);
  socket.emit("send-players-data", players);
  socket.broadcast.emit("add-new-player", [socket.id, players[socket.id]]);
  playerCount++;
  playerChange();

  socket.on("disconnect", () => {
    delete players[socket.id];
    playerCount--;
    io.emit("recieve-disconnect", socket.id);

    playerChange();
  });

  socket.on("grab-player-data", () => {
    player = players[socket.id];

    socket.emit("send-player-data", {
      x: player.x,
      y: player.y,
      rotation: player.rotation,
    });
  });

  socket.on("keyboard-down", (key) => {
    inputs.push(socket.id + key);
  });

  socket.on("keyboard-up", (key) => {
    inputs.splice(inputs.indexOf(socket.id + key), 1);
  });
});

function serverLoop() {
  manageMovement();
}

function manageMovement() {
  inputs.forEach((input) => {
    id = input.slice(0, -1);
    key = input.slice(-1);

    if (key === "w") players[id].move([0, -SPEED]);
    if (key === "a") players[id].move([-SPEED, 0]);
    if (key === "s") players[id].move([0, SPEED]);
    if (key === "d") players[id].move([SPEED, 0]);
  });

  if (inputs.length > 0) io.emit("send-players-data", players);
}

function playerChange() {
  if (playerCount > 1) {
    state = "GAME";
    transitionToGame();
  }
}

function transitionToGame() {
  randomNumber = Math.floor(Math.random() * playerCount);
  imposter = Object.keys(players)[randomNumber];
  console.log(imposter);

  for (id in players) {
    if (id === imposter) {
      roles[id] = "impo";
    } else {
      roles[id] = "crew";
    }
  }

  console.log(roles);

  io.emit("show-role", roles);
}
