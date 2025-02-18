import React, { useEffect, useState } from "react";
import { customerService } from "../services/customerService";
import styled from "styled-components";

const UserInfoContainer = styled.div`
  background: white;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const UserInfoItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  h4 {
    color: #007bff;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
`;

const UserInfo = () => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const customerID = localStorage.getItem("customerID");
        if (customerID) {
          const details = await customerService.getCustomerById(customerID);
          setUserDetails(details);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);
      }
    };

    fetchUserDetails();
  }, []);

  if (!userDetails) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <UserInfoContainer>
      <UserInfoGrid>
        <UserInfoItem>
          <h4>İsim</h4>
          <p>{userDetails.customerName}</p>
        </UserInfoItem>
        <UserInfoItem>
          <h4>Bütçe</h4>
          <p>${userDetails.budget}</p>
        </UserInfoItem>
        <UserInfoItem>
          <h4>Üyelik Tipi</h4>
          <p>{userDetails.customerType}</p>
        </UserInfoItem>
      </UserInfoGrid>
    </UserInfoContainer>
  );
};

export default UserInfo;
