import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { hotels } from '../data/hotels';
import { Ionicons } from '@expo/vector-icons';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHotels, setFilteredHotels] = useState(hotels);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(query.toLowerCase()) ||
      hotel.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHotels(filtered);
  };

  const renderHotel = ({ item }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => navigation.navigate('HotelDetail', { hotel: item })}
    >
      <Image source={{ uri: item.image }} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} reviews)</Text>
        </View>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.perNight}>/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hotels..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredHotels}
        renderItem={renderHotel}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  hotelCard: {
    backgroundColor: '#fff',
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
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#333',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perNight: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
});

export default SearchScreen; 