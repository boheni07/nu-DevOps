
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ICONS, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import WBSManager from './components/WBSManager';
import GanttChart from './components/GanttChart';
import ResourceOptimizer from './components/ResourceOptimizer';
import MemberManager from './components/MemberManager';
import ProgressReporting from './components/ProgressReporting';
import MyTasks from './components/MyTasks';
import ProjectManager from './components/ProjectManager';
import Login from './components/Login';
import { Task, Resource, Project } from './types';

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'PRJ-2024-ERP', 
    name: '차세대 엔터프라이즈 ERP', 
    description: '클라우드 네이티브 ERP 플랫폼 구축 프로젝트', 
    startDate: '2024-01-01', 
    endDate: '2024-12-31', 
    status: 'Active', 
    clientId: 'r4', 
    managerId: 'r1',
    plId: 'r2',
    notes: '본 프로젝트는 대규모 클라우드 전환을 목표로 하며, 보안 규정 준수가 최우선 과제임.'
  },
  { 
    id: 'PRJ-2024-AI', 
    name: 'AI 기반 데이터 분석 모듈', 
    description: 'ML 알고리즘 기반 예측 엔진 고도화', 
    startDate: '2024-03-01', 
    endDate: '2024-08-31', 
    status: 'Planning', 
    clientId: 'r4', 
    managerId: 'r2',
    notes: 'Python 기반 분석 라이브러리 활용 예정.'
  }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', projectId: 'PRJ-2024-ERP', title: '기획 및 전략 수립', assigneeId: 'unassigned', status: 'Done', priority: 'High', startDate: '2024-01-01', endDate: '2024-01-10', actualStartDate: '2024-01-01', actualEndDate: '2024-01-09', workingDays: 8, progress: 100 },
  { id: '2', projectId: 'PRJ-2024-ERP', title: '시스템 아키텍처 설계', parentId: '1', assigneeId: 'r1', status: 'Done', priority: 'High', startDate: '2024-01-02', endDate: '2024-01-08', actualStartDate: '2024-01-02', actualEndDate: '2024-01-08', workingDays: 5, progress: 100 },
  { id: '3', projectId: 'PRJ-2024-ERP', title: '플랫폼 핵심 개발', assigneeId: 'unassigned', status: 'In Progress', priority: 'High', startDate: '2024-01-11', endDate: '2024-03-31', actualStartDate: '2024-01-12', workingDays: 57, progress: 45 },
  { id: '4', projectId: 'PRJ-2024-ERP', title: '프론트엔드 UI 컴포넌트', parentId: '3', assigneeId: 'r2', status: 'In Progress', priority: 'Medium', startDate: '2024-01-12', endDate: '2024-02-15', actualStartDate: '2024-01-12', workingDays: 25, progress: 70 },
  { id: '5', projectId: 'PRJ-2024-ERP', title: '백엔드 마이크로서비스 설계', parentId: '3', assigneeId: 'r1', status: 'To Do', priority: 'High', startDate: '2024-01-15', endDate: '2024-02-15', workingDays: 24, progress: 0 },
];

const INITIAL_RESOURCES: Resource[] = [
  { id: 'admin', loginId: 'admin', password: '0000', name: '시스템 관리자', role: 'Chief Administrator', department: 'IT 거버넌스', email: 'admin@nexus.dev', status: 'Active', classification: 'Admin', joinDate: '2024-01-01', capacity: 999, avatar: 'https://picsum.photos/seed/admin/100/100' },
  { id: 'r1', loginId: 'chulsoo', password: 'password1', name: '김철수', role: '시스템 아키텍트', department: '플랫폼본부', email: 'chulsoo@nexus.dev', status: 'Active', classification: 'Internal', joinDate: '2023-05-15', capacity: 40, avatar: 'https://picsum.photos/seed/alex/100/100' },
  { id: 'r2', loginId: 'younghee', password: 'password1', name: '이영희', role: '프론트엔드 리드', department: '개발1팀', email: 'younghee@nexus.dev', status: 'Active', classification: 'Internal', joinDate: '2023-06-20', capacity: 40, avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { id: 'r3', loginId: 'jimin', password: 'password1', name: '박지민', role: '풀스택 개발자', department: '개발2팀', email: 'jimin@nexus.dev', status: 'Inactive', classification: 'Internal', joinDate: '2024-01-10', capacity: 40, avatar: 'https://picsum.photos/seed/david/100/100' },
  { id: 'r4', loginId: 'client1', password: 'password1', name: '이발주', role: 'PM', department: '글로벌 테크', email: 'client@globaltech.com', status: 'Active', classification: 'Client', joinDate: '2024-01-01', capacity: 0, avatar: 'https://picsum.photos/seed/client/100/100' },
];

// ... (Rest of App.tsx remains same, routing matches currentProject using enhanced properties)
const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[13px] font-semibold ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
      }`}
    >
      <span className={`w-4 h-4 flex-shrink-0`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
};

const AppContent: React.FC<{
  currentUser: Resource | null;
  setCurrentUser: (user: Resource | null) => void;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handleLogin: (user: Resource) => void;
  handleLogout: () => void;
  handleSwitchAccount: (userId: string) => void;
}> = ({ currentUser, resources, setResources, projects, setProjects, currentProjectId, setCurrentProjectId, tasks, setTasks, handleLogin, handleLogout, handleSwitchAccount }) => {
  const location = useLocation();
  const isProjectHub = ['/', '/wbs', '/gantt'].includes(location.pathname);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === currentProjectId) || projects[0]
  , [projects, currentProjectId]);

  const filteredTasks = useMemo(() => 
    tasks.filter(t => t.projectId === currentProjectId)
  , [tasks, currentProjectId]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} resources={resources} />;
  }

  const isStaff = currentUser.classification === 'Admin' || currentUser.classification === 'Internal';

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-40 shadow-sm">
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">N</div>
          <div className="font-black text-slate-800 text-base tracking-tight">Nexus PMS</div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <div className="px-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Hub</div>
            <div className="space-y-0.5">
              <SidebarItem to="/" icon={<ICONS.Dashboard />} label="대시보드" />
              <SidebarItem to="/wbs" icon={<ICONS.WBS />} label="WBS 관리" />
              <SidebarItem to="/gantt" icon={<ICONS.Gantt />} label="간트 차트" />
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace</div>
            <div className="space-y-0.5">
              <SidebarItem to="/mytasks" icon={<ICONS.Kanban />} label="내 업무 보드" />
              <SidebarItem to="/reports" icon={<ICONS.Resource />} label="성과 리포트" />
            </div>
          </div>

          {isStaff && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Management</div>
              <div className="space-y-0.5">
                <SidebarItem to="/project" icon={<ICONS.Settings />} label="프로젝트 관리" />
                <SidebarItem to="/resources" icon={<ICONS.Sparkles />} label="리소스 최적화" />
                <SidebarItem to="/members" icon={<ICONS.Members />} label="회원 관리" />
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate uppercase">{currentUser.role.split(' ')[0]}</div>
            </div>
          </div>

          <div className="space-y-1 px-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Switch Account</label>
            <select 
              className="w-full bg-white border border-slate-200 text-[11px] font-bold text-slate-500 py-2 px-3 rounded-lg outline-none cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
              value={currentUser.id}
              onChange={(e) => handleSwitchAccount(e.target.value)}
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.classification})</option>
              ))}
            </select>
          </div>

          <button onClick={handleLogout} className="w-full py-2.5 text-[11px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all uppercase tracking-widest active:scale-95">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <div className="relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ICONS.Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="PMS 검색..." 
                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-[12px] focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none w-full transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {isProjectHub && (
               <select 
                  className="bg-slate-900 text-white text-[11px] font-black py-1.5 px-4 rounded-lg outline-none border-none shadow-lg cursor-pointer max-w-[200px] animate-in fade-in slide-in-from-right-2 duration-300"
                  value={currentProjectId}
                  onChange={(e) => setCurrentProjectId(e.target.value)}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <Routes>
            <Route path="/" element={<Dashboard tasks={filteredTasks} resources={resources} currentProject={currentProject} />} />
            <Route path="/wbs" element={<WBSManager tasks={filteredTasks} setTasks={(newTasks) => setTasks(prev => [...prev.filter(t => t.projectId !== currentProjectId), ...newTasks])} resources={resources} currentUser={currentUser} currentProjectId={currentProjectId} />} />
            <Route path="/gantt" element={<GanttChart tasks={filteredTasks} />} />
            <Route path="/mytasks" element={<MyTasks tasks={tasks} setTasks={setTasks} currentUser={currentUser} projects={projects} />} />
            <Route path="/reports" element={<ProgressReporting tasks={tasks} resources={resources} projects={projects} />} />
            <Route path="/members" element={isStaff ? <MemberManager resources={resources} setResources={setResources} currentUser={currentUser} /> : <Navigate to="/" />} />
            <Route path="/resources" element={isStaff ? <ResourceOptimizer tasks={filteredTasks} resources={resources} /> : <Navigate to="/" />} />
            <Route path="/project" element={isStaff ? <ProjectManager projects={projects} setProjects={setProjects} currentProjectId={currentProjectId} setCurrentProjectId={setCurrentProjectId} resources={resources} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Resource | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

  const handleLogin = (user: Resource) => {
    setCurrentUser(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_user');
  };

  const handleSwitchAccount = (userId: string) => {
    const targetUser = resources.find(r => r.id === userId);
    if (targetUser) handleLogin(targetUser);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      const defaultAccount = INITIAL_RESOURCES.find(r => r.id === 'r1');
      if (defaultAccount) {
        handleLogin(defaultAccount);
      }
    }
  }, []);

  return (
    <HashRouter>
      <AppContent 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        resources={resources}
        setResources={setResources}
        projects={projects}
        setProjects={setProjects}
        currentProjectId={currentProjectId}
        setCurrentProjectId={setCurrentProjectId}
        tasks={tasks}
        setTasks={setTasks}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleSwitchAccount={handleSwitchAccount}
      />
    </HashRouter>
  );
};

export default App;
