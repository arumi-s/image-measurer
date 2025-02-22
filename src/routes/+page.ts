import { selectMeasurements } from '$lib/db';
import type { PageLoad } from './$types';

export const load = (async () => {
	const rows = (await selectMeasurements()).sort(
		(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
	);

	return {
		rows
	};
}) satisfies PageLoad;
