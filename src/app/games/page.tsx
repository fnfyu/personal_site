"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, RefreshCw, Star, Trash2, Edit2, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function GameLibrary() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: "",
    cover: "",
    status: "backlog",
    rating: 0,
    tags: [],
    notes: "",
    platform: "other"
  });

  // Local storage sync
  useEffect(() => {
    const saved = localStorage.getItem('my-games');
    if (saved) setGames(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('my-games', JSON.stringify(games));
  }, [games]);

  const filteredGames = games.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || g.status === filter;
    return matchesSearch && matchesFilter;
  });

  const syncSteam = async () => {
    const steamId = localStorage.getItem('steam-id');
    if (!steamId) {
      const id = prompt("请输入你的 Steam ID (64位):");
      if (id) localStorage.setItem('steam-id', id);
      else return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/steam?steamId=${localStorage.getItem('steam-id')}`);
      const data = await res.json();
      
      if (data.games) {
        const steamGames: Game[] = data.games.map((sg: any) => ({
          id: `steam-${sg.appid}`,
          appid: sg.appid,
          name: sg.name,
          cover: `https://cdn.akamai.steamstatic.com/steam/apps/${sg.appid}/header.jpg`,
          playtime_forever: sg.playtime_forever,
          status: 'backlog',
          rating: 0,
          tags: [],
          notes: "",
          platform: 'steam'
        }));

        // Merge logic: keep existing if name matches
        setGames(prev => {
          const existingNames = new Set(prev.map(g => g.name));
          const newOnes = steamGames.filter(g => !existingNames.has(g.name));
          return [...prev, ...newOnes];
        });
      }
    } catch (e) {
      alert("同步失败，请检查 API 配置或 Steam ID");
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = (id: string) => {
    if (confirm("确定要删除这个游戏吗？")) {
      setGames(games.filter(g => g.id !== id));
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Navbar />

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">我的游戏库</h1>
          <p className="text-gray-400">记录每一个值得收藏的游戏瞬间</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={syncSteam}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
            同步 Steam
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
          >
            <Plus size={18} />
            手动录入
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="搜索游戏名称..." 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="playing">正在玩</option>
          <option value="completed">已通关</option>
          <option value="backlog">待玩</option>
          <option value="abandoned">已弃坑</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence>
          {filteredGames.map((game) => (
            <motion.div
              layout
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all shadow-lg"
            >
              <div className="aspect-[3/4] relative">
                <Image 
                  src={game.cover || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400"} 
                  alt={game.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized={game.platform === 'steam'}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                   {game.platform === 'steam' && (
                     <span className="px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-bold text-blue-400 border border-blue-400/30">STEAM</span>
                   )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex justify-between items-center">
                    <button onClick={() => deleteGame(game.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate mb-1">{game.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= game.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"} />
                    ))}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    game.status === 'playing' ? 'bg-green-500/20 text-green-400' :
                    game.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {game.status === 'playing' ? '在玩' : game.status === 'completed' ? '已通' : '待玩'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 && !loading && (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <Gamepad2 size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">还没有游戏</h3>
          <p className="text-gray-500">同步 Steam 库或手动添加你的第一个游戏吧！</p>
        </div>
      )}

      {/* Syncing Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold">正在同步 Steam 数据...</h2>
          <p className="text-gray-400 mt-2">这可能需要几秒钟，请稍候</p>
        </div>
      )}
      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">添加新游戏</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">游戏名称</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 p-2 rounded focus:border-blue-500 outline-none"
                    value={newGame.name}
                    onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">封面链接 (URL)</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 p-2 rounded focus:border-blue-500 outline-none"
                    value={newGame.cover}
                    onChange={(e) => setNewGame({...newGame, cover: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">状态</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 p-2 rounded outline-none"
                      value={newGame.status}
                      onChange={(e) => setNewGame({...newGame, status: e.target.value as any})}
                    >
                      <option value="backlog">待玩</option>
                      <option value="playing">正在玩</option>
                      <option value="completed">已通关</option>
                      <option value="abandoned">已弃坑</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">评分 (0-5)</label>
                    <input 
                      type="number" min="0" max="5"
                      className="w-full bg-white/5 border border-white/10 p-2 rounded outline-none"
                      value={newGame.rating}
                      onChange={(e) => setNewGame({...newGame, rating: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      if (!newGame.name) return;
                      const game: Game = {
                        id: `manual-${Date.now()}`,
                        name: newGame.name!,
                        cover: newGame.cover || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
                        status: newGame.status || 'backlog',
                        rating: newGame.rating || 0,
                        tags: [],
                        notes: "",
                        platform: 'other'
                      };
                      setGames([game, ...games]);
                      setShowAddModal(false);
                      setNewGame({ name: "", cover: "", status: "backlog", rating: 0 });
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-bold"
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}