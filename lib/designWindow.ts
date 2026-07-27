import {
  Platform,
  useWindowDimensions,
  type ScaledSize,
} from 'react-native'

/** 디자인 기준 캔버스 */
export const DESIGN_WIDTH = 360
export const DESIGN_HEIGHT = 800

/** 웹은 디자인 캔버스 크기, 네이티브는 실기기 크기 */
export function useDesignWindow(): ScaledSize {
  const win = useWindowDimensions()
  if (Platform.OS === 'web') {
    return {
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      scale: win.scale,
      fontScale: win.fontScale,
    }
  }
  return win
}
