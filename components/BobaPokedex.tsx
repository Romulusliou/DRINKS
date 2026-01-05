import React, { useState, useMemo } from 'react';
import { DrinkRecord } from '../types';
import DrinkAvatar from './DrinkAvatar';
import { Star, Search, Filter } from 'lucide-react';

interface BobaPokedexProps {
  records: DrinkRecord[];
}

const BobaPokedex: React.FC<BobaPokedexProps> = ({ records }) => {
  const [filter, setFilter] = useState('');
  const [showOnlyHallOfFame, setShowOnlyHallOfFame] = useState(false);

  // Group by Brand + DrinkName to create unique collection items
  const collection = useMemo(() => {
    const map = new Map<string, {
      brand: string;
      drinkName: string;
      bestRating: number;
      totalCount: number;
      avgPrice: number;
      lastConfig: string;
    }>();

    records.forEach(r => {
      const key = `${r.brand}-${r.drinkName}`;
      const existing = map.get(key);
      if (!existing || r.rating > existing.bestRating) {
        map.set(key, {
          brand: r.brand,
          drinkName: r.drinkName,
          bestRating: Math.max(existing?.bestRating || 0, r.rating),
          totalCount: (existing?.totalCount || 0) + 1,
          avgPrice: r.price, 
          lastConfig: `${r.sugarLevel} / ${r.iceLevel}`
        });
      } else if (existing) {
        existing.totalCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.bestRating - a.bestRating);
  }, [records]);

  const filteredCollection = collection.filter(item => {
    const matchesSearch = item.brand.includes(filter) || item.drinkName.includes(filter);
    const matchesHall = showOnlyHallOfFame ? item.bestRating === 5 : true;
    return matchesSearch && matchesHall;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="space-y-4 sticky top-0 bg-slate-950/90 backdrop-blur-md z-30 py-2 border-b border-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="搜尋品牌或品項..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 p-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-amber-500 outline-none text-sm transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowOnlyHallOfFame(!showOnlyHallOfFame)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
              showOnlyHallOfFame ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyHallOfFame ? 'fill-amber-500' : ''}`} />
            五星殿堂
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredCollection.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center relative overflow-hidden group hover:border-slate-700 transition-colors">
            {item.bestRating === 5 && (
              <div className="absolute top-0 right-0 p-1.5 bg-amber-500 rounded-bl-lg shadow-sm">
                <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
              </div>
            )}
            
            <DrinkAvatar name={item.drinkName} size="md" hasToppings={item.totalCount > 2} />
            
            <div className="mt-3 text-center w-full">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{item.brand}</p>
              <h4 className="text-sm font-bold text-slate-200 truncate">{item.drinkName}</h4>
              <div className="flex justify-center gap-0.5 mt-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-2.5 h-2.5 ${i < item.bestRating ? 'fill-amber-500 text-amber-500' : 'text-slate-700'}`} />
                 ))}
              </div>
              <p className="text-[9px] text-slate-600 mt-2">累計飲用 {item.totalCount} 次</p>
            </div>
          </div>
        ))}
        {filteredCollection.length === 0 && (
          <div className="col-span-2 py-20 text-center text-slate-600">
            還沒有符合的收藏紀錄喔！
          </div>
        )}
      </div>
    </div>
  );
};

export default BobaPokedex;