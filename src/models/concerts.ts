import db from './db';
import { Concert } from './concert.model';

export async function getAllConcerts(): Promise<Concert[]> {
  return db<Concert>('concerts').select('*');
}
