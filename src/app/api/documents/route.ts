import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AttachedDocument } from '@/types';

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

// GET /api/documents?supplierId=... - List all documents for a supplier
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    const metaPath = `${supplierId}/_docs_list.json`;
    const { data, error } = await adminSupabase.storage.from('documents').download(metaPath);

    if (error || !data) {
      return NextResponse.json({ documents: [] });
    }

    const text = await data.text();
    const docs: AttachedDocument[] = JSON.parse(text || '[]');
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    console.error('Error fetching documents list:', err);
    return NextResponse.json({ documents: [] });
  }
}

// POST /api/documents - Upload a document directly to Supabase Storage via Server Admin
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const supplierId = formData.get('supplierId') as string;
    const type = (formData.get('type') as AttachedDocument['type']) || 'other';
    const notes = (formData.get('notes') as string) || '';
    const customDocId = formData.get('id') as string | null;

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const docId = customDocId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let fileUrl = '';
    let storagePath = '';
    let fileName = 'Documento';
    let sizeStr = 'Arquivo';

    if (file) {
      fileName = file.name;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      storagePath = `${supplierId}/${docId}/${cleanName}`;
      sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: upErr } = await adminSupabase.storage
        .from('documents')
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true
        });

      if (upErr) {
        console.error('Admin storage upload error:', upErr);
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }

      const { data: pubData } = adminSupabase.storage
        .from('documents')
        .getPublicUrl(storagePath);
      fileUrl = pubData?.publicUrl || '';
    }

    const newDoc: AttachedDocument = {
      id: docId,
      supplier_id: supplierId,
      name: fileName,
      type: type || 'other',
      file_url: fileUrl || undefined,
      file_data: fileUrl || undefined,
      file_path: storagePath || undefined,
      uploaded_at: now,
      size: sizeStr,
      notes: notes || ''
    };

    // Update cloud _docs_list.json
    const metaPath = `${supplierId}/_docs_list.json`;
    let currentList: AttachedDocument[] = [];
    const { data: existingData } = await adminSupabase.storage.from('documents').download(metaPath);
    if (existingData) {
      try {
        const text = await existingData.text();
        currentList = JSON.parse(text || '[]');
      } catch (e) {}
    }

    const updatedList = [...currentList.filter(d => d.id !== docId), newDoc];
    await adminSupabase.storage.from('documents').upload(
      metaPath,
      Buffer.from(JSON.stringify(updatedList)),
      { contentType: 'application/json', upsert: true }
    );

    return NextResponse.json({ document: newDoc, documents: updatedList });
  } catch (err: any) {
    console.error('Error handling document upload:', err);
    return NextResponse.json({ error: err.message || 'Erro no upload do documento' }, { status: 500 });
  }
}

// DELETE /api/documents?supplierId=...&docId=... - Delete a document from Storage
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const docId = searchParams.get('docId');

    if (!supplierId || !docId) {
      return NextResponse.json({ error: 'supplierId e docId são obrigatórios' }, { status: 400 });
    }

    const metaPath = `${supplierId}/_docs_list.json`;
    let currentList: AttachedDocument[] = [];
    const { data: existingData } = await adminSupabase.storage.from('documents').download(metaPath);
    if (existingData) {
      try {
        const text = await existingData.text();
        currentList = JSON.parse(text || '[]');
      } catch (e) {}
    }

    const docToDelete = currentList.find(d => d.id === docId);
    if (docToDelete && (docToDelete as any).file_path) {
      await adminSupabase.storage.from('documents').remove([(docToDelete as any).file_path]);
    }

    const filteredList = currentList.filter(d => d.id !== docId);
    await adminSupabase.storage.from('documents').upload(
      metaPath,
      Buffer.from(JSON.stringify(filteredList)),
      { contentType: 'application/json', upsert: true }
    );

    return NextResponse.json({ success: true, documents: filteredList });
  } catch (err: any) {
    console.error('Error deleting document:', err);
    return NextResponse.json({ error: err.message || 'Erro ao excluir documento' }, { status: 500 });
  }
}
