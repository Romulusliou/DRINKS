import React, { useMemo, useState } from 'react';
import { DrinkRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, ComposedChart, Line } from 'recharts';
import { Trophy, Crown, TrendingUp, Users, Calendar, Filter, DollarSign, Coffee } from 'lucide-react';

interface StatsOverviewProps {
  records: DrinkRecord[];
}

// Dark Mode Palette
const COLORS = ['#F59E0B', '#D97706', '#92400E', '#78350F', '#451A03', '#334155'];
const TEXT_COLOR = '#94a3b8'; // Slate 400

const StatsOverview: React.FC<StatsOverviewProps> = ({ records }) => {
  const [friendTimeFilter, setFriendTimeFilter] = useState<string>('All');

  const totalSpent = useMemo(() => records.reduce((acc, curr) => acc + curr.price, 0), [records]);
  const totalCups = records.length;

  // 0. Group Members List
  const groupMembers = useMemo(() => {
    return Array.from(new Set(records.map(r => r.drinkerName))).sort();
  }, [records]);

  // Helper to extract quarters for dropdown
  const availableQuarters = useMemo(() => {
    const quarters = new Set<string>();
    records.forEach(r => {
        const d = new Date(r.date);
        const q = `Q${Math.floor(d.getMonth() / 3) + 1}`;
        const y = d.getFullYear();
        quarters.add(`${y}-${q}`);
    });
    return ['All', ...Array.from(quarters).sort().reverse()];
  }, [records]);
  
  // 1. Friend Comparison (Leaderboard) with Filter
  const friendData = useMemo(() => {
    // Filter records first
    const targetRecords = friendTimeFilter === 'All' 
        ? records 
        : records.filter(r => {
            const d = new Date(r.date);
            const q = `Q${Math.floor(d.getMonth() / 3) + 1}`;
            const y = d.getFullYear();
            return `${y}-${q}` === friendTimeFilter;
        });

    const map = new Map<string, { cups: number; spent: number }>();
    targetRecords.forEach(r => {
      const current = map.get(r.drinkerName) || { cups: 0, spent: 0 };
      map.set(r.drinkerName, {
        cups: current.cups + 1,
        spent: current.spent + r.price
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.cups - a.cups);
  }, [records, friendTimeFilter]);

  // 2. Brand Rankings
  const brandData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach(r => {
      map.set(r.brand, (map.get(r.brand) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [records]);

  // 3. Top Drinks
  const topDrinks = useMemo(() => {
     const map = new Map<string, { count: number, totalRating: number }>();
     records.forEach(r => {
       const key = `${r.brand} ${r.drinkName}`;
       const current = map.get(key) || { count: 0, totalRating: 0 };
       map.set(key, { 
         count: current.count + 1, 
         totalRating: current.totalRating + r.rating 
       });
     });
     return Array.from(map.entries())
       .map(([name, data]) => ({ 
         name, 
         count: data.count, 
         avgRating: (data.totalRating / data.count).toFixed(1) 
       }))
       .sort((a, b) => b.count - a.count)
       .slice(0, 5);
  }, [records]);

  // 4. Monthly Stats
  const monthlyData = useMemo(() => {
    const map = new Map<string, { count: number, spent: number }>();
    records.forEach(r => {
        const monthKey = r.date.substring(0, 7); // YYYY-MM
        const curr = map.get(monthKey) || { count: 0, spent: 0 };
        map.set(monthKey, { count: curr.count + 1, spent: curr.spent + r.price });
    });
    return Array.from(map.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  // 5. Quarterly Stats
  const quarterlyData = useMemo(() => {
    const map = new Map<string, { count: number, spent: number }>();
    records.forEach(r => {
        const date = new Date(r.date);
        const year = date.getFullYear();
        const q = Math.floor(date.getMonth() / 3) + 1;
        const key = `${year}-Q${q}`;
        const curr = map.get(key) || { count: 0, spent: 0 };
        map.set(key, { count: curr.count + 1, spent: curr.spent + r.price });
    });
    return Array.from(map.entries())
        .map(([quarter, data]) => ({ quarter, ...data }))
        .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [records]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
          <p className="text-slate-200 font-bold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
             <p key={idx} style={{ color: p.fill || p.stroke }} className="text-sm flex items-center gap-2">
               {p.dataKey === 'cups' || p.dataKey === 'count' ? <Coffee size={12}/> : <DollarSign size={12}/>}
               {p.name}: {p.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-amber-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">總花費</h3>
          <p className="text-3xl font-black text-amber-500">${totalSpent}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Crown className="w-12 h-12 text-amber-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">總杯數</h3>
          <p className="text-3xl font-black text-amber-500">{totalCups} <span className="text-sm text-slate-500">杯</span></p>
        </div>
      </div>
      
      {/* Group Members Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-800 p-2 rounded-full">
                  <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">目前群組 ({groupMembers.length}人)</h3>
              </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {groupMembers.map(member => (
                <div key={member} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    {member}
                </div>
            ))}
            {groupMembers.length === 0 && <span className="text-slate-600 text-sm">暫無成員</span>}
          </div>
      </div>

      {/* Monthly Stats (Dual Axis) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
           <Calendar className="w-5 h-5 text-amber-500" />
           月度趨勢 (Monthly)
        </h3>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm h-72">
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={monthlyData}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey="date" stroke={TEXT_COLOR} tick={{fill: TEXT_COLOR, fontSize: 10}} />
               <YAxis yAxisId="left" stroke="#F59E0B" tick={{fill: "#F59E0B", fontSize: 10}} label={{ value: '杯數', angle: -90, position: 'insideLeft', fill: '#F59E0B', fontSize: 10 }} />
               <YAxis yAxisId="right" orientation="right" stroke="#78350F" tick={{fill: "#A05520", fontSize: 10}} label={{ value: '金額', angle: 90, position: 'insideRight', fill: '#A05520', fontSize: 10 }} />
               <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
               <Legend verticalAlign="top" height={36}/>
               <Bar yAxisId="left" dataKey="count" name="杯數" fill="#F59E0B" barSize={20} radius={[4, 4, 0, 0]} />
               <Bar yAxisId="right" dataKey="spent" name="金額" fill="#78350F" barSize={20} radius={[4, 4, 0, 0]} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Stats (Dual Axis) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-amber-500" />
           季度統計 (Quarterly)
        </h3>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm h-72">
           <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={quarterlyData}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
               <XAxis dataKey="quarter" stroke={TEXT_COLOR} tick={{fill: TEXT_COLOR, fontSize: 10}} />
               <YAxis yAxisId="left" stroke="#D97706" tick={{fill: "#D97706", fontSize: 10}} label={{ value: '杯數', angle: -90, position: 'insideLeft', fill: '#D97706', fontSize: 10 }} />
               <YAxis yAxisId="right" orientation="right" stroke="#78350F" tick={{fill: "#A05520", fontSize: 10}} label={{ value: '金額', angle: 90, position: 'insideRight', fill: '#A05520', fontSize: 10 }} />
               <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
               <Legend verticalAlign="top" height={36}/>
               <Bar yAxisId="left" dataKey="count" name="杯數" fill="#D97706" barSize={30} radius={[4, 4, 0, 0]} />
               <Bar yAxisId="right" dataKey="spent" name="金額" fill="#78350F" barSize={30} radius={[4, 4, 0, 0]} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Friend Comparison Section with Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                好友戰力排行榜
            </h3>
            
            {/* Filter Dropdown */}
            <div className="relative">
                <select 
                    value={friendTimeFilter}
                    onChange={(e) => setFriendTimeFilter(e.target.value)}
                    className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-amber-500"
                >
                    {availableQuarters.map(q => <option key={q} value={q}>{q === 'All' ? '全部時間' : q}</option>)}
                </select>
                <Filter className="absolute right-2 top-2.5 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={friendData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                 <XAxis type="number" stroke={TEXT_COLOR} tick={{fill: TEXT_COLOR}} hide />
                 <YAxis type="category" dataKey="name" stroke={TEXT_COLOR} tick={{fill: TEXT_COLOR, fontSize: 12}} width={70} />
                 <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                 <Legend />
                 <Bar dataKey="cups" name="杯數" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                 <Bar dataKey="spent" name="金額" fill="#78350F" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           {friendData.length === 0 && <div className="text-center text-slate-500 text-xs mt-2">該時段無資料</div>}
        </div>
      </div>

      {/* Brand & Drink Rankings */}
      <div className="grid grid-cols-1 gap-8">
        {/* Top Drinks List */}
        <div>
           <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              年度熱門飲料 Top 5
           </h3>
           <div className="space-y-3">
             {topDrinks.map((drink, index) => (
               <div key={index} className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-black text-slate-900
                    ${index === 0 ? 'bg-amber-400 shadow-lg shadow-amber-400/20' : 
                      index === 1 ? 'bg-slate-300' : 
                      index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-200 text-sm">{drink.name}</p>
                    <p className="text-xs text-slate-500">平均評分: {drink.avgRating} ★</p>
                  </div>
                  <div className="text-right">
                     <span className="text-xl font-black text-amber-500">{drink.count}</span>
                     <span className="text-xs text-slate-500 block">杯</span>
                  </div>
               </div>
             ))}
             {topDrinks.length === 0 && <p className="text-slate-500 text-center">還沒有足夠的數據</p>}
           </div>
        </div>

        {/* Brand Chart */}
        <div>
           <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-amber-500" />
              品牌市佔率
           </h3>
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm h-72">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={brandData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={90}
                   paddingAngle={5}
                   dataKey="count"
                   nameKey="name"
                   stroke="none"
                   label={({ name, percent }: { name?: string | number; percent?: number }) => (percent || 0) > 0.1 ? String(name || '') : ''}
                   labelLine={false}
                 >
                   {brandData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;