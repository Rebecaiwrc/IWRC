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

// GET /api/checklists?supplierId=...&type=buyer|logistics
// GET /api/checklists?all=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const type = searchParams.get('type') || 'buyer';
    const isAll = searchParams.get('all') === 'true';

    if (isAll) {
      const { data: rootList, error: listErr } = await adminSupabase.storage
        .from('documents')
        .list('', { limit: 500 });

      if (listErr || !rootList) {
        return NextResponse.json({ buyerChecklists: {}, logisticsChecklists: {} });
      }

      const buyerChecklists: Record<string, BuyerChecklist> = {};
      const logisticsChecklists: Record<string, LogisticsChecklist> = {};

      await Promise.all(
        rootList.map(async (item) => {
          if (!item.name || item.name.includes('.')) return;
          const supId = item.name;

          // Fetch buyer checklist
          try {
            const { data: bData } = await adminSupabase.storage
              .from('documents')
              .download(`${supId}/_buyer_checklist.json`);
            if (bData) {
              const text = await bData.text();
              const parsed = JSON.parse(text || '{}');
              if (parsed && Object.keys(parsed).length > 0) {
                buyerChecklists[supId] = parsed;
              }
            }
          } catch (e) {}

          // Fetch logistics checklist
          try {
            const { data: lData } = await adminSupabase.storage
              .from('documents')
              .download(`${supId}/_logistics_checklist.json`);
            if (lData) {
              const text = await lData.text();
              const parsed = JSON.parse(text || '{}');
              if (parsed && Object.keys(parsed).length > 0) {
                logisticsChecklists[supId] = parsed;
              }
            }
          } catch (e) {}
        })
      );

      return NextResponse.json({ buyerChecklists, logisticsChecklists });
    }

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId ou all=true é obrigatório' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, checklist });
  } catch (err: any) {
    console.error('Error saving checklist:', err);
    return NextResponse.json({ error: err.message || 'Erro ao salvar checklist' }, { status: 500 });
  }
}
