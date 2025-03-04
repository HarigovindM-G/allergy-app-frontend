import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";

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
    try {
      const res = await fetch("");
      const data = await res.json();
      setMedicines(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addMedicine = async () => {
    const newMed = {
      name: "EpiPen",
      dosage: "0.3mg",
      expirationDate: "2025-12-31",
    };
    try {
      await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMed),
      });
      fetchMedicines();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-2">My Medicines</Text>
      <Button title="Add Medicine (Mock)" onPress={addMedicine} />

      <FlatList
        data={medicines}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="border-b border-gray-200 py-2">
            <Text className="font-semibold">{item.name}</Text>
            <Text>Dosage: {item.dosage}</Text>
            <Text>Expires: {item.expirationDate}</Text>
          </View>
        )}
      />
    </View>
  );
}
