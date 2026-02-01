import db from './db';
import { CampWorkshop } from './campworkshop.model';

export async function getAllCamps(): Promise<CampWorkshop[]> {
  return db<CampWorkshop>('camps').select('*');
}
