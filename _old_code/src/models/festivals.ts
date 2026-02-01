import db from './db';
import { Festival } from './festival.model';

export async function getAllFestivals(): Promise<Festival[]> {
  return db<Festival>('festivals').select('*');
}
