const ip = "124.148.164.154:8001";

const socket = io.connect(ip);
socket.on("pair", locked => startGame(locked));
socket.on("dc", playerId => removePlayer(playerId));
socket.on("outMove", m => recMove(m));


function startGame(locked) {
    console.log(locked);
    reset(!locked);
    boardStatus(!locked);
}

function removePlayer() {
    alert("The player you were playing with\nhas disconnected from the game.");
    boardStatus(true);
}

function sendMove(fromx, fromy, tox, toy) {
    boardStatus(true); // remove this if intending to add premoving.
    socket.emit("move", 7-fromx, 7-fromy, 7-tox, 7-toy);
}

// fromx, fromy, tox, toy
function recMove(m) {
    console.log("got it...");
    boardStatus(false); // remove this if intending to add premoving.
    play.move(m[0],m[1],m[2],m[3]);
    draw();
}

function start(message) {
    socket.emit("message", message);
}
