<script lang="ts">
	import { cn } from '$lib/cn';
	import { Spinner } from '$lib/components/ui/spinner';

	let className: string | undefined = undefined;

	export { className as class };
	export let href: string | undefined = undefined;
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'auto' | undefined = undefined;
	export let color:
		| 'none'
		| 'plain'
		| 'neutral'
		| 'light'
		| 'red'
		| 'orange'
		| 'yellow'
		| 'green'
		| 'blue'
		| 'purple'
		| 'pink'
		| undefined = undefined;
	export let outline: boolean | undefined = undefined;
	export let loading: boolean | undefined = undefined;
	export let animated: boolean | undefined = undefined;
	export let disabled: boolean | undefined = undefined;
	export let endicon: boolean | undefined = undefined;
	export let type: 'button' | 'reset' | 'submit' | undefined = undefined;
	export let tabindex: number | undefined = undefined;
	export let sr: string | undefined = undefined;

	let sizeClass = '';
	let colorClass = '';
	let enabledColorClass = '';
	let iconClass = '';

	let mergedClass = '';

	$: {
		size ??= 'md';
		if (size === 'xs') {
			sizeClass = `items-center py-0.5 ${$$slots.default ? 'px-1' : 'px-0.5'} text-xs/normal rounded-sm`;
			iconClass = endicon ? 'ml-1' : 'mr-1';
		} else if (size === 'sm') {
			sizeClass = `font-medium items-center py-1 ${$$slots.default ? 'px-2' : 'px-1'} text-sm/normal rounded-sm`;
			iconClass = endicon ? 'ml-1' : 'mr-1';
		} else if (size === 'md') {
			sizeClass = `font-medium items-center py-2 ${$$slots.default ? 'px-4' : 'px-2'} text-md/normal rounded-md`;
			iconClass = endicon ? 'ml-2' : 'mr-2';
		} else if (size === 'lg') {
			sizeClass = `font-medium items-center py-3 ${$$slots.default ? 'px-6' : 'px-3'} text-lg/normal rounded-xl`;
			iconClass = endicon ? 'ml-3' : 'mr-3';
		} else if (size === 'auto') {
			sizeClass = `items-stretch`;
		}
		iconClass += endicon ? ' order-1' : '';
	}

	$: {
		color ??= 'neutral';
		if (outline) {
			if (color === 'none') {
				colorClass = 'ring-1 ring-current';
			} else if (color === 'plain') {
				colorClass = 'ring-1 ring-current';
				enabledColorClass = 'hover:bg-neutral-200 dark:hover:bg-neutral-700';
			} else if (color === 'neutral') {
				colorClass = 'text-neutral-500 bg-white ring-1 ring-neutral-500 bg-transparent';
				enabledColorClass = 'hover:text-white hover:bg-neutral-500 dark:hover:bg-neutral-700';
			} else if (color === 'light') {
				colorClass = 'text-neutral-300 bg-white ring-1 ring-neutral-300 bg-transparent';
				enabledColorClass = 'hover:text-white hover:bg-neutral-300';
			} else if (color === 'yellow') {
				colorClass = `text-yellow-400 bg-white ring-1 ring-yellow-400 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-yellow-400 dark:hover:bg-yellow-600`;
			} else if (color === 'red') {
				colorClass = `text-red-500 bg-white ring-1 ring-red-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-red-500 dark:hover:bg-red-800`;
			} else if (color === 'orange') {
				colorClass = `text-orange-500 bg-white ring-1 ring-orange-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-orange-500 dark:hover:bg-orange-800`;
			} else if (color === 'green') {
				colorClass = `text-green-500 bg-white ring-1 ring-green-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-green-500 dark:hover:bg-green-800`;
			} else if (color === 'blue') {
				colorClass = `text-blue-500 bg-white ring-1 ring-blue-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-blue-500 dark:hover:bg-blue-800`;
			} else if (color === 'purple') {
				colorClass = `text-purple-500 bg-white ring-1 ring-purple-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-purple-500 dark:hover:bg-purple-800`;
			} else if (color === 'pink') {
				colorClass = `text-pink-500 bg-white ring-1 ring-pink-500 bg-transparent`;
				enabledColorClass = `hover:text-white hover:bg-pink-500 dark:hover:bg-pink-800`;
			}
		} else {
			if (color === 'none') {
				colorClass = 'bg-transparent';
			} else if (color === 'plain') {
				colorClass = 'bg-transparent';
				enabledColorClass = 'hover:bg-neutral-200 dark:hover:bg-neutral-700';
			} else if (color === 'neutral') {
				colorClass = 'text-white bg-neutral-500 dark:bg-neutral-700';
				enabledColorClass = 'hover:bg-neutral-600 dark:hover:bg-neutral-800';
			} else if (color === 'light') {
				colorClass = 'text-neutral-600 bg-neutral-300 dark:text-white dark:bg-neutral-800';
				enabledColorClass = 'hover:bg-neutral-200 dark:hover:bg-neutral-700';
			} else if (color === 'yellow') {
				colorClass = `text-white bg-yellow-400 dark:bg-yellow-600`;
				enabledColorClass = `hover:bg-yellow-500 dark:hover:bg-yellow-500`;
			} else if (color === 'red') {
				colorClass = `text-white bg-red-500 dark:bg-red-700`;
				enabledColorClass = `hover:bg-red-600 dark:hover:bg-red-800`;
			} else if (color === 'orange') {
				colorClass = `text-white bg-orange-500 dark:bg-orange-700`;
				enabledColorClass = `hover:bg-orange-600 dark:hover:bg-orange-800`;
			} else if (color === 'green') {
				colorClass = `text-white bg-green-500 dark:bg-green-700`;
				enabledColorClass = `hover:bg-green-600 dark:hover:bg-green-800`;
			} else if (color === 'blue') {
				colorClass = `text-white bg-blue-500 dark:bg-blue-700`;
				enabledColorClass = `hover:bg-blue-600 dark:hover:bg-blue-800`;
			} else if (color === 'purple') {
				colorClass = `text-white bg-purple-500 dark:bg-purple-700`;
				enabledColorClass = `hover:bg-purple-600 dark:hover:bg-purple-800`;
			} else if (color === 'pink') {
				colorClass = `text-white bg-pink-500 dark:bg-pink-700`;
				enabledColorClass = `hover:bg-pink-600 dark:hover:bg-pink-800`;
			}
		}
	}

	$: {
		mergedClass = cn(
			'grid relative transition-all duration-100 select-none',
			sizeClass,
			colorClass,
			disabled
				? [color === 'none' ? 'grayscale' : 'bg-opacity-50 text-opacity-50']
				: [(animated ?? true) ? 'active:scale-95' : '', enabledColorClass],
			loading ? 'cursor-progress' : disabled ? 'cursor-not-allowed' : '',
			className
		);
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={href ? 'a' : 'button'}
	class={mergedClass}
	{href}
	type={href ? undefined : (type ?? 'button')}
	title={sr}
	{tabindex}
	{...$$restProps}
	on:click
	on:mousedown
	on:mouseup
	on:mouseenter
	on:mouseleave
	on:dragstart|preventDefault
>
	<div
		class={cn(
			'overflow-inherit col-start-1 row-end-1 flex justify-center text-center',
			size === 'auto' ? 'items-stretch' : 'items-center',
			loading ? 'invisible' : undefined
		)}
	>
		{#if $$slots.icon}
			<div
				class={cn(
					'shrink-0',
					size !== 'auto' && 'size-[1em] text-[1.5em]',
					$$slots.default && iconClass
				)}
			>
				<slot name="icon" />
			</div>
		{/if}
		<slot />
	</div>
	{#if loading}
		<div
			class="overflow-inherit col-start-1 row-end-1 flex items-center justify-center text-[1.5em]"
		>
			<Spinner></Spinner>
		</div>
	{/if}
	{#if $$slots.overlay}
		<div class="overflow-inherit col-start-1 row-end-1 flex items-center justify-center">
			<slot name="overlay" />
		</div>
	{/if}
	{#if sr}
		<div class="sr-only">{sr}</div>
	{/if}
</svelte:element>
