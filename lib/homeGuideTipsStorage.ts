import AsyncStorage from '@react-native-async-storage/async-storage'

const RECEIVE_KEY = 'hp_home_guide_receive_tip_v1'
const STOCK_KEY = 'hp_home_guide_stock_tip_v1'

export type HomeGuideTips = {
  receiveDismissed: boolean
  stockDismissed: boolean
}

export async function getHomeGuideTips(): Promise<HomeGuideTips> {
  try {
    const [receive, stock] = await AsyncStorage.multiGet([
      RECEIVE_KEY,
      STOCK_KEY,
    ])
    return {
      receiveDismissed: receive[1] === '1',
      stockDismissed: stock[1] === '1',
    }
  } catch {
    return { receiveDismissed: false, stockDismissed: false }
  }
}

export async function dismissHomeReceiveTip(): Promise<void> {
  await AsyncStorage.setItem(RECEIVE_KEY, '1')
}

export async function dismissHomeStockTip(): Promise<void> {
  await AsyncStorage.setItem(STOCK_KEY, '1')
}

/** 개발/검수: 최초 진입 팁 다시 보기 */
export async function resetHomeGuideTips(): Promise<void> {
  await AsyncStorage.multiRemove([RECEIVE_KEY, STOCK_KEY])
}
