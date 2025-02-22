import { deepEqual } from 'fast-equals';
import rfdc from 'rfdc';
import { derived, get, writable } from 'svelte/store';

const clone = rfdc({ proto: false });

/**
 * Optimized from https://github.com/samthor/undoer/
 */

export function createUndoer<T>(zero: T) {
	const stack: T[] = [zero];
	let inputPromiseResolve: (() => void) | null = null;
	const ctrl = document.createElement('div');

	const depth = writable(0, (set) => {
		ctrl.setAttribute('aria-hidden', 'true');
		ctrl.style.position = 'fixed';
		ctrl.style.width = '1px';
		ctrl.style.height = '1px';
		ctrl.style.padding = '0';
		ctrl.style.margin = '-1px';
		ctrl.style.overflow = 'hidden';
		ctrl.style.clip = 'rect(0, 0, 0, 0)';
		ctrl.style.whiteSpace = 'nowrap';
		ctrl.style.borderWidth = '0';
		ctrl.style.pointerEvents = 'none';
		ctrl.tabIndex = -1;

		ctrl.contentEditable = 'true';
		ctrl.textContent = '0';
		ctrl.style.visibility = 'hidden';

		ctrl.addEventListener('focus', () => {
			// Safari needs us to wait, can't blur immediately.
			setTimeout(() => void ctrl.blur(), 0);
		});

		ctrl.addEventListener('input', () => {
			set(parseInt(ctrl.textContent ?? '', 10) || 0);

			// clear selection, otherwise user copy gesture will copy value
			// nb. this _probably_ won't work inside Shadow DOM
			// nb. this is mitigated by the fact that we set visibility: 'hidden'
			const s = window.getSelection();
			if (s?.containsNode(ctrl, true)) {
				s.removeAllRanges();
			}

			inputPromiseResolve?.();
		});

		document.body.appendChild(ctrl);

		return () => {
			ctrl.remove();
		};
	});
	const data = derived(depth, ($depth) => clone(stack[$depth]));

	async function set(value: T) {
		const currentDepth = get(depth);
		const nextID = currentDepth + 1;
		const oldData = stack[currentDepth];
		if (deepEqual(oldData, value)) {
			return;
		}

		stack.splice(nextID, stack.length - nextID, clone(value));

		const previousFocus = document.activeElement;
		try {
			await new Promise<void>((resolve) => {
				inputPromiseResolve = resolve;
				ctrl.style.removeProperty('visibility');
				ctrl.focus();
				document.execCommand('selectAll');
				document.execCommand('insertText', false, `${nextID}`);
			});
		} finally {
			ctrl.style.setProperty('visibility', 'hidden');
		}

		if (previousFocus instanceof HTMLElement) {
			previousFocus.focus();
		}
	}

	const canUndo = derived(depth, ($depth) => $depth > 0);
	const canRedo = derived(depth, ($depth) => $depth < stack.length - 1);

	return {
		set,
		subscribe: data.subscribe,
		undo: () => depth.update(($depth) => Math.max(0, $depth - 1)),
		redo: () => depth.update(($depth) => Math.min(stack.length - 1, $depth + 1)),
		canUndo,
		canRedo
	};
}
