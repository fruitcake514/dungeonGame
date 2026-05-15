export class Dungeon {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = [];
    }

    generate() {
        this.map = Array(this.height).fill(0).map(() => Array(this.width).fill(1));
        const rooms = [];
        const roomCount = 11;
        const corridorHalfWidth = 1;

        const carveRect = (x, y, w, h) => {
            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++) {
                    if (yy <= 0 || xx <= 0 || yy >= this.height - 1 || xx >= this.width - 1) continue;
                    this.map[yy][xx] = 0;
                }
            }
        };

        const carveHall = (x1, y1, x2, y2) => {
            let x = x1;
            let y = y1;
            while (x !== x2) {
                x += x < x2 ? 1 : -1;
                carveRect(x - corridorHalfWidth, y - corridorHalfWidth, corridorHalfWidth * 2 + 1, corridorHalfWidth * 2 + 1);
            }
            while (y !== y2) {
                y += y < y2 ? 1 : -1;
                carveRect(x - corridorHalfWidth, y - corridorHalfWidth, corridorHalfWidth * 2 + 1, corridorHalfWidth * 2 + 1);
            }
        };

        let attempts = 0;
        while (rooms.length < roomCount && attempts < 260) {
            attempts += 1;
            const w = Phaser.Math.Between(8, 12);
            const h = Phaser.Math.Between(8, 12);
            const x = Phaser.Math.Between(2, this.width - w - 3);
            const y = Phaser.Math.Between(2, this.height - h - 3);
            const candidate = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };

            let overlaps = false;
            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                const separated =
                    candidate.x + candidate.w + 2 < room.x ||
                    room.x + room.w + 2 < candidate.x ||
                    candidate.y + candidate.h + 2 < room.y ||
                    room.y + room.h + 2 < candidate.y;
                if (!separated) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) continue;

            carveRect(candidate.x, candidate.y, candidate.w, candidate.h);
            rooms.push(candidate);
        }

        for (let i = 1; i < rooms.length; i++) {
            carveHall(rooms[i - 1].cx, rooms[i - 1].cy, rooms[i].cx, rooms[i].cy);
        }

        for (let i = 0; i < 3 && rooms.length > 3; i++) {
            const a = rooms[Phaser.Math.Between(0, rooms.length - 1)];
            const b = rooms[Phaser.Math.Between(0, rooms.length - 1)];
            if (a !== b) carveHall(a.cx, a.cy, b.cx, b.cy);
        }

        return this.map;
    }

    getRandomOpenTile() {
        let x = 0;
        let y = 0;
        let tries = 0;
        do {
            x = Phaser.Math.Between(1, this.width - 2);
            y = Phaser.Math.Between(1, this.height - 2);
            tries += 1;
            if (tries > 2000) return null;
        } while (this.map[y][x] !== 0);
        return { x, y };
    }
}
