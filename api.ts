import { BookingData, HallBookingData } from './types';

/**
 * Simulates saving booking data to a backend database like MongoDB.
 * In a real application, this would be an HTTP POST request to your API endpoint.
 * @param {BookingData | HallBookingData} bookingData - The complete booking details for a table or a hall.
 * @returns {Promise<void>}
 */
export const saveBookingToDB = (bookingData: BookingData | HallBookingData): Promise<void> => {
  console.log('--- SIMULATING API CALL ---');
  console.log('Sending booking data to the backend...');
  console.log('Data that would be stored in MongoDB:', JSON.stringify(bookingData, null, 2));
  
  // Simulate a network delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate a successful API response
      if (bookingData.name) { // Basic validation check
        console.log('--- API SIMULATION SUCCESS ---');
        resolve();
      } else {
        // Simulate an error
        console.error('--- API SIMULATION ERROR: Name is required. ---');
        reject(new Error('Validation failed: Name is required.'));
      }
    }, 1000);
  });
};