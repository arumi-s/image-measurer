<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { insertMeasurement, updateMeasurement } from '$lib/db';
	import type { Measurement } from '$lib/Measurement';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	export let data: PageData;

	let { id, measurement } = data;

	async function handleSave(record: Measurement) {
		try {
			if (id == null) {
				id = await insertMeasurement(record);
			} else {
				await updateMeasurement(id, record);
			}

			toast.success(`Saved as ${record.name}`);
		} catch (e) {
			toast.error(`Failed to save: ${e}`);
		}
	}
</script>

<svelte:head>
	<title>{measurement.name} - Image Measurer</title>
</svelte:head>

<div class="fixed inset-0">
	<Editor record={measurement} on:save={(e) => handleSave(e.detail)} />
</div>
