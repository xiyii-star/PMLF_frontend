'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle2, Circle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { apiClient, TaskStatus } from '@/lib/api'
import Link from 'next/link'

const PHASES = [
  { id: 'phase1', name: '论文搜索', description: '搜索和筛选相关论文' },
  { id: 'phase2', name: 'PDF下载', description: '下载论文PDF文件' },
  { id: 'phase3', name: '论文分析', description: 'DeepPaper多智能体分析' },
  { id: 'phase4', name: '引用类型', description: '推断引用关系类型' },
  { id: 'phase5', name: '图谱构建', description: '构建知识图谱' },
  { id: 'phase6', name: '深度调研', description: '生成调研报告' },
  { id: 'phase7', name: '研究想法', description: '生成研究想法' },
  { id: 'phase8', name: '结果输出', description: '保存和可视化结果' },
]

export default function PipelineExecution() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string }>>([])
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!taskId) return

    // Load initial status
    loadStatus()

    // Connect WebSocket
    connectWebSocket()

    // Poll status
    const statusInterval = setInterval(loadStatus, 2000)

    return () => {
      clearInterval(statusInterval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [taskId])

  useEffect(() => {
    // Auto-scroll logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    // Redirect to results when completed
    if (taskStatus?.status === 'completed') {
      setTimeout(() => {
        router.push(`/results/${taskId}`)
      }, 2000)
    }
  }, [taskStatus?.status, taskId, router])

  const loadStatus = async () => {
    try {
      const status = await apiClient.getTaskStatus(taskId)
      setTaskStatus(status)
    } catch (error) {
      console.error('Failed to load status:', error)
    }
  }

  const connectWebSocket = () => {
    try {
      const wsUrl = apiClient.getWebSocketUrl(taskId)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setWsConnected(true)
        wsRef.current = ws
      }

      ws.onmessage = (event) => {
        const logEntry = JSON.parse(event.data)
        setLogs((prev) => [...prev, logEntry])
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setWsConnected(false)
      }

      ws.onclose = () => {
        setWsConnected(false)
        // Try to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  const getPhaseStatus = (phaseId: string) => {
    if (!taskStatus) return 'pending'
    const phaseProgress = taskStatus.progress[phaseId]
    if (!phaseProgress) return 'pending'
    return phaseProgress.status || 'pending'
  }

  const getPhaseIcon = (phaseId: string) => {
    const status = getPhaseStatus(phaseId)
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Circle className="w-6 h-6 text-gray-300" />
    }
  }

  if (!taskStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Pipeline 执行中</h1>
                <p className="text-sm text-gray-600">任务 ID: {taskId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {wsConnected ? '已连接' : '未连接'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">执行进度</h2>
              <div className="space-y-4">
                {PHASES.map((phase, idx) => (
                  <div key={phase.id} className="flex items-start space-x-3">
                    {getPhaseIcon(phase.id)}
                    <div className="flex-1">
                      <div className="font-semibold">{phase.name}</div>
                      <div className="text-sm text-gray-600">{phase.description}</div>
                      {taskStatus.progress[phase.id] && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(taskStatus.progress[phase.id], null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-2">当前状态</div>
                <div className="text-lg font-semibold">
                  {taskStatus.status === 'running' && '运行中'}
                  {taskStatus.status === 'completed' && '已完成'}
                  {taskStatus.status === 'failed' && '失败'}
                  {taskStatus.status === 'pending' && '等待中'}
                </div>
                {taskStatus.current_phase && (
                  <div className="text-sm text-gray-600 mt-1">
                    当前阶段: {taskStatus.current_phase}
                  </div>
                )}
                {taskStatus.error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {taskStatus.error}
                  </div>
                )}
                {taskStatus.status === 'completed' && (
                  <div className="mt-4">
                    <Link
                      href={`/results/${taskId}`}
                      className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      查看结果 →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">实时日志</h2>
                <button
                  onClick={() => setLogs([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  清空
                </button>
              </div>
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">等待日志输出...</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

