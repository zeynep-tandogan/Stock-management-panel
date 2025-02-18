import axios from 'axios';

const API_URL = "http://localhost:5050/api";

export const orderService = {
    getAllOrders: async () => {
        try {
            const response = await axios.get(`${API_URL}/Order`);
            return response.data;
        } catch (error) {
            throw new Error("Siparişler yüklenirken bir hata oluştu");
        }
    },

    deleteOrder: async (id) => {
        try {
            await axios.delete(`${API_URL}/Order/${id}`);
        } catch (error) {
            throw new Error("Sipariş silinirken bir hata oluştu");
        }
    },

    createOrder: async (orderData, headers) => {
        try {
            console.log('Sipariş isteği gönderiliyor:', orderData);
            console.log('Headers:', headers);

            const response = await fetch(`${API_URL}/Order/createOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            console.log('Sipariş yanıtı:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Sipariş oluşturulamadı');
            }

            return data;
        } catch (error) {
            console.error('Order service error:', error);
            throw error;
        }
    },

    updateOrder: async (id, orderData) => {
        try {
            await axios.put(`${API_URL}/Order/${id}`, orderData);
        } catch (error) {
            throw new Error("Sipariş güncellenirken bir hata oluştu");
        }
    },

    approveOrder: async (id) => {
        try {
            await axios.put(`${API_URL}/Order/Approve/${id}`);
        } catch (error) {
            throw new Error("Sipariş onaylanırken bir hata oluştu");
        }
    },

    rejectOrder: async (id) => {
        try {
            await axios.put(`${API_URL}/Order/Reject/${id}`);
        } catch (error) {
            throw new Error("Sipariş reddedilirken bir hata oluştu");
        }
    },

    approveAllPendingOrders: async () => {
        try {
            await axios.put(`${API_URL}/Order/approve-and-distribute`);
        } catch (error) {
            throw new Error("Siparişler toplu onaylanırken bir hata oluştu");
        }
    },

    createLog: async (logData) => {
        try {
            console.log('Log isteği gönderiliyor:', logData);
            
            // LogDTO formatına uygun olduğundan emin olalım
            const formattedLogData = {
                customerID: parseInt(logData.customerID),
                orderID: logData.orderID || 0,
                logDate: new Date(logData.logDate).toISOString(),
                logType: logData.logType || "Bilinmeyen",
                logDetails: logData.logDetails || "Detay yok"
            };

            console.log('Formatlanmış log verisi:', formattedLogData);
            
            const response = await axios.post(`${API_URL}/Log`, formattedLogData);
            console.log('Log yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Log oluşturma hatası:', error.response?.data || error.message);
            throw error;
        }
    },
};