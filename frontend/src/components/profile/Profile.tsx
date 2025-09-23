// components/profile/Profile.tsx
import React from 'react';
import { ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { Colors } from '../../constants/Colors';
import { ProfileStats } from './ProfileStats';
import { ProfileMenu } from './ProfileMenu';
import { logout } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/userSlice';
import { resetSession } from '../../store/slices/sessionSlice';
import { StyleSheet } from 'react-native';
import { ProfileHeader } from './ProfileHeader';
import { AccountInfo } from './AccountInfo';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
    dispatch(resetSession());
  };

  const handleEditProfile = () => {
    console.log('Edit profile pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          user={user}
          onBack={() => navigation.goBack()}
          onEditProfile={handleEditProfile}
        />
        
        {/* <ProfileStats /> */}
        
        {/* <AccountInfo user={user} /> */}
        
        <ProfileMenu onLogout={handleLogout} />
        
        {/* Bottom spacing */}
        {/* <Div style={{ height: 20 }} /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
});