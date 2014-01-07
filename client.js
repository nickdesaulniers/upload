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

