'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Icons, HMPLLogo } from './icons';
import { CTS, AREAS, TIERS, BADGES, FAQ, TERMS } from '@/lib/initial-data';
import { uid, td } from '@/lib/utils';

export function ManagerApp() {
  const { state, updateDb, setTheme, logout } = useStore();
  const [tab, setTab] = useState('home');
  const [lbTab, setLbTab] = useState('area');
  const [rwTb, setRwTb] = useState('inv');
  const [ct, setCt] = useState('All');
  const [imei, setImei] = useState('');
  const [selMod, setSelMod] = useState(state.db.models[0]?.id || '');
  const [modelSh, setModelSh] = useState<string | null>(null);
  const [sh, setSh] = useState<string | null>(null);
  const [dm, setDm] = useState(0);
  const [tst, setTst] = useState<{m: string, t: string} | null>(null);
  const [epMo, setEpMo] = useState(false);
  const [epData, setEpData] = useState({email: '', dob: '', addr: '', social: ''});

  const m = state.db.mgrs.find((m: any) => m.id === state.user?.id) as any;
  if (!m) return null;

  const showToast = (msg: string, type = 'ok') => {
    setTst({ m: msg, t: type });
    setTimeout(() => setTst(null), 2800);
  };

  const ns = state.db.nf.filter((n: any) => n.mid === m.id);
  const ur = ns.filter((n: any) => !n.rd).length;
  const ims = state.db.pendingImeis.filter((i: any) => i.mid === m.id);
  
  let tier = TIERS[0];
  TIERS.forEach(tr => { if (m.pts >= tr.min) tier = tr; });
  
  const rnk = [...state.db.mgrs].sort((a: any, b: any) => b.pts - a.pts).findIndex((x: any) => x.id === m.id) + 1;
  const mTx = state.db.tx.filter((t: any) => t.mid === m.id);

  const handleRedeem = () => {
    const b = state.db.rw.find((x: any) => x.id === sh);
    if (!b) return;
    const sd = dm || b.dm[0];
    const pn = Math.round(b.pt * (sd / b.dm[0]));
    if (m.pts < pn) return;

    updateDb((prev: any) => {
      const db = { ...prev };
      db.mgrs = db.mgrs.map((x: any) => x.id === m.id ? { ...x, pts: x.pts - pn } : x);
      db.rw = db.rw.map((x: any) => x.id === b.id ? { ...x, sk: x.sk - 1 } : x);
      db.tx = [{ id: 'T' + uid(), mid: m.id, tp: 'debit', pt: pn, rs: `Redeemed: ${(b as any).nm} ₹${sd.toLocaleString()}${(b as any).rx ? ` (Exp: ${(b as any).rx})` : ''}`, dt: td(), by: 'System' }, ...db.tx];
      db.rd = [{ id: 'R' + uid(), mid: m.id, rid: b.id, rnm: `${b.nm} ₹${sd.toLocaleString()}`, rx: (b as any).rx, pt: pn, sts: 'pending', dt: td(), dn: sd }, ...db.rd];
      return db;
    });
    setSh(null);
    showToast(`${b.nm} redeemed!`);
  };

  const handleAddImei = () => {
    const v = imei.trim();
    if (v.length !== 15) { showToast('Must be 15 digits', 'er'); return; }
    if (state.db.imeiLog.includes(v)) { showToast('⚠ Duplicate IMEI!', 'er'); return; }

    updateDb((prev: any) => {
      const db = { ...prev };
      db.imeiLog = [...db.imeiLog, v];
      db.pendingImeis = [{ id: 'IM' + uid(), mid: m.id, imei: v, model: selMod, dt: td(), sts: 'pending' }, ...db.pendingImeis];
      db.mgrs = db.mgrs.map((x: any) => x.id === m.id ? { ...x, totalImei: x.totalImei + 1, pendingImei: x.pendingImei + 1 } : x);
      return db;
    });
    setImei('');
    showToast('IMEI submitted for approval');
  };

  const handleSaveProfile = () => {
    updateDb((prev: any) => ({
      ...prev,
      mgrs: prev.mgrs.map((x: any) => x.id === m.id ? { ...x, ...epData } : x)
    }));
    setEpMo(false);
    showToast('Profile updated!');
  };

  const [searchQ, setSearchQ] = useState('');

  const renderHome = () => {
    const tA = Object.values(m.targets || {}).reduce((s: any, t: any) => s + t.ach, 0) as number;
    const tT = Object.values(m.targets || {}).reduce((s: any, t: any) => s + t.tgt, 0) as number;
    const pct = tT ? Math.round((tA / tT) * 100) : 0;
    const circ = 2 * Math.PI * 46;
    const off = circ - (pct / 100) * circ;

    return (
      <>
        <div className="rounded-[24px] p-6 my-2 mb-4 relative overflow-hidden shadow-[0_12px_40px_rgba(26,16,64,0.6)] border-0 bg-gradient-to-b from-[#1a1040] to-[#100a28] animate-[su_0.4s_ease]">
          <div className="absolute top-[-50%] right-[-30%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(212,140,85,0.08),transparent_70%)] pointer-events-none"></div>
          <div className="absolute bottom-[-30%] left-[-20%] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(155,122,255,0.05),transparent_70%)] pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-or font-mono mb-1">Available Points</p>
               <h1 className="text-[44px] font-black bg-gradient-to-r from-yellow-400 to-[#ff9d00] bg-clip-text text-transparent leading-[1.1] tracking-tighter drop-shadow-sm">{m.pts.toLocaleString()}</h1>
               <p className="text-[12px] font-medium text-t2 mt-1">{m.store} · {m.area}</p>
            </div>
            
            <div className="w-[100px] h-[100px] relative pointer-events-none">
              <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90 filter drop-shadow-[0_0_8px_rgba(46,232,157,0.3)]">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="6"/>
                <circle cx="50" cy="50" r="46" fill="none" stroke={pct >= 80 ? '#2ee89d' : pct >= 50 ? 'var(--color-brand-yl)' : 'var(--color-brand-or)'} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-xl font-extrabold font-mono text-white">{pct}%</span>
                 <span className="text-[7px] uppercase tracking-widest text-[#2ee89d] font-bold">Target</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap relative z-10 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex-1 min-w-[30%] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-2.5 flex flex-col items-center justify-center">
               <span className="text-[18px] mb-1">🏆</span>
               <span className="text-[12px] font-bold text-white">#{rnk}</span>
               <span className="text-[8px] text-t3 uppercase tracking-wider font-semibold">Rank</span>
            </div>
            <div className="flex-1 min-w-[30%] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-2.5 flex flex-col items-center justify-center">
               <span className="text-[18px] mb-1">{tier.ic}</span>
               <span className="text-[12px] font-bold text-white">{tier.nm}</span>
               <span className="text-[8px] text-t3 uppercase tracking-wider font-semibold">Tier</span>
            </div>
            <div className="flex-1 min-w-[30%] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-2.5 flex flex-col items-center justify-center">
               <span className="text-[18px] mb-1">🔥</span>
               <span className="text-[12px] font-bold text-white">{m.streak}d</span>
               <span className="text-[8px] text-t3 uppercase tracking-wider font-semibold">Streak</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2.5 mt-6"><span className="text-[13px] font-extrabold flex items-center gap-1.5 animate-pulse"><Icons.star className="w-3.5 h-3.5 text-lb" /> Series Trends</span></div>
        <div className="flex overflow-x-auto gap-3 pb-2 mb-2 no-scrollbar">
          {(() => {
             const srStats: any = {};
             state.db.models.forEach((mod: any) => {
                if (!srStats[mod.sr]) srStats[mod.sr] = { sr: mod.sr, tT: 0, tA: 0 };
                const dt = Object.assign({}, m.targets) as Record<string, any>;
                const t = dt[mod.id] || { tgt: 0, ach: 0 };
                srStats[mod.sr].tT += t.tgt;
                srStats[mod.sr].tA += t.ach;
             });
             return Object.values(srStats).map((st: any, i: number) => {
                const spct = st.tT ? Math.round((st.tA / st.tT) * 100) : 0;
                return (
                  <div key={i} className="min-w-[130px] bg-bg-sec border border-bd rounded-xl p-3 shrink-0 relative overflow-hidden shadow-sh">
                     <p className="text-[11px] font-bold text-tx mb-2">{st.sr}</p>
                     <div className="h-1.5 rounded-full bg-bd overflow-hidden mb-1.5">
                       <div className="h-full bg-lb" style={{width: `${Math.min(spct, 100)}%`}}></div>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] text-t3 font-mono">{st.tA} / {st.tT}</span>
                        <span className={`text-[11px] font-bold font-mono ${spct >= 100 ? 'text-[#2ee89d]' : 'text-tx'}`}>{spct}%</span>
                     </div>
                  </div>
                )
             })
          })()}
        </div>

        <div className="flex justify-between items-center mb-2.5 mt-2"><span className="text-[13px] font-extrabold">🎯 Model Targets</span></div>
        <div className="grid grid-cols-2 gap-3">
          {state.db.models.map((mod: any) => {
            const t = (m.targets || {} as Record<string, any>)[mod.id] || { tgt: 0, ach: 0 };
            const p = t.tgt ? Math.round((t.ach / t.tgt) * 100) : 0;
            const cl = p >= 80 ? '#2ee89d' : p >= 50 ? 'var(--color-brand-yl)' : 'var(--color-brand-or)';
            
            return (
              <div key={mod.id} className="bg-bg-sec border border-bd rounded-[18px] p-4 shadow-sh cursor-pointer transition-transform active:scale-[0.98] hover:border-[rgba(155,122,255,0.4)] flex flex-col relative overflow-hidden group" onClick={() => setModelSh(mod.id)}>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br from-transparent to-white group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shadow-sm shrink-0" style={{ background: mod.bg, color: mod.cl }}>{mod.ic}</div>
                  <div className="text-right">
                    <div className="text-[16px] font-black font-mono tracking-tight leading-none" style={{ color: cl }}>{p}%</div>
                    <div className="text-[8px] uppercase font-bold text-t3 tracking-wider mt-1">Progress</div>
                  </div>
                </div>
                
                <h4 className="text-[13px] font-bold text-tx mb-1 truncate leading-tight relative z-10">{mod.nm}</h4>
                <div className="text-[9px] text-[#2ee89d] font-semibold mb-3 relative z-10 bg-[rgba(46,232,157,0.1)] inline-block px-1.5 py-0.5 rounded-md">+{state.db.policy?.modelPts?.[mod.id] || 0} pts bonus</div>
                
                <div className="mt-auto relative z-10">
                  <div className="h-1.5 rounded-full bg-bd overflow-hidden mb-2 shadow-inner">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(p, 100)}%`, background: cl }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-t2 font-mono px-1">
                     <span className="flex flex-col"><span className="text-t3 font-sans font-normal text-[8px] uppercase leading-tight mb-0.5">Tgt</span>{t.tgt}</span>
                     <span className="flex flex-col"><span className="text-t3 font-sans font-normal text-[8px] uppercase leading-tight mb-0.5">Done</span><span className="text-[#2ee89d]">{t.ach}</span></span>
                     <span className="flex flex-col text-right"><span className="text-t3 font-sans font-normal text-[8px] uppercase leading-tight mb-0.5">Pend</span><span className="text-or">{Math.max(t.tgt - t.ach, 0)}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-2.5 mt-5">
          <span className="text-[13px] font-extrabold">Recent Activity</span>
          <button className="text-[10px] text-or font-bold cursor-pointer bg-transparent border-0" onClick={() => setTab('history')}>See all</button>
        </div>
        {mTx.slice(0,3).map((tx: any) => renderTx(tx))}
      </>
    );
  };

  const renderLeaderboard = () => {
    let lb = [...state.db.mgrs];
    if (lbTab === 'area') {
      lb = lb.filter((x: any) => x.area === m.area);
    } else if (lbTab === 'state') {
      // Because we don't have state field, we consider everything in Gujarat for now as a mock, so we can just show 'global' or 'all in same state'
      // If there was a state field, we would filter by it. Here we just show a slightly bigger subset than area
      // Let's assume all these areas are in Gujarat
      lb = lb.filter((x: any) => ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Bhavnagar'].includes(x.area));
    }
    lb = lb.sort((a: any, b: any) => b.pts - a.pts);

    const t3 = lb.slice(0, 3);
    const rest = lb.slice(3);
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    
    return (
      <>
        <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Leaderboard</h2>
        <div className="flex gap-0 mb-4 rounded-xl border border-bd2 overflow-hidden">
          {['area', 'state', 'global'].map(t => (
            <button key={t} className={`flex-1 py-2 text-center text-[11px] font-bold cursor-pointer border-0 transition-colors ${lbTab === t ? 'bg-gradient-to-br from-[#ff6b9d] to-[#c44dff] text-white' : 'bg-sf text-t3'}`} onClick={() => setLbTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        
        <p className="text-center mb-2 text-[10px] text-[#2ee89d] font-semibold tracking-widest uppercase before:content-['▲_']">Top Ranking</p>
        
        <div className="flex items-end justify-center gap-1.5 mb-5 px-2.5">
          {t3[1] && (
            <div className="flex flex-col items-center gap-1 animate-[popIn_0.5s_ease] delay-100">
              <div className="rounded-full flex items-center justify-center font-extrabold relative border-[3px] border-[#C0C0C0] shadow-[0_4px_16px_rgba(192,192,192,0.2)] w-[52px] h-[52px] text-base text-white" style={{ background: t3[1].avClr }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white absolute -bottom-[6px] -right-[6px] shadow-sm bg-[#C0C0C0]">2</span>
                {t3[1].av}
              </div>
              <p className="text-[10px] font-bold max-w-[72px] text-center whitespace-nowrap overflow-hidden text-ellipsis">{t3[1].nm}</p>
              <p className="text-[11px] font-bold font-mono text-[#2ee89d] flex items-center gap-0.5 before:content-['⚡'] before:text-[10px]">{t3[1].pts.toLocaleString()}</p>
              <div className="rounded-t-lg flex items-end justify-center pb-1.5 text-base font-black text-white/5 w-[70px] h-[56px] bg-gradient-to-b from-[rgba(192,192,192,0.1)] to-transparent">2</div>
            </div>
          )}
          {t3[0] && (
            <div className="flex flex-col items-center gap-1 animate-[popIn_0.5s_ease]">
              <div className="rounded-full flex items-center justify-center font-extrabold relative border-[3px] border-[#FFD700] shadow-[0_4px_20px_rgba(255,215,0,0.3)] w-[62px] h-[62px] text-lg text-white" style={{ background: t3[0].avClr }}>
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-lg drop-shadow">👑</span>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-black absolute -bottom-[6px] -right-[6px] shadow-sm bg-[#FFD700]">1</span>
                {t3[0].av}
              </div>
              <p className="text-[10px] font-bold max-w-[72px] text-center whitespace-nowrap overflow-hidden text-ellipsis">{t3[0].nm}</p>
              <p className="text-[11px] font-bold font-mono text-[#2ee89d] flex items-center gap-0.5 before:content-['⚡'] before:text-[10px]">{t3[0].pts.toLocaleString()}</p>
              <div className="rounded-t-lg flex items-end justify-center pb-1.5 text-base font-black text-white/5 w-[70px] h-[72px] bg-gradient-to-b from-[rgba(255,215,0,0.08)] to-transparent">1</div>
            </div>
          )}
          {t3[2] && (
            <div className="flex flex-col items-center gap-1 animate-[popIn_0.5s_ease] delay-200">
              <div className="rounded-full flex items-center justify-center font-extrabold relative border-[3px] border-[#CD7F32] shadow-[0_4px_16px_rgba(205,127,50,0.2)] w-[48px] h-[48px] text-sm text-white" style={{ background: t3[2].avClr }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white absolute -bottom-[6px] -right-[6px] shadow-sm bg-[#CD7F32]">3</span>
                {t3[2].av}
              </div>
              <p className="text-[10px] font-bold max-w-[72px] text-center whitespace-nowrap overflow-hidden text-ellipsis">{t3[2].nm}</p>
              <p className="text-[11px] font-bold font-mono text-[#2ee89d] flex items-center gap-0.5 before:content-['⚡'] before:text-[10px]">{t3[2].pts.toLocaleString()}</p>
              <div className="rounded-t-lg flex items-end justify-center pb-1.5 text-base font-black text-white/5 w-[70px] h-[40px] bg-gradient-to-b from-[rgba(205,127,50,0.08)] to-transparent">3</div>
            </div>
          )}
        </div>
        
        {rest.map((g: any, i: number) => {
          const rn = i + 4;
          const medalCls = rn <= 6 ? 'bg-[radial-gradient(circle,rgba(255,215,0,0.15),transparent)] rounded-full' : '';
          return (
            <div key={g.id} className={`flex items-center gap-2.5 p-2.5 px-3.5 bg-bg-sec border rounded-xl mb-1.5 shadow-sh transition-colors ${g.id === m.id ? 'border-[rgba(212,140,85,0.25)] bg-[linear-gradient(90deg,rgba(212,140,85,0.06),transparent)]' : 'border-bd hover:border-[rgba(155,122,255,0.15)]'}`}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 border-bd2 text-white" style={{ background: g.avClr }}>{g.av}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{g.nm}{g.id === m.id ? ' <span style="font-size:8px;color:var(--color-brand-or)">(You)</span>' : ''}</p>
                <p className="text-[9px] text-t3">{g.store} · {g.area}</p>
              </div>
              <span className="text-[13px] font-bold font-mono text-[#2ee89d] flex items-center gap-1 before:content-['⚡'] before:text-[10px]">{g.pts.toLocaleString()}</span>
              <div className={`w-7 h-7 flex items-center justify-center text-base ${medalCls}`}>{medals[rn-1] || rn + 'th'}</div>
            </div>
          );
        })}
      </>
    );
  };

  const renderUpload = () => (
    <>
      <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Upload IMEI</h2>
      <div className="bg-bg-sec border border-bd rounded-[14px] p-3.5 mb-2.5 shadow-sh">
        <h3 className="text-[13px] font-bold mb-2 flex items-center gap-1"><Icons.ph className="w-[14px] h-[14px]" /> IMEI Entry</h3>
        <select className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none appearance-none cursor-pointer" 
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' fill=\'%239e96c0\'%3E%3Cpath d=\'M5 7L0 2h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                value={selMod} onChange={e => setSelMod(e.target.value)}>
          {state.db.models.map((mod: any) => <option key={mod.id} value={mod.id} className="bg-bg-sec">{mod.nm}</option>)}
        </select>
        <div className="flex gap-1.5 mb-1.5">
          <input className="flex-1 p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] focus:border-or outline-none" 
                 placeholder="15-digit IMEI" value={imei} onChange={e => setImei(e.target.value.replace(/\D/g, ''))} maxLength={15} inputMode="numeric" />
          <button className="px-3 rounded-[9px] border-none bg-[rgba(212,140,85,0.12)] text-or text-[11px] font-bold cursor-pointer whitespace-nowrap flex items-center gap-1 active:scale-95 transition-transform" 
                  onClick={handleAddImei}>
            <Icons.pls className="w-3 h-3" /> Add
          </button>
        </div>
        <p className="text-[10px] text-t3">⚠ Requires admin approval · {state.db.policy?.basePtsPerImei || 150} pts base + model bonus</p>
      </div>
      
      <div className="bg-bg-sec border border-bd rounded-[14px] p-3.5 shadow-sh">
        <h3 className="text-[13px] font-bold mb-2">📋 My Uploads</h3>
        {ims.length ? ims.map((im: any) => {
          const mod = state.db.models.find((m: any) => m.id === im.model);
          const stC = im.sts === 'approved' ? {bg:'rgba(46,232,157,0.1)',tx:'#2ee89d'} : im.sts === 'pending' ? {bg:'rgba(212,140,85,0.1)',tx:'var(--color-brand-or)'} : {bg:'rgba(255,90,101,0.1)',tx:'#ff5a65'};
          return (
            <div key={im.id} className="flex items-center justify-between p-[7px_10px] bg-sf border border-bd rounded-[9px] mb-1 font-mono text-[10px]">
              <span>{im.imei.slice(0,6)}...{im.imei.slice(-4)}</span>
              <span className="text-t3">{mod?.nm || ''}</span>
              <span className="text-t3">{im.dt}</span>
              <span className="px-[7px] py-[2px] rounded-[5px] text-[8px] font-bold uppercase" style={{ background: stC.bg, color: stC.tx }}>{im.sts}</span>
            </div>
          )
        }) : <p className="text-[11px] text-t3 text-center p-3">No uploads yet</p>}
      </div>
    </>
  );

  const renderTx = (tx: any) => (
    <div key={tx.id} className="bg-bg-sec border border-bd gap-2.5 rounded-xl p-[11px_13px] mb-1.5 flex items-center shadow-sh">
      <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm font-bold shrink-0" 
           style={{ background: tx.tp === 'credit' ? 'rgba(46,232,157,0.1)' : 'rgba(255,90,101,0.1)', color: tx.tp === 'credit' ? '#2ee89d' : '#ff5a65' }}>
        {tx.tp === 'credit' ? '+' : '−'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold mb-px whitespace-nowrap overflow-hidden text-ellipsis">{tx.rs}</p>
        <p className="text-[9px] text-t3">{tx.dt} · {tx.by}</p>
      </div>
      <span className="text-[13px] font-bold font-mono" style={{ color: tx.tp === 'credit' ? '#2ee89d' : '#ff5a65' }}>
        {tx.tp === 'credit' ? '+' : '−'}{tx.pt.toLocaleString()}
      </span>
    </div>
  );

  const renderRewards = () => {
    const fl = ct === 'All' ? state.db.rw : state.db.rw.filter((b: any) => b.ct === ct);
    const myReds = (state.db.rd || []).filter((r: any) => r.mid === m.id);
    return (
      <>
        <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Rewards</h2>
        <div className="flex gap-2 mb-4 bg-bg-sec p-1 rounded-[14px]">
           <button className={`flex-1 py-2 text-xs font-bold rounded-[11px] cursor-pointer transition-colors border-0 ${rwTb === 'inv' ? 'bg-[#2ee89d] text-[#111] shadow-sm' : 'bg-transparent text-t2'}`} onClick={() => setRwTb('inv')}>Explore</button>
           <button className={`flex-1 py-2 text-xs font-bold rounded-[11px] cursor-pointer transition-colors border-0 flex items-center justify-center gap-1.5 ${rwTb === 'red' ? 'bg-[#2ee89d] text-[#111] shadow-sm' : 'bg-transparent text-t2'}`} onClick={() => setRwTb('red')}>My Redemptions {myReds.length > 0 && <span className={`px-1.5 py-0.5 rounded-[5px] text-[8px] ${rwTb === 'red' ? 'bg-[#111] text-[#2ee89d]' : 'bg-[rgba(255,255,255,0.05)] text-t3'}`}>{myReds.length}</span>}</button>
        </div>
        
        {rwTb === 'inv' && (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2.5 no-scrollbar">
            {CTS.map(c => (
              <button key={c} className={`px-3 py-1.5 rounded-[18px] border-[1.5px] border-bd2 text-[10px] font-semibold whitespace-nowrap shrink-0 cursor-pointer ${ct === c ? 'bg-or border-or text-white' : 'bg-sf text-t2'}`} onClick={() => setCt(c)}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {fl.map((b: any) => (
              <div key={b.id} className="bg-bg-sec border border-bd rounded-[13px] overflow-hidden cursor-pointer shadow-sh active:scale-95 transition-transform" onClick={() => { setSh(b.id); setDm(b.dm[0]); }}>
                <div className="h-[76px] flex items-center justify-center text-[28px] relative" style={{ background: b.bg }}>
                  {b.tg && (
                    <span className="absolute top-[5px] right-[5px] px-1.5 py-[2px] rounded-[5px] text-[7px] font-bold tracking-wider" 
                          style={{ background: b.tg === 'hot' ? 'rgba(255,90,101,0.12)' : b.tg === 'new' ? 'rgba(29,212,232,0.1)' : 'rgba(212,216,110,.1)', color: b.tg === 'hot' ? '#ff5a65' : b.tg === 'new' ? '#1dd4e8' : 'var(--color-brand-yl)' }}>
                      {b.tg.toUpperCase()}
                    </span>
                  )}
                  <span className="z-10 text-[28px]">{b.ic}</span>
                </div>
                <div className="p-[9px_11px]">
                  <p className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{b.nm}</p>
                  <div className="flex justify-between text-[10px] mt-[3px]">
                    <span className="text-or font-bold font-mono">{b.pt}pts</span>
                    <span className="text-t3">{b.sk} left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
        )}
        
        {rwTb === 'red' && (
        <div className="flex flex-col gap-2 mb-3">
           {myReds.length === 0 && <p className="text-t3 text-center mt-7 text-xs">No redemptions yet.</p>}
           {myReds.map((r: any) => (
             <div key={r.id} className="bg-bg-sec border border-bd rounded-[13px] p-3 shadow-sh flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-tx mb-[2px]">{r.rnm}</p>
                  <p className="text-[10px] text-t3">{r.dt} {r.rx ? `· Exp: ${r.rx}` : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[11px] font-bold font-mono text-or">-{r.pt} pts</span>
                   <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase ${r.sts === 'completed' ? 'bg-[#2ee89d]/10 text-[#2ee89d]' : r.sts === 'expired' ? 'bg-[#ff5a65]/10 text-[#ff5a65]' : 'bg-or/10 text-or'}`}>{r.sts}</span>
                </div>
             </div>
           ))}
        </div>
        )}
      </>
    );
  };

  const renderBadges = () => (
    <>
      <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Badges & Achievements</h2>
      <div className="grid grid-cols-3 gap-1.5 mb-3.5">
        {BADGES.map((b: any) => (
          <div key={b.id} className={`bg-bg-sec border rounded-[13px] p-3 text-center shadow-sh relative overflow-hidden ${b.er ? 'border-[rgba(212,140,85,0.2)]' : 'border-bd opacity-35'}`}>
            {b.er && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,140,85,0.06),transparent_70%)] pointer-events-none"></div>}
            {b.er && <div className="absolute top-[5px] right-[5px] w-3.5 h-3.5 rounded-full bg-[rgba(46,232,157,0.15)] text-[#2ee89d] flex items-center justify-center"><Icons.chk className="w-2 h-2" /></div>}
            <div className="text-[26px] mb-1">{b.ic}</div>
            <p className="text-[10px] font-bold">{b.nm}</p>
            <p className="text-[8px] text-t3 mt-px">{b.ds}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-bg-sec border border-bd rounded-[14px] p-4 mb-3 shadow-sh flex items-center gap-[14px]">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0" style={{ background: `${tier.cl}20` }}>{tier.ic}</div>
        <div className="flex-1">
          <h4 className="text-sm font-bold">{tier.nm} Tier</h4>
          <p className="text-[10px] text-t3">{m.pts.toLocaleString()} points</p>
          <div className="h-1.5 rounded-full bg-bd mt-1.5 w-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min((m.pts/10000)*100,100)}%`, background: tier.cl }}></div>
          </div>
        </div>
      </div>
      
      <div className="bg-bg-sec border border-bd rounded-[14px] p-3.5 mb-2 shadow-sh">
        <h3 className="text-[13px] font-bold mb-1.5">🔥 Streak: {m.streak} days</h3>
        <div className="flex gap-[3px] mt-2">
          {Array.from({length:7}).map((_,i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < (m.streak % 7) ? 'var(--color-brand-or)' : 'rgba(255,255,255,0.06)' }}></div>
          ))}
        </div>
      </div>
    </>
  );

  const renderHistory = () => (
    <>
      <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Points History</h2>
      {mTx.length ? mTx.map((tx: any) => renderTx(tx)) : <p className="text-t3 text-center mt-7">No transactions</p>}
    </>
  );

  const renderProfile = () => {
    return (
      <>
        <div className="bg-bg-sec border border-bd rounded-2xl p-5 my-3 text-center shadow-sh">
          <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-or to-[#e8a040] flex items-center justify-center text-[22px] font-extrabold text-white mx-auto mb-2 shadow-[0_6px_20px_rgba(212,140,85,0.3)] relative">
            {rnk === 1 && <span className="absolute -top-3.5 text-xl">👑</span>}
            {m.av}
          </div>
          <p className="text-base font-extrabold">{m.nm}</p>
          <p className="text-[10px] text-t3 font-mono">{tier.ic} {tier.nm} · {m.area}</p>
          <p className="text-[11px] text-t2">{m.store}</p>
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <p className="text-base font-bold font-mono text-or">{m.pts.toLocaleString()}</p>
              <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Points</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-mono text-[#2ee89d]">{m.approvedImei}</p>
              <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-mono text-yl">{m.pendingImei}</p>
              <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Pending</p>
            </div>
          </div>
          
          <button className="mt-4 w-full py-2 bg-[rgba(212,140,85,0.1)] border border-[rgba(212,140,85,0.2)] rounded-lg text-xs font-bold text-or cursor-pointer transition-colors hover:bg-[rgba(212,140,85,0.2)]" onClick={() => { setEpData({ email: m.email||'', dob: m.dob||'', addr: m.addr||'', social: m.social||'' }); setEpMo(true); }}>Edit Profile Details</button>
        </div>
        
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-bd rounded-xl cursor-pointer text-tx mb-1.5 active:scale-[0.98] transition-transform" onClick={() => setTab('history')}>
          <Icons.clk className="w-[18px] h-[18px]" /> <span className="flex-1 text-xs font-semibold">Points History</span> <Icons.ar className="w-3 h-3 rotate-180" />
        </div>
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-bd rounded-xl cursor-pointer text-tx mb-1.5 active:scale-[0.98] transition-transform" onClick={() => setTab('rewards')}>
          <Icons.gift className="w-[18px] h-[18px]" /> <span className="flex-1 text-xs font-semibold">My Rewards</span> <Icons.ar className="w-3 h-3 rotate-180" />
        </div>
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-bd rounded-xl cursor-pointer text-tx mb-1.5 active:scale-[0.98] transition-transform" onClick={() => setTab('badges')}>
          <Icons.star className="w-[18px] h-[18px]" /> <span className="flex-1 text-xs font-semibold">Badges & Tier</span> <Icons.ar className="w-3 h-3 rotate-180" />
        </div>
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-bd rounded-xl cursor-pointer text-tx mb-1.5 active:scale-[0.98] transition-transform" onClick={() => setTab('faq')}>
          <Icons.info className="w-[18px] h-[18px]" /> <span className="flex-1 text-xs font-semibold">FAQ & Terms</span> <Icons.ar className="w-3 h-3 rotate-180" />
        </div>
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-bd rounded-xl cursor-pointer text-tx mb-1.5 active:scale-[0.98] transition-transform" onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}>
          <span className="text-lg leading-none">{state.theme === 'dark' ? '☀️' : '🌙'}</span> <span className="flex-1 text-xs font-semibold">{state.theme === 'dark' ? 'Light' : 'Dark'} Mode</span> 
          <div className={`w-10 h-[22px] rounded-full relative ${state.theme === 'light' ? 'bg-or' : 'bg-bd2'}`}>
            <div className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-bg-sec shadow-sm transition-transform ${state.theme === 'light' ? 'translate-x-[18px]' : ''}`}></div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-[11px_13px] bg-sf border border-[rgba(255,90,101,0.1)] rounded-xl cursor-pointer text-[#ff5a65] mb-1.5 active:scale-[0.98] transition-transform" onClick={logout}>
          <Icons.out className="w-[18px] h-[18px]" /> <span className="flex-1 text-xs font-semibold">Logout</span> <Icons.ar className="w-3 h-3 rotate-180" />
        </div>
      </>
    );
  };

  const renderSheet = () => {
    if (modelSh) {
      const mod = state.db.models.find((x: any) => x.id === modelSh);
      const t = (m.targets || {} as Record<string, any>)[modelSh] || { tgt: 0, ach: 0 };
      const modIms = ims.filter((i: any) => i.model === modelSh);
      const p = t.tgt ? Math.round((t.ach / t.tgt) * 100) : 0;
      
      return (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.55)] z-[200] animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => setModelSh(null)}></div>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg-sec rounded-t-[22px] z-[201] animate-[su_0.3s] max-h-[88vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
            <div className="w-[34px] h-1 rounded-full bg-t3 mx-auto mt-2.5"></div>
            <div className="py-4 px-5 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[28px] shrink-0" style={{ background: mod?.bg, color: mod?.cl }}>{mod?.ic}</div>
              <div>
                <p className="text-[17px] font-extrabold">{mod?.nm}</p>
                <p className="text-[10px] text-t3 uppercase tracking-[0.06em] font-semibold">Target Details</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center">
                  <p className="text-[15px] font-bold font-mono text-or">{t.tgt}</p><p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Target</p>
                </div>
                <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center">
                  <p className="text-[15px] font-bold font-mono text-[#2ee89d]">{t.ach}</p><p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Achieved</p>
                </div>
                <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center">
                  <p className="text-[15px] font-bold font-mono" style={{ color: p >= 80 ? '#2ee89d' : p >= 50 ? 'var(--color-brand-yl)' : 'var(--color-brand-or)' }}>{p}%</p>
                  <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Progress</p>
                </div>
              </div>
              <div className="mb-3.5">
                <div className="h-2 rounded-full bg-bd overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(p, 100)}%`, background: p >= 80 ? '#2ee89d' : p >= 50 ? 'var(--color-brand-yl)' : 'var(--color-brand-or)' }}></div>
                </div>
              </div>
              <p className="text-[10px] text-t3 mb-1.5 font-bold uppercase tracking-[0.06em]">IMEI History</p>
              {modIms.length ? modIms.map((im: any) => (
                <div key={im.id} className="flex items-center justify-between p-[7px_10px] bg-sf border border-bd rounded-[9px] mb-1 font-mono text-[10px]">
                  <span>{im.imei}</span>
                  <span className="text-t3">{im.dt}</span>
                  <span className="px-[7px] py-[2px] rounded-[5px] text-[8px] font-bold uppercase" style={{ background: im.sts === 'approved' ? 'rgba(46,232,157,0.1)' : 'rgba(212,140,85,0.1)', color: im.sts === 'approved' ? '#2ee89d' : 'var(--color-brand-or)' }}>{im.sts}</span>
                </div>
              )) : <p className="text-[11px] text-t3 text-center p-3">No uploads for this model</p>}
            </div>
          </div>
        </>
      )
    }

    if (sh) {
      const b = state.db.rw.find((x: any) => x.id === sh);
      if (b) {
        const sd = dm || b.dm[0];
        const pn = Math.round(b.pt * (sd / b.dm[0]));
        const cr = m.pts >= pn && b.sk > 0;
        return (
          <>
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.55)] z-[200] animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => setSh(null)}></div>
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg-sec rounded-t-[22px] z-[201] animate-[su_0.3s] max-h-[88vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
              <div className="w-[34px] h-1 rounded-full bg-t3 mx-auto mt-2.5"></div>
              <div className="py-4 px-5 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[28px] shrink-0" style={{ background: b.bg }}>{b.ic}</div>
                <div><p className="text-[17px] font-extrabold">{b.nm}</p><p className="text-[10px] text-t3 uppercase tracking-[0.06em] font-semibold">{b.ct}</p></div>
              </div>
              <div className="px-5 pb-5">
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center"><p className="text-[15px] font-bold font-mono text-or">{pn}</p><p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Points</p></div>
                  <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center"><p className="text-[15px] font-bold font-mono text-[#2ee89d]">{b.sk}</p><p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Stock</p></div>
                  <div className="bg-sf border border-bd rounded-[10px] p-2.5 text-center flex flex-col justify-center">
                    {(b as any).rx ? (
                       <>
                         <p className="text-[10px] font-bold font-mono text-[#ff5a65] truncate leading-none mb-0.5">{(b as any).rx}</p>
                         <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Expires</p>
                       </>
                    ) : (
                       <>
                         <p className="text-[15px] font-bold font-mono text-lb leading-none mb-0.5">1yr</p>
                         <p className="text-[8px] text-t3 uppercase tracking-[0.06em] font-semibold">Valid</p>
                       </>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-t3 mb-1.5 font-bold uppercase tracking-[0.06em]">Denomination</p>
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {b.dm.map((d: any) => (
                    <button key={d} className={`px-3.5 py-2 rounded-[9px] border text-[11px] font-semibold cursor-pointer font-mono ${sd === d ? 'bg-[rgba(212,140,85,0.12)] border-or text-or' : 'bg-sf border-bd2 text-tx'}`} onClick={() => setDm(d)}>
                      ₹{d.toLocaleString()}
                    </button>
                  ))}
                </div>
                <button 
                  className="w-full p-3.5 rounded-xl border-none text-sm font-bold cursor-pointer active:scale-95 transition-transform" 
                  style={{ background: cr ? 'var(--grd-o)' : 'rgba(255,255,255,0.06)', color: cr ? '#fff' : 'var(--color-t3)' }} 
                  disabled={!cr} 
                  onClick={handleRedeem}>
                  {cr ? `Redeem for ${pn} pts` : `Need ${pn - m.pts} more`}
                </button>
              </div>
            </div>
          </>
        );
      }
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-[100dvh] relative text-tx flex flex-col">
      <div className="sticky top-0 z-50 pt-3 px-4 flex items-center justify-between bg-gradient-to-b from-bg-prime/100 to-transparent pb-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-green-400 to-[#1bb377] bg-clip-text text-transparent inline-flex items-center gap-1"><HMPLLogo className="w-3.5 h-3.5 text-green-400 drop-shadow-[0_0_2px_rgba(46,232,157,0.8)]" /> HMPL Rewards</p>
          <p className="text-base font-extrabold">{m.nm}</p>
        </div>
        <div className="flex gap-1.5">
          <button className="w-9 h-9 rounded-lg bg-sf border border-bd flex items-center justify-center cursor-pointer text-t2 relative" onClick={() => setTab('notifications')}>
             <Icons.bel className="w-4 h-4" />
             {ur > 0 && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ff5a65] rounded-full border-2 border-bg-prime"></div>}
          </button>
        </div>
      </div>
      
      <div className="px-4 pb-[106px] flex-1 overflow-y-auto">
        {tab === 'home' && renderHome()}
        {tab === 'upload' && renderUpload()}
        {tab === 'rewards' && renderRewards()}
        {tab === 'leaderboard' && renderLeaderboard()}
        {tab === 'badges' && renderBadges()}
        {tab === 'history' && renderHistory()}
        {tab === 'profile' && renderProfile()}
        {tab === 'notifications' && (
          <>
            <h2 className="text-lg font-extrabold my-3.5 tracking-tight">Notifications</h2>
            {ns.map((n: any) => (
              <div key={n.id} className="p-[11px_13px] bg-bg-sec border border-bd rounded-xl mb-1.5 shadow-sh" style={{ borderLeft: `3px solid ${n.rd ? 'transparent' : 'var(--color-brand-or)'}` }}>
                <p className="text-[11px] leading-tight mb-0.5">{n.mg}</p>
                <p className="text-[9px] text-t3">{n.dt}</p>
              </div>
            ))}
          </>
        )}
        {tab === 'faq' && (
          <div className="flex flex-col gap-2 relative mt-3 mb-4">
            <h2 className="text-lg font-extrabold my-1 tracking-tight">FAQ & Terms</h2>
            <div className="relative mb-2">
              <input className="w-full p-3 pl-10 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] focus:border-or outline-none" placeholder="Search policies and terms..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <Icons.sch className="w-4 h-4 text-t3 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <h3 className="text-base font-bold my-1 mt-2 text-or">FAQ</h3>
            {FAQ.filter((f: any) => f.q.toLowerCase().includes(searchQ.toLowerCase()) || f.a.toLowerCase().includes(searchQ.toLowerCase())).map((f: any, i) => (
              <div key={i} className="bg-bg-sec border border-bd rounded-xl p-3 shadow-sh">
                <p className="text-xs font-bold mb-1">❓ {f.q}</p>
                <p className="text-[11px] text-t2 leading-relaxed">{f.a}</p>
              </div>
            ))}
            
            <h3 className="text-base font-bold my-1 mt-3 text-or">Terms</h3>
            <div className="bg-bg-sec border border-bd rounded-xl p-3 mb-1.5 shadow-sh">
              {TERMS.filter((t: string) => t.toLowerCase().includes(searchQ.toLowerCase())).map((t: string, i: number) => (
                <p key={i} className="text-[11px] text-t2 leading-relaxed mb-1"><strong className="text-or">•</strong> {t}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[rgba(16,10,40,0.95)] border-t border-bd flex p-[3px_5px] pb-[max(7px,env(safe-area-inset-bottom))] backdrop-blur-md z-[100]">
        {[
          {id:'home',i:Icons.home,l:'Home'},
          {id:'upload',i:Icons.up,l:'Upload'},
          {id:'rewards',i:Icons.gift,l:'Rewards'},
          {id:'history',i:Icons.clk,l:'History'},
          {id:'leaderboard',i:Icons.bar,l:'Rank'},
          {id:'profile',i:Icons.usr,l:'Profile'}
        ].map(t => (
          <button key={t.id} className={`flex-1 flex flex-col items-center gap-px py-1.5 rounded-[9px] bg-transparent border-0 cursor-pointer relative transition-colors ${tab === t.id ? 'text-or' : 'text-t3'}`} onClick={() => setTab(t.id)}>
            <div className={`w-[3px] h-[3px] rounded-full bg-or absolute top-[2px] ${tab === t.id ? 'block' : 'hidden'}`}></div>
            <t.i className="w-[18px] h-[18px]" />
            <span className="text-[8px] font-semibold">{t.l}</span>
          </button>
        ))}
      </div>
      
      {renderSheet()}
      {epMo && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.55)] z-[200] animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => setEpMo(false)}></div>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg-sec rounded-t-[22px] z-[201] animate-[su_0.3s] max-h-[88vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)] text-tx px-5 pt-4">
            <div className="w-[34px] h-1 rounded-full bg-t3 mx-auto mt-2 mb-4 absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"></div>
            <h3 className="text-lg font-extrabold mb-1 mt-3">Edit Profile</h3>
            <p className="text-[11px] text-t3 mb-4">Update your personal details.</p>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-t2 uppercase tracking-wider mb-1 px-1">Email ID</label>
                <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none focus:border-or" placeholder="e.g. manager@store.com" value={epData.email} onChange={e => setEpData(d => ({...d, email: e.target.value}))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-t2 uppercase tracking-wider mb-1 px-1">Date of Birth</label>
                <input type="date" className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none focus:border-or" value={epData.dob} onChange={e => setEpData(d => ({...d, dob: e.target.value}))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-t2 uppercase tracking-wider mb-1 px-1">Address</label>
                <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none focus:border-or" placeholder="Your residential address" value={epData.addr} onChange={e => setEpData(d => ({...d, addr: e.target.value}))} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-t2 uppercase tracking-wider mb-1 px-1">LinkedIn / Social Link</label>
                <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none focus:border-or" placeholder="https://linkedin.com/in/..." value={epData.social} onChange={e => setEpData(d => ({...d, social: e.target.value}))} />
              </div>
            </div>
            
            <button className="w-full p-3.5 mb-5 bg-[rgba(212,140,85,0.12)] border border-[rgba(212,140,85,0.25)] rounded-[11px] text-or text-sm font-bold cursor-pointer transition-transform active:scale-[0.98]" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </div>
        </>
      )}
      {tst && <div className={`fixed top-[max(12px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 p-[10px_16px] rounded-xl z-[400] text-xs font-semibold flex items-center gap-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.3)] animate-[sd_0.3s] max-w-[86%] ${tst.t === 'ok' ? 'bg-[rgba(6,95,70,0.92)] text-[#a7f3d0] border border-[rgba(46,232,157,0.15)]' : 'bg-[rgba(127,29,29,0.92)] text-[#fca5a5] border border-[rgba(255,90,101,0.15)]'}`}>{tst.t === 'ok' ? <Icons.chk className="w-3 h-3" /> : ''} {tst.m}</div>}
    </div>
  );
}
