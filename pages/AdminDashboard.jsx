import React from "react";
import styled from "styled-components";
import Orders from "../components/orders";
import Customers from "../components/customers";
import Products from "../components/products";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import LogPanel from '../components/LogPanel';


const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-family: "Montserrat", sans-serif;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  transition: all 0.3s ease;
`;

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Admin Paneli</Title>
        <LogoutButton onClick={handleLogout}>Çıkış Yap</LogoutButton>
      </Header>

      <GridContainer>
        <Section>
          <Customers />
        </Section>
        <Section>
          <Orders />
          <LogPanel />
        </Section>
        <Section>
          <Products />
        </Section>
      </GridContainer>
    </DashboardContainer>
  );
};

export default AdminDashboard;
