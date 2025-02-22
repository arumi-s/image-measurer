<script lang="ts">
	import { cn } from '$lib/cn';

	let className: string | undefined = undefined;

	export { className as class };
</script>

<svg
	width="24"
	height="24"
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
	fill="currentColor"
	class={cn('size-[1em] animate-spin leading-none', className)}
>
	<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
</svg>
