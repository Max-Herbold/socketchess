class game {
    constructor(flip=false) {
        this.board = []
        this.turn = 0;
        this.prev = [];
        for (var j = 0; j < 8; j++) {
            var holder = []
            for (var i = 0; i < 8; i ++) {
                holder.push(null);
            }
            this.board.push(holder);
        }

        const c = [["b", "w"],["w","b"]];
        const colors = c[flip*1];

        // pawn gen
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 8; j++) {
                this.board[1+i*5][j] = new piece(j,1+i*5,"pawn",colors[i])
            }
        }

        for (var i = 0; i < 2; i++) {
            this.board[0+7*i][0] = new piece(0,0+7*i,"rook",colors[i])
            this.board[0+7*i][7] = new piece(7,0+7*i,"rook",colors[i])
            this.board[0+7*i][1] = new piece(1,0+7*i,"knight",colors[i])
            this.board[0+7*i][6] = new piece(6,0+7*i,"knight",colors[i])
            this.board[0+7*i][2] = new piece(2,0+7*i,"bishop",colors[i])
            this.board[0+7*i][5] = new piece(5,0+7*i,"bishop",colors[i])
            this.board[0+7*i][4-flip] = new piece(4-flip,0+7*i,"king",colors[i])
            this.board[0+7*i][3+flip] = new piece(3+flip,0+7*i,"queen",colors[i])
        }
    }

    pawnMoves(p,x,y,flipped) {
        var dir = -1+2*flipped;
        var moves = [];
        if (this.board[y+dir][x] == null) {
            moves.push([x,y+dir,0]);
            if (p.moved == false && this.board[y+dir*2][x] == null) {
                moves.push([x,y+dir*2,0]);
            }
        }
        if (x > 0 && this.board[y+dir][x-1] != null) {
            if (this.board[y+dir][x-1].color != p.color) {
                moves.push([x-1,y+dir,1]);
            }
        }
        if (x < 8 && this.board[y+dir][x+1] != null) {
            if (this.board[y+dir][x+1].color != p.color) {
                moves.push([x+1,y+dir,1]);
            }
        }
        return moves;
    }

    knightMoves(p,x,y) {
        var moves = [];
        for (var i = -2; i < 3; i++) {
            for (var j = -2; j < 3; j++) {
                if (i == 0 || j == 0 || Math.abs(i) == Math.abs(j)) {
                    continue;
                } else if (i+x<8&&i+x>-1&&j+y<8&&j+y>-1) {
                    if (this.board[j+y][i+x] == null) {
                        moves.push([i+x, j+y, 0]);
                    } else if (this.board[j+y][i+x].color != p.color) {
                        moves.push([i+x, j+y, 1]);
                    }
                }
            }
        }
        return moves; 
    }   

    straight(p,x,y) {
        var moves = []
        for (var bcheck = 0; bcheck < 2; bcheck++) { // bool check. not rly a check but switches from vert to hori
            for (var dir = -1; dir < 2; dir += 2) {
                for (var i = (x*!bcheck+y*bcheck)+dir; i > -1 && i < 8; i +=dir) {
                    if (this.board[y*!bcheck+i*bcheck][x*bcheck+i*!bcheck] == null) {
                        moves.push([x*bcheck+i*!bcheck,y*!bcheck+i*bcheck,0]);
                    } else if (this.board[y*!bcheck+i*bcheck][x*bcheck+i*!bcheck].color != p.color) {
                        moves.push([x*bcheck+i*!bcheck,y*!bcheck+i*bcheck,1]);
                        break;
                    } else {
                        break;
                    }
                }
            }
        }
        return moves;
    }

    diagonal(p,x,y) {
        var moves = [];
        for (var diry = -1; diry < 2; diry +=2) {
            for (var dirx = -1; dirx < 2; dirx +=2) {
                for (var i = 1; i < 8; i ++) {
                    if (dirx*i+x<8&&diry*i+y<8&&dirx*i+x>-1&&diry*i+y>-1) {
                        if (this.board[y+i*diry][x+i*dirx] == null) {
                            moves.push([x+i*dirx,y+i*diry,0]);
                        } else if (this.board[y+i*diry][x+i*dirx].color != p.color) {
                            moves.push([x+i*dirx,y+i*diry,1]);
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        return moves;
    }

    kingMoves(p,x,y) {
        var moves = [];
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i+x<8&&i+x>-1&&j+y<8&&j+y>-1) {
                    if (this.board[y+j][i+x] == null) {
                        moves.push([i+x,y+j,0]);
                    } else if (this.board[y+j][i+x].color != p.color) {
                        moves.push([i+x,y+j,1]);
                    }
                }
            }
        }
        // castling king side
        // turn == 0 for white
        // if (this.check(p.color, false)) { // prevents castling while in check
        //     return moves;
        // }
        var mappedturn = !this.turn * 2 - 1;
        if (!p.moved && this.board[y][x+3*mappedturn] != null) { // king side castle
            if (!this.board[y][x+3*mappedturn].moved) {
                var c = 0;
                for (var i = 0; i < 2; i++){
                    if (this.board[y][x+(i+1)*mappedturn] != null) {
                        c++;
                    }
                }
                if (c == 0) {
                    moves.push([x+2*mappedturn,y,0]);
                }
            }
        }
        if (!p.moved && this.board[y][x-4*mappedturn] != null) { // queen side castle
            if (!this.board[y][x-4*mappedturn].moved) {
                for (var i = 0; i < 3; i++){
                    if (this.board[y][x-(i+1)*mappedturn] != null) {
                        return moves;
                    }
                }
                moves.push([x-2*mappedturn,y,0]);
            }
        }
        return moves;
    }

    // finds a piece by name and color (only really useful for king/queen)
    findPiece(name, color) {
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var p = this.board[i][j];
                if (p != null && p.name == name && p.color == color) {
                    return [j,i];
                }
            }
        }
    }
    // Finds king of a color and checks if its in check.
    // swap swaps the color if true to accomodate inputs.
    check(color, swap=true) {
        if (swap) { color = flipcolor(color); }
        var coords = this.findPiece("king", color); // undefined (null) issue on coords?
        var moves = []
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] != null && this.board[i][j].color != color) {

                    // need to flip this from check check
                    var temp = this.getMoves(j,i,!swap); // maybe this shouldnt be hardcoded
                    for (var k = 0; k < temp.length; k++) {
                        moves.push(temp[k]);
                    }
                }
            }
        }
        for (var i = 0; i < moves.length; i++) { 
            if (moves[i][0] == coords[0] && moves[i][1] == coords[1]) {
                return true;
            }
        }
        return false;
    }

    checkcheck(fromx, fromy, tox, toy) {
        var fakegame = new game();
        fakegame = copyBoard(fakegame);
        fakegame.move(fromx, fromy, tox, toy);

        // check if bottom color is in check. while bottom is who moved
        return fakegame.check(fakegame.board[toy][tox].color, false);
    }

    checkmate(color) { // color of attacking piece (white)
        var fakegame = new game();
        fakegame = copyBoard(fakegame);
        var from = [];
        var moves = [];
        for (var i = 0; i < fakegame.board.length; i++) { // store all possible moves into a list
            for (var j = 0; j < fakegame.board[i].length; j++) {
                if (fakegame.board[i][j] != null && fakegame.board[i][j].color != color) {
                    moves.push(fakegame.getMoves(j,i,true)); // get moves of all defending pieces (black)
                    from.push([j,i]);                        // so we flip to change dir to down (+)
                }
            }
        }
        for (var i = 0; i < from.length; i++) {
            for (var j = 0; j < moves[i].length; j++) {
                fakegame = copyBoard(fakegame);
                fakegame.move(from[i][0], from[i][1], moves[i][j][0], moves[i][j][1]);
                if(!fakegame.check(color,true)) { // Check if defending will still be in check (black)
                    return false;
                }
            }
        }
        return true;
    }

    getMoves(x,y,flipped=false) {
        var p = this.board[y][x];
        if (p.name == "pawn") {
            return this.pawnMoves(p,x,y,flipped);
        } else if (p.name == "rook") {
            return this.straight(p,x,y);
        } else if (p.name == "queen") {
            return this.straight(p,x,y).concat(this.diagonal(p,x,y));
        } else if (p.name == "bishop") {
            return this.diagonal(p,x,y);
        } else if (p.name == "knight") {
            return this.knightMoves(p,x,y);
        } else if (p.name == "king") {
            return this.kingMoves(p,x,y);
        }
        return [];
    }

    move(fromx, fromy, tox, toy) {
        var p = this.board[fromy][fromx]
        if (p == null) {
            return;
        }
        this.board[toy][tox] = new piece(tox,toy,p.name,p.color);
        this.board[fromy][fromx] = null;
        this.board[toy][tox].moved = true;
        if (p.name == "pawn") { // handles promoting
            if (toy == 0 || toy == 7) {
                this.board[toy][tox] = new piece(tox,toy,"queen",p.color); // could add option to select piece
            }
        }
        this.prev = [[fromx,fromy],[tox,toy]];
        if (sequential < 2) { // if sending more than one move only toggle turn once.
            this.turn = !this.turn*1;
        }
    }
}

function flipcolor(c) {
    if (c == 'w') {
        return "b";
    }
    return 'w';
}

function copyBoard(fakegame) {
    fakegame.board = [];
    for (var i = 0; i < play.board.length; i++) {
        var temp = [];
        for (var j = 0; j < play.board[i].length; j++) {
            if (play.board[i][j] == null) {
                temp.push(null);
            } else {
                temp.push(new piece(play.board[i][j].x, play.board[i][j].y, play.board[i][j].name, play.board[i][j].color, play.board[i][j].moved));
            }
        }
        fakegame.board.push(temp);
    }
    return fakegame
}

class piece {
    constructor(x,y,n,c,m=false) {
        this.x = x;
        this.y = y;
        this.name = n;
        this.color = c
        this.img = new Image();
        this.img.src = "assets/" + this.color + this.name + ".png";
        this.moved = m;
    }
}