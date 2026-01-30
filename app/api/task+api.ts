import { deferTask, runTask } from 'expo-server';
import { readStore, storeNote, writeStore, type TaskEntry } from './_taskStore';

type TaskResponse = {
  success: boolean;
  entry?: TaskEntry;
  archive?: TaskEntry[];
  stats?: {
    total: number;
    auditLogCount: number;
  };
  note?: string;
  error?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitValue = Number(url.searchParams.get('limit') ?? 10);
  const limit = Math.min(Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 10, 25);

  const store = await readStore();
  console.log('[Task API] GET - Archive size:', store.tasks.length, 'Audit logs:', store.auditLogCount);

  const response: TaskResponse = {
    success: true,
    archive: store.tasks.slice(0, limit),
    stats: {
      total: store.tasks.length,
      auditLogCount: store.auditLogCount,
    },
    note: storeNote,
  };

  return Response.json(response);
}

export async function DELETE() {
  try {
    const store = await readStore();
    const next = { ...store, tasks: [], auditLogCount: 0 };
    await writeStore(next);
    console.log('[Task API] DELETE - Store reset');
    return Response.json({ success: true });
  } catch (error) {
    console.error('[Task API] DELETE error:', error);
    return Response.json({ success: false, error: 'Failed to reset tasks.' }, { status: 500 });
  }
}
export async function POST() {
  try {
    const entry: TaskEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      task: 'Demo task',
      createdAt: new Date().toISOString(),
      status: 'scheduled',
    };

    console.log('[Task API] POST - Scheduling task:', entry.id);

    runTask(async () => {
      try {
        console.log('[Task API] runTask - Starting task:', entry.id);
        await sleep(900);
        const store = await readStore();
        const startedEntry: TaskEntry = {
          ...entry,
          status: 'started',
          startedAt: new Date().toISOString(),
        };
        const nextTasks = [startedEntry, ...store.tasks].slice(0, 25);
        await writeStore({
          ...store,
          tasks: nextTasks,
          auditLogCount: store.auditLogCount + 1,
        });
        console.log('[Task API] runTask - Started:', entry.id, '| Archive size:', nextTasks.length);
      } catch (error) {
        console.error('[Task API] runTask error:', error);
      }
    });

    deferTask(async () => {
      try {
        console.log('[Task API] deferTask - Deferring task:', entry.id);
        await sleep(1200);
        const store = await readStore();
        const index = store.tasks.findIndex((item) => item.id === entry.id);
        if (index >= 0) {
          const deferredTasks = [...store.tasks];
          deferredTasks[index] = {
            ...deferredTasks[index],
            status: 'deferred',
            deferredAt: new Date().toISOString(),
          };
          await writeStore({ ...store, tasks: deferredTasks });
          console.log('[Task API] deferTask - Deferred:', entry.id, 'at index', index);
        } else {
          console.warn('[Task API] deferTask - Entry not found:', entry.id);
        }
      } catch (error) {
        console.error('[Task API] deferTask error:', error);
      }
    });

    console.log('[Task API] POST - Returning response (tasks scheduled)');
    const response: TaskResponse = {
      success: true,
      entry,
      note: 'runTask starts the task after a short delay, deferTask marks it deferred after the response.',
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('[Task API] POST error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to create a task.',
      },
      { status: 500 }
    );
  }
}
