
import React, { useState } from 'react';
import { Resource } from '../types';

interface LoginProps {
  onLogin: (user: Resource) => void;
  resources: Resource[];
}

const Login: React.FC<LoginProps> = ({ onLogin, resources }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin check
    if (loginId === 'admin' && password === '0000') {
      onLogin({
        id: 'admin',
        loginId: 'admin',
        name: '시스템 관리자',
        role: 'Administrator',
        department: 'Governance',
        email: 'admin@nexus.dev',
        status: 'Active',
        classification: 'Admin',
        joinDate: '2024-01-01',
        capacity: 999,
        avatar: 'https://picsum.photos/seed/admin/100/100'
      });
      return;
    }

    const user = resources.find(r => r.loginId === loginId && r.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 rounded-full blur-[150px]"></div>
      
      <div className="w-full max-w-[440px] p-8 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-500/40 mx-auto mb-8 rotate-3">N</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Nexus PMS</h1>
          <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest opacity-60">Enterprise SW Platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">Login ID</label>
              <input 
                type="text" 
                required
                className="w-full px-8 py-5 bg-white/5 border-2 border-white/5 rounded-[1.5rem] text-[18px] font-black text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-700"
                placeholder="Admin"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-8 py-5 bg-white/5 border-2 border-white/5 rounded-[1.5rem] text-[18px] font-black text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/20 text-red-400 text-[12px] py-4 px-6 rounded-2xl font-black text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-6 bg-indigo-600 text-white font-black text-[16px] rounded-[1.5rem] hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95"
            >
              로그인
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">
              System Admin: <span className="text-indigo-400 select-all">admin@nexus.dev</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
