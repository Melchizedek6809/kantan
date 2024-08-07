import { Camera, WebGLRenderer } from "./render";

export interface Options {}

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
	private _draw: () => void;

	constructor(
		public readonly wrap: HTMLElement,
		readonly options: Options = {},
	) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = 640;
		this.canvas.height = 400;
		wrap.append(this.canvas);

		this.render = new WebGLRenderer(this);
		this.cameraMain = new Camera(this);

		this._draw = this.draw.bind(this);
		requestAnimationFrame(this._draw);
	}

	protected draw() {
		requestAnimationFrame(this._draw);
		this.frames++;
		this.updateFPS();
		this.render.draw(this.cameraMain);
	}

	private updateFPS() {
		const now = +new Date();
		this.fpsCounter++;
		if (now > this.fpsLastUpdate + 1000) {
			this.fpsLastUpdate = now;
			this.fps = this.fpsCounter;
			this.fpsCounter = 0;
		}
	}

	protected resize() {
		this.width = window.innerWidth | 0;
		this.height = window.innerHeight | 0;
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.render.resize();
	}
}
