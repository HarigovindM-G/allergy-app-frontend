import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView } from "react-native";

type Medicine = {
  id: number;
  name: string;
  dosage: string;
  expirationDate?: string;
};

export default function MedicineScreen() {
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
        fetchMedicines(); // Refresh list after adding
        setName("");
        setDosage("");
        setExpirationDate(""); // Clear inputs
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Medicine List</Text>

      {/* Input Fields at the Top */}
      <TextInput style={styles.input} placeholder="Medicine Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Dosage" value={dosage} onChangeText={setDosage} />
      <TextInput style={styles.input} placeholder="Expiration Date" value={expirationDate} onChangeText={setExpirationDate} />
      <Button title="Add Medicine" onPress={addMedicine} />

      {/* Medicine List Below */}
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.medicineItem}>{item.name} - {item.dosage} ({item.expirationDate})</Text>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  medicineItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
});
