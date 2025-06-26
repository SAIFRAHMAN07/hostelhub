import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../context/BookingContext';
import { colors } from '../theme/colors';

const BookingScreen = () => {
  const { bookings, loading, cancelBooking } = useBookings();
  const [cancellingId, setCancellingId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'upcoming':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const handleCancelBooking = async (booking) => {
    if (booking.status === 'cancelled') {
      Alert.alert('Already Cancelled', 'This booking has already been cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${booking.hotelName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(booking.id);
            try {
              await cancelBooking(booking.id);
              Alert.alert('Success', 'Booking cancelled successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <Image source={{ uri: item.hotelImage }} style={styles.hotelImage} />
      <View style={styles.bookingInfo}>
        <Text style={styles.hotelName}>{item.hotelName}</Text>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={16} color={colors.textLight} />
            <Text style={styles.dateText}>Check-in: {item.checkIn}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={16} color={colors.textLight} />
            <Text style={styles.dateText}>Check-out: {item.checkOut}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color={colors.textLight} />
            <Text style={styles.detailText}>{item.guests} guests</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card" size={16} color={colors.textLight} />
            <Text style={styles.detailText}>${item.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          {item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(item)}
              disabled={cancellingId === item.id}
            >
              {cancellingId === item.id ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring hotels and make your first booking!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bookingInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 5,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  actionButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BookingScreen; 