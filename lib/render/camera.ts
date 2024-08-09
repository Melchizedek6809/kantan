/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import { mat4 } from "gl-matrix";
import { Game } from "../game";

export class Camera {
	x = 0;
	y = 0;

	width = 640;
	height = 400;

	constructor(readonly game: Game) {}

	resize() {
		this.width = this.game.width;
		this.height = this.game.height;
	}

	matrixOrtho(out: mat4) {
		mat4.ortho(
			out,
			this.x,
			this.x + this.width,
			this.y + this.height,
			this.y,
			-100,
			100,
		);
	}
}
