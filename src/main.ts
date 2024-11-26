import { Game, Sprite, Texture } from "./lib";

export class Fairy extends Sprite {
	i = 0;

	constructor(tex: Texture) {
		super();
		this.w = 128;
		this.h = 128;
		this.texture = tex;
		this.r = Math.random() * Math.PI * 2;
		this.tile = (Math.random() * 4) | 0;
		this.x = Math.random() * 1600 + 100;
		this.y = Math.random() * 900 + 100;
		this.vx = (Math.random() - 0.5) * 5;
		this.vy = (Math.random() - 0.5) * 5;

		this.i = (Math.random() * 4) | 0;
	}

	update() {
		super.update();

		const game = this.texture?.renderer.game;
		if (!game) {
			return;
		}

		if (--this.i < 0) {
			this.i = 4;
			this.tile = ++this.tile % 4;
		}
		this.r += 0.05;
		this.vy += 0.1;

		if (this.x < 32) {
			this.x = 32;
			this.vx *= -0.9;
		}
		if (this.x > game.width - 32) {
			this.x = game.width - 32;
			this.vx *= -0.9;
		}

		if (this.y < 32) {
			this.y = 32;
			this.vy *= -0.9;
		}
		if (this.y > game.height - 32) {
			this.y = game.height - 32;
			this.vy *= -0.9;
		}
	}
}

export class Example extends Game {
	public readonly testSprite: Texture;

	constructor(public readonly wrap: HTMLElement) {
		super(wrap);

		this.testSprite = new Texture(
			this.render,
			"fairy",
			"/fairy.png",
			"2D",
			2,
			2,
		);
		for (let i = 0; i < 256; i++) {
			new Fairy(this.testSprite);
		}
	}
}

const wrap = document.querySelector<HTMLElement>("#app");
if (!wrap) {
	throw new Error("Can't query #app wrapper");
} else {
	new Example(wrap);
}
