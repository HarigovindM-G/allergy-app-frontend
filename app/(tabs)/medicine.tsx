// app/(tabs)/medicine.tsx
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";

type Medicine = {
  id: number;
  name: string;
  dosage: string;
  expirationDate?: string;
};

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    // fetch from your backend or mock
    setMedicines([
      { id: 1, name: "EpiPen", dosage: "0.3mg", expirationDate: "2025-12-31" },
    ]);
  };

  const addMedicine = async () => {
    // mock add
    const newMed = {
      id: Date.now(),
      name: "Benadryl",
      dosage: "25mg",
      expirationDate: "2024-06-01",
    };
    setMedicines((prev) => [...prev, newMed]);
  };

  return (
    <ScreenContainer>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Medicines
        </Text>
        <TouchableOpacity
          onPress={addMedicine}
          className="flex-row items-center bg-blue-600 px-3 py-2 rounded-md shadow"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="ml-1 text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="mb-3 bg-white dark:bg-gray-800 rounded-md p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {item.name}
            </Text>
            <Text className="text-gray-800 dark:text-gray-200">
              Dosage: {item.dosage}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Expires: {item.expirationDate}
            </Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
