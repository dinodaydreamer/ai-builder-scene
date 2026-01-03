
import React from 'react';
import { AppConfig, CharacterReference } from '../types';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  characters: CharacterReference[];
  setCharacters: React.Dispatch<React.SetStateAction<CharacterReference[]>>;
  onAddCharacter: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, characters, setCharacters, onAddCharacter }) => {
  const genres = [
    "Hoạt hình 2D Cartoon", "3D Pixar", "Ghibli", "Realistic Drama", "Cinematic Film", "TVC", "Tùy chỉnh"
  ];

  return (
    <aside className="w-[300px] bg-[#0d0d0d] border-r border-[#222] flex flex-col overflow-y-auto p-6 gap-8">
      <section>
        <h3 className="text-[11px] font-black text-gold uppercase tracking-[0.3em] mb-5 border-l-2 border-gold pl-3">Thông số kĩ thuật</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2.5 block">Thể loại phim</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {genres.map(g => (
                <button 
                  key={g}
                  onClick={() => setConfig({...config, genre: g})}
                  className={`px-3 py-1.5 text-[9px] rounded-lg border transition-all ${config.genre === g ? 'border-gold text-gold bg-gold/10 font-bold' : 'border-[#222] text-gray-500 bg-[#161616]'}`}
                >
                  {g}
                </button>
              ))}
            </div>
            {config.genre === "Tùy chỉnh" && (
              <input 
                type="text"
                placeholder="Nhập phong cách riêng..."
                value={config.customGenre}
                onChange={(e) => setConfig({...config, customGenre: e.target.value})}
                className="w-full bg-[#161616] border border-gold/40 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-gold"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2.5 block">Độ phân giải (Image Size)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {["1K", "2K", "4K"].map(res => (
                <button 
                  key={res}
                  onClick={() => setConfig({...config, resolution: res as any})}
                  className={`py-2 text-[10px] rounded-lg border transition-all ${config.resolution === res ? 'border-gold text-gold bg-gold/10 font-black' : 'border-[#222] text-gray-600 bg-[#161616]'}`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-2.5 block">Tỉ lệ khung hình</label>
            <div className="grid grid-cols-3 gap-1.5">
              {["16:9", "4:3", "3:4", "9:16", "1:1"].map(ratio => (
                <button 
                  key={ratio}
                  onClick={() => setConfig({...config, aspectRatio: ratio as any})}
                  className={`py-2 text-[10px] rounded-lg border transition-all ${config.aspectRatio === ratio ? 'border-gold text-gold bg-gold/10 font-bold' : 'border-[#222] text-gray-600 bg-[#161616]'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 flex flex-col border-t border-[#222] pt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[11px] font-black text-gold uppercase tracking-[0.3em] border-l-2 border-gold pl-3">Nhân vật tham chiếu</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {characters.map(char => (
            <div key={char.id} className="group relative aspect-square rounded-xl overflow-hidden border border-[#222] bg-[#111] shadow-lg">
              <img src={char.image} alt={char.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                <input 
                  value={char.name}
                  onChange={(e) => setCharacters(chars => chars.map(c => c.id === char.id ? {...c, name: e.target.value} : c))}
                  className="bg-transparent text-[8px] font-black text-white border-none focus:outline-none uppercase text-center mb-1 placeholder-gray-400"
                  placeholder="NAME"
                />
                <button 
                  onClick={() => setCharacters(chars => chars.filter(c => c.id !== char.id))}
                  className="w-full py-1.5 bg-red-600/20 text-red-500 border border-red-600/30 text-[8px] font-black rounded-md hover:bg-red-600 hover:text-white transition-all uppercase"
                >
                  Gỡ bỏ
                </button>
              </div>
            </div>
          ))}

          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#222] rounded-xl cursor-pointer hover:border-gold/50 transition-all bg-[#0d0d0d] group">
            <input type="file" className="hidden" onChange={onAddCharacter} accept="image/*" />
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-2 group-hover:bg-gold/10 transition-colors shadow-inner">
              <span className="text-xl text-gray-600 group-hover:text-gold transition-colors">+</span>
            </div>
            <span className="text-[7px] text-gray-600 uppercase tracking-widest font-black">Thêm nhân vật</span>
          </label>
        </div>
      </section>
    </aside>
  );
};
