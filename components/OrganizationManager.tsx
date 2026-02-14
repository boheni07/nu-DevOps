
import React, { useState, useRef } from 'react';
import { UserOrganization, Resource } from '../types';
import { ICONS } from '../constants';

interface OrganizationManagerProps {
    organizations: UserOrganization[];
    setOrganizations: React.Dispatch<React.SetStateAction<UserOrganization[]>>;
    currentUser: Resource;
}

const OrganizationManager: React.FC<OrganizationManagerProps> = ({ organizations, setOrganizations, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Always use the first organization as the single instance
    const currentOrg = organizations[0];

    // Form State
    const [formData, setFormData] = useState<Partial<UserOrganization>>({});

    const openEditModal = () => {
        setFormData(currentOrg);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update the single organization at index 0
        setOrganizations(prev => [{ ...prev[0], ...formData } as UserOrganization, ...prev.slice(1)]);
        setIsModalOpen(false);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, ciLogo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Only Admin can access
    if (currentUser.classification !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ICONS.Alert className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-bold">접근 권한이 없습니다.</p>
            </div>
        );
    }

    if (!currentOrg) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ICONS.Alert className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-bold">설정된 이용기관 정보가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative h-full flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">이용기관 설정 (Organization Settings)</h2>
                    <p className="text-slate-500 text-sm">시스템의 주체인 이용기관 정보를 설정합니다. (단일 기관)</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
                <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="h-40 bg-slate-900 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                            </svg>
                        </div>

                        <div className="absolute -bottom-12 left-12 flex items-end">
                            <div className="w-32 h-32 bg-white rounded-3xl shadow-lg border-4 border-white flex items-center justify-center text-3xl font-black text-slate-900 overflow-hidden">
                                {currentOrg.ciLogo ? (
                                    <img src={currentOrg.ciLogo} alt="CI Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    currentOrg.name.charAt(0)
                                )}
                            </div>
                            <div className="ml-6 mb-14 text-white">
                                <h3 className="text-3xl font-black tracking-tight">{currentOrg.name}</h3>
                                <p className="text-slate-300 font-medium text-sm flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">System Owner</span>
                                    {currentOrg.businessRegistrationNumber}
                                </p>
                            </div>
                        </div>

                        <div className="absolute top-8 right-8 z-10">
                            <button
                                onClick={openEditModal}
                                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl text-sm flex items-center gap-2 hover:bg-white/20 transition-all active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                정보 수정
                            </button>
                        </div>
                    </div>

                    <div className="pt-20 pb-12 px-12">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                    대표자 정보
                                </h4>
                                <div className="pl-6 border-l-2 border-slate-100">
                                    <div className="font-bold text-slate-800 text-lg mb-1">{currentOrg.representativeName}</div>
                                    <div className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-2 py-1 rounded-md">{currentOrg.phone}</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                                    소재지 정보
                                </h4>
                                <div className="pl-6 border-l-2 border-slate-100">
                                    <div className="text-sm text-slate-700 font-medium leading-relaxed">
                                        <span className="font-bold text-slate-900 block mb-1">({currentOrg.zipCode})</span>
                                        {currentOrg.address}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 pt-8 border-t border-slate-100">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 border-b border-indigo-100 pb-2 inline-block">System Admin Account</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Admin ID</span>
                                        <span className="text-base font-black text-slate-700 font-mono group-hover:text-indigo-600 transition-colors">{currentOrg.systemAdminId}</span>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Password</span>
                                        <span className="text-base font-black text-slate-400 font-mono tracking-widest group-hover:text-indigo-600 transition-colors">••••••••</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white text-slate-800">
                            <h3 className="text-2xl font-black tracking-tight">이용기관 정보 수정</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col items-center gap-4 mb-2">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-3xl border-4 border-slate-100 shadow-inner overflow-hidden bg-slate-50 flex items-center justify-center relative">
                                        {formData.ciLogo ? (
                                            <img src={formData.ciLogo} className="w-full h-full object-contain p-2" alt="CI Logo" />
                                        ) : (
                                            <span className="text-4xl font-black text-slate-200">{formData.name?.charAt(0)}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">CI 변경</span>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">회사 CI 로고를 클릭하여 변경하세요</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">이용기관명</label>
                                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="예: (주)넥서스 테크놀로지" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">사업자등록번호</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.businessRegistrationNumber || ''} onChange={e => setFormData({ ...formData, businessRegistrationNumber: e.target.value })} placeholder="000-00-00000" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">대표자명</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.representativeName || ''} onChange={e => setFormData({ ...formData, representativeName: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">전화번호</label>
                                    <input required type="tel" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="02-0000-0000" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">우편번호</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.zipCode || ''} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">주소</label>
                                        <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 mt-4">
                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">시스템 관리자 계정 정보</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin ID</label>
                                            <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.systemAdminId || 'admin'} onChange={e => setFormData({ ...formData, systemAdminId: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                            <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.systemAdminPassword || '0000'} onChange={e => setFormData({ ...formData, systemAdminPassword: e.target.value })} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 ml-1">* 초기 설정: admin / 0000 (보안을 위해 추후 변경 권장)</p>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]">취소</button>
                                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </div>
    );
};

export default OrganizationManager;
