/* Copyright 202X - Benjamin Vincent Schulenburg
 * Licensed under the MIT license, for the full text see: /LICENSE
 */
import { Camera, Sprite, Texture, WebGLRenderer } from "./render";
import { InputContext } from "./input";
import { AudioContext } from "./audio";

export class Game {
	canvas: HTMLCanvasElement;
	frames = 0;
	fps = 0;
	width = 640;
	height = 400;

	// Time tracking for deterministic updates
	private lastTime = 0;
	private accumulator = 0;
	readonly FIXED_TIMESTEP = 1000 / 60; // 60 FPS fixed timestep

	readonly render: WebGLRenderer;
	readonly input: InputContext;
	readonly audio: AudioContext;
	cameraMain: Camera;

	private fpsCounter = 0;
	private fpsLastUpdate = 0;
	sprites = new Set<Sprite>();
	private _draw: (timestamp: number) => void;

	// Pause state
	private _isPaused = false;

	constructor(public readonly wrap: HTMLElement) {
		this.canvas = document.createElement("canvas");
		wrap.append(this.canvas);

		this.input = new InputContext(this);
		this.audio = new AudioContext(this);
		this.render = new WebGLRenderer(this);
		this.cameraMain = new Camera(this);
		window.addEventListener("resize", this.resize.bind(this));

		// Handle visibility changes to pause/unpause
		document.addEventListener(
			"visibilitychange",
			this.handleVisibilityChange.bind(this),
		);

		setTimeout(this.resize.bind(this));

		this._draw = this.draw.bind(this);
		requestAnimationFrame(this._draw);
	}

	get isPaused(): boolean {
		return this._isPaused;
	}

	set isPaused(value: boolean) {
		this._isPaused = value;
	}

	private handleVisibilityChange() {
		// Auto-pause when tab is not visible
		this._isPaused = document.hidden;
	}

	protected fixedUpdate() {
		// This runs at a fixed timestep regardless of frame rate
		for (const s of Sprite.set.values()) {
			s.update();
		}
	}

	protected variableUpdate(_deltaTime: number) {
		// This runs every frame with the actual delta time
		// Useful for visual effects or things that don't need fixed timestep
		// Prefix with underscore to indicate it's not used yet but available for subclasses
	}

	protected draw(timestamp: number) {
		requestAnimationFrame(this._draw);

		// Skip if paused or not focused
		if (this._isPaused || !document.hasFocus() || !Texture.allLoaded()) {
			return;
		}

		// Calculate delta time and update at fixed timestep
		if (this.lastTime === 0) {
			this.lastTime = timestamp;
		}

		const deltaTime = timestamp - this.lastTime;
		this.lastTime = timestamp;

		// Add delta time to accumulator
		this.accumulator += deltaTime;

		// Run fixed update as many times as needed to catch up
		while (this.accumulator >= this.FIXED_TIMESTEP) {
			this.fixedUpdate();
			this.accumulator -= this.FIXED_TIMESTEP;
		}

		// Run variable update once per frame
		this.variableUpdate(deltaTime);

		// Track frames and FPS
		this.frames++;
		this.updateFPS();

		// Render
		this.render.draw(this.cameraMain);
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
