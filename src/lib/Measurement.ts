import type { LineSegment } from './math';

export type MeasurementLine = LineSegment & {
	name: string;
	isLocked: boolean;
};

export type LineSegmentEndpointType = 'start' | 'line' | 'end';

export type ClosestLineSegmentEndpoint = [MeasurementLine, LineSegmentEndpointType];

export interface Measurement {
	name: string;
	image: string;
	lineColor: string;
	textColor: string;
	showReal: boolean;
	selectMode: boolean;
	autoLock: boolean;
	pixelPerfect: boolean;
	ratio: number;
	offsetX: number;
	offsetY: number;
	scale: number;
	lines: MeasurementLine[];
}

export function createMeasurement(
	image: string,
	name: string | undefined = undefined
): Measurement {
	return {
		name: name ?? 'unnamed',
		image,
		lineColor: '#f00',
		textColor: '#000',
		showReal: true,
		selectMode: true,
		autoLock: false,
		pixelPerfect: true,
		ratio: 1,
		offsetX: 0,
		offsetY: 0,
		scale: 1,
		lines: []
	};
}
