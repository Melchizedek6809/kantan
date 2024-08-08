import { mat4 } from "gl-matrix";
import type { Game } from "../game";
import type { Camera } from "./camera";
import { TriangleMesh } from "./meshes";
import { Texture } from "./texture";

const mvp = mat4.create();

export class WebGLRenderer {
	public readonly gl: WebGL2RenderingContext;
	public readonly testSprite: Texture;

	constructor(public readonly game: Game) {
		const gl = game.canvas.getContext("webgl2");
		if (!gl) {
			throw new Error("Can't create WebGL2 context");
		}
		this.gl = gl;
		this.testSprite = new Texture(gl, "fairy", "/fairy.png", "2D");
		this.testSprite.widthInTiles = 2;
		this.testSprite.heightInTiles = 2;
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
		this.testSprite.draw(mvp);
	}

	resize() {
		this.gl.viewport(0, 0, this.game.width, this.game.height);
	}
}
