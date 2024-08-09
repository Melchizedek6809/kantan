import { mat4 } from "gl-matrix";
import type { Game } from "../game";

export class Camera {
	x = 0;
	y = 0;
	width = 640;
	height = 400;

	constructor(private readonly game: Game) {}

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
