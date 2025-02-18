const API_URL = 'http://localhost:5050/api'; // Backend port numaranıza göre değiştirin

export const login = async (customerName, password) => {
    try {
        const response = await fetch(`${API_URL}/Login/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customerName, password })
        });

        const data = await response.json();
        console.log('API login yanıtı:', data);
        
        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        if (data.success) {
            localStorage.setItem('customerID', data.customerID);
            localStorage.setItem('customerName', data.customerName);
            localStorage.setItem('isAdmin', data.isAdmin);

            return { 
                success: true, 
                user: {
                    customerID: data.customerID,
                    customerName: data.customerName,
                    isAdmin: data.isAdmin
                } 
            };
        } else {
            throw new Error(data.message || 'Giriş başarısız');
        }
    } catch (error) {
        console.error('Auth service hatası:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('customerID');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('customerName');
};

export const getCurrentUser = () => {
    return {
        customerID: localStorage.getItem('customerID'),
        customerName: localStorage.getItem('customerName'),
        isAdmin: localStorage.getItem('isAdmin') === 'true'
    };
};

export const checkCustomerBudget = async (customerID) => {
    try {
        const response = await fetch(`${API_URL}/Customer/budget/${customerID}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Bütçe bilgisi alınamadı');
        }
        
        return data.budget; // API'den dönen bütçe değeri
    } catch (error) {
        console.error('Bütçe kontrolü hatası:', error);
        throw error;
    }
};