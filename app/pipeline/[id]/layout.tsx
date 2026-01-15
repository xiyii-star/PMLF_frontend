// 路由段配置
export const dynamic = 'force-static'

// 服务器组件：为动态路由提供静态参数生成
export async function generateStaticParams() {
  // 返回一个占位符，用于静态导出
  return [{ id: 'placeholder' }]
}

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
