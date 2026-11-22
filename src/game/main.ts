import { AUTO, Game, Scale } from 'phaser';
import { City } from './scenes/City';

export default function startGame(parent: string) {
    return new Game({
        type: AUTO,
        parent,
        width: 960,
        height: 600,
        backgroundColor: '#173440',
        scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
        scene: City
    });
}
