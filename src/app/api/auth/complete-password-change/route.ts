import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// POST /api/auth/complete-password-change
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, newPassword } = body;

    const cleanUserId = String(userId || '').trim();
    const cleanPassword = String(newPassword || '').trim();

    if (!cleanUserId || !cleanPassword) {
      return NextResponse.json({ error: 'Usuário e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    // 1. Update password in Supabase Auth if service role key available
    if (serviceRoleKey) {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(cleanUserId, {
        password: cleanPassword,
        user_metadata: { must_change_password: false }
      });
      if (updateErr) {
        console.warn('Admin updateUserById error:', updateErr);
      }
    }

    // 2. Update profile table
    try {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', cleanUserId);
    } catch (profErr) {
      console.warn('Profile table update error (ignored if column missing):', profErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error completing password change:', err);
    return NextResponse.json({ error: err.message || 'Erro ao redefinir senha inicial.' }, { status: 500 });
  }
}
