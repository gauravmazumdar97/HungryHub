import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSelection from './components/MenuSelection';
import HallBooking from './components/HallBooking';
import Footer from './components/Footer';
import PrebookingPrompt from './components/PrebookingPrompt';
import HallBookingModal from './components/HallBookingModal';
import BookingSummary from './components/BookingSummary';
import ConfirmationActions from './components/ConfirmationActions';
import { CartItem, Dish, BookingData, HallPackage, HallBookingData } from './types';
import { saveBookingToDB } from './api';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'initial' | 'booking_with_preselect' | 'booking_direct'>('initial');
  const [reservationData, setReservationData] = useState({ name: '', dateTime: '', guests: '', contact: '' });
  
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [selectedHallPackage, setSelectedHallPackage] = useState<HallPackage | null>(null);

  const handleAddToCart = (dish: Dish, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...dish, quantity }];
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    setCart(prevCart => prevCart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handlePrebookChoice = (choice: boolean) => {
    setView(choice ? 'booking_with_preselect' : 'booking_direct');
  };

  const handleReservationChange = (data: typeof reservationData) => {
    setReservationData(data);
  };
  
  const resetBookingFlow = () => {
    setCart([]);
    setReservationData({ name: '', dateTime: '', guests: '', contact: '' });
    setView('initial');
  }

  const handleFinalSubmission = async (includeItems: boolean) => {
    if (!reservationData.name || !reservationData.dateTime || !reservationData.guests || !reservationData.contact) {
      alert("Please fill in all reservation details before confirming.");
      return;
    }

    const bookingDetails: BookingData = {
      ...reservationData,
      preBookedItems: includeItems ? cart : [],
    };

    try {
      await saveBookingToDB(bookingDetails);
      const prebookMessage = includeItems && cart.length > 0
        ? `Your pre-booking of ${cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) has been included.`
        : '';
      alert(`Thank you, ${reservationData.name}! Your table has been reserved. ${prebookMessage}`);
      resetBookingFlow();

    } catch (error) {
      console.error("Failed to save booking:", error);
      alert("Sorry, there was an error with your booking. Please try again.");
    }
  };

  const handleSelectPackage = (pkg: HallPackage) => {
    setSelectedHallPackage(pkg);
    setIsHallModalOpen(true);
  };

  const handleCloseHallModal = () => {
    setIsHallModalOpen(false);
    setSelectedHallPackage(null);
  };

  const handleConfirmHallBooking = async (bookingDetails: Omit<HallBookingData, 'package'>) => {
    if (!selectedHallPackage) return;

    const fullBookingDetails: HallBookingData = {
      ...bookingDetails,
      package: selectedHallPackage,
    };

    try {
      await saveBookingToDB(fullBookingDetails);
      alert(`Thank you, ${bookingDetails.name}! Your hall booking for the "${selectedHallPackage.name}" package is confirmed.`);
      handleCloseHallModal();
    } catch (error) {
      console.error("Failed to save hall booking:", error);
      alert("Sorry, there was an error with your hall booking. Please try again.");
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased">
      <Header />
      <main>
        <div id="table-reservation-section">
            {view === 'initial' && (
                <PrebookingPrompt onChoice={handlePrebookChoice} />
            )}

            {view !== 'initial' && (
                <Hero
                    formData={reservationData}
                    onFormChange={handleReservationChange}
                    onFormSubmit={() => handleFinalSubmission(false)}
                    showSubmitButton={view === 'booking_direct'}
                />
            )}
        </div>

        {view === 'booking_with_preselect' && (
            <>
                <MenuSelection onAddToCart={handleAddToCart} />
                <div className="container mx-auto px-6 py-10">
                    {cart.length > 0 && 
                        <BookingSummary 
                            cart={cart} 
                            onUpdateQuantity={handleUpdateQuantity} 
                            onRemoveItem={handleRemoveItem} 
                        />
                    }
                    <ConfirmationActions 
                        onConfirmWithItems={() => handleFinalSubmission(true)}
                        onConfirmWithoutItems={() => handleFinalSubmission(false)}
                        isConfirmDisabled={cart.length === 0}
                    />
                </div>
            </>
        )}
        
        <HallBooking onSelectPackage={handleSelectPackage} />
      </main>
      <Footer />
      
      {selectedHallPackage && (
        <HallBookingModal
          isOpen={isHallModalOpen}
          onClose={handleCloseHallModal}
          selectedPackage={selectedHallPackage}
          onConfirm={handleConfirmHallBooking}
        />
      )}
    </div>
  );
};

export default App;