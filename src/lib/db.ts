import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Measurement } from './Measurement';

export interface MeasurementDBRow {
	id?: number;
	value: Measurement;
	createdAt: Date;
	updatedAt: Date;
}

export interface MeasurementsDB extends DBSchema {
	measurements: {
		key: number;
		value: MeasurementDBRow;
		indexes: {
			'by-createdAt': Date;
			'by-updatedAt': Date;
		};
	};
}

const DB_NAME = 'measurements';
const DB_VERSION = 1;
let DB: IDBPDatabase<MeasurementsDB> | null = null;

export const getDB = async () => {
	if (DB == null) {
		DB = await openDB<MeasurementsDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const store = db.createObjectStore('measurements', {
					keyPath: 'id',
					autoIncrement: true
				});
				store.createIndex('by-createdAt', 'createdAt');
				store.createIndex('by-updatedAt', 'updatedAt');
			}
		});
	}
	return DB;
};

export async function insertMeasurement(data: Measurement): Promise<number> {
	const db = await getDB();
	const id = await db.add('measurements', {
		value: data,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	return id;
}

export async function selectMeasurements(): Promise<MeasurementDBRow[]> {
	const db = await getDB();
	return db.getAll('measurements');
}

export async function selectMeasurement(id: number): Promise<MeasurementDBRow | undefined> {
	const db = await getDB();
	return db.get('measurements', id);
}

export async function updateMeasurement(id: number, newValue: Measurement): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('measurements', 'readwrite');
	const store = tx.objectStore('measurements');

	const measurement = await store.get(id);
	if (!measurement) {
		throw new Error('Measurement not found');
	}

	measurement.value = newValue;
	measurement.updatedAt = new Date();

	await store.put(measurement);
	await tx.done;
}

export async function deleteMeasurement(id: number): Promise<void> {
	const db = await getDB();
	await db.delete('measurements', id);
}
