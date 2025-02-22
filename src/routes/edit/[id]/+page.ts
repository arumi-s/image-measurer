import type { PageLoad } from './$types';
import { selectMeasurement } from '$lib/db';
import { error } from '@sveltejs/kit';
import { createMeasurement } from '$lib/Measurement';

export const load = (async ({ params }) => {
	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		error(403, 'Invalid ID');
	}

	const measurementRow = await selectMeasurement(id);
	if (measurementRow == null) {
		error(404, 'Record not found');
	}

	return {
		id,
		measurement: Object.assign(createMeasurement(''), measurementRow.value)
	};
}) satisfies PageLoad;
