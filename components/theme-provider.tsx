'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // useEffect는 클라이언트 사이드에서만 실행됩니다
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 첫 번째 렌더링에서는 자식 컴포넌트를 렌더링하지 않습니다
  // 이렇게 하면 서버 사이드 렌더링과 클라이언트 사이드 렌더링이 일치하게 됩니다
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
