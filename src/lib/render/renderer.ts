/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import { mat4 } from "gl-matrix";
import type { Game } from "../game";
import type { Camera } from "./camera";
import type { Texture } from "./texture";
import { TriangleMesh } from "./meshes";

const mvp = mat4.create();

export class WebGLRenderer {
	public readonly gl: WebGL2RenderingContext;
	public readonly textures = new Set<Texture>();

	// Track if the renderer needs to be resized
	private needsResize = false;

	constructor(public readonly game: Game) {
		const gl = game.canvas.getContext("webgl2", {
			// Enable antialiasing for smoother graphics
			antialias: true,
			// Optimize for performance (disable preserveDrawingBuffer)
			preserveDrawingBuffer: false,
			// Enable premultiplied alpha for better blending
			premultipliedAlpha: true,
			// Disable stencil buffer for better performance
			stencil: false,
		});

		if (!gl) {
			throw new Error("Can't create WebGL2 context");
		}
		this.gl = gl;
		this.initGLContext();

		// Set up resize observer for more efficient resizing
		const resizeObserver = new ResizeObserver(this.handleResize.bind(this));
		resizeObserver.observe(game.canvas);
	}

	private handleResize() {
		this.needsResize = true;
	}

	initGLContext() {
		const gl = this.gl;

		// Enable culling for better performance
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		// Enable blending for transparency
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Set clear color
		gl.clearColor(0.09, 0.48, 1, 1);

		// Disable depth test for 2D rendering
		gl.disable(gl.DEPTH_TEST);

		// Initialize triangle mesh system
		TriangleMesh.init(gl);
	}

	draw(cam: Camera) {
		// Check if we need to resize the canvas before drawing
		if (this.needsResize) {
			this.resize();
			this.needsResize = false;
		}

		const gl = this.gl;

		// Clear the canvas
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Set up camera projection
		cam.matrixOrtho(mvp);

		// Draw all textures
		// Future optimization: sort sprites by z-index and batch by texture
		for (const texture of this.textures.values()) {
			texture.draw(mvp);
		}
	}

	resize() {
		this.gl.viewport(0, 0, this.game.width, this.game.height);
	}
}
