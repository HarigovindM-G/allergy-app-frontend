// app/(tabs)/results.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ScrollView,
  Alert
} from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL, getApiUrl } from '@/constants/Config';
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

// Define types for better type safety
interface Allergen {
  allergen: string;
  confidence: number;
  evidence: string[] | null;
  is_user_allergen: boolean;
}

interface ScanHistoryItem {
  id: number;
  product_name: string | null;
  input_text: string;
  allergens: Allergen[];
  image_url: string | null;
  created_at: string;
}

export default function ResultsScreen() {
  const { text, imageUri } = useLocalSearchParams();
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const router = useRouter();

  // Fetch scan history on component mount
  useEffect(() => {
    fetchScanHistory();
  }, []);

  // Detect allergens when text param changes
  useEffect(() => {
    if (text) {
      detectAllergens(String(text));
      setActiveTab('current');
    } else if (!text && scanHistory.length > 0) {
      // If no text provided but history exists, show history
      setActiveTab('history');
    }
  }, [text]);

  const fetchScanHistory = async () => {
    setLoadingHistory(true);
    try {
      // Use direct URL
      const fullUrl = `${API_URL}/scan-history`;
      console.log("Fetching history from:", fullUrl);
      
      const res = await fetch(fullUrl);
      console.log("Fetch history status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("History fetch error:", errorText);
        throw new Error(`Failed to fetch scan history: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`Got ${data.length} history items`);
      
      // Set the history items
      setScanHistory(data);
    } catch (error) {
      console.error("Error fetching scan history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const detectAllergens = async (inputText: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use direct URL
      const detectUrl = `${API_URL}/allergens/detect`;
      console.log("Detecting allergens at:", detectUrl);
      
      // Call the allergen detection API directly
      const res = await fetch(detectUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      
      console.log("Allergen detection status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Allergen detection error:", errorText);
        throw new Error(`Allergen detection failed: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Detected allergens count:", data.allergens?.length || 0);
      
      // Set allergens immediately to show results to user
      setAllergens(data.allergens || []);
      
      // Stop the loading indicator immediately
      setLoading(false);
      
      // Save to history after displaying results
      if (data.allergens) {
        saveSimpleHistory(inputText, data.allergens);
      }
      
    } catch (error: any) {
      console.error("Error in detectAllergens:", error);
      setError("Failed to detect allergens. Please try again.");
      setLoading(false);
    }
  };
  
  // New simple function to save history
  const saveSimpleHistory = async (text: string, allergenData: Allergen[]) => {
    try {
      // Create a very simplified version of the allergen data
      const simpleAllergens = allergenData.map(a => ({
        allergen: a.allergen,
        confidence: a.confidence,
        evidence: a.evidence,
        is_user_allergen: a.is_user_allergen
      }));
      
      // Simplified payload with minimal data
      const payload = {
        product_name: "Scanned Product",
        input_text: text,
        allergens: simpleAllergens,
        image_url: null
      };
      
      // Log what we're sending
      console.log("Saving scan with payload:", JSON.stringify(payload));
      
      // Make sure we have a trailing slash which might be important for some servers
      const fullUrl = `${API_URL}/scan-history/`;
      console.log("POST request to URL:", fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        // Allow redirects this time
        redirect: "follow"
      });
      
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      
      if (response.ok) {
        // Success - refresh history silently
        console.log("Successfully saved to history");
        fetchScanHistory();
      } else {
        // Try to read any error details
        let errorText;
        try {
          errorText = await response.text();
          console.error('Failed to save history. Server response:', errorText);
        } catch (e) {
          console.error('Failed to save history:', response.status);
        }
      }
    } catch (e) {
      console.error('Error saving history:', e);
    }
  };

  // Delete a scan from history
  const deleteScan = async (scanId: number) => {
    setDeleteInProgress(true);
    try {
      // Use direct URL
      const fullUrl = `${API_URL}/scan-history/${scanId}`;
      console.log("Deleting history item from:", fullUrl);
      
      const res = await fetch(fullUrl, {
        method: "DELETE"
      });
      
      console.log("Delete status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error:", errorText);
        throw new Error(`Failed to delete scan: ${res.status}`);
      }
      
      // Update history after deletion
      fetchScanHistory();
      
      // Close detail modal if the deleted scan was selected
      if (selectedScan && selectedScan.id === scanId) {
        setSelectedScan(null);
      }
    } catch (error) {
      console.error("Error deleting scan:", error);
      Alert.alert("Error", "Failed to delete scan history item.");
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Confirmation dialog for deletion
  const confirmDelete = (scanId: number) => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to delete this scan from history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteScan(scanId)
        }
      ]
    );
  };

  // Get the confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-red-600 dark:text-red-400";
    if (confidence >= 0.5) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  // Get the confidence level icon
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return "alert-circle";
    if (confidence >= 0.5) return "warning";
    return "information-circle";
  };

  // Get allergen classification (for display and filtering)
  const getAllergenClass = (allergen: Allergen) => {
    if (allergen.is_user_allergen) return "user_known";
    if (allergen.confidence >= 0.8) return "high";
    if (allergen.confidence >= 0.5) return "medium";
    return "low";
  };

  // Render scan history item
  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
    // Ensure allergens is an array before filtering
    const allergens = item.allergens || [];
    
    // Count allergens by type
    const userKnownCount = allergens.filter(a => a.is_user_allergen).length;
    const highRiskCount = allergens.filter(a => !a.is_user_allergen && a.confidence >= 0.8).length;
    const mediumRiskCount = allergens.filter(a => !a.is_user_allergen && a.confidence >= 0.5 && a.confidence < 0.8).length;
    const lowRiskCount = allergens.filter(a => !a.is_user_allergen && a.confidence < 0.5).length;
    
    return (
      <TouchableOpacity 
        className="mb-3"
        onPress={() => setSelectedScan(item)}
      >
        <Card variant="outlined">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-900 dark:text-gray-100 font-semibold">
              {item.product_name || "Unlabeled Product"}
            </Text>
            <TouchableOpacity
              onPress={() => confirmDelete(item.id)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            {format(new Date(item.created_at), "MMM d, yyyy - h:mm a")}
          </Text>
          
          {allergens.length > 0 ? (
            <View className="flex-row space-x-2 mb-1">
              {userKnownCount > 0 && (
                <View className="bg-red-100 dark:bg-red-900 rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="alert-circle" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                  <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                    {userKnownCount} user known
                  </Text>
                </View>
              )}
              
              {highRiskCount > 0 && (
                <View className="bg-red-100 dark:bg-red-900 rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="alert-circle" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                  <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                    {highRiskCount} high risk
                  </Text>
                </View>
              )}
              
              {mediumRiskCount > 0 && (
                <View className="bg-orange-100 dark:bg-orange-900 rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="warning" size={14} color="#ea580c" style={{ marginRight: 4 }} />
                  <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                    {mediumRiskCount} medium risk
                  </Text>
                </View>
              )}
              
              {lowRiskCount > 0 && (
                <View className="bg-yellow-100 dark:bg-yellow-900 rounded-full px-2 py-1 flex-row items-center">
                  <Ionicons name="information-circle" size={14} color="#ca8a04" style={{ marginRight: 4 }} />
                  <Text className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                    {lowRiskCount} low risk
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-green-100 dark:bg-green-900 rounded-full px-2 py-1 flex-row items-center self-start">
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginRight: 4 }} />
              <Text className="text-green-600 dark:text-green-400 text-xs font-medium">
                No allergens detected
              </Text>
            </View>
          )}
          
          <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic" numberOfLines={1}>
            {item.input_text.substring(0, 50)}...
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  // Detail modal for a specific scan
  const ScanDetailModal = () => (
    <Modal
      visible={!!selectedScan}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedScan(null)}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 h-5/6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedScan?.product_name || "Unlabeled Product"}
            </Text>
            <TouchableOpacity onPress={() => setSelectedScan(null)}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          
          {selectedScan && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
            >
              {/* Ensure allergens is an array */}
              {(() => {
                const allergens = selectedScan.allergens || [];
                
                return (
                  <View>
                    <Text className="text-gray-500 dark:text-gray-400 mb-2">
                      Scanned on {format(new Date(selectedScan.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </Text>
                    
                    <Card variant="outlined" style={{ marginBottom: 16 }}>
                      <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Extracted Text:
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400">
                        {selectedScan.input_text}
                      </Text>
                    </Card>
                    
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Detected Allergens
                    </Text>
                    
                    {allergens.length > 0 ? (
                      <View className="space-y-3">
                        {allergens.map((item, idx) => (
                          <View
                            key={idx}
                            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                          >
                            <View className="flex-row items-center mb-2">
                              <Ionicons 
                                name={getConfidenceIcon(item.confidence)} 
                                size={20} 
                                color={item.confidence >= 0.8 ? "#dc2626" : item.confidence >= 0.5 ? "#ea580c" : "#ca8a04"} 
                                style={{ marginRight: 8 }}
                              />
                              <Text className="text-gray-900 dark:text-gray-100 font-bold text-lg flex-1">
                                {item.allergen}
                              </Text>
                              <View className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1">
                                <Text className={`${getConfidenceColor(item.confidence)} font-medium text-sm`}>
                                  {(item.confidence * 100).toFixed(0)}% match
                                </Text>
                              </View>
                            </View>
                            
                            {/* User Allergen Tag */}
                            {item.is_user_allergen && (
                              <View className="mt-1 mb-2 bg-red-100 dark:bg-red-900 self-start rounded-full px-2 py-1 flex-row items-center">
                                <Ionicons name="warning" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                                <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                                  Your known allergen
                                </Text>
                              </View>
                            )}
                            
                            {item.evidence && item.evidence.length > 0 && (
                              <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                                  Evidence Found:
                                </Text>
                                {item.evidence.map((ev: string, eIdx: number) => (
                                  <View key={eIdx} className="flex-row items-center mt-1">
                                    <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                                    <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                                      {ev}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View className="items-center py-6">
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" style={{ marginBottom: 12 }} />
                        <Text className="text-green-600 dark:text-green-400 font-medium text-lg text-center">
                          No allergens detected
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                          The analyzed text doesn't contain any known allergens
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })()}
            </ScrollView>
          )}
          
          <View className="absolute bottom-6 left-6 right-6">
            <TouchableOpacity
              onPress={() => {
                confirmDelete(selectedScan!.id);
              }}
              className="bg-red-600 rounded-xl py-3 shadow-md"
              disabled={deleteInProgress}
            >
              <View className="flex-row items-center justify-center">
                {deleteInProgress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text className="text-white font-semibold ml-2">
                      Delete from History
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Allergen Results
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-1">
          Analysis of potential allergens in your product
        </Text>
      </View>

      {/* Tab navigation */}
      <View className="flex-row mb-4">
        <TouchableOpacity 
          className={`flex-1 py-2 ${activeTab === 'current' ? 'border-b-2 border-blue-500' : 'border-b border-gray-200 dark:border-gray-700'}`}
          onPress={() => setActiveTab('current')}
        >
          <Text 
            className={`text-center font-medium ${activeTab === 'current' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Current Scan
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500' : 'border-b border-gray-200 dark:border-gray-700'}`}
          onPress={() => setActiveTab('history')}
        >
          <Text 
            className={`text-center font-medium ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <Card variant="outlined" style={{ marginBottom: 20 }}>
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={24} color="#ef4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 flex-1">{error}</Text>
          </View>
        </Card>
      )}

      {/* Current Scan Tab */}
      {activeTab === 'current' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Loading state */}
          {loading && (
            <Card variant="outlined">
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-blue-600 dark:text-blue-400 mt-4 font-medium">
                  Analyzing for allergens...
                </Text>
              </View>
            </Card>
          )}

          {/* No text provided */}
          {!text && !loading && (
            <Card variant="outlined">
              <View className="items-center py-6">
                <Ionicons name="document-text-outline" size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
                <Text className="text-gray-600 dark:text-gray-400 text-center mb-2">
                  No text provided for analysis
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/scan")}
                  className="bg-blue-600 rounded-xl py-2 px-4 mt-2"
                >
                  <Text className="text-white font-medium">Go to Scanner</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Results */}
          {!loading && text && (
            <Card 
              title="Analysis Results" 
              icon="flask-outline"
              variant="elevated"
            >
              {allergens.length > 0 ? (
                <View className="space-y-3">
                  {allergens.map((item, idx) => (
                    <View
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                    >
                      <View className="flex-row items-center mb-2">
                        <Ionicons 
                          name={getConfidenceIcon(item.confidence)} 
                          size={20} 
                          color={item.confidence >= 0.8 ? "#dc2626" : item.confidence >= 0.5 ? "#ea580c" : "#ca8a04"} 
                          style={{ marginRight: 8 }}
                        />
                        <Text className="text-gray-900 dark:text-gray-100 font-bold text-lg flex-1">
                          {item.allergen}
                        </Text>
                        <View className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1">
                          <Text className={`${getConfidenceColor(item.confidence)} font-medium text-sm`}>
                            {(item.confidence * 100).toFixed(0)}% match
                          </Text>
                        </View>
                      </View>
                      
                      {/* User Allergen Tag */}
                      {item.is_user_allergen && (
                        <View className="mt-1 mb-2 bg-red-100 dark:bg-red-900 self-start rounded-full px-2 py-1 flex-row items-center">
                          <Ionicons name="warning" size={14} color="#dc2626" style={{ marginRight: 4 }} />
                          <Text className="text-red-600 dark:text-red-400 text-xs font-medium">
                            Your known allergen
                          </Text>
                        </View>
                      )}
                      
                      {item.evidence && item.evidence.length > 0 && (
                        <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Evidence Found:
                          </Text>
                          {item.evidence.map((ev: string, eIdx: number) => (
                            <View key={eIdx} className="flex-row items-center mt-1">
                              <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                              <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                                {ev}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-6">
                  <Ionicons name="checkmark-circle" size={48} color="#22c55e" style={{ marginBottom: 12 }} />
                  <Text className="text-green-600 dark:text-green-400 font-medium text-lg text-center">
                    No allergens detected
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                    The analyzed text doesn't contain any known allergens
                  </Text>
                </View>
              )}
            </Card>
          )}
        </ScrollView>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {loadingHistory ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-blue-600 dark:text-blue-400 mt-4 font-medium">
                Loading scan history...
              </Text>
            </View>
          ) : scanHistory.length > 0 ? (
            <FlatList
              data={scanHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <Card variant="outlined">
              <View className="items-center py-6">
                <Ionicons name="time-outline" size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
                <Text className="text-gray-600 dark:text-gray-400 text-center mb-2">
                  No scan history yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/scan")}
                  className="bg-blue-600 rounded-xl py-2 px-4 mt-2"
                >
                  <Text className="text-white font-medium">Scan a Product</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </>
      )}

      {/* Scan detail modal */}
      <ScanDetailModal />
    </ScreenContainer>
  );
}
