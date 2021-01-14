window.onresize = resize;
window.onload = init;

// let e = 'ontouchstart' in window ? 'click touch' : 'click';

// document.addEventListener(e, click);

document.addEventListener("click", click);
document.addEventListener('click touch', click);

// document.addEventListener("click", click);
// document.addEventListener('click touch', click);
// document.addEventListener('touchstart', click);

var debugging = false; // toggles visible dots.

var canvas = null;
var ctx = null;
var play = new game();
var availMoves = [];
var selected = null;
var boardLocked = true;

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

function click(event) {
    if (boardLocked) {
        return;
    }
    var x = Math.floor(8*(event.clientX-Math.floor(canvas.width/2))/canvas.width);
    var y = Math.floor(8*event.clientY/canvas.height);
    if (x < 8 && x >= 0 && y < 8 && y >= 0) {
        if (checkValid(availMoves, [x,y])) { // write case to ignore castling if in check.
            if (play.checkcheck(selected[0],selected[1],x,y)) { // handles moving into check... maybe?
                res();
                draw();
                return;
            }
            if (play.board[selected[1]][selected[0]].name == "king" && Math.abs(x-selected[0]) == 2) { // castling
                sendMove(7*(x!=(2-play.turn)),7,(5-3*play.turn)+(2*(x!=(6-5*play.turn)))*(play.turn*2-1),7);
                play.move(7*(x!=(2-play.turn)),7,(5-3*play.turn)+(2*(x!=(6-5*play.turn)))*(play.turn*2-1),7);
                play.turn = !play.turn*1;
            }
            sendMove(selected[0],selected[1],x,y);
            play.move(selected[0],selected[1],x,y);
            if(play.checkmate(play.board[y][x].color)) {
                endGame(flipcolor(play.board[y][x].color));
            }
            res();
        } else if (play.board[y][x] == null || (selected != null && selected[0] == x && selected[1] == y)) {
            res();
        } else if (play.board[y][x] != null && (play.board[y][x].color == "w" && play.turn == 0) || (play.board[y][x].color == "b" && play.turn == 1)) { //write condition to check player play.turn here
            availMoves = play.getMoves(x,y);
            selected = [x,y];
        } else {
            res();
        }
        draw();
    }
}

function res() {
    selected = null;
    availMoves = [];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f0eeb9";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "grey";
    for (var i = 0; i < 32; i++) {
        ctx.fillRect((2*(i%4)*canvas.width/8)+(canvas.width/8)*(Math.floor(i/4)%2==0),(Math.floor(i/4))*canvas.height/8, (canvas.width/8),canvas.height/8)
    }   // draws grey squares.

    for (var i = 0; i < play.prev.length; i++) { // draw prev moves.
        ctx.fillStyle = 'rgba(0,255,0,0.2)';
        ctx.fillRect((play.prev[i][0]*canvas.width/8),play.prev[i][1]*canvas.height/8, (canvas.width/8),canvas.height/8)
    }

    if (selected != null) { // draws selected piece
        ctx.fillStyle = 'rgba(0,0,128,0.7)';
        ctx.fillRect((selected[0]*canvas.width/8),selected[1]*canvas.height/8, (canvas.width/8),canvas.height/8)
    
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