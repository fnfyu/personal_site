"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Gamepad2, MessageSquare, Box, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const sections = [
    {
      title: "游戏库",
      description: "自动同步 Steam & Epic 库，记录每一个通关瞬间。",
      icon: Gamepad2,
      href: "/games",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/50",
    },
    {
      title: "AI 助手",
      description: "基于最新大模型的智能对话，助你解决各种难题。",
      icon: MessageSquare,
      href: "/ai",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/50",
    },
    {
      title: "功能扩展",
      description: "博客、作品集、工具箱，未来无限可能。",
      icon: Box,
      href: "/extensions",
      color: "from-orange-500/20 to-yellow-500/20",
      borderColor: "border-orange-500/50",
    },
  ];

  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              全能个人主页
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-10">
            连接游戏世界，融合 AI 智能，打造属于你个人的数字化全能中心。
          </p>
          <div className="flex gap-4">
            <Link 
              href="/games" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2"
            >
              进入游戏库 <ArrowRight size={20} />
            </Link>
            <Link 
              href="/ai" 
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all border border-white/20 flex items-center gap-2"
            >
              调侃 AI 助手
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick Entry Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative group p-8 rounded-2xl border ${section.borderColor} bg-gradient-to-br ${section.color} hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="mb-4 p-3 bg-black/40 rounded-lg w-fit">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{section.title}</h3>
                  <p className="text-gray-400 mb-6">{section.description}</p>
                  <Link href={section.href} className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                    立即访问 <ExternalLink size={16} />
                  </Link>
                </div>
                {/* Decorative glow */}
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center border-t border-white/5">
        <h2 className="text-3xl font-bold mb-8">关于我</h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          一名热爱游戏的开发者。在这个空间里，我记录着每一次冒险，也尝试用 AI 的力量拓宽现实的边界。
        </p>
        <div className="flex justify-center gap-6">
          <span className="px-4 py-1 bg-white/5 rounded-full text-sm border border-white/10">Steam 玩家</span>
          <span className="px-4 py-1 bg-white/5 rounded-full text-sm border border-white/10">Next.js 开发者</span>
          <span className="px-4 py-1 bg-white/5 rounded-full text-sm border border-white/10">AI 探索者</span>
        </div>
      </section>
    </main>
  );
}