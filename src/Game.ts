import { Camera, Sprite, Texture, WebGLRenderer } from "./render";

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
	sprites = new Set<Sprite>();
	private _draw: () => void;

	public readonly fairies: Sprite[] = [];

	constructor(
		public readonly wrap: HTMLElement,
		readonly options: Options = {},
	) {
		this.canvas = document.createElement("canvas");
		wrap.append(this.canvas);

		this.render = new WebGLRenderer(this);
		this.cameraMain = new Camera(this);
		window.addEventListener("resize", this.resize.bind(this));
		setTimeout(this.resize.bind(this));

		this._draw = this.draw.bind(this);
		requestAnimationFrame(this._draw);

		for (let i = 0; i < 1024; i++) {
			const fairy = new Sprite();
			fairy.w = 64;
			fairy.h = 64;
			fairy.i = (Math.random() * 4) | 0;
			fairy.tile = (Math.random() * 4) | 0;
			fairy.texture = this.render.testSprite;
			fairy.x = Math.random() * 1600 + 100;
			fairy.y = Math.random() * 900 + 100;
			fairy.vx = (Math.random() - 0.5) * 3;
			fairy.vy = (Math.random() - 0.5) * 3;
			this.fairies.push(fairy);
		}
	}

	protected update() {
		for (const f of this.fairies) {
			if (--f.i < 0) {
				f.i = 4;
				f.tile = ++f.tile % 4;
			}
			f.x += f.vx;
			f.y += f.vy;

			if (f.x < 32) {
				f.x = 32;
				f.vx *= -1;
			}
			if (f.x > this.width - 32) {
				f.x = this.width - 32;
				f.vx *= -1;
			}

			if (f.y < 32) {
				f.y = 32;
				f.vy *= -1;
			}
			if (f.y > this.height - 32) {
				f.y = this.height - 32;
				f.vy *= -1;
			}
		}
	}

	protected draw() {
		requestAnimationFrame(this._draw);
		if (!document.hasFocus()) {
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
	}
}
