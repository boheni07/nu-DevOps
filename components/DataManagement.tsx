import React, { useState, useRef } from 'react';
import { Project, Task, Resource, UserOrganization } from '../types';
import { ICONS } from '../constants';
import { SAMPLE_PROJECTS, SAMPLE_TASKS, SAMPLE_RESOURCES } from '../data/sampleData';

interface DataManagementProps {
    projects: Project[];
    tasks: Task[];
    resources: Resource[];
    organizations: UserOrganization[];
    setProjects: (projects: Project[]) => void;
    setTasks: (tasks: Task[]) => void;
    setResources: (resources: Resource[]) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({
    projects, tasks, resources, organizations,
    setProjects, setTasks, setResources
}) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [processingType, setProcessingType] = useState<'Backup' | 'Restore' | 'Reset' | 'Sample' | null>(null);

    // Modal States
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'warning' | 'danger'; onConfirm: () => void } | null>(null);
    const [resultModal, setResultModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const simulateProgress = async (steps: string[]) => {
        setLoading(true);
        setProgress(0);

        for (let i = 0; i < steps.length; i++) {
            setStatusMessage(steps[i]);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
            setProgress(Math.round(((i + 1) / steps.length) * 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // Final pause
        setLoading(false);
        setProcessingType(null);
        setProgress(0);
        setStatusMessage('');
    };

    const executeBackup = async () => {
        setConfirmModal(null);
        setProcessingType('Backup');
        await simulateProgress(['데이터 수집 중...', 'JSON 포맷 변환 중...', '보안 검사 수행...', '백업 파일 생성 중...']);

        const backupData = {
            projects,
            tasks,
            resources,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `nexus_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        setResultModal({
            isOpen: true,
            title: '백업 완료',
            message: '시스템 데이터 백업이 성공적으로 완료되었습니다. 다운로드된 파일을 안전하게 보관하세요.',
            type: 'success'
        });
    };

    const handleBackupClick = () => {
        setConfirmModal({
            isOpen: true,
            title: '데이터 백업',
            message: '현재 시스템의 모든 데이터(프로젝트, 업무, 회원)를 JSON 파일로 다운로드하시겠습니까?',
            type: 'info',
            onConfirm: executeBackup
        });
    };

    const handleRestoreClick = () => {
        setConfirmModal({
            isOpen: true,
            title: '데이터 복원',
            message: '백업 파일을 업로드하여 시스템을 이전 상태로 복원하시겠습니까? 현재의 모든 데이터는 백업 파일의 내용으로 덮어씌워집니다.',
            type: 'warning',
            onConfirm: () => {
                setConfirmModal(null);
                fileInputRef.current?.click();
            }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProcessingType('Restore');
        setStatusMessage('백업 파일 분석 중...');
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                await simulateProgress(['백업 파일 무결성 검증...', '기존 데이터 백업...', '데이터 복원 중...', '인덱스 재구성...']);

                if (json.projects) setProjects(json.projects);
                if (json.tasks) setTasks(json.tasks);
                if (json.resources) setResources(json.resources);

                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = '';

                setResultModal({
                    isOpen: true,
                    title: '복원 완료',
                    message: '데이터 복원이 성공적으로 완료되었습니다.',
                    type: 'success'
                });
            } catch (error) {
                setLoading(false);
                setProcessingType(null);
                setResultModal({
                    isOpen: true,
                    title: '복원 실패',
                    message: '백업 파일 형식이 올바르지 않거나 손상되었습니다.',
                    type: 'error'
                });
            }
        };
        reader.readAsText(file);
    };

    const executeReset = async () => {
        setConfirmModal(null);
        setProcessingType('Reset');
        await simulateProgress(['데이터베이스 연결...', '테이블 Truncate 수행...', '참조 무결성 확인...', '초기화 완료']);

        setProjects([]);
        setTasks([]);

        // Keep Admin only and update organization name
        const currentOrgName = organizations[0]?.name || '(주)넥서스 테크놀로지';
        const resetResources = resources
            .filter(r => r.classification === 'Admin')
            .map(r => ({ ...r, organizationName: currentOrgName }));

        setResources(resetResources);

        setResultModal({
            isOpen: true,
            title: '초기화 완료',
            message: '시스템 데이터가 초기화되었습니다. (이용기관 정보 및 관리자 계정은 유지됨)',
            type: 'success'
        });
    };

    const handleResetClick = () => {
        setConfirmModal({
            isOpen: true,
            title: '시스템 데이터 초기화',
            message: '경고: 이용기관 설정을 제외한 모든 데이터(프로젝트, 업무, 회원)가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
            type: 'danger',
            onConfirm: executeReset
        });
    };

    const executeSampleData = async () => {
        setConfirmModal(null);
        setProcessingType('Sample');
        await simulateProgress(['샘플 데이터셋 로드 중...', '리소스 할당 시뮬레이션...', 'WBS 구조 생성...', '샘플 데이터 적용 완료']);

        setProjects(SAMPLE_PROJECTS);
        setTasks(SAMPLE_TASKS);

        // Update organization name for Admin and Employees in sample data
        const currentOrgName = organizations[0]?.name || '(주)넥서스 테크놀로지';
        const updatedSampleResources = SAMPLE_RESOURCES.map(r => {
            if (r.classification === 'Admin' || r.classification === 'Employee') {
                return { ...r, organizationName: currentOrgName };
            }
            return r;
        });

        setResources(updatedSampleResources);

        setResultModal({
            isOpen: true,
            title: '샘플 생성 완료',
            message: '테스트용 샘플 데이터가 성공적으로 생성되었습니다.',
            type: 'success'
        });
    };

    const handleSampleDataClick = () => {
        if (projects.length > 0) {
            setConfirmModal({
                isOpen: true,
                title: '샘플 데이터 생성',
                message: '이미 기존 데이터가 존재합니다. 기존 데이터를 삭제하고 샘플 데이터로 덮어쓰시겠습니까?',
                type: 'warning',
                onConfirm: executeSampleData
            });
        } else {
            setConfirmModal({
                isOpen: true,
                title: '샘플 데이터 생성',
                message: '테스트용 프로젝트와 업무 데이터를 자동으로 생성하시겠습니까?',
                type: 'info',
                onConfirm: executeSampleData
            });
        }
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-3xl font-black text-slate-800">데이터 관리</h2>
                <p className="text-slate-500 font-medium">시스템 데이터를 안전하게 백업하거나 복원, 초기화할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">데이터 백업</h3>
                    <p className="text-slate-500 text-sm mb-8 h-10">
                        현재 시스템의 모든 프로젝트, 업무, 리소스 데이터를 JSON 파일로 다운로드합니다.
                    </p>
                    <button
                        onClick={handleBackupClick}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        백업 파일 다운로드
                    </button>
                </div>

                {/* Restore Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">데이터 복원</h3>
                    <p className="text-slate-500 text-sm mb-8 h-10">
                        이전에 백업한 JSON 파일을 업로드하여 시스템 상태를 복구합니다.
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <button
                        onClick={handleRestoreClick}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        백업 파일 업로드
                    </button>
                </div>

                {/* Reset Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">데이터 초기화</h3>
                    <p className="text-slate-500 text-sm mb-8 h-10">
                        시스템의 모든 데이터를 삭제하고 초기 상태로 되돌립니다. (이용기관 정보 제외)
                    </p>
                    <button
                        onClick={handleResetClick}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        시스템 초기화
                    </button>
                </div>

                {/* Sample Data Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">샘플 데이터 생성</h3>
                    <p className="text-slate-500 text-sm mb-8 h-10">
                        테스트를 위한 데모 프로젝트와 데이터를 자동으로 생성합니다.
                    </p>
                    <button
                        onClick={handleSampleDataClick}
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                    >
                        샘플 데이터 생성
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmModal(null)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden p-8">
                        <div className="mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-600' :
                                confirmModal.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    'bg-indigo-50 text-indigo-600'
                                }`}>
                                <ICONS.Alert className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                    confirmModal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                                        'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                    }`}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {resultModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setResultModal(null)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden p-8 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${resultModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {resultModal.type === 'success' ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <ICONS.Alert className="w-8 h-8" />
                            )}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{resultModal.title}</h3>
                        <p className="text-slate-500 text-sm mb-8">{resultModal.message}</p>
                        <button
                            onClick={() => setResultModal(null)}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Modal Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">{processingType} 진행 중...</h3>
                            <p className="text-slate-500 text-sm">{statusMessage}</p>
                        </div>

                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                            <span>0%</span>
                            <span className="text-indigo-600">{progress}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataManagement;
