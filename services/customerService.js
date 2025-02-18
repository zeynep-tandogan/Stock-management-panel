import axios from 'axios';

const API_URL = "http://localhost:5050/api";

export const customerService = {
    getAllCustomers: async () => {
        try {
            const response = await axios.get(`${API_URL}/Customer`);
            return response.data;
        } catch (error) {
            throw new Error("Müşteriler yüklenirken bir hata oluştu");
        }
    },

    deleteCustomer: async (id) => {
        try {
            await axios.delete(`${API_URL}/Customer/${id}`);
        } catch (error) {
            throw new Error("Müşteri silinirken bir hata oluştu");
        }
    },

    createCustomer: async (customerData) => {
        try {
            await axios.post(`${API_URL}/Customer`, customerData);
        } catch (error) {
            throw new Error("Müşteri eklenirken bir hata oluştu");
        }
    },

    createStandardCustomer: async (customerName, budget) => {
        try {
            await axios.post(`${API_URL}/Customer/CreateStandard`, {
                customerName,
                budget,
                customerType: "Standard"
            });
        } catch (error) {
            throw new Error("Standart müşteri eklenirken bir hata oluştu");
        }
    },

    createPremiumCustomer: async (customerName, budget) => {
        try {
            await axios.post(`${API_URL}/Customer/CreatePremium`, {
                customerName,
                budget,
                customerType: "Premium"
            });
        } catch (error) {
            throw new Error("Premium müşteri eklenirken bir hata oluştu");
        }
    },

    updateCustomer: async (id, customerData) => {
        try {
            await axios.put(`${API_URL}/Customer/${id}`, customerData);
        } catch (error) {
            throw new Error("Müşteri güncellenirken bir hata oluştu");
        }
    },

    getCustomerType: async (customerId) => {
        try {
            console.log(`GET isteği: ${API_URL}/Customer/type/${customerId}`);
            const response = await axios.get(`${API_URL}/Customer/type/${customerId}`);
            console.log('Yanıt:', response.data);
            
            // Yanıt formatını kontrol et
            if (response.data && response.data.customerType) {
                return response.data.customerType;
            } else {
                console.warn('Beklenmeyen yanıt formatı:', response.data);
                return 'Standard';
            }
        } catch (error) {
            console.error('Müşteri tipi alınırken hata:', error.response || error);
            return 'Standard';
        }
    },

    getCustomerById: async (id) => {
        try {
            const customers = await customerService.getAllCustomers();
            const customer = customers.find(customer => customer.customerID === parseInt(id));
            console.log("Bulunan müşteri:", customer);
            return customer;
        } catch (error) {
            throw new Error("Müşteri bilgisi alınırken bir hata oluştu");
        }
    }
}; 