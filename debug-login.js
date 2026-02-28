const axios = require('axios');

async function testLogin() {
    console.log("Starting login test...");
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        }, {
            timeout: 10000 // 10 seconds timeout
        });
        console.log("Login successful:", response.data);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error("Login timed out!");
        } else if (error.response) {
            console.error("Login failed with status:", error.response.status, error.response.data);
        } else {
            console.error("Login error:", error.message);
        }
    }
}

testLogin();
