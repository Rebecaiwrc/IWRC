import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BuyerChecklist, LogisticsChecklist } from '@/types';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const adminSupabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function ensureBucket() {
  try {
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === 'documents')) {
      await adminSupabase.storage.createBucket('documents', { public: true });
    }
  } catch (e) {}
}

// Server-side cache for high performance
let memoryChecklistsCache: {
  buyerChecklists: Record<string, BuyerChecklist>;
  logisticsChecklists: Record<string, LogisticsChecklist>;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 10000; // 10 seconds

// GET /api/checklists?supplierId=...&type=buyer|logistics
// GET /api/checklists?all=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const type = searchParams.get('type') || 'buyer';
    const isAll = searchParams.get('all') === 'true';

    if (isAll) {
      const now = Date.now();
      if (memoryChecklistsCache && (now - memoryChecklistsCache.timestamp) < CACHE_TTL_MS) {
        return NextResponse.json({
          buyerChecklists: memoryChecklistsCache.buyerChecklists,
          logisticsChecklists: memoryChecklistsCache.logisticsChecklists
        });
      }

      await ensureBucket();
      let buyerChecklists: Record<string, BuyerChecklist> = {};
      let logisticsChecklists: Record<string, LogisticsChecklist> = {};

      // 1. Try reading fast global index
      try {
        const { data: indexData } = await adminSupabase.storage
          .from('documents')
          .download('_all_checklists_index.json');
        
        if (indexData) {
          const text = await indexData.text();
          const parsed = JSON.parse(text || '{}');
          buyerChecklists = parsed.buyerChecklists || {};
          logisticsChecklists = parsed.logisticsChecklists || {};
        }
      } catch (e) {}

      // If global index is empty, build it once
      if (Object.keys(buyerChecklists).length === 0 && Object.keys(logisticsChecklists).length === 0) {
        const { data: supRows } = await adminSupabase
          .from('suppliers')
          .select('id')
          .limit(100);

        const supplierIds = (supRows || []).map(r => r.id).filter(Boolean);

        await Promise.all(
          supplierIds.map(async (supId) => {
            // Fetch buyer checklist
            try {
              const { data: bData, error: bErr } = await adminSupabase.storage
                .from('documents')
                .download(`${supId}/_buyer_checklist.json`);
              if (bData && !bErr) {
                const text = await bData.text();
                const parsed = JSON.parse(text || '{}');
                if (parsed && Object.keys(parsed).length > 0) {
                  buyerChecklists[supId] = parsed;
                }
              }
            } catch (e) {}

            // Fetch logistics checklist
            try {
              const { data: lData, error: lErr } = await adminSupabase.storage
                .from('documents')
                .download(`${supId}/_logistics_checklist.json`);
              if (lData && !lErr) {
                const text = await lData.text();
                const parsed = JSON.parse(text || '{}');
                if (parsed && Object.keys(parsed).length > 0) {
                  logisticsChecklists[supId] = parsed;
                }
              }
            } catch (e) {}
          })
        );

        // Save global index for instant future queries
        if (Object.keys(buyerChecklists).length > 0 || Object.keys(logisticsChecklists).length > 0) {
          adminSupabase.storage.from('documents').upload(
            '_all_checklists_index.json',
            Buffer.from(JSON.stringify({ buyerChecklists, logisticsChecklists })),
            { contentType: 'application/json', upsert: true }
          ).catch(() => {});
        }
      }

      memoryChecklistsCache = {
        buyerChecklists,
        logisticsChecklists,
        timestamp: Date.now()
      };

      return NextResponse.json({ buyerChecklists, logisticsChecklists });
    }

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId ou all=true é obrigatório' }, { status: 400 });
    }

    // Check memory cache first
    if (memoryChecklistsCache) {
      if (type === 'buyer' && memoryChecklistsCache.buyerChecklists[supplierId]) {
        return NextResponse.json({ checklist: memoryChecklistsCache.buyerChecklists[supplierId] });
      }
      if (type === 'logistics' && memoryChecklistsCache.logisticsChecklists[supplierId]) {
        return NextResponse.json({ checklist: memoryChecklistsCache.logisticsChecklists[supplierId] });
      }
    }

    await ensureBucket();
    const filePath = `${supplierId}/_${type}_checklist.json`;
    const { data, error } = await adminSupabase.storage
      .from('documents')
      .download(filePath);

    if (error || !data) {
      return NextResponse.json({ checklist: null });
    }

    const text = await data.text();
    const checklist = JSON.parse(text || 'null');
    return NextResponse.json({ checklist });
  } catch (err: any) {
    console.error('Error fetching checklist from storage:', err);
    return NextResponse.json({ checklist: null });
  }
}

// POST /api/checklists - Save buyer or logistics checklist to Supabase Storage
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierId, type, checklist } = body;

    if (!supplierId || !type) {
      return NextResponse.json({ error: 'supplierId e type são obrigatórios' }, { status: 400 });
    }

    const filePath = `${supplierId}/_${type}_checklist.json`;

    if (!checklist) {
      // If null, delete the checklist file
      await adminSupabase.storage.from('documents').remove([filePath]);
      return NextResponse.json({ success: true, checklist: null });
    }

    const payloadBuffer = Buffer.from(JSON.stringify(checklist, null, 2));

    const { error: upErr } = await adminSupabase.storage
      .from('documents')
      .upload(filePath, payloadBuffer, {
        contentType: 'application/json',
        upsert: true
      });

    if (upErr) {
      console.error(`Error saving ${type} checklist to storage:`, upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Update memory cache
    if (memoryChecklistsCache) {
      if (type === 'buyer') {
        memoryChecklistsCache.buyerChecklists[supplierId] = checklist;
      } else {
        memoryChecklistsCache.logisticsChecklists[supplierId] = checklist;
      }
      memoryChecklistsCache.timestamp = Date.now();
    }

    // Update global index in background
    adminSupabase.storage.from('documents').download('_all_checklists_index.json').then(async ({ data: gData }) => {
      let gIndex: { buyerChecklists: Record<string, BuyerChecklist>; logisticsChecklists: Record<string, LogisticsChecklist> } = {
        buyerChecklists: {},
        logisticsChecklists: {}
      };
      if (gData) {
        try { gIndex = JSON.parse(await gData.text() || '{}'); } catch (e) {}
      }
      if (type === 'buyer') {
        gIndex.buyerChecklists[supplierId] = checklist;
      } else {
        gIndex.logisticsChecklists[supplierId] = checklist;
      }
      await adminSupabase.storage.from('documents').upload(
        '_all_checklists_index.json',
        Buffer.from(JSON.stringify(gIndex)),
        { contentType: 'application/json', upsert: true }
      );
    }).catch(() => {});

    return NextResponse.json({ success: true, checklist });
  } catch (err: any) {
    console.error('Error saving checklist:', err);
    return NextResponse.json({ error: err.message || 'Erro ao salvar checklist' }, { status: 500 });
  }
}
