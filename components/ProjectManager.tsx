
import React, { useState } from 'react';
import { Project, Resource, ProjectStatus, Task, Priority } from '../types';
import { ICONS } from '../constants';

interface ProjectManagerProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  resources: Resource[];
  currentUser: Resource | null;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, setProjects, tasks, setTasks, currentProjectId, setCurrentProjectId, resources, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  const canCreateProject = currentUser?.classification === 'Admin' || currentUser?.role === 'PM';

  const canEditProject = (project: Project) => {
    if (!currentUser) return false;
    if (currentUser.classification === 'Admin') return true;
    return project.managerId === currentUser.id || project.plId === currentUser.id;
  };

  const openAddModal = () => {
    const defaultClient = resources.find(r => r.classification === 'Client');
    const employeeResources = resources.filter(r => r.classification === 'Employee');
    const defaultPM = employeeResources[0];

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
      if (!canEditProject(editingProject)) return;
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...formData } as Project : p));
    } else {
      if (!canCreateProject) return;
      setProjects(prev => [...prev, formData as Project]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (p: Project) => {
    setProjectToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!projectToDelete) return;

    // Delete related tasks (WBS)
    setTasks(prev => prev.filter(t => t.projectId !== projectToDelete.id));

    // Delete the project
    setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));

    // If deleted project was the current one, switch to another one if available
    if (projectToDelete.id === currentProjectId) {
      const remainingProjects = projects.filter(p => p.id !== projectToDelete.id);
      if (remainingProjects.length > 0) {
        setCurrentProjectId(remainingProjects[0].id);
      } else {
        setCurrentProjectId('');
      }
    }

    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleCreateStandardProject = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 6);

    const projectId = `PRJ-STD-${Date.now().toString().slice(-4)}`;
    const newProject: Project = {
      id: projectId,
      name: 'SW개발 표준 프로젝트',
      description: 'SW 개발 표준 공정(분석, 설계, 구현, 테스트, 이관)이 반영된 표준화된 프로젝트 템플릿입니다.',
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'Active',
      clientId: resources.find(r => r.classification === 'Client')?.id || '',
      managerId: currentUser?.id || resources[0]?.id || '',
      notes: '표준 WBS 26개 항목이 자동으로 생성되었습니다.'
    };

    // Standard WBS Data Definition
    const rawWbs = [
      { id: 'S1', l1: '1. 분석', l2: '1.1 착수 및 계획', l3: '1.1.1 프로젝트 준비', l4: '수행계획서 작성 및 인력 투입 계획', weeks: 1, priority: 'High' },
      { id: 'S2', l1: '', l2: '', l3: '1.1.2 환경 설정', l4: '프로젝트 관리 도구 및 WBS 확정', weeks: 0.5, priority: 'Mid' },
      { id: 'S3', l1: '', l2: '1.2 요구사항 수집', l3: '1.2.1 현행 분석', l4: 'AS-IS 시스템 분석 및 프로세스 맵', weeks: 2, priority: 'High' },
      { id: 'S4', l1: '', l2: '', l3: '1.2.2 사용자 인터뷰', l4: '인터뷰 결과서 및 요구사항 목록 도출', weeks: 1, priority: 'High' },
      { id: 'S5', l1: '', l2: '1.3 요구사항 정의', l3: '1.3.1 기능 요구사항', l4: '기능 요구사항 명세서(SRS)', weeks: 2, priority: 'High' },
      { id: 'S6', l1: '', l2: '', l3: '1.3.2 비기능 요구사항', l4: '성능, 보안, 가용성 정의서', weeks: 1, priority: 'Mid' },
      { id: 'S7', l1: '', l2: '1.4 분석 완료', l3: '1.4.1 요구사항 확정', l4: '요구사항 추적표(RTM) 승인', weeks: 0.5, priority: 'High' },
      { id: 'S8', l1: '2. 설계', l2: '2.1 아키텍처 설계', l3: '2.1.1 시스템 구조', l4: '시스템 구성도(HW, SW, NW)', weeks: 1, priority: 'High' },
      { id: 'S9', l1: '', l2: '', l3: '2.1.2 공통 설계', l4: '표준 프레임워크 및 공통가이드', weeks: 1, priority: 'Mid' },
      { id: 'S10', l1: '', l2: '2.2 UI/UX 설계', l3: '2.2.1 표준 가이드', l4: 'UI 표준 가이드 및 스타일 가이드', weeks: 1, priority: 'Mid' },
      { id: 'S11', l1: '', l2: '', l3: '2.2.2 화면 설계', l4: 'UI 스토리보드(화면 설계서)', weeks: 3, priority: 'High' },
      { id: 'S12', l1: '', l2: '2.3 데이터 설계', l3: '2.3.1 모델링', l4: 'ERD(논리/물리) 및 테이블 정의서', weeks: 2, priority: 'High' },
      { id: 'S13', l1: '', l2: '2.4 상세 설계', l3: '2.4.1 프로그램 설계', l4: '클래스/시퀀스 다이어그램', weeks: 2, priority: 'Mid' },
      { id: 'S14', l1: '', l2: '', l3: '2.4.2 인터페이스 설계', l4: '대내외 연계 인터페이스 정의서', weeks: 1, priority: 'High' },
      { id: 'S15', l1: '3. 구현', l2: '3.1 환경 구축', l3: '3.1.1 인프라 세팅', l4: '개발 서버 및 DB 설치, 형상관리 구축', weeks: 1, priority: 'Mid' },
      { id: 'S16', l1: '', l2: '3.2 공통 개발', l3: '3.2.1 공통 모듈', l4: '로그인, 권한, 로그, 에러 처리 구현', weeks: 2, priority: 'High' },
      { id: 'S17', l1: '', l2: '3.3 본 개발', l3: '3.3.1 기능 구현', l4: '단위 화면 및 비즈니스 로직 개발', weeks: 6, priority: 'High' },
      { id: 'S18', l1: '', l2: '3.4 단위 테스트', l3: '3.4.1 테스트 수행', l4: '단위 테스트 결과 보고서', weeks: 2, priority: 'Mid' },
      { id: 'S19', l1: '4. 테스트', l2: '4.1 통합 테스트', l3: '4.1.1 시스템 통합', l4: '모듈 간 인터페이스 및 연계 검증', weeks: 2, priority: 'High' },
      { id: 'S20', l1: '', l2: '4.2 시스템 테스트', l3: '4.2.1 전체 기능 검증', l4: '시나리오 기반 전체 기능 테스트', weeks: 2, priority: 'High' },
      { id: 'S21', l1: '', l2: '', l3: '4.2.2 비기능 검증', l4: '부하/성능 테스트 결과서', weeks: 1, priority: 'Mid' },
      { id: 'S22', l1: '', l2: '4.3 사용자 수용', l3: '4.3.1 사용자 검수', l4: '사용자 수용 테스트(UAT) 보고서', weeks: 2, priority: 'High' },
      { id: 'S23', l1: '5. 이관/종료', l2: '5.1 운영 이관', l3: '5.1.1 데이터 이관', l4: '운영 DB 마이그레이션 및 정합성 검증', weeks: 1, priority: 'High' },
      { id: 'S24', l1: '', l2: '', l3: '5.1.2 배포', l4: '운영 환경 최종 배포 및 안정화 지원', weeks: 1, priority: 'High' },
      { id: 'S25', l1: '', l2: '5.2 프로젝트 종료', l3: '5.2.1 교육', l4: '사용자/운영자 매뉴얼 및 교육', weeks: 1, priority: 'Mid' },
      { id: 'S26', l1: '', l2: '', l3: '5.2.2 최종 보고', l4: '최종 완료 보고서 및 자산 이관', weeks: 0.5, priority: 'High' },
    ];

    const newTasks: Task[] = [];
    let currentStartDate = new Date(today);

    let lastL1Id = '';
    let lastL2Id = '';
    let lastL3Id = '';

    rawWbs.forEach((item, index) => {
      // Create L1 if provided
      if (item.l1) {
        lastL1Id = `${projectId}-L1-${index}`;
        newTasks.push({
          id: lastL1Id,
          projectId,
          title: item.l1,
          assigneeId: currentUser?.id || '',
          status: 'To Do',
          priority: 'High',
          startDate: currentStartDate.toISOString().split('T')[0],
          endDate: currentStartDate.toISOString().split('T')[0],
          workingDays: 0,
          progress: 0
        });
      }

      // Create L2 if provided
      if (item.l2) {
        lastL2Id = `${projectId}-L2-${index}`;
        newTasks.push({
          id: lastL2Id,
          projectId,
          title: item.l2,
          assigneeId: currentUser?.id || '',
          status: 'To Do',
          priority: 'High',
          startDate: currentStartDate.toISOString().split('T')[0],
          endDate: currentStartDate.toISOString().split('T')[0],
          workingDays: 0,
          progress: 0,
          parentId: lastL1Id
        });
      }

      // Create L3 (Work Item)
      lastL3Id = `${projectId}-L3-${index}`;
      const taskDurationDays = Math.ceil(item.weeks * 7);
      const taskEndDate = new Date(currentStartDate);
      taskEndDate.setDate(taskEndDate.getDate() + taskDurationDays);

      newTasks.push({
        id: lastL3Id,
        projectId,
        title: item.l3,
        description: item.l4,
        assigneeId: currentUser?.id || '',
        status: 'To Do',
        priority: item.priority as Priority,
        startDate: currentStartDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
        workingDays: taskDurationDays,
        progress: 0,
        parentId: lastL2Id
      });

      // Advance currentStartDate for next item
      currentStartDate = new Date(taskEndDate);
    });

    setProjects(prev => [newProject, ...prev]);
    setTasks(prev => [...prev, ...newTasks]);
    setCurrentProjectId(projectId);
    setIsSuccessModalOpen(true);
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
  const employees = resources.filter(r => r.classification === 'Employee');

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">프로젝트 센터</h2>
          <p className="text-slate-500 text-[12px] font-bold mt-1 uppercase tracking-tight">Enterprise Workspace Management</p>
        </div>
        {canCreateProject && (
          <div className="flex gap-4">
            {currentUser?.classification === 'Admin' && (
              <button
                onClick={handleCreateStandardProject}
                className="px-6 py-3.5 bg-emerald-600 text-white font-black rounded-xl text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100/50 flex items-center gap-3 active:scale-[0.98]"
              >
                <ICONS.Sparkles className="w-5 h-5" />
                표준 프로젝트 및 WBS 생성
              </button>
            )}
            <button
              onClick={openAddModal}
              className="px-6 py-3.5 bg-indigo-600 text-white font-black rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100/50 flex items-center gap-3 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              새 프로젝트 등록
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map(p => {
          const isActive = p.id === currentProjectId;
          const manager = resources.find(r => r.id === p.managerId);
          const client = resources.find(r => r.id === p.clientId);
          const canEdit = canEditProject(p);

          return (
            <div
              key={p.id}
              className={`bg-white rounded-[2.5rem] border-2 transition-all group overflow-hidden ${isActive ? 'border-indigo-600 shadow-2xl shadow-indigo-50/50 scale-[1.02]' : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl'
                }`}
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-[11px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                      Current Active
                    </div>
                  )}
                </div>

                <div className="text-[12px] font-black text-indigo-500 uppercase tracking-widest mb-2">Project Name</div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 truncate group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-10 leading-relaxed font-medium">
                  {p.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Manager</div>
                    <div className="flex items-center gap-3">
                      <img src={manager?.avatar} className="w-7 h-7 rounded-xl border border-white shadow-sm" />
                      <span className="text-sm text-slate-800 font-black">{manager?.name}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">Client / Partner</div>
                    <span className="text-sm text-slate-800 font-black block truncate">
                      {client ? `${client.department} (${client.name})` : '미지정'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1 text-[12px] font-bold text-slate-400 px-1">
                    <ICONS.Gantt className="w-3 h-3 inline mr-2 opacity-50" />
                    {p.startDate} ~ {p.endDate}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentProjectId(p.id)}
                    disabled={isActive}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all active:scale-[0.98] ${isActive
                      ? 'bg-slate-100 text-slate-400 cursor-default shadow-none border border-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100/30'
                      }`}
                  >
                    {isActive ? '현재 사용 중' : '워크스페이스 전환'}
                  </button>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-5 py-3.5 bg-white text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all border-2 border-slate-100 group-hover:border-slate-200 active:scale-[0.98]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(p)}
                        className="px-5 py-3.5 bg-white text-rose-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border-2 border-rose-50 active:scale-[0.98]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.74 0-.34-9m9.26-2.3b-1.17-.16T14.5 3c-1.17 0-2.3.16-3.47.33L10 3.5m0 0V2.25A2.25 2.25 0 0 1 12.25 0h1.5A2.25 2.25 0 0 1 16 2.25V3.5m-7.5 0h7.5m-9 0h10.5M4.5 6.45V19.5A2.25 2.25 0 0 0 6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25V6.45M3.75 6h16.5" /></svg>
                      </button>
                    </div>
                  )}
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
              <fieldset disabled={editingProject ? !canEditProject(editingProject) : !canCreateProject} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-indigo-500 uppercase tracking-widest ml-1">Project ID</label>
                    <input required type="text" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-black text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-indigo-500 uppercase tracking-widest ml-1">Project Name</label>
                    <input required type="text" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-black text-slate-800 focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (주요 목표)</label>
                  <textarea required className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none leading-relaxed" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Client (고객사/담당자)</label>
                    <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none appearance-none" value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                      {clients.map(res => (
                        <option key={res.id} value={res.id}>{res.name} ({res.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-indigo-600 uppercase tracking-widest ml-1">PM (Project Manager)</label>
                    <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none appearance-none" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })}>
                      {employees.filter(res => res.id !== formData.plId).map(res => (
                        <option key={res.id} value={res.id}>{res.name} ({res.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">PL (Project Leader)</label>
                    <select className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none appearance-none" value={formData.plId} onChange={e => setFormData({ ...formData, plId: e.target.value })}>
                      <option value="">선택 안함</option>
                      {employees.filter(res => res.id !== formData.managerId).map(res => (
                        <option key={res.id} value={res.id}>{res.name} ({res.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (참고사항)</label>
                  <textarea className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all h-20 resize-none" placeholder="보안 규정, 특별 라이선스, 협력 업체 정보 등..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </fieldset>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98] text-sm">취소하기</button>
                {(editingProject ? canEditProject(editingProject) : canCreateProject) && (
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100/30 transition-all active:scale-[0.98] text-sm">프로젝트 저장</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-rose-100">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 ring-8 ring-rose-50/50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">프로젝트 삭제</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
                <span className="text-rose-600 font-black">"{projectToDelete.name}"</span> 프로젝트를 삭제하시겠습니까?<br />
                삭제 시 프로젝트와 관련된 <span className="text-slate-800 font-black">WBS, 태스크, 리소스 할당 정보</span> 등 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-black rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-[0.98]"
                >
                  영구 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsSuccessModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden text-center">
            <div className="p-10">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ICONS.Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">생성이 완료되었습니다!</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
                <span className="text-indigo-600 font-black">"SW개발 표준 프로젝트"</span>와<br />
                <span className="text-slate-800 px-1">26개의 표준 WBS 항목</span>이<br />
                성공적으로 준비되었습니다.
              </p>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-4.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
              >
                지금 확인하러 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
