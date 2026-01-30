type StoreBlob = {
  fortunes?: TaskEntry[];
  tasks?: TaskEntry[];
  garden?: GardenSeed[];
  auditLogCount?: number;
};

export type TaskEntry = {
  id: string;
  task: string;
  createdAt: string;
  status: 'scheduled' | 'started' | 'deferred';
  startedAt?: string;
  deferredAt?: string;
};

export type GardenSeed = {
  id: string;
  plantedAt: string;
  stage: 'queued' | 'seed' | 'bloom';
  emoji?: string;
  color?: string;
  bloomAt?: string;
  bloomedAt?: string;
};

export type TaskStore = {
  tasks: TaskEntry[];
  garden: GardenSeed[];
  auditLogCount: number;
};

const canUseFs = typeof process !== 'undefined' && !!process.versions?.node;
let memoryStore: TaskStore = {
  tasks: [],
  garden: [],
  auditLogCount: 0,
};

let storeWriteQueue: Promise<void> = Promise.resolve();

const getStorePath = async () => {
  if (!canUseFs) {
    return null;
  }

  const path = await import('path');
  return path.join(process.cwd(), 'temp', 'task-store.json');
};

const getLockPath = async () => {
  if (!canUseFs) {
    return null;
  }

  const path = await import('path');
  return path.join(process.cwd(), 'temp', 'task-store.lock');
};

const withStoreLock = async <T,>(action: () => Promise<T>): Promise<T> => {
  if (!canUseFs) {
    return action();
  }

  const fs = await import('fs/promises');
  const lockPath = await getLockPath();
  if (!lockPath) {
    return action();
  }

  let lockHandle: Awaited<ReturnType<typeof fs.open>> | null = null;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      lockHandle = await fs.open(lockPath, 'wx');
      break;
    } catch (error: any) {
      if (error?.code !== 'EEXIST') {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  try {
    if (!lockHandle) {
      console.warn('[TaskStore] Lock wait timed out, proceeding without lock.');
      return await action();
    }
    return await action();
  } finally {
    try {
      await lockHandle?.close();
    } catch (error) {
      console.warn('[TaskStore] Failed to close lock handle.', error);
    }
    try {
      await fs.unlink(lockPath);
    } catch (_error) {
      void _error;
      // Ignore lock cleanup errors.
    }
  }
};

const parseStore = (raw: string | null): TaskStore => {
  if (!raw) {
    return { ...memoryStore };
  }

  try {
    const parsed = JSON.parse(raw) as StoreBlob;
    const parsedTasks = parsed.tasks ?? parsed.fortunes ?? [];
    return {
      tasks: parsedTasks,
      garden: parsed.garden ?? [],
      auditLogCount: parsed.auditLogCount ?? 0,
    };
  } catch (error) {
    console.warn('[TaskStore] Failed to parse store JSON, using memory store.', error);
    return { ...memoryStore };
  }
};

export const readStore = async (): Promise<TaskStore> => {
  if (!canUseFs) {
    return { ...memoryStore };
  }

  try {
    const fs = await import('fs/promises');
    const storePath = await getStorePath();
    if (!storePath) {
      return { ...memoryStore };
    }

    const raw = await fs.readFile(storePath, 'utf8');
    const store = parseStore(raw);
    memoryStore = store;
    return store;
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      await writeStore(memoryStore);
      return { ...memoryStore };
    }

    console.warn('[TaskStore] Failed to read store, using memory store.', error);
    return { ...memoryStore };
  }
};

export const writeStore = async (nextStore: TaskStore): Promise<void> => {
  memoryStore = nextStore;

  if (!canUseFs) {
    return;
  }

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const storePath = await getStorePath();
    if (!storePath) {
      return;
    }

    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(nextStore, null, 2), 'utf8');
  } catch (error) {
    console.warn('[TaskStore] Failed to write store.', error);
  }
};

export const updateStore = async (
  updater: (store: TaskStore) => TaskStore | Promise<TaskStore>
): Promise<TaskStore> => {
  let nextStore: TaskStore = { ...memoryStore };

  storeWriteQueue = storeWriteQueue
    .then(async () => {
      await withStoreLock(async () => {
        const current = await readStore();
        nextStore = await updater(current);
        await writeStore(nextStore);
      });
    })
    .catch((error) => {
      console.warn('[TaskStore] Failed to update store.', error);
    });

  await storeWriteQueue;
  return nextStore;
};

export const storeNote = canUseFs
  ? 'Stored in a local JSON file during development. On serverless hosts this resets per worker.'
  : 'Stored in-memory only. On serverless hosts this resets per worker.';
