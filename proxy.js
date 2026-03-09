const crypto = require('crypto');
const https = require('https');
const http = require('http');

const API_KEY = process.env.IFLOW_API_KEY;
const SESSION_ID = crypto.randomUUID();

const server = http.createServer((req, res) => {
 let body = '';
 req.on('data', chunk => body += chunk);
 req.on('end', () => {
 const timestamp = Date.now();
 const signature = crypto.createHmac('sha256', API_KEY)
 .update(`iFlow-Cli:${SESSION_ID}:${timestamp}`, 'utf8')
 .digest('hex');

 const options = {
 hostname: 'apis.iflow.cn',
 path: req.url,
 method: req.method,
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${API_KEY}`,
 'user-agent': 'iFlow-Cli',
 'session-id': SESSION_ID,
 'x-iflow-signature': signature,
 'x-iflow-timestamp': timestamp.toString()
 }
 };

 const proxy = https.request(options, (proxyRes) => {
 res.writeHead(proxyRes.statusCode, {
 ...proxyRes.headers,
 'Access-Control-Allow-Origin': '*'
 });
 proxyRes.pipe(res);
 });

 proxy.on('error', (e) => {
 res.writeHead(502);
 res.end(JSON.stringify({ error: e.message }));
 });

 proxy.write(body);
 proxy.end();
 });
});

server.listen(4891, () => console.log('iFlow proxy running on http://localhost:4891'));
