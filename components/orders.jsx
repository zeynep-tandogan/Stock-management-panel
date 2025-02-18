import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { orderService } from "../services/orderService";
import { customerService } from "../services/customerService";
import { logService } from "../services/logService";



const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const OrdersContainer = styled.div`
  background: linear-gradient(145deg, #ffffff, #f5f0ff);
  border-radius: 20px;
  box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: ${(props) => (props.isVisible ? "2rem" : "0")};
`;

const Title = styled.h2`
  color: #2c3e50;
  font-family: "Montserrat", sans-serif;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
  cursor: pointer;
  user-select: none;
  padding: 1.5rem;
  background: white;
  border-bottom: ${(props) =>
    props.isVisible ? "1px solid rgba(147, 112, 219, 0.1)" : "none"};

  &::before {
    content: "";
    width: 5px;
    height: 25px;
    background: linear-gradient(to bottom, #9370db, #8a2be2);
    border-radius: 3px;
  }
`;

const ContentContainer = styled.div`
  height: ${(props) => (props.isVisible ? "700px" : "0")};
  overflow-y: ${(props) => (props.isVisible ? "auto" : "hidden")};
  transition: all 0.3s ease-in-out;
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  padding: ${(props) => (props.isVisible ? "1.5rem" : "0")};
  background: white;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(147, 112, 219, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #9370db, #8a2be2);
    border-radius: 3px;
  }
`;

const HeaderSection = styled.div`
  background: white;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: ${(props) => (props.isVisible ? "0 1.5rem 1.5rem 1.5rem" : "0")};
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  max-height: ${(props) => (props.isVisible ? "100px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: white;
`;

const TableContainer = styled.div`
  border-radius: 15px;
  background: white;
  box-shadow: 0 8px 30px rgba(147, 112, 219, 0.08);
`;

const Table = styled.table`
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const Th = styled.th`
  padding: 1.2rem 1rem;
  text-align: left;
  background: white;
  color: #6c5ce7;
  font-weight: 600;
  border-bottom: 2px solid rgba(147, 112, 219, 0.2);
  white-space: nowrap;

  &:first-child {
    padding-left: 1.5rem;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
  color: #4a4a4a;

  &:first-child {
    padding-left: 1.5rem;
  }
`;

const OrderRow = styled.tr`
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(147, 112, 219, 0.05);
    transform: translateX(5px);
  }
`;

const ProductDetails = styled.div`
  padding: 1rem;
  background: rgba(147, 112, 219, 0.03);
  border-radius: 10px;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(147, 112, 219, 0.1);
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px dashed rgba(147, 112, 219, 0.2);

  &:last-child {
    border-bottom: none;
  }
`;

const TotalPrice = styled.div`
  text-align: right;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  color: #6c5ce7;
  border-top: 2px solid rgba(147, 112, 219, 0.2);
  margin-top: 1rem;
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${(props) => {
    switch (props.status) {
      case "Bekliyor":
        return "linear-gradient(145deg, #fff7e6, #fff3cd)";
      case "Onaylandı":
        return "linear-gradient(145deg, #e6ffe6, #d4edda)";
      case "İptal Edildi":
        return "linear-gradient(145deg, #ffe6e6, #f8d7da)";
      case "Hazırlanıyor":
        return "linear-gradient(145deg, #e6f3ff, #cce5ff)";
      case "Teslim Edildi":
        return "linear-gradient(145deg, #e6ffe6, #d4edda)";
      default:
        return "linear-gradient(145deg, #f5f5f5, #e2e3e5)";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "Beklemede":
        return "#856404";
      case "Onaylandı":
        return "#155724";
      case "İptal Edildi":
        return "#721c24";
      case "Hazırlanıyor":
        return "#004085";
      case "Teslim Edildi":
        return "#155724";
      default:
        return "#383d41";
    }
  }};
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-width: 100px;
`;

const ApproveAllButton = styled.button`
  background: linear-gradient(145deg, #6c5ce7, #8a2be2);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(108, 92, 231, 0.2);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const PendingOrdersSection = styled.div`
  margin-bottom: 2rem;
  background: rgba(255, 244, 222, 0.3);
  border-radius: 15px;
  padding: 1rem;
  border: 2px dashed #ffd700;
`;

const PendingSectionTitle = styled.h3`
  color: #856404;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "⚠️";
  }
`;

const ScoreInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: #6c5ce7;
  margin-top: 0.5rem;
`;

const ScoreBadge = styled.span`
  background: linear-gradient(145deg, #e6e6ff, #f0f0ff);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-weight: 500;
`;

const WaitingTime = styled.span`
  color: #856404;
  font-style: italic;
`;

const LogSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed rgba(147, 112, 219, 0.2);
`;

const LogTitle = styled.h4`
  color: #6c5ce7;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const LogItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  background: ${(props) => {
    switch (props.type) {
      case "Oluşturma":
        return "rgba(108, 92, 231, 0.05)";
      case "Hata":
        return "rgba(255, 99, 99, 0.05)";
      default:
        return "rgba(147, 112, 219, 0.05)";
    }
  }};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const LogTime = styled.span`
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
`;

const LogType = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c5ce7;
  padding: 0.2rem 0.6rem;
  background: rgba(108, 92, 231, 0.1);
  border-radius: 12px;
  white-space: nowrap;
`;

const LogMessage = styled.span`
  font-size: 0.9rem;
  color: #4a4a4a;
  flex: 1;
`;

const LogPanel = styled.div`
  margin-top: 1rem;
`;

const LogPanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: rgba(108, 92, 231, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(108, 92, 231, 0.1);
  }
`;

const LogPanelIcon = styled.span`
  font-size: 1.2rem;
  color: #6c5ce7;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const LogPanelContent = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 0 0 8px 8px;
  max-height: ${props => props.isOpen ? '300px' : '0'};
  overflow-y: auto;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const customerID = localStorage.getItem("customerID");
  const [isApproving, setIsApproving] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [, forceUpdate] = useState(0);
  const [customerTypes, setCustomerTypes] = useState({});
  const [logs, setLogs] = useState({});
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let data = await orderService.getAllOrders();
        
        // Öncelik skorlarını güncelle ve sırala
        const sortedOrders = data.sort((a, b) => {
          // If both orders are pending, sort by priority score
          if (a.orderStatus === "Bekliyor" && b.orderStatus === "Bekliyor") {
            const scoreA = calculatePriorityScore(a);
            const scoreB = calculatePriorityScore(b);
            return scoreB - scoreA; // Higher score first
          }
          
          // Pending orders always come first
          if (a.orderStatus === "Bekliyor") return -1;
          if (b.orderStatus === "Bekliyor") return 1;
          
          // For non-pending orders, sort by date
          return new Date(b.orderDate) - new Date(a.orderDate);
        });

        setOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        console.error("Hata:", err);
        setError("Siparişler yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };

    fetchOrders();
    // Her saniye güncelle
    const interval = setInterval(fetchOrders, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCustomerTypes = async () => {
        try {
            console.log('Siparişler:', orders);
            const uniqueCustomerIds = [...new Set(orders.map(order => order.customerID))];
            console.log('Benzersiz müşteri IDleri:', uniqueCustomerIds);
            
            const types = {};
            for (const customerId of uniqueCustomerIds) {
                console.log(`${customerId} için müşteri tipi alınıyor...`);
                const customerType = await customerService.getCustomerType(customerId);
                console.log(`${customerId} müşteri tipi:`, customerType);
                types[customerId] = customerType;
            }

            setCustomerTypes(types);
        } catch (err) {
            console.error("Müşteri tipleri yüklenirken hata:", err);
        }
    };

    if (orders.length > 0) {
        fetchCustomerTypes();
    }
}, [orders]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsData = await logService.getAllLogs();
        const groupedLogs = logsData.reduce((acc, log) => {
          if (!acc[log.orderID]) {
            acc[log.orderID] = [];
          }
          acc[log.orderID].push(log);
          return acc;
        }, {});
        setLogs(groupedLogs);
      } catch (error) {
        console.error("Loglar yüklenirken hata:", error);
      }
    };

    fetchLogs();
    const logRefreshTimer = setInterval(fetchLogs, 30000);
    return () => clearInterval(logRefreshTimer);
  }, []);

  const handleApproveAll = async () => {
    if (
      !window.confirm(
        "Tüm bekleyen siparişleri onaylamak istediğinize emin misiniz?"
      )
    ) {
      return;
    }

    setIsApproving(true);
    try {
      await orderService.approveAllPendingOrders();
      const updatedOrders = await orderService.getAllOrders();
      setOrders(updatedOrders);
      alert("Tüm bekleyen siparişler onaylandı!");
    } catch (error) {
      console.error("Toplu onaylama sırasında hata:", error);
      alert("Siparişler onaylanırken bir hata oluştu!");
    } finally {
      setIsApproving(false);
    }
  };

  const calculateWaitingTime = (orderDate) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const diffInSeconds = Math.floor((currentTime - orderTime) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}dk ${seconds}sn`;
  };

  const calculatePriorityScore = (order) => {
    const orderTime = new Date(order.orderDate).getTime();
    const currentTime = new Date().getTime();
    const waitingTimeInSeconds = Math.floor((currentTime - orderTime) / 1000);

    const customerType = customerTypes[order.customerID];
    console.log('Müşteri tipi:', customerType);

    const customerTypePriority = 
        customerType?.toLowerCase() === 'standard' || 
        customerType?.toLowerCase() === 'standart' ? 10 : 20;

    console.log('Seçilen öncelik katsayısı:', customerTypePriority);

    const waitingScore = waitingTimeInSeconds * 0.5;
    return (customerTypePriority + waitingScore).toFixed(2);
  };

  const displayOrders = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => {
      if (a.orderStatus === "Bekliyor" && b.orderStatus === "Bekliyor") {
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        return scoreB - scoreA;
      }
      if (a.orderStatus === "Bekliyor") return -1;
      if (b.orderStatus === "Bekliyor") return 1;
      return new Date(b.orderDate) - new Date(a.orderDate);
    });

    return sortedOrders;
  }, [orders, customerTypes]);

  const pendingOrders = displayOrders.filter(order => order.orderStatus === "Bekliyor");
  const otherOrders = displayOrders.filter(order => order.orderStatus !== "Bekliyor");

  const toggleLogs = (orderId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const renderOrderTable = (orderList) => (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>Sipariş No</Th>
            {isAdmin && <Th>Müşteri ID</Th>}
            <Th>Tarih</Th>
            <Th>Ürün Sayısı</Th>
            <Th>Toplam</Th>
            <Th>Durum</Th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order, index) => {
            if (!order || !order.orderItems) return null;

            const totalPrice = order.orderItems.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0
            );

            return (
              <React.Fragment key={order.orderID || index}>
                <OrderRow
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.orderID ? null : order.orderID
                    )
                  }
                >
                  <Td>#{(order.orderID || "0").toString().padStart(4, "0")}</Td>
                  {isAdmin && <Td>{order.customerID}</Td>}
                  <Td>
                    {new Date(order.orderDate).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {order.orderStatus === "Bekliyor" && (
                      <ScoreInfo>
                        <ScoreBadge>
                          Öncelik Skoru: {calculatePriorityScore(order)}
                        </ScoreBadge>
                        <WaitingTime>
                          Bekleme Süresi:{" "}
                          {calculateWaitingTime(order.orderDate)}
                        </WaitingTime>
                      </ScoreInfo>
                    )}
                  </Td>
                  <Td>{order.orderItems.length} ürün</Td>
                  <Td>{totalPrice.toFixed(2)} ₺</Td>
                  <Td>
                    <StatusBadge status={order.orderStatus}>
                      {order.orderStatus || "Bilinmiyor"}
                    </StatusBadge>
                  </Td>
                </OrderRow>
                {expandedOrder === order.orderID && (
                  <tr>
                    <Td colSpan={isAdmin ? 6 : 5}>
                      <ProductDetails>
                        <ProductInfo>
                          {order.orderItems.map((item, i) => (
                            <ProductItem key={i}>
                              <span>
                                #{item.productID || "0"} - {item.quantity || 0}{" "}
                                adet
                              </span>
                              <span>
                                {(
                                  (item.quantity || 0) * (item.unitPrice || 0)
                                ).toFixed(2)}{" "}
                                ₺
                              </span>
                            </ProductItem>
                          ))}
                        </ProductInfo>
                        <TotalPrice>
                          Toplam Tutar: {totalPrice.toFixed(2)} ₺
                        </TotalPrice>

                        {logs[order.orderID] && logs[order.orderID].length > 0 && (
                          <LogPanel>
                            <LogPanelHeader onClick={() => toggleLogs(order.orderID)}>
                              <LogPanelIcon isOpen={expandedLogs.has(order.orderID)}>
                                ▼
                              </LogPanelIcon>
                              <LogTitle>
                                Sipariş Geçmişi ({logs[order.orderID].length} log)
                              </LogTitle>
                            </LogPanelHeader>
                            
                            <LogPanelContent isOpen={expandedLogs.has(order.orderID)}>
                              {logs[order.orderID].map((log, index) => (
                                <LogItem key={index} type={log.logType}>
                                  <LogTime>
                                    {new Date(log.logDate).toLocaleString("tr-TR")}
                                  </LogTime>
                                  <LogType>{log.logType}</LogType>
                                  <LogMessage>{log.logDetails}</LogMessage>
                                </LogItem>
                              ))}
                            </LogPanelContent>
                          </LogPanel>
                        )}
                      </ProductDetails>
                    </Td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );

  return (
    <OrdersContainer isVisible={isContentVisible}>
      <HeaderSection>
        <Title
          onClick={() => setIsContentVisible(!isContentVisible)}
          isVisible={isContentVisible}
        >
          Tüm Siparişler {isContentVisible ? "▼" : "▲"}
        </Title>
        {isAdmin && (
          <HeaderActions isVisible={isContentVisible}>
            <ApproveAllButton
              onClick={handleApproveAll}
              disabled={isApproving || !pendingOrders.length}
            >
              {isApproving
                ? "Onaylanıyor..."
                : "Tüm Bekleyen Siparişleri Onayla"}
            </ApproveAllButton>
          </HeaderActions>
        )}
      </HeaderSection>

      <ContentContainer isVisible={isContentVisible}>
        {pendingOrders.length > 0 && (
          <PendingOrdersSection>
            <PendingSectionTitle>
              Onay Bekleyen Siparişler ({pendingOrders.length})
            </PendingSectionTitle>
            {renderOrderTable(pendingOrders)}
          </PendingOrdersSection>
        )}

        <div style={{ marginTop: "2rem" }}>
          <h3>Diğer Siparişler ({otherOrders.length})</h3>
          {renderOrderTable(otherOrders)}
        </div>
      </ContentContainer>
    </OrdersContainer>
  );
};

export default Orders;
