/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import type { mat4 } from "gl-matrix";
import type { Sprite } from "./sprite";
import type { WebGLRenderer } from "./renderer";
import { TriangleMesh } from "./meshes";
const isPowerOf2 = (value: number) => (value & (value - 1)) === 0;

type MaybeWebGLTexture = WebGLTexture | undefined;

// Convert these global variables to a class-based approach to avoid issues with multiple instances
class TextureState {
	static lastBoundTexture: MaybeWebGLTexture[] = [];
	static activeTextureUnit = 0;
	static texturesInFlight = 0;
	static texturesLoaded = 0;
}

export class Texture {
	readonly name: string;
	readonly texture: WebGLTexture;
	readonly type: "2D" | "2DArray";
	readonly renderer: WebGLRenderer;
	hasMipmap = false;

	widthInTiles = 1;
	heightInTiles = 1;

	sprites = new Set<Sprite>();
	mesh: TriangleMesh;

	// Keep track of dirty state to avoid recreating vertices when nothing changed
	private isDirty = true;

	static allLoaded(): boolean {
		return TextureState.texturesLoaded >= TextureState.texturesInFlight;
	}

	constructor(
		renderer: WebGLRenderer,
		name: string,
		url: string,
		type: "2D" | "2DArray" = "2D",
		widthInTiles = 1,
		heightInTiles = 1,
	) {
		this.renderer = renderer;
		this.name = name;
		this.type = type;
		this.widthInTiles = widthInTiles;
		this.heightInTiles = heightInTiles;

		const gl = this.renderer.gl;
		const texture = gl.createTexture();
		if (!texture) {
			throw new Error(`Couldn't create texture for ${name}`);
		}
		this.texture = texture;
		switch (type) {
			default:
			case "2D":
				this.loadTexture2D(url);
				break;
			case "2DArray":
				this.loadTexture2DArray(url);
				break;
		}
		this.mesh = new TriangleMesh(this);
		renderer.textures.add(this);
	}

	/**
	 * Mark the texture as needing to rebuild its vertices
	 */
	markDirty() {
		this.isDirty = true;
	}

	/**
	 * Add a sprite to this texture and mark it as dirty
	 */
	addSprite(sprite: Sprite) {
		this.sprites.add(sprite);
		this.markDirty();
	}

	/**
	 * Remove a sprite from this texture and mark it as dirty
	 */
	removeSprite(sprite: Sprite) {
		this.sprites.delete(sprite);
		this.markDirty();
	}

	draw(mvp: mat4) {
		const mesh = this.mesh;

		// Only rebuild vertices if something changed
		if (this.isDirty) {
			// Clear old vertices
			mesh.vertices.length = 0;

			const uw = 1 / this.widthInTiles;
			const vh = 1 / this.heightInTiles;

			for (const s of this.sprites.values()) {
				const u = ((s.tile % this.widthInTiles) | 0) * uw;
				const v = ((s.tile / this.widthInTiles) | 0) * vh;
				if (s.r) {
					mesh.addQuadRot(s.x, s.y, s.w, s.h, u, v, uw, vh, s.r);
				} else {
					mesh.addQuad(
						s.x - s.w * 0.5,
						s.y - s.h * 0.5,
						s.w,
						s.h,
						u,
						v,
						uw,
						vh,
					);
				}
			}

			mesh.finish();
			this.isDirty = false;
		}

		// Draw the mesh
		mesh.draw(mvp);
	}

	loadTexture2D(url: string) {
		TextureState.texturesInFlight++;
		const gl = this.renderer.gl;
		this.bind();

		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 2;
		const height = 2;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const pixel = new Uint8Array([255, 48, 128, 255]); // opaque pink
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			width,
			height,
			border,
			srcFormat,
			srcType,
			pixel,
		);

		const image = new Image();
		const that = this;
		image.onload = () => {
			that.bind();
			gl.texImage2D(
				gl.TEXTURE_2D,
				level,
				internalFormat,
				srcFormat,
				srcType,
				image,
			);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.generateMipmap(gl.TEXTURE_2D);
				that.hasMipmap = true;
			}
			that.nearest();
			that.clamp();
			TextureState.texturesLoaded++;
		};
		TextureState.lastBoundTexture[TextureState.activeTextureUnit] = this;
		image.src = url;
	}

	loadTexture2DArray(url: string) {
		TextureState.texturesInFlight++;
		const gl = this.renderer.gl;
		this.bind();

		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 1;
		const height = 1;
		const depth = 1;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const pixel = new Uint8Array([255, 48, 128, 255]); // opaque pink
		gl.texImage3D(
			gl.TEXTURE_2D_ARRAY,
			level,
			internalFormat,
			width,
			height,
			depth,
			border,
			srcFormat,
			srcType,
			pixel,
		);

		const image = new Image();
		const that = this;
		image.onload = () => {
			that.bind();
			const width = image.width | 0;
			const height = width;
			const depth = (image.height | 0) / height;
			gl.texImage3D(
				gl.TEXTURE_2D_ARRAY,
				level,
				internalFormat,
				width,
				height,
				depth,
				0,
				srcFormat,
				srcType,
				image,
			);

			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
				that.hasMipmap = true;
			}
			that.nearest();
			that.repeat();
			TextureState.texturesLoaded++;
		};
		TextureState.lastBoundTexture[TextureState.activeTextureUnit] = this;
		image.src = url;
	}

	target() {
		return this.type === "2DArray"
			? this.renderer.gl.TEXTURE_2D_ARRAY
			: this.renderer.gl.TEXTURE_2D;
	}

	clamp() {
		const gl = this.renderer.gl;
		const target = this.target();
		gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return this;
	}

	repeat() {
		const gl = this.renderer.gl;
		const target = this.target();
		gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT);
		return this;
	}

	linear() {
		this.bind();
		const target = this.target();
		const gl = this.renderer.gl;
		if (this.hasMipmap) {
			gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
			gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		} else {
			gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		return this;
	}

	nearest() {
		this.bind();
		const target = this.target();
		const gl = this.renderer.gl;
		if (this.hasMipmap) {
			gl.texParameteri(
				target,
				gl.TEXTURE_MIN_FILTER,
				gl.NEAREST_MIPMAP_NEAREST,
			);
			gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		} else {
			gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
		return this;
	}

	bind(unit = 0) {
		const gl = this.renderer.gl;
		if (TextureState.lastBoundTexture[unit] !== this.texture) {
			TextureState.lastBoundTexture[unit] = this.texture;
			if (unit !== TextureState.activeTextureUnit) {
				TextureState.activeTextureUnit = unit;
				gl.activeTexture(gl.TEXTURE0 + unit);
			}
			gl.bindTexture(this.target(), this.texture);
		}
		return this;
	}
}
