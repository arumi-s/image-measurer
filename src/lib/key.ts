import { readable } from 'svelte/store';

export function pressedKey(key: 'shiftKey' | 'ctrlKey' | 'altKey') {
	return readable(false, (set) => {
		function handler(e: KeyboardEvent) {
			set(e[key]);
		}

		const controller = new AbortController();

		window.addEventListener('keydown', handler, {
			signal: controller.signal
		});
		window.addEventListener('keyup', handler, {
			signal: controller.signal
		});

		return () => {
			set(false);
			controller.abort();
		};
	});
}
