const express = require("express");
const socket = require('socket.io');
const player = require("./player");

const app = express();

let server = app.listen(8001);
console.log('The server is now running at http://localhost/');
app.use(express.static("public"));

let io = socket(server);

let players = [];

function makeGame(i, pairi=null) {
  if (pairi == null) {
    players[i].ingame = false;
    players[i].color = null;
    players[i].ingamewith = null;
    players[i].socket.emit("pair", false);
    return;
  }
  players[i].ingame = true;
  if (players[pairi].color == null) {
    players[i].color = Math.round(Math.random());
  } else {
    players[i].color = !players[pairi].color * 1;
  }

  players[i].socket.emit("pair", players[i].color == 1); // 
  
  players[i].ingamewith = players[pairi].id;
}

var num = -1 ;

function countInGame() {
  var count = 0;
  for (var i = 0; i < players.length; i++) {
    if (players.ingame == false) {
      count ++;
    }
  }
  return count;
}

io.sockets.on('connection', function (socket) {
  // console.log(socket);
  var id = socket.conn.id;
  var ip = socket.conn.remoteAddress.split(":")[socket.conn.remoteAddress.split(":").length - 1];
  players.push(new player(ip, id, ++num, socket)); // issue with the num counter, need to loop thru players array to find unpaired players 
  console.log(`${ip} connected. (UID:${num}), Num players connected: ${players.length}`);

  function checkgame() {
    var game = [];
    var c = 0;
    for (var i = 0; i < players.length; i++) {
      if (players[i].ingame == false) {
        game.push(i);
        c++;
      }
      if (c == 2) {
        break;
      }
    }
    if (c < 2) {
      return;
    }
    console.log(`Made game with ${players[game[0]].ip} (UID:${game[0]}) and ${players[game[1]].ip} (UID:${game[1]})`);
    players[game[0]].socket.emit("pair", false);
    makeGame(game[0], game[1]);
    makeGame(game[1], game[0]);
  }

  // ensures two free players are put into a game as soon as possible.
  if (players.length % 2 == 0) {
    checkgame();
  }

  // Echo back messages from the client
  socket.on('message', function (message) {
    console.log(message);
    socket.emit('message', message); // ??
  });

  socket.on("move", function(a,b,c,d) {
    var whoamiindex = -1;
    for (var i = 0; i < players.length; i++) {
      if (socket.conn.id == players[i].id) {
        whoamiindex = i;
        break;
      }
    }
    for (var i = 0; i < players.length; i++) {
      if (players[i] != null) {
        if (players[i].id == players[whoamiindex].ingamewith) {
          players[i].socket.emit("outMove",[a,b,c,d]);
          break;
        }
      }
    }
    console.log(a,b,c,d);
  });

  socket.on("disconnect", () => {
    players = players.filter(player => player.id !== socket.conn.id);
    for (var i = 0; i < players.length; i++) {
      if (players[i].ingamewith == socket.conn.id) {
        makeGame(i);
        players[i].socket.emit("dc");
      }
    }
    if (players.length % 2 == 0) {
      checkgame();
    }
  });
});
