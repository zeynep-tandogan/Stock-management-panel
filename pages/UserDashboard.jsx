import React, { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import UserInfo from "../components/UserInfo";
import OrdersDisplay from "../components/OrdersDisplay";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out;
`;

const Title = styled.h1`
  color: #34495e;
  font-size: 2.5rem;
  font-family: "Montserrat", sans-serif;
  margin-bottom: 1rem;

  &::after {
    content: "";
    display: block;
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, #4facfe, #00f2fe);
    margin-top: 0.5rem;
    border-radius: 2px;
  }
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-top: 0.5rem;
`;

const ContentArea = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1s ease-out;
`;

const UserDashboard = () => {
  useEffect(() => {
    console.log('UserDashboard mounted');
  }, []);

  return (
    <DashboardContainer>
      <Header>
        <Title>Müşteri Paneli</Title>
        <Subtitle>
          Siparişlerinizi ve hesap bilgilerinizi buradan takip edebilirsiniz
        </Subtitle>
      </Header>
      <ContentArea>
        <UserInfo />
        <div style={{ marginTop: '2rem' }}>
          <OrdersDisplay />
        </div>
      </ContentArea>
    </DashboardContainer>
  );
};

export default UserDashboard;
