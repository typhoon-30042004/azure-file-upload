// script.js
document.getElementById('uploadForm').addEventListener('submit', uploadFile);

async function uploadFile(event) {
  event.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById('fileInput');
  formData.append('file', fileInput.files[0]);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const result = await response.text();
  document.getElementById('message').innerText = result;
}

async function downloadFile() {
  const filename = document.getElementById('downloadFilename').value;
  if (filename) {
    window.location.href = `/download/${filename}`;
  } else {
    alert('Please enter a filename.');
  }
}
