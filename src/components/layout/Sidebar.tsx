'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserRole, Profile } from '@/types';
import { 
  LayoutDashboard, 
  Building2, 
  GitBranch, 
  Truck, 
  Calendar, 
  Scale, 
  LogOut, 
  Layers, 
  RotateCcw,
  Pin,
  PinOff,
  ShieldCheck
} from 'lucide-react';
import { dbService } from '@/features/shared/services/dbService';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, switchUserById } = useAuth();
  
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [logisticsQueueCount, setLogisticsQueueCount] = useState(0);
  const [geradoresCount, setGeradoresCount] = useState(0);

  // Pin & Auto-hide (Hover) states
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Load pin preference from localStorage
    const saved = localStorage.getItem('iwrc_sidebar_pinned');
    if (saved !== null) {
      setIsPinned(saved === 'true');
    }
  }, []);

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    localStorage.setItem('iwrc_sidebar_pinned', String(next));
    if (!next) {
      setIsHovered(false);
    }
  };

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    async function loadStats() {
      try {
        const [profiles, suppliers] = await Promise.all([
          dbService.getProfiles(),
          dbService.getSuppliers()
        ]);
        setAllProfiles(profiles);
        setLogisticsQueueCount(suppliers.filter(s => s.current_stage === 'LOGISTICS').length);
        setGeradoresCount(suppliers.filter(s => ['DOCUMENTATION', 'COLLECTION', 'OPERATION'].includes(s.current_stage)).length);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [pathname, user]);

  const handleClearDatabase = async () => {
    if (confirm('Tem certeza que deseja zerar todos os dados de testes (Leads, Geradores, Coletas e Recebimentos)?')) {
      await dbService.clearDatabase();
      window.location.reload();
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchUserById(e.target.value);
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Gestão';
    if (role === 'BUYER') return 'Comercial';
    return 'Logística';
  };

  const isLogisticsRole = user?.role === 'LOGISTICS';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.email?.toLowerCase().includes('adm@123.com');

  const navigationItems = isLogisticsRole
    ? [
        ...(isSuperAdmin ? [{ name: 'Painel Master', href: '/admin/painel', icon: ShieldCheck, roles: ['SUPER_ADMIN'] }] : []),
        { name: 'Logística', href: '/logistica', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'LOGISTICS'], badge: logisticsQueueCount },
        { name: 'Geradores', href: '/fornecedores', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'], badge: geradoresCount },
        { name: 'Coletas', href: '/coletas', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'] },
        { name: 'Recebimentos', href: '/recebimentos', icon: Scale, roles: ['SUPER_ADMIN', 'ADMIN', 'LOGISTICS'] },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'] },
      ]
    : [
        ...(isSuperAdmin ? [{ name: 'Painel Master', href: '/admin/painel', icon: ShieldCheck, roles: ['SUPER_ADMIN'] }] : []),
        { name: 'Prospecção', href: '/prospeccao', icon: GitBranch, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER'] },
        { name: 'Geradores', href: '/fornecedores', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'], badge: geradoresCount },
        { name: 'Logística', href: '/logistica', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'LOGISTICS'], badge: logisticsQueueCount },
        { name: 'Coletas', href: '/coletas', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'] },
        { name: 'Recebimentos', href: '/recebimentos', icon: Scale, roles: ['SUPER_ADMIN', 'ADMIN', 'LOGISTICS'] },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'BUYER', 'LOGISTICS'] },
      ];

  const allowedItems = navigationItems.filter(item => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.email?.toLowerCase().includes('adm@123.com')) return true;
    return item.roles.includes(user.role);
  });

  return (
    <div className="relative shrink-0 select-none">
      {/* Anchor container that defines document flow width */}
      <div className={`h-screen transition-all duration-300 ${isPinned ? 'w-64' : 'w-16'}`} />

      <aside 
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-white text-[#0E2439] flex flex-col border-r border-[#D4EFF5] font-sans transition-all duration-300 ease-in-out z-50 ${
          isPinned 
            ? 'w-64 shadow-[4px_0_24px_rgba(32,152,209,0.04)]' 
            : isHovered 
              ? 'w-64 shadow-[12px_0_40px_rgba(32,152,209,0.2)]' 
              : 'w-16 shadow-[2px_0_10px_rgba(32,152,209,0.03)]'
        }`}
      >
        
        {/* Brand Header — Compact, zero-gap, flush left */}
        <div className={`flex items-center border-b border-[#E2F4F7] h-16 transition-all ${
          isExpanded ? 'justify-between px-4' : 'justify-center px-2'
        }`}>
          <div className="flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/iwrc-logo.png" 
              alt="iWrc" 
              className={`object-contain transition-all duration-300 ${
                isExpanded ? 'h-11 md:h-12 w-auto' : 'h-7 w-auto'
              }`}
            />
          </div>

          {/* Pin / Unpin Button when expanded */}
          {isExpanded && (
            <button
              onClick={togglePin}
              title={isPinned ? 'Desfixar menu (ocultar automaticamente e abrir ao passar o mouse)' : 'Fixar menu aberto'}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isPinned 
                  ? 'bg-[#EAF7FA] border-[#CCEAF1] text-[#2098D1] hover:bg-[#DDF4F9]' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-[#2098D1] hover:bg-slate-200'
              }`}
            >
              {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {isExpanded && (
            <div className="px-2 mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {isLogisticsRole ? 'Painel Operacional' : 'Módulos do Sistema'}
              </span>
            </div>
          )}
          
          {allowedItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!isExpanded ? item.name : undefined}
                className={`flex items-center ${
                  isExpanded ? 'justify-between px-3.5 py-2.5 rounded-2xl' : 'justify-center p-2.5 rounded-xl'
                } text-sm font-bold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#2098D1] text-white shadow-md shadow-[#2098D1]/25'
                    : 'text-[#2D536E] hover:bg-[#EBF7FA] hover:text-[#187A9C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-[#2098D1]'} />
                  {isExpanded && <span className="truncate">{item.name}</span>}
                </div>

                {/* Badge when expanded */}
                {isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white text-[#2098D1]'
                      : item.href === '/logistica'
                        ? 'bg-amber-400 text-amber-950 animate-pulse'
                        : 'bg-[#EBF7D4] text-[#48780E]'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Badge dot when collapsed */}
                {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile & Switcher Footer */}
        {isExpanded ? (
          <div className="p-3 border-t border-[#E2F4F7] bg-[#F7FCFD] animate-fadeIn">
            {user && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#D8EFF5]">
                  <div className="h-8 w-8 rounded-full bg-[#E5F5F8] text-[#2098D1] font-black flex items-center justify-center text-xs shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-[#0E2439] truncate">{user.name}</p>
                    <span className="text-[10px] font-bold text-[#2098D1]">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-[#CCEAF1] hover:bg-[#EBF7FA] text-[#136F90] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    Sair do Sistema
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-t border-[#E2F4F7] bg-[#F7FCFD] flex flex-col items-center gap-2">
            {user && (
              <div 
                className="h-8 w-8 rounded-full bg-[#E5F5F8] text-[#2098D1] font-black flex items-center justify-center text-xs border border-[#CCEAF1]"
                title={`${user.name} (${getRoleLabel(user.role)})`}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <button
              onClick={togglePin}
              title="Fixar barra lateral"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2098D1] hover:bg-slate-100 cursor-pointer"
            >
              <Pin size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
