<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>Image Measurer</title>
</svelte:head>

{@render children()}

<Toaster />
