#Simple File Upload Example

I've been asked a few times lately about uploading files with progress events
in web applications, so I thought I'd go over it real quick with an example.

## HTML
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <progress id="progress" value="0" max="100"></progress>
    <input type="file" id="filepicker"/>
    <script src="client.js"></script>
  </body>
</html>
```

The HTML consists of a progress bar which represents a percentage, and thus
has a max of 100.  An input with a type attribute of file is used as our
filepicker.

## Server
```javascript
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
```
Here we create a server listening on port 3000.  The first branch of the
conditional in the request handler function is boilerplate; it serves the
client side JavaScript when asked, else the index html.  The second branch
assumes the entirety of the HTTP POST's body is a single file.  We then read
out a non standard filename out from the HTTP headers.  Non standard headers
are frequently prefixed with 'X-', though node.js' http runtime library
[converts all headers to lowercase](https://github.com/joyent/node/blob/e1f4f6aa28e14406edab737677636603bf6ab81f/lib/_http_incoming.js#L146).

## Client
```javascript
var progress = document.getElementById('progress');
document.getElementById('filepicker').addEventListener('change', function (e) {
  if (e.target.files.length < 1) return;
  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/upload');
  xhr.setRequestHeader('X-Filename', e.target.files[0].name);
  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) progress.value = e.loaded / e.total * 100;
  };
  xhr.send(e.target.files[0]);
});
```

The basis here is that we listen for the input[type=file] element's change
event.  We then grab the file from the change event's `target.files` which
is an array (we could add the boolean attribute to allow multiple files to be
selected).  We also, send along the file's name in an additional header. Note:
it [looks like](http://caniuse.com/#feat=xhr2)
`XMLHttpRequest.prototype.upload` is only defined in IE 10+, but so are
[progress elements](http://caniuse.com/#feat=progressmeter).

## FormData
Why not use
[FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)?
[Ockham's Razor](http://en.wikipedia.org/wiki/Occam%27s_razor).
FormData is much more powerful, but
makes the server side logic much more complex, though there are
[many](https://github.com/felixge/node-formidable)
[libraries](https://github.com/mscdex/busboy)
that can
[help](https://github.com/superjoe30/node-multiparty/).  Server side processing
is
[much simpler](http://php.net/manual/en/reserved.variables.files.php)
in PHP as the `$_FILES` superglobal contains an associative array of the files.

##Additional Links
* [Using FormData Objects](https://developer.mozilla.org/en-US/docs/Web/Guide/Using_FormData_Objects)
* [Submitting forms and uploading files](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Submitting_forms_and_uploading_files)
* [Sending data](http://www.html5rocks.com/en/tutorials/file/xhr2/#toc-sending)
* [RFC 1867 - Form-based File Upload in HTML](http://www.faqs.org/rfcs/rfc1867.html)
* [RFC 2388 - Returning Values from Forms: multipart/form-data](http://www.faqs.org/rfcs/rfc2388.html)

