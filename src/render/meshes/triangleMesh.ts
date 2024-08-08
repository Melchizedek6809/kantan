/* Copyright 2024 - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see /LICENSE
 */
import { mat4 } from "gl-matrix";

import shaderFragSource from "./triangleMesh.frag?raw";
import shaderVertSource from "./triangleMesh.vert?raw";

import type { Texture } from "../texture";
import { Shader } from "../shader";
import { WavefrontFile, WavefrontObject } from "../../util/objLoader";

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

	static fromObjFile(objSource: string, tex: Texture): TriangleMesh {
		const mesh = new TriangleMesh(tex);
		const obj = new WavefrontFile(objSource);
		mesh.addObj(obj.objects[0]);
		mesh.finish();
		return mesh;
	}

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
		const vao = texture.gl.createVertexArray();
		if (!vao) {
			throw new Error("Couldn't create VAO");
		}
		this.vao = vao;
		this.texture = texture;
	}

	addObj(obj: WavefrontObject) {
		for (const f of obj.faces) {
			const pos = obj.positions[f.positionIndex];
			this.vertices.push(pos[0]);
			this.vertices.push(pos[1]);

			if (f.textureCoordinateIndex === undefined) {
				throw new Error("Missing texture coordinates");
			}
			const tex = obj.textureCoordinates[f.textureCoordinateIndex];
			this.vertices.push(tex[0]);
			this.vertices.push(1.0 - tex[1]); // Gotta flip them
		}
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
		const s = w * 0.5;
		const d = Math.sqrt(s * s + s * s);

		const ax = Math.cos(r) * d;
		const ay = Math.sin(r) * d;

		const bx = Math.cos(r + Math.PI * 0.5) * d;
		const by = Math.sin(r + Math.PI * 0.5) * d;

		const cx = Math.cos(r + Math.PI * 1.5) * d;
		const cy = Math.sin(r + Math.PI * 1.5) * d;

		const dx = Math.cos(r + Math.PI) * d;
		const dy = Math.sin(r + Math.PI) * d;

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
