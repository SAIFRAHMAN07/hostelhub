import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { colors } from '../../theme/colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { bookings } = useBookings();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return { total, confirmed, cancelled };
  };

  const stats = getBookingStats();

  const menuItems = [
    {
      title: 'My Bookings',
      icon: 'calendar',
      color: colors.primary,
      onPress: () => {}
    },
    {
      title: 'Favorites',
      icon: 'heart',
      color: colors.error,
      onPress: () => {}
    },
    {
      title: 'Payment Methods',
      icon: 'card',
      color: colors.success,
      onPress: () => {}
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      color: colors.warning,
      onPress: () => {}
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      color: colors.info,
      onPress: () => {}
    },
    {
      title: 'About HotelHub',
      icon: 'information-circle',
      color: colors.secondary,
      onPress: () => {}
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      color: colors.medicalPurple,
      onPress: () => {}
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.email)}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.memberSince}>Member since 2024</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
          <Text style={styles.statNumber}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </View>
          <Text style={styles.statNumber}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.background} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>HotelHub v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: colors.background,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default ProfileScreen; 