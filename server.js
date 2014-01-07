var fs = require('fs');
require('http').createServer(function (req, res) {
  if (req.method === 'GET') {
    fs.createReadStream(req.url === '/client.js' ? 'client.js' : 'index.html')
      .pipe(res);
  } else if (req.method === 'POST') {
    req.pipe(fs.createWriteStream(req.headers['x-filename']));
    res.setHeader('Content-Type', 'text/plain');
    res.end();
  }
}).listen(3000);

