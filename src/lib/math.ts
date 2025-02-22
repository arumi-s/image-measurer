export interface Vector2 {
	x: number;
	y: number;
}

export interface LineSegment {
	start: Vector2;
	end: Vector2;
}

export function lineSegmentLength(line: LineSegment) {
	return Math.hypot(line.start.x - line.end.x, line.start.y - line.end.y);
}

export function lineSegmentAngle(line: LineSegment) {
	return Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x);
}

export function lineSegmentMidpoint(line: LineSegment) {
	return {
		x: (line.start.x + line.end.x) / 2,
		y: (line.start.y + line.end.y) / 2
	};
}

export function roundVector(point: Vector2) {
	return { x: Math.round(point.x), y: Math.round(point.y) };
}

export function radianToDegree(radian: number) {
	return (radian * (180 / Math.PI) + 360) % 360;
}

export function closestDistanceFromLineSegment(point: Vector2, lineSegment: LineSegment): number {
	const a = lineSegment.start;
	const b = lineSegment.end;
	const p = point;

	// Vector from start to end of line segment
	const ab = { x: b.x - a.x, y: b.y - a.y };
	// Vector from start to point
	const ap = { x: p.x - a.x, y: p.y - a.y };

	// Calculate squared length of AB to avoid division if zero
	const abSquared = ab.x * ab.x + ab.y * ab.y;

	// Handle case where line segment is actually a single point
	if (abSquared === 0) {
		return Math.hypot(ap.x, ap.y);
	}

	// Calculate projection parameter t (clamped to [0,1])
	const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / abSquared));

	// Find closest projection point on the line segment
	const closest = {
		x: a.x + t * ab.x,
		y: a.y + t * ab.y
	};

	// Calculate distance between point and closest projection
	const dx = p.x - closest.x;
	const dy = p.y - closest.y;
	return Math.hypot(dx, dy);
}

export function alignVector(from: Vector2, to: Vector2): Vector2 {
	const angle = Math.atan2(to.y - from.y, to.x - from.x);
	const rounding = Math.PI / 4;
	const roundedAngle = Math.round(angle / rounding) * rounding;
	const length =
		roundedAngle % (Math.PI / 2) === 0
			? Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))
			: Math.hypot(to.x - from.x, to.y - from.y);
	return {
		x: from.x + Math.cos(roundedAngle) * length,
		y: from.y + Math.sin(roundedAngle) * length
	};
}
