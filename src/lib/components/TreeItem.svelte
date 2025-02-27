<script lang="ts">
	import type {
		MeasurementDisplayedLine,
		MeasurementLine,
		MeasurementTree,
		MeasurementTreeGroup
	} from '$lib/Measurement';
	import type { Readable } from 'svelte/store';
	import { Button } from './ui/button';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import LockIcon from 'lucide-svelte/icons/lock';
	import LockOpenIcon from 'lucide-svelte/icons/lock-open';
	import Tree from './Tree.svelte';
	import EyeIcon from 'lucide-svelte/icons/eye';
	import EyeOffIcon from 'lucide-svelte/icons/eye-off';

	export let node: MeasurementTree;
	export let displayedLines: Readable<MeasurementDisplayedLine[]>;
	export let handleUpdateLineName: (line: MeasurementLine) => void;
	export let handleChangeLineName: (line: MeasurementLine) => void;
	export let handleClickHide: (line: MeasurementLine) => void;
	export let handleClickLock: (line: MeasurementLine) => void;
	export let handleClickDelete: (line: MeasurementLine) => void;
	export let handleClickDeleteGroup: (group: MeasurementTreeGroup) => void;
</script>

{#if node.type === 'leaf'}
	{@const line = $displayedLines.find((l) => l.line.id === node.id)!}
	{#if line}
		<div class="contents" class:bg-blue-200={line.isClosest}>
			<div class="border-b border-l border-neutral-300 bg-inherit px-0.5 py-0.5">
				<Button
					size="xs"
					color={line.line.isHidden ? 'neutral' : 'light'}
					on:click={() => handleClickHide(line.line)}
					sr={line.line.isHidden ? 'Show' : 'Hide'}
				>
					<svelte:fragment slot="icon">
						{#if line.line.isHidden}
							<EyeOffIcon class="size-[1em]" />
						{:else}
							<EyeIcon class="size-[1em]" />
						{/if}
					</svelte:fragment>
				</Button>
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
				{line.line.id}
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5">
				<input
					type="text"
					bind:value={line.line.name}
					class="h-5.5 w-full rounded-sm border border-neutral-300 px-1 text-sm"
					on:input={() => handleUpdateLineName(line.line)}
					on:change={() => handleChangeLineName(line.line)}
				/>
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
				{line.x}
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
				{line.y}
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
				{line.angle}°
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
				{line.length}
			</div>
			<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5">
				<div class="flex items-center gap-1">
					<Button
						size="xs"
						color={line.line.isLocked ? 'neutral' : 'light'}
						on:click={() => handleClickLock(line.line)}
						sr={line.line.isLocked ? 'Unlock' : 'Lock'}
					>
						<svelte:fragment slot="icon">
							{#if line.line.isLocked}
								<LockIcon class="size-[1em]" />
							{:else}
								<LockOpenIcon class="size-[1em]" />
							{/if}
						</svelte:fragment>
					</Button>
					<Button size="xs" color="red" on:click={() => handleClickDelete(line.line)} sr="Delete">
						<TrashIcon slot="icon" class="size-[1em]" />
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<div class="col-span-7 h-[27px] border-b border-l border-neutral-300"></div>
	{/if}
{:else}
	<div class="col-start-1 col-end-[-1] my-1 grid grid-cols-subgrid bg-neutral-100">
		<div class="border-b border-l border-neutral-300 bg-inherit px-0.5 py-0.5">
			<Button size="xs" color="light" sr="Open">
				<EyeIcon slot="icon" class="size-[1em]" />
			</Button>
		</div>
		<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5 text-right">
			{node.id}
		</div>
		<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5">
			<input
				type="text"
				bind:value={node.name}
				class="h-5.5 w-full rounded-sm border border-neutral-300 px-1 text-sm"
			/>
		</div>
		<div class="col-span-4 border-b border-l border-neutral-300 bg-inherit px-1 py-0.5"></div>
		<div class="border-b border-l border-neutral-300 bg-inherit px-1 py-0.5">
			<div class="flex items-center gap-1">
				<Button size="xs" color="light">
					<LockOpenIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button size="xs" color="red" on:click={() => handleClickDeleteGroup(node)} sr="Delete">
					<TrashIcon slot="icon" class="size-[1em]" />
				</Button>
			</div>
		</div>
		<div
			class="col-start-2 col-end-[-1] grid min-h-[27px] grid-cols-[auto_auto_1fr_auto_auto_auto_auto_min-content] border-b border-neutral-300 bg-neutral-100"
		>
			<Tree
				items={node.items}
				onUpdate={(h) => {
					console.log((node.items = h));
				}}
			>
				<svelte:fragment let:item>
					<svelte:self
						node={item}
						{displayedLines}
						{handleUpdateLineName}
						{handleChangeLineName}
						{handleClickHide}
						{handleClickLock}
						{handleClickDelete}
						{handleClickDeleteGroup}
					/>
				</svelte:fragment>
			</Tree>
		</div>
	</div>
{/if}
