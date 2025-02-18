import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartHeader,
  BackButton,
  CartItems,
  CartItem,
  ItemInfo,
  ItemName,
  ItemPrice,
  QuantityControls,
  QuantityButton,
  QuantityDisplay,
  RemoveButton,
  CartTotal,
  CheckoutButton,
  EmptyCart
} from '../pages/CartPage';
import styled from 'styled-components';
import { orderService } from '../services/orderService';
import { checkCustomerBudget } from '../services/authService';

const TIMEOUT_DURATION = 15;
const MAX_QUANTITY_PER_PRODUCT = 5;

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = React.useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = localStorage.getItem('cartTimer');
        return savedTime ? parseFloat(savedTime) : TIMEOUT_DURATION;
    });
    const timerRef = useRef(null);
    const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);

    useEffect(() => {
        if (cartItems.length > 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 0.1;
                    if (newTime <= 0) {
                        clearInterval(timerRef.current);
                        handleTimeout();
                        return TIMEOUT_DURATION;
                    }
                    localStorage.setItem('cartTimer', newTime.toString());
                    return newTime;
                });
            }, 100);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [cartItems]);

    const handleTimeout = async () => {
        const customerID = localStorage.getItem('customerID');
        if (customerID) {
            try {
                console.log('Sepet zaman aşımı logu oluşturuluyor...');
                const timeoutDetails = cartItems.map(item => 
                    `${item.quantity}x ${item.productName}`
                ).join(', ');
                
                await orderService.createLog({
                    customerID: parseInt(customerID),
                    orderID: null,
                    logDate: new Date().toISOString(),
                    logType: "Sepet Zaman Aşımı",
                    logDetails: `Sepet zaman aşımına uğradı. İçerik: ${timeoutDetails}`
                });
                console.log('Zaman aşımı logu oluşturuldu');
            } catch (error) {
                console.error('Zaman aşımı logu oluşturulurken hata:', error);
            }
        }

        setShowTimeoutPopup(true);
        setCartItems([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimer');
        
        setTimeout(() => {
            setShowTimeoutPopup(false);
            navigate('/home');
        }, 3000);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(item => item.id !== itemId);
            localStorage.setItem('cart', JSON.stringify(updatedItems));
            
            // Ürün kaldırıldığında Home sayfasındaki quantity'i sıfırla
            const savedQuantities = localStorage.getItem('productQuantities');
            const quantities = savedQuantities ? JSON.parse(savedQuantities) : {};
            quantities[itemId] = 0;
            localStorage.setItem('productQuantities', JSON.stringify(quantities));
            
            if (updatedItems.length === 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                setTimeLeft(TIMEOUT_DURATION);
            }
            
            return updatedItems;
        });
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setCartItems(prevItems => {
            const item = prevItems.find(item => item.id === itemId);
            
            // Stok kontrolü
            if (newQuantity > item.stock) {
                alert('Yetersiz stok!');
                return prevItems;
            }
            
            // Maksimum ürün kontrolü
            if (newQuantity > MAX_QUANTITY_PER_PRODUCT) {
                alert('Bir üründen en fazla 5 adet satın alabilirsiniz!');
                return prevItems;
            }
            
            const updatedItems = prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            
            // Cart güncellemesi
            localStorage.setItem('cart', JSON.stringify(updatedItems));
            
            // Home sayfasındaki quantities'i de güncelle
            const savedQuantities = localStorage.getItem('productQuantities');
            const quantities = savedQuantities ? JSON.parse(savedQuantities) : {};
            quantities[itemId] = newQuantity;
            localStorage.setItem('productQuantities', JSON.stringify(quantities));
            
            return updatedItems;
        });
    };

    // Sepete eklenen ürünlerin toplam sayısını kontrol eden yardımcı fonksiyon
    const checkTotalQuantity = (currentItems, itemId, newQuantity) => {
        const currentItem = currentItems.find(item => item.id === itemId);
        const otherItemsQuantity = currentItems
            .filter(item => item.id !== itemId)
            .reduce((total, item) => total + item.quantity, 0);
        
        return otherItemsQuantity + newQuantity;
    };

    // Log oluşturma yardımcı fonksiyonu
    const createLog = async (customerID, orderID, logType, logDetails) => {
        try {
            console.log('Cart - Log oluşturuluyor:', {
                customerID,
                orderID,
                logType,
                logDetails,
                timestamp: new Date().toISOString()
            });

            const logData = {
                customerID: parseInt(customerID),
                orderID: orderID || 0,
                logDate: new Date().toISOString(),
                logType: logType,
                logDetails: logDetails
            };

            console.log('Gönderilecek log verisi:', logData);
            const response = await orderService.createLog(logData);
            console.log('Log yanıtı:', response);
        } catch (error) {
            console.error('Log oluşturma hatası:', error);
            console.error('Hata detayı:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
        }
    };

    const handleCheckout = async () => {
        try {
            const customerName = localStorage.getItem('customerName');
            const customerID = localStorage.getItem('customerID');
            
            console.log('Checkout başladı:', { customerName, customerID });
            
            if (!customerName) {
                console.log('Kullanıcı giriş yapmamış');
                await createLog(
                    customerID,
                    null,
                    "Giriş Hatası",
                    "Kullanıcı giriş yapmadan satın alma denemesi"
                );
                alert('Lütfen önce giriş yapın!');
                navigate('/login');
                return;
            }

            // Bütçe kontrolü
            const customerBudget = await checkCustomerBudget(customerID);
            const orderTotal = cartItems.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );

            console.log('Bütçe kontrolü:', {
                customerBudget,
                orderTotal,
                yeterli: customerBudget >= orderTotal
            });

            if (orderTotal > customerBudget) {
                await createLog(
                    customerID,
                    null,
                    "Bütçe Yetersiz",
                    `Sipariş tutarı: $${orderTotal.toFixed(2)}, Mevcut bütçe: $${customerBudget.toFixed(2)}`
                );
                alert(`Yetersiz bütçe! Mevcut bütçeniz: $${customerBudget.toFixed(2)}, Sipariş tutarı: $${orderTotal.toFixed(2)}`);
                return;
            }

            const localDate = new Date();
            const offset = localDate.getTimezoneOffset();
            const localISOTime = new Date(localDate.getTime() - (offset * 60 * 1000)).toISOString();

            const orderData = {
                customerID: parseInt(customerID),
                orderDate: localISOTime,
                orderStatus: "Pending",
                orderItems: cartItems.map(item => ({
                    productID: item.id,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.price)
                }))
            };

            const headers = {
                'Content-Type': 'application/json',
                'CustomerName': customerName
            };

            console.log('Gönderilecek sipariş verisi:', orderData);

            const response = await orderService.createOrder(orderData, headers);
            console.log('Sipariş yanıtı:', response);

            if (response) {
                await createLog(
                    customerID,
                    response.orderId,
                    "Sipariş Oluşturuldu",
                    `Toplam tutar: $${orderTotal.toFixed(2)}, Ürün sayısı: ${cartItems.length}`
                );
                if (timerRef.current) clearInterval(timerRef.current);
                alert('Satın alma işlemi başarılı!');
                clearCart();
                navigate('/home');
            }

        } catch (error) {
            console.error('Checkout hatası:', error);
            const customerID = localStorage.getItem('customerID');
            await createLog(
                customerID,
                null,
                "Sipariş Hatası",
                `Hata: ${error.message}`
            );
            alert('Satın alma işlemi başarısız: ' + error.message);
        }
    };

    // Sepeti temizleme yardımcı fonksiyonu
    const clearCart = () => {
        // Tüm ürünlerin quantities değerlerini sıfırla
        const quantities = {};
        cartItems.forEach(item => {
            quantities[item.id] = 0;
        });
        localStorage.setItem('productQuantities', JSON.stringify(quantities));
        
        setCartItems([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimer');
        setTimeLeft(TIMEOUT_DURATION);
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            {showTimeoutPopup && (
                <TimeoutPopup>
                    <PopupContent>
                        <h3>Süre Doldu!</h3>
                        <p>Sepetiniz zaman aşımına uğradı.</p>
                        <p>Ana sayfaya yönlendiriliyorsunuz...</p>
                    </PopupContent>
                </TimeoutPopup>
            )}
            
            <CartHeader>
                <HeaderContent>
                    <h2>Sepetim</h2>
                    {cartItems.length > 0 && (
                        <>
                            <TimerProgressBar>
                                <Progress width={((timeLeft / TIMEOUT_DURATION) * 100).toFixed(0)} />
                            </TimerProgressBar>
                            <TimeDisplay>{Math.ceil(timeLeft)}s</TimeDisplay>
                        </>
                    )}
                </HeaderContent>
                <BackButton onClick={() => navigate('/home')}>← Alışverişe Devam Et</BackButton>
            </CartHeader>
            
            {cartItems.length === 0 ? (
                <EmptyCart>Sepetinizde ürün bulunmamaktadır</EmptyCart>
            ) : (
                <>
                    <CartItems>
                        {cartItems.map(item => (
                            <CartItem key={item.id}>
                                <ItemInfo>
                                    <ItemName>{item.productName}</ItemName>
                                    <ItemPrice>${item.price}</ItemPrice>
                                </ItemInfo>
                                <QuantityControls>
                                    <QuantityButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</QuantityButton>
                                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                                    <QuantityButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</QuantityButton>
                                </QuantityControls>
                                <RemoveButton onClick={() => removeFromCart(item.id)}>Kaldır</RemoveButton>
                            </CartItem>
                        ))}
                    </CartItems>
                    <CartTotal>
                        <h3>Toplam: ${total.toFixed(2)}</h3>
                        <CheckoutButton onClick={handleCheckout}>Satın Al</CheckoutButton>
                    </CartTotal>
                </>
            )}
        </>
    );
};

const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const TimerProgressBar = styled.div`
    width: 200px;
    height: 3px;
    background-color: #ddd;
    border-radius: 2px;
    overflow: hidden;
`;

const Progress = styled.div`
    height: 100%;
    width: ${props => props.width}%;
    background-color: ${props => props.width <= 33 ? '#ff4444' : '#007bff'};
    transition: width 0.1s linear, background-color 0.3s ease;
`;

const TimeDisplay = styled.div`
    font-size: 12px;
    color: #666;
    margin-left: 5px;
`;

// Styled components for popup
const TimeoutPopup = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const PopupContent = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    animation: slideIn 0.3s ease;

    h3 {
        color: #dc3545;
        margin: 0 0 15px 0;
    }

    p {
        margin: 5px 0;
        color: #666;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-20px);
        }
        to {
            transform: translateY(0);
        }
    }
`;

export default Cart;