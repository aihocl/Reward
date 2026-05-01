'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Icons } from './icons';
import { uid } from '@/lib/utils';

export function Login() {
  const { state, setUser, updateDb } = useStore();
  const [step, setStep] = useState<'select' | 'phone' | 'otp' | 'register' | 'admin'>('select');
  const [error, setError] = useState('');
  
  // Forms
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [ap, setAp] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleSendOtp = () => {
    if (phone) {
      setStep('otp');
      setOtp(['', '', '', '']);
      setError('');
    }
  };

  const handleVerify = () => {
    if (otp.join('') === '1234') {
      const m = state.db.mgrs.find((m: any) => m.ph === phone) || state.db.mgrs[0];
      setUser({ role: 'mgr', id: m.id });
    } else {
      setError('Invalid OTP (use 1234)');
    }
  };

  const handleAdminLog = () => {
    if (ap === 'admin') {
      setUser({ role: 'adm' });
    } else {
      setError("Use 'admin'");
    }
  };

  const handleRegister = () => {
    if (!regName || !regPhone) return;
    const tgts: any = {};
    state.db.models.forEach((m: any) => {
      tgts[m.id] = { tgt: Math.floor(Math.random() * 25) + 15, ach: 0 };
    });
    
    updateDb((prev: any) => {
      const db = { ...prev };
      db.mgrs = [...db.mgrs, {
        id: 'M' + uid(),
        nm: regName,
        ph: regPhone,
        store: 'New',
        pts: 0,
        st: 'active',
        av: regName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        area: 'Ahmedabad',
        targets: tgts,
        imeis: [],
        totalImei: 0,
        pendingImei: 0,
        approvedImei: 0,
        streak: 0,
        avClr: '#3498db'
      }];
      return db;
    });

    setPhone(regPhone);
    setStep('otp');
    setOtp(['', '', '', '']);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-end bg-gradient-to-b from-neutral-950 to-bg-prime relative overflow-hidden text-tx max-w-[480px] mx-auto">
      <div className="absolute w-[220px] h-[220px] rounded-full blur-[90px] opacity-20 bg-or -top-10 -right-15"></div>
      <div className="absolute w-[160px] h-[160px] rounded-full blur-[80px] opacity-15 bg-red-900 bottom-[30%] -left-15"></div>
      
      <div className="pt-11 px-6 relative z-10 w-full">
        {step !== 'select' && (
          <button className="bg-transparent border-0 text-t3 cursor-pointer flex items-center gap-1 text-xs p-0 mb-3.5" 
                  onClick={() => setStep('select')}>
            <Icons.bk className="w-4 h-4" /> Back
          </button>
        )}
        
        {step === 'select' && (
          <>
            <div className="mb-6 relative flex flex-col items-center animate-[su_0.5s]">
              <div className="flex items-center justify-center relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 to-or/30 blur-2xl rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-[22px] flex items-center justify-center shadow-[0_8px_40px_rgba(229,9,20,0.3)] overflow-hidden animate-[bounce_2s_infinite]">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <svg className="w-10 h-10 text-or drop-shadow-[0_0_15px_rgba(229,9,20,0.8)] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 12 12 17 22 12" />
                    <polyline points="2 17 12 22 22 17" />
                  </svg>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-or rounded-full blur-[14px] opacity-70 mix-blend-screen"></div>
                </div>
              </div>
              <p className="text-[32px] font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
                HMPL Rewards
              </p>
            </div>
            <h1 className="text-[26px] font-bold tracking-tight leading-[1.2] mb-2 text-white text-center animate-[su_0.6s]">
              Track. Achieve.<br/>
              <em className="not-italic bg-gradient-to-br from-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(229,9,20,0.3)]">Get Rewarded.</em>
            </h1>
            <p className="text-t2 text-[14px] text-center mb-8 animate-[su_0.7s]">Retail chain performance platform</p>
          </>
        )}

        {step === 'register' && (
          <h1 className="text-[26px] font-black tracking-tighter leading-[1.1] mb-1.5 text-white">
            Register<br/><em className="not-italic bg-gradient-to-br from-or to-red-800 bg-clip-text text-transparent">Account</em>
          </h1>
        )}

        {step === 'phone' && (
          <h1 className="text-[26px] font-black tracking-tighter leading-[1.1] mb-1.5 text-white">
            Welcome<br/><em className="not-italic bg-gradient-to-br from-or to-red-800 bg-clip-text text-transparent">back</em>
          </h1>
        )}

        {step === 'otp' && (
          <h1 className="text-[26px] font-black tracking-tighter leading-[1.1] mb-1.5 text-white">
            Verify<br/><em className="not-italic bg-gradient-to-br from-or to-red-800 bg-clip-text text-transparent">OTP</em>
          </h1>
        )}

        {step === 'admin' && (
          <h1 className="text-[26px] font-black tracking-tighter leading-[1.1] mb-1.5 text-white">
            Admin<br/><em className="not-italic bg-gradient-to-br from-or to-red-800 bg-clip-text text-transparent">Access</em>
          </h1>
        )}
      </div>

      <div className="relative z-10 bg-bg-sec border-t border-bd2 rounded-t-[26px] px-6 pb-9 pt-7 mt-7 shadow-sh w-full">
        {step === 'select' && (
          <>
            <div className="flex gap-0 mb-4 rounded-[11px] overflow-hidden border border-bd2 p-0">
              <button className="flex-1 p-2.5 text-center text-xs font-semibold cursor-pointer bg-or text-white border-none" onClick={() => setStep('phone')}>Login</button>
              <button className="flex-1 p-2.5 text-center text-xs font-semibold cursor-pointer bg-sf text-t2 border-none" onClick={() => setStep('register')}>Register</button>
            </div>
            <button className="w-full p-3.5 bg-gradient-to-br from-or to-red-800 border-none rounded-[11px] text-white text-sm font-bold cursor-pointer transition-transform active:scale-95 tracking-wide mb-2" onClick={() => setStep('phone')}>
              Login with OTP →
            </button>
            <button className="w-full p-3 bg-transparent border-[1.5px] border-bd2 rounded-[11px] text-t2 text-[13px] cursor-pointer" onClick={() => setStep('admin')}>
              Admin Panel
            </button>
            <p className="text-t3 text-[10px] text-center mt-3 font-mono">OTP:1234 | Admin:admin</p>
          </>
        )}

        {step === 'register' && (
          <>
            <input 
              className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or focus:shadow-[0_0_0_3px_rgba(229,9,20,0.1)] outline-none transition-colors" 
              placeholder="Full Name" 
              value={regName} 
              onChange={e => setRegName(e.target.value)} 
            />
            <input 
              className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-3 focus:border-or focus:shadow-[0_0_0_3px_rgba(212,140,85,0.1)] outline-none transition-colors" 
              placeholder="Mobile" 
              value={regPhone} 
              onChange={e => setRegPhone(e.target.value)} 
            />
            <button 
              className="w-full p-3.5 bg-gradient-to-br from-or to-red-800 border-none rounded-[11px] text-white text-sm font-bold cursor-pointer transition-transform active:scale-95 tracking-wide" 
              onClick={handleRegister}>
              Register →
            </button>
          </>
        )}

        {step === 'phone' && (
          <>
            <select 
              className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-3 focus:border-or focus:shadow-[0_0_0_3px_rgba(229,9,20,0.1)] outline-none transition-colors appearance-none cursor-pointer" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' fill=\'%239e96c0\'%3E%3Cpath d=\'M5 7L0 2h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              value={phone} 
              onChange={e => setPhone(e.target.value)}>
              <option value="" className="bg-bg-sec">Choose account</option>
              {state.db.mgrs.map((m: any) => (
                <option key={m.id} value={m.ph} className="bg-bg-sec text-tx">{m.nm} — {m.store}</option>
              ))}
            </select>
            <button 
              className="w-full p-3.5 bg-gradient-to-br from-or to-red-800 border-none rounded-[11px] text-white text-sm font-bold cursor-pointer transition-transform active:scale-95 tracking-wide disabled:opacity-40 disabled:pointer-events-none" 
              disabled={!phone} 
              onClick={handleSendOtp}>
              Send OTP →
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="flex gap-2.5 justify-center my-4">
              {[0, 1, 2, 3].map(i => (
                <input 
                  key={i}
                  className="w-[52px] h-[58px] text-center text-[22px] font-bold font-mono bg-sf border-[1.5px] border-bd2 rounded-xl text-tx focus:border-or outline-none" 
                  type="text" 
                  inputMode="numeric" 
                  maxLength={1} 
                  value={otp[i]}
                  onChange={e => {
                    const newOtp = [...otp];
                    newOtp[i] = e.target.value.slice(-1);
                    setOtp(newOtp);
                    if (e.target.value && i < 3) {
                      const next = document.getElementById(`otp-${i+1}`);
                      if (next) next.focus();
                    }
                  }}
                  id={`otp-${i}`}
                />
              ))}
            </div>
            {error && <p className="text-[#ff5a65] text-[11px] mt-1 text-center">{error}</p>}
            <button 
              className="w-full p-3.5 bg-gradient-to-br from-or to-red-800 border-none rounded-[11px] text-white text-sm font-bold cursor-pointer transition-transform active:scale-95 tracking-wide mt-2" 
              onClick={handleVerify}>
              Verify & Login
            </button>
            <p className="text-t3 text-[10px] text-center mt-3 font-mono">USE: 1234</p>
          </>
        )}

        {step === 'admin' && (
          <>
            <input 
              className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-3 focus:border-or focus:shadow-[0_0_0_3px_rgba(212,140,85,0.1)] outline-none transition-colors" 
              type="password" 
              placeholder="Password" 
              value={ap}
              onChange={e => setAp(e.target.value)}
            />
            {error && <p className="text-[#ff5a65] text-[11px] mt-1 text-center mb-2">{error}</p>}
            <button 
              className="w-full p-3.5 bg-gradient-to-br from-or to-red-800 border-none rounded-[11px] text-white text-sm font-bold cursor-pointer transition-transform active:scale-95 tracking-wide" 
              onClick={handleAdminLog}>
              Login
            </button>
            <p className="text-t3 text-[10px] text-center mt-3 font-mono">PASSWORD: admin</p>
          </>
        )}
      </div>
    </div>
  );
}
