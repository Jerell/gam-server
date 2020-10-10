const app = require("express")();
const http = require("http").createServer(app);
const PORT = 8080;
const io = require("socket.io")(http);
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send();
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

const players = {};
const colors = {};
function addColor(id) {
  colors[id] = "#" + Math.floor(Math.random() * 16777215).toString(16);
}

const state = {
  users: 0,
  get playerNames() {
    return Object.values(players);
  },
};

io.on("connection", (socket) => {
  console.log(`${++state.users} user(s) connected`);

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    state.users--;
    delete players[socket.id];
  });

  socket.on("name", (name) => {
    if (state.playerNames.includes(name)) {
      console.log(`${name} - already taken`);
      socket.emit("nameTaken", name);
    } else {
      players[socket.id] = name;
      console.log(`${name} - joined the game`);
      console.log(state.playerNames);
      addColor(socket.id);
      socket.emit("joined", name);
    }
  });

  socket.on("openGame", () => {
    console.log(`game window opened`);
  });

  socket.on("mouse", (data) => {
    // Data comes in as whatever was sent, including objects
    console.log("mouse", { data });
    // Send it to all other clients
    data.name = players[socket.id];
    data.color = colors[socket.id];
    io.emit("mouse", data);
  });
});
