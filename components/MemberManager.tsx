
import React, { useState, useRef } from 'react';
import { Resource, MemberStatus, ResourceClassification, UserOrganization } from '../types';
import { ICONS } from '../constants';

interface MemberManagerProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  currentUser: Resource;
  organizations: UserOrganization[];
}

const MemberManager: React.FC<MemberManagerProps> = ({ resources, setResources, currentUser, organizations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [classFilter, setClassFilter] = useState<ResourceClassification | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Resource | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Resource>>({});

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const digits = value.replace(/\D/g, "");

    // 02 지역번호 처리
    if (digits.startsWith('02')) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`; // 02-123-4567
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`; // 02-1234-5678
    }

    // 그 외 (010, 031, 062 등)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`; // 010-123-4567
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`; // 010-1234-5678
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleClassificationChange = (cls: ResourceClassification) => {
    let newOrgName = formData.organizationName;
    if (cls === 'Admin' || cls === 'Employee') {
      newOrgName = organizations[0]?.name || '(주)넥서스 테크놀로지';
    } else if (cls === 'Client' && (formData.classification === 'Admin' || formData.classification === 'Employee')) {
      newOrgName = ''; // 내부에서 외부로 변경 시 초기화
    }
    setFormData({ ...formData, classification: cls, organizationName: newOrgName });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredResources = resources.filter(res => {
    // 보안 로직: Admin 계정은 Admin 로그린 시에만 보임
    if (res.classification === 'Admin' && currentUser.classification !== 'Admin') {
      return false;
    }

    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.loginId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === '' || res.department === deptFilter;
    const matchesClass = classFilter === '' || res.classification === classFilter;
    return matchesSearch && matchesDept && matchesClass;
  });

  const getStatusStyle = (status: MemberStatus) => {
    return status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700';
  };

  const getClassificationStyle = (cls: ResourceClassification) => {
    switch (cls) {
      case 'Admin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Client': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Employee': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setShowPassword(false);
    setFormData({
      id: `r${Date.now()}`,
      loginId: '',
      password: 'password1',
      name: '',
      role: '',
      department: '',
      email: '',
      phone: '',
      status: 'Active',
      classification: 'Employee',
      organizationName: organizations[0]?.name || '(주)넥서스 테크놀로지',
      joinDate: new Date().toISOString().split('T')[0],
      capacity: 40,
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: Resource) => {
    setEditingMember(member);
    setShowPassword(false);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === 'admin') {
      alert('시스템 관리자 계정은 삭제할 수 없습니다.');
      return;
    }
    if (window.confirm('해당 회원을 시스템에서 완전히 삭제하시겠습니까? 관련 데이터가 소실될 수 있습니다.')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setResources(prev => prev.map(r => r.id === editingMember.id ? { ...r, ...formData } as Resource : r));
    } else {
      setResources(prev => [...prev, formData as Resource]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-white overflow-hidden">
      <div className="p-6 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">회원 관리 (Governance)</h2>
            <p className="text-slate-500 text-sm">시스템 접근 권한 및 회원 상세 정보를 관리합니다.</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-100/50 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            신규 회원 등록
          </button>
        </div>

        <div className="flex gap-4 items-center mb-6 overflow-x-auto pb-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="이름, ID, 역할로 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3.5 top-3 text-slate-400">
              <ICONS.Search className="w-4 h-4" />
            </div>
          </div>
          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[140px] shadow-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value as any)}
          >
            <option value="">모든 분류</option>
            <option value="Admin">관리자 (Admin)</option>
            <option value="Client">고객 (Client)</option>
            <option value="Employee">임직원 (Employee)</option>
          </select>
          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[140px] shadow-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">모든 부서</option>
            {Array.from(new Set(resources.map(r => r.department))).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-5 pl-8 pr-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">회원 정보</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">분류</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">부서 / 역할</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">연락처 / Login ID</th>
              <th className="px-3 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
              <th className="pr-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">액션</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(res => (
              <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                <td className="py-4 pl-8 pr-3">
                  <div className="flex items-center gap-4">
                    <img src={res.avatar} className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm object-cover group-hover:scale-105 transition-transform" alt={res.name} />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{res.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">{res.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getClassificationStyle(res.classification)}`}>
                    {res.classification === 'Admin' ? '관리자' : res.classification === 'Client' ? '고객' : '임직원'}
                  </span>
                  <div className="text-[11px] text-slate-500 font-medium mt-1 truncate max-w-[100px]">{res.organizationName}</div>
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm text-slate-700 font-bold">{res.department}</div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{res.role}</div>
                </td>
                <td className="px-3 py-4">
                  <div className="text-sm text-slate-600 font-mono tracking-tighter">{res.phone || '-'}</div>
                  <div className="text-[11px] text-indigo-500 font-black tracking-tight uppercase">ID: {res.loginId}</div>
                </td>
                <td className="px-3 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${getStatusStyle(res.status)}`}>
                    {res.status === 'Active' ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="pr-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(res)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="정보 수정"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    {res.classification !== 'Admin' && (
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="회원 삭제"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m4.74-9-.34 9m-4.74-9H14.74m3.15-3.15H6.11a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.11 21h11.78a2.25 2.25 0 0 0 2.25-2.25V5.1a2.25 2.25 0 0 0-2.25-2.25z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingMember ? '회원 상세 정보' : '신규 회원 등록'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                      <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] text-[11px] font-black uppercase tracking-widest">이미지 변경</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">회원 분류</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Admin', 'Client', 'Employee'] as ResourceClassification[]).map(cls => (
                        <button
                          key={cls}
                          type="button"
                          disabled={editingMember?.classification === 'Admin'} // Admin 계정의 분류 수정 방지
                          onClick={() => handleClassificationChange(cls)}
                          className={`py-3 rounded-xl border-2 text-[11px] font-black transition-all ${formData.classification === cls
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md'
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                            } ${editingMember?.classification === 'Admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {cls === 'Admin' ? '관리자' : cls === 'Client' ? '고객' : '임직원'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">로그인 ID</label>
                    <input required disabled={editingMember?.classification === 'Admin'} type="text" className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all ${editingMember?.classification === 'Admin' ? 'opacity-50' : ''}`} value={formData.loginId || ''} onChange={e => setFormData({ ...formData, loginId: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">비밀번호</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all pr-12" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4.5 text-slate-400 hover:text-indigo-600">
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.888-6.888m0 0a10.05 10.05 0 01-1.112.063c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l4.242 4.242" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">성명</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">소속기관명</label>
                    <input required type="text" readOnly={formData.classification !== 'Client'} className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all ${formData.classification !== 'Client' ? 'opacity-70 cursor-not-allowed text-slate-500' : ''}`} value={formData.organizationName || ''} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} placeholder="소속기관 입력" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">부서 / 조직</label>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">직책 / 역할</label>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">연락처</label>
                    <input type="tel" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.phone || ''} onChange={handlePhoneChange} placeholder="010-0000-0000" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">이메일</label>
                    <input required type="email" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">활동 상태</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all" value={formData.status || 'Active'} onChange={e => setFormData({ ...formData, status: e.target.value as MemberStatus })}>
                      <option value="Active">활성 (Active)</option>
                      <option value="Inactive">비활성 (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]">취소</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                    {editingMember ? '정보 저장' : '회원 등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

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
    </div >
  );
};

export default MemberManager;
