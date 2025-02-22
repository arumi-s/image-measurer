<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Datetime } from '$lib/components/ui/datetime';
	import { deleteMeasurement, type MeasurementDBRow } from '$lib/db';
	import PencilIcon from 'lucide-svelte/icons/pencil';
	import TrashIcon from 'lucide-svelte/icons/trash';

	export let data;

	async function handleDelete(row: MeasurementDBRow) {
		if (row.id) {
			if (confirm('Are you sure you want to delete this?')) {
				await deleteMeasurement(row.id);
				await invalidateAll();
			}
		}
	}
</script>

<div class="flex size-full flex-col overflow-hidden">
	<div class="shrink-0 p-4">
		<Button color="green" href="/edit/">Create</Button>
	</div>
	<div class="flex flex-1 flex-col gap-2 overflow-auto bg-neutral-100 p-4">
		{#each data.rows as row}
			<div class="flex gap-4 rounded-xl bg-white p-2 shadow">
				<img
					src={row.value.image}
					alt={row.value.name}
					class="size-24 shrink-0 rounded-md object-cover object-center"
				/>
				<div class="flex flex-1 flex-col gap-2">
					<div class="font-medium">#{row.id} {row.value.name}</div>
					<div class="">{row.value.lines.length} lines</div>
					<div class="mt-auto flex flex-wrap gap-x-4 gap-y-0 text-sm text-neutral-500">
						<div>Created: <Datetime value={row.createdAt} /></div>
						<div>Updated: <Datetime value={row.updatedAt} /></div>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<Button color="red" size="sm" class="shrink-0" on:click={() => handleDelete(row)}>
						<TrashIcon slot="icon" class="size-[1em]" />
						<div>Delete</div>
					</Button>
					<Button color="blue" size="sm" class="flex-1 shrink-0" href={`/edit/${row.id}`}>
						<PencilIcon slot="icon" class="size-[1em]" />
						<div>Edit</div>
					</Button>
				</div>
			</div>
		{/each}
	</div>
</div>
