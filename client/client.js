const socket = io();

const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");

/*           Constants               */
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
}

/*           Variables               */
let player = {x: undefined, y: undefined, rotation: undefined};
let enemies = {};

socket.on("connect", () => {
  socket.emit("grab-player-data");
});

socket.on("add-new-player", enemy => {
  enemies[enemy[0]] = enemy[1];
});

socket.on("recieve-disconnect", enemy => {
  delete enemies[enemy];
});


socket.on("send-player-data", data => {
  player = data;
});

socket.on("show-role", roles => {
  role = roles[socket.id];
  console.log(role);

  clearInterval(animate);
  
  const showRole = setInterval(() => {
    if (role === "impo") c.fillStyle = "#F21717";
    else if (role === "crew") c.fillStyle = "#235685";
    c.fillRect(0, 0, innerWidth, innerHeight);

    c.textAlign = "center";
    c.fillStyle = "#1c1c1c";
    if (role === "impo") c.fillText("You are an imposter", innerWidth / 2, innerHeight / 2)
    else if (role === "crew") c.fillText("You are a crewmate", innerWidth / 2, innerHeight / 2)

  }, 1000/60)

  setTimeout(() => {
    clearInterval(showRole);

    const animate = setInterval(() => {
      c.fillStyle = "#1c1c1c";
      c.fillRect(0, 0, innerWidth, innerHeight);
    
      c.fillStyle = "#e3e3e3";
      c.beginPath();
      c.arc(player.x, player.y, 20, 0, Math.PI * 2);
      c.fill();
      
      for (const enemyID in enemies) {
        const enemy = enemies[enemyID];
        c.beginPath();
        c.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
        c.fill();
      }
    }, 1000/60)
  }, 1000)
})

socket.on("send-players-data", data => {

  for (const key in data) {
    if (key === socket.id) {
      player = data[key];
    } else {
      enemies[key] = data[key];
    }
  }
});

const animate = setInterval(() => {
  c.fillStyle = "#1c1c1c";
  c.fillRect(0, 0, innerWidth, innerHeight);

  c.fillStyle = "#e3e3e3";
  c.beginPath();
  c.arc(player.x, player.y, 20, 0, Math.PI * 2);
  c.fill();
  
  for (const enemyID in enemies) {
    const enemy = enemies[enemyID];
    c.beginPath();
    c.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
    c.fill();
  }
}, 1000/60)

addEventListener("keydown", e => {
  key = e.key;

  if (keys[key] == false) {
    keys[key] = true;
    socket.emit("keyboard-down", key);
  }

});

addEventListener("keyup", e => {
  key = e.key;

  if (keys[key] == true) {
    keys[key] = false;
    socket.emit("keyboard-up", key);
  }
});

