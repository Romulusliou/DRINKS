import React, { useState, useEffect, useMemo } from 'react';
import { Plus, BarChart3, List, CupSoda, Trash2, Download, Star, Settings, AlertTriangle, BookOpen, Trophy, RefreshCw, Calendar, Tag, X, Wifi } from 'lucide-react';
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
  const threshold = 120; 

  // Touch Events (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    if (diff > 0) setCurrentX(diff);
  };
  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX > threshold) onDelete(record.id);
    setCurrentX(0);
  };

  // Mouse Events (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsSwiping(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    const diff = e.clientX - startX;
    if (diff > 0) setCurrentX(diff);
  };
  const handleMouseUp = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (currentX > threshold) onDelete(record.id);
    setCurrentX(0);
  };
  const handleMouseLeave = () => {
    if (isSwiping) {
        setIsSwiping(false);
        setCurrentX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4 group cursor-grab active:cursor-grabbing">
      <div 
        className="absolute inset-0 bg-red-600/90 flex items-center pl-6 transition-opacity"
        style={{ opacity: currentX > 20 ? 1 : 0 }}
      >
        <div className={`flex items-center gap-2 text-white font-bold transition-transform ${currentX > threshold ? 'scale-110' : 'scale-100'}`}>
          <Trash2 className="w-6 h-6" />
          <span className="text-sm">放生這杯</span>
        </div>
      </div>

      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="bg-slate-900/80 p-5 border border-slate-800 relative z-10 transition-transform duration-200 ease-out select-none"
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
      </div>
    </div>
  );
};

export default function App() {
  const [nickname, setNickname] = useState('');
  const [groupId, setGroupId] = useState('2026drinks');
  const [isSetup, setIsSetup] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempGroupId, setTempGroupId] = useState('2026drinks');
  
  const [config, setConfig] = useState<UserConfig>({ nickname: '' });
  const [showConfig, setShowConfig] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.LOG);
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Setup Check
  useEffect(() => {
    const storedName = localStorage.getItem('user_nickname');
    const storedGroup = localStorage.getItem('user_group_id');
    const storedConfig = localStorage.getItem('user_config');
    
    if (storedName && storedGroup) {
      setNickname(storedName);
      setGroupId(storedGroup);
      setIsSetup(true);
      if (storedConfig) setConfig(JSON.parse(storedConfig));
    }
  }, []);

  // Data Sync
  useEffect(() => {
    if (!isSetup || !groupId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await Storage.fetchRecords(groupId);
        setRecords(data);
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const subscription = Storage.subscribeToGroup(groupId, () => loadData());
    return () => { subscription.unsubscribe(); };
  }, [isSetup, groupId]);

  // Statistics
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const thisMonth = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const myRecords = thisMonth.filter(r => r.drinkerName === nickname);
    const spent = myRecords.reduce((acc, r) => acc + r.price, 0);
    const avgSugar = myRecords.length > 0 
      ? myRecords.reduce((acc, r) => acc + r.sugarValue, 0) / myRecords.length 
      : 0;
    return { count: myRecords.length, spent, avgSugar, totalGroupCount: thisMonth.length };
  }, [records, nickname]);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim() || !tempGroupId.trim()) return;
    localStorage.setItem('user_nickname', tempName.trim());
    localStorage.setItem('user_group_id', tempGroupId.trim());
    setNickname(tempName.trim());
    setGroupId(tempGroupId.trim());
    setIsSetup(true);
  };

  const handleResetApp = () => {
    if (confirm("這將登出並清除本機設定 (雲端資料不會刪除)，確定嗎？")) {
      localStorage.removeItem('user_nickname');
      localStorage.removeItem('user_group_id');
      localStorage.removeItem('user_config');
      window.location.reload();
    }
  };

  // Form State
  const [brand, setBrand] = useState(TAIPEI_BRANDS[0]);
  const [customBrand, setCustomBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [sugarVal, setSugarVal] = useState<number>(5); 
  const [ice, setIce] = useState<string>(IceLevel.Half);
  const [toppings, setToppings] = useState(''); 
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(4); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSugarLabel = (val: number) => {
    if (val === 0) return "無糖 (0分)";
    if (val === 10) return "全糖 (10分)";
    return `${val} 分糖`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === "其他 (自訂)" ? customBrand : brand;
    if (!finalBrand || !drinkName || !price) {
      alert("請填寫完整資訊 (品牌、品項、價格)");
      return;
    }

    setIsSubmitting(true);
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

    try {
      await Storage.saveRecord(newRecord, groupId);
      setDrinkName('');
      setPrice('');
      setToppings('');
      setReview('');
      setRating(4);
      alert("紀錄成功！");
    } catch (e) {
      alert("上傳失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要放生這筆紀錄嗎？")) {
      try { await Storage.deleteRecord(id); } catch(e) { alert("刪除失敗"); }
    }
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-sm text-center">
          <CupSoda className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">手搖飲全紀錄 2026</h1>
          <p className="text-xs text-slate-500 mb-6">雲端同步版 - 與朋友一起喝</p>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="text-left">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">你的暱稱</label>
              <input 
                type="text" required placeholder="例如：珍珠大師"
                value={tempName} onChange={e => setTempName(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-left">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">群組代碼 (與朋友共用)</label>
              <input 
                type="text" required placeholder="例如：2026drinks"
                value={tempGroupId} onChange={e => setTempGroupId(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold font-mono text-amber-500 outline-none focus:border-amber-500"
              />
            </div>
            <button type="submit" className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-xl hover:bg-amber-400 transition-colors">開始記錄</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans selection:bg-amber-500/30">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <CupSoda className="w-5 h-5 text-amber-500" /> 手搖飲全紀錄
            </h1>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-500" /> 群組: {groupId}
            </span>
          </div>
          <button onClick={() => setShowConfig(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Settings Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setShowConfig(false)}>
          <div className="bg-slate-900 w-full max-w-sm p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowConfig(false)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" /> 設定</h3>
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <button onClick={handleResetApp} className="w-full py-3 px-4 rounded-xl border border-red-500/50 text-red-400 text-sm font-bold flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20">
                <RefreshCw className="w-4 h-4" /> 登出 / 切換群組
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4">
        {isLoading && records.length === 0 ? (
          <div className="flex justify-center py-20 text-slate-500"><div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <>
            {activeTab === Tab.LOG && (
              <div className="space-y-6 animate-fade-in">
                {/* Dashboard Card */}
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><CupSoda className="w-20 h-20" /></div>
                   <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">本月戰況 ({nickname})</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-amber-500">{currentMonthStats.count}</span>
                          <span className="text-slate-400 text-sm">杯 / ${currentMonthStats.spent}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1">群組本月共 {currentMonthStats.totalGroupCount} 杯</p>
                      </div>
                   </div>
                   {currentMonthStats.avgSugar > 7 && (
                     <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                       <AlertTriangle className="w-5 h-5 text-amber-500" />
                       <p className="text-xs text-amber-200">警告：平均 {currentMonthStats.avgSugar.toFixed(1)} 分糖！</p>
                     </div>
                   )}
                </div>

                {/* Input Form */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-amber-500" /> 紀錄這一杯</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">品牌</label>
                        <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-amber-500">
                          {TAIPEI_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">日期</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-9 p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm outline-none focus:border-amber-500" />
                        </div>
                      </div>
                    </div>

                    {brand === "其他 (自訂)" && <input type="text" placeholder="輸入店名" value={customBrand} onChange={e => setCustomBrand(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:border-amber-500 outline-none" />}
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">飲品名稱</label>
                      <input type="text" required placeholder="例如：熟成紅茶" value={drinkName} onChange={e => setDrinkName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none" />
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
                      <label className="text-[10px] text-slate-500 font-bold uppercase ml-1 flex items-center gap-1"><Tag className="w-3 h-3" /> 加料</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_TOPPINGS.map(t => (
                          <button 
                            key={t} type="button" 
                            onClick={() => {
                                const curr = toppings.split(',').map(s=>s.trim()).filter(Boolean);
                                setToppings(curr.includes(t) ? curr.filter(x=>x!==t).join(',') : [...curr, t].join(','));
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] border transition-all ${toppings.includes(t) ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <span className="text-xs font-bold text-slate-500 uppercase">評分</span>
                       <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => setRating(s)} className="active:scale-125 transition-transform"><Star className={`w-7 h-7 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`} /></button>)}
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 ${isSubmitting ? 'bg-slate-700 text-slate-400' : 'bg-amber-500 text-slate-900 shadow-amber-500/20'}`}
                    >
                      {isSubmitting ? '處理中...' : '紀錄這杯'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === Tab.LIST && (
               <div className="space-y-4 animate-fade-in">
                 <div className="text-center mb-2"><span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">往右滑動卡片可刪除</span></div>
                 {records.map(r => <SwipeableItem key={r.id} record={r} onDelete={handleDelete} />)}
                 {records.length === 0 && <div className="text-center py-20 text-slate-600">還沒有紀錄</div>}
               </div>
            )}

            {activeTab === Tab.POKEDEX && <BobaPokedex records={records} />}
            
            {activeTab === Tab.STATS && (
              <div className="space-y-8 animate-fade-in">
                 <MedalWall records={records} />
                 <StatsOverview records={records} />
              </div>
            )}
          </>
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
