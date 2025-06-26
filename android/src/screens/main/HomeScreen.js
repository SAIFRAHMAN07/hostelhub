import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { products } from '../../data/products';
import { colors } from '../../theme/colors';

const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: item.image }}
      style={styles.image}
      resizeMode="contain"
      // defaultSource={require('../../assets/placeholder.png')}
    />
    <View style={styles.cardContent}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Text style={styles.stock}>In Stock: {item.stock}</Text>
      <View style={styles.categoryContainer}>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <ProductCard
      item={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  list: {
    padding: 16,
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
  },
  image: {
    width: '100%',
    height: 200,
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
  price: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  categoryContainer: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default HomeScreen; 