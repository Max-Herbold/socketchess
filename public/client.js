const ip = ":8001";

const socket = io.connect(ip);
socket.on("pair", locked => startGame(locked));
socket.on("dc", none => removePlayer());
socket.on("outMove", m => recMove(m));
socket.on("gamemsg", none => lost());

function startGame(locked) {
    document.getElementById('move').style = "";
    if (locked) {
        document.getElementById('move').textContent = "Connected! Your turn.";
    } else {
        document.getElementById('move').textContent = "Connected! Waiting for opponents turn...";
    }
    reset(!locked);
    boardStatus(!locked);
}

function removePlayer() {
    document.getElementById('move').style = "";
    document.getElementById('move').textContent = "Player disconnected!";
    boardStatus(true);
}

var sequential = 0;

function sendMove(fromx, fromy, tox, toy) {
    boardStatus(true); // remove this if intending to add premoving.
    socket.emit("move", 7-fromx, 7-fromy, 7-tox, 7-toy);
    document.getElementById('move').style = "";
    document.getElementById('move').textContent = "Waiting for opponents turn...";
    sequential = 0;
}

// fromx, fromy, tox, toy
function recMove(m) {
    sequential++;
    play.move(m[0],m[1],m[2],m[3]);
    document.getElementById('move').textContent = "Your turn!";
    /*if (play.check(play.board[m[3]][m[2]].color)) {
        document.getElementById('move').style = "font-weight: bold;";
        document.getElementById('move').textContent = "You're in check!";
    }*/
    draw();
    boardStatus(false); // remove this if intending to add premoving.
}

function endGame() {
    boardStatus(true);
    socket.emit("gamemsg");
    document.getElementById('move').style = "font-weight: bold;";
    document.getElementById('move').textContent = "Well played, you won!";
}

function lost() {
    boardStatus(true);
    document.getElementById('move').style = "font-weight: bold;";
    document.getElementById('move').textContent = "You've lost.";
}