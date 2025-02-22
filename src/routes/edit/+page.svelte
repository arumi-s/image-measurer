<script lang="ts">
	import { goto } from '$app/navigation';
	import { insertMeasurement } from '$lib/db';
	import { fileToDataURL } from '$lib/image';
	import { createMeasurement } from '$lib/Measurement';
	import Dropzone from 'svelte-file-dropzone';
	import { writable } from 'svelte/store';

	const disabled = writable(false);

	async function handleFilesSelect(
		event: CustomEvent<{
			acceptedFiles: File[];
		}>
	) {
		try {
			$disabled = true;
			const { acceptedFiles } = event.detail;

			if (acceptedFiles == null || acceptedFiles.length === 0) {
				return;
			}

			const url = await fileToDataURL(acceptedFiles[0]);
			const id = await insertMeasurement(
				createMeasurement(url, acceptedFiles[0].name.split('/').pop())
			);
			await goto(`/edit/${id}`);
		} finally {
			$disabled = false;
		}
	}
</script>

<svelte:head>
	<title>New - Image Measurer</title>
</svelte:head>

<div class="fixed inset-0">
	<div
		class="grid size-full place-items-stretch p-4 select-none *:justify-center *:text-neutral-900!"
	>
		<Dropzone on:drop={handleFilesSelect} accept="image/*" multiple={false} disabled={$disabled} />
	</div>
</div>
