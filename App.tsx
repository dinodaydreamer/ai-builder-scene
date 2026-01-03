
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { StoryboardEditor } from './components/StoryboardEditor';
import { TimelineGrid } from './components/TimelineGrid';
import { CharacterReference, Shot, AppConfig } from './types';
import { generateSceneImage } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const stopBatchRef = useRef(false);

  const [config, setConfig] = useState<AppConfig>({
    genre: 'Cinematic Film',
    customGenre: '',
    aspectRatio: '16:9',
    resolution: '1K'
  });

  const [characters, setCharacters] = useState<CharacterReference[]>([]);
  const [script, setScript] = useState<string>('');
  const [shots, setShots] = useState<Shot[]>([]);

  // Parse script into shots only when script is modified manually in the editor
  useEffect(() => {
    if (!script.trim()) {
      return;
    }
    
    const shotBlocks = script.split(/SHOT \d+/i).filter(s => s.trim().length > 0);
    if (shotBlocks.length > 0) {
      const newShots: Shot[] = shotBlocks.map((block, index) => {
        const promptMatch = block.match(/Prompt:([\s\S]+)/i);
        const existingShot = shots[index];
        return {
          id: existingShot?.id || `shot-${index + 1}-${Date.now()}`,
          number: index + 1,
          prompt: promptMatch ? promptMatch[1].trim() : block.trim(),
          isGenerating: false,
          generatedImageUrl: existingShot?.generatedImageUrl
        };
      });
      setShots(newShots);
    }
  }, [script]);

  const handleUpdateShotPrompt = (id: string, newPrompt: string) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, prompt: newPrompt } : s));
  };

  const handleGenerateShot = async (shotId: string) => {
    if (!apiKey) {
      alert("Vui lòng nhập API Key ở menu trên cùng!");
      return;
    }
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true, error: undefined } : s));

    try {
      const imageUrl = await generateSceneImage(shot.prompt, config, characters, apiKey);
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, generatedImageUrl: imageUrl, isGenerating: false } : s));
    } catch (err: any) {
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: false, error: err.message } : s));
      throw err;
    }
  };

  const handleGenerateAll = async () => {
    if (!apiKey) {
      alert("Vui lòng nhập API Key ở menu trên cùng!");
      return;
    }
    if (shots.length === 0) {
      alert("Vui lòng nhập kịch bản trước khi render.");
      return;
    }

    setIsBatchGenerating(true);
    stopBatchRef.current = false;

    for (const shot of shots) {
      if (stopBatchRef.current) break;
      
      // Only generate shots that don't have an image yet
      if (!shot.generatedImageUrl) {
        try {
          await handleGenerateShot(shot.id);
        } catch (e) {
          console.error(`Error generating shot ${shot.number}:`, e);
        }
      }
    }
    setIsBatchGenerating(false);
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
    setIsBatchGenerating(false);
  };

  const handleAddShot = () => {
    const nextNum = shots.length + 1;
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      number: nextNum,
      prompt: '',
      isGenerating: false
    };
    setShots([...shots, newShot]);
    const separator = script.trim() ? '\n\n' : '';
    setScript(prev => prev + `${separator}SHOT ${nextNum}\nPrompt:\n`);
  };

  const addCharacter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newChar: CharacterReference = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'CHARACTER ' + (characters.length + 1),
          image: reader.result as string,
          isActive: true
        };
        setCharacters(prev => [...prev, newChar]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string || '';
        setScript(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-300">
      <header className="h-20 border-b border-[#222] px-6 flex items-center justify-between bg-[#0d0d0d] z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold flex items-center justify-center rounded-xl shadow-lg shadow-yellow-900/40 transform -rotate-3 border-2 border-black/10 transition-transform hover:rotate-0 cursor-default">
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-[#fff]">AI SCENE BUILDER</h1>
            <p className="text-[9px] text-gold uppercase tracking-[0.3em] font-bold">Director Mode</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-lg px-8">
          <div className="relative group">
            <input 
              type="password"
              placeholder="Google Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#161616] border border-[#333] rounded-full py-2 px-6 text-xs focus:outline-none focus:border-gold transition-all group-hover:border-[#444] shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowScriptModal(true)}
            className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] text-gray-300 font-bold text-[11px] rounded-full uppercase tracking-widest hover:bg-[#252525] transition-all shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Kịch bản
          </button>

          {isBatchGenerating ? (
            <button 
              onClick={handleStopBatch}
              className="px-6 py-2.5 bg-red-600 text-white font-black text-[11px] rounded-full uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-white rounded-sm"></div>
              Dừng Render
            </button>
          ) : (
            <button 
              onClick={handleGenerateAll}
              disabled={shots.length === 0}
              className={`px-6 py-2.5 bg-gold text-black font-black text-[11px] rounded-full uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-900/20 flex items-center gap-2 ${shots.length === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
            >
              Render Toàn Bộ
            </button>
          )}

          <button 
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-gray-500 hover:text-gold hover:border-gold transition-all bg-[#1a1a1a]"
          >
            <span className="font-bold">?</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          config={config} 
          setConfig={setConfig} 
          characters={characters} 
          setCharacters={setCharacters}
          onAddCharacter={addCharacter}
        />

        <main className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a]">
          <TimelineGrid 
            shots={shots} 
            onGenerateShot={handleGenerateShot} 
            onUpdateShotPrompt={handleUpdateShotPrompt}
            aspectRatio={config.aspectRatio}
            onAddShot={handleAddShot}
            onGenerateAll={handleGenerateAll}
            onStopBatch={handleStopBatch}
            isBatchGenerating={isBatchGenerating}
          />
        </main>
      </div>

      {/* Script Editor Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-10" onClick={() => setShowScriptModal(false)}>
          <div className="bg-[#0d0d0d] border border-[#222] max-w-4xl w-full h-[80vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <div className="absolute top-4 right-4 z-20">
              <button onClick={() => setShowScriptModal(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <StoryboardEditor 
              script={script} 
              setScript={setScript} 
              onApply={() => {
                setShowScriptModal(false);
              }}
              shotCount={shots.length}
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-lg p-6" onClick={() => setShowHelp(false)}>
          <div className="bg-[#111] border border-[#333] max-w-xl w-full p-10 rounded-3xl shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
            <h2 className="text-3xl font-black text-gold mb-6 uppercase italic tracking-tighter">Director's Manual</h2>
            <div className="space-y-6 text-sm text-gray-400">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center shrink-0 text-gold font-bold italic">01</div>
                <p><span className="text-white font-bold block mb-1">API KEY:</span> Dán mã Gemini API từ Google AI Studio vào thanh ở menu trên để kích hoạt AI.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center shrink-0 text-gold font-bold italic">02</div>
                <p><span className="text-white font-bold block mb-1">KỊCH BẢN:</span> Nhấn nút "Kịch bản" ở trên cùng để nhập nội dung hoặc tải file .txt.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center shrink-0 text-gold font-bold italic">03</div>
                <p><span className="text-white font-bold block mb-1">THAM CHIẾU:</span> Tải ảnh nhân vật tại cột trái để AI ghi nhớ diện mạo.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center shrink-0 text-gold font-bold italic">04</div>
                <p><span className="text-white font-bold block mb-1">RENDER:</span> Nhấn "Render Toàn Bộ" ở menu trên cùng để bắt đầu tạo hình ảnh cho tất cả các phân cảnh.</p>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-10 w-full py-4 bg-gold text-black font-black rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-[0.2em]">SẴN SÀNG</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
