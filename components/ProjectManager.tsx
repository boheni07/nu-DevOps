
import React, { useState } from 'react';
import { Project, Resource, ProjectStatus } from '../types';
import { ICONS } from '../constants';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  resources: Resource[];
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, currentProjectId, setCurrentProjectId, resources }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Partial<Project>>({
    id: '',
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'Planning',
    clientId: resources.find(r => r.classification === 'Client')?.id || resources[0]?.id || '',
    managerId: resources[0]?.id || '',
    plId: '',
    notes: ''
  });

  const openAddModal = () => {
    const defaultClient = resources.find(r => r.classification === 'Client');
    const internalResources = resources.filter(r => r.classification === 'Internal');
    const defaultPM = internalResources[0];

    setEditingProject(null);
    setFormData({
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'Planning',
      clientId: defaultClient?.id || '',
      managerId: defaultPM?.id || '',
      plId: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...formData } as Project : p));
    } else {
      setProjects(prev => [...prev, formData as Project]);
    }
    setIsModalOpen(false);
  };

  const statusColors: Record<ProjectStatus, string> = {
    Planning: 'bg-slate-100 text-slate-700',
    Active: 'bg-green-100 text-green-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    Completed: 'bg-indigo-100 text-indigo-700',
  };

  const statusLabels: Record<ProjectStatus, string> = {
    Planning: '계획 중',
    Active: '진행 중',
    'On Hold': '보류됨',
    Completed: '완료됨',
  };

  const clients = resources.filter(r => r.classification === 'Client');
  const internals = resources.filter(r => r.classification === 'Internal');

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">프로젝트 센터</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-tight">Enterprise Workspace Management</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3.5 bg-indigo-600 text-white font-black rounded-2xl text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100/50 flex items-center gap-3 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          새 프로젝트 등록
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {projects.map(p => {
          const isActive = p.id === currentProjectId;
          const manager = resources.find(r => r.id === p.managerId);
          const client = resources.find(r => r.id === p.clientId);

          return (
            <div
              key={p.id}
              className={`bg-white rounded-[2.5rem] border-2 transition-all group overflow-hidden ${isActive ? 'border-indigo-600 shadow-2xl shadow-indigo-50/50 scale-[1.02]' : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl'
                }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                      Current Active
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-2">Project Name</div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 truncate group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-[14px] text-slate-500 line-clamp-2 h-10 mb-10 leading-relaxed font-medium">
                  {p.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Manager</div>
                    <div className="flex items-center gap-3">
                      <img src={manager?.avatar} className="w-7 h-7 rounded-xl border border-white shadow-sm" />
                      <span className="text-[14px] text-slate-800 font-black">{manager?.name}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client / Partner</div>
                    <span className="text-[14px] text-slate-800 font-black block truncate">
                      {client ? `${client.department} (${client.name})` : '미지정'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1 text-[11px] font-bold text-slate-400 px-1">
                    <ICONS.Gantt className="w-3 h-3 inline mr-2 opacity-50" />
                    {p.startDate} ~ {p.endDate}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentProjectId(p.id)}
                    disabled={isActive}
                    className={`flex-1 py-3.5 rounded-2xl text-[13px] font-black transition-all active:scale-[0.98] ${isActive
                        ? 'bg-slate-100 text-slate-400 cursor-default shadow-none border border-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100/30'
                      }`}
                  >
                    {isActive ? '현재 사용 중' : '워크스페이스 전환'}
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-5 py-3.5 bg-white text-slate-400 rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all border-2 border-slate-100 group-hover:border-slate-200 active:scale-[0.98]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{editingProject ? 'Project 수정' : '신규 프로젝트 생성'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Project ID</label>
                  <input required type="text" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[14px] font-black text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Project Name</label>
                  <input required type="text" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[14px] font-black text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (주요 목표)</label>
                <textarea required className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none leading-relaxed" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[13px] font-bold text-slate-700" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[13px] font-bold text-slate-700" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client (고객사/담당자)</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none appearance-none" value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                    {clients.map(res => (
                      <option key={res.id} value={res.id}>{res.name} ({res.department})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">PM (Project Manager)</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none appearance-none" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}>
                    {internals.filter(res => res.id !== formData.plId).map(res => (
                      <option key={res.id} value={res.id}>{res.name} ({res.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PL (Project Leader)</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[12px] font-bold text-slate-800 outline-none appearance-none" value={formData.plId} onChange={e => setFormData({ ...formData, plId: e.target.value })}>
                    <option value="">선택 안함</option>
                    {internals.filter(res => res.id !== formData.managerId).map(res => (
                      <option key={res.id} value={res.id}>{res.name} ({res.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (참고사항)</label>
                <textarea className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none" placeholder="보안 규정, 특별 라이선스, 협력 업체 정보 등..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98] text-sm">취소하기</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100/30 transition-all active:scale-[0.98] text-sm">프로젝트 저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
