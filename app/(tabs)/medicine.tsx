import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert, Platform, ScrollView, KeyboardAvoidingView, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { API_URL } from '@/constants/Config';
import { useAuth } from "@/hooks/useAuth";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Medicine type definition
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  expiration_date?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at?: string;
};

// Sample medicines for presentation
const SAMPLE_MEDICINES: Medicine[] = [
  {
    id: 1,
    name: "Cetirizine",
    dosage: "10mg",
    expiration_date: "2024-12-31",
    notes: "Take once daily for allergies",
    reminder_enabled: true,
    reminder_time: "08:00",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Epinephrine Auto-Injector",
    dosage: "0.3mg",
    expiration_date: "2025-06-30",
    notes: "Emergency use only",
    reminder_enabled: false,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Loratadine",
    dosage: "10mg",
    expiration_date: "2024-10-15",
    notes: "Take as needed",
    reminder_enabled: true,
    reminder_time: "20:00",
    created_at: new Date().toISOString()
  }
];

export default function MedicineScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>(SAMPLE_MEDICINES);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [dateInputText, setDateInputText] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = () => {
    if (!name || !dosage) {
      Alert.alert("Error", "Please enter medicine name and dosage");
      return;
    }

    const newMedicine: Medicine = {
      id: medicines.length + 1,
      name,
      dosage,
      expiration_date: expirationDate || undefined,
      notes: notes || undefined,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderEnabled ? reminderTime.toISOString() : undefined,
      created_at: new Date().toISOString()
    };

    if (editingMedicine) {
      setMedicines(medicines.map(med => 
        med.id === editingMedicine.id ? { ...newMedicine, id: med.id } : med
      ));
    } else {
      setMedicines([...medicines, newMedicine]);
    }

    resetForm();
    setShowModal(false);
    Alert.alert("Success", editingMedicine ? "Medicine updated successfully" : "Medicine added successfully");
  };

  const deleteMedicine = (id: number) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const resetForm = () => {
    setName("");
    setDosage("");
    setExpirationDate("");
    setDateInputText("");
    setNotes("");
    setReminderEnabled(false);
    setReminderTime(new Date());
    setEditingMedicine(null);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setName(medicine.name);
    setDosage(medicine.dosage);
    if (medicine.expiration_date) {
      setExpirationDate(medicine.expiration_date);
      const date = new Date(medicine.expiration_date);
      setDateInputText(date.toLocaleDateString());
    }
    setNotes(medicine.notes || "");
    setReminderEnabled(medicine.reminder_enabled);
    if (medicine.reminder_time) {
      setReminderTime(new Date(medicine.reminder_time));
    }
    setShowModal(true);
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to delete this medicine?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteMedicine(id), style: "destructive" }
      ]
    );
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <Animated.View style={[styles.medicineCard, { opacity: fadeAnim }]}>
      <View>
        <View style={styles.medicineHeader}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <View style={styles.medicineActions}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={22} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={22} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.medicineDosage}>Dosage: {item.dosage}</Text>
        {item.expiration_date && (
          <Text style={styles.medicineExpiry}>Expires: {new Date(item.expiration_date).toLocaleDateString()}</Text>
        )}
        {item.notes && <Text style={styles.medicineNotes}>{item.notes}</Text>}
        {item.reminder_enabled && (
          <View style={styles.reminderContainer}>
            <Ionicons name="alarm-outline" size={18} color="#666" />
            <Text style={styles.reminderText}>Reminder: Invalid Date</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <ScreenContainer style={{ backgroundColor: '#111827' }}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medicines</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={medicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter medicine name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="Enter dosage"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{dateInputText || "Select expiration date"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes"
                  multiline
                />
              </View>

              <View style={styles.reminderToggle}>
                <Text style={styles.label}>Set Reminder</Text>
                <TouchableOpacity
                  style={[styles.toggleButton, reminderEnabled && styles.toggleButtonActive]}
                  onPress={() => setReminderEnabled(!reminderEnabled)}
                >
                  <Text style={[styles.toggleText, reminderEnabled && styles.toggleTextActive]}>
                    {reminderEnabled ? "ON" : "OFF"}
                  </Text>
                </TouchableOpacity>
              </View>

              {reminderEnabled && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reminder Time</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  {editingMedicine ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={expirationDate ? new Date(expirationDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setExpirationDate(date.toISOString());
              setDateInputText(date.toLocaleDateString());
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              setReminderTime(date);
            }
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#111827',
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  medicineDosage: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 2,
  },
  medicineExpiry: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  medicineNotes: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  reminderText: {
    fontSize: 14,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1F2937',
  },
  reminderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
});
