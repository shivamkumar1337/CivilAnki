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
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
}) => {
  const user = useSelector((state: any) => state.user);
  const [fetchedSubjects, setFetchedSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user.session?.access_token) {
        setLoading(true);
        try {
          const subjectsFromApi = await HomeService.getSubjects(user.session.access_token);
          setFetchedSubjects(subjectsFromApi);
        } catch (e) {
          console.error('Error fetching subjects:', e);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [user.session]);

  const availableSubjects =  fetchedSubjects;

  if (loading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={{ textAlign: 'center', margin: 20 }}>Loading...</Text>
      </View>
    );
  }

  function onSubjectPress(subject: Subject): void {
    throw new Error('Function not implemented.');
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
      {availableSubjects.map((subject, index) => (
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
            {subject.imageUrl ? (
           <Image
  source={{ uri: "https://qilixkcxtghkifswuspn.supabase.co/storage/v1/object/sign/Subejct_img/Environment.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MWM5NGY3Zi0xYzI1LTRiNGQtYTQxZC05YjJhMmU4Y2UwMTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTdWJlamN0X2ltZy9FbnZpcm9ubWVudC5wbmciLCJpYXQiOjE3NTc2MjEzMTMsImV4cCI6MTc2MDIxMzMxM30.beiCymQb0fxWlb-03VPmLqVDdQL-aq6UZUPBI7CpOI8" }}
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