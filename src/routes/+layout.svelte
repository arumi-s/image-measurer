<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Image Measurer</title>
</svelte:head>

{@render children()}
