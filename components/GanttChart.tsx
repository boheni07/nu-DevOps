
import React, { useMemo, useState, useEffect } from 'react';
import { Task } from '../types';

interface GanttChartProps {
  tasks: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [zoom, setZoom] = useState<'day' | 'week'>('day');
  const [cellWidth, setCellWidth] = useState(28);

  useEffect(() => {
    setCellWidth(zoom === 'day' ? 28 : 70);
  }, [zoom]);

  const { minDate, dates } = useMemo(() => {
    if (tasks.length === 0) return { minDate: new Date(), dates: [] };

    let min = new Date();
    let max = new Date();
    let first = true;

    tasks.forEach(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const aStart = t.actualStartDate ? new Date(t.actualStartDate) : null;
      const aEnd = t.actualEndDate ? new Date(t.actualEndDate) : new Date();

      if (first) {
        min = start;
        max = end;
        first = false;
      }

      if (start < min) min = start;
      if (aStart && aStart < min) min = aStart;
      if (end > max) max = end;
      if (aEnd > max) max = aEnd;
    });

    min = new Date(min);
    min.setDate(min.getDate() - 3);
    max = new Date(max);
    max.setDate(max.getDate() + 10);

    const diffTime = Math.abs(max.getTime() - min.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateList = [];
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(min);
      d.setDate(d.getDate() + i);
      dateList.push(d);
    }

    return { minDate: min, dates: dateList };
  }, [tasks]);

  const flattenedTasks = useMemo(() => {
    const result: { task: Task; depth: number }[] = [];
    const visit = (parentId?: string, depth = 0) => {
      tasks
        .filter(t => t.parentId === parentId)
        .forEach(t => {
          result.push({ task: t, depth });
          visit(t.id, depth + 1);
        });
    };
    visit(undefined, 0);
    return result;
  }, [tasks]);

  const getPosition = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const offsetTime = start.getTime() - minDate.getTime();
    const offsetDays = Math.floor(offsetTime / (1000 * 60 * 60 * 24));
    const durationTime = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      left: offsetDays * cellWidth,
      width: Math.max(durationDays * cellWidth, 4)
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

  const ROW_HEIGHT = 64; // 가독성을 위해 56에서 64로 약간 상향

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">계획 대비 실적 간트 차트</h2>
          <p className="text-slate-400 text-[11px] font-black mt-1 uppercase tracking-[0.2em]">PLAN vs ACTUAL VISUALIZATION</p>
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
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${zoom === 'day' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >일간</button>
            <button 
              onClick={() => setZoom('week')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${zoom === 'week' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >주간</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-210px)] overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="w-64 flex-shrink-0 p-3 border-r border-slate-200 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] flex items-center bg-slate-50">
            Task Name
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-white">
            <div className="flex" style={{ width: `${dates.length * cellWidth}px` }}>
              {dates.map((date, idx) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isMonthStart = date.getDate() === 1 || idx === 0;
                return (
                  <div 
                    key={idx} 
                    className={`flex-shrink-0 border-r border-slate-50 h-12 flex flex-col items-center justify-center relative ${isWeekend ? 'bg-slate-50/50 text-slate-400' : 'text-slate-500'}`}
                    style={{ width: `${cellWidth}px` }}
                  >
                    {isMonthStart && (
                      <span className="font-black text-indigo-600 absolute top-1 text-[8px] whitespace-nowrap bg-indigo-50 px-1 py-0.5 rounded tracking-tighter">
                        {date.getMonth() + 1}월
                      </span>
                    )}
                    <span className={`font-black mt-1.5 ${cellWidth < 30 ? 'text-[8px]' : 'text-[10px]'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 flex-shrink-0 border-r border-slate-200 overflow-y-auto overflow-x-hidden bg-white custom-scrollbar z-10">
            {flattenedTasks.map(({ task, depth }) => (
              <div 
                key={task.id} 
                className="flex items-center px-4 border-b border-slate-50 transition-colors hover:bg-slate-50"
                style={{ height: `${ROW_HEIGHT}px`, paddingLeft: `${depth * 20 + 20}px` }}
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${task.parentId ? 'bg-slate-300' : 'bg-indigo-600 shadow-md shadow-indigo-100'}`}></div>
                <span className={`text-[14px] truncate ${task.parentId ? 'text-slate-600 font-bold' : 'text-slate-800 font-black'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/10">
            <div className="relative" style={{ width: `${dates.length * cellWidth}px`, height: `${flattenedTasks.length * ROW_HEIGHT}px` }}>
              {dates.map((_, idx) => (
                <div 
                  key={idx} 
                  className="absolute top-0 bottom-0 border-r border-slate-50" 
                  style={{ left: `${idx * cellWidth}px`, width: `${cellWidth}px` }}
                />
              ))}

              {(() => {
                const today = new Date();
                const diff = today.getTime() - minDate.getTime();
                const offset = Math.floor(diff / (1000 * 60 * 60 * 24));
                if (offset >= 0 && offset < dates.length) {
                  return (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10 opacity-50"
                      style={{ left: `${offset * cellWidth + cellWidth / 2}px` }}
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
                      className="absolute h-10 bg-slate-100 border border-slate-300 rounded-lg z-0 opacity-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      style={{ left: `${plannedPos.left}px`, width: `${plannedPos.width}px`, top: '12px' }}
                    >
                    </div>

                    {/* 실제 일정 (내부 막대) - 더 굵게 조정 */}
                    {actualPos && (
                      <div 
                        className={`absolute h-6 rounded-md flex items-center shadow-sm transition-transform group-hover:scale-[1.01] cursor-pointer z-10 ${getStatusColor(task.status)}`}
                        style={{ left: `${actualPos.left + 3}px`, width: `${Math.max(actualPos.width - 6, 4)}px`, top: '14px' }}
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

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-x-10 gap-y-3 shadow-sm">
        <div className="flex items-center gap-6 border-r border-slate-100 pr-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-slate-100 border border-slate-300 rounded-md"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planned (계획)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-8 h-3 bg-indigo-600 rounded-sm shadow-sm"></div>
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
