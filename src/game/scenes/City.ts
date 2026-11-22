import { GameObjects, Input, Scene } from 'phaser';

const side = 18;
const stops = [
    { x: 5, y: 6, name: 'Apartment', color: 0xe89b6c, height: 71 },
    { x: 10, y: 6, name: 'Dispatch', color: 0x71bcb3, height: 85 },
    { x: 10, y: 10, name: 'Kiosk', color: 0xf3c76c, height: 47 }
];

function project(x: number, y: number) {
    return { x: 650 + (x - y) * 34, y: 120 + (x + y) * 17 };
}

function face(g: GameObjects.Graphics, color: number, points: number[][]) {
    g.fillStyle(color).beginPath();
    points.forEach(([x, y], index) => {
        if (index === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
    });
    g.closePath().fillPath();
}

function solid(x: number, y: number) {
    return stops.some(stop => Math.abs(stop.x - x) < 0.7 && Math.abs(stop.y - y) < 0.7);
}

export class City extends Scene {
    private x = 7;
    private y = 8;
    private minutes = 8 * 60;
    private energy = 80;
    private money = 100;
    private parcel = false;
    private completed = false;
    private message = 'Pick up a parcel at Dispatch.';
    private player!: GameObjects.Graphics;
    private keys!: Record<string, Input.Keyboard.Key>;
    private stats = document.querySelector<HTMLElement>('#stats')!;
    private task = document.querySelector<HTMLElement>('#task')!;
    private prompt = document.querySelector<HTMLElement>('#prompt')!;

    create() {
        const ground = this.add.graphics();
        for (let y = 0; y < side; y++) {
            for (let x = 0; x < side; x++) {
                const p = project(x, y);
                const road = x === 8 || y === 8;
                const paving = x === 7 || x === 9 || y === 7 || y === 9;
                const shade = (x + y) % 2;
                const color = road ? 0x3c5662 : paving ? 0xa6a596 : shade ? 0x527e68 : 0x56836c;
                face(ground, color, [[p.x, p.y - 17], [p.x + 34, p.y], [p.x, p.y + 17], [p.x - 34, p.y]]);
                if (road && shade && (x !== 8 || y !== 8)) {
                    ground.lineStyle(2, 0xe8cb8c).lineBetween(p.x - 10, p.y + (x === 8 ? 5 : -5), p.x + 10, p.y + (x === 8 ? -5 : 5));
                }
            }
        }

        for (const stop of stops) {
            const p = project(stop.x, stop.y);
            const h = stop.height;
            const g = this.add.graphics({ x: p.x, y: p.y }).setDepth(p.y + 12);
            face(g, 0x344e55, [[-34, 0], [0, 16], [34, 0], [0, -16]]);
            face(g, stop.color, [[-30, 0], [0, 15], [0, 15 - h], [-30, -h]]);
            face(g, 0x536674, [[0, 15], [30, 0], [30, -h], [0, 15 - h]]);
            face(g, stop.color, [[-30, -h], [0, 15 - h], [30, -h], [0, -15 - h]]);
            face(g, 0xffe6b6, [[-21, -h + 3], [0, 13 - h], [21, -h + 3], [0, -h - 7]]);
            for (let floor = 24; floor < h - 12; floor += 17) {
                face(g, 0x223a49, [[-23, -floor], [-8, 7 - floor], [-8, -1 - floor], [-23, -8 - floor]]);
                face(g, 0xa9e0d5, [[7, 8 - floor], [23, -floor], [23, -8 - floor], [7, -floor]]);
            }
            face(g, 0x213c48, [[6, 12], [17, 6], [17, -10], [6, -4]]);
            this.add.text(p.x, p.y - h - 34, stop.name, {
                fontFamily: 'system-ui', fontSize: '14px', color: '#fff7db',
                backgroundColor: '#203b46', padding: { x: 7, y: 3 }
            }).setOrigin(0.5).setDepth(2000);
        }

        const p = project(this.x, this.y);
        this.player = this.add.graphics({ x: p.x, y: p.y });
        this.player.fillStyle(0x213b44, 0.55).fillEllipse(0, 0, 24, 11);
        this.player.fillStyle(0x243e51).fillRoundedRect(-7, -13, 14, 14, 3);
        this.player.fillStyle(0xf2ae59).fillRoundedRect(-9, -23, 18, 17, 5);
        this.player.fillStyle(0xc58564).fillCircle(0, -26, 6);
        this.player.fillStyle(0x233b50).fillEllipse(0, -30, 15, 7);
        this.cameras.main.centerOn(p.x, p.y);
        this.cameras.main.startFollow(this.player, false, 0.12, 0.12);

        this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT,E', true) as typeof this.keys;
        this.refresh();
    }

    update(_time: number, delta: number) {
        const { W, A, S, D, UP, LEFT, DOWN, RIGHT, E } = this.keys;
        const horizontal = Number(D.isDown || RIGHT.isDown) - Number(A.isDown || LEFT.isDown);
        const vertical = Number(S.isDown || DOWN.isDown) - Number(W.isDown || UP.isDown);
        const seconds = Math.min(delta, 40) / 1000;
        this.minutes += seconds * 2;
        if (horizontal || vertical) {
            const speed = 2.9 * seconds / Math.hypot(horizontal, vertical);
            // Invert the isometric projection so the controls follow the screen axes.
            const nextX = Math.max(0, Math.min(side - 1, this.x + (horizontal / 2 + vertical) * speed));
            const nextY = Math.max(0, Math.min(side - 1, this.y + (-horizontal / 2 + vertical) * speed));
            const oldX = this.x;
            const oldY = this.y;
            if (!solid(nextX, this.y)) this.x = nextX;
            if (!solid(this.x, nextY)) this.y = nextY;
            this.energy = Math.max(0, this.energy - Math.hypot(this.x - oldX, this.y - oldY) * 0.4);
        }

        const p = project(this.x, this.y);
        this.player.setPosition(p.x, p.y).setDepth(p.y);
        const nearby = stops
            .map(stop => ({ name: stop.name, distance: Math.hypot(this.x - stop.x, this.y - stop.y) }))
            .filter(stop => stop.distance < 1.35)
            .sort((a, b) => a.distance - b.distance)[0];

        if (nearby && Input.Keyboard.JustDown(E)) this.interact(nearby.name);
        // Consume presses outside interaction range to require a fresh press near a stop.
        if (!nearby) Input.Keyboard.JustDown(E);
        this.refresh(nearby?.name);
    }

    private interact(name: string) {
        if (name === 'Apartment') {
            this.energy = 100;
            this.minutes += 30;
            this.message = 'Rested at home. Energy restored.';
        } else if (name === 'Dispatch' && !this.completed) {
            this.parcel = true;
            this.message = 'Parcel collected. Take it to the Kiosk.';
        } else if (name === 'Kiosk' && this.parcel) {
            this.parcel = false;
            this.completed = true;
            this.money += 50;
            this.message = 'Delivered! You earned ₱50.';
        } else if (this.completed) {
            this.message = 'Delivery complete. Explore the block or rest at home.';
        } else {
            this.message = 'Kiosk: We’re expecting a parcel from Dispatch.';
        }
    }

    private refresh(nearby?: string) {
        const minute = Math.floor(this.minutes);
        const hour = String(Math.floor(minute / 60) % 24).padStart(2, '0');
        const clock = `${hour}:${String(minute % 60).padStart(2, '0')}`;
        const stats = `Day ${Math.floor(minute / 1440) + 1} · ${clock}  /  Energy ${Math.ceil(this.energy)}%  /  ₱${this.money}`;
        const objective = this.completed ? 'Delivery complete' : this.parcel ? 'Deliver the parcel to the Kiosk' : 'Collect a parcel at Dispatch';
        const task = `${objective} — ${this.message}`;
        const prompt = nearby ? `E · ${nearby}` : 'WASD / Arrows · Move';
        if (this.stats.textContent !== stats) this.stats.textContent = stats;
        if (this.task.textContent !== task) this.task.textContent = task;
        if (this.prompt.textContent !== prompt) this.prompt.textContent = prompt;
    }
}
