
import React, { useState, useEffect } from 'react';
import { Task, Resource, Status } from '../types';
import { ICONS } from '../constants';

interface WBSManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  resources: Resource[];
  currentUser: Resource;
  currentProjectId: string;
}

const WBSManager: React.FC<WBSManagerProps> = ({ tasks, setTasks, resources, currentUser, currentProjectId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentIdForNewTask, setParentIdForNewTask] = useState<string | undefined>(undefined);

  const calculateWorkingDays = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (start > end) return 0;
    let count = 0;
    const curDate = new Date(start);
    while (curDate <= end) {
      if (curDate.getDay() !== 0 && curDate.getDay() !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const deriveStatus = (task: Task): Status => {
    if (task.actualEndDate) return 'Done';
    const todayStr = new Date().toISOString().split('T')[0];
    if (!task.actualStartDate) return todayStr > task.startDate ? 'Start Delayed' : 'To Do';
    const elapsed = calculateWorkingDays(task.actualStartDate, todayStr);
    return elapsed > task.workingDays ? 'End Delayed' : 'In Progress';
  };

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '', assigneeId: 'unassigned', status: 'To Do', priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0],
    actualStartDate: '', actualEndDate: '', workingDays: 1, progress: 0, description: ''
  });

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateWorkingDays(formData.startDate, formData.endDate);
      setFormData(prev => ({ ...prev, workingDays: days }));
    }
  }, [formData.startDate, formData.endDate]);

  const recalculateHierarchy = (allTasks: Task[]): Task[] => {
    let updated = [...allTasks].map(t => ({ ...t, status: deriveStatus(t) }));
    let changed = true;
    while (changed) {
      changed = false;
      updated = updated.map(task => {
        const children = updated.filter(t => t.parentId === task.id);
        if (children.length === 0) return task;
        const minStart = children.reduce((min, c) => c.startDate < min ? c.startDate : min, children[0].startDate);
        const maxEnd = children.reduce((max, c) => c.endDate > max ? c.endDate : max, children[0].endDate);
        const totalWorkDays = calculateWorkingDays(minStart, maxEnd);
        const weightedProg = Math.round(children.reduce((s, c) => s + (c.progress * c.workingDays), 0) / children.reduce((s, c) => s + c.workingDays, 0) || 0);
        
        let newStatus: Status = 'In Progress';
        if (children.every(c => c.status === 'Done')) newStatus = 'Done';
        else if (children.every(c => c.status === 'To Do')) newStatus = 'To Do';

        if (task.startDate !== minStart || task.endDate !== maxEnd || task.progress !== weightedProg || task.status !== newStatus) {
          changed = true;
          return { ...task, startDate: minStart, endDate: maxEnd, progress: weightedProg, status: newStatus, workingDays: totalWorkDays };
        }
        return task;
      });
    }
    return updated;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let next: Task[];
    if (editingTask) next = tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...formData } as Task : t);
    else next = [...tasks, { ...formData as Task, id: `t${Date.now()}`, projectId: currentProjectId, parentId: parentIdForNewTask }];
    setTasks(recalculateHierarchy(next));
    setIsModalOpen(false);
  };

  const openAddModal = (parentId?: string) => {
    setEditingTask(null);
    setParentIdForNewTask(parentId);
    setFormData({ title: '', assigneeId: currentUser.id, status: 'To Do', priority: 'Medium', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], progress: 0 });
    setIsModalOpen(true);
  };

  const renderTask = (task: Task, depth = 0) => {
    const children = tasks.filter(t => t.parentId === task.id);
    const assignee = resources.find(r => r.id === task.assigneeId);
    return (
      <React.Fragment key={task.id}>
        <tr className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
          <td className="py-4 pl-6 pr-3">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              <div className={`w-2 h-2 rounded-full mr-4 ${children.length ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-300'}`}></div>
              <span className={`text-[14px] ${children.length ? 'font-black text-slate-800' : 'text-slate-600 font-bold'}`}>{task.title}</span>
            </div>
          </td>
          <td className="px-3 py-4">
            <div className="flex items-center gap-3">
              {assignee ? (
                <>
                  <img src={assignee.avatar} className="w-6 h-6 rounded-lg object-cover border border-slate-100 shadow-sm" />
                  <span className="text-[12px] font-black text-slate-700">{assignee.name}</span>
                </>
              ) : <span className="text-[11px] text-slate-300 font-black italic uppercase tracking-tighter">Unassigned</span>}
            </div>
          </td>
          <td className="px-3 py-4 text-[12px] font-black text-slate-400 tabular-nums">
            {task.startDate} ~ {task.endDate}
          </td>
          <td className="px-3 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden min-w-[80px]">
                <div className={`h-full transition-all duration-700 ${task.status === 'Done' ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${task.progress}%` }}></div>
              </div>
              <span className="text-[11px] font-black text-slate-800">{task.progress}%</span>
            </div>
          </td>
          <td className="px-3 py-4">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              task.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 
              task.status.includes('Delayed') ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
            }`}>{task.status}</span>
          </td>
          <td className="pr-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openAddModal(task.id)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="하위 업무 추가"><ICONS.Plus className="w-4 h-4" /></button>
              <button onClick={() => { setEditingTask(task); setFormData(task); setIsModalOpen(true); }} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all" title="상세 수정"><ICONS.Settings className="w-4 h-4" /></button>
            </div>
          </td>
        </tr>
        {children.map(c => renderTask(c, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">WBS (Work Breakdown Structure)</h2>
          <p className="text-slate-400 text-[11px] font-black mt-1 uppercase tracking-[0.2em]">계층형 공정 관리 시스템</p>
        </div>
        <button onClick={() => openAddModal()} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100/50 active:scale-[0.98]">새 루트 업무 등록</button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-5 pl-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Task Name</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="pr-6 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody>{tasks.filter(t => !t.parentId).map(t => renderTask(t))}</tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingTask ? 'Task 상세 정보' : '신규 업무 등록'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div>
                <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-2 ml-1">Task Name (업무명)</label>
                <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[16px] font-black text-slate-800 focus:border-indigo-600 focus:bg-white outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Start Date</label>
                  <input type="date" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">End Date</label>
                  <input type="date" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Assignee</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 outline-none" value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})}>
                    <option value="unassigned">미지정</option>
                    {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-1">Progress (%)</label>
                  <input type="number" min="0" max="100" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[16px] font-black text-indigo-600" value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]">취소</button>
                 <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">정보 저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WBSManager;
