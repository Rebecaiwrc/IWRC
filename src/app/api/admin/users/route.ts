import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Master client (Admin if service role key available, otherwise standard client)
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET /api/admin/users - List all users and their roles
export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
    }

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (pErr) throw pErr;

    return NextResponse.json({ profiles: profiles || [] });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ error: err.message || 'Erro ao listar usuários' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user directly in the system
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const cleanName = String(name || '').trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      return NextResponse.json({ error: 'E-mail, senha e nome são obrigatórios.' }, { status: 400 });
    }

    const userRole = role || 'BUYER';
    let userId: string;

    // 1. Try to create user via Admin API if service role key is set
    if (serviceRoleKey) {
      const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: { name: cleanName }
      });

      if (adminErr) throw adminErr;
      userId = adminUser.user.id;
    } else {
      // Fallback: standard sign-up
      const { data: authData, error: signErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { name: cleanName }
        }
      });

      if (signErr) throw signErr;
      if (!authData.user) throw new Error('Não foi possível gerar o usuário no Supabase Auth.');
      userId = authData.user.id;
    }

    // 2. Upsert profile in `profiles` table
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: userRole,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profErr) {
      console.warn('Profile upsert warning:', profErr);
    }

    return NextResponse.json({ 
      success: true, 
      user: profile || { id: userId, email, name, role: userRole } 
    });
  } catch (err: any) {
    console.error('Error creating user in admin API:', err);
    return NextResponse.json({ 
      error: err.message || 'Falha ao cadastrar novo usuário no Supabase.' 
    }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user role or name
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    const updates: any = {};
    if (role) updates.role = role;
    if (name) updates.name = name;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: err.message || 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Remove user profile
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    // 1. Delete from profiles
    const { error: pErr } = await supabase.from('profiles').delete().eq('id', id);
    if (pErr) throw pErr;

    // 2. Delete from auth.users if service role is available
    if (serviceRoleKey) {
      try {
        await supabase.auth.admin.deleteUser(id);
      } catch (authDelErr) {
        console.warn('Could not delete auth user:', authDelErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: err.message || 'Erro ao excluir usuário' }, { status: 500 });
  }
}
