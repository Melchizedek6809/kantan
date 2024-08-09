import { Game, Sprite, Texture } from 'gameEngine';

export class Fairy extends Sprite {
	i = 0;

}

export class Example extends Game {
	public readonly fairies: Fairy[] = [];

	constructor(
		public readonly wrap: HTMLElement,
	) {
		super(wrap);

		const testSprite = new Texture(this.render, "fairy", "/fairy.png", "2D");
		testSprite.widthInTiles = 2;
		testSprite.heightInTiles = 2;

		for (let i = 0; i < 256; i++) {
			const fairy = new Fairy();
			fairy.w = 128;
			fairy.h = 128;
			fairy.r = Math.random() * Math.PI*2;
			fairy.i = (Math.random() * 4) | 0;
			fairy.tile = (Math.random() * 4) | 0;
			fairy.texture = testSprite;
			fairy.x = Math.random() * 1600 + 100;
			fairy.y = Math.random() * 900 + 100;
			fairy.vx = (Math.random() - 0.5) * 5;
			fairy.vy = (Math.random() - 0.5) * 5;
			this.fairies.push(fairy);
		}
	}

	protected update() {
		for (const f of this.fairies) {
			if (--f.i < 0) {
				f.i = 4;
				f.tile = ++f.tile % 4;
			}
			f.r += 0.05;
			f.x += f.vx;
			f.y += f.vy;
			f.vy += 0.1;

			if (f.x < 32) {
				f.x = 32;
				f.vx *= -0.9;
			}
			if (f.x > this.width - 32) {
				f.x = this.width - 32;
				f.vx *= -0.9;
			}

			if (f.y < 32) {
				f.y = 32;
				f.vy *= -0.9;
			}
			if (f.y > this.height - 32) {
				f.y = this.height - 32;
				f.vy *= -0.9;
			}
		}
	}
}

const wrap = document.querySelector<HTMLElement>("#app");
if(!wrap){
	throw new Error("Can't query #app wrapper");
} else {
	new Example(wrap);
}