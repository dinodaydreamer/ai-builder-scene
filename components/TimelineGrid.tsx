
import React, { useState } from 'react';
import { Shot } from '../types';

interface TimelineGridProps {
  shots: Shot[];
  onGenerateShot: (id: string) => void;
  onUpdateShotPrompt: (id: string, newPrompt: string) => void;
  aspectRatio: string;
  onAddShot: () => void;
  onGenerateAll: () => void;
  onStopBatch: () => void;
  isBatchGenerating: boolean;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({ 
  shots, 
  onGenerateShot, 
  onUpdateShotPrompt,
  aspectRatio, 
  onAddShot, 
  onGenerateAll, 
  onStopBatch,
  isBatchGenerating 
}) => {
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState("");

  const getAspectRatioClass = (ratio: string) => {
    switch(ratio) {
      case "16:9": return "aspect-video";
      case "9:16": return "aspect-[9/16]";
      case "4:3": return "aspect-[4/3]";
      case "3:4": return "aspect-[3/4]";
      default: return "aspect-square";
    }
  };

  const handleDownload = (imageUrl: string, shotNumber: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `shot-${String(shotNumber).padStart(2, '0')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (shot: Shot) => {
    setEditingShotId(shot.id);
    setTempPrompt(shot.prompt);
  };

  const savePrompt = () => {
    if (editingShotId) {
      onUpdateShotPrompt(editingShotId, tempPrompt);
      setEditingShotId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between border-b border-[#222] pb-8">
        <div>
          <h2 className="text-[16px] font-black text-white tracking-[0.3em] uppercase italic">Sequence Timeline</h2>
          <p className="text-[9px] text-gray-600 uppercase font-black mt-1">Total Assets: <span className="text-orange-500">{shots.length} SHOTS</span></p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={onAddShot}
            className="px-6 py-2.5 bg-[#1a1a1a] border border-[#333] text-gray-400 text-[10px] font-black rounded-full uppercase tracking-tighter hover:bg-[#252525] hover:text-white transition-all shadow-lg"
           >
            + Thêm shot mới
          </button>
           {isBatchGenerating ? (
             <button 
              onClick={onStopBatch}
              className="px-8 py-2.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
             >
              Dừng Render
            </button>
           ) : (
             <button 
              onClick={onGenerateAll}
              disabled={shots.length === 0}
              className={`px-8 py-2.5 bg-gold text-black text-[10px] font-black rounded-full uppercase tracking-tighter hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-900/20 ${shots.length === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
             >
              Render Toàn Bộ
            </button>
           )}
        </div>
      </div>

      {shots.length === 0 ? (
        <div className="h-[500px] border-2 border-dashed border-[#222] rounded-[40px] flex flex-col items-center justify-center text-gray-800 bg-[#0d0d0d]/30">
           <div className="w-20 h-20 rounded-full bg-[#111] border border-[#222] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-600">Storyboard rỗng</p>
           <button onClick={onAddShot} className="mt-6 px-6 py-2 border border-gold/30 text-gold text-[10px] font-bold rounded-full hover:bg-gold/10 transition-all uppercase tracking-widest">Bắt đầu ngay</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-32">
          {shots.map((shot) => (
            <div key={shot.id} className="flex flex-col gap-5 group animate-in fade-in zoom-in-95 duration-700 border-b border-orange-500/10 pb-10">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <span className="text-[20px] font-black italic text-orange-500 transition-colors">#{String(shot.number).padStart(2, '0')}</span>
                    <div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] block">Shot Asset</span>
                        <span className="text-[8px] text-gray-700 font-mono">ID: {shot.id.slice(0, 8)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onGenerateShot(shot.id)}
                    disabled={isBatchGenerating || shot.isGenerating}
                    className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all shadow-lg ${shot.generatedImageUrl ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-gold text-black hover:bg-yellow-400'} ${(isBatchGenerating || shot.isGenerating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {shot.isGenerating ? (
                        <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Process
                        </span>
                    ) : (shot.generatedImageUrl ? 'Regen' : 'Render')}
                  </button>
                </div>
              </div>

              <div className={`relative bg-[#0d0d0d] rounded-3xl border border-[#222] overflow-hidden shadow-2xl transition-all group-hover:border-orange-500/40 group-hover:shadow-orange-500/5 ${getAspectRatioClass(aspectRatio)}`}>
                {shot.generatedImageUrl ? (
                  <img src={shot.generatedImageUrl} className="w-full h-full object-cover" alt={`Shot ${shot.number}`} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#131313] to-[#0a0a0a]">
                    {shot.isGenerating ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-gold/10 rounded-full"></div>
                            <div className="absolute inset-0 w-12 h-12 border-t-2 border-gold rounded-full animate-spin"></div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] text-gold font-black uppercase tracking-[0.4em] animate-pulse">Rendering...</span>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onGenerateShot(shot.id)}
                        disabled={isBatchGenerating}
                        className="flex flex-col items-center gap-4 text-gray-800 hover:text-orange-500 transition-all group/btn p-10 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:border-orange-500/30 group-hover/btn:rotate-6 transition-all shadow-inner">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-[7px] uppercase tracking-[0.5em] font-black opacity-40 group-hover/btn:opacity-100">Pending</span>
                      </button>
                    )}
                  </div>
                )}
                
                {shot.generatedImageUrl && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDownload(shot.generatedImageUrl!, shot.number)}
                      className="p-2.5 bg-black/70 rounded-xl border border-white/10 backdrop-blur-xl hover:bg-orange-600 hover:text-white transition-all shadow-2xl"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  </div>
                )}

                {shot.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 p-10 text-center backdrop-blur-sm">
                        <div className="max-w-xs">
                             <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mx-auto mb-3">
                                <span className="text-red-500 font-black">!</span>
                             </div>
                             <p className="text-[8px] text-red-200 font-black uppercase tracking-widest">{shot.error}</p>
                             <button onClick={() => onGenerateShot(shot.id)} className="mt-3 text-[7px] text-white font-bold underline uppercase">Thử lại</button>
                        </div>
                    </div>
                )}
              </div>

              <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-4 shadow-lg group-hover:border-orange-500/20 transition-all flex-1 flex flex-col justify-between min-h-[100px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter italic block mb-1">Prompt:</span>
                    <p className="text-[9px] text-gray-400 leading-relaxed font-mono line-clamp-4">
                      {shot.prompt || "Chưa có mô tả..."}
                    </p>
                  </div>
                  <button 
                    onClick={() => openEditModal(shot)}
                    className="p-2 bg-[#1a1a1a] rounded-lg border border-[#333] hover:border-orange-500/50 transition-all text-gray-500 hover:text-orange-500 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prompt Edit Modal */}
      {editingShotId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setEditingShotId(null)}>
          <div className="bg-[#111] border border-[#333] max-w-2xl w-full p-8 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[14px] font-black text-orange-500 uppercase tracking-[0.2em] italic">Chỉnh sửa Prompt - Shot #{shots.find(s => s.id === editingShotId)?.number}</h3>
               <button onClick={() => setEditingShotId(null)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <textarea
              autoFocus
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              className="w-full h-48 bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 text-[12px] text-gray-300 font-mono focus:outline-none focus:border-orange-500/50 resize-none shadow-inner leading-relaxed"
              placeholder="Nhập mô tả chi tiết cho phân cảnh này..."
            />
            <div className="mt-8 flex gap-3">
               <button onClick={() => setEditingShotId(null)} className="flex-1 py-3 border border-[#333] text-[10px] text-gray-500 uppercase font-black rounded-xl hover:bg-[#1a1a1a] transition-all">Hủy</button>
               <button onClick={savePrompt} className="flex-1 py-3 bg-orange-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
