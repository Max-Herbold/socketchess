class game {
    constructor(flip=false) {
        this.board = []
        for (var j = 0; j < 8; j++) {
            var holder = []
            for (var i = 0; i < 8; i ++) {
                holder.push(null);
            }
            this.board.push(holder);
        }

        const c = [["b", "w"],["w","b"]];
        const colors = c[flip*1];

        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 8; j++) {
                this.board[1+i*5][j] = new piece(j,1+i*5,"pawn",colors[i])
            }
        }

        //old pawn gen
        /*for (var i = 0; i < 8; i++) {
            this.board[6][i] = new piece(i,6,"pawn","w")
        }
        for (var i = 0; i < 8; i++) {
            this.board[1][i] = new piece(i,1,"pawn","b")
        }*/
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

    pawnMoves(p,x,y) {
        var dir = -1;
        var moves = [];

        // acceptable if the board is not flipped.
        /*if (p.color == "w") {
            dir = -1;
        }*/
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
        return moves;
    }

    getMoves(x, y) {
        var p = this.board[y][x];
        if (p.name == "pawn") {
            return this.pawnMoves(p,x,y);
        } else if (p.name == "rook") {
            return this.straight(p,x,y);
        } else if (p.name == "queen") {
            var s = this.straight(p,x,y);
            var d = this.diagonal(p,x,y);
            for (var i = 0; i < d.length; i++) {
                s.push(d[i]);
            }
            return s;
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
        this.board[toy][tox] = new piece(toy,tox,p.name,p.color);
        this.board[fromy][fromx] = null;
        this.board[toy][tox].moved = true;
        if (p.name == "pawn") { // handles promoting
            if (toy == 0 || toy == 7) {
                this.board[toy][tox] = new piece(tox,toy,"queen",p.color); // could add option to select piece
            }
        }
        prev = [[fromx,fromy],[tox,toy]];
        turn = !turn*1;
    }
}

class piece {
    constructor(x,y,n,c) {
        this.x = x;
        this.y = y;
        this.name = n;
        this.color = c
        this.img = new Image();
        this.img.src = "assets/" + this.color + this.name + ".png";
        this.moved = false;
    }
}