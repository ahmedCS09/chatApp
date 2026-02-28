const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello, World!');
});

server.listen(3006, 'localhost', () => {
    console.log('Server is running on http://localhost:3006');
});

server.on('error', (e) => {
    console.error('Server error:', e);
});
