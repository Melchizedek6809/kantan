/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import { mat4 } from "gl-matrix";

import shaderFragSource from "./triangleMesh.frag?raw";
import shaderVertSource from "./triangleMesh.vert?raw";

import type { Texture } from "../texture";
import { Shader } from "../shader";

export class TriangleMesh {
	static gl: WebGL2RenderingContext;
	static shader: Shader;

	vertices: number[] = [];
	elementCount = 0;
	texture: Texture;
	vao: WebGLVertexArrayObject;
	finished = false;
	size = {
		x: 0,
		y: 0,
		z: 0,
	};

	static init(glc: WebGL2RenderingContext) {
		this.gl = glc;
		this.shader = new Shader(
			this.gl,
			"textMesh",
			shaderVertSource,
			shaderFragSource,
			["cur_tex", "mat_mvp", "in_color"],
		);
	}

	constructor(texture: Texture) {
		const vao = texture.renderer.gl.createVertexArray();
		if (!vao) {
			throw new Error("Couldn't create VAO");
		}
		this.vao = vao;
		this.texture = texture;
	}

	addQuad(
		x: number,
		y: number,
		w: number,
		h: number,
		u: number,
		v: number,
		uw: number,
		vh: number,
	) {
		this.vertices.push(x, y, u, v);
		this.vertices.push(x + w, y + h, u + uw, v + vh);
		this.vertices.push(x + w, y, u + uw, v);

		this.vertices.push(x, y, u, v);
		this.vertices.push(x, y + h, u, v + vh);
		this.vertices.push(x + w, y + h, u + uw, v + vh);
	}

	addQuadRot(
		x: number,
		y: number,
		w: number,
		h: number,
		u: number,
		v: number,
		uw: number,
		vh: number,
		r: number,
	) {
		const sw = w * 0.5;
		const sh = h * 0.5;
		const d = Math.sqrt(sw * sw + sh * sh);

		const off = Math.PI * (3 / 4);
		const ax = Math.cos(r - off) * d;
		const ay = Math.sin(r - off) * d;

		const bx = -ay;
		const by = ax;

		const cx = ay;
		const cy = -ax;

		const dx = -ax;
		const dy = -ay;

		this.vertices.push(x + ax, y + ay, u, v);
		this.vertices.push(x + dx, y + dy, u + uw, v + vh);
		this.vertices.push(x + bx, y + by, u + uw, v);

		this.vertices.push(x + ax, y + ay, u, v);
		this.vertices.push(x + cx, y + cy, u, v + vh);
		this.vertices.push(x + dx, y + dy, u + uw, v + vh);
	}

	finish() {
		const gl = TriangleMesh.gl;

		gl.bindVertexArray(this.vao);

		const vertex_buffer = gl.createBuffer();
		if (!vertex_buffer) {
			throw new Error("Can't create new textMesh vertex buffer!");
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

		const float_arr = new Float32Array(this.vertices);
		gl.bufferData(gl.ARRAY_BUFFER, float_arr, gl.STATIC_DRAW);

		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
		gl.enableVertexAttribArray(0);

		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
		gl.enableVertexAttribArray(1);

		this.finished = true;
		this.elementCount = this.vertices.length / 4;
	}

	draw(mat_mvp: mat4) {
		const gl = TriangleMesh.gl;
		if (!this.finished) {
			throw new Error("Trying to draw unfinished mesh");
		}
		TriangleMesh.shader
			.bind()
			.uniform4fv("mat_mvp", mat_mvp)
			.uniform4f("in_color", 1, 1, 1, 1);

		this.texture.bind();
		gl.bindVertexArray(this.vao);
		gl.drawArrays(gl.TRIANGLES, 0, this.elementCount);
	}
}
