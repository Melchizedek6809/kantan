import type { Game } from "../game";
import type { Texture } from "./texture";

export class Sprite {
	private _texture?: Texture;
	private _game?: Game;
	x = 0;
	y = 0;
	w = 0;
	h = 0;

	vx = 0;
	vy = 0;
	i = 0;
	ii = 0;

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

	set game(game: Game | undefined) {
		if (this._game) {
			this._game.sprites.delete(this);
		}
		this._game = game;
		if (game) {
			game.sprites.add(this);
		}
	}

	get game(): Game | undefined {
		return this._game;
	}
}
