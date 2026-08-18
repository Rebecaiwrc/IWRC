'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';
import { dbService } from '@/features/shared/services/dbService';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<Profile>;
  logout: () => Promise<void>;
  switchProfile: (role: UserRole) => Promise<void>;
  switchUserById: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Real Supabase Auth session check
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await dbService.getProfile(session.user.id);
            setUser(profile);
          } else {
            setUser(null);
          }
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user) {
                const profile = await dbService.getProfile(session.user.id);
                setUser(profile);
              } else {
                setUser(null);
              }
              setLoading(false);
            }
          );

          return () => subscription.unsubscribe();
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Error loading auth user:', err);
        setError(err.message || 'Erro ao carregar sessão.');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password?: string): Promise<Profile> => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        if (!password) {
          throw new Error('Por favor, informe sua senha de acesso.');
        }

        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (authErr) {
          if (authErr.message.includes('Invalid login credentials')) {
            throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
          }
          throw new Error(authErr.message || 'Falha ao autenticar no Supabase.');
        }

        if (data.user) {
          const profile = await dbService.getProfile(data.user.id);
          if (!profile) {
            throw new Error('Usuário autenticado, mas o registro de perfil não foi encontrado na tabela "profiles" do Supabase.');
          }
          setUser(profile);
          return profile;
        }

        throw new Error('Usuário não encontrado no Supabase.');
      } else {
        throw new Error('Supabase não está configurado. Verifique as chaves no arquivo .env.local');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchProfile = async (role: UserRole) => {
    // In real Supabase auth, profile switching is handled via actual accounts
    const profiles = await dbService.getProfiles();
    const target = profiles.find(p => p.role === role);
    if (target) setUser(target);
  };

  const switchUserById = async (userId: string) => {
    const profiles = await dbService.getProfiles();
    const target = profiles.find(p => p.id === userId);
    if (target) setUser(target);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, switchProfile, switchUserById }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
