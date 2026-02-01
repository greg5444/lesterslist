import db from './db';
import { Band } from './band.model';

export async function getAllBands(): Promise<Band[]> {
  return db<Band>('bands').select('*');
}
