"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { Game } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, RefreshCw, Star, Trash2, Edit2, ExternalLink, Gamepad2 } from "lucide-react";
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
    setLoading(true);
    try {
      const res = await fetch(`/api/steam`);
      const data = await res.json();
      
      if (data.games) {
        const steamGames: Game[] = data.games.map((sg: any) => {
          // 状态识别逻辑
          let status: Game['status'] = 'backlog';
          if (sg.playtime_2weeks > 0) {
            status = 'playing'; // 两周内玩过，标记为正在玩
          } else if (sg.playtime_forever > 0) {
            status = 'completed'; // 总时长大于0但最近没玩，标记为已通关/玩过
          }

          return {
            id: `steam-${sg.appid}`,
            appid: sg.appid,
            name: sg.name,
            cover: `https://cdn.akamai.steamstatic.com/steam/apps/${sg.appid}/header.jpg`,
            playtime_forever: sg.playtime_forever,
            status: status,
            rating: 0,
            tags: [],
            notes: "",
            platform: 'steam'
          };
        });

        // 合并逻辑：如果名称相同则保留旧的（因为旧的可能有评分和笔记）
        setGames(prev => {
          const existingNames = new Set(prev.map(g => g.name));
          const newOnes = steamGames.filter(g => !existingNames.has(g.name));
          return [...prev, ...newOnes];
        });
      } else if (data.error) {
        alert(`同步失败: ${data.error}\n提示：请在 Vercel 中设置 STEAM_ID 环境变量。`);
      }
    } catch (e) {
      alert("同步过程中发生未知错误，请检查网络或 API 配置");
    } finally {
      setLoading(false);
    }
  };

  const [showDetailModal, setShowDetailModal] = useState<Game | null>(null);

  // 当打开详情页且是 Steam 游戏时，尝试自动拉取该游戏的截图
  useEffect(() => {
    const fetchScreenshots = async () => {
      if (showDetailModal && showDetailModal.platform === 'steam' && showDetailModal.appid) {
        // 如果已经有截图了就不再重复拉取（除非想强制刷新）
        if (showDetailModal.screenshots && showDetailModal.screenshots.length > 0) return;
        
        try {
          const res = await fetch(`/api/steam/screenshots?appid=${showDetailModal.appid}`);
          const data = await res.json();
          if (data.screenshots && data.screenshots.length > 0) {
            setShowDetailModal(prev => prev ? ({
              ...prev,
              screenshots: Array.from(new Set([...(prev.screenshots || []), ...data.screenshots]))
            }) : null);
          }
        } catch (e) {
          console.error("Failed to fetch Steam screenshots:", e);
        }
      }
    };
    
    fetchScreenshots();
  }, [showDetailModal?.id]);

  const updateGame = (updatedGame: Game) => {
    setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
    setShowDetailModal(null);
  };

  const deleteGame = (id: string) => {
    if (confirm("确定要删除这个游戏吗？")) {
      setGames(games.filter(g => g.id !== id));
      if (showDetailModal?.id === id) setShowDetailModal(null);
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
              <div className="p-3 cursor-pointer" onClick={() => setShowDetailModal(game)}>
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
                    {game.status === 'playing' ? '在玩' : game.status === 'completed' ? '玩过' : '待玩'}
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
      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-64 md:h-80 w-full">
                <Image 
                  src={showDetailModal.cover} 
                  alt={showDetailModal.name}
                  fill
                  className="object-cover opacity-40 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                <button 
                  onClick={() => setShowDetailModal(null)}
                  className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
                
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6">
                  <div className="relative w-32 h-44 shadow-2xl rounded-lg overflow-hidden border border-white/10 hidden md:block">
                    <Image src={showDetailModal.cover} alt={showDetailModal.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{showDetailModal.name}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <Star 
                            key={s} 
                            size={20} 
                            className={`cursor-pointer transition-colors ${s <= showDetailModal.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600 hover:text-gray-400"}`}
                            onClick={() => setShowDetailModal({...showDetailModal, rating: s})}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        时长: {Math.round((showDetailModal.playtime_forever || 0) / 60)} 小时
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">我的评价</label>
                    <textarea 
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="写下你对这款游戏的看法..."
                      value={showDetailModal.review || ""}
                      onChange={(e) => setShowDetailModal({...showDetailModal, review: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">游戏状态</label>
                    <div className="flex gap-2">
                      {['backlog', 'playing', 'completed', 'abandoned'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setShowDetailModal({...showDetailModal, status: status as any})}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                            showDetailModal.status === status 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                          }`}
                        >
                          {status === 'backlog' ? '待玩' : status === 'playing' ? '在玩' : status === 'completed' ? '玩过' : '弃坑'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">游戏截图</label>
                      <button 
                        onClick={() => {
                          const url = prompt("输入截图链接 (URL):");
                          if (url) {
                            setShowDetailModal({
                              ...showDetailModal, 
                              screenshots: [...(showDetailModal.screenshots || []), url]
                            });
                          }
                        }}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        添加链接
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {showDetailModal.screenshots?.map((src, i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                          <Image src={src} alt="screenshot" fill className="object-cover" />
                          <button 
                            onClick={() => {
                              const newSnaps = [...(showDetailModal.screenshots || [])];
                              newSnaps.splice(i, 1);
                              setShowDetailModal({...showDetailModal, screenshots: newSnaps});
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {(!showDetailModal.screenshots || showDetailModal.screenshots.length === 0) && (
                        <div className="col-span-2 py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm">
                          暂无截图，点击上方添加
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => updateGame(showDetailModal)}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      保存所有更改
                    </button>
                    <button 
                      onClick={() => deleteGame(showDetailModal.id)}
                      className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-all border border-red-500/20"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}