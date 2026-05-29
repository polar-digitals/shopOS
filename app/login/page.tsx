'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('frontdesk');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const actualRole = profile?.role || 'frontdesk';

        // Strict role check: selected role must match the database role.
        // Generic error message avoids leaking the user's actual role.
        if (selectedRole !== actualRole) {
          setError('Invalid credentials for the selected role.');
          await supabase.auth.signOut();
          return;
        }

        if (selectedRole === 'owner') {
          router.push('/owner');
        } else {
          router.push('/front-desk');
        }
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <div className="text-3xl font-black tracking-tight text-zinc-950">
            ShopOS
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="bg-zinc-50/50 border border-zinc-100 p-8 rounded-2xl flex flex-col gap-5">
          <div className="text-sm font-bold text-center text-zinc-600 mb-2">Sign in to your account</div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block uppercase text-[10px] font-bold text-zinc-500 mb-1">Login As</label>
            <div className="relative">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-black transition-colors appearance-none cursor-pointer"
              >
                <option value="frontdesk">Front Desk</option>
                <option value="owner">Owner</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] font-bold text-zinc-500 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-black transition-colors"
              placeholder="e.g. you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block uppercase text-[10px] font-bold text-zinc-500 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-black transition-colors pr-10"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-black transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors mt-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
