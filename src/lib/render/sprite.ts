/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import type { Game } from "../game";
import type { Texture } from "./texture";

export class Sprite {
	static set = new Set<Sprite>();

	private _texture?: Texture;
	readonly game: Game;

	x = 0;
	y = 0;

	w = 0;
	h = 0;

	vx = 0;
	vy = 0;

	r = 0;
	tile = 0;

	set texture(texture: Texture | undefined) {
		if (this._texture) {
			this._texture.sprites.delete(this);
		}
		this._texture = texture;
		if (texture) {
			texture.sprites.add(this);
		}
	}

	get texture(): Texture | undefined {
		return this._texture;
	}

	constructor(game: Game) {
		this.game = game;
		this.game.sprites.add(this);
		Sprite.set.add(this);
	}

	public destroy() {
		Sprite.set.delete(this);
	}

	public update() {
		this.x += this.vx;
		this.y += this.vy;
	}
}
