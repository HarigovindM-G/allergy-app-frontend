// app/(tabs)/emergency.tsx
import React from "react";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";

const EMERGENCY_STEPS = [
  {
    id: 1,
    title: "Assess Symptoms",
    description: "Check for difficulty breathing, swelling, hives, or other severe symptoms",
    icon: "medical-outline",
    color: "#60A5FA"
  },
  {
    id: 2,
    title: "Use Auto-Injector",
    description: "If prescribed, use epinephrine auto-injector immediately",
    icon: "fitness-outline",
    color: "#F59E0B"
  },
  {
    id: 3,
    title: "Call Emergency Services",
    description: "Dial emergency services (911) or your local emergency number",
    icon: "call-outline",
    color: "#EF4444"
  },
  {
    id: 4,
    title: "Position & Wait",
    description: "Lie down, elevate legs, and wait for emergency response",
    icon: "bed-outline",
    color: "#10B981"
  }
];

const IMPORTANT_TIPS = [
  "Keep your auto-injector with you at all times",
  "Know how to use your auto-injector before an emergency",
  "Wear a medical alert bracelet or necklace",
  "Keep a list of your allergies and medications handy"
];

export default function EmergencyScreen() {
  const handleCall = (phoneNumber: string) => {
    const formattedNumber = `tel:${phoneNumber}`;
    Linking.canOpenURL(formattedNumber)
      .then(supported => {
        if (supported) {
          return Linking.openURL(formattedNumber);
        }
        Alert.alert("Phone number is not available");
      })
      .catch(err => console.error(err));
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="warning" size={28} color="#DC2626" />
          </View>
          <Text style={styles.headerTitle}>Emergency Steps</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#DC2626' }]}
            onPress={() => handleCall('911')}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Call 911</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#2563EB' }]}
            onPress={() => handleCall('108')}
          >
            <Ionicons name="medical" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Call Ambulance</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow These Steps</Text>
          {EMERGENCY_STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                <Ionicons name={step.icon} size={24} color={step.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Important Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Tips</Text>
          <View style={styles.tipsContainer}>
            {IMPORTANT_TIPS.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="information-circle" size={20} color="#60A5FA" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerIcon: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  tipsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
