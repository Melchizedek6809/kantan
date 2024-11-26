/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import { Camera, Sprite, Texture, WebGLRenderer } from "./render";

export class Game {
	canvas: HTMLCanvasElement;
	frames = 0;
	fps = 0;
	width = 640;
	height = 400;

	readonly render: WebGLRenderer;
	cameraMain: Camera;

	private fpsCounter = 0;
	private fpsLastUpdate = 0;
	sprites = new Set<Sprite>();
	private _draw: () => void;

	constructor(public readonly wrap: HTMLElement) {
		this.canvas = document.createElement("canvas");
		wrap.append(this.canvas);

		this.render = new WebGLRenderer(this);
		this.cameraMain = new Camera(this);
		window.addEventListener("resize", this.resize.bind(this));
		setTimeout(this.resize.bind(this));

		this._draw = this.draw.bind(this);
		requestAnimationFrame(this._draw);
	}

	protected update() {
		for (const s of Sprite.set.values()) {
			s.update();
		}
	}

	protected draw() {
		requestAnimationFrame(this._draw);
		if (!document.hasFocus()) {
			return;
		}
		if (!Texture.allLoaded()) {
			return;
		}
		this.frames++;
		this.updateFPS();
		this.render.draw(this.cameraMain);
		this.update();
	}

	private updateFPS() {
		const now = +new Date();
		this.fpsCounter++;
		if (now > this.fpsLastUpdate + 1000) {
			this.fpsLastUpdate = now;
			this.fps = this.fpsCounter;
			this.fpsCounter = 0;
			console.log(`FPS: ${this.fps}`);
		}
	}

	protected resize() {
		const ratio = window.devicePixelRatio || 1;
		this.width = (window.innerWidth | 0) * ratio;
		this.height = (window.innerHeight | 0) * ratio;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.cameraMain.width = this.width;
		this.cameraMain.height = this.height;

		this.render.resize();
		this.cameraMain.resize();
	}
}
