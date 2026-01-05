import React, { useMemo } from 'react';
import { DrinkRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Trophy, Crown, TrendingUp, Users } from 'lucide-react';

interface StatsOverviewProps {
  records: DrinkRecord[];
}

// Dark Mode Palette
const COLORS = ['#F59E0B', '#D97706', '#92400E', '#78350F', '#451A03', '#334155'];
const TEXT_COLOR = '#94a3b8'; // Slate 400

const StatsOverview: React.FC<StatsOverviewProps> = ({ records }) => {
  
  const totalSpent = useMemo(() => records.reduce((acc, curr) => acc + curr.price, 0), [records]);
  const totalCups = records.length;
  
  // 1. Friend Comparison (Leaderboard)
  const friendData = useMemo(() => {
    const map = new Map<string, { cups: number; spent: number }>();
    records.forEach(r => {
      const current = map.get(r.drinkerName) || { cups: 0, spent: 0 };
      map.set(r.drinkerName, {
        cups: current.cups + 1,
        spent: current.spent + r.price
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.cups - a.cups); // Default sort by cups
  }, [records]);

  // 2. Brand Rankings
  const brandData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach(r => {
      map.set(r.brand, (map.get(r.brand) || 0) + 1);
    });
    // Top 5 brands
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [records]);

  // 3. Top Drinks (Specific Items)
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-200 font-bold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
             <p key={idx} style={{ color: p.fill }} className="text-sm">
               {p.name === 'cups' ? '杯數' : p.name === 'spent' ? '金額' : p.name === 'count' ? '數量' : p.name}: {p.value}
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

      {/* Friend Comparison Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
           <Users className="w-5 h-5 text-amber-500" />
           好友戰力排行榜
        </h3>
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
                   label={({ name, percent }) => percent > 0.1 ? name : ''}
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