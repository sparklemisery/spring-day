navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error(err));


document.addEventListener('DOMContentLoaded', async function () {
  const video = document.getElementById('video');
  const progressBar = document.getElementById('progressBar');
  const theh1 = document.getElementById('the-h1');
  const container = document.getElementsByClassName('container');
  const bodyElement = document.body;
  var dk = true;
  // Load face-api models
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://sparklemisery.github.io/spring-day/models/tiny_face_detector_model-weights_manifest.json'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://sparklemisery.github.io/spring-day/models/face_landmark_68_model-weights_manifest.json'),
    faceapi.nets.faceExpressionNet.loadFromUri('https://sparklemisery.github.io/spring-day/models/face_expression_model-weights_manifest.json')
  ]);


  // Start video

  // Function to update progress bar based on detected expression
  function updateProgressBar(expression) {
    if (!dk && expression === 'surprised') {
      bodyElement.style.background = 'rgba(238, 174, 202, 0)';
      video.style.display = 'none';
      theh1.style.display = 'none';
      progressBar.style.display = 'none';
      container[0].style.display = 'grid';
      dk = true;

    }
    if (expression === 'happy' && dk) {
      const currentWidth = progressBar.clientWidth;
      const videoWidth = window.innerWidth;
      const newWidth = currentWidth + (videoWidth / 10); // Increment width by 10%
      progressBar.style.width = `${Math.min(newWidth, videoWidth)}px`; // Limit width to video width
      console.log(expression);

      if (newWidth >= videoWidth) {
        dk = false;
        theh1.innerHTML = "show surprising"
        document.body.classList.add('pink-bg'); // Change background color to pink when width reaches video width
        clearInterval(intervalId); // Stop updating progress bar
      }
    }
  }

  // Event listener to detect expression changes
  video.addEventListener('play', async () => {
    const intervalId = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, { width: video.width, height: video.height });

      // Get the dominant expression
      let dominantExpression = '';
      let maxConfidence = -Infinity;
      resizedDetections.forEach(detection => {
        const expressions = detection.expressions;
        Object.entries(expressions).forEach(([expression, confidence]) => {
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            dominantExpression = expression;
          }
        });
      });

      // Update progress bar
      updateProgressBar(dominantExpression);
    }, 100);
  });
});
