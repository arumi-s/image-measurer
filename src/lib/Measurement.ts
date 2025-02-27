import type { LineSegment } from './math';

export type MeasurementLine = LineSegment & {
	id: number;
	name: string;
	isHidden: boolean;
	isLocked: boolean;
};

export type LineSegmentEndpointType = 'start' | 'line' | 'end';

export type ClosestLineSegmentEndpoint = [MeasurementLine, LineSegmentEndpointType];

export interface MeasurementTreeLeaf {
	type: 'leaf';
	id: number;
}

export interface MeasurementTreeGroup {
	type: 'group';
	id: number;
	name: string;
	items: MeasurementTree[];
}

export type MeasurementTree = MeasurementTreeLeaf | MeasurementTreeGroup;

export function locateTreeLeaf(tree: MeasurementTree[], id: number): MeasurementTreeLeaf | null {
	for (const node of tree) {
		if (node.type === 'leaf' && node.id === id) {
			return node;
		}
		if (node.type === 'group') {
			const result = locateTreeLeaf(node.items, id);
			if (result) {
				return result;
			}
		}
	}
	return null;
}

export function removeTreeNode(tree: MeasurementTree[], id: number): MeasurementTree[] {
	for (const node of tree) {
		if (node.id === id) {
			const index = tree.indexOf(node);
			tree.splice(index, 1);
		}
		if (node.type === 'group') {
			node.items = removeTreeNode(node.items, id);
		}
	}
	return tree;
}

export function getMaxId(tree: MeasurementTree[]): number {
	return Math.max(
		...tree.flatMap((n) => (n.type === 'leaf' ? n.id : Math.max(n.id, getMaxId(n.items))))
	);
}

export function createTreeGroup(tree: MeasurementTree[], name: string): MeasurementTreeGroup {
	const nextId = getMaxId(tree) + 1;
	return { type: 'group', id: nextId, name, items: [] };
}

export interface MeasurementDisplayedLine {
	line: MeasurementLine;
	x: string;
	y: string;
	angle: string;
	length: string;
	isClosest: boolean;
}

export interface Measurement {
	name: string;
	image: string;
	lineColor: string;
	textColor: string;
	gridColor: string;
	gridSize: number;
	gridOffsetX: number;
	gridOffsetY: number;
	showGrid: boolean;
	showText: boolean;
	showReal: boolean;
	selectMode: boolean;
	autoLock: boolean;
	pixelPerfect: boolean;
	ratio: number;
	offsetX: number;
	offsetY: number;
	scale: number;
	lines: MeasurementLine[];
	hierarchy: MeasurementTree[];
}

export function createMeasurement(
	image: string,
	name: string | undefined = undefined
): Measurement {
	return {
		name: name ?? 'unnamed',
		image,
		lineColor: '#ff0000',
		textColor: '#000000',
		gridColor: '#cccccc',
		gridSize: 1,
		gridOffsetX: 0,
		gridOffsetY: 0,
		showGrid: false,
		showText: true,
		showReal: true,
		selectMode: true,
		autoLock: false,
		pixelPerfect: true,
		ratio: 1,
		offsetX: 0,
		offsetY: 0,
		scale: 1,
		lines: [],
		hierarchy: []
	};
}
