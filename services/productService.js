import axios from 'axios';

const API_URL = "http://localhost:5050/api";

export const productService = {
    getAllProducts: async () => {
        try {
            const response = await axios.get(`${API_URL}/Product`);
            console.log('Ürünler başarıyla getirildi:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ürünler getirilirken hata:', error);
            throw new Error('Ürünler getirilirken hata oluştu');
        }
    },

    createProduct: async (productData) => {
        try {
            console.log('Ürün ekleme isteği:', productData);
            const response = await axios.post(`${API_URL}/Product`, productData);
            console.log('Ürün ekleme yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ürün eklenirken hata:', error);
            throw new Error(error.response?.data?.message || "Ürün eklenirken bir hata oluştu");
        }
    },

    updateProduct: async (id, productData) => {
        try {
            console.log(`Ürün güncelleme isteği - ID: ${id}`, productData);
            const response = await axios.put(`${API_URL}/Product/${id}`, productData);
            console.log('Ürün güncelleme yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ürün güncellenirken hata:', error);
            throw new Error(error.response?.data?.message || "Ürün güncellenirken bir hata oluştu");
        }
    },

    deleteProduct: async (id) => {
        try {
            console.log(`Ürün silme isteği - ID: ${id}`);
            const response = await axios.delete(`${API_URL}/Product/${id}`);
            console.log('Ürün silme yanıtı:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ürün silinirken hata:', error);
            throw new Error(error.response?.data?.message || "Ürün silinirken bir hata oluştu");
        }
    },

    setProductStatus: async (productId, status) => {
        try {
            const response = await axios.put(`${API_URL}/Products/${productId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Ürün durumu güncellenirken hata:', error);
            throw error;
        }
    }
}; 