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

// Helper to sanitize filename
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// GET /api/documents?supplierId=... - List all documents for a supplier
// GET /api/documents?all=true - List all documents across all suppliers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const isAll = searchParams.get('all') === 'true';

    if (isAll) {
      const { data: rootList, error: listErr } = await adminSupabase.storage
        .from('documents')
        .list('', { limit: 500 });

      if (listErr || !rootList) {
        return NextResponse.json({ documentsBySupplier: {} });
      }

      const documentsBySupplier: Record<string, AttachedDocument[]> = {};

      await Promise.all(
        rootList.map(async (item) => {
          if (!item.name || item.name.includes('.')) return;
          const supId = item.name;
          try {
            const metaPath = `${supId}/_docs_list.json`;
            const { data } = await adminSupabase.storage.from('documents').download(metaPath);
            if (data) {
              const text = await data.text();
              const docs: AttachedDocument[] = JSON.parse(text || '[]');
              if (Array.isArray(docs) && docs.length > 0) {
                documentsBySupplier[supId] = docs;
              }
            }
          } catch (e) {}
        })
      );

      return NextResponse.json({ documentsBySupplier });
    }

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId ou all=true é obrigatório' }, { status: 400 });
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

// POST /api/documents - Upload document(s) directly to Supabase Storage
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const now = new Date().toISOString();

    // 1. JSON Payload Handler (supports batch of base64 documents or pre-created records)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { supplierId, documents } = body;

      if (!supplierId) {
        return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
      }

      const docsToProcess: Partial<AttachedDocument>[] = Array.isArray(documents)
        ? documents
        : [body];

      // Download existing docs list
      const metaPath = `${supplierId}/_docs_list.json`;
      let currentList: AttachedDocument[] = [];
      const { data: existingData } = await adminSupabase.storage.from('documents').download(metaPath);
      if (existingData) {
        try {
          const text = await existingData.text();
          currentList = JSON.parse(text || '[]');
        } catch (e) {}
      }

      const processedDocs: AttachedDocument[] = [];

      for (const doc of docsToProcess) {
        const docId = doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const fileName = doc.name || 'documento';
        const cleanName = sanitizeFileName(fileName);
        let fileUrl = doc.file_url || '';
        let storagePath = (doc as any).file_path || '';

        // If base64 file_data is present and needs uploading to storage
        if (doc.file_data && doc.file_data.startsWith('data:')) {
          try {
            const matches = doc.file_data.match(/^data:([A-Za-z-+/0-9]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              const buffer = Buffer.from(base64Data, 'base64');
              storagePath = `${supplierId}/${docId}/${cleanName}`;

              const { error: upErr } = await adminSupabase.storage
                .from('documents')
                .upload(storagePath, buffer, {
                  contentType: mimeType || 'application/octet-stream',
                  upsert: true
                });

              if (!upErr) {
                const { data: pubData } = adminSupabase.storage
                  .from('documents')
                  .getPublicUrl(storagePath);
                fileUrl = pubData?.publicUrl || '';
              } else {
                console.error('Error uploading base64 file to storage:', upErr);
              }
            }
          } catch (b64Err) {
            console.error('Error decoding base64 file_data:', b64Err);
          }
        }

        const newDoc: AttachedDocument = {
          id: docId,
          supplier_id: supplierId,
          name: fileName,
          type: doc.type || 'other',
          file_url: fileUrl || (doc.file_url || undefined),
          file_data: fileUrl || (doc.file_url || undefined),
          file_path: storagePath || undefined,
          uploaded_at: doc.uploaded_at || now,
          size: doc.size || 'Arquivo',
          notes: doc.notes || ''
        };

        processedDocs.push(newDoc);
        currentList = [...currentList.filter(d => d.id !== docId), newDoc];
      }

      // Save updated _docs_list.json to Supabase storage
      await adminSupabase.storage.from('documents').upload(
        metaPath,
        Buffer.from(JSON.stringify(currentList, null, 2)),
        { contentType: 'application/json', upsert: true }
      );

      return NextResponse.json({
        document: processedDocs[0],
        documents: currentList
      });
    }

    // 2. FormData / Multipart Payload Handler (Direct file uploads)
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const supplierId = formData.get('supplierId') as string;
    const type = (formData.get('type') as AttachedDocument['type']) || 'other';
    const notes = (formData.get('notes') as string) || '';
    const customDocId = formData.get('id') as string | null;

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId é obrigatório' }, { status: 400 });
    }

    const docId = customDocId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let fileUrl = '';
    let storagePath = '';
    let fileName = 'Documento';
    let sizeStr = 'Arquivo';

    if (file) {
      fileName = file.name;
      const cleanName = sanitizeFileName(file.name);
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
      Buffer.from(JSON.stringify(updatedList, null, 2)),
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
      Buffer.from(JSON.stringify(filteredList, null, 2)),
      { contentType: 'application/json', upsert: true }
    );

    return NextResponse.json({ success: true, documents: filteredList });
  } catch (err: any) {
    console.error('Error deleting document:', err);
    return NextResponse.json({ error: err.message || 'Erro ao excluir documento' }, { status: 500 });
  }
}
