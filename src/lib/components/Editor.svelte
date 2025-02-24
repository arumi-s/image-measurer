<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { loadImage } from '$lib/image';
	import { derived, get, writable } from 'svelte/store';
	import { startDrag } from 'start-drag';
	import {
		alignVector,
		closestDistanceFromLineSegment,
		lineSegmentAngle,
		lineSegmentLength,
		lineSegmentMidpoint,
		radianToDegree,
		roundVector,
		type Vector2
	} from '$lib/math';
	import { Button } from '$lib/components/ui/button';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import SquareSquareIcon from 'lucide-svelte/icons/square-square';
	import CrosshairIcon from 'lucide-svelte/icons/crosshair';
	import SaveIcon from 'lucide-svelte/icons/save';
	import UndoIcon from 'lucide-svelte/icons/undo';
	import RedoIcon from 'lucide-svelte/icons/redo';
	import MousePointer2Icon from 'lucide-svelte/icons/mouse-pointer-2';
	import FileSpreadsheetIcon from 'lucide-svelte/icons/file-spreadsheet';
	import LockIcon from 'lucide-svelte/icons/lock';
	import LockOpenIcon from 'lucide-svelte/icons/lock-open';
	import Axis3DIcon from 'lucide-svelte/icons/axis-3d';
	import type { Measurement, MeasurementLine, ClosestLineSegmentEndpoint } from '$lib/Measurement';
	import { pressedKey } from '$lib/key';
	import { createUndoer } from '$lib/undoer';

	export let record: Measurement;

	const imageWidth = writable(0);
	const imageHeight = writable(0);
	const containerWidth = writable(0);
	const containerHeight = writable(0);
	const halfHeight = derived([containerHeight], ([$containerHeight]) => $containerHeight / 2);
	const halfWidth = derived([containerWidth], ([$containerWidth]) => $containerWidth / 2);
	const halfImageHeight = derived([imageHeight], ([$imageHeight]) => $imageHeight / 2);
	const halfImageWidth = derived([imageWidth], ([$imageWidth]) => $imageWidth / 2);

	const dispatchEvent = createEventDispatcher<{
		save: Measurement;
	}>();

	let image: HTMLImageElement;
	let containerElement: HTMLDivElement;
	let backgroundElement: HTMLCanvasElement;
	let gridElement: HTMLCanvasElement;
	let canvasElement: HTMLCanvasElement;

	let backgroundCtx: CanvasRenderingContext2D;
	$: if (backgroundElement) {
		backgroundCtx = backgroundElement.getContext('2d')!;
		backgroundCtx.imageSmoothingEnabled = false;
	}
	let gridCtx: CanvasRenderingContext2D;
	$: if (gridElement) {
		gridCtx = gridElement.getContext('2d')!;
		gridCtx.imageSmoothingEnabled = false;
	}
	let ctx: CanvasRenderingContext2D;
	$: if (canvasElement) {
		ctx = canvasElement.getContext('2d')!;
		ctx.imageSmoothingEnabled = false;
	}

	onMount(async () => {
		image = await loadImage(record.image);
		$imageWidth = image.width;
		$imageHeight = image.height;
		if (record.scale === 1) {
			$scale = Math.min($containerWidth / $imageWidth, $containerHeight / $imageHeight);
		}

		backgroundCtx = backgroundElement.getContext('2d')!;
		backgroundCtx.imageSmoothingEnabled = false;
		gridCtx = gridElement.getContext('2d')!;
		gridCtx.imageSmoothingEnabled = false;
		ctx = canvasElement.getContext('2d')!;
		ctx.imageSmoothingEnabled = false;
		drawBackground();
		drawGrid();
		drawLines();
	});

	const dotSize = 9;
	const strokeWidth = 1;
	const fontSize = 6;
	const inherentOffsetX = 0.5;
	const inherentOffsetY = 0.5;

	const shiftKey = pressedKey('shiftKey');
	const ctrlKey = pressedKey('ctrlKey');

	let name = record.name;
	let lineColor = record.lineColor;
	let textColor = record.textColor;
	let gridColor = record.gridColor;
	const gridSize = writable(record.gridSize);
	const gridOffsetX = writable(record.gridOffsetX);
	const gridOffsetY = writable(record.gridOffsetY);
	const showGrid = writable(record.showGrid);
	const showText = writable(record.showText);
	const showReal = writable(record.showReal);
	const selectMode = writable(record.selectMode);
	const autoLock = writable(record.autoLock);
	const pixelPerfect = writable(record.pixelPerfect);
	const ratio = writable(record.ratio);
	const offsetX = writable(record.offsetX);
	const offsetY = writable(record.offsetY);
	const scale = writable(record.scale);
	const lines = writable(record.lines);

	const undoer = createUndoer({ lines: record.lines });
	const { canUndo, canRedo } = undoer;
	$: {
		$lines = $undoer.lines;
		drawLines();
	}
	function pushState() {
		$undoer = { lines: $lines };
	}

	const closest = writable<ClosestLineSegmentEndpoint[]>([]);
	const isDrawing = writable(false);
	const isPanning = writable(false);
	const realSelectMode = derived(
		[selectMode, ctrlKey],
		([$selectMode, $ctrlKey]) => $selectMode !== $ctrlKey
	);
	$: {
		$realSelectMode;
		tick().then(() => drawLines());
	}
	const cursor = derived(
		[isDrawing, isPanning, closest, realSelectMode],
		([$isDrawing, $isPanning, $closest, $realSelectMode]) => {
			if ($isDrawing) return 'crosshair';
			if ($isPanning) return 'move';
			if ($closest.length && $realSelectMode && !$closest.every(([c]) => c.isLocked)) return 'grab';
			return 'crosshair';
		}
	);

	function resetView() {
		$offsetX = 0;
		$offsetY = 0;
		$scale = 1;
		drawBackground();
		drawGrid();
		drawLines();
	}

	function drawBackground() {
		if (backgroundCtx == null || image == null) return;

		backgroundCtx.clearRect(0, 0, backgroundElement.width, backgroundElement.height);

		backgroundCtx.save();
		backgroundCtx.translate($halfWidth, $halfHeight);
		backgroundCtx.scale($scale, $scale);
		backgroundCtx.translate(-$halfImageWidth, -$halfImageHeight);
		backgroundCtx.translate($offsetX, $offsetY);

		backgroundCtx.drawImage(image, 0, 0, $imageWidth, $imageHeight);
		backgroundCtx.restore();
	}

	function drawGrid() {
		if (gridCtx == null || gridElement == null) return;

		gridCtx.clearRect(0, 0, gridElement.width, gridElement.height);

		if (!$showGrid) {
			return;
		}

		const $scale = get(scale);
		const $gridSize = get(gridSize);
		const halfScale = $scale / 2;
		const left = halfScale * -$imageWidth;
		const right = halfScale * $imageWidth;
		const top = halfScale * -$imageHeight;
		const bottom = halfScale * $imageHeight;
		const step = $gridSize * $scale * $ratio;

		if (step < 1) {
			return;
		}

		gridCtx.save();

		gridCtx.translate($halfWidth, $halfHeight);
		gridCtx.translate($offsetX * $scale, $offsetY * $scale);

		gridCtx.strokeStyle = gridColor;
		gridCtx.lineWidth = 1;

		const startX = $ratio * $scale * $gridOffsetX;
		const startY = $ratio * $scale * $gridOffsetY;
		gridCtx.beginPath();

		for (let x = startX - step; x >= left; x -= step) {
			gridCtx.moveTo(x, top);
			gridCtx.lineTo(x, bottom);
		}
		for (let x = startX; x <= right; x += step) {
			gridCtx.moveTo(x, top);
			gridCtx.lineTo(x, bottom);
		}
		for (let y = startY; y >= top; y -= step) {
			gridCtx.moveTo(left, y);
			gridCtx.lineTo(right, y);
		}
		for (let y = startY; y <= bottom; y += step) {
			gridCtx.moveTo(left, y);
			gridCtx.lineTo(right, y);
		}

		gridCtx.stroke();

		gridCtx.restore();
	}

	function drawLines() {
		if (ctx == null || canvasElement == null) return;

		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		ctx.save();

		const realStrokeWidth = strokeWidth * $scale;
		const realFontSize = fontSize * $scale;

		ctx.strokeStyle = lineColor;
		ctx.lineWidth = realStrokeWidth;
		ctx.font = `${realFontSize}px sans-serif`;
		ctx.fillStyle = textColor;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';

		const radius = $scale * Math.floor(dotSize / 2);
		const halfWidth = realStrokeWidth / 2;

		if ($realSelectMode && $closest.length > 0) {
			ctx.save();
			ctx.strokeStyle = '#aaa9';
			ctx.setLineDash([realStrokeWidth * 2, realStrokeWidth * 2]);
			const [line, endpoint] = $closest[0];
			if (endpoint === 'start' || endpoint === 'end') {
				const realPoint = i2r(line[endpoint]);
				ctx.beginPath();
				ctx.moveTo(0, realPoint.y);
				ctx.lineTo(canvasElement.width, realPoint.y);
				ctx.moveTo(realPoint.x, 0);
				ctx.lineTo(realPoint.x, canvasElement.height);
				ctx.stroke();
			}
			ctx.restore();
		}

		const isShowText = get(showText);
		for (const line of $lines) {
			const realStart = i2r(line.start);
			const realEnd = i2r(line.end);

			ctx.beginPath();
			ctx.moveTo(realStart.x, realStart.y);
			ctx.lineTo(realEnd.x, realEnd.y);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(realStart.x - radius - halfWidth, realStart.y);
			ctx.lineTo(realStart.x + radius - halfWidth + realStrokeWidth, realStart.y);
			ctx.moveTo(realStart.x, realStart.y - radius - halfWidth);
			ctx.lineTo(realStart.x, realStart.y + radius - halfWidth + realStrokeWidth);
			ctx.moveTo(realEnd.x - radius - halfWidth, realEnd.y);
			ctx.lineTo(realEnd.x + radius - halfWidth + realStrokeWidth, realEnd.y);
			ctx.moveTo(realEnd.x, realEnd.y - radius - halfWidth);
			ctx.lineTo(realEnd.x, realEnd.y + radius - halfWidth + realStrokeWidth);
			ctx.stroke();

			if (isShowText && line.name) {
				ctx.save();
				const realLine = {
					start: realStart.x < realEnd.x ? realStart : realEnd,
					end: realStart.x < realEnd.x ? realEnd : realStart
				};
				const midPoint = lineSegmentMidpoint(realLine);
				ctx.translate(midPoint.x, midPoint.y);
				ctx.rotate(lineSegmentAngle(realLine));
				ctx.fillText(line.name, 0, 0);

				ctx.restore();
			}
		}

		ctx.restore();
	}

	$: {
		if ($containerHeight > 0 && $containerWidth > 0) {
			backgroundElement.width = $containerWidth;
			backgroundElement.height = $containerHeight;
			gridElement.width = $containerWidth;
			gridElement.height = $containerHeight;
			canvasElement.width = $containerWidth;
			canvasElement.height = $containerHeight;
			drawBackground();
			drawGrid();
			drawLines();
		}
	}

	function i2r(point: Vector2) {
		return {
			x: (point.x + $offsetX + inherentOffsetX - $halfImageWidth) * $scale + $halfWidth,
			y: (point.y + $offsetY + inherentOffsetY - $halfImageHeight) * $scale + $halfHeight
		};
	}

	function r2i(point: Vector2) {
		return {
			x: (point.x - $halfWidth) / $scale - $offsetX - inherentOffsetX + $halfImageWidth,
			y: (point.y - $halfHeight) / $scale - $offsetY - inherentOffsetY + $halfImageHeight
		};
	}

	function findClosestFromPoint(lines: MeasurementLine[], point: Vector2, skipLocked = true) {
		let minDistance = dotSize / 2;
		let closest: ClosestLineSegmentEndpoint[] = [];
		for (const line of lines) {
			if (skipLocked && line.isLocked) continue;
			let distance = Math.hypot(line.start.x - point.x, line.start.y - point.y);
			if (distance === minDistance) {
				closest.push([line, 'start']);
			} else if (distance < minDistance) {
				minDistance = distance;
				closest = [[line, 'start']];
			}
			distance = Math.hypot(line.end.x - point.x, line.end.y - point.y);
			if (distance === minDistance) {
				closest.push([line, 'end']);
			} else if (distance < minDistance) {
				minDistance = distance;
				closest = [[line, 'end']];
			}
		}
		if (closest.length === 0) {
			let minDistance = strokeWidth / 2;
			for (const line of lines) {
				const distance = closestDistanceFromLineSegment(point, line);
				if (distance < minDistance) {
					minDistance = distance;
					closest = [[line, 'line']];
				}
			}
		}
		return closest;
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		if ($isDrawing || $isPanning) return;

		const arr = $lines;
		const newClosest = findClosestFromPoint(arr, r2i({ x: event.offsetX, y: event.offsetY }));
		if (
			new Set($closest.map(([l, e]) => `${arr.indexOf(l)}.${e}`)).symmetricDifference(
				new Set(newClosest.map(([l, e]) => `${arr.indexOf(l)}.${e}`))
			).size > 0
		) {
			$closest = newClosest;
			drawLines();
		}
	}

	function handleCanvasMouseDown(event: MouseEvent) {
		if ($isDrawing || $isPanning) return;

		if (event.button === 0 || event.button === 2) {
			event.preventDefault();
			const closest = $realSelectMode
				? findClosestFromPoint($lines, r2i({ x: event.offsetX, y: event.offsetY })).filter(
						(l) => !l[0].isLocked
					)
				: [];

			let isNewLine = false;
			if (event.button === 0 && closest.length === 0) {
				const line: MeasurementLine = {
					name: '',
					start: r2i({ x: event.offsetX, y: event.offsetY }),
					end: r2i({ x: event.offsetX, y: event.offsetY }),
					isLocked: get(autoLock)
				};
				if ($pixelPerfect) {
					line.start = roundVector(line.start);
					line.end = roundVector(line.end);
				}
				closest.push([line, 'end']);
				isNewLine = true;
			}
			if (closest.length === 0) return;

			$isDrawing = true;
			const preparedLines = closest.map(([line, endpoint]) => {
				if (endpoint === 'line') {
					let rawStartPoint = { x: line.start.x, y: line.start.y };
					let rawEndPoint = { x: line.end.x, y: line.end.y };
					const otherStartPoint = { x: line.start.x, y: line.start.y };
					const otherEndPoint = { x: line.end.x, y: line.end.y };
					const startPoint = i2r(rawStartPoint);
					const endPoint = i2r(rawEndPoint);

					return {
						updatePoint: (isShiftKey: boolean) => {
							line.start = isShiftKey ? alignVector(otherStartPoint, rawStartPoint) : rawStartPoint;
							line.end = isShiftKey ? alignVector(otherEndPoint, rawEndPoint) : rawEndPoint;
							if ($pixelPerfect) {
								line.start = roundVector(line.start);
								line.end = roundVector(line.end);
							}
						},
						handler: (relX: number, relY: number) => {
							rawStartPoint = r2i({ x: startPoint.x + relX, y: startPoint.y + relY });
							rawEndPoint = r2i({ x: endPoint.x + relX, y: endPoint.y + relY });
						}
					};
				}

				const otherPoint = line[endpoint === 'end' ? 'start' : 'end'];
				let rawPoint = { x: line[endpoint].x, y: line[endpoint].y };
				const thisPoint = i2r(rawPoint);

				return {
					updatePoint: (isShiftKey: boolean) => {
						if (isShiftKey) {
							const snapClosest = findClosestFromPoint(
								$lines.filter((l) => !closest.some(([c]) => c === l)),
								rawPoint,
								false
							);
							if (snapClosest.length > 0) {
								const [otherLine, otherEndpoint] = snapClosest[0];
								if (otherEndpoint === 'start' || otherEndpoint === 'end') {
									line[endpoint] = { x: otherLine[otherEndpoint].x, y: otherLine[otherEndpoint].y };
									return;
								}
							}
						}
						line[endpoint] = isShiftKey ? alignVector(otherPoint, rawPoint) : rawPoint;
						if ($pixelPerfect) {
							line[endpoint] = roundVector(line[endpoint]);
						}
					},
					handler: (relX: number, relY: number) => {
						if (isNewLine && lineSegmentLength(line) > 0) {
							$lines.push(line);
							isNewLine = false;
						}
						rawPoint = r2i({ x: thisPoint.x + relX, y: thisPoint.y + relY });
					}
				};
			});

			const unsubscribe = shiftKey.subscribe((value) => {
				preparedLines.forEach(({ updatePoint }) => updatePoint(value));
				$lines = $lines;
				drawLines();
			});
			startDrag(
				event,
				containerElement,
				(_, _x, _y, relX, relY) => {
					const isShiftKey = get(shiftKey);
					preparedLines.forEach(({ handler, updatePoint }) => {
						handler(relX, relY);
						updatePoint(isShiftKey);
					});
					$lines = $lines;
					drawLines();
				},
				() => {
					unsubscribe();
					$isDrawing = false;
					pushState();
				}
			);
		} else if (event.button === 1) {
			event.preventDefault();
			$isPanning = true;
			const startX = $offsetX;
			const startY = $offsetY;
			startDrag(
				event,
				containerElement,
				(_, _x, _y, relX, relY) => {
					$offsetX = startX + relX / $scale;
					$offsetY = startY + relY / $scale;
					drawBackground();
					drawGrid();
					drawLines();
				},
				() => {
					$isPanning = false;
				}
			);
		}
	}

	function handleCanvasWheel(event: WheelEvent) {
		const pointer = { x: event.offsetX, y: event.offsetY };
		const oldOffset = r2i(pointer);
		if (event.deltaY < 0) {
			$scale *= 1.1;
		} else if (event.deltaY > 0) {
			$scale *= 1 / 1.1;
		}
		const newOffset = r2i(pointer);
		$offsetX += newOffset.x - oldOffset.x;
		$offsetY += newOffset.y - oldOffset.y;

		drawBackground();
		drawGrid();
		drawLines();
	}

	function handleClickResetView() {
		resetView();
	}

	function handleClickSelectMode() {
		selectMode.update(($selectMode) => !$selectMode);
	}

	function handleClickAutoLock() {
		autoLock.update(($autoLock) => !$autoLock);
	}

	function handleClickPixelPerfect() {
		pixelPerfect.update(($pixelPerfect) => !$pixelPerfect);
	}

	function handleClickUndo() {
		undoer.undo();
	}

	function handleClickRedo() {
		undoer.redo();
	}

	async function handleClickSaveAsCsv() {
		const data = get(displayedLines);
		const csv =
			`index,name,x,y,angle,length\n` +
			data
				.map((line, index) => {
					return `${index + 1},${line.line.name ?? ''},${line.x},${line.y},${line.angle},${line.length}`;
				})
				.join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${name}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleClickSave() {
		dispatchEvent('save', {
			name,
			image: record.image,
			lineColor,
			textColor,
			gridColor,
			gridSize: get(gridSize),
			gridOffsetX: get(gridOffsetX),
			gridOffsetY: get(gridOffsetY),
			showGrid: get(showGrid),
			showText: get(showText),
			showReal: get(showReal),
			selectMode: get(selectMode),
			autoLock: get(autoLock),
			pixelPerfect: get(pixelPerfect),
			ratio: get(ratio),
			offsetX: get(offsetX),
			offsetY: get(offsetY),
			scale: get(scale),
			lines: get(lines)
		});
	}

	function handleUpdateLineColor() {
		drawLines();
	}

	function handleUpdateTextColor() {
		drawLines();
	}

	function handleUpdateGridColor() {
		drawGrid();
	}

	function handleUpdateGridSize() {
		drawGrid();
	}

	function handleClickLock(line: MeasurementLine) {
		line.isLocked = !line.isLocked;
		$lines = $lines;
		drawLines();
		pushState();
	}

	function handleClickDelete(line: MeasurementLine) {
		$lines = $lines.filter((l) => l !== line);
		drawLines();
		pushState();
	}

	function handleUpdateLineName(line: MeasurementLine) {
		drawLines();
	}

	function handleBlurLineName(line: MeasurementLine) {
		pushState();
	}

	const displayedLines = derived(
		[lines, closest, ratio, showReal],
		([$lines, $closest, $ratio, $showReal]) => {
			const r = $showReal ? $ratio : 1;
			return $lines.map((line, index) => {
				return {
					line,
					index: index + 1,
					x: (Math.abs(line.end.x - line.start.x) * r).toFixed(2),
					y: (Math.abs(line.end.y - line.start.y) * r).toFixed(2),
					angle: radianToDegree(lineSegmentAngle(line)).toFixed(0),
					length: (lineSegmentLength(line) * r).toFixed(2),
					isLocked: line.isLocked,
					isClosest: $closest.some(([c]) => c === line)
				};
			});
		}
	);
</script>

<div class="relative grid size-full grid-cols-[1fr_auto] bg-white">
	<div
		class="relative grid size-full overflow-hidden"
		bind:this={containerElement}
		bind:offsetHeight={$containerHeight}
		bind:offsetWidth={$containerWidth}
		style:cursor={$cursor}
	>
		<canvas class="col-start-1 row-start-1" bind:this={backgroundElement}></canvas>
		<canvas class="col-start-1 row-start-1" bind:this={gridElement}></canvas>
		<canvas
			class="col-start-1 row-start-1"
			bind:this={canvasElement}
			on:mousemove|passive={handleCanvasMouseMove}
			on:mousedown={handleCanvasMouseDown}
			on:contextmenu|preventDefault
			on:wheel|passive={handleCanvasWheel}
		></canvas>
	</div>
	<div class="flex w-96 flex-col space-y-1 overflow-hidden bg-neutral-100 shadow">
		<div class="flex shrink-0 flex-col gap-1 py-1">
			<div class="flex flex-row items-center gap-1 px-1 select-none">
				<Button size="sm" color="light" on:click={handleClickUndo} sr="Undo" disabled={!$canUndo}>
					<UndoIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button size="sm" color="light" on:click={handleClickRedo} sr="Redo" disabled={!$canRedo}>
					<RedoIcon slot="icon" class="size-[1em]" />
				</Button>
				<div class="mx-auto"></div>
				<input
					type="text"
					bind:value={name}
					class="h-7 flex-1 rounded-sm border border-neutral-300 bg-white px-1 text-sm"
				/>
				<Button size="sm" color="purple" on:click={handleClickSaveAsCsv} sr="Save as CSV">
					<FileSpreadsheetIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button size="sm" color="blue" on:click={handleClickSave} sr="Save">
					<SaveIcon slot="icon" class="size-[1em]" />
				</Button>
			</div>
			<div class="flex flex-row items-center gap-1 px-1 select-none">
				<Button size="sm" color="light" on:click={handleClickResetView} sr="Reset View">
					<SquareSquareIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button
					size="sm"
					color={$realSelectMode ? 'green' : 'plain'}
					on:click={handleClickSelectMode}
					sr="Select Mode"
				>
					<MousePointer2Icon slot="icon" class="size-[1em]" />
				</Button>
				<Button size="sm" color={$shiftKey ? 'green' : 'plain'} sr="Snap">
					<Axis3DIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button
					size="sm"
					color={$autoLock ? 'green' : 'plain'}
					on:click={handleClickAutoLock}
					sr={$autoLock ? 'Auto Lock' : 'Auto Unlock'}
				>
					<LockIcon slot="icon" class="size-[1em]" />
				</Button>
				<Button
					size="sm"
					color={$pixelPerfect ? 'green' : 'plain'}
					on:click={handleClickPixelPerfect}
					sr={$pixelPerfect ? 'Pixel Perfect' : 'Free'}
				>
					<CrosshairIcon slot="icon" class="size-[1em]" />
				</Button>
				<div class="mx-auto"></div>
				<input
					type="color"
					bind:value={lineColor}
					class="size-7 shrink-0 rounded-sm"
					on:input={handleUpdateLineColor}
					on:change={handleUpdateLineColor}
				/>
			</div>
			<div class="flex flex-row items-center gap-1 px-1 select-none">
				<label for="ratio" class="shrink-0 text-sm font-medium text-neutral-700">Ratio: </label>
				<input
					type="number"
					id="ratio"
					bind:value={$ratio}
					min="0"
					step="0.1"
					class="h-7 flex-1 rounded-sm border border-neutral-300 bg-white px-1 text-sm"
					on:change={handleUpdateGridSize}
				/>
				<label class="flex shrink-0 cursor-pointer items-center">
					<input type="checkbox" bind:checked={$showReal} class="peer sr-only" />
					<div
						class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center gap-1 px-1 select-none">
				<label for="gridSize" class="shrink-0 text-sm font-medium text-neutral-700">Grid: </label>
				<input
					type="number"
					id="gridSize"
					bind:value={$gridSize}
					min="0"
					step="1"
					size="1"
					class="h-7 flex-1 rounded-sm border border-neutral-300 bg-white px-1 text-sm"
					on:change={handleUpdateGridSize}
				/>
				<label for="gridOffsetX" class="text-sm font-medium text-neutral-700">X: </label>
				<input
					type="number"
					id="gridOffsetX"
					bind:value={$gridOffsetX}
					min="0"
					step="1"
					size="1"
					class="h-7 flex-1 rounded-sm border border-neutral-300 bg-white px-1 text-sm"
					on:change={handleUpdateGridSize}
				/>
				<label for="gridOffsetY" class="text-sm font-medium text-neutral-700">Y: </label>
				<input
					type="number"
					id="gridOffsetY"
					bind:value={$gridOffsetY}
					min="0"
					step="1"
					size="1"
					class="h-7 flex-1 rounded-sm border border-neutral-300 bg-white px-1 text-sm"
					on:change={handleUpdateGridSize}
				/>

				<input
					type="color"
					bind:value={gridColor}
					class="size-7 shrink-0 rounded-sm"
					on:input={handleUpdateGridColor}
					on:change={handleUpdateGridColor}
				/>
				<label class="flex shrink-0 cursor-pointer items-center">
					<input
						type="checkbox"
						bind:checked={$showGrid}
						class="peer sr-only"
						on:change={handleUpdateGridColor}
					/>
					<div
						class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
					></div>
				</label>
			</div>
			<div class="flex flex-row items-center gap-1 px-1 select-none">
				<label for="ratio" class="shrink-0 text-sm font-medium text-neutral-700">Text: </label>
				<div class="mx-auto"></div>
				<input
					type="color"
					bind:value={textColor}
					class="size-7 shrink-0 rounded-sm"
					on:input={handleUpdateTextColor}
					on:change={handleUpdateTextColor}
				/>
				<label class="flex shrink-0 cursor-pointer items-center">
					<input
						type="checkbox"
						bind:checked={$showText}
						class="peer sr-only"
						on:change={handleUpdateTextColor}
					/>
					<div
						class="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
					></div>
				</label>
			</div>
		</div>
		<div class="flex-1 overflow-auto pl-1">
			<div
				class="grid grid-cols-[auto_1fr_auto_auto_auto_auto_min-content] border-t border-neutral-300 bg-white text-sm"
			>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					#
				</div>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					Name
				</div>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					X
				</div>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					Y
				</div>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					Angle
				</div>
				<div
					class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 text-center font-medium"
				>
					Length
				</div>
				<div class="border-b border-l border-inherit bg-neutral-200 px-1 py-0.5 font-medium"></div>
				{#each $displayedLines as line, i}
					<div class="contents border-inherit" class:bg-blue-200={line.isClosest}>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5 text-right">
							{line.index}
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5">
							<input
								type="text"
								bind:value={$lines[i].name}
								class="h-5.5 w-full rounded-sm border border-neutral-300 px-1 text-sm"
								on:input={() => handleUpdateLineName(line.line)}
								on:blur={() => handleBlurLineName(line.line)}
							/>
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5 text-right">
							{line.x}
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5 text-right">
							{line.y}
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5 text-right">
							{line.angle}°
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5 text-right">
							{line.length}
						</div>
						<div class="border-b border-l border-inherit bg-inherit px-1 py-0.5">
							<div class="flex items-center gap-1">
								<Button
									size="xs"
									color={line.isLocked ? 'neutral' : 'light'}
									on:click={() => handleClickLock(line.line)}
									sr={line.isLocked ? 'Unlock' : 'Lock'}
								>
									<svelte:fragment slot="icon">
										{#if line.isLocked}
											<LockIcon class="size-[1em]" />
										{:else}
											<LockOpenIcon class="size-[1em]" />
										{/if}
									</svelte:fragment>
								</Button>
								<Button
									size="xs"
									color="red"
									on:click={() => handleClickDelete(line.line)}
									sr="Delete"
								>
									<TrashIcon slot="icon" class="size-[1em]" />
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
