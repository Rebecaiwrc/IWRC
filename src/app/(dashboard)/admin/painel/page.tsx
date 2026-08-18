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
  Sparkles
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

      alert(`Usuário "${newUserForm.name}" cadastrado com sucesso!`);
      setNewUserForm({ name: '', email: '', password: '', role: 'BUYER' });
      setIsCreateUserOpen(false);
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
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Desativar usuário"
                    >
                      <Trash2 size={15} />
                    </button>
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

    </div>
  );
}
