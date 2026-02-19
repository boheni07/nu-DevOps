
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Task, Project } from '../types';

interface GanttChartProps {
  tasks: Task[];
  project: Project;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, project }) => {
  const [zoom, setZoom] = useState<'day' | 'week'>('day');
  const [cellWidth, setCellWidth] = useState(28);

  const headerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollTop } = e.currentTarget;
    if (headerRef.current) headerRef.current.scrollLeft = scrollLeft;
    if (listRef.current) listRef.current.scrollTop = scrollTop;
  };

  useEffect(() => {
    setCellWidth(zoom === 'day' ? 28 : 70);
  }, [zoom]);

  const { periods, periodMap, minDate } = useMemo(() => {
    if (tasks.length === 0 && !project) return { periods: [], periodMap: new Map<string, number>(), minDate: new Date() };

    // 프로젝트 기간 기준으로 설정
    let min = new Date(project.startDate);
    let max = new Date(project.endDate);

    // 앞뒤 10일 여유
    min.setDate(min.getDate() - 10);
    max.setDate(max.getDate() + 10);

    const periodList: { label: string; date: Date }[] = [];
    const map = new Map<string, number>();

    const diffTime = Math.abs(max.getTime() - min.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (zoom === 'day') {
      let index = 0;
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(min);
        d.setDate(d.getDate() + i);
        const day = d.getDay();
        const isWeekend = day === 0 || day === 6;

        if (!isWeekend) {
          const key = d.toISOString().split('T')[0];
          periodList.push({ label: `${d.getDate()}`, date: d });
          map.set(key, index++);
        }
      }
    } else {
      // Week view: align min to recent Monday
      const day = min.getDay();
      const diff = min.getDate() - day + (day === 0 ? -6 : 1);
      const startMonday = new Date(min);
      startMonday.setDate(diff);

      const endDiffTime = Math.abs(max.getTime() - startMonday.getTime());
      const endDiffDays = Math.ceil(endDiffTime / (1000 * 60 * 60 * 24));

      let index = 0;
      for (let i = 0; i <= endDiffDays; i += 7) {
        const d = new Date(startMonday);
        d.setDate(d.getDate() + i);

        const label = `${d.getMonth() + 1}.${d.getDate()}~`;

        periodList.push({ label, date: d });

        // Map all 7 days of this week to the same index
        for (let j = 0; j < 7; j++) {
          const current = new Date(d);
          current.setDate(d.getDate() + j);
          map.set(current.toISOString().split('T')[0], index);
        }
        index++;
      }
    }

    return { periods: periodList, periodMap: map, minDate: min };
  }, [tasks, zoom, project]);

  const flattenedTasks = useMemo(() => {
    const result: { task: Task; depth: number; wbsNo: string }[] = [];
    const visit = (parentId?: string, depth = 0, prefix = '') => {
      tasks
        .filter(t => t.parentId === parentId)
        .forEach((t, index) => {
          const wbsNo = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
          result.push({ task: t, depth, wbsNo });
          visit(t.id, depth + 1, wbsNo);
        });
    };
    visit(undefined, 0);
    return result;
  }, [tasks]);

  const getPosition = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Normalize to YYYY-MM-DD
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    let startIndex = periodMap.get(startKey);
    let endIndex = periodMap.get(endKey);

    // Safety check: if dates are outside our calculated range or invalid, fallback
    if (startIndex === undefined) startIndex = 0;
    if (endIndex === undefined) endIndex = startIndex;

    if (endIndex < startIndex) endIndex = startIndex;

    const widthUnits = (endIndex - startIndex) + 1;

    return {
      left: startIndex * cellWidth,
      width: Math.max(widthUnits * cellWidth, 4)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-emerald-500';
      case 'In Progress': return 'bg-indigo-600';
      case 'End Delayed': return 'bg-rose-500';
      case 'Start Delayed': return 'bg-amber-500';
      case 'Blocked': return 'bg-slate-800';
      default: return 'bg-slate-400';
    }
  };

  const ROW_HEIGHT = 40; // 콤팩트 디자인을 위해 64에서 40으로 축소

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex items-center justify-between p-6 bg-slate-50/30 border-b border-slate-100 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gantt Chart</h2>
          <p className="text-slate-400 text-[11px] font-black mt-1 uppercase tracking-[0.2em]">{project.name} 일정 현황</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 border-r border-slate-100 pr-4 ml-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scale</span>
            <input
              type="range"
              min="15"
              max="150"
              value={cellWidth}
              onChange={(e) => setCellWidth(parseInt(e.target.value))}
              className="w-20 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setZoom('day')}
              className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${zoom === 'day' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >일간</button>
            <button
              onClick={() => setZoom('week')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${zoom === 'week' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >주간</button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white border-b border-slate-200">
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="w-64 flex-shrink-0 p-2 border-r border-slate-200 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] flex items-center bg-slate-50 h-10">
            Task Name
          </div>
          <div className="flex-1 overflow-x-hidden overflow-y-hidden bg-white" ref={headerRef}>
            <div className="flex" style={{ width: `${periods.length * cellWidth}px` }}>
              {periods.map((period, idx) => {
                const isMonthStart = period.date.getDate() <= 7 && zoom === 'week' || (period.date.getDate() === 1 && zoom === 'day') || idx === 0;
                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 border-r border-slate-50 h-10 flex flex-col items-center justify-center relative ${zoom === 'week' ? 'bg-slate-50/30' : ''} text-slate-500`}
                    style={{ width: `${cellWidth}px` }}
                  >
                    {isMonthStart && (
                      <span className="font-black text-indigo-600 absolute top-1 text-[8px] whitespace-nowrap bg-indigo-50 px-1 py-0.5 rounded tracking-tighter">
                        {period.date.getFullYear()}.{period.date.getMonth() + 1}
                      </span>
                    )}
                    <span className={`font-black mt-1.5 ${cellWidth < 30 ? 'text-[8px]' : 'text-[10px]'}`}>
                      {period.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 flex-shrink-0 border-r border-slate-200 overflow-y-hidden overflow-x-hidden bg-white z-10" ref={listRef}>
            {flattenedTasks.map(({ task, depth, wbsNo }) => (
              <div
                key={task.id}
                className="flex items-center px-4 border-b border-slate-50 transition-colors hover:bg-slate-50"
                style={{ height: `${ROW_HEIGHT}px`, paddingLeft: `${depth * 20 + 20}px` }}
              >
                <span className={`text-[13px] truncate ${task.parentId ? 'text-slate-600 font-bold' : 'text-slate-800 font-black'}`}>
                  <span className="text-slate-400 mr-2 font-black">{wbsNo}</span>
                  {task.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/10" ref={chartRef} onScroll={handleScroll}>
            <div className="relative" style={{ width: `${periods.length * cellWidth}px`, height: `${flattenedTasks.length * ROW_HEIGHT}px` }}>
              {periods.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-r border-slate-50"
                  style={{ left: `${idx * cellWidth}px`, width: `${cellWidth}px` }}
                />
              ))}

              {(() => {
                const today = new Date();
                const todayKey = today.toISOString().split('T')[0];
                const index = periodMap.get(todayKey);

                if (index !== undefined) {
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10 opacity-50"
                      style={{ left: `${index * cellWidth + cellWidth / 2}px` }}
                    >
                      <div className="absolute top-0 -left-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></div>
                    </div>
                  );
                }
              })()}

              {flattenedTasks.map(({ task }, idx) => {
                const plannedPos = getPosition(task.startDate, task.endDate);
                const actualStart = task.actualStartDate;
                const actualEnd = task.actualEndDate || (actualStart ? new Date().toISOString().split('T')[0] : null);
                const actualPos = actualStart && actualEnd ? getPosition(actualStart, actualEnd) : null;

                return (
                  <div
                    key={task.id}
                    className="absolute flex flex-col justify-center border-b border-slate-50 group transition-colors hover:bg-slate-50/40"
                    style={{ top: `${idx * ROW_HEIGHT}px`, width: '100%', height: `${ROW_HEIGHT}px` }}
                  >
                    {/* 계획 일정 (외부 막대) - 더 진하고 큰 가이드 */}
                    <div
                      className="absolute h-6 bg-slate-100 border border-slate-300 rounded-md z-0 opacity-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      style={{ left: `${plannedPos.left}px`, width: `${plannedPos.width}px`, top: '7px' }}
                    >
                    </div>

                    {/* 실제 일정 (내부 막대) - 더 굵게 조정 */}
                    {actualPos && (
                      <div
                        className={`absolute h-3.5 rounded-sm flex items-center shadow-sm transition-transform group-hover:scale-[1.01] cursor-pointer z-10 ${getStatusColor(task.status)}`}
                        style={{ left: `${actualPos.left + 2}px`, width: `${Math.max(actualPos.width - 4, 4)}px`, top: '8.5px' }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 bg-black/15 rounded-l-md" style={{ width: `${task.progress}%` }}></div>
                        {actualPos.width > 50 && (
                          <span className="text-[10px] text-white font-black truncate z-10 mx-auto drop-shadow-sm">
                            {task.progress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 p-4 flex flex-wrap items-center gap-x-8 gap-y-2 shrink-0 border-t border-slate-100">
        <div className="flex items-center gap-6 border-r border-slate-200 pr-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planned (계획)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-2 bg-indigo-600 rounded-[2px] shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actual (실제)</span>
          </div>
        </div>

        <div className="flex gap-5">
          <LegendItem color="bg-indigo-600" label="진행 중" />
          <LegendItem color="bg-emerald-500" label="완료" />
          <LegendItem color="bg-amber-500" label="시작 지연" />
          <LegendItem color="bg-rose-500" label="종료 지연" />
          <LegendItem color="bg-slate-800" label="차단됨" />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{label}</span>
  </div>
);

export default GanttChart;
