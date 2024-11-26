import type { Game } from "../game";
import { Howl } from "howler";

export class AudioContext {
	constructor(public readonly game: Game) {}

	play(audioFile: string, volume = 1) {
		const howl = new Howl({
			src: [audioFile],
			volume,
		});
		howl.play();
	}
}
