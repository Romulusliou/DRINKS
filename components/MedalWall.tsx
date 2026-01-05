
import React, { useMemo, useState } from 'react';
import { DrinkRecord } from '../types';
import { 
  Trophy, Zap, Flame, Heart, Wallet, Clock, MapPin, 
  Coffee, Droplets, Utensils, Activity, Calendar, Star,
  Search, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

interface MedalWallProps {
  records: DrinkRecord[];
}

const CATEGORIES = {
  TEA: "茶道本源",
  MILK: "乳製品",
  TOPPING: "特調咀嚼",
  EXTREME: "行為極限",
  MILESTONE: "生涯里程"
};

const MedalWall: React.FC<MedalWallProps> = ({ records }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(CATEGORIES.TEA);

  const stats = useMemo(() => {
    // Helper: Check keywords in drinkName or brand
    const has = (r: DrinkRecord, keywords: string[]) => 
      keywords.some(k => r.drinkName.includes(k) || r.brand.includes(k) || (r.toppings && r.toppings.includes(k)));

    // Helper: Calculate Max Consecutive Days
    // FIX: Use type assertion to resolve 'unknown[]' assignment error from Array.from in some environments
    const dates: string[] = Array.from(new Set(records.map(r => r.date))).sort() as string[];
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    if (dates.length > 0) {
      currentConsecutive = 1;
      maxConsecutive = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i-1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentConsecutive++;
        } else {
          currentConsecutive = 1;
        }
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      }
    }

    const uniqueBrands = new Set(records.map(r => r.brand)).size;
    const maxPrice = records.length > 0 ? Math.max(...records.map(r => r.price)) : 0;
    const totalSpent = records.reduce((acc, r) => acc + r.price, 0);

    return {
      // 01-05 Tea
      pureUnsweetened: records.filter(r => r.sugarValue === 0 && !has(r, ['奶', '拿鐵', '歐蕾', '多多', '優格', '果'])).length,
      blackTea: records.filter(r => has(r, ['紅', '錫蘭', '伯爵', '阿薩姆', '肯亞'])).length,
      greenTea: records.filter(r => has(r, ['綠', '青', '翡翠', '四季春', '包種', '碧螺春'])).length,
      oolongTea: records.filter(r => has(r, ['烏龍', '鐵觀音', '炭焙', '凍頂', '金萱'])).length,
      japaneseTea: records.filter(r => has(r, ['抹茶', '焙茶', '烤茶', '玄米'])).length,
      
      // 07-11 Milk
      freshMilk: records.filter(r => has(r, ['鮮奶', '拿鐵', '歐蕾', '牛乳', '鮮乳'])).length,
      creamerMilk: records.filter(r => has(r, ['奶茶', '奶精']) && !has(r, ['鮮奶', '拿鐵', '歐蕾', '牛乳'])).length,
      milkFoam: records.filter(r => has(r, ['奶蓋', '瑪奇朵', '雲朵'])).length,
      brownSugar: records.filter(r => has(r, ['黑糖'])).length,
      yogurt: records.filter(r => has(r, ['多多', '優格', '養樂多', '益生菌'])).length,

      // 12-16 Topping
      pearls: records.filter(r => has(r, ['珍珠', '波幫', '波霸', '圓'])).length,
      fruit: records.filter(r => has(r, ['果', '檸檬', '柚', '莓', '橙', '金桔', '百香'])).length,
      multiToppings: records.filter(r => (r.toppings?.split(',').length || 0) >= 3 || has(r, ['三兄弟', '雙響', '全家福', '八寶'])).length,
      smoothie: records.filter(r => has(r, ['冰沙', '雪泥', '酷繽沙'])).length,
      sparkling: records.filter(r => has(r, ['氣泡', '蘇打', '碳酸', '沙士'])).length,

      // 17-22 Limits
      fullSugar: records.filter(r => r.sugarValue >= 10).length,
      zeroSugar: records.filter(r => r.sugarValue === 0).length,
      caffeine: records.filter(r => has(r, ['咖啡', '濃縮', '美式', '拿鐵', '卡布'])).length,
      highPriceCount: records.filter(r => r.price >= 100).length,

      // 23-27 Milestones
      totalCups: records.length,
      brandCount: uniqueBrands,
      maxPrice: maxPrice,
      totalSpent: totalSpent,
      consecutiveDays: maxConsecutive
    };
  }, [records]);

  const achievementList = useMemo(() => {
    const define = (id: string, cat: string, sub: string, title: string, desc: string, icon: any, progress: number, targets: [number, number, number, number]) => {
      let level: any = 'locked';
      const titles = title.split(' / ');
      let currentTitle = titles[0];
      
      if (progress >= targets[3]) { level = 'diamond'; currentTitle = titles[3]; }
      else if (progress >= targets[2]) { level = 'gold'; currentTitle = titles[2]; }
      else if (progress >= targets[1]) { level = 'silver'; currentTitle = titles[1]; }
      else if (progress >= targets[0]) { level = 'bronze'; currentTitle = titles[0]; }

      return { id, category: cat, subCategory: sub, title: currentTitle, description: desc, icon, progress, targets, level };
    };

    return [
      // TEA
      define('01', CATEGORIES.TEA, '純茶鑑賞', '找茶新手 / 回甘行家 / 一心二葉 / 神農氏轉世', '無糖純茶款', 'Droplets', stats.pureUnsweetened, [5, 15, 30, 50]),
      define('02', CATEGORIES.TEA, '紅茶專精', '錫蘭學徒 / 伯爵旅人 / 阿薩姆領主 / 紅寶石大公', '紅茶系飲品', 'Heart', stats.blackTea, [5, 15, 30, 50]),
      define('03', CATEGORIES.TEA, '綠青專精', '採茶郎 / 高山隱士 / 翡翠茶師 / 茶道・無我', '綠茶或青茶', 'Zap', stats.greenTea, [5, 15, 30, 50]),
      define('04', CATEGORIES.TEA, '烏龍世家', '炭焙見習 / 凍頂遊俠 / 鐵觀音護法 / 龍之呼吸', '烏龍茶系', 'Flame', stats.oolongTea, [5, 15, 30, 50]),
      define('05', CATEGORIES.TEA, '抹茶焙茶', '抹味初心者 / 京都旅人 / 茶道宗匠 / 利休再世', '日式茶系', 'Activity', stats.japaneseTea, [5, 15, 30, 50]),

      // MILK
      define('07', CATEGORIES.MILK, '鮮奶茶系', '拿鐵愛好者 / 牧場貴賓 / 厚乳鑑賞家 / 乳牛守護神', '鮮奶茶系列', 'Droplets', stats.freshMilk, [5, 15, 30, 50]),
      define('08', CATEGORIES.MILK, '奶精奶茶', '童年回憶 / 濃郁信徒 / 絲滑大師 / 化工煉金術士', '傳統奶精茶', 'Coffee', stats.creamerMilk, [5, 15, 30, 50]),
      define('09', CATEGORIES.MILK, '奶蓋系列', '鬍子小丑 / 鹹甜雙刀流 / 雲朵漫步者 / 白雲之上的王者', '奶蓋飲品', 'Zap', stats.milkFoam, [5, 15, 30, 50]),
      define('10', CATEGORIES.MILK, '黑糖鮮奶', '虎紋獵人 / 焦香狂熱者 / 炒糖職人 / 闇黑甜蜜領主', '黑糖鮮奶系', 'Star', stats.brownSugar, [5, 15, 30, 50]),
      define('11', CATEGORIES.MILK, '益生多多', '益生菌戰士 / 酸甜平衡者 / 腸道清道夫 / 活性乳酸菌之父', '乳酸飲品', 'Activity', stats.yogurt, [5, 15, 30, 50]),

      // TOPPING
      define('12', CATEGORIES.TOPPING, '珍珠狂熱', 'Q彈見習 / 波霸獵手 / 澱粉魔導士 / 咀嚼肌破壞神', '加珍珠飲品', 'Utensils', stats.pearls, [5, 15, 30, 50]),
      define('13', CATEGORIES.TOPPING, '水果特調', '果園觀光客 / 維他命信徒 / 鮮果鍊金師 / 豐饒之神', '水果飲品', 'Star', stats.fruit, [5, 15, 30, 50]),
      define('14', CATEGORIES.TOPPING, '配料全加', '八寶粥大師 / 飽足感戰士 / 下顎鍛鍊者 / 深不見底的胃', '多料飲品', 'Utensils', stats.multiToppings, [5, 15, 30, 50]),
      define('15', CATEGORIES.TOPPING, '冰沙凍飲', '腦袋凍結 / 碎冰舞者 / 極地探險家 / 絕對零度', '冰沙類', 'Zap', stats.smoothie, [5, 15, 30, 50]),
      define('16', CATEGORIES.TOPPING, '氣泡蘇打', '碳酸氣泡 / 爽快打嗝者 / 刺激追求者 / 氣體操控者', '氣泡類飲品', 'Droplets', stats.sparkling, [5, 15, 30, 50]),

      // EXTREME
      define('17', CATEGORIES.EXTREME, '全糖戰士', '甜蜜初心者 / 胰島素挑戰者 / 糖分聚合體 / 甜心教主(物理)', '全糖挑戰', 'Flame', stats.fullSugar, [5, 15, 30, 50]),
      define('18', CATEGORIES.EXTREME, '無糖苦行', '養生入門 / 禁慾修行者 / 原味覺醒 / 超脫世俗的舌頭', '無糖修行', 'Heart', stats.zeroSugar, [5, 15, 30, 50]),
      define('21', CATEGORIES.EXTREME, '咖啡因中毒', '提神戰士 / 心悸邊緣 / 濃縮血液 / 不眠的守夜人', '含咖啡因飲品', 'Coffee', stats.caffeine, [5, 15, 30, 50]),
      define('22', CATEGORIES.EXTREME, '高價嗜好', '揮霍者 / 錢包瘦身家 / 頂級VIP / 飲料界的石油王', '單價破百', 'Wallet', stats.highPriceCount, [5, 15, 30, 50]),

      // MILESTONE
      define('23', CATEGORIES.MILESTONE, '生涯總量', '飲品愛好者 / 人形儲水槽 / 千杯不醉 / 人體水庫', '累積總杯數', 'Trophy', stats.totalCups, [100, 500, 1000, 5000]),
      define('24', CATEGORIES.MILESTONE, '店家地圖', '街坊鄰居 / 手搖探險家 / 飲料界哥倫布 / 全台制霸', '累積品牌數', 'MapPin', stats.brandCount, [10, 30, 60, 100]),
      define('25', CATEGORIES.MILESTONE, '單價極限', '小確幸 / 犒賞自己 / 財富自由 / 飲品界的愛馬仕', '單杯最高金額', 'Wallet', stats.maxPrice, [80, 120, 180, 250]),
      define('26', CATEGORIES.MILESTONE, '總花費', '銅板戶 / 黃金股東 / 飲料乾爹 / 百萬富糖', '總累積金額', 'Star', stats.totalSpent, [5000, 20000, 100000, 500000]),
      define('27', CATEGORIES.MILESTONE, '連續天數', '一週茶 / 月費會員 / 百日築基 / 永動機', '連續飲用天數', 'Calendar', stats.consecutiveDays, [7, 30, 100, 365]),
    ];
  }, [stats, records]);

  const getIcon = (iconName: string, className: string) => {
    const props = { className };
    switch (iconName) {
      case 'Droplets': return <Droplets {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Activity': return <Activity {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'Wallet': return <Wallet {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      default: return <Star {...props} />;
    }
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'diamond': return 'border-cyan-400 text-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
      case 'gold': return 'border-amber-400 text-amber-400 bg-amber-400/5 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
      case 'silver': return 'border-slate-300 text-slate-300 bg-slate-300/5';
      case 'bronze': return 'border-orange-700 text-orange-700 bg-orange-700/5';
      // 優化「鎖定」狀態的視覺可見度：將文字設為較亮的灰色，背景加入微量對比
      default: return 'border-slate-800 text-slate-400 bg-slate-800/20';
    }
  };

  const renderAchievement = (ach: any) => {
    const nextTarget = ach.targets.find((t: number) => ach.progress < t) || ach.targets[3];
    const progressPercent = Math.min(100, (ach.progress / nextTarget) * 100);

    return (
      <div 
        key={ach.id} 
        className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center ${getLevelStyle(ach.level)}`}
      >
        <div className="mb-2 p-2 bg-slate-950 rounded-xl">
          {/* 鎖定時圖示顏色也設為可見的 slate-600 */}
          {getIcon(ach.icon, ach.level === 'locked' ? 'text-slate-600' : 'text-current')}
        </div>
        <div className="flex flex-col gap-0.5 w-full">
          <div className="flex items-center justify-center gap-1">
             {ach.level === 'diamond' && <span className="text-[10px] bg-cyan-500 text-slate-900 px-1 rounded font-black">DIAMOND</span>}
             <h4 className="text-xs font-black truncate">{ach.title}</h4>
          </div>
          <p className="text-[9px] opacity-60 leading-tight h-6 flex items-center justify-center">{ach.subCategory}</p>
        </div>
        
        <div className="w-full mt-3">
          <div className="flex justify-between text-[8px] mb-1 font-mono uppercase tracking-tighter">
            <span>Progress</span>
            <span>{ach.progress} / {nextTarget}</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${ach.level === 'locked' ? 'bg-slate-700' : 'bg-current'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {Object.values(CATEGORIES).map(cat => (
        <div key={cat} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          <button 
            onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950 rounded-lg">
                <Trophy className={`w-4 h-4 ${expandedCategory === cat ? 'text-amber-500' : 'text-slate-500'}`} />
              </div>
              <span className={`text-sm font-bold ${expandedCategory === cat ? 'text-slate-100' : 'text-slate-400'}`}>{cat}</span>
            </div>
            {expandedCategory === cat ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {expandedCategory === cat && (
            <div className="p-4 pt-0 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {achievementList.filter(a => a.category === cat).map(renderAchievement)}
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="text-xs text-slate-500 font-bold">總成就進度</div>
        <div className="text-sm font-black text-amber-500">
          {achievementList.filter(a => a.level !== 'locked').length} / {achievementList.length}
        </div>
      </div>
    </div>
  );
};

export default MedalWall;
