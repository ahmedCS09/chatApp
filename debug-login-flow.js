const axios = require('axios');

async function testFullFlow() {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    const fullName = 'Test User';

    console.log(`Testing with email: ${email}`);

    try {
        console.log("Registering...");
        const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
            fullName,
            email,
            password
        });
        console.log("Registration successful:", registerRes.data);

        console.log("Logging in...");
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email,
            password
        });
        console.log("Login successful:", loginRes.data);

    } catch (error) {
        if (error.response) {
            console.error("Request failed with status:", error.response.status, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testFullFlow();
