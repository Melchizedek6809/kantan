import type { Game } from "../game";

export class WebGLRenderer {
	public readonly gl: WebGL2RenderingContext;

	constructor(public readonly game: Game) {
		const gl = game.canvas.getContext("webgl2");
		if (!gl) {
			throw new Error("Can't create WebGL2 context");
		}
		this.gl = gl;
	}

	initGLContext() {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.clearColor(0.09, 0.478, 1, 1);
	}

	draw() {
		const gl = this.gl;
		gl.clearColor(0.5, 0.5, Math.abs(Math.sin(this.game.frames * 0.03)), 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	resize() {
		this.gl.viewport(0, 0, this.game.canvas.width, this.game.canvas.height);
	}
}
