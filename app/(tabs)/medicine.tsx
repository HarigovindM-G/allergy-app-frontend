import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert, Platform, ScrollView, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { API_URL, getApiUrl } from '@/constants/Config';
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

export default function MedicineScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
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

  // Helper function to get token with validation
  const getToken = async () => {
    try {
      let token = null;
      
      // Try SecureStore first
      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync('access_token');
      }
      
      // Fallback to AsyncStorage if no token in SecureStore
      if (!token) {
        token = await AsyncStorage.getItem('access_token');
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }
    fetchMedicines();
  }, [isAuthenticated]);

  const fetchMedicines = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const url = getApiUrl('/medicines');
      console.log('Fetching medicines from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const res = await fetch(url, { 
        method: 'GET',
        headers
      });

      if (res.status === 401) {
        router.replace("/(auth)/login");
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMedicines(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert("Error", "Failed to fetch medicines. Please try again.");
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button pressed');
    console.log('Form data:', { name, dosage, expirationDate, notes, reminderEnabled, reminderTime });

    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please login to add medicines",
        [
          { text: "OK", onPress: () => router.push("/(auth)/login") }
        ]
      );
      return;
    }

    if (!name || !dosage) {
      Alert.alert("Error", "Please enter medicine name and dosage");
      return;
    }

    const medicineData = {
      name,
      dosage,
      expiration_date: expirationDate || undefined,
      notes: notes || undefined,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderEnabled ? reminderTime.toISOString() : undefined
    };

    console.log('Sending medicine data:', medicineData);

    try {
      const token = await getToken();
      console.log('Token retrieved:', token ? 'Yes' : 'No');
      
      if (!token) {
        Alert.alert(
          "Authentication Required",
          "Please login to add medicines",
          [
            { text: "OK", onPress: () => router.push("/(auth)/login") }
          ]
        );
        return;
      }

      const url = editingMedicine 
        ? getApiUrl(`/medicines/${editingMedicine.id}`)
        : getApiUrl('/medicines');
      
      const method = editingMedicine ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      console.log('Using headers:', headers);

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(medicineData),
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to save medicine: ${errorText}`);
      }

      const responseData = await res.text();
      console.log('Server response:', responseData);

      await fetchMedicines();
      resetForm();
      setShowModal(false);
      Alert.alert("Success", editingMedicine ? "Medicine updated successfully" : "Medicine added successfully");
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save medicine. Please try again.");
    }
  };

  const deleteMedicine = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Please login to delete medicines");
        return;
      }

      const res = await fetch(`${API_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to delete medicine');
      }

      await fetchMedicines();
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert("Error", "Failed to delete medicine. Please try again.");
    }
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
      const date = new Date(medicine.expiration_date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      setDateInputText(`${day}-${month}-${year}`);
      setExpirationDate(medicine.expiration_date);
    } else {
      setDateInputText("");
      setExpirationDate("");
    }
    setNotes(medicine.notes || "");
    setReminderEnabled(medicine.reminder_enabled);
    setReminderTime(medicine.reminder_time ? new Date(medicine.reminder_time) : new Date());
    setShowModal(true);
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Medicine",
      "Are you sure you want to delete this medicine?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMedicine(id) }
      ]
    );
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <Card variant="outlined">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Dosage: {item.dosage}
          </Text>
          {item.expiration_date && (
            <Text className="text-gray-600 dark:text-gray-400">
              Expires: {new Date(item.expiration_date).toLocaleDateString()}
            </Text>
          )}
          {item.notes && (
            <Text className="text-gray-600 dark:text-gray-400 mt-1">
              Notes: {item.notes}
            </Text>
          )}
          {item.reminder_enabled && item.reminder_time && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 dark:text-gray-400 ml-1">
                Reminder: {new Date(item.reminder_time).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="p-2 mr-2"
          >
            <Ionicons name="pencil" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => confirmDelete(item.id)}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);  // Always close the picker after selection
    
    if (event.type === 'set' && selectedDate) {  // Only update if user confirmed the selection
      setExpirationDate(selectedDate.toISOString());
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  return (
    <ScreenContainer>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Medicine List
        </Text>
        <TouchableOpacity
          onPress={openModal}
          className="bg-blue-600 rounded-full p-3"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {medicines.length > 0 ? (
        <FlatList
          data={medicines}
          renderItem={renderMedicineItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Card variant="outlined">
          <View className="items-center py-8">
            <Ionicons name="medical-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-4">
              No medicines added yet
            </Text>
          </View>
        </Card>
      )}

      {/* Add/Edit Medicine Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity 
            className="flex-1"
            activeOpacity={1}
            onPress={closeModal}
          />
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="bg-white dark:bg-gray-800 rounded-t-3xl"
          >
            <View className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingMedicine ? "Edit Medicine" : "Add Medicine"}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView>
              <View className="p-6 space-y-6">
                <View>
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medicine Name
                  </Text>
                  <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-gray-100"
                    placeholder="Enter medicine name"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dosage
                  </Text>
                  <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-gray-100"
                    placeholder="Enter dosage"
                    placeholderTextColor="#9ca3af"
                    value={dosage}
                    onChangeText={setDosage}
                  />
                </View>

                <View>
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiration Date
                  </Text>
                  <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-gray-100"
                    placeholder="Enter date (DD-MM-YYYY)"
                    placeholderTextColor="#9ca3af"
                    value={dateInputText}
                    onChangeText={(text) => {
                      // Basic validation for DD-MM-YYYY format
                      if (text.length <= 10) {
                        // Add hyphens automatically
                        text = text.replace(/\D/g, ''); // Remove non-digits
                        if (text.length > 2) text = text.slice(0, 2) + '-' + text.slice(2);
                        if (text.length > 5) text = text.slice(0, 5) + '-' + text.slice(5);
                        
                        setDateInputText(text);
                        
                        // Convert to ISO string if it's a complete date
                        if (text.length === 10) {
                          const [day, month, year] = text.split('-');
                          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          if (!isNaN(date.getTime())) {
                            setExpirationDate(date.toISOString());
                          }
                        } else {
                          setExpirationDate("");
                        }
                      }
                    }}
                    maxLength={10}
                    keyboardType="numeric"
                  />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Format: DD-MM-YYYY (e.g., 31-12-2024)
                  </Text>
                </View>

                <View>
                  <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </Text>
                  <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-gray-100"
                    placeholder="Add any notes about this medicine"
                    placeholderTextColor="#9ca3af"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    style={{ minHeight: 100, textAlignVertical: 'top' }}
                  />
                </View>

                <View className="py-2">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-base font-medium text-gray-700 dark:text-gray-300">
                      Enable Reminder
                    </Text>
                    <TouchableOpacity
                      onPress={() => setReminderEnabled(!reminderEnabled)}
                      className={`w-14 h-8 rounded-full ${reminderEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <View
                        className={`w-6 h-6 rounded-full bg-white shadow m-1 ${
                          reminderEnabled ? 'ml-7' : ''
                        }`}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {reminderEnabled && (
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(true)}
                      className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-row items-center"
                    >
                      <Ionicons 
                        name="time-outline" 
                        size={20} 
                        color="#6b7280" 
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-gray-900 dark:text-gray-100">
                        {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>

            <View className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-blue-600 rounded-xl py-4"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {editingMedicine ? "Update Medicine" : "Add Medicine"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View className="bg-white dark:bg-gray-800 p-4">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text className="text-blue-600 text-lg">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setShowTimePicker(false);
                  }}
                >
                  <Text className="text-blue-600 text-lg">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                style={{ backgroundColor: 'white' }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </ScreenContainer>
  );
}
