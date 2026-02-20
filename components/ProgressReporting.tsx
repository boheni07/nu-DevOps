import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Task, Resource, Project, WorkLog, PerformanceReport } from '../types';
import { ICONS } from '../constants';

interface ProgressReportingProps {
  tasks: Task[];
  resources: Resource[];
  projects: Project[];
  reports: PerformanceReport[];
  setReports: React.Dispatch<React.SetStateAction<PerformanceReport[]>>;
  currentUser: Resource | null;
}

const ProgressReporting: React.FC<ProgressReportingProps> = ({ tasks, resources, projects, reports, setReports, currentUser }) => {
  const location = useLocation();
  const [reportType, setReportType] = useState<'일간' | '주간' | '월간'>('주간');
  const [targetProject, setTargetProject] = useState<string>(projects[0]?.id || 'all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // New States for Generation Flow
  const [generatedReport, setGeneratedReport] = useState<PerformanceReport | null>(null);
  const [summary, setSummary] = useState('');
  const [showAggregation, setShowAggregation] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === '일간' || type === '주간' || type === '월간') {
      setReportType(type as any);
    }
  }, [location.search]);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const reportRange = useMemo(() => {
    const d = new Date(selectedDate);
    if (reportType === '일간') return { start: d, end: d };

    if (reportType === '주간') {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }

    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start, end };
  }, [reportType, selectedDate]);

  // 중복 체크 및 기존 리포트 검색
  const existingReport = useMemo(() => {
    const startStr = formatDate(reportRange.start);
    const endStr = formatDate(reportRange.end);
    return reports.find(r =>
      r.projectId === targetProject &&
      r.type === reportType &&
      r.startDate === startStr &&
      r.endDate === endStr &&
      r.reporterId === currentUser?.id
    );
  }, [reports, targetProject, reportType, reportRange, currentUser]);

  const handleManualGenerate = () => {
    if (existingReport) {
      setGeneratedReport(existingReport);
      setSummary(existingReport.summary);
      return;
    }

    const startStr = formatDate(reportRange.start);
    const endStr = formatDate(reportRange.end);

    const filteredTasks = targetProject === 'all'
      ? tasks
      : tasks.filter(t => t.projectId === targetProject);

    const logsWithTaskInfo: { task: Task; log: WorkLog }[] = [];
    filteredTasks.forEach(task => {
      task.workLogs?.forEach(log => {
        if (log.date >= startStr && log.date <= endStr) {
          logsWithTaskInfo.push({ task, log });
        }
      });
    });

    const newReport: PerformanceReport = {
      id: `rep-${Date.now()}`,
      projectId: targetProject,
      type: reportType,
      startDate: startStr,
      endDate: endStr,
      generatedAt: new Date().toISOString(),
      summary: '',
      tasks: filteredTasks,
      logs: logsWithTaskInfo,
      status: 'Draft',
      reporterId: currentUser?.id || 'unknown'
    };

    setGeneratedReport(newReport);
    setSummary('');
  };

  const handleSaveReport = (isSubmit: boolean = false) => {
    if (!generatedReport) return;

    const isUpdate = reports.some(r => r.id === generatedReport.id);
    const reportToSave: PerformanceReport = {
      ...generatedReport,
      summary,
      generatedAt: new Date().toISOString(),
      status: isSubmit ? 'Submitted' : generatedReport.status
    };

    if (isUpdate) {
      setReports(prev => prev.map(r => r.id === generatedReport.id ? reportToSave : r));
    } else {
      setReports(prev => [reportToSave, ...prev]);
    }

    setGeneratedReport(null);
    setSummary('');
  };

  const handleDeleteReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (window.confirm('이 리포트 기록을 정말 삭제하시겠습니까?')) {
      setReports(prev => prev.filter(r => r.id !== id));
      if (generatedReport?.id === id) {
        setGeneratedReport(null);
        setSummary('');
      }
    }
  };

  const activeTasksCount = useMemo(() => {
    if (!generatedReport) return 0;
    return new Set(generatedReport.logs.map(i => i.task.id)).size;
  }, [generatedReport]);

  // 취합 대상 보고서 (PM용)
  const pendingReports = useMemo(() => {
    if (currentUser?.classification !== 'Admin' && !projects.some(p => p.managerId === currentUser?.id)) return [];
    return reports.filter(r => r.status === 'Submitted');
  }, [reports, currentUser, projects]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">성과 리포트 및 업무보고</h2>
          <p className="text-sm font-bold text-slate-400">Project Performance Analysis & Reporting System</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingReports.length > 0 && (
            <button
              onClick={() => { setShowAggregation(!showAggregation); setGeneratedReport(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${showAggregation ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50'}`}
            >
              <ICONS.Notifications className="w-3.5 h-3.5" />
              보고서 취합 ({pendingReports.length})
            </button>
          )}
        </div>
      </div>

      {!showAggregation && !generatedReport && (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Report Type</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  {(['일간', '주간', '월간'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setReportType(type)}
                      className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all ${reportType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Project</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={targetProject}
                  onChange={(e) => setTargetProject(e.target.value)}
                >
                  <option value="all">모든 프로젝트</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button
                onClick={handleManualGenerate}
                className={`w-full py-3 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-[0.98] ${existingReport ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {existingReport ? `${reportType} 보고서 수정하기` : `${reportType} 리포트 생성하기`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['일간', '주간', '월간'] as const).map(type => {
              const typeReports = reports.filter(r => r.type === type && r.reporterId === currentUser?.id);
              return (
                <div key={type} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{type} 리포트 기록</h4>
                    <span className="text-[10px] font-bold text-slate-400">{typeReports.length}건</span>
                  </div>
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {typeReports.length > 0 ? (
                      typeReports.slice(0, 5).map(rep => (
                        <div
                          key={rep.id}
                          onClick={() => { setGeneratedReport(rep); setSummary(rep.summary); }}
                          className="p-4 hover:bg-slate-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-tighter ${rep.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                              rep.status === 'Submitted' ? 'bg-indigo-50 text-indigo-600' :
                                'bg-slate-100 text-slate-400'
                              }`}>
                              {rep.status === 'Approved' ? '승인' : rep.status === 'Submitted' ? '보고' : '임시'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                {rep.type === '일간' ? rep.startDate : `${rep.startDate} ~ ${rep.endDate}`}
                              </span>
                              {rep.status !== 'Approved' && (
                                <button
                                  onClick={(e) => handleDeleteReport(e, rep.id)}
                                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                  title="삭제"
                                >
                                  <ICONS.Trash className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-[13px] font-black text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                            {projects.find(p => p.id === rep.projectId)?.name || '전체 프로젝트'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1.5 truncate italic leading-relaxed">
                            {rep.summary || '종합 의견 없음'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">기록 없음</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAggregation ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4">PM 보고서 취합 관리</h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50/50 border-b border-rose-100">
                  <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">보고자</th>
                  <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">구분/프로젝트</th>
                  <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">기간</th>
                  <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest">종합 의견 요약</th>
                  <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">승인</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingReports.length > 0 ? pendingReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-slate-800">{resources.find(r => r.id === rep.reporterId)?.name || '알수없음'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-rose-500 uppercase">{rep.type}</span>
                        <span className="text-xs font-bold text-slate-600">{projects.find(p => p.id === rep.projectId)?.name || '전체'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] text-slate-500 font-bold">{rep.startDate} ~ {rep.endDate}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] text-slate-500 max-w-xs truncate italic">{rep.summary}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => setReports(prev => prev.map(r => r.id === rep.id ? { ...r, status: 'Approved' } : r))}
                        className="px-4 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-lg hover:bg-rose-600 transition-all shadow-md shadow-rose-100"
                      >
                        최종 승인
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-300 font-black text-sm uppercase tracking-widest">취합할 보고서가 없습니다.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : generatedReport ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col justify-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Analysis Period</div>
              <div className="text-xl font-black text-slate-800">{generatedReport.startDate} — {generatedReport.endDate}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50/50 rounded-[1.5rem] p-6 text-center">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Engaged Tasks</div>
                <div className="text-2xl font-black text-indigo-600">{activeTasksCount}</div>
              </div>
              <div className="bg-slate-50 rounded-[1.5rem] p-6 text-center text-slate-600">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Work Logs</div>
                <div className="text-2xl font-black">{generatedReport.logs.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-1">종합 의견 및 업무보고</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Executive Summary & Review</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGeneratedReport(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 font-black rounded-xl text-xs hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                >
                  이력으로 가기
                </button>
                {generatedReport.status !== 'Approved' && (
                  <>
                    <button
                      onClick={() => handleSaveReport(false)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-xs hover:bg-slate-50 transition-all shadow-sm"
                    >
                      {generatedReport.status === 'Draft' ? '임시 저장' : '수정 저장'}
                    </button>
                    <button
                      onClick={() => handleSaveReport(true)}
                      className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <ICONS.Send className="w-3.5 h-3.5" />
                      {generatedReport.status === 'Submitted' ? '보고 업데이트' : '보고하기 (Submit)'}
                    </button>
                  </>
                )}
                {generatedReport.status === 'Approved' && (
                  <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">최종 승인 완료 (수정 불가)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-slate-50/30">
              <textarea
                className={`w-full h-40 border border-slate-200 rounded-3xl p-6 text-sm font-medium text-slate-700 outline-none transition-all resize-none shadow-inner leading-relaxed ${generatedReport.status !== 'Approved'
                  ? 'bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                placeholder="이번 차수 업무 수행 성과에 대한 종합 의견을 작성하세요..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={generatedReport.status === 'Approved'}
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">주요 업무 수행 내역 (Simple Table)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">날짜</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">일감명</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">수행 내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {generatedReport.logs.length > 0 ? (
                    generatedReport.logs.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4 text-[11px] font-bold text-slate-500 tabular-nums">{item.log.date}</td>
                        <td className="px-8 py-4">
                          <div className="text-xs font-black text-slate-800">{item.task.title}</div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="text-[11px] text-slate-600 leading-relaxed">{item.log.content}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-10 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">해당 기간의 업무 수행 기록이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-100 border border-slate-50 ring-8 ring-slate-50/50">
            <ICONS.Resource className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black tracking-tight mb-2 text-slate-500">리포트 조건 선택</h3>
          <p className="text-xs font-bold text-slate-400">조회할 기간과 프로젝트를 선택하여 보고서를 생성하세요.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressReporting;
