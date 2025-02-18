import React from 'react';
import Cart from '../components/Cart';
import styled from 'styled-components';

const CartPage = () => {
  return (
    <CartContainer>
      <Cart />
    </CartContainer>
  );
};

// Stiller buraya taşındı
const CartContainer = styled.div`
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
`;

const CartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const BackButton = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const CartItems = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const CartItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const ItemInfo = styled.div`
    flex: 1;
`;

const ItemName = styled.h3`
    margin: 0;
`;

const ItemPrice = styled.p`
    margin: 5px 0;
    color: #666;
`;

const QuantityControls = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 20px;
`;

const QuantityButton = styled.button`
    padding: 5px 10px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
`;

const QuantityDisplay = styled.span`
    min-width: 30px;
    text-align: center;
`;

const RemoveButton = styled.button`
    padding: 5px 10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const CartTotal = styled.div`
    margin-top: 20px;
    text-align: right;
`;

const CheckoutButton = styled.button`
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
`;

const EmptyCart = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
`;

export {
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
};

export default CartPage;
