'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple hardcoded credentials
    if (username === 'owner' && password === 'owner') {
      document.cookie = "shop_session=owner; path=/; max-age=86400"; // 1 day
      router.push('/owner');
    } else if (username === 'frontdesk' && password === 'frontdesk') {
      document.cookie = "shop_session=frontdesk; path=/; max-age=86400"; // 1 day
      router.push('/front-desk');
    } else {
      setError('Invalid username or password');
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
            <label className="block uppercase text-[10px] font-bold text-zinc-500 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-black transition-colors"
              placeholder="e.g. owner or frontdesk"
              required
            />
          </div>
          
          <div>
            <label className="block uppercase text-[10px] font-bold text-zinc-500 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black text-black transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-black hover:bg-zinc-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors mt-2"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
