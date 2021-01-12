window.onresize = resize;
window.onload = init;
document.addEventListener("click", click);

var debugging = false;

var canvas = null;
var ctx = null;
var play = new game();
var availMoves = [];
var selected = null;
var boardLocked = true;
var prev = [];

function resize() {
    canvas.width = window.innerWidth*0.5;
    canvas.height = window.innerHeight;
    draw();
}

function checkValid(checking, dest) {
    for (var i = 0; i < checking.length; i ++) {
        if (checking[i][0] == dest[0] && checking[i][1] == dest[1]) {
            return true;
        }
    }
    return false;
}

function boardStatus(value=null) {
    if (value == null) {
        boardLocked = !boardLocked;
    } else {
        boardLocked = value;
    }
}

var turn = 0;

function click(event) {
    if (boardLocked) {
        return; // checks if the board is locked
    }
    var x = Math.floor(8*(event.clientX-Math.floor(canvas.width/2))/canvas.width);
    var y = Math.floor(8*event.clientY/canvas.height);
    if (x < 8 && x >= 0 && y < 8 && y >= 0) {
        if (checkValid(availMoves, [x,y])) {
            if (play.board[selected[1]][selected[0]].name == "king" && Math.abs(x-selected[0]) == 2) { // handles castling
                sendMove(7*(x!=(2-turn)),7,(5-3*turn)+(2*(x!=(6-5*turn)))*(turn*2-1),7);
                play.move(7*(x!=(2-turn)),7,(5-3*turn)+(2*(x!=(6-5*turn)))*(turn*2-1),7);
                turn = !turn*1;
            }
            sendMove(selected[0],selected[1],x,y);
            play.move(selected[0],selected[1],x,y);
            availMoves = [];
            selected = null;
        } else if (play.board[y][x] == null || (selected != null && selected[0] == x && selected[1] == y)) {
            selected = null;
            availMoves = [];
        } else if (play.board[y][x] != null && (play.board[y][x].color == "w" && turn == 0) || (play.board[y][x].color == "b" && turn == 1)) { //write condition to check player turn here
            availMoves = play.getMoves(x,y);
            selected = [x,y];
        } else {
            selected = null;
            availMoves = [];
        }
        draw();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f0eeb9";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "grey";
    for (var i = 0; i < 32; i++) {
        ctx.fillRect((2*(i%4)*canvas.width/8)+(canvas.width/8)*(Math.floor(i/4)%2==0),(Math.floor(i/4))*canvas.height/8, (canvas.width/8),canvas.height/8)
    }   // draws grey squares.

    for (var i = 0; i < prev.length; i++) { // draw prev moves.
        ctx.fillStyle = 'rgba(0,255,0,0.2)';
        ctx.fillRect((prev[i][0]*canvas.width/8),prev[i][1]*canvas.height/8, (canvas.width/8),canvas.height/8)
    }

    if (selected != null) { // draws selected piece
        ctx.fillStyle = 'rgba(0,0,255,0.3)';
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.ellipse(((2*selected[0]+1)*canvas.width)/16,((2*selected[1]+1)*canvas.height)/16,canvas.width/16,canvas.height/16,0,0, 2 * Math.PI)
        ctx.fill();
        ctx.stroke();
    }

    if (debugging) {
        for (var i = 0; i < availMoves.length; i++) { // draws available moves
            ctx.fillStyle = 'rgba(128,128,0,0.3)';
            ctx.strokeStyle = "yellow";
            if (availMoves[i][2] == 1) {
                ctx.fillStyle = 'rgba(225,0,0,0.3)';
                ctx.strokeStyle = "red";
            }
            ctx.beginPath();
            ctx.ellipse(((2*availMoves[i][0]+1)*canvas.width)/16,((2*availMoves[i][1]+1)*canvas.height)/16,canvas.width/16,canvas.height/16,0,0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke();
        }
    }

    for (var i = 0; i < 8; i++) { // draws pieces
        for (var j = 0; j < 8; j++) {
            if (play.board[i][j] != null) {
                ctx.drawImage(play.board[i][j].img, j*(canvas.width/8), i*(canvas.height/8), canvas.width/8, canvas.height/8);
            }
        }
    }

}

function reset(flipped) {
    play = new game(flipped);
    draw();
}

function init() {
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");
    resize();
}