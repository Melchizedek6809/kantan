import type { Game } from "../game";
import { Howl } from "howler";

export class AudioContext {
	private sounds: Map<string, Howl> = new Map();

	constructor(public readonly game: Game) {}

	/**
	 * Play a sound file. Multiple instances of the same sound can play simultaneously.
	 * @param audioFile The path to the audio file
	 * @param volume Volume level from 0.0 to 1.0
	 * @returns The sound ID that can be used to control the specific sound instance
	 */
	play(audioFile: string, volume = 1): number {
		// Reuse existing Howl instances to prevent memory leaks
		let sound = this.sounds.get(audioFile);

		if (!sound) {
			sound = new Howl({
				src: [audioFile],
				volume,
				// Allow multiple playbacks of the same sound
				// This is the key setting to enable multiple plays
				pool: 5,
			});
			this.sounds.set(audioFile, sound);
		} else {
			// Update volume in case it changed
			sound.volume(volume);
		}

		// play() returns a sound ID we can use to control this specific instance
		return sound.play();
	}

	/**
	 * Stop a specific sound instance
	 * @param audioFile The path to the audio file
	 * @param id The sound ID returned from play()
	 * @returns True if successful, false if sound not found
	 */
	stop(audioFile: string, id?: number): boolean {
		const sound = this.sounds.get(audioFile);
		if (!sound) return false;

		if (id !== undefined) {
			// Stop specific instance
			sound.stop(id);
		} else {
			// Stop all instances of this sound
			sound.stop();
		}

		return true;
	}
}
