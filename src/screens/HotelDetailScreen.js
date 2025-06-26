import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../context/BookingContext';
import { colors } from '../theme/colors';

const HotelDetailScreen = ({ route, navigation }) => {
  const { hotel } = route.params;
  const { createBooking } = useBookings();
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      Alert.alert('Select Dates', 'Please select check-in and check-out dates.');
      return;
    }

    if (new Date(selectedDates.checkIn) >= new Date(selectedDates.checkOut)) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return;
    }

    Alert.alert(
      'Booking Confirmation',
      `Book ${hotel.name} for ${guests} guest(s) from ${selectedDates.checkIn} to ${selectedDates.checkOut}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsBooking(true);
            try {
              const bookingData = {
                hotelName: hotel.name,
                hotelImage: hotel.image,
                checkIn: selectedDates.checkIn,
                checkOut: selectedDates.checkOut,
                guests: guests,
                totalPrice: hotel.price * guests,
                hotelId: hotel.id,
                location: hotel.location,
                rating: hotel.rating
              };

              await createBooking(bookingData);
              Alert.alert(
                'Success!',
                'Your booking has been confirmed. You can view it in the Bookings tab.',
                [
                  {
                    text: 'View Bookings',
                    onPress: () => navigation.navigate('Bookings')
                  },
                  { text: 'OK' }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to create booking. Please try again.');
            } finally {
              setIsBooking(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
      
      <View style={styles.content}>
        <Text style={styles.hotelName}>{hotel.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>{hotel.rating}</Text>
          <Text style={styles.reviews}>({hotel.reviews} reviews)</Text>
        </View>

        <Text style={styles.location}>
          <Ionicons name="location" size={16} color={colors.textLight} />
          {' '}{hotel.location}
        </Text>

        <Text style={styles.description}>{hotel.description}</Text>

        <View style={styles.amenitiesSection}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesList}>
            {hotel.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Check-in Date (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.dateInput}
              value={selectedDates.checkIn}
              onChangeText={(text) => setSelectedDates(prev => ({ ...prev, checkIn: text }))}
              placeholder="2024-01-15"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Check-out Date (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.dateInput}
              value={selectedDates.checkOut}
              onChangeText={(text) => setSelectedDates(prev => ({ ...prev, checkOut: text }))}
              placeholder="2024-01-18"
              placeholderTextColor={colors.placeholder}
            />
          </View>
          
          <View style={styles.guestSelector}>
            <Text style={styles.label}>Number of Guests:</Text>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{guests}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(guests + 1)}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price per night:</Text>
            <Text style={styles.price}>${hotel.price}</Text>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total for {guests} guest(s):</Text>
            <Text style={styles.totalPrice}>${hotel.price * guests}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]} 
          onPress={handleBookNow}
          disabled={isBooking}
        >
          <Text style={styles.bookButtonText}>
            {isBooking ? 'Creating Booking...' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  hotelImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    color: colors.text,
  },
  reviews: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 5,
  },
  location: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 20,
  },
  amenitiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  bookingSection: {
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
  },
  guestSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestButton: {
    padding: 8,
  },
  guestCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: colors.text,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.text,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  bookButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HotelDetailScreen; 