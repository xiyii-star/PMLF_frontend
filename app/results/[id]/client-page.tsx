'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Network, FileText, BookOpen, ArrowLeft, ExternalLink, Home, Maximize } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function ResultDetail() {
  const params = useParams()
  const taskId = params.id as string
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'papers'>('overview')

  const handleTabChange = (tab: 'overview' | 'graph' | 'papers') => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (taskId) {
      loadResult()
    }
  }, [taskId])

  const loadResult = async () => {
    try {
      const data = await apiClient.getResult(taskId)
      setResult(data)
    } catch (error) {
      console.error('Failed to load result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到结果</p>
          <Link href="/results" className="text-primary-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: '概览', icon: FileText },
    { id: 'graph', name: '知识图谱', icon: Network },
    { id: 'papers', name: '论文列表', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/results" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{result.topic || '分析结果'}</h1>
                <p className="text-sm text-gray-600">任务 ID: {taskId}</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              <span>返回主页</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab result={result} taskId={taskId} onTabChange={handleTabChange} />}
        {activeTab === 'graph' && <GraphTab taskId={taskId} />}
        {activeTab === 'papers' && <PapersTab taskId={taskId} />}
      </div>
    </div>
  )
}

function OverviewTab({ result, taskId, onTabChange }: { result: any; taskId: string; onTabChange: (tab: 'overview' | 'graph' | 'papers') => void }) {
  const files = result.files || {}

  // Get statistics from summary or calculate from actual data
  const summary = result.summary || {}
  const totalPapers = summary.total_papers || result.papers?.length || 0
  const graphNodes = summary.graph_nodes || result.graph_data?.nodes?.length || 0
  const graphEdges = summary.graph_edges || result.graph_data?.edges?.length || 0
  const successfulAnalysis = summary.successful_analysis || result.papers?.filter((p: any) => p.rag_analysis || p.deep_analysis)?.length || 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-primary-600">{totalPapers}</div>
          <div className="text-sm text-gray-600 mt-1">总论文数</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-green-600">{successfulAnalysis}</div>
          <div className="text-sm text-gray-600 mt-1">成功分析</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600">{graphNodes}</div>
          <div className="text-sm text-gray-600 mt-1">图谱节点</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600">{graphEdges}</div>
          <div className="text-sm text-gray-600 mt-1">图谱边</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">快速访问</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onTabChange('graph')}
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition text-left"
          >
            <Network className="w-6 h-6 text-primary-600" />
            <div>
              <div className="font-semibold">知识图谱</div>
              <div className="text-sm text-gray-600">查看交互式知识图谱</div>
            </div>
          </button>
          <button
            onClick={() => onTabChange('papers')}
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition text-left"
          >
            <BookOpen className="w-6 h-6 text-primary-600" />
            <div>
              <div className="font-semibold">论文列表</div>
              <div className="text-sm text-gray-600">查看所有论文详情</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  )
}

function GraphTab({ taskId }: { taskId: string }) {
  const handleFullscreen = () => {
    window.open(apiClient.getVisualizationUrl(taskId), '_blank')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">知识图谱可视化</h2>
        <button
          onClick={handleFullscreen}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Maximize className="w-4 h-4" />
          <span>全屏查看</span>
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
        <iframe
          src={apiClient.getVisualizationUrl(taskId)}
          className="w-full h-full border-0"
          title="Knowledge Graph Visualization"
        />
      </div>
    </div>
  )
}

function PapersTab({ taskId }: { taskId: string }) {
  const [papers, setPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPaper, setSelectedPaper] = useState<any>(null)

  useEffect(() => {
    loadPapers()
  }, [taskId])

  const loadPapers = async () => {
    try {
      const data = await apiClient.getPapers(taskId)
      setPapers(data)
    } catch (error) {
      console.error('Failed to load papers:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Paper List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">论文列表 ({papers.length})</h2>
          <div className="space-y-2 max-h-[800px] overflow-y-auto">
            {papers.map((paper) => (
              <button
                key={paper.id}
                onClick={() => setSelectedPaper(paper)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedPaper?.id === paper.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm mb-1 line-clamp-2">{paper.title}</div>
                <div className="text-xs text-gray-600">
                  {paper.year} · {paper.cited_by_count} 引用
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paper Detail */}
      <div className="lg:col-span-2">
        {selectedPaper ? (
          <PaperDetail paper={selectedPaper} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            选择一篇论文查看详情
          </div>
        )}
      </div>
    </div>
  )
}

function PaperDetail({ paper }: { paper: any }) {
  const analysis = paper.rag_analysis || paper.deep_analysis || {}

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{paper.title}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>{paper.year}</span>
          <span>·</span>
          <span>{paper.cited_by_count} 引用</span>
          {paper.doi && (
            <>
              <span>·</span>
              <a href={paper.doi} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                DOI
              </a>
            </>
          )}
        </div>
        {paper.authors && (
          <div className="mt-2 text-sm text-gray-600">
            作者: {paper.authors.join(', ')}
          </div>
        )}
      </div>

      {paper.abstract && (
        <div>
          <h3 className="font-semibold mb-2">摘要</h3>
          <p className="text-gray-700">{paper.abstract}</p>
        </div>
      )}

      {analysis.problem && (
        <div>
          <h3 className="font-semibold mb-2">研究问题</h3>
          <p className="text-gray-700">{analysis.problem}</p>
        </div>
      )}

      {analysis.method && (
        <div>
          <h3 className="font-semibold mb-2">方法</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis.method}</p>
        </div>
      )}

      {analysis.limitation && (
        <div>
          <h3 className="font-semibold mb-2">局限性</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis.limitation}</p>
        </div>
      )}

      {analysis.future_work && (
        <div>
          <h3 className="font-semibold mb-2">未来工作</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis.future_work}</p>
        </div>
      )}
    </div>
  )
}

function SurveyTab({ taskId }: { taskId: string }) {
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSurvey()
  }, [taskId])

  const loadSurvey = async () => {
    try {
      const data = await apiClient.getSurvey(taskId)
      setSurvey(data)
    } catch (error) {
      console.error('Failed to load survey:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>
  }

  if (!survey || Object.keys(survey).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
        暂无调研报告
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">深度调研报告</h2>
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {JSON.stringify(survey, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function IdeasTab({ taskId }: { taskId: string }) {
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdeas()
  }, [taskId])

  const loadIdeas = async () => {
    try {
      const data = await apiClient.getIdeas(taskId)
      // Handle both array and object formats
      const ideasList = Array.isArray(data) ? data : (data.ideas || [])
      setIdeas(ideasList)
    } catch (error) {
      console.error('Failed to load ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>
  }

  if (ideas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
        暂无研究想法
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea: any, idx: number) => (
        <div key={idx} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-2">
            {idea.title || idea.idea_title || `研究想法 ${idx + 1}`}
          </h3>
          {idea.description && (
            <p className="text-gray-700 mb-4">{idea.description}</p>
          )}
          {idea.summary && (
            <p className="text-gray-700 mb-4">{idea.summary}</p>
          )}
          {idea.feasibility && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold mb-1">可行性分析</div>
              <p className="text-sm text-gray-700">{idea.feasibility}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

