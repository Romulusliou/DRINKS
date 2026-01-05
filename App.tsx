
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, BarChart3, List, CupSoda, Trash2, Download, Upload, Star, Settings, AlertTriangle, BookOpen, Trophy, RefreshCw, Calendar, Tag, FileJson, X } from 'lucide-react';
import { DrinkRecord, IceLevel, TAIPEI_BRANDS, COMMON_TOPPINGS, UserConfig } from './types';
import * as Storage from './services/storageService';
import StatsOverview from './components/StatsOverview';
import BobaPokedex from './components/BobaPokedex';
import MedalWall from './components/MedalWall';

enum Tab {
  LOG = 'log',
  LIST = 'list',
  POKEDEX = 'pokedex',
  STATS = 'stats'
}

interface SwipeableItemProps {
  record: DrinkRecord;
  onDelete: (id: string) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ record, onDelete }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const threshold = 120; // Distance to trigger delete

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    // Only allow swiping to the right as requested
    if (diff > 0) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX > threshold) {
      onDelete(record.id);
    }
    setCurrentX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4">
      {/* Background Action Area (Revealed on swipe) */}
      <div 
        className="absolute inset-0 bg-red-600 flex items-center pl-6 transition-opacity"
        style={{ opacity: currentX > 20 ? 1 : 0 }}
      >
        <div className={`flex items-center gap-2 text-white font-bold transition-transform ${currentX > threshold ? 'scale-110' : 'scale-100'}`}>
          <Trash2 className="w-6 h-6" />
          <span className="text-sm">放生這杯</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-slate-900 p-5 border border-slate-800 relative z-10 transition-transform duration-200 ease-out select-none touch-pan-y"
        style={{ 
          transform: `translateX(${currentX}px)`,
          borderLeftWidth: currentX > 0 ? '0' : '1px'
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded text-slate-400">{record.drinkerName}</span>
            <span className="text-[10px] text-slate-500 font-mono">{record.date}</span>
          </div>
          <span className="text-lg font-black text-amber-500 font-mono">${record.price}</span>
        </div>
        <h3 className="font-bold text-slate-100">{record.brand} - {record.drinkName}</h3>
        <p className="text-xs text-slate-500 mt-1">{record.sugarLevel} / {record.iceLevel} {record.toppings ? `• ${record.toppings}` : ''}</p>
        <div className="flex gap-0.5 mt-2">
           {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < record.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />)}
        </div>
        {record.review && <p className="text-xs text-slate-400 italic mt-3 border-l-2 border-slate-700 pl-3">"{record.review}"</p>}
        
        {/* Swipe Hint Indicator (Mobile users) */}
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-1 h-8 bg-slate-800 rounded-full opacity-30"></div>
      </div>
    </div>
  );
};

export default function App() {
  const [nickname, setNickname] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [config, setConfig] = useState<UserConfig>({ nickname: '' });
  const [showConfig, setShowConfig] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.LOG);
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialRecords = Storage.getRecords();
    setRecords(initialRecords);
    const storedName = localStorage.getItem('user_nickname');
    const storedConfig = localStorage.getItem('user_config');
    if (storedName) {
      setNickname(storedName);
      setIsSetup(true);
      if (storedConfig) setConfig(JSON.parse(storedConfig));
    }
  }, []);

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const thisMonth = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const spent = thisMonth.reduce((acc, r) => acc + r.price, 0);
    const avgSugar = thisMonth.length > 0 
      ? thisMonth.reduce((acc, r) => acc + r.sugarValue, 0) / thisMonth.length 
      : 0;
    return { count: thisMonth.length, spent, avgSugar };
  }, [records]);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    localStorage.setItem('user_nickname', tempName.trim());
    setNickname(tempName.trim());
    setIsSetup(true);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('user_config', JSON.stringify(config));
    setShowConfig(false);
  };

  const handleResetApp = () => {
    if (confirm("警告：這將清空所有紀錄並重置 App，確定嗎？")) {
      Storage.clearAllData();
      localStorage.removeItem('user_nickname');
      localStorage.removeItem('user_config');
      window.location.reload();
    }
  };

  const getSugarLabel = (val: number) => {
    if (val === 0) return "無糖 (0分)";
    if (val === 10) return "全糖 (10分)";
    return `${val} 分糖`;
  };

  const handleToppingToggle = (t: string) => {
    const currentToppings = toppings.split(',').map(item => item.trim()).filter(Boolean);
    if (currentToppings.includes(t)) {
      setToppings(currentToppings.filter(item => item !== t).join(', '));
    } else {
      setToppings(currentToppings.concat(t).join(', '));
    }
  };

  // Form State
  const [brand, setBrand] = useState(TAIPEI_BRANDS[0]);
  const [customBrand, setCustomBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [sugarVal, setSugarVal] = useState<number>(5); 
  const [ice, setIce] = useState<string>(IceLevel.Regular);
  const [toppings, setToppings] = useState(''); 
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(3); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === "其他 (自訂)" ? customBrand : brand;
    if (!finalBrand || !drinkName || !price) {
      alert("請填寫完整資訊 (品牌、品項、價格)");
      return;
    }

    const newRecord: DrinkRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      drinkerName: nickname,
      brand: finalBrand,
      drinkName,
      sugarLevel: getSugarLabel(sugarVal),
      sugarValue: sugarVal,
      iceLevel: ice,
      toppings,
      review,
      price: Number(price),
      rating,
      date,
      timestamp: new Date(date).getTime()
    };

    const updated = Storage.saveRecord(newRecord);
    setRecords(updated);
    
    setDrinkName('');
    setPrice('');
    setToppings('');
    setReview('');
    setRating(3);
    setDate(new Date().toISOString().split('T')[0]);
    alert("紀錄成功！圖鑑已更新 ✨");
  };

  const handleDelete = (id: string) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    if (confirm("確定要放生這筆紀錄嗎？")) {
      const updated = Storage.deleteRecord(id);
      setRecords([...updated]);
    }
  };

  const handleExport = () => {
    const data = Storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `手搖飲全紀錄_${nickname}_備份.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const addedCount = Storage.importData(event.target?.result as string);
      if (addedCount >= 0) {
        setRecords(Storage.getRecords());
        setShowImport(false);
        alert(`資料合併成功！新增了 ${addedCount} 筆紀錄。`);
      } else {
        alert("匯入失敗：檔案格式不正確。");
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-sm text-center">
          <CupSoda className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">手搖飲全紀錄</h1>
          <p className="text-xs text-slate-500 mb-6">2026 年度手搖生活紀錄計畫</p>
          <form onSubmit={handleSetup} className="space-y-4">
            <input 
              type="text" required placeholder="你的暱稱"
              value={tempName} onChange={e => setTempName(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold"
            />
            <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-xl">開啟計畫</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CupSoda className="w-5 h-5 text-amber-500" /> 手搖飲全紀錄
          </h1>
          <div className="flex gap-1">
            <button onClick={() => setShowConfig(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
            <button onClick={handleExport} className="p-2 text-slate-400 hover:text-white transition-colors"><Download className="w-5 h-5" /></button>
            <button onClick={() => setShowImport(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Upload className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setShowImport(false)}>
          <div className="bg-slate-900 w-full max-w-sm p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowImport(false)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileJson className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold">匯入與合併紀錄</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-4">
                選取朋友分享的備份檔案 (.json)，系統會自動將新紀錄合併到您的清單中，重複的紀錄將被跳過。
              </p>
            </div>
            
            <div className="space-y-3">
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" /> 選擇備份檔案
              </button>
              <p className="text-[10px] text-center text-slate-600 font-medium">支援從其它手機匯出的 .json 格式</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setShowConfig(false)}>
          <div className="bg-slate-900 w-full max-w-sm p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" /> 個人設定</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">每月預算 ($)</label>
                <input type="number" value={config.monthlyBudget || ''} onChange={e => setConfig({...config, monthlyBudget: Number(e.target.value)})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">每月杯數上限</label>
                <input type="number" value={config.monthlyCupLimit || ''} onChange={e => setConfig({...config, monthlyCupLimit: Number(e.target.value)})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 outline-none" />
              </div>
              <button onClick={handleSaveConfig} className="w-full py-3 bg-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20">儲存設定</button>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">系統管理</p>
              <button 
                onClick={handleResetApp}
                className="w-full py-2 px-4 rounded-xl border border-red-500/50 text-red-400 text-xs font-bold flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 重置並清空所有資料
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4">
        {activeTab === Tab.LOG && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><CupSoda className="w-20 h-20" /></div>
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">本月戰況</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-500">{currentMonthStats.count}</span>
                      <span className="text-slate-400 text-sm">杯 / ${currentMonthStats.spent}</span>
                    </div>
                  </div>
                  {config.monthlyBudget && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold">預算剩餘</p>
                      <p className={`font-mono font-bold ${currentMonthStats.spent > config.monthlyBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                        ${config.monthlyBudget - currentMonthStats.spent}
                      </p>
                    </div>
                  )}
               </div>

               {currentMonthStats.avgSugar > 7 && (
                 <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                   <AlertTriangle className="w-5 h-5 text-amber-500" />
                   <p className="text-xs text-amber-200">警告：本月糖分過高！平均 {currentMonthStats.avgSugar.toFixed(1)} 分糖，建議下幾杯試試微糖。</p>
                 </div>
               )}
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-amber-500" /> 新增紀錄</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">品牌</label>
                    <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-amber-500 transition-colors">
                      {TAIPEI_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">日期</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-9 p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-amber-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {brand === "其他 (自訂)" && <input type="text" placeholder="店名" value={customBrand} onChange={e => setCustomBrand(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-amber-500 outline-none" />}
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">飲品名稱</label>
                  <input type="text" required placeholder="例如：珍珠奶茶" value={drinkName} onChange={e => setDrinkName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">價格</label>
                      <input type="number" required placeholder="$$" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono focus:border-amber-500 outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">冰塊</label>
                      <select value={ice} onChange={e => setIce(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-amber-500">
                        {Object.values(IceLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500"><span>甜度</span><span className="text-amber-500">{getSugarLabel(sugarVal)}</span></div>
                  <input type="range" min="0" max="10" value={sugarVal} onChange={e => setSugarVal(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-amber-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> 加料 (可手動輸入或選取)
                  </label>
                  <input 
                    type="text" 
                    placeholder="珍珠, 椰果..." 
                    value={toppings} 
                    onChange={e => setToppings(e.target.value)} 
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-sm" 
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_TOPPINGS.map(t => (
                      <button 
                        key={t} 
                        type="button" 
                        onClick={() => handleToppingToggle(t)}
                        className={`px-3 py-1 rounded-full text-[10px] border transition-all ${toppings.includes(t) ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea placeholder="短評..." value={review} onChange={e => setReview(e.target.value)} rows={2} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-amber-500 outline-none" />
                
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                   <span className="text-xs font-bold text-slate-500 uppercase">評分</span>
                   <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className={`transition-transform active:scale-125 ${rating >= s ? 'text-amber-400' : 'text-slate-700'}`}><Star className={`w-7 h-7 ${rating >= s ? 'fill-amber-400' : 'fill-slate-800'}`} /></button>)}
                   </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/10 active:scale-95 transition-transform">紀錄這杯！</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === Tab.LIST && (
           <div className="space-y-4">
             <div className="mb-2 text-center">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">💡 提示：向右滑動卡片可刪除紀錄</span>
             </div>
             {records.map(r => (
               <SwipeableItem key={r.id} record={r} onDelete={handleDelete} />
             ))}
             {records.length === 0 && (
               <div className="text-center py-20 text-slate-600">
                 尚未有任何紀錄，快去喝一杯吧！
               </div>
             )}
           </div>
        )}

        {activeTab === Tab.POKEDEX && <BobaPokedex records={records} />}

        {activeTab === Tab.STATS && (
          <div className="space-y-8">
             <div>
               <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> 紀錄勳章牆</h3>
               <MedalWall records={records} />
             </div>
             <StatsOverview records={records} />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50">
        <div className="max-w-md mx-auto flex justify-around p-3">
          {[
            { id: Tab.LOG, icon: Plus, label: '紀錄' },
            { id: Tab.LIST, icon: List, label: '歷史' },
            { id: Tab.POKEDEX, icon: BookOpen, label: '圖鑑' },
            { id: Tab.STATS, icon: BarChart3, label: '統計' }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex flex-col items-center gap-1 w-12 transition-all ${activeTab === t.id ? 'text-amber-500 scale-110' : 'text-slate-500'}`}>
              <t.icon className="w-6 h-6" />
              <span className="text-[9px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
