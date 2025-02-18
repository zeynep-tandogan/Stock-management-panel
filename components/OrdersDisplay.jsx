import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { orderService } from "../services/orderService";
import { logService } from "../services/logService";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderTitle = styled.h3`
  color: #34495e;
  margin: 0;
`;

const OrderStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    const status = props.status?.toLowerCase() || "bekliyor";
    switch (status) {
      case "tamamlandı":
        return "#2ecc71";
      case "bekliyor":
        return "#f1c40f";
      case "stok yetersiz":
        return "#e74c3c";
      case "iptal edildi":
        return "#95a5a6";
      default:
        return "#3498db";
    }
  }};
`;

const OrderDate = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

const LogSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #ecf0f1;
`;

const LogTitle = styled.h4`
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const LogItem = styled.div`
  padding: 1rem;
  margin: 0.8rem 0;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  font-size: 0.9rem;

  &:hover {
    background: #eef2f7;
  }
`;

const LogDate = styled.p`
  color: #7f8c8d;
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
`;

const LogType = styled.p`
  color: #2c3e50;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const LogDetails = styled.p`
  color: #34495e;
  margin: 0;
`;

const OrdersDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [orderLogs, setOrderLogs] = useState({});
  const customerId = localStorage.getItem("customerID");

  const fetchCustomerOrders = async () => {
    try {
      const allOrders = await orderService.getAllOrders();
      const customerOrders = allOrders.filter(
        (order) => order.customerID === parseInt(customerId)
      );
      console.log("Filtered customer orders:", customerOrders);
      setOrders(customerOrders);
      customerOrders.forEach((order) => fetchOrderLogs(order.orderID));
    } catch (error) {
      console.error("Siparişler alınırken hata:", error);
    }
  };

  const fetchOrderLogs = async (orderId) => {
    try {
      const allLogs = await logService.getCustomerLogs(customerId);
      const orderSpecificLogs = allLogs.filter(
        (log) => log.orderID === orderId
      );

      setOrderLogs((prev) => ({
        ...prev,
        [orderId]: orderSpecificLogs,
      }));
    } catch (error) {
      console.error(`${orderId} için loglar alınırken hata:`, error);
    }
  };

  useEffect(() => {
    console.log("OrdersDisplay mounted, customerID:", customerId);
    if (customerId) {
      fetchCustomerOrders();
    }
  }, [customerId]);

  if (!customerId) {
    return <div>Müşteri ID bulunamadı</div>;
  }

  if (orders.length === 0) {
    return <div>Henüz sipariş bulunmamaktadır</div>;
  }

  return (
    <Container>
      <Title>Siparişleriniz</Title>
      {orders.map((order) => (
        <OrderCard key={order.orderID}>
          <OrderHeader>
            <OrderTitle>Sipariş #{order.orderID}</OrderTitle>
            <OrderStatus status={order?.orderStatus || "bekliyor"}>
              {order?.orderStatus || "Bekliyor"}
            </OrderStatus>
          </OrderHeader>
          <OrderDate>
            Sipariş Tarihi:{" "}
            {new Date(order.orderDate).toLocaleDateString("tr-TR")}
          </OrderDate>
          <LogSection>
            <LogTitle>Sipariş Logları</LogTitle>
            {orderLogs[order.orderID]?.map((log, index) => (
              <LogItem key={index}>
                <LogDate>
                  {new Date(log.logDate).toLocaleString("tr-TR")}
                </LogDate>
                <LogType>İşlem: {log.logType}</LogType>
                <LogDetails>Detay: {log.logDetails}</LogDetails>
              </LogItem>
            ))}
          </LogSection>
        </OrderCard>
      ))}
    </Container>
  );
};

export default OrdersDisplay;
