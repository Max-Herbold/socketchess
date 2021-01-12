const express = require("express");
const socket = require('socket.io');
const player = require("./player");
// const cors = require('cors');
const app = express();

// socket.origins((_,callback) => {
//   callback(null,true);
// });

let server = app.listen(8001);
console.log('The server is now running at http://localhost/');
app.use(express.static("public"));

// app.use(cors());
//   app.all('/', function (request, response, next) {
//     response.header("Access-Control-Allow-Origin", "*");
//     response.header("Access-Control-Allow-Headers", "X-Requested-With");
//     next();
//   });

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
  
  //oldtrue
  /*if (players[i].color == 0) { // 0 is white, if the player gains white their board will be unlocked first.
    players[i].socket.emit("pair", true);
  }*/
  
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
  console.log("Number:", num);

  // ensures two free players are put into a game as soon as possible.
  var game = [];
  if (players.length % 2 == 0) {
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

    players[game[0]].socket.emit("pair", false);
    makeGame(game[0], game[1]);
    makeGame(game[1], game[0]);


    // old method, causing crashes.

    /*var player1 = num-1; // write some code to pair two unpaired 
    var player2 = num; //   connections with eachother in order. 

    players[player1].socket.emit("pair", false);
    // connections[player1].emit("pair", false);
    //players[i].send("pair", pairi == null);
    // socket.send("pair", player2==null);

    makeGame(player1, player2);
    makeGame(player2, player1);*/

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
    io.sockets.emit("dc", socket.conn.id);
    players = players.filter(player => player.id !== socket.conn.id);
    for (var i = 0; i < players.length; i++) {
      if (players[i].ingamewith == socket.conn.id) {
        makeGame(i);
      }
    }
  });
});
