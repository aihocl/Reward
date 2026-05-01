'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Icons, HMPLLogo } from './icons';
import { AREAS, CTS } from '@/lib/initial-data';
import { uid, td } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as xlsx from 'xlsx';
import QRScanner from './QRScanner';

export function AdminApp() {
  const { state, updateDb, setTheme, logout } = useStore();
  const [at, setAt] = useState('dash');
  const [sr, setSr] = useState('');
  const [rwTb, setRwTb] = useState('inv');
  const [rptTb, setRptTb] = useState('mgrs');
  const [mo, setMo] = useState('');
  const [md, setMd] = useState<any>({});
  
  // Forms
  const [pv, setPv] = useState('');
  const [pr, setPr] = useState('');
  const [nn, setNn] = useState('');
  const [np, setNp] = useState('');
  const [ns, setNs] = useState('');
  const [na, setNa] = useState('Ahmedabad');
  const [rn, setRn] = useState('');
  const [rc, setRc] = useState(CTS[1]);
  const [rp, setRp] = useState('');
  const [rs, setRs] = useState('');
  const [rx, setRx] = useState(''); // Expiry/Validity
  const [newMgrTgts, setNewMgrTgts] = useState<Record<string, number>>({});
  const [mdNm, setMdNm] = useState('');

  const [mdIc, setMdIc] = useState('📱');
  const [selIm, setSelIm] = useState<string[]>([]);
  const [tgtValues, setTgtValues] = useState<Record<string, {tgt: number, ach: number}>>({});
  const [xTgts, setXTgts] = useState<any[]>([]);
  const [xMods, setXMods] = useState<any[]>([]);
  
  const [ePol, setEPol] = useState<any>(null);

  const [tst, setTst] = useState<{m: string, t: string} | null>(null);

  const showToast = (msg: string, type = 'ok') => {
    setTst({ m: msg, t: type });
    setTimeout(() => setTst(null), 2800);
  };

  const handleUploadExcelMods = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = xlsx.utils.sheet_to_json(ws);
        
        const parsed = data.map((row: any) => {
          return {
            nm: row['Model Name'] || '',
            sr: row['Model Series'] || 'Other',
            ic: row['Icon'] || '📱',
          };
        }).filter(r => r.nm);
        setXMods(parsed);
        showToast(`Loaded ${parsed.length} models`, 'ok');
      } catch (err) {
        showToast('Invalid Excel file format', 'err');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = xlsx.utils.sheet_to_json(ws);
        
        const newTgts: any[] = [];
        const newModelsFound: any[] = [];
        const existingModels = [...state.db.models];
        
        data.forEach((row, ind) => {
          const ph = row['Phone'] || row['phone'] || row['Manager Phone'] || row['Manager Phone Number'];
          if (!ph) return;
          
          let mgrs = state.db.mgrs;
          let mgr = mgrs.find((m: any) => m.ph.includes(String(ph).trim()));
          if (!mgr) {
             mgr = mgrs.find((m: any) => m.nm.toLowerCase() === String(ph).trim().toLowerCase());
             if (!mgr) return;
          }
          
          const tgts: any = {};
          let foundAny = false;
          Object.keys(row).forEach(k => {
             const lowerK = k.trim().toLowerCase();
             if (['phone', 'manager phone', 'manager phone number', 'name', 'store'].includes(lowerK)) return;
             
             let matchedModel = existingModels.find((m: any) => m.nm.toLowerCase() === lowerK || m.id === k.trim());
             if (!matchedModel) {
               matchedModel = newModelsFound.find((m: any) => m.nm.toLowerCase() === lowerK);
               if (!matchedModel) {
                 const newId = k.replace(/\s+/g, '').slice(0, 4).toUpperCase() + uid().slice(0, 2);
                 matchedModel = { id: newId, nm: k.trim(), ic: '📱', cl: '#fff', bg: 'rgba(255,255,255,0.1)' };
                 newModelsFound.push(matchedModel);
               }
             }
             if (matchedModel) {
                 tgts[matchedModel.id] = parseInt(row[k]) || 0;
                 foundAny = true;
             }
          });
          
          if (foundAny) {
            newTgts.push({ id: uid() + ind, mgrId: mgr.id, mgrNm: mgr.nm, ph: mgr.ph, tgts });
          }
        });
        
        if (newModelsFound.length > 0) {
           updateDb((prev: any) => {
              const db = { ...prev };
              db.models = [...db.models, ...newModelsFound];
              // Ensure existing managers have the new model initialized
              newModelsFound.forEach(newModel => {
                 db.mgrs.forEach((m: any) => {
                    if(!m.targets) m.targets = {};
                    if(!m.targets[newModel.id]) m.targets[newModel.id] = { tgt: 0, ach: 0 };
                 });
              });
              return db;
           });
        }
        
        setXTgts(newTgts);
        e.target.value = '';
      } catch (err) {
        showToast('Error parsing Excel', 'err');
      }
    };
    reader.readAsBinaryString(file);
  };

  const pndIm = state.db.pendingImeis.filter((i: any) => i.sts === 'pending');
  const tPts = state.db.mgrs.reduce((s: any, m: any) => s + m.pts, 0) as number;
  const tIm = state.db.mgrs.reduce((s: any, m: any) => s + m.approvedImei, 0) as number;

  const tabs = [
    {id:'dash',i:Icons.home,l:'Dashboard'},
    {id:'mgrs',i:Icons.usrs,l:'Managers'},
    {id:'mdls',i:Icons.set,l:'Models'},
    {id:'pol',i:Icons.file,l:'Reward Policy'},
    {id:'imeis',i:Icons.ph,l:'IMEI'},
    {id:'rws',i:Icons.gift,l:'Rewards'},
    {id:'rpt',i:Icons.bar,l:'Reports'},
    {id:'log',i:Icons.cn,l:'Audit Log'}
  ];

  const handleAction = (a: string, data?: any) => {
    if (a === 'export') { showToast('Excel exported!'); }
    else if (a === 'am') setMo('am');
    else if (a === 'ar') setMo('ar');
    else if (a === 'excel-mods') { setMo('excel-mods'); setXMods([]); }
    else if (a === 'apply-excel-mods') {
      updateDb((prev: any) => {
         const db = JSON.parse(JSON.stringify(prev));
         if (!db.adminLog) db.adminLog = [];
         db.adminLog = [{id: uid(), dt: td(), act: 'Bulk Models Upload', det: `Uploaded ${xMods.length} models via Excel`}, ...db.adminLog];
         
         const newMods = xMods.map((xm: any) => {
            const existing = db.models.find((m: any) => m.nm.toLowerCase() === xm.nm.toLowerCase());
            if (existing) {
              return { ...existing, sr: xm.sr, ic: xm.ic };
            } else {
              const id = xm.nm.replace(/\s+/g, '').slice(0, 4).toUpperCase() + uid().slice(0, 2);
              return { id, nm: xm.nm, sr: xm.sr, ic: xm.ic, cl: 'var(--color-brand-lb)', bg: 'rgba(159,168,218,.1)' };
            }
         });

         // update models
         db.models = [...db.models.filter((m: any) => !newMods.find((nm: any) => nm.id === m.id)), ...newMods];

         // auto update targets properties
         db.mgrs = db.mgrs.map((m: any) => {
            const nt = { ...(m.targets || {}) };
            newMods.forEach((mod: any) => {
               if (!nt[mod.id]) nt[mod.id] = { tgt: 0, ach: 0 };
            });
            return { ...m, targets: nt };
         });

         return db;
      });
      setMo(''); showToast('Models Updated!');
    }
    else if (a === 'excel') { setMo('excel'); setXTgts([]); }
    else if (a === 'apply-excel') {
      updateDb((prev: any) => {
         const db = JSON.parse(JSON.stringify(prev));
         if (!db.adminLog) db.adminLog = [];
         db.adminLog = [{id: uid(), dt: td(), act: 'Bulk Target Upload', det: `Targets updated for ${xTgts.length} managers via Excel`}, ...db.adminLog];
         
         const nmgrs = db.mgrs.map((m: any) => {
            const uploaded = xTgts.find(t => t.mgrId === m.id);
            if (uploaded) {
               const newTargets = { ...(m.targets || {}) };
               Object.keys(uploaded.tgts).forEach(mid => {
                  newTargets[mid] = { ...(newTargets[mid] || {tgt:0, ach:0}), tgt: uploaded.tgts[mid] };
               });
               return { ...m, targets: newTargets };
            }
            return m;
         });
         db.mgrs = nmgrs;
         return db;
      });
      setMo(''); showToast('Targets updated from Excel!'); setXTgts([]);
    }
    else if (a === 'add-model') setMo('add-model');
    else if (a === 'amod') { setMd({}); setMdNm(''); setMdIc('📱'); setMo('amod'); }
    else if (a === 'emod') { setMd(data); setMdNm(data.nm); setMdIc(data.ic); setMo('amod'); }
    else if (a === 'cm') setMo('');
    else if (a === 'mgr-det') { setMd({ mid: data }); setMo('mgr-det'); }
    else if (a === 'ap') { setMd({mid: data}); setMo('ap'); }
    else if (a === 'at') {
      const mgr = state.db.mgrs.find((m: any) => m.id === data);
      setTgtValues(mgr ? JSON.parse(JSON.stringify(mgr.targets || {})) : {});
      setMd({mid: data});
      setMo('at');
    }
    else if (a === 'st') {
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        if (!db.adminLog) db.adminLog = [];
        const m = db.mgrs.find((m:any)=>m.id===md.mid);
        db.adminLog = [{id: uid(), dt: td(), act: 'Update Target', det: `Manual target update for ${m?.nm || 'Manager'}`}, ...db.adminLog];
        db.mgrs = db.mgrs.map((m: any) => m.id === md.mid ? { ...m, targets: tgtValues } : m);
        return db;
      });
      setMo(''); showToast('Targets Updated!');
    }
    else if (a === 'start-pol') {
      const pol = state.db.policy || { basePtsPerImei: 150, tgtBonusPts: 1000, modelPts: {} };
      setEPol(JSON.parse(JSON.stringify(pol)));
      setMo('edit-pol');
    }
    else if (a === 'save-pol') {
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        if (!db.adminLog) db.adminLog = [];
        db.adminLog = [{id: uid(), dt: td(), act: 'Update Policy', det: `Reward points policy updated`}, ...db.adminLog];
        db.policy = JSON.parse(JSON.stringify(ePol));
        return db;
      });
      setMo(''); showToast('Policy Updated!');
      setEPol(null);
    }
    else if (a === 'sp') {
      const v = parseInt(pv);
      if (!v || !pr) return;
      updateDb((prev: any) => {
        const db = { ...prev };
        if (!db.adminLog) db.adminLog = [];
        const mg = db.mgrs.find((m:any) => m.id === md.mid);
        db.adminLog = [{id: uid(), dt: td(), act: 'Give Points', det: `${v > 0 ? 'Added' : 'Removed'} ${Math.abs(v)} pts to ${mg?.nm}. Reason: ${pr}`}, ...db.adminLog];
        db.mgrs = db.mgrs.map((m: any) => m.id === md.mid ? { ...m, pts: m.pts + v } : m);
        db.tx = [{ id: 'T' + uid(), mid: md.mid, tp: v > 0 ? 'credit' : 'debit', pt: Math.abs(v), rs: pr, dt: td(), by: 'Admin' }, ...db.tx];
        return db;
      });
      setMo(''); showToast('Updated!'); setPv(''); setPr('');
    }
    else if (a === 'sm') {
      if (!nn || !np || !ns) return;
      const tgts: any = {};
      state.db.models.forEach((m: any) => { tgts[m.id] = { tgt: newMgrTgts[m.id] || 0, ach: 0 }; });
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        if (!db.adminLog) db.adminLog = [];
        db.adminLog = [{id: uid(), dt: td(), act: 'Add Manager', det: `New manager ${nn} added in ${na || 'Ahmedabad'}`}, ...db.adminLog];
        db.mgrs = [...db.mgrs, {
          id: 'M' + uid(), nm: nn, ph: np, store: ns, pts: 0, st: 'active',
          av: nn.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          area: na || 'Ahmedabad', targets: tgts, imeis: [], totalImei: 0, pendingImei: 0, 
          approvedImei: 0, streak: 0, avClr: '#3498db'
        }];
        return db;
      });
      setMo(''); showToast('Added!'); setNn(''); setNp(''); setNs(''); setNewMgrTgts({});
    }
    else if (a === 'sr') {
      const pp = parseInt(rp); const ss = parseInt(rs);
      if (!rn || !pp || !ss) return;
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        if (!db.adminLog) db.adminLog = [];
        db.adminLog = [{id: uid(), dt: td(), act: 'Add Reward', det: `New reward ${rn} added in ${rc} category`}, ...db.adminLog];
        db.rw = [...db.rw, {
          id: 'B' + uid(), nm: rn, ct: rc, pt: pp, sk: ss, ic: '🎁', 
          bg: 'linear-gradient(135deg,#2a2a4a,#1a1a3a)', ds: 'Gift card', dm: [pp * 2], tg: null, rx: rx ? rx : null
        }];
        return db;
      });
      setMo(''); showToast('Reward added!'); setRn(''); setRp(''); setRs(''); setRx('');
    }
    else if (a === 'do-excel') {
      const names = ['Excel User 1', 'Excel User 2'];
      const addMgrs: any[] = [];
      names.forEach((nm, i) => {
        const tgts: any = {};
        state.db.models.forEach((m: any) => { tgts[m.id] = { tgt: Math.floor(Math.random() * 30) + 20, ach: 0 }; });
        addMgrs.push({
          id: 'M' + uid(), nm, ph: `+91 ${90000 + i * 111}00000`, store: `Store-${uid().slice(0, 3)}`,
          pts: 0, st: 'active', av: nm.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          area: AREAS[i % AREAS.length], targets: tgts, imeis: [], totalImei: 0, pendingImei: 0, 
          approvedImei: 0, streak: 0, avClr: '#e74c3c'
        });
      });
      updateDb((prev: any) => ({ ...prev, mgrs: [...prev.mgrs, ...addMgrs] }));
      setMo(''); showToast('2 managers created!');
    }
    else if (a === 'export-report') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Date,Type,Amount,Details\n"
        + state.db.tx.map((t: any) => `${t.dt || ''},${t.tp || ''},${t.pt || 0},"${(t.rs || '').replace(/"/g, '""')}"`).join("\n") 
        + "\n\n"
        + "Date,Reward,Amount,Status,Expiry\n"
        + (state.db.rd || []).map((r: any) => `${r.dt || ''},"${(r.rnm || '').replace(/"/g, '""')}",${r.pt || 0},${r.sts || ''},${r.rx || ''}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "admin_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Export successful!');
    }
    else if (a === 'export-data-mgrs') {
      const db = state.db;
      let csvContent = "data:text/csv;charset=utf-8,Manager Name,Manager ID,Store,Area,Total Target,Total Achieved,Target %,Total Points\n";
      db.mgrs.forEach((m: any) => {
        const tA = Object.values(m.targets || {} as Record<string, any>).reduce((s: any, t: any) => s + (t.ach || 0), 0) as number;
        const tT = Object.values(m.targets || {} as Record<string, any>).reduce((s: any, t: any) => s + (t.tgt || 0), 0) as number;
        const pct = tT ? Math.round((tA / tT) * 100) : 0;
        csvContent += `"${m.nm}","${m.id}","${m.store}","${m.area}",${tT},${tA},${pct}%,${m.pts}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "manager_report.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
    else if (a === 'export-data-mdls') {
      const db = state.db;
      let csvContent = "data:text/csv;charset=utf-8,Model Name,Model Series,Target,Achieved,Achieved %\n";
      db.models.forEach((md: any) => {
        let tT = 0; let tA = 0;
        db.mgrs.forEach((mg: any) => {
           tT += (mg.targets?.[md.id]?.tgt || 0);
           tA += (mg.targets?.[md.id]?.ach || 0);
        });
        const pct = tT ? Math.round((tA / tT) * 100) : 0;
        csvContent += `"${md.nm}","${md.sr}",${tT},${tA},${pct}%\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "model_report.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
    else if (a === 'export-data-sr') {
      const db = state.db;
      let csvContent = "data:text/csv;charset=utf-8,Series Name,Target,Achieved,Achieved %\n";
      const srStats: any = {};
      db.models.forEach((md: any) => {
         if (!srStats[md.sr]) { srStats[md.sr] = { sr: md.sr, tT: 0, tA: 0 }; }
         db.mgrs.forEach((mg: any) => {
            srStats[md.sr].tT += (mg.targets?.[md.id]?.tgt || 0);
            srStats[md.sr].tA += (mg.targets?.[md.id]?.ach || 0);
         });
      });
      Object.values(srStats).forEach((ms: any) => {
         const pct = ms.tT ? Math.round((ms.tA / ms.tT) * 100) : 0;
         csvContent += `"${ms.sr}",${ms.tT},${ms.tA},${pct}%\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "series_report.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
    else if (a === 'save-model') {
       if (!mdNm) return;
       const isEdit = md && md.id;
       updateDb((prev: any) => {
         const db = { ...prev };
         if (!db.adminLog) db.adminLog = [];
         db.adminLog = [{id: uid(), dt: td(), act: isEdit ? 'Edit Model' : 'Add Model', det: `${mdNm} Model ${isEdit ? 'updated' : 'added to system'}`}, ...db.adminLog];
         if (isEdit) {
           db.models = db.models.map((m: any) => m.id === md.id ? { ...m, nm: mdNm, ic: mdIc || '📱' } : m);
         } else {
           const id = mdNm.replace(/\s+/g, '').slice(0, 4).toUpperCase() + uid().slice(0, 2);
           db.models = [...db.models, { id, nm: mdNm, ic: mdIc || '📱', cl: 'var(--color-brand-lb)', bg: 'rgba(159,168,218,.1)' }];
           db.mgrs = db.mgrs.map((m: any) => { 
             if (!m.targets) m.targets = {};
             m.targets[id] = { tgt: 0, ach: 0 }; 
             return m; 
           });
         }
         return db;
       });
       setMo(''); showToast(isEdit ? `${mdNm} updated!` : `${mdNm} added!`); setMdNm(''); setMdIc('📱'); setMd({});
    }
    else if (a === 'aim') {
      const im = state.db.pendingImeis.find((i: any) => i.id === data);
      if (!im) return;
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        const nim = db.pendingImeis.find((i: any) => i.id === data);
        nim.sts = 'approved';
        const mg = db.mgrs.find((m: any) => m.id === im.mid);
        if (mg) {
          mg.approvedImei++;
          mg.pendingImei = Math.max(0, mg.pendingImei - 1);
          if (!mg.targets) mg.targets = {};
          
          let tgtMetBefore = false;
          let tgtMetAfter = false;
          if (mg.targets[im.model]) {
             tgtMetBefore = mg.targets[im.model].ach >= mg.targets[im.model].tgt;
             mg.targets[im.model].ach++;
             tgtMetAfter = mg.targets[im.model].ach >= mg.targets[im.model].tgt;
          }
          
          const pol = db.policy || { basePtsPerImei: 150, modelPts: {}, tgtBonusPts: 1000 };
          const basePts = pol.basePtsPerImei || 0;
          const modelPts = pol.modelPts[im.model] ? Number(pol.modelPts[im.model]) : 0;
          const totalEarnedPts = basePts + modelPts;

          mg.pts += totalEarnedPts;
          db.tx = [{ id: 'T' + uid(), mid: mg.id, tp: 'credit', pt: totalEarnedPts, rs: `IMEI approved: ${db.models.find((m: any) => m.id === im.model)?.nm || ''}`, dt: td(), by: 'Admin' }, ...db.tx];
          db.nf = [{ id: 'N' + uid(), mid: mg.id, mg: `✅ IMEI approved! +${totalEarnedPts} pts`, dt: td(), rd: false }, ...db.nf];
          
          if (!tgtMetBefore && tgtMetAfter) {
            const bon = pol.tgtBonusPts || 0;
            mg.pts += bon;
            db.tx = [{ id: 'TB' + uid(), mid: mg.id, tp: 'credit', pt: bon, rs: `Target Achieved: ${db.models.find((m: any) => m.id === im.model)?.nm || ''}`, dt: td(), by: 'System' }, ...db.tx];
            db.nf = [{ id: 'N' + uid(), mid: mg.id, mg: `🎯 Target Achieved! +${bon} pts Bonus!`, dt: td(), rd: false }, ...db.nf];
          }
        }
        return db;
      });
      showToast('Approved!');
    }
    else if (a === 'rim') {
      const im = state.db.pendingImeis.find((i: any) => i.id === data);
      if (!im) return;
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        const nim = db.pendingImeis.find((i: any) => i.id === data);
        nim.sts = 'rejected';
        const mg = db.mgrs.find((m: any) => m.id === im.mid);
        if (mg) mg.pendingImei = Math.max(0, mg.pendingImei - 1);
        return db;
      });
      showToast('Rejected');
    }
    else if (a === 'bulk-aim') {
      if (selIm.length === 0) return;
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        selIm.forEach((dataId: string) => {
          const im = db.pendingImeis.find((i: any) => i.id === dataId);
          if (!im || im.sts !== 'pending') return;
          im.sts = 'approved';
          const mg = db.mgrs.find((m: any) => m.id === im.mid);
          if (mg) {
            mg.approvedImei++;
            mg.pendingImei = Math.max(0, mg.pendingImei - 1);
            if (!mg.targets) mg.targets = {};
            
            let tgtMetBefore = false;
            let tgtMetAfter = false;
            if (mg.targets[im.model]) {
               tgtMetBefore = mg.targets[im.model].ach >= mg.targets[im.model].tgt;
               mg.targets[im.model].ach++;
               tgtMetAfter = mg.targets[im.model].ach >= mg.targets[im.model].tgt;
            }
            
            const pol = db.policy || { basePtsPerImei: 150, modelPts: {}, tgtBonusPts: 1000 };
            const basePts = pol.basePtsPerImei || 0;
            const modelPts = pol.modelPts[im.model] ? Number(pol.modelPts[im.model]) : 0;
            const totalEarnedPts = basePts + modelPts;

            mg.pts += totalEarnedPts;
            db.tx = [{ id: 'T' + uid(), mid: mg.id, tp: 'credit', pt: totalEarnedPts, rs: `IMEI approved: ${db.models.find((m: any) => m.id === im.model)?.nm || ''}`, dt: td(), by: 'Admin' }, ...db.tx];
            db.nf = [{ id: 'N' + uid(), mid: mg.id, mg: `✅ IMEI approved! +${totalEarnedPts} pts`, dt: td(), rd: false }, ...db.nf];
            
            if (!tgtMetBefore && tgtMetAfter) {
              const bon = pol.tgtBonusPts || 0;
              mg.pts += bon;
              db.tx = [{ id: 'TB' + uid(), mid: mg.id, tp: 'credit', pt: bon, rs: `Target Achieved: ${db.models.find((m: any) => m.id === im.model)?.nm || ''}`, dt: td(), by: 'System' }, ...db.tx];
              db.nf = [{ id: 'N' + uid(), mid: mg.id, mg: `🎯 Target Achieved! +${bon} pts Bonus!`, dt: td(), rd: false }, ...db.nf];
            }
          }
        });
        return db;
      });
      showToast(`${selIm.length} Approved!`);
      setSelIm([]);
    }
    else if (a === 'bulk-rim') {
      if (selIm.length === 0) return;
      updateDb((prev: any) => {
        const db = JSON.parse(JSON.stringify(prev));
        selIm.forEach((dataId: string) => {
          const im = db.pendingImeis.find((i: any) => i.id === dataId);
          if (!im || im.sts !== 'pending') return;
          im.sts = 'rejected';
          const mg = db.mgrs.find((m: any) => m.id === im.mid);
          if (mg) mg.pendingImei = Math.max(0, mg.pendingImei - 1);
        });
        return db;
      });
      showToast(`${selIm.length} Rejected!`);
      setSelIm([]);
    }
  };

  const renderDash = () => {
    const ptsByDate: any = {};
    state.db.tx.forEach((t: any) => {
      if (!t.dt) return;
      if (!ptsByDate[t.dt]) ptsByDate[t.dt] = { date: t.dt, credit: 0, debit: 0 };
      if (t.tp === 'credit') ptsByDate[t.dt].credit += t.pt;
      else ptsByDate[t.dt].debit += t.pt;
    });
    const trendData = Object.values(ptsByDate).reverse();

    const redemptionsByCategory: any = {};
    (state.db.rd || []).forEach((r: any) => {
       const reward = state.db.rw.find((rw: any) => rw.id === r.rid);
       const category = reward?.ct || 'Other';
       if (!redemptionsByCategory[category]) redemptionsByCategory[category] = 0;
       redemptionsByCategory[category] += 1;
    });
    const pieData = Object.keys(redemptionsByCategory).map(k => ({ name: k, value: redemptionsByCategory[k] }));
    const COLORS = ['#2ee89d', '#ff5a65', 'var(--color-brand-yl)', 'var(--color-brand-lb)', 'var(--color-brand-or)'];

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-extrabold text-tx">Dashboard</h1>
          <button className="bg-transparent border-0 text-xl cursor-pointer" onClick={() => setTheme(state.theme === 'dark' ? 'light' : 'dark')}>{state.theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4.5">
          {[
            {l:'Stores',v:state.db.mgrs.length,c:'var(--color-brand-lb)'},
            {l:'Points',v:tPts.toLocaleString(),c:'var(--color-brand-or)'},
            {l:'IMEI OK',v:tIm,c:'var(--color-brand-yl)'},
            {l:'Pending',v:pndIm.length,c:'#ff5a65'}
          ].map((s, i) => (
            <div key={i} className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh">
               <p className="text-[9px] text-t3 mb-1 uppercase tracking-[0.06em] font-bold">{s.l}</p>
               <p className="text-2xl font-extrabold font-mono" style={{ color: s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4.5">
          <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh h-[320px] flex flex-col col-span-1 lg:col-span-2">
             <h3 className="text-sm font-bold mb-3 text-tx shrink-0">📈 Performance Trends (Points)</h3>
             <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="date" stroke="#888" fontSize={10} />
                   <YAxis stroke="#888" fontSize={10} />
                   <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', borderColor: 'var(--color-bd)', borderRadius: '8px' }} />
                   <Legend wrapperStyle={{ fontSize: '11px' }} />
                   <Line type="monotone" dataKey="credit" stroke="#2ee89d" strokeWidth={3} name="Points Credited" />
                   <Line type="monotone" dataKey="debit" stroke="#ff5a65" strokeWidth={3} name="Points Redeemed" />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh h-[320px] flex flex-col">
             <h3 className="text-sm font-bold mb-3 text-tx shrink-0">🎁 Reward Redemptions by Category</h3>
             <div className="flex-1 w-full min-h-0 flex items-center justify-center">
               {pieData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', borderColor: 'var(--color-bd)', borderRadius: '8px' }} />
                     <Legend wrapperStyle={{ fontSize: '11px' }} />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <p className="text-xs text-t3">No redemption data available.</p>
               )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh">
             <h3 className="text-sm font-bold mb-3 text-tx">🏆 Top Stores</h3>
           {[...state.db.mgrs].sort((a: any, b: any) => b.pts - a.pts).slice(0,5).map((m: any, i: number) => (
             <div key={m.id} className={`flex items-center gap-[7px] py-[5px] ${i < 4 ? 'border-b border-bd' : ''}`}>
               <span className="w-[18px] text-[11px] font-bold font-mono" style={{ color: i < 3 ? 'var(--color-brand-or)' : 'var(--color-t3)' }}>#{i+1}</span>
               <div className="w-6 h-6 border-[1.5px] border-bd2 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: m.avClr }}>{m.av}</div>
               <div className="flex-1"><p className="text-[10px] font-semibold text-tx">{m.nm}</p></div>
               <span className="text-[11px] font-bold font-mono text-or">{m.pts.toLocaleString()}</span>
             </div>
           ))}
        </div>
        <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh">
           <h3 className="text-sm font-bold mb-3 text-tx">📊 Model Performance</h3>
           {state.db.models.map((mod: any) => {
             const tA = state.db.mgrs.reduce((s: any, m: any) => s + ((m.targets || {} as Record<string, any>)[mod.id]?.ach || 0), 0) as number;
             const tT = state.db.mgrs.reduce((s: any, m: any) => s + ((m.targets || {} as Record<string, any>)[mod.id]?.tgt || 0), 0) as number;
             const p = tT ? Math.round((tA / tT) * 100) : 0;
             return (
               <div key={mod.id} className="mb-2">
                 <div className="flex justify-between text-[10px] mb-1">
                   <span className="text-tx">{mod.ic} {mod.nm}</span><span className="font-bold font-mono" style={{ color: mod.cl }}>{p}%</span>
                 </div>
                 <div className="h-[5px] rounded-[3px] bg-[rgba(255,255,255,0.05)] overflow-hidden">
                   <div className="h-full rounded-[3px] transition-all duration-500 ease-out" style={{ width: `${Math.min(p, 100)}%`, background: mod.cl }}></div>
                 </div>
               </div>
             )
           })}
        </div>
      </div>
      <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh mb-3">
         <h3 className="text-sm font-bold mb-3 text-tx">🗺️ Area Performance</h3>
         <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
            {AREAS.map(a => {
              const ms = state.db.mgrs.filter((m: any) => m.area === a);
              return (
                <div key={a} className="p-2.5 bg-[rgba(255,255,255,0.03)] border border-bd rounded-[10px]">
                  <p className="text-[11px] font-bold text-tx">{a}</p>
                  <p className="text-[9px] text-t3">{ms.length} stores · {ms.reduce((s: any, m: any) => s + m.approvedImei, 0)} IMEI</p>
                </div>
              )
            })}
         </div>
      </div>
    </>
  );
};

  const renderMgrs = () => {
    let sortedMgrs = state.db.mgrs.filter((m: any) => {
      const searchItem = `${m.nm} ${m.ph} ${m.store} ${m.area}`.toLowerCase();
      return searchItem.includes(sr.toLowerCase());
    });
    // Add simple sort by points
    sortedMgrs = sortedMgrs.sort((a: any, b: any) => b.pts - a.pts);

    return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-[7px]">
        <h1 className="text-xl font-extrabold text-tx">Managers</h1>
        <div className="flex gap-[6px]">
          <button className="bg-gradient-to-br from-[#FFD700] to-[#CD7F32] text-[#111] border-0 px-3 py-[7px] text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95" onClick={() => handleAction('am')}><Icons.pls className="w-3 h-3" /> Add</button>
          <button className="bg-transparent border-[1.5px] border-bd2 text-t2 px-3 py-[7px] text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95" onClick={() => handleAction('excel')}><Icons.up className="w-3 h-3" /> Excel</button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1 flex items-center">
          <Icons.sch className="w-3.5 h-3.5 absolute left-3 text-t3" />
          <input className="w-full bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none pl-8 py-2.5" placeholder="Search by name, phone, area, store..." value={sr} onChange={e => setSr(e.target.value)} />
        </div>
      </div>
      <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh overflow-x-auto text-tx">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Manager</th>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Store</th>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Area</th>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Points</th>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">IMEI</th>
              <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMgrs.map((m: any) => (
              <tr key={m.id} className="cursor-pointer hover:bg-sf" onClick={() => handleAction('mgr-det', m.id)}>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">
                  <div className="flex items-center gap-1.5">
                     <div className="w-[22px] h-[22px] border border-bd2 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ background: m.avClr }}>{m.av}</div>
                     <div><p className="font-semibold">{m.nm}</p><p className="text-[9px] text-t3">{m.ph}</p></div>
                  </div>
                </td>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[10px]">{m.store}</td>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">
                  <span className="px-2 py-[2px] rounded-md text-[8px] font-bold uppercase inline-block bg-[rgba(159,168,218,.1)] text-lb">{m.area}</span>
                </td>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px] font-bold font-mono text-or">{m.pts.toLocaleString()}</td>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[10px] font-mono">
                  <span className="text-[#2ee89d]">{m.approvedImei}</span>/<span className="text-or">{m.pendingImei}</span>
                </td>
                <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button className="px-2 py-1 rounded-md border-0 text-[10px] font-semibold cursor-pointer bg-[rgba(212,140,85,0.1)] text-or" onClick={() => handleAction('ap', m.id)}>+ Pts</button>
                    <button className="px-2 py-1 rounded-md border-0 text-[10px] font-semibold cursor-pointer bg-[rgba(46,232,157,0.1)] text-[#2ee89d]" onClick={() => handleAction('at', m.id)}>🎯 Tgts</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
  };

  const renderImeis = () => {
    const filteredImeis = state.db.pendingImeis.filter((im: any) => {
      const mg = state.db.mgrs.find((m: any) => m.id === im.mid);
      const mod = state.db.models.find((m: any) => m.id === im.model);
      const searchItem = `${im.imei} ${mg?.nm} ${mod?.nm}`.toLowerCase();
      return searchItem.includes(sr.toLowerCase());
    });

    const pendingFiltered = filteredImeis.filter((im: any) => im.sts === 'pending');
    const isAllSel = pendingFiltered.length > 0 && selIm.length === pendingFiltered.length;
    const toggleAll = () => {
       if (isAllSel) setSelIm([]);
       else setSelIm(pendingFiltered.map((i: any) => i.id));
    };
    
    return (
      <>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-[7px]">
          <h1 className="text-xl font-extrabold text-tx">IMEI Approvals <span className="text-xs text-or font-normal">({pndIm.length} pending)</span></h1>
          {selIm.length > 0 && (
            <div className="flex gap-2">
              <button className="bg-[rgba(46,232,157,0.15)] text-[#2ee89d] border-0 px-3 py-[7px] text-[11px] font-bold rounded-xl cursor-pointer active:scale-95" onClick={() => handleAction('bulk-aim')}>Approve {selIm.length}</button>
              <button className="bg-[rgba(255,90,101,0.15)] text-[#ff5a65] border-0 px-3 py-[7px] text-[11px] font-bold rounded-xl cursor-pointer active:scale-95" onClick={() => handleAction('bulk-rim')}>Reject {selIm.length}</button>
            </div>
          )}
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 flex items-center">
            <Icons.sch className="w-3.5 h-3.5 absolute left-3 text-t3" />
            <input className="w-full bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] outline-none pl-8 py-2.5" placeholder="Search by IMEI, Manager, or Model..." value={sr} onChange={e => setSr(e.target.value)} />
          </div>
          <button className="bg-[rgba(52,152,219,0.1)] border-[1.5px] border-[#3498db] text-[#3498db] px-3 py-2 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap" onClick={() => setMo('scan-imei')}><Icons.cam className="w-4 h-4" /> Scan IMEI</button>
        </div>
        <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh overflow-x-auto text-tx">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-[8px_10px] border-b border-bd w-[30px]"><input type="checkbox" checked={isAllSel} onChange={toggleAll} className="cursor-pointer" /></th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Manager</th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">IMEI</th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Model</th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Date</th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Status</th>
                <th className="text-left p-[8px_10px] text-[8px] font-bold text-t3 uppercase tracking-[0.08em] border-b border-bd whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImeis.map((im: any) => {
                const mg = state.db.mgrs.find((m: any) => m.id === im.mid);
                const mod = state.db.models.find((m: any) => m.id === im.model);
                const isSelected = selIm.includes(im.id);
                return (
                  <tr key={im.id} className={isSelected ? 'bg-[rgba(255,255,255,0.02)]' : ''}>
                    <td className="p-[9px_10px] border-b border-bd">
                      {im.sts === 'pending' && <input type="checkbox" checked={isSelected} onChange={() => {
                        if (isSelected) setSelIm(selIm.filter(id => id !== im.id));
                        else setSelIm([...selIm, im.id]);
                      }} className="cursor-pointer" />}
                    </td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px] font-medium">{mg?.nm || '?'}</td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[9px] font-mono">{im.imei}</td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">{mod?.nm || im.model}</td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[9px] text-t3">{im.dt}</td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">
                    <span className="px-2 py-[2px] rounded-md text-[8px] font-bold uppercase inline-block" 
                          style={{ background: im.sts === 'approved' ? 'rgba(46,232,157,0.1)' : im.sts === 'pending' ? 'rgba(212,140,85,0.1)' : 'rgba(255,90,101,0.1)', color: im.sts === 'approved' ? '#2ee89d' : im.sts === 'pending' ? 'var(--color-brand-or)' : '#ff5a65' }}>
                      {im.sts}
                    </span>
                  </td>
                  <td className="p-[9px_10px] border-b border-bd whitespace-nowrap text-[11px]">
                    {im.sts === 'pending' && (
                      <div className="flex gap-1">
                        <button className="px-2.5 py-1 rounded-md border-0 text-[10px] font-semibold cursor-pointer bg-[rgba(46,232,157,0.1)] text-[#2ee89d]" onClick={() => handleAction('aim', im.id)}>✓</button>
                        <button className="px-2.5 py-1 rounded-md border-0 text-[10px] font-semibold cursor-pointer bg-[rgba(255,90,101,.1)] text-[#ff5a65]" onClick={() => handleAction('rim', im.id)}>✗</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  );
  };

  const renderMdls = () => {
    return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-[7px]">
        <h1 className="text-xl font-extrabold text-tx">Models overview</h1>
        <div className="flex gap-2">
           <button className="bg-sf text-tx px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-colors hover:bg-bd border border-bd border-solid" onClick={() => setMo('excel-mods')}>
             <Icons.up className="w-3.5 h-3.5" /> Bulk Upload
           </button>
           <button className="bg-gradient-to-br from-lb to-[#3a2080] text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 border-0" onClick={() => setMo('amod')}>
             <Icons.pls className="w-3.5 h-3.5" /> Add Model
           </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
         {state.db.models.map((m: any) => {
           let totalTgt = 0;
           let totalAch = 0;
           state.db.mgrs.forEach((mgr: any) => {
             if (mgr.targets && mgr.targets[m.id]) {
                totalTgt += mgr.targets[m.id].tgt || 0;
                totalAch += mgr.targets[m.id].ach || 0;
             }
           });
           const polPts = state.db.policy?.modelPts?.[m.id] || 0;
           
           return (
             <div key={m.id} className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh flex flex-col relative overflow-hidden group">
                <button className="absolute top-2 right-2 text-t3 hover:text-tx bg-sf border border-bd p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleAction('emod', m)}>
                  <Icons.set className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] shadow-sm shrink-0" style={{ background: m.bg, color: m.cl }}>{m.ic}</div>
                  <div>
                    <p className="text-sm font-bold text-tx mb-0.5">{m.nm}</p>
                    <span className="text-[10px] text-t3 bg-sf px-2 py-0.5 rounded-md font-mono">Bonus: +{polPts} pts</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-sf border border-bd rounded-lg p-2 text-center">
                     <p className="text-[10px] text-t3 mb-0.5 uppercase tracking-wider font-semibold">Overall Achvd</p>
                     <p className="text-sm font-bold font-mono text-[#2ee89d]">{totalAch}</p>
                  </div>
                  <div className="bg-sf border border-bd rounded-lg p-2 text-center">
                     <p className="text-[10px] text-t3 mb-0.5 uppercase tracking-wider font-semibold">Total Target</p>
                     <p className="text-sm font-bold font-mono text-or">{totalTgt}</p>
                  </div>
                </div>
             </div>
           );
         })}
      </div>
    </>
    );
  };

  const renderRws = () => {
    let totRws = state.db.rw.length;
    let totOos = state.db.rw.filter((r: any) => r.sk <= 0).length;
    let totRedeems = state.db.rd?.length || 0;
    
    return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-[7px]">
        <h1 className="text-xl font-extrabold text-tx">Rewards</h1>
        <button className="bg-gradient-to-br from-[#FFD700] to-[#CD7F32] text-[#111] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 border-0" onClick={() => setMo('arw')}>
          <Icons.pls className="w-3.5 h-3.5" /> New Reward
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
         <div className="bg-bg-sec border border-bd rounded-xl p-3 shadow-sh flex items-center justify-between">
            <div>
               <p className="text-[10px] text-t3 uppercase tracking-wider mb-0.5">Total Rewards</p>
               <p className="text-lg font-bold font-mono text-tx">{totRws}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[rgba(52,152,219,0.1)] text-[#3498db] flex items-center justify-center"><Icons.tgt className="w-4 h-4" /></div>
         </div>
         <div className="bg-bg-sec border border-bd rounded-xl p-3 shadow-sh flex items-center justify-between">
            <div>
               <p className="text-[10px] text-t3 uppercase tracking-wider mb-0.5">Out of Stock</p>
               <p className="text-lg font-bold font-mono text-or">{totOos}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[rgba(212,140,85,0.1)] text-or flex items-center justify-center"><Icons.x className="w-4 h-4" /></div>
         </div>
         <div className="bg-bg-sec border border-bd rounded-xl p-3 shadow-sh flex items-center justify-between">
            <div>
               <p className="text-[10px] text-t3 uppercase tracking-wider mb-0.5">Total Redeemed</p>
               <p className="text-lg font-bold font-mono text-[#2ee89d]">{totRedeems}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[rgba(46,232,157,0.1)] text-[#2ee89d] flex items-center justify-center"><Icons.chk className="w-4 h-4" /></div>
         </div>
      </div>

      <div className="flex gap-2 mb-4">
         <button className={`px-4 py-2 text-xs font-bold rounded-[11px] cursor-pointer transition-colors border-0 ${rwTb === 'inv' ? 'bg-[#2ee89d] text-[#111]' : 'bg-sf text-t2 hover:bg-bd2'}`} onClick={() => setRwTb('inv')}>Inventory</button>
         <button className={`px-4 py-2 text-xs font-bold rounded-[11px] cursor-pointer transition-colors border-0 flex items-center gap-1.5 ${rwTb === 'red' ? 'bg-[#2ee89d] text-[#111]' : 'bg-sf text-t2 hover:bg-bd2'}`} onClick={() => setRwTb('red')}>Redemptions {totRedeems > 0 && <span className={`px-1.5 py-0.5 rounded-[5px] text-[8px] ${rwTb === 'red' ? 'bg-[#111] text-[#2ee89d]' : 'bg-[rgba(46,232,157,0.15)] text-[#2ee89d]'}`}>{totRedeems}</span>}</button>
      </div>

      {rwTb === 'inv' && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
           {state.db.rw.map((r: any) => {
             let r_redeemed = state.db.rd?.filter((x: any) => x.rid === r.id)?.length || 0;
             return (
             <div key={r.id} className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh flex flex-col relative overflow-hidden group">
               <div className="flex items-center gap-3 mb-3 relative z-10">
                 <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px]" style={{background: r.bg}}>{r.ic}</div>
                 <div className="flex-1">
                    <p className="text-[14px] font-bold leading-tight text-tx">{r.nm}</p>
                    <p className="text-[10px] text-t3 uppercase font-semibold tracking-wider">{r.ct} · <span className="text-lb">Stock: {r.sk}</span></p>
                    {r.rx && <p className="text-[9px] text-[#ff5a65] mt-[3px] bg-[#ff5a65]/10 w-fit px-1.5 py-0.5 rounded uppercase font-bold">Expires: {r.rx}</p>}
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2 relative z-10 mt-auto">
                 <div className="bg-sf border border-bd rounded-lg p-2 text-center">
                    <p className="text-[10px] text-t3 uppercase tracking-wider mb-0.5">Points Req</p>
                    <p className="text-sm font-bold font-mono text-or">{r.pt?.toLocaleString()}</p>
                 </div>
                 <div className="bg-sf border border-bd rounded-lg p-2 text-center">
                    <p className="text-[10px] text-t3 uppercase tracking-wider mb-0.5">Redeemed</p>
                    <p className="text-sm font-bold font-mono text-[#2ee89d]">{r_redeemed}</p>
                 </div>
               </div>
             </div>
             );
           })}
        </div>
        
        <div className="bg-bg-sec border border-bd rounded-[14px] p-5 shadow-sh flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold mb-2 text-tx flex items-center gap-2"><Icons.cn className="w-5 h-5 text-indigo-400" /> API / Enterprise Integrations (Gyftr, Xoxoday)</h3>
            <p className="text-xs text-t3 leading-relaxed mb-3">
              Want to add company-wise rewards (like Amazon, Flipkart vouchers) automatically? You can integrate third-party voucher APIs here.
            </p>
            <ul className="text-xs text-t3 space-y-2 list-disc pl-4">
              <li><strong>Manual Distribution:</strong> Add generic rewards above (e.g. &quot;Gift Card&quot;). When managers redeem, you manually contact the reward vendor and send the employee the codes.</li>
              <li><strong>Automated API Setup:</strong> Connect Gyftr/Xoxoday APIs. When managers redeem points, the API is triggered on the backend to dynamically fetch a digital voucher and deliver it via SMS or email instantly.</li>
            </ul>
          </div>
          <div className="shrink-0 flex items-center justify-center">
             <button className="bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] text-indigo-400 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer hover:bg-[rgba(99,102,241,0.2)] transition-colors" onClick={() => showToast('API integration required. Please contact developer.', 'err')}>
               Setup API Hook
             </button>
          </div>
        </div>
      </>
      )}

      {rwTb === 'red' && (
         <div className="flex flex-col gap-2">
            {(state.db.rd || []).map((r: any) => {
               const mgr = state.db.mgrs.find((m: any) => m.id === r.mid);
               return (
                 <div key={r.id} className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-tx mb-1">{r.rnm} <span className="text-[10px] text-t3 font-mono ml-2">#{r.id}</span></p>
                      <p className="text-[11px] text-t2">Manager: <span className="text-tx font-medium">{mgr?.nm || r.mid}</span> · {mgr?.ph || ''}</p>
                      <p className="text-[11px] text-t2">Date: <span className="text-tx font-medium">{r.dt}</span></p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                       <span className={`px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase ${r.sts === 'completed' ? 'bg-[#2ee89d]/10 text-[#2ee89d]' : r.sts === 'expired' ? 'bg-[#ff5a65]/10 text-[#ff5a65]' : 'bg-or/10 text-or'}`}>{r.sts}</span>
                       {r.sts === 'pending' && (
                          <div className="flex gap-1.5">
                             <button className="px-2 py-1 bg-[#2ee89d]/10 text-[#2ee89d] border border-[#2ee89d]/20 rounded text-[10px] font-bold cursor-pointer hover:bg-[#2ee89d]/20 transition-colors" onClick={() => updateDb((prev:any) => ({...prev, rd: prev.rd.map((x:any) => x.id===r.id ? {...x, sts:'completed'} : x)}))}>Mark Completed</button>
                             <button className="px-2 py-1 bg-[#ff5a65]/10 text-[#ff5a65] border border-[#ff5a65]/20 rounded text-[10px] font-bold cursor-pointer hover:bg-[#ff5a65]/20 transition-colors" onClick={() => updateDb((prev:any) => ({...prev, rd: prev.rd.map((x:any) => x.id===r.id ? {...x, sts:'expired'} : x)}))}>Mark Expired</button>
                          </div>
                       )}
                    </div>
                 </div>
               )
            })}
            {!(state.db.rd?.length > 0) && (
               <p className="text-t3 text-[12px] p-4 text-center">No redemptions found.</p>
            )}
         </div>
      )}
    </>
    );
  };

  const renderPol = () => {
    const pol = state.db.policy || { basePtsPerImei: 150, tgtBonusPts: 1000, modelPts: {} };
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-extrabold text-tx">Reward Policy</h1>
          <button className="bg-gradient-to-br from-[#FFD700] to-[#CD7F32] text-[#111] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95" onClick={() => handleAction('start-pol')}>
            <Icons.set className="w-3.5 h-3.5" /> Edit Policy
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-bg-sec border border-bd rounded-[14px] p-5 shadow-sh">
             <h3 className="text-sm font-bold mb-4 text-tx flex items-center gap-2"><Icons.tgt className="w-4 h-4 text-or" /> Base Values</h3>
             
             <div className="flex justify-between items-center p-3 border border-bd rounded-xl bg-sf mb-3">
               <div>
                  <p className="text-xs font-bold text-tx">Per IMEI Approval</p>
                  <p className="text-[10px] text-t3">Base points awarded per approved IMEI</p>
               </div>
               <div className="text-lg font-mono font-bold text-[#2ee89d] bg-[rgba(46,232,157,0.1)] px-3 py-1 rounded-lg">{pol.basePtsPerImei}</div>
             </div>
             
             <div className="flex justify-between items-center p-3 border border-bd rounded-xl bg-sf">
               <div>
                  <p className="text-xs font-bold text-tx">Target Achievement Bonus</p>
                  <p className="text-[10px] text-t3">Points awarded when sales target is met</p>
               </div>
               <div className="text-lg font-mono font-bold text-or bg-[rgba(212,140,85,0.1)] px-3 py-1 rounded-lg">{pol.tgtBonusPts}</div>
             </div>
          </div>
          
          <div className="bg-bg-sec border border-bd rounded-[14px] p-5 shadow-sh">
             <h3 className="text-sm font-bold mb-4 text-tx flex items-center gap-2"><Icons.ph className="w-4 h-4 text-lb" /> Model Wise Extra Points</h3>
             <p className="text-[10px] text-t3 mb-3">Additional points rewarded on top of base points for specific models.</p>
             <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                {state.db.models.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 border border-bd rounded-lg bg-bg-prime">
                     <div className="flex items-center gap-2">
                       <span className="text-lg" style={{ color: m.cl }}>{m.ic}</span>
                       <span className="text-xs font-semibold">{m.nm}</span>
                     </div>
                     <div className="text-sm font-bold font-mono text-tx">
                        +{pol.modelPts?.[m.id] || 0}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </>
    );
  };

  const renderRpt = () => {
    const ptsByDate: any = {};
    state.db.tx.forEach((t: any) => {
      if (!t.dt) return;
      if (!ptsByDate[t.dt]) ptsByDate[t.dt] = { date: t.dt, credit: 0, debit: 0 };
      if (t.tp === 'credit') ptsByDate[t.dt].credit += t.pt;
      else ptsByDate[t.dt].debit += t.pt;
    });
    const trendData = Object.values(ptsByDate).reverse();

    const redemptionsByCategory: any = {};
    (state.db.rd || []).forEach((r: any) => {
       const reward = state.db.rw.find((rw: any) => rw.id === r.rid);
       const category = reward?.ct || 'Other';
       if (!redemptionsByCategory[category]) redemptionsByCategory[category] = 0;
       redemptionsByCategory[category] += 1;
    });
    const pieData = Object.keys(redemptionsByCategory).map(k => ({ name: k, value: redemptionsByCategory[k] }));
    const COLORS = ['#2ee89d', '#ff5a65', 'var(--color-brand-yl)', 'var(--color-brand-lb)', 'var(--color-brand-or)'];

    const storePerf = state.db.mgrs.map((m: any) => {
      const tA = Object.values(m.targets || {} as Record<string, any>).reduce((s: any, t: any) => s + (t.ach || 0), 0) as number;
      const tT = Object.values(m.targets || {} as Record<string, any>).reduce((s: any, t: any) => s + (t.tgt || 0), 0) as number;
      return { ...m, pct: tT ? Math.round((tA / tT) * 100) : 0, tA, tT };
    }).filter((m: any) => m.tT > 0).sort((a: any, b: any) => a.pct - b.pct);
    const lowPerf = storePerf.slice(0, 3);

    return (
      <>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-[7px]">
          <h1 className="text-xl font-extrabold text-tx">Analytics & Reports</h1>
          <button className="bg-transparent border-[1.5px] border-bd2 text-t2 px-3 py-[7px] text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95" onClick={() => handleAction('export-report')}><Icons.down className="w-3 h-3" /> Export Data</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh h-[320px] flex flex-col col-span-1 lg:col-span-2">
             <h3 className="text-sm font-bold mb-3 text-tx shrink-0">📈 Performance Trends (Points)</h3>
             <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="date" stroke="#888" fontSize={10} />
                   <YAxis stroke="#888" fontSize={10} />
                   <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', borderColor: 'var(--color-bd)', borderRadius: '8px' }} />
                   <Legend wrapperStyle={{ fontSize: '11px' }} />
                   <Line type="monotone" dataKey="credit" stroke="#2ee89d" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Points Credited" />
                   <Line type="monotone" dataKey="debit" stroke="#ff5a65" strokeWidth={2} dot={{ r: 3 }} name="Points Redeemed" />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh flex-1 flex flex-col">
               <h3 className="text-sm font-bold mb-3 text-tx shrink-0">📉 Low Performing Stores</h3>
               <div className="flex-1 overflow-y-auto pr-1">
                 {lowPerf.length > 0 ? lowPerf.map((m: any, i: number) => (
                   <div key={m.id} className="mb-2.5 p-2.5 bg-sf border border-bd rounded-xl flex items-center justify-between">
                     <div>
                       <p className="text-[11px] font-bold text-tx leading-tight">{m.nm}</p>
                       <p className="text-[9px] text-t3">{m.store} · {m.area}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[13px] font-bold font-mono text-[#ff5a65]">{m.pct}%</p>
                       <p className="text-[8px] text-t3 tracking-wider uppercase font-semibold">Targets</p>
                     </div>
                   </div>
                 )) : <p className="text-xs text-t3 mt-4 text-center">No data</p>}
               </div>
            </div>
            
            <div className="bg-bg-sec border border-bd rounded-[14px] p-4 shadow-sh h-[160px] flex flex-col">
               <h3 className="text-sm font-bold mb-3 text-tx shrink-0">🎁 Redemptions</h3>
               <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                 {pieData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#1a1a3a', borderColor: 'var(--color-bd)', borderRadius: '8px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <p className="text-xs text-t3">No redemption data available.</p>
                 )}
               </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-tx mt-8 mb-4 flex items-center justify-between">
           Target vs Achievement Detailed Data
           <button className="bg-sf border-[1.5px] border-bd2 text-t2 px-3 py-[7px] text-[11px] font-bold rounded-[8px] flex items-center gap-1.5 cursor-pointer active:scale-95 hover:text-tx hover:border-tx transition-colors" onClick={() => handleAction(`export-data-${rptTb}`)}><Icons.down className="w-3 h-3" /> Download CSV</button>
        </h3>
        
        <div className="flex gap-2 mb-4 bg-bg-sec p-1 rounded-[14px]">
           <button className={`flex-1 py-2 text-[13px] font-bold rounded-[11px] cursor-pointer transition-colors border-0 ${rptTb === 'mgrs' ? 'bg-[#2ee89d] text-[#111] shadow-sm' : 'bg-transparent text-t2 hover:bg-sf'}`} onClick={() => setRptTb('mgrs')}>Managers Wise</button>
           <button className={`flex-1 py-2 text-[13px] font-bold rounded-[11px] cursor-pointer transition-colors border-0 ${rptTb === 'mdls' ? 'bg-[#2ee89d] text-[#111] shadow-sm' : 'bg-transparent text-t2 hover:bg-sf'}`} onClick={() => setRptTb('mdls')}>Model Wise</button>
           <button className={`flex-1 py-2 text-[13px] font-bold rounded-[11px] cursor-pointer transition-colors border-0 ${rptTb === 'sr' ? 'bg-[#2ee89d] text-[#111] shadow-sm' : 'bg-transparent text-t2 hover:bg-sf'}`} onClick={() => setRptTb('sr')}>Series Wise</button>
        </div>

        <div className="bg-bg-sec border border-bd rounded-[14px] overflow-hidden shadow-sh">
           <div className="overflow-x-auto">
              {rptTb === 'mgrs' && (
                <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                  <thead className="bg-sf border-b border-bd text-[11px] text-t3 uppercase">
                     <tr>
                        <th className="p-3 font-semibold">Manager</th>
                        <th className="p-3 font-semibold">Store / Area</th>
                        <th className="p-3 font-semibold">Overall Target</th>
                        <th className="p-3 font-semibold">Overall Ach</th>
                        <th className="p-3 font-semibold">% Achieved</th>
                        <th className="p-3 font-semibold">Total Points</th>
                     </tr>
                  </thead>
                  <tbody className="text-[13px]">
                     {storePerf.map((m: any) => (
                        <tr key={m.id} className="border-b border-bd hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                           <td className="p-3 font-semibold text-tx">{m.nm} <span className="text-[10px] text-t3 font-mono ml-1">#{m.id}</span></td>
                           <td className="p-3 text-t2">{m.store} <span className="text-t3 text-[11px]">({m.area})</span></td>
                           <td className="p-3 font-mono">{m.tT}</td>
                           <td className="p-3 font-mono text-[#2ee89d] font-semibold">{m.tA}</td>
                           <td className="p-3 font-mono">
                             <span className={`px-2 py-0.5 rounded-[4px] text-[10px] bg-[rgba(255,255,255,0.05)] ${m.pct >= 100 ? 'text-[#2ee89d]' : m.pct >= 80 ? 'text-or' : 'text-[#ff5a65]'}`}>
                               {m.pct}%
                             </span>
                           </td>
                           <td className="p-3 font-mono text-or font-bold">{m.pts.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
                </table>
              )}
              {rptTb === 'mdls' && (() => {
                 const mStats = state.db.models.map((md: any) => {
                    let totalT = 0; let totalA = 0;
                    state.db.mgrs.forEach((mg: any) => {
                       totalT += (mg.targets?.[md.id]?.tgt || 0);
                       totalA += (mg.targets?.[md.id]?.ach || 0);
                    });
                    const pct = totalT ? Math.round((totalA/totalT)*100) : 0;
                    return {...md, totalT, totalA, pct};
                 });
                 return (
                  <table className="w-full text-left whitespace-nowrap min-w-[500px]">
                    <thead className="bg-sf border-b border-bd text-[11px] text-t3 uppercase">
                       <tr>
                          <th className="p-3 font-semibold">Model</th>
                          <th className="p-3 font-semibold">Series</th>
                          <th className="p-3 font-semibold">Total Target</th>
                          <th className="p-3 font-semibold">Total Ach</th>
                          <th className="p-3 font-semibold">% Achieved</th>
                       </tr>
                    </thead>
                    <tbody className="text-[13px]">
                       {mStats.map((ms: any) => (
                          <tr key={ms.id} className="border-b border-bd hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                             <td className="p-3 font-semibold text-tx flex items-center gap-2"><span className="text-xl" style={{color: ms.cl}}>{ms.ic}</span> {ms.nm}</td>
                             <td className="p-3 text-t2">{ms.sr}</td>
                             <td className="p-3 font-mono">{ms.totalT}</td>
                             <td className="p-3 font-mono text-[#2ee89d] font-semibold">{ms.totalA}</td>
                             <td className="p-3 font-mono">
                               <span className={`px-2 py-0.5 rounded-[4px] text-[10px] bg-[rgba(255,255,255,0.05)] ${ms.pct >= 100 ? 'text-[#2ee89d]' : ms.pct >= 80 ? 'text-or' : 'text-[#ff5a65]'}`}>
                                 {ms.pct}%
                               </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                 );
              })()}
              {rptTb === 'sr' && (() => {
                 const srStats: any = {};
                 state.db.models.forEach((md: any) => {
                    if (!srStats[md.sr]) { srStats[md.sr] = { sr: md.sr, totalT: 0, totalA: 0 }; }
                    state.db.mgrs.forEach((mg: any) => {
                       srStats[md.sr].totalT += (mg.targets?.[md.id]?.tgt || 0);
                       srStats[md.sr].totalA += (mg.targets?.[md.id]?.ach || 0);
                    });
                 });
                 return (
                  <table className="w-full text-left whitespace-nowrap min-w-[400px]">
                    <thead className="bg-sf border-b border-bd text-[11px] text-t3 uppercase">
                       <tr>
                          <th className="p-3 font-semibold">Series</th>
                          <th className="p-3 font-semibold">Total Target</th>
                          <th className="p-3 font-semibold">Total Ach</th>
                          <th className="p-3 font-semibold">% Achieved</th>
                       </tr>
                    </thead>
                    <tbody className="text-[13px]">
                       {Object.values(srStats).map((ms: any, idx: number) => {
                          const pct = ms.totalT ? Math.round((ms.totalA/ms.totalT)*100) : 0;
                          return (
                          <tr key={idx} className="border-b border-bd hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                             <td className="p-3 font-semibold text-tx">{ms.sr}</td>
                             <td className="p-3 font-mono">{ms.totalT}</td>
                             <td className="p-3 font-mono text-[#2ee89d] font-semibold">{ms.totalA}</td>
                             <td className="p-3 font-mono">
                               <span className={`px-2 py-0.5 rounded-[4px] text-[10px] bg-[rgba(255,255,255,0.05)] ${pct >= 100 ? 'text-[#2ee89d]' : pct >= 80 ? 'text-or' : 'text-[#ff5a65]'}`}>
                                 {pct}%
                               </span>
                             </td>
                          </tr>
                          )
                       })}
                    </tbody>
                  </table>
                 );
              })()}
           </div>
        </div>
      </>
    );
  };

  const renderLog = () => {
    const logs = (state.db as any).adminLog || [];
    return (
      <div className="animate-[fi_0.2s]">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-[7px]">
          <h1 className="text-xl font-extrabold text-tx">Audit Log</h1>
          <p className="text-xs text-t3">History of admin updates</p>
        </div>
        <div className="bg-bg-sec border border-bd rounded-[14px] shadow-sh overflow-hidden">
          {logs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sf border-b border-bd">
                  <th className="p-3 text-[10px] font-bold text-t3 uppercase tracking-wider w-[120px]">Date/Time</th>
                  <th className="p-3 text-[10px] font-bold text-t3 uppercase tracking-wider w-[140px]">Action</th>
                  <th className="p-3 text-[10px] font-bold text-t3 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any, i: number) => (
                  <tr key={log.id || i} className="border-b border-bd/50 hover:bg-sf/50 transition-colors">
                    <td className="p-3 text-[11px] text-t2 font-mono whitespace-nowrap">{log.dt}</td>
                    <td className="p-3 text-[11px] font-bold text-tx"><span className="bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-[6px] border border-bd">{log.act}</span></td>
                    <td className="p-3 text-[12px] text-t2">{log.det}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-t3 text-sm">No recent activity logged.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen max-w-[1200px] mx-auto text-tx bg-bg-prime relative">
      <div className="w-[210px] bg-bg-sec border-r border-bd py-5 fixed h-screen overflow-y-auto flex-col hidden md:flex">
        <div className="px-4 pb-4 flex items-center gap-2 border-b border-bd mb-1.5">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#FFD700] to-[#CD7F32] flex items-center justify-center shrink-0">
             <Icons.trp className="w-3.5 h-3.5 text-[#111]" />
          </div>
           <div><p className="text-[14px] font-extrabold uppercase tracking-tight bg-gradient-to-r from-[#FFD700] to-[#CD7F32] bg-clip-text text-transparent flex items-center gap-1"><HMPLLogo className="w-4 h-4 text-[#FFD700]" /> HMPL Rewards</p><p className="text-[9px] text-t3 uppercase font-semibold">Admin Panel</p></div>
        </div>
        {tabs.map(t => (
          <button key={t.id} className={`w-full py-2.5 px-4 bg-transparent border-0 border-l-[3px] text-[12px] font-semibold cursor-pointer text-left flex items-center gap-2 transition-colors ${at === t.id ? 'bg-[rgba(212,140,85,0.06)] border-or text-or' : 'border-transparent text-t3 hover:bg-sf'}`} onClick={() => {setAt(t.id); setSr('');}}>
             <t.i className="w-4 h-4" /> {t.l}
             {t.id === 'imeis' && pndIm.length > 0 && <span className="ml-auto bg-[#ff5a65] text-white text-[7px] px-1.5 py-px rounded-[7px]">{pndIm.length}</span>}
          </button>
        ))}
        <div className="mt-auto py-2.5 border-t border-bd relative">
          <button className="w-full py-2.5 px-4 bg-transparent border-0 text-[12px] font-semibold cursor-pointer text-left flex items-center gap-2 text-[#ff5a65] hover:bg-sf" onClick={logout}>
            <Icons.out className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      
      <div className="flex-1 md:ml-[210px] p-[20px_26px] md:p-5 pb-[100px] overflow-y-auto min-h-screen">
        {at === 'dash' && renderDash()}
        {at === 'mgrs' && renderMgrs()}
        {at === 'mdls' && renderMdls()}
        {at === 'imeis' && renderImeis()}
        {at === 'rws' && renderRws()}
        {at === 'pol' && renderPol()}
        {at === 'rpt' && renderRpt()}
        {at === 'log' && renderLog()}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[rgba(16,10,40,0.95)] border-t border-bd flex md:hidden p-[3px_0] pb-[max(7px,env(safe-area-inset-bottom))] z-[100] backdrop-blur-md overflow-x-auto hide-scrollbar">
         {tabs.map(t => (
           <button key={t.id} className={`flex-none min-w-[64px] flex flex-col items-center gap-px py-1.5 rounded-[9px] bg-transparent border-0 cursor-pointer relative transition-colors ${at === t.id ? 'text-or' : 'text-t3'}`} onClick={() => setAt(t.id)}>
             <t.i className="w-[18px] h-[18px]" />
             <span className="text-[7px] font-semibold tracking-wider">{t.l}</span>
           </button>
         ))}
      </div>

      {mo === 'ap' && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[400px] animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5">Points</h3>
            <p className="text-[11px] text-t3 mb-3.5">{state.db.mgrs.find((m: any) => m.id === md.mid)?.nm}</p>
            <input type="number" className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Amount" value={pv} onChange={e=>setPv(e.target.value)} />
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Reason" value={pr} onChange={e=>setPr(e.target.value)} />
            <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-1" onClick={() => handleAction('sp')}>Submit</button>
          </div>
        </div>
      )}

      {mo === 'am' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[400px] animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5">Add Manager</h3>
            <p className="text-[11px] text-t3 mb-3.5">Details</p>
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Name" value={nn} onChange={e=>setNn(e.target.value)} />
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Phone" value={np} onChange={e=>setNp(e.target.value)} />
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Store" value={ns} onChange={e=>setNs(e.target.value)} />
            <select className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none appearance-none" value={na} onChange={e=>setNa(e.target.value)}>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            
            <p className="text-[11px] text-t3 mb-2 mt-4 font-bold uppercase tracking-wider">Product Targets</p>
            <div className="space-y-2 mb-4 bg-sf p-3 rounded-[11px] border border-bd">
              {state.db.models.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{background: m.bg, color: m.cl, fontSize: '12px'}}>{m.ic}</div>
                  <span className="text-[12px] font-semibold flex-1 truncate">{m.nm}</span>
                  <input type="number" className="w-[80px] p-2 bg-bd border border-bd2 rounded-lg text-tx text-xs text-center focus:border-or outline-none" placeholder="Target" value={newMgrTgts[m.id] === undefined ? '' : newMgrTgts[m.id]} onChange={e => setNewMgrTgts({...newMgrTgts, [m.id]: parseInt(e.target.value) || 0})} />
                </div>
              ))}
            </div>

            <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-1" onClick={() => handleAction('sm')}>Add</button>
          </div>
        </div>
      )}

      {mo === 'at' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[400px] max-h-[90vh] overflow-y-auto animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5 flex justify-between items-center">
              <span>🎯 Model Targets</span>
            </h3>
            <p className="text-[11px] text-t3 mb-4">{state.db.mgrs.find((m: any) => m.id === md.mid)?.nm}</p>
            
            <div className="flex flex-col gap-3">
              {state.db.models.map((mod: any) => {
                const currentTgt = tgtValues[mod.id]?.tgt || 0;
                const currentAch = tgtValues[mod.id]?.ach || 0;
                return (
                  <div key={mod.id} className="bg-bd p-3 rounded-[11px] border border-bd2">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-[12px] font-semibold flex items-center gap-1.5"><span className="text-base">{mod.ic}</span> {mod.nm}</span>
                       <span className="text-[10px] bg-[rgba(255,255,255,0.05)] px-2 py-[3px] rounded-md text-t3 border border-bd">Achieved: <span className="text-tx font-bold">{currentAch}</span></span>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-[11px] text-t3 font-medium min-w-[36px]">Target</span>
                       <input 
                         type="number" 
                         min="0" 
                         className="flex-1 p-2 bg-bg-sec border-[1.5px] border-bd2 rounded-[7px] text-tx text-[12px] focus:border-[#2ee89d] outline-none font-mono" 
                         value={currentTgt} 
                         onChange={(e) => setTgtValues(prev => ({ ...prev, [mod.id]: { tgt: parseInt(e.target.value) || 0, ach: currentAch } }))} 
                       />
                     </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-4" onClick={() => handleAction('st')}>Save Targets</button>
          </div>
        </div>
      )}

      {mo === 'excel' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[700px] max-h-[90vh] overflow-y-auto animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5 flex justify-between items-center">
              <span>📊 Bulk Target Upload</span>
            </h3>
            <p className="text-[11px] text-t3 mb-4">Upload targets with columns like: &apos;Manager Phone&apos;, &apos;Reno 15&apos;, &apos;F25 Pro&apos;, etc.</p>
            
            <div className={`mb-4 transition-all ${xTgts.length > 0 ? 'hidden' : 'block'}`}>
              <label className="w-full relative flex items-center justify-center p-6 border-2 border-dashed border-bd2 rounded-[11px] cursor-pointer hover:border-[#2ee89d] transition-colors bg-[rgba(0,0,0,0.2)]">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={handleUploadExcel} />
                <div className="text-center font-semibold text-[13px] text-t3 flex flex-col items-center gap-2">
                  <Icons.up className="w-6 h-6 text-or" />
                  <span>Click or drag to upload Excel file</span>
                </div>
              </label>
            </div>

            {xTgts.length > 0 && (
              <div className="mb-2 text-[12px]">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-[#2ee89d]">{xTgts.length} store managers matched</span>
                    <button className="text-[10px] text-t3 border border-bd bg-transparent px-2 py-1 rounded cursor-pointer" onClick={() => setXTgts([])}>Clear</button>
                </div>
                <div className="max-h-[350px] overflow-y-auto border border-bd rounded-lg hide-scrollbar">
                  <table className="w-full border-collapse relative">
                    <thead className="sticky top-0 bg-bg-sec border-b border-bd z-10 shadow-sm">
                      <tr>
                        <th className="p-3 text-left text-[10px] text-t3 uppercase font-bold tracking-wider">Manager</th>
                        <th className="p-3 text-left text-[10px] text-t3 uppercase font-bold tracking-wider">Targets</th>
                        <th className="p-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {xTgts.map(x => (
                        <tr key={x.id} className="border-b border-bd last:border-0 hover:bg-sf">
                          <td className="p-3 align-top min-w-[120px]">
                             <div className="font-semibold text-[13px] text-tx">{x.mgrNm}</div>
                             <div className="text-[10px] text-[#2ee89d] font-mono mt-0.5">{x.ph}</div>
                          </td>
                          <td className="p-3">
                             <div className="flex flex-wrap gap-2">
                               {Object.keys(x.tgts).map(mid => {
                                  const mName = state.db.models.find((model: any) => model.id === mid)?.nm || mid;
                                  return (
                                    <div key={mid} className="flex items-center gap-1.5 bg-bg-prime p-1.5 pr-2 rounded-md border border-bd">
                                      <span className="text-[10px] text-t3 font-medium truncate max-w-[80px]">{mName}</span>
                                      <input 
                                        type="number" 
                                        className="w-12 bg-transparent border-0 text-tx text-[11px] font-mono font-bold outline-none text-right placeholder-t3"
                                        value={x.tgts[mid] || ''} 
                                        onChange={(e) => {
                                           const v = parseInt(e.target.value) || 0;
                                           setXTgts(prev => prev.map(p => p.id === x.id ? { ...p, tgts: { ...p.tgts, [mid]: v } } : p));
                                        }}
                                      />
                                    </div>
                                  );
                               })}
                             </div>
                          </td>
                          <td className="p-3 text-right align-top">
                             <button className="bg-transparent border-0 text-t3 hover:text-[#ff5a65] p-1.5 rounded cursor-pointer transition-colors" onClick={() => setXTgts(prev => prev.filter(p => p.id !== x.id))}><Icons.x className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-4" onClick={() => handleAction('apply-excel')}>
                  Save Targets for {xTgts.length} Managers
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mo === 'excel-mods' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[700px] max-h-[90vh] overflow-y-auto animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5 flex justify-between items-center">
              <span>📊 Bulk Models Upload</span>
            </h3>
            <p className="text-[11px] text-t3 mb-4">Upload models with columns: &apos;Model Name&apos;, &apos;Model Series&apos;, &apos;Icon&apos;.</p>
            
            <div className={`mb-4 transition-all ${xMods.length > 0 ? 'hidden' : 'block'}`}>
              <label className="w-full relative flex items-center justify-center p-6 border-2 border-dashed border-bd2 rounded-[11px] cursor-pointer hover:border-[#2ee89d] transition-colors bg-[rgba(0,0,0,0.2)]">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={handleUploadExcelMods} />
                <div className="text-center font-semibold text-[13px] text-t3 flex flex-col items-center gap-2">
                  <Icons.up className="w-6 h-6 text-or" />
                  <span>Click or drag to upload Excel file</span>
                </div>
              </label>
            </div>

            {xMods.length > 0 && (
              <div className="mb-2 text-[12px]">
                <div className="flex justify-between items-center mb-3">
                   <p className="font-bold text-[#2ee89d]">✓ {xMods.length} Models Loaded</p>
                   <button className="text-[10px] text-or bg-transparent cursor-pointer border-0" onClick={() => setXMods([])}>Clear</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto border border-bd rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-sf sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border-b border-bd font-semibold">Name</th>
                        <th className="p-2 border-b border-bd font-semibold">Series</th>
                        <th className="p-2 border-b border-bd font-semibold">Icon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {xMods.map((xm: any, i: number) => (
                        <tr key={i} className="border-b border-bd">
                          <td className="p-2">{xm.nm}</td>
                          <td className="p-2 text-t3">{xm.sr}</td>
                          <td className="p-2">{xm.ic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-4" onClick={() => handleAction('apply-excel-mods')}>
                  Save {xMods.length} Models
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mo === 'amod' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[400px] animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5">{md && md.id ? 'Edit Model' : 'Add Model'}</h3>
            <p className="text-[11px] text-t3 mb-3.5">Details</p>
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Model Name (e.g. Reno 15)" value={mdNm} onChange={e=>setMdNm(e.target.value)} />
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Icon (emoji. e.g. 📱)" value={mdIc} onChange={e=>setMdIc(e.target.value)} />
            <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-1" onClick={() => handleAction('save-model')}>{md && md.id ? 'Update Model' : 'Add Model'}</button>
          </div>
        </div>
      )}

      {mo === 'arw' && (
         <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
          <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[400px] animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-0.5">Add Reward</h3>
            <p className="text-[11px] text-t3 mb-3.5">Details</p>
            <input className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Reward Name (e.g. Amazon ₹500)" value={rn} onChange={e=>setRn(e.target.value)} />
            <input type="number" className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Points Required" value={rp} onChange={e=>setRp(e.target.value)} />
            <input type="number" className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none" placeholder="Initial Stock" value={rs} onChange={e=>setRs(e.target.value)} />
            <div className="relative mb-2">
               <input type="date" className={`w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] focus:border-or outline-none appearance-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!rx ? 'text-t3' : ''}`} placeholder="Expiry Date (Optional)" value={rx} onChange={e=>setRx(e.target.value)} />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-t3"><Icons.tgt className="w-4 h-4 opacity-50" /></div>
               {!rx && <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-t3 text-[13px]">Expiry Date (Optional)</span>}
            </div>
            <select className="w-full p-3 bg-bd border-[1.5px] border-bd2 rounded-[11px] text-tx text-[13px] mb-2 focus:border-or outline-none appearance-none" value={rc} onChange={e=>setRc(e.target.value)}>
              <option value="Electronics">Electronics</option>
              <option value="Gift Cards">Gift Cards</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Experiences">Experiences</option>
            </select>
            <button className="w-full p-3 bg-gradient-to-br from-[#FFD700] to-[#CD7F32] border-none rounded-[11px] text-[#111] text-sm font-bold cursor-pointer transition-transform active:scale-95 mt-1" onClick={() => handleAction('sr')}>Add Reward</button>
          </div>
        </div>
      )}

      {mo === 'scan-imei' && (
        <QRScanner onScan={(decodedText) => {
          setSr(decodedText);
          setMo('');
        }} onClose={() => setMo('')} />
      )}

      {mo === 'mgr-det' && md.mid && (() => {
         const mgr = state.db.mgrs.find((m: any) => m.id === md.mid);
         if (!mgr) return null;
         const targets = mgr.targets || {};
         // Group by model, and also by series
         const tA = Object.values(targets).reduce((s: any, t: any) => s + (t.ach || 0), 0) as number;
         const tT = Object.values(targets).reduce((s: any, t: any) => s + (t.tgt || 0), 0) as number;
         const pct = tT ? Math.round((tA / tT) * 100) : 0;
         
         const srStats: any = {};
         state.db.models.forEach((mod: any) => {
            if (!srStats[mod.sr]) srStats[mod.sr] = { sr: mod.sr, tT: 0, tA: 0 };
            const mTargets = (targets as any)[mod.id] || {};
            srStats[mod.sr].tT += (mTargets.tgt || 0);
            srStats[mod.sr].tA += (mTargets.ach || 0);
         });

         return (
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[200] flex items-center justify-center p-4 animate-[fi_0.15s] backdrop-blur-[3px]" onClick={() => handleAction('cm')}>
            <div className="bg-bg-sec border border-bd2 rounded-[18px] p-[22px_20px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto animate-[su_0.25s] shadow-[0_16px_44px_rgba(0,0,0,0.3)] text-tx" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="text-[17px] font-extrabold text-tx mb-1 flex items-center gap-2">{mgr.nm} <span className="text-[10px] text-t3 font-mono font-normal">#{mgr.id}</span></h3>
                   <p className="text-[11px] text-t3">{mgr.store} ({mgr.area}) · {mgr.ph}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[15px] font-bold font-mono text-or">{mgr.pts.toLocaleString()} pts</p>
                    <p className="text-[10px] text-t3 font-semibold uppercase tracking-wider">{pct}% Achieved</p>
                 </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 bg-[rgba(212,140,85,0.1)] text-or rounded-xl text-xs font-bold cursor-pointer border-0" onClick={() => handleAction('ap', mgr.id)}>Give Points</button>
                <button className="flex-1 py-2 bg-[rgba(46,232,157,0.1)] text-[#2ee89d] rounded-xl text-xs font-bold cursor-pointer border-0" onClick={() => handleAction('at', mgr.id)}>Edit Targets</button>
              </div>

              <h4 className="text-[13px] font-extrabold uppercase text-t3 mb-2 tracking-wider">Series Wise</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                 {Object.values(srStats).map((st: any, i: number) => {
                    const spct = st.tT ? Math.round((st.tA / st.tT) * 100) : 0;
                    return (
                      <div key={i} className="bg-sf border border-bd rounded-xl p-2.5 flex flex-col justify-between">
                         <p className="text-[11px] font-bold text-tx mb-1">{st.sr}</p>
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] text-t3 font-mono">{st.tA} / {st.tT}</span>
                            <span className={`text-[11px] font-bold font-mono ${spct >= 100 ? 'text-[#2ee89d]' : spct >= 80 ? 'text-or' : 'text-[#ff5a65]'}`}>{spct}%</span>
                         </div>
                      </div>
                    )
                 })}
              </div>

              <h4 className="text-[13px] font-extrabold uppercase text-t3 mb-2 tracking-wider">Model Wise</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                 {state.db.models.map((mod: any) => {
                    const mTargets = (targets as any)[mod.id] || {};
                    const tT = mTargets.tgt || 0;
                    const tA = mTargets.ach || 0;
                    const mpct = tT ? Math.round((tA / tT) * 100) : 0;
                    return (
                      <div key={mod.id} className="flex justify-between items-center p-2.5 border border-bd rounded-xl bg-sf">
                         <div className="flex items-center gap-2">
                            <span className="text-xl" style={{color: mod.cl}}>{mod.ic}</span>
                            <div>
                               <p className="text-[11px] font-bold text-tx leading-tight">{mod.nm}</p>
                               <p className="text-[9px] text-t3">{mod.sr}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-[10px] text-t3 font-mono">{tA} / {tT}</p>
                            </div>
                            <div className={`text-[12px] font-bold font-mono w-[40px] text-right ${mpct >= 100 ? 'text-[#2ee89d]' : mpct >= 80 ? 'text-or' : 'text-[#ff5a65]'}`}>
                               {mpct}%
                            </div>
                         </div>
                      </div>
                    )
                 })}
              </div>

            </div>
          </div>
         );
      })()}

      {mo === 'edit-pol' && ePol && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm z-[200] flex items-center p-4 lg:p-0 lg:justify-center">
           <div className="bg-bg-prime rounded-[20px] w-full lg:max-w-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-bd lg:rounded-2xl absolute bottom-0 lg:relative lg:bottom-auto left-0 lg:left-auto lg:h-auto max-h-[90vh] overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)] animate-[su_0.3s]">
              <div className="p-4 border-b border-bd flex justify-between items-center bg-bg-sec shrink-0">
                <h3 className="font-bold flex items-center gap-2"><Icons.set className="w-4 h-4 text-or" /> Edit Reward Policy</h3>
                <button className="w-8 h-8 rounded-full bg-sf border-0 flex items-center justify-center text-t2 cursor-pointer hover:bg-bd" onClick={() => setMo('')}><Icons.x className="w-4 h-4" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-t2 uppercase tracking-wider mb-2">Base Points (per IMEI)</label>
                  <input type="number" className="w-full bg-sf border border-bd rounded-xl p-3 text-sm text-tx font-mono focus:border-or focus:outline-none" value={ePol.basePtsPerImei || 0} onChange={(e) => setEPol({...ePol, basePtsPerImei: parseInt(e.target.value) || 0})} />
                </div>
                
                <div className="mb-5">
                  <label className="block text-[11px] font-bold text-t2 uppercase tracking-wider mb-2">Target Achievement Bonus Points</label>
                  <input type="number" className="w-full bg-sf border border-bd rounded-xl p-3 text-sm text-tx font-mono focus:border-or focus:outline-none" value={ePol.tgtBonusPts || 0} onChange={(e) => setEPol({...ePol, tgtBonusPts: parseInt(e.target.value) || 0})} />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-t2 uppercase tracking-wider mb-2">Model Wise Bonus Points</label>
                  {state.db.models.map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center mb-2">
                       <span className="text-xs font-semibold">{m.nm}</span>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-t3 font-mono text-sm">+</span>
                         <input type="number" className="w-24 bg-sf border border-bd rounded-lg p-2 pl-7 text-sm text-tx font-mono focus:border-or focus:outline-none text-right" value={ePol.modelPts?.[m.id] || 0} onChange={(e) => {
                           const val = parseInt(e.target.value) || 0;
                           setEPol({...ePol, modelPts: {...(ePol.modelPts || {}), [m.id]: val}});
                         }} />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-bd bg-bg-sec shrink-0">
                <button className="w-full py-3.5 bg-gradient-to-r from-[#FFD700] to-[#CD7F32] text-[#111] border-0 font-bold rounded-xl cursor-pointer shadow-[0_4px_14px_rgba(255,215,0,0.2)] active:scale-95 transition-transform" onClick={() => handleAction('save-pol')}>Save Policy Settings</button>
              </div>
           </div>
        </div>
      )}

      {tst && <div className={`fixed top-[max(12px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 p-[10px_16px] rounded-xl z-[400] text-xs font-semibold flex items-center gap-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.3)] animate-[sd_0.3s] max-w-[86%] ${tst.t === 'ok' ? 'bg-[rgba(6,95,70,0.92)] text-[#a7f3d0] border border-[rgba(46,232,157,0.15)]' : 'bg-[rgba(127,29,29,0.92)] text-[#fca5a5] border border-[rgba(255,90,101,0.15)]'}`}>{tst.t === 'ok' ? <Icons.chk className="w-3 h-3" /> : ''} {tst.m}</div>}
    </div>
  );
}
