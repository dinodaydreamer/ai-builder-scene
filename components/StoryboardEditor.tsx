
import React, { useRef } from 'react';

interface StoryboardEditorProps {
  script: string;
  setScript: (val: string) => void;
  onApply: () => void;
  shotCount: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({ script, setScript, onApply, shotCount, onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-[#222] flex items-center justify-between bg-[#0d0d0d]">
        <div>
          <h2 className="text-[14px] font-black text-gold uppercase tracking-[0.3em] italic">Biên tập kịch bản & Shot Prompting</h2>
          <p className="text-[9px] text-gray-600 uppercase mt-1 tracking-tighter">Dán kịch bản hoặc tải file văn bản để tự động tạo shots trên timeline</p>
        </div>
        <div className="flex items-center gap-3 pr-12">
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] text-[10px] text-gray-400 uppercase font-bold rounded-xl flex items-center gap-2 hover:bg-[#252525] hover:text-white transition-all shadow-lg"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Tải file .txt
            </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileUpload} 
          accept=".txt" 
          className="hidden" 
        />
      </div>

      <div className="flex-1 p-8 relative overflow-hidden flex flex-col bg-[#0b0b0b]">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full flex-1 bg-transparent text-[14px] leading-relaxed text-gray-300 font-mono focus:outline-none resize-none placeholder-gray-800 scrollbar-thin"
          placeholder={`Soạn thảo kịch bản theo định dạng:\n\nSHOT 01\nPrompt: Cận cảnh khuôn mặt nhân vật biểu cảm ngạc nhiên, ánh sáng xanh từ màn hình phản chiếu lên mắt...\n\nSHOT 02\nPrompt: Toàn cảnh thành phố rực rỡ dưới màn đêm...`}
        />
        
        <div className="pt-8 flex items-center gap-4">
           <button 
            onClick={onApply}
            className="flex-1 bg-[#222] border border-[#333] hover:border-gold/50 text-white text-[12px] font-black py-5 rounded-2xl transition-all shadow-2xl uppercase tracking-[0.2em]"
          >
            Cập nhật kịch bản vào Timeline ({shotCount} shots)
          </button>
        </div>
      </div>
    </div>
  );
};
