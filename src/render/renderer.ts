import { mat4 } from "gl-matrix";
import type { Game } from "../game";
import type { Camera } from "./camera";
import { TriangleMesh } from "./meshes";
import { Texture } from "./texture";
import { Sprite } from "./sprite";

const mvp = mat4.create();

export class WebGLRenderer {
	public readonly gl: WebGL2RenderingContext;
	public readonly testSprite: Texture[] = [];

	constructor(public readonly game: Game) {
		const gl = game.canvas.getContext("webgl2");
		if (!gl) {
			throw new Error("Can't create WebGL2 context");
		}
		this.gl = gl;
		this.testSprite.push(new Texture(gl, "fairy_0", "/fairy_0.png", "2D"));
		this.testSprite.push(new Texture(gl, "fairy_1", "/fairy_1.png", "2D"));
		this.testSprite.push(new Texture(gl, "fairy_2", "/fairy_2.png", "2D"));
		this.initGLContext();
	}

	initGLContext() {
		//this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.enable(this.gl.BLEND);
		this.gl.cullFace(this.gl.BACK);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.clearColor(0.09, 0.478, 1, 1);

		TriangleMesh.init(this.gl);
	}

	draw(cam: Camera) {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		cam.matrixOrtho(mvp);
		for (const tex of this.testSprite) {
			tex.draw(mvp);
		}
	}

	resize() {
		this.gl.viewport(0, 0, this.game.width, this.game.height);
	}
}
