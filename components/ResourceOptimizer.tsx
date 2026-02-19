
import React, { useState } from 'react';
import { Task, Resource } from '../types';
import { geminiService } from '../services/geminiService';
import { ICONS } from '../constants';

interface ResourceOptimizerProps {
  tasks: Task[];
  resources: Resource[];
}

const ResourceOptimizer: React.FC<ResourceOptimizerProps> = ({ tasks, resources }) => {
  const [optimizing, setOptimizing] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const calculateLoad = (resourceId: string) => {
    const activeTasks = tasks.filter(t => t.assigneeId === resourceId && t.status !== 'Done');
    return activeTasks.length * 10; // Simple mock calculation
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setAdvice(null);
    const result = await geminiService.optimizeResources(tasks, resources);
    setAdvice(result);
    setOptimizing(false);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">자원 최적화</h2>
          <p className="text-slate-500 text-[12px] font-medium mt-1">AI 기반의 업무 부하 분석으로 팀 효율성을 극대화합니다.</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50"
        >
          {optimizing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              분석 중...
            </>
          ) : (
            <>
              <ICONS.Sparkles className="w-5 h-5" />
              AI 업무 재배치 제안
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {resources.map(res => {
            const load = calculateLoad(res.id);
            const isOverloaded = load > res.capacity;
            return (
              <div key={res.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
                <div className="flex items-center gap-4 mb-6">
                  <img src={res.avatar} className="w-12 h-12 rounded-full border-2 border-slate-100" />
                  <div>
                    <div className="font-bold text-slate-800">{res.name}</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-tight">{res.role}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-slate-500 font-bold uppercase">주간 부하량</span>
                    <span className={`font-black ${isOverloaded ? 'text-red-500' : 'text-slate-800'}`}>{load} / {res.capacity}시간</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${isOverloaded ? 'bg-red-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min((load / res.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {advice ? (
            <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ICONS.Sparkles className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ICONS.Sparkles className="w-6 h-6 text-indigo-400" />
                Gemini 최적화 전략
              </h3>
              <div className="prose prose-invert prose-sm max-w-none space-y-4 text-indigo-100 leading-relaxed whitespace-pre-wrap">
                {advice}
              </div>
              <div className="mt-8 pt-8 border-t border-indigo-800 flex justify-end">
                <button className="px-4 py-2 bg-white text-indigo-900 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors">
                  권장 사항 적용하기
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ICONS.Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">분석 준비 완료</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                자원 최적화 버튼을 클릭하여 팀원 간의 업무 배분 인사이트를 확인하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceOptimizer;
