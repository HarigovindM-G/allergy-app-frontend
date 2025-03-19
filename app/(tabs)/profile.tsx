import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
  Platform
} from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "@/constants/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/useAuth";
import * as SecureStore from "expo-secure-store";

// Define types
interface Allergy {
  id: string;
  name: string;
  category: string;
  severity: "High" | "Medium" | "Low" | null;
  notes: string | null;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userAllergies, setUserAllergies] = useState<Allergy[]>([]);
  const [commonAllergies, setCommonAllergies] = useState<Allergy[]>([]);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<"High" | "Medium" | "Low" | null>(null);
  const [allergyNotes, setAllergyNotes] = useState("");
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch user data and allergies on component mount
  useEffect(() => {
    if (isAuthenticated && authUser) {
      console.log("Auth user data available:", authUser);
      setUser(authUser);
      setUserAllergies(Array.isArray(authUser.allergies) ? authUser.allergies : []);
      setLoading(false);
    } else if (!authLoading) {
      // Only try direct API call if auth context has finished loading
      fetchUserData();
    }
    fetchCommonAllergies();
  }, [isAuthenticated, authUser, authLoading]);

  // Fetch user data from API
  const fetchUserData = async (retryCount = 0) => {
    setLoading(true);
    try {
      // Get token from multiple possible sources
      const token = await getAuthToken();
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        // Unauthorized - token might be expired
        console.error("Unauthorized - token might be expired");
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('token');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }

      const data = await res.json();
      console.log("User data:", data);
      setUser(data);
      // Handle potential null/undefined allergies
      setUserAllergies(Array.isArray(data.allergies) ? data.allergies : []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => fetchUserData(retryCount + 1), delay);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch common allergies list
  const fetchCommonAllergies = async () => {
    try {
      console.log("Fetching common allergies list from API...");
      const res = await fetch(`${API_URL}/auth/allergies/common`);
      
      if (!res.ok) {
        console.error(`Failed to fetch common allergies: ${res.status}`);
        const errorText = await res.text();
        console.error("Error details:", errorText);
        return false;
      }
      
      const data = await res.json();
      console.log(`Loaded ${data.length} common allergies`);
      setCommonAllergies(data);
      return true;
    } catch (error) {
      console.error("Error fetching common allergies:", error);
      return false;
    }
  };

  // Get token for API requests, trying multiple sources
  const getAuthToken = async () => {
    try {
      // Try multiple sources in order
      // 1. Check if we can get the token from SecureStore directly
      if (Platform.OS !== 'web') {
        try {
          const secureToken = await SecureStore.getItemAsync('access_token');
          if (secureToken) {
            console.log("Found token in SecureStore");
            return secureToken;
          }
        } catch (e) {
          console.error("Error accessing SecureStore:", e);
        }
      }
      
      // 2. Check AsyncStorage access_token
      let token = await AsyncStorage.getItem('access_token');
      if (token) {
        console.log("Found token in AsyncStorage (access_token)");
        return token;
      }
      
      // 3. Try token key for backward compatibility
      token = await AsyncStorage.getItem('token');
      if (token) {
        console.log("Found token in AsyncStorage (token) - migrating");
        // Migrate the token to the correct key
        await AsyncStorage.setItem('access_token', token);
        return token;
      }
      
      // 4. If authenticated in context but no token found, try to get a new one
      if (isAuthenticated && user) {
        console.log("Authenticated in context but no token found, refreshing user data");
        // Force a refresh in the auth context
        // Note: This would require extra implementation in the auth context
        return null;
      }
      
      // No token found
      console.error("No authentication token found in any storage");
      return null;
    } catch (error) {
      console.error("Error retrieving auth token:", error);
      return null;
    }
  };

  // Save user allergies
  const saveUserAllergies = async () => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }
      
      console.log("Saving allergies:", JSON.stringify(userAllergies, null, 2));
      
      const res = await fetch(`${API_URL}/auth/me/allergies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ allergies: userAllergies })
      });

      if (res.status === 401) {
        Alert.alert("Error", "You are not logged in or your session has expired");
        return;
      }

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Server error:", errorData);
        throw new Error(`Failed to update allergies: ${res.status}`);
      }

      const result = await res.json();
      console.log("Update result:", result);

      if (result.status === "success") {
        Alert.alert("Success", "Your allergies have been updated successfully");
      } else {
        Alert.alert("Warning", result.message || "Allergies may not have been fully updated");
      }
    } catch (error) {
      console.error("Error updating allergies:", error);
      Alert.alert("Error", `Failed to update allergies: ${error.message || "Unknown error"}`);
    }
  };

  // Add allergy to user's list
  const addAllergy = (allergy: Allergy) => {
    setSelectedAllergy(allergy);
    setSelectedSeverity(null);
    setAllergyNotes("");
    setShowAllergyModal(true);
  };

  // Confirm adding allergy with severity and notes
  const confirmAddAllergy = async () => {
    if (!selectedAllergy) return;

    // Check if allergy already exists
    const exists = userAllergies.some(a => a.id === selectedAllergy.id);
    if (exists) {
      Alert.alert("Already Added", "This allergy is already in your list");
      return;
    }

    // Add allergy with severity and notes
    const newAllergy: Allergy = {
      ...selectedAllergy,
      severity: selectedSeverity,
      notes: allergyNotes || null
    };

    const updatedAllergies = [...userAllergies, newAllergy];
    setUserAllergies(updatedAllergies);
    setShowAllergyModal(false);
    
    // Save updated allergies directly
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.error("No authentication token found when adding allergy");
        if (isAuthenticated) {
          // If auth context says we're authenticated but token isn't found
          Alert.alert("Error", "Authentication issue detected. Please try logging out and back in.");
        } else {
          Alert.alert("Error", "Not authenticated. Please log in first.");
        }
        return;
      }
      
      console.log("Saving updated allergies with token:", token.substring(0, 10) + "...");
      
      const res = await fetch(`${API_URL}/auth/me/allergies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ allergies: updatedAllergies })
      });

      if (res.status === 401) {
        Alert.alert("Error", "You are not logged in or your session has expired");
        return;
      }

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Server error while adding allergy:", errorData);
        throw new Error(`Failed to update allergies: ${res.status}`);
      }

      const result = await res.json();
      console.log("Allergy update result:", result);

      if (result.status === "success") {
        Alert.alert("Success", "Allergy added successfully");
      } else {
        Alert.alert("Warning", result.message || "Allergy may not have been fully added");
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
      Alert.alert("Error", `Failed to add allergy: ${error.message || "Unknown error"}`);
    }
  };

  // Remove allergy from user's list
  const removeAllergy = (allergyId: string) => {
    Alert.alert(
      "Remove Allergy",
      "Are you sure you want to remove this allergy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updatedAllergies = userAllergies.filter(a => a.id !== allergyId);
            setUserAllergies(updatedAllergies);
            
            // Save updated allergies
            try {
              const token = await getAuthToken();
              
              if (!token) {
                Alert.alert("Error", "Not authenticated");
                return;
              }
              
              const res = await fetch(`${API_URL}/auth/me/allergies`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ allergies: updatedAllergies })
              });

              if (!res.ok) {
                throw new Error("Failed to update allergies");
              }
            } catch (error) {
              console.error("Error updating allergies:", error);
              Alert.alert("Error", "Failed to update allergies");
            }
          }
        }
      ]
    );
  };

  // Render severity badge
  const renderSeverityBadge = (severity: string | null) => {
    if (!severity) return null;

    let color;
    let bgColor;
    
    switch (severity) {
      case "High":
        color = "text-red-600 dark:text-red-400";
        bgColor = "bg-red-100 dark:bg-red-900";
        break;
      case "Medium":
        color = "text-orange-600 dark:text-orange-400";
        bgColor = "bg-orange-100 dark:bg-orange-900";
        break;
      case "Low":
        color = "text-yellow-600 dark:text-yellow-400";
        bgColor = "bg-yellow-100 dark:bg-yellow-900";
        break;
      default:
        color = "text-gray-600 dark:text-gray-400";
        bgColor = "bg-gray-100 dark:bg-gray-900";
    }

    return (
      <View className={`${bgColor} rounded-full px-2 py-1`}>
        <Text className={`${color} text-xs font-medium`}>
          {severity}
        </Text>
      </View>
    );
  };

  // Render allergies list
  const renderAllergyItem = ({ item }: { item: Allergy }) => (
    <TouchableOpacity
      className="mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
      onPress={() => {
        setSelectedAllergy(item);
        setSelectedSeverity(item.severity);
        setAllergyNotes(item.notes || "");
        setShowAllergyModal(true);
      }}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text className="text-gray-900 dark:text-gray-100 font-semibold">{item.name}</Text>
        </View>
        {renderSeverityBadge(item.severity)}
        <TouchableOpacity 
          onPress={() => removeAllergy(item.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          className="ml-2"
        >
          <Ionicons name="close-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
      {item.notes && (
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.notes}</Text>
      )}
    </TouchableOpacity>
  );

  // Render common allergies list
  const renderCommonAllergyItem = ({ item }: { item: Allergy }) => {
    const isAdded = userAllergies.some(a => a.id === item.id);
    
    return (
      <TouchableOpacity
        className={`mb-2 p-3 ${isAdded ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} rounded-lg shadow-sm`}
        onPress={() => !isAdded && addAllergy(item)}
        disabled={isAdded}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Ionicons 
              name={isAdded ? "checkmark-circle" : "add-circle"} 
              size={20} 
              color={isAdded ? "#22c55e" : "#3b82f6"} 
              style={{ marginRight: 8 }} 
            />
            <Text className="text-gray-900 dark:text-gray-100 font-semibold">{item.name}</Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Modal for adding/editing allergy
  const AllergyModal = () => (
    <Modal
      visible={showAllergyModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAllergyModal(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 h-2/3">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {userAllergies.some(a => a.id === selectedAllergy?.id) ? "Edit" : "Add"} Allergy
            </Text>
            <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {selectedAllergy && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">
                {selectedAllergy.name}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mb-4">
                Category: {selectedAllergy.category}
              </Text>

              <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Severity:
              </Text>
              <View className="flex-row space-x-2 mb-4">
                <TouchableOpacity
                  className={`py-2 px-4 rounded-full ${selectedSeverity === "High" ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  onPress={() => setSelectedSeverity("High")}
                >
                  <Text className={selectedSeverity === "High" ? "text-white" : "text-gray-700 dark:text-gray-300"}>
                    High
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-4 rounded-full ${selectedSeverity === "Medium" ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  onPress={() => setSelectedSeverity("Medium")}
                >
                  <Text className={selectedSeverity === "Medium" ? "text-white" : "text-gray-700 dark:text-gray-300"}>
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-4 rounded-full ${selectedSeverity === "Low" ? "bg-yellow-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  onPress={() => setSelectedSeverity("Low")}
                >
                  <Text className={selectedSeverity === "Low" ? "text-white" : "text-gray-700 dark:text-gray-300"}>
                    Low
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Notes:
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-200 mb-4"
                placeholder="Add your notes here..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                value={allergyNotes}
                onChangeText={setAllergyNotes}
              />
            </ScrollView>
          )}

          <View className="mt-4">
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-3"
              onPress={confirmAddAllergy}
            >
              <Text className="text-white font-semibold text-center">
                {userAllergies.some(a => a.id === selectedAllergy?.id) ? "Update" : "Add"} Allergy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenContainer scrollable={false}>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">
        My Profile
      </Text>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 mt-4">
            Loading profile...
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User info card */}
          <Card 
            title="Account Information" 
            icon="person-circle-outline" 
            variant="elevated"
            className="mb-4"
          >
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 w-24">Username:</Text>
                <Text className="text-gray-900 dark:text-gray-100 font-medium">
                  {user?.username || "Not available"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-500 dark:text-gray-400 w-24">Email:</Text>
                <Text className="text-gray-900 dark:text-gray-100 font-medium">
                  {user?.email || "Not available"}
                </Text>
              </View>
            </View>
          </Card>

          {/* My Allergies */}
          <Card 
            title="My Allergies" 
            icon="medical" 
            variant="elevated"
            className="mb-4"
          >
            {userAllergies.length > 0 ? (
              <FlatList
                data={userAllergies}
                renderItem={renderAllergyItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListFooterComponent={
                  <TouchableOpacity
                    className="mt-2 flex-row items-center justify-center py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    onPress={() => {
                      // Open modal with a new common allergy
                      if (commonAllergies.length > 0) {
                        // Find the first common allergy not already in the user's list
                        const unusedAllergy = commonAllergies.find(
                          a => !userAllergies.some(ua => ua.id === a.id)
                        );
                        
                        if (unusedAllergy) {
                          setSelectedAllergy(unusedAllergy);
                        } else {
                          // All common allergies are already added, just pick the first one
                          setSelectedAllergy(commonAllergies[0]);
                        }
                        
                        setSelectedSeverity(null);
                        setAllergyNotes("");
                        setShowAllergyModal(true);
                      } else {
                        // If no common allergies loaded yet, fetch them first
                        fetchCommonAllergies().then(() => {
                          if (commonAllergies.length > 0) {
                            setSelectedAllergy(commonAllergies[0]);
                            setSelectedSeverity(null);
                            setAllergyNotes("");
                            setShowAllergyModal(true);
                          } else {
                            Alert.alert("Error", "Could not load allergies list. Please try again.");
                          }
                        });
                      }
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400 ml-2">
                      Add Allergy
                    </Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View className="items-center py-6">
                <Ionicons name="medical-outline" size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
                <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  You haven't added any allergies yet
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 rounded-xl py-2 px-4"
                  onPress={() => {
                    // Open modal, but make sure we have common allergies loaded
                    if (commonAllergies.length === 0) {
                      // If no common allergies, fetch them first
                      fetchCommonAllergies().then(() => {
                        if (commonAllergies.length > 0) {
                          setSelectedAllergy(commonAllergies[0]);
                          setSelectedSeverity(null);
                          setAllergyNotes("");
                          setShowAllergyModal(true);
                        } else {
                          Alert.alert("Error", "Could not load allergies list. Please try again.");
                        }
                      });
                    } else {
                      // We have common allergies, just open modal
                      setSelectedAllergy(commonAllergies[0]);
                      setSelectedSeverity(null);
                      setAllergyNotes("");
                      setShowAllergyModal(true);
                    }
                  }}
                >
                  <Text className="text-white font-medium">
                    Add Your Allergies
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Common Allergies */}
          <Card 
            title="Common Allergies" 
            icon="list" 
            variant="elevated"
          >
            {commonAllergies.length > 0 ? (
              <FlatList
                data={commonAllergies}
                renderItem={renderCommonAllergyItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  Loading common allergies...
                </Text>
              </View>
            )}
          </Card>
        </ScrollView>
      )}

      <AllergyModal />
    </ScreenContainer>
  );
} 