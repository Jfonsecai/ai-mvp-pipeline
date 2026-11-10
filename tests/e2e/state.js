import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const stateFile = join(tmpdir(), 'vetcare-us023-e2e-state.json');
