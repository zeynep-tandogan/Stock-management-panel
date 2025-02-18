import React, { useEffect, useState } from "react";
import { logService } from "../services/logService";
import { orderService } from "../services/orderService";

const UserLogs = ({ customerId }) => {
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const customerID = localStorage.getItem("customerID");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userOrders = await orderService.getUserOrders(customerID);
        setOrders(userOrders);
      } catch (error) {
        console.error("Kullanıcı siparişleri alınırken bir hata oluştu:", error);
      }
    };

    fetchOrders();
  }, [customerID]);

  const handleOrderClick = async (orderId) => {
    setSelectedOrderId(orderId);
    try {
      const orderLogs = await logService.getOrderLogs(orderId);
      setLogs(orderLogs);
    } catch (error) {
      console.error("Sipariş logları alınırken bir hata oluştu:", error);
    }
  };

  return (
    <div>
      <h2>Müşteri Siparişleri</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.orderID} onClick={() => handleOrderClick(order.orderID)}>
            <p>{order.orderDate}</p>
            <p>{order.orderStatus}</p>
            <p>{order.customerType}</p>
            <p>{order.orderDetails}</p>
          </li>
        ))}
      </ul>
      {selectedOrderId && (
        <>
          <h2>Sipariş Logları</h2>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>
                <p>{log.logDate}</p>
                <p>{log.logType}</p>
                <p>{log.logDetails}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default UserLogs;
