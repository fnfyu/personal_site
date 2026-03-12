"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { PenTool, Box, Layout, BarChart3, Mail, Code, Terminal } from "lucide-react";

export default function Extensions() {
  const futureExtensions = [
    {
      title: "个人博客",
      description: "基于 Markdown 的极简博客系统，记录技术心得与生活点滴。",
      icon: PenTool,
      status: "规划中",
      color: "text-blue-400",
    },
    {
      title: "作品集展示",
      description: "精美展示你的开源项目、设计作品或个人成就。",
      icon: Layout,
      status: "规划中",
      color: "text-purple-400",
    },
    {
      title: "工具箱",
      description: "集成常用的开发者工具、格式转换、单位换算等实用功能。",
      icon: Box,
      status: "规划中",
      color: "text-orange-400",
    },
    {
      title: "数据面板",
      description: "可视化展示你的 GitHub 提交、游戏时长、学习进度等实时数据。",
      icon: BarChart3,
      status: "待开发",
      color: "text-green-400",
    },
    {
      title: "简历生成器",
      description: "一键生成美观的 PDF 简历，支持多套主题切换。",
      icon: Mail,
      status: "待开发",
      color: "text-pink-400",
    },
    {
      title: "代码片段库",
      description: "存储和管理常用的代码片段，支持多语言语法高亮。",
      icon: Code,
      status: "待开发",
      color: "text-cyan-400",
    },
  ];

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 max-w-7xl mx-auto">
      <Navbar />

      <header className="mb-16 text-center mt-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">功能扩展中心</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          这个主页不仅仅是一个开始，它拥有无限的扩展可能。
          以下是未来可以加入的功能清单，你可以随时自行实现或等待更新。
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {futureExtensions.map((ext, idx) => {
          const Icon = ext.icon;
          return (
            <motion.div
              key={ext.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl bg-white/5 ${ext.color}`}>
                  <Icon size={28} />
                </div>
                <span className="text-[10px] px-2 py-1 bg-white/10 rounded-full text-gray-400 uppercase tracking-wider font-bold">
                  {ext.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{ext.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {ext.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                <Terminal size={14} />
                <span>Next.js API Routes & React Components</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 p-10 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 text-center">
        <h2 className="text-2xl font-bold mb-4">想要添加自己的功能？</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          项目基于 Next.js 14 开发，采用 App Router 架构。只需在 `src/app` 下新建文件夹即可添加新页面，并在 `Navbar.tsx` 中注册导航。
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
            查看开发文档
          </button>
          <button className="px-6 py-2 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
            反馈建议
          </button>
        </div>
      </div>
    </main>
  );
}