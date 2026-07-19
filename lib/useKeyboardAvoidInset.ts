import { useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

type Options = {
  /** 키보드가 열릴 때 (네이티브 show / 웹 inset > 60) */
  onOpen?: () => void
  /** false면 리스너 해제·inset 초기화 (시트 닫힘 등) */
  enabled?: boolean
}

/**
 * 채팅과 동일한 키보드 inset.
 * - 네이티브: Keyboard show/hide
 * - 웹(모바일): visualViewport resize/scroll → soft keyboard 높이
 * - 데스크톱: inset ≈ 0 (가짜 키보드 없음)
 */
export function useKeyboardAvoidInset({
  onOpen,
  enabled = true,
}: Options = {}) {
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [webKeyboardInset, setWebKeyboardInset] = useState(0)
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (!enabled) {
      setKeyboardOpen(false)
      setWebKeyboardInset(0)
      return
    }

    if (Platform.OS === 'web') {
      const vv =
        typeof window !== 'undefined' ? window.visualViewport : null
      if (!vv) return
      const sync = () => {
        const inset = Math.max(
          0,
          window.innerHeight - vv.height - vv.offsetTop,
        )
        setWebKeyboardInset(inset)
        const open = inset > 60
        setKeyboardOpen(open)
        if (open) onOpenRef.current?.()
      }
      vv.addEventListener('resize', sync)
      vv.addEventListener('scroll', sync)
      sync()
      return () => {
        vv.removeEventListener('resize', sync)
        vv.removeEventListener('scroll', sync)
      }
    }

    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvt, () => {
      setKeyboardOpen(true)
      onOpenRef.current?.()
    })
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardOpen(false)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [enabled])

  return { keyboardOpen, webKeyboardInset }
}

/** KeyboardAvoidingView behavior — chat과 동일 */
export function keyboardAvoidingBehavior():
  | 'padding'
  | 'height'
  | undefined {
  if (Platform.OS === 'ios') return 'padding'
  if (Platform.OS === 'android') return 'height'
  return undefined
}

export const keyboardVerticalOffset = Platform.OS === 'ios' ? 8 : 0
