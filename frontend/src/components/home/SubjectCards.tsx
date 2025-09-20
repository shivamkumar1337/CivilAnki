import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Subject } from '../../types';
import { Card } from '../ui/Card';
import { useSelector } from 'react-redux';
import { HomeService } from '../../services/HomeService';


interface SubjectCardsProps {
  subjects: Subject[];
  onSubjectPress: (subject: Subject) => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({ subjects, onSubjectPress }) => {

  useEffect(() => {
    console.log('Rendering SubjectCards with subjects:', subjects);
  }, [subjects]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
      {subjects.map((subject, index) => (
        <TouchableOpacity
          key={subject.id ?? subject.name ?? index}
          onPress={() => onSubjectPress(subject)}
          style={{
            marginRight: 16,
            alignItems: 'center',
            width: 128,
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              aspectRatio: 9 / 15,
              width: 128,
              marginBottom: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            {subject.url ? (
           <Image
  source={{ uri: subject.url }}
  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
/>

            ) : (
              <View style={{ flex: 1, backgroundColor: '#f3f4f6' }} />
            )}
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#111827',
              textAlign: 'left',
              width: 128,
              lineHeight: 18,
              fontWeight: '500',
            }}
            numberOfLines={2}
          >
            {subject.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}