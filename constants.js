import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../');
export const ENTRIES_DIR = resolve(ROOT_DIR, 'entries');
