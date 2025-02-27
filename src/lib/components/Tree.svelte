<script lang="ts">
	import type { MeasurementTree } from '$lib/Measurement';
	import { flip } from 'svelte/animate';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';

	export let items: MeasurementTree[];
	export let onUpdate: ((hierarchy: MeasurementTree[]) => void) | undefined = undefined;

	const flipDurationMs = 150;
	let element: HTMLElement;
	let parentElement: HTMLElement;
	let parentElementClassName: string = '';

	$: {
		if (element) {
			parentElement = element.parentElement!;
		}
	}
	$: {
		if (parentElement) {
			parentElementClassName = [...parentElement.classList.values()]
				.filter((c) => c.startsWith('grid-') || c.startsWith('bg-'))
				.join(' ');
		}
	}

	function handleDndConsider(e: CustomEvent<DndEvent<MeasurementTree>>) {
		items = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<MeasurementTree>>) {
		items = e.detail.items;
		onUpdate?.(items);
	}
</script>

<div
	bind:this={element}
	class="col-start-1 col-end-[-1] grid grid-cols-subgrid *:col-start-1 *:col-end-[-1] *:grid *:grid-cols-subgrid"
	use:dndzone={{ items: items, flipDurationMs, dropTargetStyle: {} }}
	on:consider={handleDndConsider}
	on:finalize={handleDndFinalize}
>
	{#each items as item (item.id)}
		<div class={parentElementClassName} animate:flip={{ duration: flipDurationMs }}>
			<slot {item} />
		</div>
	{/each}
</div>
