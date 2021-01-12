const ip = "192.168.0.10:8001";

const socket = io.connect(ip);
socket.on("pair", locked => startGame(locked));
socket.on("dc", ok => removePlayer());
socket.on("outMove", m => recMove(m));

function startGame(locked) {
    if (locked) {
        document.getElementById('move').textContent = "Connected! Your turn.";
    } else {
        document.getElementById('move').textContent = "Connected! Waiting for opponents turn...";
    }
    reset(!locked);
    boardStatus(!locked);
}

function removePlayer() {
    document.getElementById('move').textContent = "Player disconnected!";
    boardStatus(true);
}

var sequential = 0;

function sendMove(fromx, fromy, tox, toy) {
    document.getElementById('move').textContent = "Waiting for opponents turn...";
    boardStatus(true); // remove this if intending to add premoving.
    socket.emit("move", 7-fromx, 7-fromy, 7-tox, 7-toy);
    sequential = 0;
}

// fromx, fromy, tox, toy
function recMove(m) {
    document.getElementById('move').textContent = "Your turn!";
    sequential++;
    boardStatus(false); // remove this if intending to add premoving.
    play.move(m[0],m[1],m[2],m[3]);
    draw();
}
