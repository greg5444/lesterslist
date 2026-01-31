import db from './db';
import { LocalJam } from './localjam.model';

export async function getAllJams(): Promise<LocalJam[]> {
  return db<LocalJam>('localjams').select('*');
}
