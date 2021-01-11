class player {
    constructor(ip, id, num, socket) {
        this.ip = ip;
        this.id = id;
        this.num = num; // tracks which player should be each color

        this.ingame = false;
        this.ingamewith = null;

        this.color = null; // 0 will be white 1 is black.

        this.socket = socket;
    }
}

module.exports = player;