
import React, { useMemo, useState } from 'react';
import { Task, Resource, Status, Project, WorkLog } from '../types';
import { ICONS } from '../constants';

interface MyTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: Resource;
  projects: Project[];
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, setTasks, currentUser, projects }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Work Log State
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logContent, setLogContent] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogContent, setEditLogContent] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // 권한 체크: 관리자거나 PM 역할을 가진 경우에만 계획 일정 수정 가능
  const canEditPlanned = useMemo(() => {
    return currentUser.classification === 'Admin' || 
           currentUser.role.toUpperCase().includes('PM') || 
           currentUser.role.toUpperCase().includes('MANAGER');
  }, [currentUser]);

  const myTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.assigneeId === currentUser.id);
    if (projectFilter !== 'all') filtered = filtered.filter(t => t.projectId === projectFilter);
    return filtered;
  }, [tasks, currentUser.id, projectFilter]);

  const handleUpdateStatus = (taskId: string, targetColId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (targetColId === 'done') return { ...t, status: 'Done', progress: 100, actualEndDate: t.actualEndDate || todayStr };
        if (targetColId === 'inprogress') return { ...t, status: 'In Progress', progress: Math.max(t.progress, 10), actualStartDate: t.actualStartDate || todayStr };
        return { ...t, status: 'To Do', progress: 0, actualStartDate: undefined, actualEndDate: undefined };
      }
      return t;
    }));
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  const setActualNow = (type: 'start' | 'end') => {
    if (!selectedTask) return;
    const update: Partial<Task> = {};
    
    if (type === 'start') {
      update.actualStartDate = todayStr;
      if (selectedTask.status === 'To Do' || selectedTask.status === 'Start Delayed') {
        update.status = 'In Progress';
        update.progress = Math.max(selectedTask.progress, 10);
      }
    } else {
      update.actualEndDate = todayStr;
      update.status = 'Done';
      update.progress = 100;
    }
    
    const newTask = { ...selectedTask, ...update };
    setSelectedTask(newTask);
    setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
  };

  const updateTaskDate = (field: keyof Task, value: string) => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, [field]: value || undefined };
    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  // 날짜별 중복 체크 (업무일지는 날짜별 1개만 등록 가능)
  const isDateAlreadyLogged = useMemo(() => {
    return selectedTask?.workLogs?.some(log => log.date === logDate);
  }, [selectedTask?.workLogs, logDate]);

  const addWorkLog = () => {
    if (!selectedTask || !logContent.trim() || !selectedTask.actualStartDate || isDateAlreadyLogged) return;
    const newLog: WorkLog = {
      id: `log-${Date.now()}`,
      date: logDate,
      content: logContent.trim()
    };
    const updatedLogs = [...(selectedTask.workLogs || []), newLog];
    const newTask = { ...selectedTask, workLogs: updatedLogs };
    setSelectedTask(newTask);
    setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
    setLogContent('');
  };

  const deleteWorkLog = (logId: string) => {
    if (!selectedTask) return;
    const updatedLogs = (selectedTask.workLogs || []).filter(l => l.id !== logId);
    const newTask = { ...selectedTask, workLogs: updatedLogs };
    setSelectedTask(newTask);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? newTask : t));
  };

  const startEditLog = (log: WorkLog) => {
    setEditingLogId(log.id);
    setEditLogContent(log.content);
  };

  const saveEditLog = () => {
    if (!selectedTask || editingLogId === null) return;
    const updatedLogs = (selectedTask.workLogs || []).map(l => 
      l.id === editingLogId ? { ...l, content: editLogContent } : l
    );
    const newTask = { ...selectedTask, workLogs: updatedLogs };
    setSelectedTask(newTask);
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? newTask : t));
    setEditingLogId(null);
  };

  const sortedWorkLogs = useMemo(() => {
    if (!selectedTask?.workLogs) return [];
    // 최신 날짜가 위로 오도록 역순 정렬
    return [...selectedTask.workLogs].sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedTask?.workLogs]);

  const columns = [
    { id: 'todo', title: 'BACKLOG', statuses: ['To Do', 'Start Delayed'], color: 'bg-slate-400', accent: 'border-slate-200' },
    { id: 'inprogress', title: 'IN PROGRESS', statuses: ['In Progress', 'End Delayed', 'Review', 'Blocked'], color: 'bg-indigo-600', accent: 'border-indigo-200' },
    { id: 'done', title: 'COMPLETED', statuses: ['Done'], color: 'bg-emerald-500', accent: 'border-emerald-200' }
  ];

  return (
    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-500 overflow-hidden relative">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">내 업무 보드</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Real-time Task Execution</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-black text-slate-600 outline-none shadow-sm focus:border-indigo-500 transition-all cursor-pointer"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">전체 프로젝트</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden">
        {columns.map(col => {
          const colTasks = myTasks.filter(t => col.statuses.includes(t.status));
          const isOver = dragOverColumn === col.id;
          
          return (
            <div 
              key={col.id} 
              onDragOver={e => e.preventDefault()}
              onDragEnter={() => setDragOverColumn(col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => draggedTaskId && handleUpdateStatus(draggedTaskId, col.id)}
              className={`flex flex-col rounded-[2rem] border-2 p-4 transition-all duration-300 ${
                isOver ? `bg-indigo-50/40 ${col.accent} scale-[1.01]` : 'bg-slate-100/40 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                    <h3 className="text-[10px] font-black text-slate-500 tracking-[0.15em] uppercase">{col.title}</h3>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-lg border border-slate-100 text-slate-400">{colTasks.length}</span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {colTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  const isBeingDragged = draggedTaskId === task.id;
                  const isSelected = selectedTask?.id === task.id;
                  
                  return (
                    <div 
                      key={task.id} 
                      draggable 
                      onDragStart={() => setDraggedTaskId(task.id)}
                      onDragEnd={() => { setDraggedTaskId(null); setDragOverColumn(null); }}
                      onClick={() => { setSelectedTask({...task}); setLogDate(todayStr); }}
                      className={`group relative bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer active:cursor-grabbing ${
                        isBeingDragged ? 'opacity-20 shadow-none border-slate-100' : 
                        isSelected ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-50' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-300'
                      }`}
                    >
                      <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl transition-colors ${task.status.includes('Delayed') ? 'bg-red-500' : col.color}`}></div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50"></span>
                          {project?.name || task.projectId}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 tabular-nums">{task.endDate}</span>
                      </div>

                      <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-4 line-clamp-2">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                         <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-700">{task.progress}%</span>
                            <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                               <div className={`h-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${task.progress}%` }}></div>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            {task.actualStartDate && <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">ING</span>}
                            {task.actualEndDate && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">FIN</span>}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Side Sheet */}
      {selectedTask && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[3px] z-[60] animate-in fade-in duration-300"
            onClick={() => setSelectedTask(null)}
          ></div>

          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-white z-[70] shadow-[-25px_0_60px_-15px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-400">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100">
                  {projects.find(p => p.id === selectedTask.projectId)?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.1em]">ID: {selectedTask.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${selectedTask.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{selectedTask.status.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight truncate w-[280px]">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
              
              {/* 1. Schedule Management */}
              <section className="space-y-5">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Schedule Management</h4>
                   <span className="text-[10px] font-bold text-slate-300">Plan vs Actual</span>
                </div>

                <div className="space-y-4">
                   {/* Planned Row - Read-only unless PM/Admin */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-3xl border transition-all ${canEditPlanned ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-100/50 border-slate-100 opacity-70 cursor-not-allowed'}`}>
                         <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1 flex items-center gap-1">
                           Planned Start {!canEditPlanned && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                         </label>
                         <input 
                           type="date" 
                           disabled={!canEditPlanned}
                           className={`w-full bg-transparent text-[13px] font-bold text-slate-700 outline-none ${!canEditPlanned ? 'pointer-events-none' : 'cursor-pointer'}`} 
                           value={selectedTask.startDate} 
                           onChange={e => updateTaskDate('startDate', e.target.value)} 
                         />
                      </div>
                      <div className={`p-4 rounded-3xl border transition-all ${canEditPlanned ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-100/50 border-slate-100 opacity-70 cursor-not-allowed'}`}>
                         <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block ml-1 flex items-center gap-1">
                           Planned End {!canEditPlanned && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                         </label>
                         <input 
                           type="date" 
                           disabled={!canEditPlanned}
                           className={`w-full bg-transparent text-[13px] font-bold text-slate-700 outline-none ${!canEditPlanned ? 'pointer-events-none' : 'cursor-pointer'}`} 
                           value={selectedTask.endDate} 
                           onChange={e => updateTaskDate('endDate', e.target.value)} 
                         />
                      </div>
                   </div>

                   {/* Actual Row - Open for editing by assignee */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-3xl border-2 transition-all ${selectedTask.actualStartDate ? 'bg-indigo-50/30 border-indigo-200 ring-4 ring-indigo-50' : 'bg-white border-slate-200 border-dashed hover:border-indigo-400'}`}>
                         <label className={`text-[9px] font-black uppercase mb-2 block ml-1 ${selectedTask.actualStartDate ? 'text-indigo-600' : 'text-slate-400'}`}>Actual Start</label>
                         <input 
                           type="date" 
                           className="w-full bg-transparent text-[13px] font-black text-slate-800 outline-none cursor-pointer" 
                           value={selectedTask.actualStartDate || ''} 
                           onChange={e => updateTaskDate('actualStartDate', e.target.value)} 
                         />
                      </div>
                      <div className={`p-4 rounded-3xl border-2 transition-all ${selectedTask.actualEndDate ? 'bg-emerald-50/30 border-emerald-200 ring-4 ring-emerald-50' : 'bg-white border-slate-200 border-dashed hover:border-emerald-400'}`}>
                         <label className={`text-[9px] font-black uppercase mb-2 block ml-1 ${selectedTask.actualEndDate ? 'text-emerald-600' : 'text-slate-400'}`}>Actual End</label>
                         <input 
                           type="date" 
                           className="w-full bg-transparent text-[13px] font-black text-slate-800 outline-none cursor-pointer" 
                           value={selectedTask.actualEndDate || ''} 
                           onChange={e => updateTaskDate('actualEndDate', e.target.value)} 
                         />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   {!selectedTask.actualStartDate && (
                     <button onClick={() => setActualNow('start')} className="w-full h-12 bg-indigo-600 text-white rounded-2xl font-black text-[12px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">지금 업무 착수 기록</button>
                   )}
                   {selectedTask.actualStartDate && !selectedTask.actualEndDate && (
                     <button onClick={() => setActualNow('end')} className="w-full h-12 bg-emerald-500 text-white rounded-2xl font-black text-[12px] shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 col-span-2">지금 업무 완료 처리</button>
                   )}
                </div>
              </section>

              {/* 2. Progress & Description */}
              <section className="space-y-6 pt-4">
                <div>
                  <div className="flex justify-between items-center mb-3 px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Progress</label>
                    <span className="text-lg font-black text-indigo-600">{selectedTask.progress}%</span>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <input 
                      type="range" min="0" max="100" step="5"
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={selectedTask.progress}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        const updated = {...selectedTask, progress: val, status: val === 100 ? 'Done' : (val > 0 ? 'In Progress' : selectedTask.status)};
                        setSelectedTask(updated);
                        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Task Specification</label>
                  <textarea 
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-[14px] font-medium text-slate-600 focus:border-indigo-400 focus:bg-white outline-none transition-all h-28 resize-none leading-relaxed"
                    placeholder="담당자 수행 지침 및 가이드를 입력하세요..."
                    value={selectedTask.description || ''}
                    onChange={e => {
                      const updated = {...selectedTask, description: e.target.value};
                      setSelectedTask(updated);
                      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
                    }}
                  />
                </div>
              </section>

              {/* 3. Daily Timeline Work Log (UPGRADED) */}
              <section className="space-y-5 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Execution Timeline Log</h4>
                   <span className="text-[10px] font-bold text-slate-400">Activity History</span>
                </div>
                
                {/* Input Form */}
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${selectedTask.actualStartDate ? 'bg-slate-50 border-slate-100 shadow-inner' : 'bg-slate-100/30 border-dashed border-slate-200 opacity-60'}`}>
                  {!selectedTask.actualStartDate ? (
                    <div className="py-6 text-center">
                       <p className="text-[12px] font-black text-slate-500 uppercase tracking-wider leading-relaxed">실제 업무 착수일이 기록된 이후에<br/>업무일지 작성이 가능합니다.</p>
                       <button onClick={() => setActualNow('start')} className="mt-4 text-[11px] font-black text-indigo-600 underline hover:text-indigo-800 transition-colors uppercase">지금 시작하기</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-36 relative">
                           <input 
                            type="date" 
                            min={selectedTask.actualStartDate}
                            max={todayStr}
                            className={`w-full px-4 py-3 bg-white border-2 rounded-2xl text-[12px] font-black outline-none transition-all ${isDateAlreadyLogged ? 'border-amber-200 text-amber-600' : 'border-slate-200 text-slate-700'}`}
                            value={logDate}
                            onChange={e => setLogDate(e.target.value)}
                           />
                           {isDateAlreadyLogged && <span className="absolute -top-2.5 left-3 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">작성 완료</span>}
                        </div>
                        <button 
                          onClick={addWorkLog}
                          disabled={!logContent.trim() || isDateAlreadyLogged}
                          className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[12px] font-black hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:opacity-50 active:scale-95 shadow-lg shadow-indigo-100"
                        >
                          {isDateAlreadyLogged ? '기록 존재' : '기록 추가'}
                        </button>
                      </div>
                      <textarea 
                        className="w-full px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[13px] font-medium text-slate-600 outline-none focus:border-indigo-400 h-20 resize-none"
                        placeholder={isDateAlreadyLogged ? "선택한 날짜에는 이미 일지가 있습니다. 아래 타임라인에서 내용을 수정하세요." : "오늘 수행한 핵심 내용을 간결하게 기록하세요..."}
                        disabled={isDateAlreadyLogged}
                        value={logContent}
                        onChange={e => setLogContent(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Simplified One-line Timeline List (Reverse Chronological) */}
                <div className="space-y-3 mt-6 relative">
                  {/* Vertical line indicator */}
                  {sortedWorkLogs.length > 0 && (
                    <div className="absolute left-[4.2rem] top-6 bottom-6 w-[2px] bg-slate-100 -z-10"></div>
                  )}

                  {sortedWorkLogs.length > 0 ? (
                    sortedWorkLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-5 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 group transition-all hover:shadow-md">
                        {/* Date Component (Left) */}
                        <div className="flex-shrink-0 w-20 text-center">
                           <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg tabular-nums">
                            {log.date.split('-').slice(1).join('/')}
                           </span>
                        </div>
                        
                        {/* Content Component (Center) */}
                        <div className="flex-1 min-w-0">
                          {editingLogId === log.id ? (
                            <div className="flex items-center gap-3">
                              <input 
                                className="flex-1 px-4 py-2 text-[13px] border-2 border-indigo-200 rounded-xl outline-none font-bold bg-white"
                                value={editLogContent}
                                onChange={e => setEditLogContent(e.target.value)}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && saveEditLog()}
                              />
                              <button onClick={saveEditLog} className="text-[11px] font-black text-indigo-600 hover:underline">SAVE</button>
                              <button onClick={() => setEditingLogId(null)} className="text-[11px] font-bold text-slate-400 hover:underline">ESC</button>
                            </div>
                          ) : (
                            <p className="text-[13px] text-slate-700 font-bold truncate group-hover:whitespace-normal transition-all leading-relaxed">
                              {log.content}
                            </p>
                          )}
                        </div>

                        {/* Actions Component (Right) */}
                        {editingLogId !== log.id && (
                          <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 bg-slate-50 rounded-xl p-1">
                            <button onClick={() => startEditLog(log)} className="p-2 hover:text-indigo-600 text-slate-300 hover:bg-white rounded-lg transition-all" title="기록 수정">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                            </button>
                            <button onClick={() => deleteWorkLog(log.id)} className="p-2 hover:text-red-500 text-slate-300 hover:bg-white rounded-lg transition-all" title="기록 삭제">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m4.74-9-.34 9m-4.74-9H14.74m3.15-3.15H6.11a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.11 21h11.78a2.25 2.25 0 0 0 2.25-2.25V5.1a2.25 2.25 0 0 0-2.25-2.25z" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/20">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                         <ICONS.WBS className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">Timeline empty</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
            
            {/* Footer */}
            <div className="p-8 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.05)]">
               <button 
                onClick={() => setSelectedTask(null)}
                className="w-full py-4.5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[14px] hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
               >
                <span>모든 기록 저장 및 창 닫기</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyTasks;
