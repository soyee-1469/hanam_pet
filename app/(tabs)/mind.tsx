import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MindScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-beige-100">
      <View className="items-center gap-2 px-8">
        <Text className="text-[24px] font-extrabold text-cocoa">마음챙김</Text>
        <Text className="text-center text-[17px] text-cocoa-soft">다음 화면에서 구현 예정입니다.</Text>
      </View>
    </SafeAreaView>
  )
}
