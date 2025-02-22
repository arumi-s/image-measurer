<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { insertMeasurement, updateMeasurement } from '$lib/db';
	import type { Measurement } from '$lib/Measurement';
	import type { PageData } from './$types';

	export let data: PageData;

	let { id, measurement } = data;

	async function handleSave(record: Measurement) {
		if (id == null) {
			id = await insertMeasurement(record);
		} else {
			await updateMeasurement(id, record);
		}
	}
</script>

<svelte:head>
	<title>{measurement.name} - Image Measurer</title>
</svelte:head>

<div class="fixed inset-0">
	<Editor record={measurement} on:save={(e) => handleSave(e.detail)} />
</div>
