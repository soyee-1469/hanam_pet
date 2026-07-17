import type { ReactNode } from 'react'
import { useWindowDimensions } from 'react-native'

/** 디자인 기준 캔버스 (레이아웃·카피 참고용) */
export const DESIGN_WIDTH = 360
export const DESIGN_HEIGHT = 800

type AppViewportProps = {
  children: ReactNode
}

/**
 * 웹·네이티브 모두 실제 화면을 그대로 사용 (반응형).
 * 예전에 쓰던 고정 프레임은 가로 확장을 막아 제거함.
 */
export function AppViewport({ children }: AppViewportProps) {
  return <>{children}</>
}

/** 실제 창 크기 — 반응형 레이아웃용 */
export function useDesignWindow() {
  return useWindowDimensions()
}
