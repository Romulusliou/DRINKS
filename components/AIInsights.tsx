import React, { useState } from 'react';
import { DrinkRecord, AIAnalysisResult } from '../types';
import { analyzeDrinks } from '../services/geminiService';
import { Sparkles, Trophy, TrendingUp, HeartPulse } from 'lucide-react';

interface AIInsightsProps {
  records: DrinkRecord[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ records }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (records.length < 3) {
      setError("請至少記錄 3 杯飲料才能進行分析！");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDrinks(records);
      setAnalysis(result);
    } catch (err) {
      setError("AI 分析失敗，請稍後再試 (可能 API Key 超過額度或無效)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`
            w-full py-4 px-6 rounded-2xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 transition-all border
            ${loading 
              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-500 text-white hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'}
          `}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Gemini 正在品茶分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              生成 2026 年度飲料報告
            </>
          )}
        </button>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Card */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 border-l-4 border-l-indigo-500">
            <h3 className="font-bold text-lg text-indigo-400 flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              群組喝茶習慣總結
            </h3>
            <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.awards.map((award, idx) => (
              <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-amber-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-500">{award.title}</span>
                </div>
                <div className="text-2xl font-black text-slate-100 mb-1 relative z-10">{award.recipient}</div>
                <p className="text-sm text-slate-400 relative z-10">{award.description}</p>
              </div>
            ))}
          </div>

          {/* Prediction & Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-900/30">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2">
                <HeartPulse className="w-5 h-5" /> 健康小貼士
              </h4>
              <p className="text-emerald-100/80 text-sm">{analysis.healthTip}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-purple-900/30">
              <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" /> 下一杯趨勢預測
              </h4>
              <p className="text-purple-100/80 text-sm">{analysis.predictedTrend}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;