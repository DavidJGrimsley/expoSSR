import { deferTask, runTask } from 'expo-server';
import { readStore, storeNote, updateStore, type GardenSeed } from './_taskStore';

type GardenResponse = {
  success: boolean;
  seed?: GardenSeed;
  garden?: GardenSeed[];
  note?: string;
  error?: string;
};

const blooms = [
  { emoji: '🌸', color: 'Pink' },
  { emoji: '🌼', color: 'Golden' },
  { emoji: '🌺', color: 'Coral' },
  { emoji: '🌻', color: 'Sunflower' },
  { emoji: '🪻', color: 'Violet' },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitValue = Number(url.searchParams.get('limit') ?? 50);
  const limit = Math.min(Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 50, 50);

  const store = await readStore();
  const now = Date.now();
  let needsUpdate = false;
  const reconciledGarden = store.garden.map((seed) => {
    if (seed.stage !== 'bloom' && seed.bloomAt) {
      const bloomTime = new Date(seed.bloomAt).getTime();
      if (!Number.isNaN(bloomTime) && bloomTime <= now) {
        needsUpdate = true;
        const bloom = pick(blooms);
        return {
          ...seed,
          stage: 'bloom' as const,
          emoji: bloom.emoji,
          color: bloom.color,
          bloomedAt: new Date().toISOString(),
        };
      }
    }
    return seed;
  });

  if (needsUpdate) {
    await updateStore((current) => ({ ...current, garden: reconciledGarden }));
  }

  console.log('[Garden API] GET - Garden size:', store.garden.length);

  const response: GardenResponse = {
    success: true,
    garden: reconciledGarden.slice(0, limit),
    note: storeNote,
  };

  return Response.json(response);
}

export async function POST() {
  try {
    const bloomDelay = 2000 + Math.floor(Math.random() * 8000);
    const bloomAt = new Date(Date.now() + bloomDelay).toISOString();
    const seed: GardenSeed = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      plantedAt: new Date().toISOString(),
      stage: 'queued',
      bloomAt,
    };

    console.log('[Garden API] POST - Creating seed:', seed.id);

    runTask(async () => {
      try {
        console.log('[Garden API] runTask - Starting plant for:', seed.id);
        await sleep(300);
        const plantedSeed: GardenSeed = { ...seed, stage: 'seed' };
        const nextStore = await updateStore((current) => {
          const nextGarden = [plantedSeed, ...current.garden.filter((item) => item.id !== seed.id)].slice(0, 50);
          return { ...current, garden: nextGarden };
        });
        console.log('[Garden API] runTask - Planted:', seed.id, '| Garden size:', nextStore.garden.length);
      } catch (error) {
        console.error('[Garden API] runTask error:', error);
      }
    });

    deferTask(async () => {
      try {
        console.log('[Garden API] deferTask - Starting bloom for:', seed.id, 'in', bloomDelay, 'ms');
        await sleep(bloomDelay);
        const bloom = pick(blooms);
        const nextStore = await updateStore((current) => {
          const index = current.garden.findIndex((item) => item.id === seed.id);
          if (index === -1) {
            return current;
          }
          const enrichedGarden = [...current.garden];
          enrichedGarden[index] = {
            ...enrichedGarden[index],
            stage: 'bloom',
            emoji: bloom.emoji,
            color: bloom.color,
            bloomedAt: new Date().toISOString(),
          };
          return { ...current, garden: enrichedGarden };
        });
        const updatedIndex = nextStore.garden.findIndex((item) => item.id === seed.id);
        if (updatedIndex >= 0) {
          console.log('[Garden API] deferTask - Bloomed:', seed.id, 'as', bloom.emoji, 'at index', updatedIndex);
        } else {
          console.warn('[Garden API] deferTask - Seed not found:', seed.id);
        }
      } catch (error) {
        console.error('[Garden API] deferTask error:', error);
      }
    });

    console.log('[Garden API] POST - Returning response (tasks scheduled)');
    const response: GardenResponse = {
      success: true,
      seed,
      note: 'runTask plants the seed, deferTask blooms it after the response.',
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('[Garden API] POST error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to plant a seed.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await updateStore((current) => ({ ...current, garden: [] }));
    console.log('[Garden API] DELETE - Garden reset');
    return Response.json({ success: true, note: 'Garden reset.' });
  } catch (error) {
    console.error('[Garden API] DELETE error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to reset garden.',
      },
      { status: 500 }
    );
  }
}
