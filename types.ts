
export interface DrinkRecord {
  id: string;
  drinkerName: string;
  brand: string;
  drinkName: string;
  sugarLevel: string; // e.g., "5 分糖"
  sugarValue: number; // 0-10 for calculations
  iceLevel: string;
  toppings?: string;
  review?: string;
  price: number;
  rating: number;
  date: string;
  timestamp: number;
}

export interface UserConfig {
  nickname: string;
  monthlyBudget?: number;
  monthlyCupLimit?: number;
}

export interface Achievement {
  id: string;
  category: string; // 大分類
  subCategory: string; // 子分類
  title: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'diamond' | 'locked';
  icon: string;
  progress: number;
  targets: [number, number, number, number]; // [Bronze, Silver, Gold, Diamond]
}

export enum IceLevel {
  Regular = "正常冰",
  Less = "少冰",
  Half = "半冰",
  Micro = "微冰",
  NoIce = "去冰",
  Hot = "熱"
}

export interface AIAnalysisResult {
  summary: string;
  healthTip: string;
  awards: {
    title: string;
    recipient: string;
    description: string;
  }[];
  predictedTrend: string;
}

export const TAIPEI_BRANDS = [
  "50嵐", "可不可熟成紅茶", "得正 OOLONG", "一沐日", "麻古茶坊", 
  "迷客夏 Milksha", "五桐號", "龜記茗品", "鶴茶樓", "SOMA", 
  "約翰紅茶公司", "珍煮丹", "萬波", "清心福全", "烏弄", 
  "COMEBUY", "茶の魔手", "大茗本位製茶堂", "八曜和茶", "其他 (自訂)"
];

export const COMMON_TOPPINGS = ["珍珠", "波霸", "椰果", "粉粿", "芋圓", "茶凍", "杏仁凍", "奶蓋"];
