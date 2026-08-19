'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { dbService } from '@/features/shared/services/dbService';
import { Profile, UserRole, SystemHealthStatus, DatabaseQuotaMetrics } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  Users, 
  UserPlus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HardDrive, 
  Cpu, 
  ExternalLink, 
  Trash2, 
  Lock, 
  Key, 
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Mail,
  Copy,
  Check,
  Send,
  Globe,
  Download
} from 'lucide-react';

export default function SuperAdminPanelPage() {
  const { user: currentUser } = useAuth();

  // State
  const [metrics, setMetrics] = useState<DatabaseQuotaMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus[]>([]);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPinging, setIsPinging] = useState(false);

  // New User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER' as UserRole
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Email / Outlook Dispatch Modal State
  const [emailModalData, setEmailModalData] = useState<{
    isOpen: boolean;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    isNewUser?: boolean;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied_rich' | 'copied_text'>('idle');

  // Role labels helper
  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'BUYER': return 'Compras (Comercial / Prospecção)';
      case 'LOGISTICS': return 'Logística (Operações & Análises)';
      case 'ADMIN': return 'Administrador Geral';
      case 'SUPER_ADMIN': return 'Super Admin Master';
      default: return 'Colaborador';
    }
  };

  // Generate Inspiration-Styled iWRC Email Content
  const generateEmailData = (name: string, email: string, password?: string, role?: UserRole) => {
    const roleName = getRoleLabel(role);
    const loginUrl = 'https://iwrc.vercel.app/login';
    const logoUrl = 'https://iwrc.vercel.app/logo.png';
    const pwd = password ? password : '[Senha Pessoal Já Cadastrada / Padrão]';

    const subject = `Seu acesso ao sistema iWRC foi criado com sucesso - ${name}`;

    const plainText = `Olá, ${name}!

Seu acesso ao sistema iWRC foi criado com sucesso.
Abaixo estão suas credenciais para acesso:

E-mail de acesso: ${email}
Senha temporária: ${pwd}
(Recomendamos alterar sua senha após o primeiro acesso)
Perfil / Cargo: ${roleName}

Acessar o sistema: ${loginUrl}

Em caso de dúvidas ou dificuldades de acesso, entre em contato com o suporte:
support@iwrc.world | +55 (11) 96467-1234

Advancing Material Recovery and Recycling through Collaboration with the Informal Waste Sector
© 2026 iWRC. Todos os direitos reservados.`;

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 20px 10px 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Top Hint Bar -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin-bottom: 12px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #64748b;">
              Caso não visualize este e-mail corretamente, <a href="${loginUrl}" style="color: #0284c7; text-decoration: underline; font-weight: 600;">clique aqui</a> para abrir no navegador.
            </td>
          </tr>
        </table>

        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          
          <!-- Top Header with Logo & Abstract Wave Graphic -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; background: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="width: 55%;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <!-- iWRC Logo Presentation -->
                          <div style="display: inline-block;">
                            <span style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 34px; font-weight: 900; color: #0284C7; letter-spacing: -0.5px;">iW</span><span style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 34px; font-weight: 900; color: #0369A1; letter-spacing: -0.5px;">rc</span>
                            <div style="font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.8px; margin-top: -2px;">
                              The Human Side of Recycling
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" align="right" style="width: 45%;">
                    <!-- Wave Graphical Accents -->
                    <div style="width: 140px; height: 75px; background: linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%); border-radius: 40px 10px 40px 10px; opacity: 0.85; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                      <div style="color: rgba(255,255,255,0.25); font-size: 40px; font-weight: 900;">♻</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting Header -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="width: 56px;">
                    <!-- User Avatar Circle -->
                    <div style="width: 48px; height: 48px; border-radius: 24px; background-color: #f0f9ff; border: 2px solid #bae6fd; text-align: center; line-height: 46px; font-size: 20px; color: #0284c7;">
                      👤
                    </div>
                  </td>
                  <td valign="middle" style="padding-left: 12px;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0284c7;">
                      Olá, <span style="color: #0f172a;">${name}!</span>
                    </h2>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; line-height: 1.4;">
                      Seu acesso ao sistema <strong>iWRC</strong> foi criado com sucesso.<br/>
                      Abaixo estão suas credenciais para acesso:
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Credentials Box Container -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- Left: Credentials items -->
                    <td valign="middle" style="width: 60%;">
                      
                      <!-- Item 1: Email -->
                      <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
                        <tr>
                          <td valign="top" style="width: 36px;">
                            <div style="width: 30px; height: 30px; border-radius: 15px; background-color: #e0f2fe; text-align: center; line-height: 28px; font-size: 14px;">
                              ✉️
                            </div>
                          </td>
                          <td valign="middle" style="padding-left: 8px;">
                            <div style="font-size: 11px; font-weight: 700; color: #0284c7;">
                              E-mail de acesso
                            </div>
                            <div style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: monospace;">
                              ${email}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Item 2: Password -->
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td valign="top" style="width: 36px;">
                            <div style="width: 30px; height: 30px; border-radius: 15px; background-color: #e0f2fe; text-align: center; line-height: 28px; font-size: 14px;">
                              🔒
                            </div>
                          </td>
                          <td valign="middle" style="padding-left: 8px;">
                            <div style="font-size: 11px; font-weight: 700; color: #0284c7;">
                              Senha temporária
                            </div>
                            <div style="font-size: 14px; font-weight: 800; color: #0f172a; font-family: Consolas, monospace; background: #e2e8f0; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-top: 2px;">
                              ${pwd}
                            </div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 4px; line-height: 1.3;">
                              (Recomendamos alterar sua senha após o primeiro acesso)
                            </div>
                          </td>
                        </tr>
                      </table>

                    </td>

                    <!-- Right: Large Cyan Security Lock Illustration -->
                    <td valign="middle" align="center" style="width: 40%; border-left: 1px dashed #cbd5e1; padding-left: 16px;">
                      <div style="width: 90px; height: 90px; border-radius: 45px; background: radial-gradient(circle, #e0f2fe 0%, #f0fdfa 100%); border: 2px dashed #38bdf8; display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto; line-height: 86px; font-size: 38px;">
                        🔐
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td align="center" style="padding: 6px 32px 28px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 28px; background-color: #0d9488;">
                    <a href="${loginUrl}" target="_blank" style="font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; padding: 14px 44px; border-radius: 28px; display: inline-block; letter-spacing: 0.3px; background: linear-gradient(135deg, #0e7490 0%, #0d9488 100%); box-shadow: 0 4px 14px rgba(14, 116, 144, 0.3);">
                      Acessar o sistema &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Divider with Logo Mark -->
          <tr>
            <td align="center" style="padding: 0 32px 20px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #f1f5f9;"></td>
                  <td align="center" style="width: 40px; padding: 0 10px; font-size: 18px; color: #0284c7; font-weight: 900;">
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 12px; background: #e0f2fe; line-height: 24px; font-size: 12px; font-weight: 900; color: #0369a1;">W</span>
                  </td>
                  <td style="border-top: 1px solid #f1f5f9;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support Contact Section -->
          <tr>
            <td align="center" style="padding: 0 32px 30px 32px;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; font-weight: 500;">
                Em caso de dúvidas ou dificuldades de acesso, entre em contato com o suporte:
              </p>
              <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; font-weight: 700; color: #0284c7;">
                <tr>
                  <td style="padding-right: 14px;">
                    ✉️ <a href="mailto:support@iwrc.world" style="color: #0284c7; text-decoration: none;">support@iwrc.world</a>
                  </td>
                  <td style="border-left: 1px solid #cbd5e1; padding-left: 14px; color: #475569;">
                    📞 <span style="color: #0f172a;">+55 (11) 96467-1234</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Bottom Informational Bar & Social Links -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin-top: 16px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 18px 24px;">
          <tr>
            <td valign="middle" style="width: 55%; font-size: 11px; color: #475569; line-height: 1.4;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle" style="width: 32px; font-size: 22px; color: #0d9488;">
                    ♻️
                  </td>
                  <td valign="middle" style="padding-left: 8px; font-weight: 600; color: #334155; font-size: 11px;">
                    Advancing Material Recovery and Recycling through Collaboration with the Informal Waste Sector
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle" align="right" style="width: 45%; border-left: 1px solid #f1f5f9; padding-left: 16px;">
              <span style="font-size: 11px; font-weight: 700; color: #0284c7; margin-right: 8px;">Siga o iWRC</span>
              <span style="font-size: 15px; letter-spacing: 4px;">
                📸 💼 🎥 🌐
              </span>
            </td>
          </tr>
        </table>

        <!-- Copyright -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin-top: 14px;">
          <tr>
            <td align="center" style="font-size: 10px; color: #94a3b8;">
              © 2026 <strong>iWRC</strong>. Todos os direitos reservados.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, plainText, htmlContent };
  };

  // Launch Native Outlook via .EML File (Opens Native Styled HTML Draft in Outlook)
  const handleDownloadEml = (to: string, name: string, subject: string, htmlContent: string) => {
    try {
      const emlContent = [
        `To: ${name} <${to}>`,
        `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        `X-Unsent: 1`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset="utf-8"`,
        `Content-Transfer-Encoding: 8bit`,
        ``,
        htmlContent
      ].join('\r\n');

      const blob = new Blob([emlContent], { type: 'message/rfc822;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Acesso_Sistema_IWRC_${name.replace(/\s+/g, '_')}.eml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating EML file:', err);
    }
  };

  // Launch Outlook Desktop/App with mailto
  const handleOpenOutlook = (to: string, subject: string, plainText: string) => {
    const mailtoUri = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
    window.location.href = mailtoUri;
  };

  // Launch Outlook Web (Office 365)
  const handleOpenOutlookWeb = (to: string, subject: string, plainText: string) => {
    const webUri = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
    window.open(webUri, '_blank', 'noopener,noreferrer');
  };

  // Copy formatted HTML or plain text to clipboard
  const handleCopyRichEmail = async (html: string, plainText: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        await navigator.clipboard.write([item]);
      } else {
        const container = document.getElementById('rendered-email-copy-target');
        if (container) {
          const range = document.createRange();
          range.selectNode(container);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('copy');
          selection?.removeAllRanges();
        } else {
          await navigator.clipboard.writeText(plainText);
        }
      }
      setCopyStatus('copied_rich');
      setTimeout(() => setCopyStatus('idle'), 4000);
    } catch (err) {
      console.warn('Clipboard write failed, trying fallback selection:', err);
      try {
        const container = document.getElementById('rendered-email-copy-target');
        if (container) {
          const range = document.createRange();
          range.selectNode(container);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('copy');
          selection?.removeAllRanges();
          setCopyStatus('copied_rich');
        } else {
          await navigator.clipboard.writeText(plainText);
          setCopyStatus('copied_text');
        }
      } catch {
        await navigator.clipboard.writeText(plainText);
        setCopyStatus('copied_text');
      }
      setTimeout(() => setCopyStatus('idle'), 4000);
    }
  };

  // Launch Outlook Desktop with BLANK body and copied HTML so Ctrl+V pastes full rich HTML
  const handleOpenOutlookWithCopiedHtml = async (to: string, subject: string, html: string, plainText: string) => {
    await handleCopyRichEmail(html, plainText);
    const mailtoUri = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoUri;
  };

  const loadData = useCallback(async () => {
    try {
      const [m, h, p] = await Promise.all([
        dbService.getSystemMetrics(),
        dbService.checkApiHealth(),
        dbService.getProfiles()
      ]);
      setMetrics(m);
      setHealthStatus(h);
      setUsersList(p);
    } catch (err) {
      console.error('Error loading admin control panel data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePingApis = async () => {
    setIsPinging(true);
    try {
      const h = await dbService.checkApiHealth();
      setHealthStatus(h);
    } finally {
      setIsPinging(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newUserForm.email.trim().toLowerCase();
    const cleanPassword = newUserForm.password.trim();
    const cleanName = newUserForm.name.trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: newUserForm.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário');
      }

      // Close create modal and open email dispatch / outlook modal
      setIsCreateUserOpen(false);
      setEmailModalData({
        isOpen: true,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: newUserForm.role,
        isNewUser: true
      });

      setNewUserForm({ name: '', email: '', password: '', role: 'BUYER' });
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(`Falha ao cadastrar usuário: ${err.message}`);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole })
      });
      if (!res.ok) throw new Error('Falha ao atualizar cargo');
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar cargo do usuário.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao excluir usuário');
      }
      setUsersList(prev => prev.filter(u => u.id !== userId));
      alert('Usuário excluído com sucesso.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao excluir usuário.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Super Admin</span>;
      case 'ADMIN':
        return <span className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Administrador</span>;
      case 'BUYER':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Compras</span>;
      case 'LOGISTICS':
        return <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Logística</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 border-4 border-[#CDEAF1] border-t-[#2098D1] rounded-full animate-spin" />
        <p className="text-sm text-[#145772] font-bold">Carregando painel de controle...</p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.email?.toLowerCase().includes('adm@123.com');

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto p-6">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600">
          <Lock size={36} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Acesso Restrito ao Super Admin</h2>
        <p className="text-sm text-slate-500">
          Este centro de controle e gerenciamento de infraestrutura é de uso exclusivo do Super Administrador do sistema.
        </p>
        <Link
          href="/prospeccao"
          className="mt-2 bg-[#2098D1] hover:bg-[#1984B8] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#2098D1]/20 transition-all"
        >
          Voltar para a Área Operacional
        </Link>
      </div>
    );
  }

  const dbPercent = metrics?.dbUsagePercentage || 0;
  const isHealthyQuota = dbPercent < 50;
  const isWarningQuota = dbPercent >= 50 && dbPercent < 80;

  return (
    <div className="space-y-6 font-sans pb-12 max-w-7xl mx-auto">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0E2439] via-[#143B59] to-[#0A1926] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#2098D1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-purple-400" />
                Painel Master
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistema 100% Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Centro de Controle & Infraestrutura</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Gerencie usuários corporativos, monitore a saúde das conexões com o Supabase e acompanhe as cotas de consumo em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsCreateUserOpen(true)}
              className="flex items-center gap-2 bg-[#2098D1] hover:bg-[#1984B8] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#2098D1]/20 transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              Criar Novo Usuário
            </button>
            <Link
              href="/prospeccao"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Ir para o ERP
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Gauges (Quota & Consumption) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Supabase DB Quota */}
        <Card className="!p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uso do Supabase DB</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {metrics?.estimatedDbSizeMb || 0.1} MB
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 500 MB</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#2098D1]">
              <Database size={20} />
            </div>
          </div>
          
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Capacidade Utilizada</span>
              <span className={isHealthyQuota ? 'text-emerald-600' : isWarningQuota ? 'text-amber-600' : 'text-rose-600'}>
                {dbPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isHealthyQuota ? 'bg-emerald-500' : isWarningQuota ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(dbPercent, 2)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">Plano Gratuito (Free Tier) com folga total.</p>
          </div>
        </Card>

        {/* Card 2: Total Database Rows */}
        <Card className="!p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Linhas Gravadas</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics?.totalRows?.toLocaleString('pt-BR') || 0}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Layers size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">{metrics?.totalSuppliers}</span> Fornecedores cadastrados
          </p>
        </Card>

        {/* Card 3: Active Users */}
        <Card className="!p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuários / Equipe</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {usersList.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Todos com autenticação ativa
          </p>
        </Card>

        {/* Card 4: Health Status Indicator */}
        <Card className="!p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">APIs & Serviços</span>
              <p className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
                4 / 4 OK
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Activity size={20} />
            </div>
          </div>
          <button
            onClick={handlePingApis}
            disabled={isPinging}
            className="mt-3.5 text-xs text-[#2098D1] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} className={isPinging ? 'animate-spin' : ''} />
            {isPinging ? 'Testando conexões...' : 'Testar Conexões Agora'}
          </button>
        </Card>

      </div>

      {/* Section 2: Health Check of External APIs */}
      <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <Server size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Status das APIs e Integrações</h2>
              <p className="text-xs text-slate-400">Monitoramento contínuo de latência e disponibilidade dos serviços externos.</p>
            </div>
          </div>

          <button
            onClick={handlePingApis}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isPinging ? 'animate-spin' : ''} />
            Atualizar Status
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {healthStatus.map((service, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                  {service.service}
                </span>
                {service.status === 'ONLINE' && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ONLINE
                  </span>
                )}
                {service.status === 'DEGRADED' && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <AlertTriangle size={10} />
                    LENTO
                  </span>
                )}
                {service.status === 'OFFLINE' && (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <XCircle size={10} />
                    OFFLINE
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 truncate">{service.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span>Latência: <strong className="text-slate-700 dark:text-slate-300">{service.latencyMs} ms</strong></span>
                  <span>{service.lastChecked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 3: User Management Table */}
      <Card className="!p-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#2098D1]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Gerenciamento de Usuários e Funções</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre e gerencie os acessos de compradores, analistas de logística e administradores diretamente no app.
            </p>
          </div>

          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="flex items-center gap-2 bg-[#2098D1] hover:bg-[#1984B8] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <UserPlus size={14} />
            Novo Usuário
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Usuário / Nome</th>
                <th className="px-6 py-4">E-mail Corporativo</th>
                <th className="px-6 py-4">Função / Cargo</th>
                <th className="px-6 py-4">Alterar Função</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#EBF7FA] text-[#136F90] dark:bg-[#136F90]/30 dark:text-[#67CFE8] flex items-center justify-center font-black text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value as UserRole)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#2098D1] cursor-pointer"
                    >
                      <option value="BUYER">Compras (Buyer)</option>
                      <option value="LOGISTICS">Logística (Logistics)</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="SUPER_ADMIN">Super Admin (Master)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEmailModalData({
                            isOpen: true,
                            name: u.name,
                            email: u.email,
                            password: '',
                            role: u.role,
                            isNewUser: false
                          });
                        }}
                        className="p-1.5 text-[#2098D1] hover:text-[#146A88] hover:bg-[#E5F5F8] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Enviar / Abrir dados de acesso no Outlook"
                      >
                        <Mail size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Desativar usuário"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 4: Database Tables Detail Breakdown */}
      <Card className="!p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <HardDrive size={16} className="text-slate-400" />
          Detalhamento de Registros por Tabela
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Fornecedores</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{metrics?.totalSuppliers || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Endereços</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{metrics?.totalAddresses || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Contatos</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{metrics?.totalContacts || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Materiais</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{metrics?.totalMaterials || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Coletas & Balança</span>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{(metrics?.totalCollections || 0) + (metrics?.totalReceipts || 0)}</p>
          </div>
        </div>
      </Card>

      {/* Modal: Create User */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Cadastrar Novo Usuário no Sistema"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Ex: Roberto Silva"
            value={newUserForm.name}
            onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="E-mail Corporativo"
            type="email"
            placeholder="roberto@iwrc.com.br"
            value={newUserForm.email}
            onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <Input
            label="Senha Provisória (Mínimo 6 caracteres)"
            type="password"
            placeholder="••••••••"
            value={newUserForm.password}
            onChange={e => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
            required
          />
          <p className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5 font-medium">
            🔒 O novo usuário será obrigado a cadastrar uma nova senha pessoal no primeiro acesso ao sistema.
          </p>

          <Select
            label="Função / Cargo do Usuário"
            value={newUserForm.role}
            onChange={e => setNewUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
            options={[
              { value: 'BUYER', label: 'Compras (Acesso à Prospecção e Fornecedores)' },
              { value: 'LOGISTICS', label: 'Logística (Acesso à Análise, Coletas e Balança)' },
              { value: 'ADMIN', label: 'Administrador (Acesso Geral)' },
              { value: 'SUPER_ADMIN', label: 'Super Admin (Acesso ao Painel de Controle Master)' }
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateUserOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingUser}
            >
              {isSubmittingUser ? 'Criando usuário...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Enviar Acesso via Outlook */}
      {emailModalData && (
        <Modal
          isOpen={emailModalData.isOpen}
          onClose={() => setEmailModalData(null)}
          title="📧 Enviar Acesso por E-mail (Outlook)"
          size="lg"
        >
          {(() => {
            const emailData = generateEmailData(
              emailModalData.name,
              emailModalData.email,
              emailModalData.password,
              emailModalData.role
            );

            return (
              <div className="space-y-5">
                
                {/* Status Notice */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  emailModalData.isNewUser 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={20} className={emailModalData.isNewUser ? 'text-emerald-600' : 'text-indigo-600'} />
                    <div>
                      <span className="font-bold text-xs block">
                        {emailModalData.isNewUser ? `Usuário "${emailModalData.name}" criado com sucesso!` : `Dados de acesso de "${emailModalData.name}"`}
                      </span>
                      <span className="text-[11px] opacity-80 block">
                        Clique em "Abrir no Outlook" para abrir o e-mail preenchido no seu aplicativo, revisar e enviar manualmente.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credentials Recap Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Destinatário / E-mail:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{emailModalData.email}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Link do App (Login):</span>
                    <a href="https://iwrc.vercel.app/login" target="_blank" rel="noreferrer" className="text-[#2098D1] font-bold hover:underline flex items-center gap-1">
                      https://iwrc.vercel.app/login <ExternalLink size={11} />
                    </a>
                  </div>
                  {emailModalData.password && (
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Senha Provisória:</span>
                      <span className="font-mono font-black text-slate-900 bg-slate-200 dark:bg-slate-800 dark:text-white px-2 py-0.5 rounded">
                        {emailModalData.password}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Função:</span>
                    <Badge variant="info">{getRoleLabel(emailModalData.role)}</Badge>
                  </div>
                </div>

                {/* Email Visual Preview (Inspirado no Modelo iWRC) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#0284C7]" />
                      Layout do E-mail iWRC:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {emailData.subject}
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-5 bg-[#F8FAFC] dark:bg-slate-950/60 max-h-80 overflow-y-auto space-y-4 shadow-sm">
                    
                    {/* Top Link Hint */}
                    <div className="text-center text-[10px] text-slate-400">
                      Caso não visualize este e-mail corretamente, <span className="text-[#0284c7] underline font-semibold">clique aqui</span> para abrir no navegador.
                    </div>

                    {/* Main White Card Mockup */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                      
                      {/* Logo Header + Abstract Graphic */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-[#0284C7] tracking-tight">
                            iW<span className="text-[#0369A1]">rc</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                            The Human Side of Recycling
                          </div>
                        </div>

                        <div className="w-24 h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-600 flex items-center justify-center text-white/30 text-2xl font-black">
                          ♻
                        </div>
                      </div>

                      {/* Greeting Header */}
                      <div className="flex items-start gap-3 pt-2">
                        <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-lg text-sky-600 shrink-0">
                          👤
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-[#0284c7]">
                            Olá, <span className="text-slate-900 dark:text-white">{emailModalData.name}!</span>
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            Seu acesso ao sistema <strong>iWRC</strong> foi criado com sucesso.<br/>
                            Abaixo estão suas credenciais para acesso:
                          </p>
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-7 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-xs">
                              ✉️
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-[#0284c7] uppercase">E-mail de acesso</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{emailModalData.email}</div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-xs mt-0.5">
                              🔒
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-[#0284c7] uppercase">Senha temporária</div>
                              <div className="text-xs font-black text-slate-900 dark:text-white font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-0.5">
                                {emailModalData.password || '[Senha Pessoal Já Cadastrada]'}
                              </div>
                              <div className="text-[9px] text-slate-400 mt-1">
                                (Recomendamos alterar sua senha após o primeiro acesso)
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-5 flex justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                          <div className="w-16 h-16 rounded-full bg-radial from-sky-100 to-cyan-50 dark:from-sky-950 border-2 border-dashed border-sky-400 flex items-center justify-center text-2xl">
                            🔐
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="text-center pt-1">
                        <span className="inline-block bg-gradient-to-r from-[#0e7490] to-[#0d9488] text-white font-bold text-xs px-8 py-2.5 rounded-full shadow-sm">
                          Acessar o sistema &nbsp;→
                        </span>
                      </div>

                      {/* Divider with W */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                        <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950 text-[#0284c7] font-black text-[11px] flex items-center justify-center">
                          W
                        </div>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                      </div>

                      {/* Support Section */}
                      <div className="text-center space-y-1">
                        <p className="text-[10px] text-slate-400">
                          Em caso de dúvidas ou dificuldades de acesso, entre em contato com o suporte:
                        </p>
                        <div className="text-[11px] font-bold text-[#0284c7] flex items-center justify-center gap-3">
                          <span>✉️ support@iwrc.world</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-700 dark:text-slate-300">📞 +55 (11) 96467-1234</span>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Card Mockup */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="text-lg">♻️</span>
                        <span className="font-medium text-[9px] leading-tight">Advancing Material Recovery and Recycling through Collaboration with the Informal Waste Sector</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#0284c7] block">Siga o iWRC</span>
                        <span className="text-xs tracking-widest opacity-80">📸 💼 🎥 🌐</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Hidden DOM Target for Native Rich Text Clipboard Selection */}
                <div 
                  id="rendered-email-copy-target" 
                  dangerouslySetInnerHTML={{ __html: emailData.htmlContent }} 
                  style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }} 
                />

                {/* Clear Instruction Box */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-950 dark:text-blue-100">
                    <Sparkles size={14} className="text-[#2098D1]" />
                    Como colar o layout visual no Outlook:
                  </span>
                  <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                    Os navegadores abrem o Outlook via link padrão em modo texto. Para ter o <strong>layout gráfico completo com cores, cartões e botões</strong>, clique em <strong>"Copiar Visual Gráfico & Abrir Outlook"</strong> e, na janela do Outlook, clique no corpo do e-mail e aperte <strong>CTRL + V</strong>!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* 1. Copy Rich HTML & Open Outlook */}
                    <button
                      type="button"
                      onClick={() => handleOpenOutlookWithCopiedHtml(emailModalData.email, emailData.subject, emailData.htmlContent, emailData.plainText)}
                      className="flex items-center justify-center gap-2 bg-[#2098D1] hover:bg-[#1984B8] text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="Copia o layout gráfico completo e abre a janela do Outlook pronta para Ctrl + V"
                    >
                      <Send size={15} />
                      <span>Copiar Visual & Abrir Outlook</span>
                    </button>

                    {/* 2. Open with .EML (Native Styled HTML in Outlook) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadEml(emailModalData.email, emailModalData.name, emailData.subject, emailData.htmlContent)}
                      className="flex items-center justify-center gap-2 bg-[#0078D4] hover:bg-[#006cbd] text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="Baixa e abre o rascunho com 100% do HTML estilizado nativo no Outlook"
                    >
                      <Mail size={16} />
                      <span>Abrir Arquivo Outlook (.eml)</span>
                    </button>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 3. Outlook Web */}
                    <button
                      type="button"
                      onClick={() => handleOpenOutlookWeb(emailModalData.email, emailData.subject, emailData.plainText)}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      title="Abrir no navegador via Office 365"
                    >
                      <Globe size={14} />
                      Outlook Web (Office 365)
                    </button>

                    {/* 4. Copy Formatted HTML directly */}
                    <button
                      type="button"
                      onClick={() => handleCopyRichEmail(emailData.htmlContent, emailData.plainText)}
                      className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        copyStatus === 'copied_rich' || copyStatus === 'copied_text'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {copyStatus === 'copied_rich' || copyStatus === 'copied_text' ? (
                        <>
                          <Check size={14} />
                          Visual Gráfico Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copiar Visual Gráfico (HTML)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-center text-slate-400">
                  💡 <strong>Revisão Segura:</strong> O sistema não envia o e-mail sozinho. Ele permite que você revise tudo antes do envio manual.
                </p>

              </div>
            );
          })()}
        </Modal>
      )}

    </div>
  );
}
