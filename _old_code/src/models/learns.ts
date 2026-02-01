import db from './db';
import { LearnToPlay } from './learntoplay.model';

export async function getAllLearnToPlay(): Promise<LearnToPlay[]> {
  return db<LearnToPlay>('learntoplay').select('*');
}
