'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Network, FileText, Lightbulb, History } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface HistoryResult {
  task_id: string
  topic: string
  timestamp: string
  paper_count: number
  created_at: string
}

export default function Home() {
  const [history, setHistory] = useState<HistoryResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await apiClient.listResults()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Network className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">EvoNarrator</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            论文演化脉络知识图谱构建系统
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            基于深度分析的论文知识图谱构建与演化路径可视化
          </p>
          <Link
            href="/pipeline/new"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            开始分析
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <BookOpen className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">论文搜索</h3>
            <p className="text-gray-600 text-sm">
              智能搜索相关论文，支持滚雪球检索和引用网络构建
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Network className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">知识图谱</h3>
            <p className="text-gray-600 text-sm">
              构建论文间的引用关系网络，可视化研究演化路径
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <FileText className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">深度调研</h3>
            <p className="text-gray-600 text-sm">
              提取论文深度语义PMLF, 并分析引用论文之间的逻辑关系
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Lightbulb className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">研究想法</h3>
            <p className="text-gray-600 text-sm">
              生成叙事性演化脉络，并生成新的科研假设
            </p>
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6">系统架构</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { phase: 'Phase 1', name: '论文搜索', desc: '搜索和筛选相关论文' },
              { phase: 'Phase 2', name: 'PDF下载', desc: '下载论文PDF文件' },
              { phase: 'Phase 3', name: '论文分析', desc: 'DeepPaper多智能体分析' },
              { phase: 'Phase 4', name: '引用类型', desc: '推断引用关系类型' },
              { phase: 'Phase 5', name: '图谱构建', desc: '构建知识图谱' },
              { phase: 'Phase 6', name: '深度调研', desc: '生成调研报告' },
              { phase: 'Phase 7', name: '研究想法', desc: '生成研究想法' },
              { phase: 'Phase 8', name: '结果输出', desc: '保存和可视化结果' },
            ].map((item, idx) => (
              <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="text-sm font-semibold text-primary-600">{item.phase}</div>
                <div className="text-lg font-bold">{item.name}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center">
              <History className="w-6 h-6 mr-2" />
              历史分析记录
            </h3>
            {history.length > 0 && (
              <Link href="/results" className="text-primary-600 hover:underline">
                查看全部 →
              </Link>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无历史记录，<Link href="/pipeline/new" className="text-primary-600 hover:underline">开始第一个分析</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.slice(0, 6).map((item) => {
                const date = new Date(item.created_at)
                const formattedDate = date.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })
                const formattedTime = date.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })

                return (
                  <Link
                    key={item.task_id}
                    href={`/results/${item.task_id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                      <h4 className="text-base font-bold text-white line-clamp-2 group-hover:line-clamp-none transition-all">
                        {item.topic}
                      </h4>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="space-y-2">
                        {/* Paper count */}
                        <div className="flex items-center space-x-2 text-gray-700">
                          <div className="flex items-center justify-center w-7 h-7 bg-blue-100 rounded-lg">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">论文数量</div>
                            <div className="text-sm font-semibold">{item.paper_count} 篇</div>
                          </div>
                        </div>

                        {/* Date and time */}
                        <div className="flex items-center space-x-2 text-gray-700">
                          <div className="flex items-center justify-center w-7 h-7 bg-purple-100 rounded-lg">
                            <History className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">创建时间</div>
                            <div className="text-sm font-semibold">{formattedDate} {formattedTime}</div>
                          </div>
                        </div>
                      </div>

                      {/* View button */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-primary-600 font-medium group-hover:text-primary-700">
                          <span className="text-sm">查看详情</span>
                          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

