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

	// Track previous values to detect changes
	private _prevX = 0;
	private _prevY = 0;
	private _prevR = 0;
	private _prevTile = 0;

	set texture(texture: Texture | undefined) {
		if (this._texture) {
			this._texture.removeSprite(this);
		}
		this._texture = texture;
		if (texture) {
			texture.addSprite(this);
		}
	}

	get texture(): Texture | undefined {
		return this._texture;
	}

	constructor(game: Game) {
		this.game = game;
		this.game.sprites.add(this);
		Sprite.set.add(this);

		// Initialize previous values
		this._prevX = this.x;
		this._prevY = this.y;
		this._prevR = this.r;
		this._prevTile = this.tile;
	}

	public destroy() {
		if (this._texture) {
			this._texture.removeSprite(this);
		}
		this.game.sprites.delete(this);
		Sprite.set.delete(this);
	}

	public update() {
		this.x += this.vx;
		this.y += this.vy;

		// Check if position, rotation or tile changed
		if (
			this.x !== this._prevX ||
			this.y !== this._prevY ||
			this.r !== this._prevR ||
			this.tile !== this._prevTile
		) {
			// Mark texture as dirty if it exists
			if (this._texture) {
				this._texture.markDirty();
			}

			// Update previous values
			this._prevX = this.x;
			this._prevY = this.y;
			this._prevR = this.r;
			this._prevTile = this.tile;
		}
	}
}
