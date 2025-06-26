import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCart } from '../../context/CartContext';
import { colors } from '../../theme/colors';

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleBuyNow = () => {
    addToCart(product);
    // Navigate to checkout screen (to be implemented)
    Alert.alert('Coming Soon', 'Checkout functionality will be available soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode='contain'
        // defaultSource={require('../../assets/placeholder.png')}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>
        
        <View style={styles.stockContainer}>
          <Text style={styles.stockText}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.addToCartButton]} 
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buyNowButton]} 
            onPress={handleBuyNow}
            disabled={product.stock === 0}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  categoryContainer: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  category: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  stockContainer: {
    marginBottom: 20,
  },
  stockText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: colors.primary,
  },
  buyNowButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen; 