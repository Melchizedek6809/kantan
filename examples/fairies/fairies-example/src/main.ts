import { Game } from 'gameEngine';

const wrap = document.querySelector<HTMLElement>("#app");
if(!wrap){
	throw new Error("Can't query #app wrapper");
} else {
	new Game(wrap);
}