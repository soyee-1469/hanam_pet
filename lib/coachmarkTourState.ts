/** 펫 홈·대화 등 탭을 넘는 코치마크 진행 상태 */

type Listener = () => void

let stepIndex: number | null = null
/** cm-06 — 투어 종료 후 홈에서 완료 시트 표시 */
let completePending = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export function getPetTourStepIndex(): number | null {
  return stepIndex
}

export function setPetTourStepIndex(next: number | null): void {
  stepIndex = next
  emit()
}

export function getPetTourCompletePending(): boolean {
  return completePending
}

export function subscribePetTour(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function startPetTourFromWelcome(): void {
  completePending = false
  setPetTourStepIndex(0)
}

export function clearPetTour(): void {
  setPetTourStepIndex(null)
}

/** 마지막 스텝 다음 — 투어 종료 + 완료 시트 대기 */
export function finishPetTourWithComplete(): void {
  stepIndex = null
  completePending = true
  emit()
}

export function dismissPetTourComplete(): void {
  if (!completePending) return
  completePending = false
  emit()
}
