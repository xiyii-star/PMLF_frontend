'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, FileText, Calendar, Home } from 'lucide-react'
import { apiClient, HistoryResult } from '@/lib/api'

export default function ResultsList() {
  const [results, setResults] = useState<HistoryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      const data = await apiClient.listResults()
      setResults(data)
    } catch (error) {
      console.error('Failed to load results:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter((result) =>
    result.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">历史分析记录</h1>
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              <span>返回主页</span>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索主题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm ? '未找到匹配的结果' : '暂无历史记录'}
            </p>
            <Link
              href="/pipeline/new"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              创建新分析
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => {
              const date = new Date(result.created_at)
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
                  key={result.task_id}
                  href={`/results/${result.task_id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:line-clamp-none transition-all">
                      {result.topic}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {/* Paper count */}
                      <div className="flex items-center space-x-2 text-gray-700">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">论文数量</div>
                          <div className="text-sm font-semibold">{result.paper_count} 篇</div>
                        </div>
                      </div>

                      {/* Date and time */}
                      <div className="flex items-center space-x-2 text-gray-700">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">创建时间</div>
                          <div className="text-sm font-semibold">{formattedDate} {formattedTime}</div>
                        </div>
                      </div>
                    </div>

                    {/* View button */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-primary-600 font-medium group-hover:text-primary-700">
                        <span>查看详情</span>
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
    </div>
  )
}

