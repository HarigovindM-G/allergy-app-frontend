import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenContainer from "@/components/ui/ScreenContainer";

// Medicine type definition
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  expirationDate?: string;
};

export default function MedicineScreen() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch("YOUR_BACKEND_API_URL/medicines");
      const data = await res.json();
      setMedicines(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addMedicine = async () => {
    if (!name || !dosage) return alert("Please enter all fields");

    const newMed = { name, dosage, expirationDate };

    try {
      const res = await fetch("YOUR_BACKEND_API_URL/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed),
      });

      if (res.ok) {
        fetchMedicines();
        setName("");
        setDosage("");
        setExpirationDate("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenContainer>
      <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-6">
        Medicine List
      </Text>

      {/* Input Fields */}
      <View className="space-y-4">
        <TextInput
          className="rounded-lg mb-4 p-4 bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Medicine Name"
          placeholderTextColor="#a1a1a1"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="rounded-lg p-4 mb-4 bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Dosage"
          placeholderTextColor="#a1a1a1"
          value={dosage}
          onChangeText={setDosage}
        />
        <TextInput
          className="rounded-lg p-4 mb-4 bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Expiration Date"
          placeholderTextColor="#a1a1a1"
          value={expirationDate}
          onChangeText={setExpirationDate}
        />
        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-600 rounded-lg py-4 shadow-md"
          onPress={addMedicine}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Add Medicine</Text>
        </TouchableOpacity>
      </View>

      {/* Medicine List */}
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3 shadow-md">
            <Text className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {item.name} - {item.dosage}
            </Text>
            {item.expirationDate && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Exp: {item.expirationDate}
              </Text>
            )}
          </View>
        )}
      />
    </ScreenContainer>
  );
}
