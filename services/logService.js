import axios from 'axios';

const API_URL = "http://localhost:5050/api";

export const logService = {
    getAllLogs: async () => {
        try {
            const response = await axios.get(`${API_URL}/Log`);
            return response.data;
        } catch (error) {
            console.error('Log verileri alınırken hata:', error);
            throw error;
        }
    },

    getCustomerLogs: async (customerId) => {
        try {
            const logs = await logService.getAllLogs();
            const customerLogs = logs.filter(log => log.customerID === parseInt(customerId));
            console.log("Bulunan müşteri logları:", customerLogs);
            return customerLogs;
        } catch (error) {
            throw new Error("Müşteri logları alınırken bir hata oluştu");
        }
    },
};