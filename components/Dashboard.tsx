
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task, Resource, ProjectStats, Project } from '../types';

interface DashboardProps {
  tasks: Task[];
  resources: Resource[];
  currentProject: Project;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, resources, currentProject }) => {
  const stats = useMemo<ProjectStats>(() => {
    const leafTasks = tasks.filter(t => !tasks.some(child => child.parentId === t.id));
    const totalWorkingDays = leafTasks.reduce((sum, t) => sum + (t.workingDays || 0), 0);
    const weightedProgressSum = leafTasks.reduce((sum, t) => sum + ((t.progress || 0) * (t.workingDays || 0)), 0);
    const overallProgress = totalWorkingDays > 0 ? Math.round(weightedProgressSum / totalWorkingDays) : 0;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const atRisk = tasks.filter(t => ['Blocked', 'Start Delayed', 'End Delayed'].includes(t.status)).length;
    return { totalTasks: tasks.length, completedTasks: completed, atRiskTasks: atRisk, overallProgress, resourceUtilization: 78 };
  }, [tasks]);

  const clientInfo = useMemo(() => {
    return resources.find(r => r.id === currentProject.clientId);
  }, [resources, currentProject.clientId]);

  const pieData = [
    { name: '완료됨', value: stats.completedTasks },
    { name: '진행 중', value: stats.totalTasks - stats.completedTasks },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">
            {currentProject.name.charAt(0)}
          </div>
          <div>
            <div className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-1">Active Project</div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentProject.name}</h2>
            <p className="text-slate-400 text-[13px] font-medium mt-1">
              {clientInfo ? `${clientInfo.department} (${clientInfo.name})` : '고객사 미지정'} • {currentProject.startDate} ~ {currentProject.endDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-10 text-right">
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Progress</div>
            <div className="text-3xl font-black text-indigo-600">{stats.overallProgress}%</div>
          </div>
          <div className="w-px h-12 bg-slate-100"></div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Status</div>
            <div className={`text-[12px] font-black px-4 py-1 rounded-full mt-1 inline-block ${currentProject.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {currentProject.status === 'Active' ? 'LIVE' : currentProject.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Remaining Tasks" value={`${stats.totalTasks - stats.completedTasks}개`} color="bg-indigo-600" icon="📝" />
        <StatCard title="Completed" value={`${stats.completedTasks}개`} color="bg-green-500" icon="✅" />
        <StatCard title="Critical Risks" value={`${stats.atRiskTasks}개`} color="bg-red-500" icon="⚠️" />
        <StatCard title="Resource Load" value="82%" color="bg-amber-500" icon="📊" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-800 text-base uppercase tracking-wider">공정 추진 속도</h3>
              <p className="text-slate-400 text-xs font-bold mt-1">S-Curve Analysis</p>
            </div>
            <div className="flex gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-100"></span> ACTUAL</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> PLANNED</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[ { name: '1월', progress: 10, target: 12 }, { name: '2월', progress: 25, target: 28 }, { name: '3월', progress: 45, target: 45 }, { name: '4월', progress: 55, target: 60 }, { name: '5월', progress: 70, target: 75 } ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }} 
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={4} fillOpacity={0.1} fill="#6366f1" />
                <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 text-base uppercase tracking-wider mb-2">공정 상태 분포</h3>
          <p className="text-slate-400 text-xs font-bold mb-8 uppercase">Distribution</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-52 w-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={10} dataKey="value">
                    <Cell fill="#6366f1" strokeWidth={0} />
                    <Cell fill="#f1f5f9" strokeWidth={0} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-black text-slate-800">{stats.completedTasks}</span>
                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">DONE</span>
              </div>
            </div>
            <div className="mt-10 space-y-3 w-full">
              <LegendItem label="완료됨" color="#10b981" value={stats.completedTasks} />
              <LegendItem label="진행 중" color="#6366f1" value={tasks.length - stats.completedTasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }: any) => (
  <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all hover:shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <span className="text-xl bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg">{icon}</span>
    </div>
    <div className="flex items-baseline gap-3">
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className={`w-2 h-2 rounded-full ${color} shadow-sm`}></div>
    </div>
  </div>
);

const LegendItem = ({ label, color, value }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
    <div className="flex items-center gap-3">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[14px] font-black text-slate-800">{value} <span className="text-[10px] text-slate-400 ml-0.5">ITEMS</span></span>
  </div>
);

export default Dashboard;
