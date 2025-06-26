import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { hotels } from '../../data/hotels';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const HotelCard = ({ hotel, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: hotel.image }}
      style={styles.image}
      resizeMode="cover"
    />
    <View style={styles.cardContent}>
      <Text style={styles.title}>{hotel.name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.rating}>{hotel.rating}</Text>
        <Text style={styles.reviews}>({hotel.reviews} reviews)</Text>
      </View>
      <Text style={styles.location}>{hotel.location}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${hotel.price}</Text>
        <Text style={styles.perNight}>/night</Text>
      </View>
      <View style={styles.amenitiesContainer}>
        {hotel.amenities.slice(0, 3).map((amenity, index) => (
          <Text key={index} style={styles.amenity}>{amenity}</Text>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <HotelCard
      hotel={item}
      onPress={() => navigation.navigate('HotelDetail', { hotel: item })}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>HotelHub</Text>
        <Text style={styles.subtitle}>Find your perfect stay</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Hotels</Text>
        <FlatList
          data={hotels.slice(0, 3)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Hotels</Text>
        <FlatList
          data={hotels}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
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
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  horizontalList: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 280,
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
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
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  perNight: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 5,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenity: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
});

export default HomeScreen; 