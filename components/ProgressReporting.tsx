
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Task, Resource, Project } from '../types';
import { geminiService } from '../services/geminiService';
import { ICONS } from '../constants';

interface ProgressReportingProps {
  tasks: Task[];
  resources: Resource[];
  projects: Project[];
}

const ProgressReporting: React.FC<ProgressReportingProps> = ({ tasks, resources, projects }) => {
  const location = useLocation();
  const [reportType, setReportType] = useState<'일간' | '주간' | '월간'>('주간');
  const [targetProject, setTargetProject] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === '일간' || type === '주간' || type === '월간') {
      setReportType(type as any);
      setReportContent(null);
    }
  }, [location.search]);

  const handleGenerate = async () => {
    setLoading(true);
    // 선택된 프로젝트에 따라 필터링된 태스크 전달
    const targetTasks = targetProject === 'all' ? tasks : tasks.filter(t => t.projectId === targetProject);
    const content = await geminiService.generateProgressReport(targetTasks, resources);
    setReportContent(content || "보고서 생성에 실패했습니다.");
    setLoading(false);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">지능형 성과 리포트</h2>
          <p className="text-slate-500 mt-2">나의 모든 프로젝트 업무를 분석하여 전문적인 보고서를 자동 생성합니다.</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {(['일간', '주간', '월간'] as const).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${reportType === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
            value={targetProject}
            onChange={(e) => setTargetProject(e.target.value)}
          >
            <option value="all">모든 프로젝트 통합 리포트</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} 단독 리포트</option>
            ))}
          </select>
        </div>
      </div>

      {!reportContent && !loading && (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-8 rotate-3">
            <ICONS.Resource className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{reportType} 성과 리포트 생성</h3>
          <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
            AI 엔진이 {targetProject === 'all' ? '전체 프로젝트' : '선택된 프로젝트'}의 수행 실적과 진행률을 분석하여 보고서를 작성합니다.
          </p>
          <button
            onClick={handleGenerate}
            className="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100/50 transition-all active:scale-[0.98]"
          >
            리포트 생성 시작
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-lg font-bold text-slate-800">전역 데이터 분석 및 합성 중...</h3>
          <p className="text-slate-400 text-sm mt-2">수행한 업무의 가중치를 분석하고 병목 요인을 식별하고 있습니다.</p>
        </div>
      )}

      {reportContent && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
            <div>
              <div className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{reportType} 리포트 (종합)</div>
              <h3 className="text-lg font-bold text-slate-800">MY_PERFORMANCE_REPORT_{new Date().toISOString().split('T')[0]}.pdf</h3>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReportContent(null)} className="p-2 text-slate-400 hover:text-slate-600">다시 생성</button>
              <button className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs active:scale-[0.98]">PDF 내보내기</button>
            </div>
          </div>
          <div className="p-12 prose prose-slate max-w-none">
            {reportContent.split('\n').map((para, i) => (
              para.trim() ? (
                para.startsWith('#') ? <h3 key={i} className="text-xl font-bold text-indigo-900 mt-6 mb-4">{para.replace(/#/g, '').trim()}</h3> :
                  para.startsWith('-') || para.startsWith('*') ? <li key={i} className="ml-4 mb-2 text-slate-600">{para.substring(1).trim()}</li> :
                    <p key={i} className="mb-4 text-slate-600 leading-relaxed">{para}</p>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReporting;
