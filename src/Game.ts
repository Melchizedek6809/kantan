export interface Options {}

export class Game {
	public canvas: HTMLCanvasElement;
	public ctx: WebGL2RenderingContext;
	public frames = 0;

	private _draw: () => void;

	constructor(
		public readonly wrap: HTMLElement,
		readonly options: Options = {},
	) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = 640;
		this.canvas.height = 400;
		wrap.append(this.canvas);

		const ctx = this.canvas.getContext("webgl2");
		if (!ctx) {
			throw new Error("Can't create WebGL2 Context");
		}
		this.ctx = ctx;

		setTimeout(this.init.bind(this));
		this._draw = this.draw.bind(this);
		requestAnimationFrame(this._draw);
	}

	protected init() {}

	protected draw() {
		this.frames++;
		requestAnimationFrame(this._draw);

		const gl = this.ctx;
		gl.clearColor(0.5, 0.5, Math.abs(Math.sin(this.frames * 0.03)), 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
}
