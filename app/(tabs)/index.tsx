import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeScreen() {

    const router = useRouter();

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        // For v2 router, you can do:
        router.replace("/(auth)/login");
  };
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-xl font-bold">Welcome to Allergy App</Text>
      <Text className="mt-4 text-gray-600">
        Quickly detect allergens by scanning product labels or manually entering ingredients.
      </Text>

      <Link href="/(tabs)/scan" className="mt-6 text-blue-600">
        Go to Scan
      </Link>
      <Link href="/(tabs)/manual" className="mt-2 text-blue-600">
        Go to Manual Input
      </Link>
      <TouchableOpacity
        onPress={handleLogout}
        className="mt-6 bg-red-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
