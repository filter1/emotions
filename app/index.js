$(document).ready(() => {
  // SDK Needs to create video and canvas nodes in the DOM in order to function
  // Here we are adding those nodes a predefined div.
  const divRoot = $('#affdex_elements')[0];
  const width = 340;
  const height = 240;
  const faceMode = affdex.FaceDetectorMode.LARGE_FACES;
  // Construct a CameraDetector and specify the image width / height and face detector mode.
  const detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

  // Enable detection of all Expressions, Emotions and Emojis classifiers.
  detector.detectAllEmotions();
  detector.detectAllExpressions();
  detector.detectAllEmojis();
  detector.detectAllAppearance();

  // Add a callback to notify when the detector is initialized and ready for runing.
  detector.addEventListener('onInitializeSuccess', () => {
    console.log('The detector reports initialized');
    // Display canvas instead of video feed because we want to draw the feature points on it
    $('#face_video_canvas').css('display', 'block');
    $('#face_video').css('display', 'none');
  });

  function log(nodeName, msg) {
    $(nodeName).append(`<span>${msg}</span><br/>`);
  }

  // function executes when Start button is pushed.
  $('#start').click(() => {
    if (detector && !detector.isRunning) {
      $('#logs').html('');
      detector.start();
    }
    console.log('Clicked the start button');
  });

  // function executes when the Stop button is pushed.
  $('#stop').click(() => {
    console.log('Clicked the stop button');
    if (detector && detector.isRunning) {
      detector.removeEventListener();
      detector.stop();
    }
  });

  // function executes when the Reset button is pushed.
  $('#reset').click(() => {
    console.log('Clicked the reset button');
    if (detector && detector.isRunning) {
      detector.reset();

      $('#results').html('');
    }
  });

  // Add a callback to notify when camera access is allowed
  detector.addEventListener('onWebcamConnectSuccess', () => {
    console.log('Webcam access allowed');
  });

  // Add a callback to notify when camera access is denied
  detector.addEventListener('onWebcamConnectFailure', () => {
    console.log('Webcam access denied');
  });

  // Add a callback to notify when detector is stopped
  detector.addEventListener('onStopSuccess', () => {
    console.log('The detector reports stopped');
    $('#results').html('');
  });

  // Add a callback to receive the results from processing an image.
  // The faces object contains the list of the faces detected in an image.
  // Faces object contains probabilities for all the different expressions,
  // emotions and appearance metrics
  detector.addEventListener('onImageResultsSuccess', (faces, image, timestamp) => {
    $('#results').html('');
    log('#results', `Timestamp: ${timestamp.toFixed(2)}`);
    log('#results', `Number of faces found: ${faces.length}`);
    if (faces.length > 0) {
      log('#results', `Appearance: ${JSON.stringify(faces[0].appearance)}`);
      log('#results', `Emotions: ${JSON.stringify(faces[0].emotions, (key, val) => (val.toFixed ? Number(val.toFixed(0)) : val))}`);
      log('#results', `Expressions: ${JSON.stringify(faces[0].expressions, (key, val) => (val.toFixed ? Number(val.toFixed(0)) : val))}`);
      log('#results', `Emoji: ${faces[0].emojis.dominantEmoji}`);
      drawFeaturePoints(image, faces[0].featurePoints, faces[0].emotions);
    }
  });

  // Draw the detected facial feature points on the image
  function drawFeaturePoints(img, featurePoints, emotions) {
    const contxt = $('#peter')[0].getContext('2d');
    const hRatio = contxt.canvas.width / img.width;
    const vRatio = contxt.canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);

    contxt.strokeStyle = '#FFFFFF';
    $.each(featurePoints, (id) => {
      console.log(id);
      if (id === '12' || id === '30' || id === '32') {
        contxt.beginPath();
        contxt.arc(featurePoints[id].x,
          featurePoints[id].y, 1, 0, 2 * Math.PI);
        contxt.closePath();
        const red = Math.round((emotions.joy / 100) * 255);
        const green = Math.round((emotions.contempt / 100) * 255);
        const blue = Math.round((emotions.engagement / 100) * 255);
        contxt.fillStyle = `rgba(${red}, ${green}, ${blue}, 1)`;
        contxt.fill();
      }
    });
  }

  function fadeOut() {
    const ctx = $('#peter')[0].getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, width, height);
    setTimeout(fadeOut, 1000);
  }

  fadeOut();
});
