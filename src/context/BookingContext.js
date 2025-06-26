import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const BookingContext = createContext({});

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (bookingData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const bookingRef = collection(db, 'bookings');
      const newBooking = {
        ...bookingData,
        userId: user.uid,
        userEmail: user.email,
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(bookingRef, newBooking);
      const bookingWithId = { id: docRef.id, ...newBooking };
      
      setBookings(prev => [bookingWithId, ...prev]);
      return bookingWithId;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date()
      });
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  // Delete a booking (for cleanup)
  const deleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };

  // Fetch bookings when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  const value = {
    bookings,
    loading,
    createBooking,
    cancelBooking,
    deleteBooking,
    fetchBookings
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  return useContext(BookingContext);
}; 