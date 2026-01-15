import ResultDetail from './client-page'

// 路由段配置
export const dynamic = 'force-static'

// 为静态导出生成参数
export async function generateStaticParams() {
  // 返回一个占位符，用于静态导出
  // 实际的路由将在客户端动态处理
  return [{ id: 'placeholder' }]
}

// 服务器组件包装器
export default function ResultDetailPage() {
  return <ResultDetail />
}
