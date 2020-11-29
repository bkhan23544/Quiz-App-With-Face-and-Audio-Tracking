import React, { useEffect } from 'react'
import * as faceapi from 'face-api.js';
import Webcam from "react-webcam";
import Jimp from 'jimp'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress'


const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'center',
    textAlign: 'center',
    marginTop:'30px'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


function Face(props) {

  const classes = useStyles();
  const webcamRef = React.useRef(null);
  const [settings, setSettings] = React.useState({})
  const vidHeight = settings.vidHeight;
  const vidWidth = settings.vidWidth;
  const [croppedImages, setCroppedImages] = React.useState([])
  const [ogImages, setOgImages] = React.useState([])
  const [inside, setInside] = React.useState("")
  const [close, setClose] = React.useState("")
  const [align, setAlign] = React.useState("")
  const [bright, setBright] = React.useState("")
  const [faceStat, setFaceStat] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [faceLoading, setFaceLoading] = React.useState(false)



  useEffect(async() => {

//   props.setTitle("Face Registration")

    var setting = {}
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    if (parsed.setting) {
      setting = require("../Settings/" + parsed.setting)
      //setting can be accessed from anywhere in the component
      setSettings(setting)
      loadModels(setting)
    }
    else {
      setting = require("../Settings/settings.json")
      setSettings(setting)
      loadModels(setting)
   
      console.log(setting, "settings")
    }

  }, [])


  const loadModels = (setting) => {
    Promise.all([
      faceapi.loadFaceLandmarkModel('models'),
      faceapi.loadTinyFaceDetectorModel('models'),

    ]).then(() => {
      setLoading(false)
      var c = document.getElementById("canvas1")
      var ctx = c.getContext("2d")
      ctx.strokeStyle = "#FF0000";
      ctx.setLineDash([6]);
      console.log(setting.vidWidth, setting.vidHeight)
      ctx.strokeRect((setting.vidWidth / 100) * setting.boxPercentX, (setting.vidHeight / 100) * setting.boxPercentY, setting.boxWidth * setting.vidHeight, setting.vidHeight*setting.boxHeight );
      ctx.font = "12px Arial";
      ctx.fillText("Come closer", 10, 20);
      ctx.fillText("Keep face straight and front looking", 10, 40);
      // console.log("loaded")
    })
  }

  function performChecks(e) {
    const video = webcamRef;
    //Creating a canvas to add overlay image
    const canvas = document.getElementById("canvas")
    const displaySize = { width: vidWidth, height: vidHeight };
    faceapi.matchDimensions(canvas, displaySize);

    //Asynchronusly get detections from the video Stream
    var interval = setInterval(async () => {

      const detections = await faceapi
        .detectAllFaces(video.current.video, new faceapi.TinyFaceDetectorOptions()) //Face Detectors
        .withFaceLandmarks() // Get cordinates of landmarks
      // Resize and Display the detections on the video frame using canvas
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      // setPrevFace(resizedDetections[0])

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      if (resizedDetections[0] && resizedDetections[0].alignedRect.score > settings.minFaceScore) {
        var pTopLeft = { x: resizedDetections[0].alignedRect.box.topLeft.x, y: resizedDetections[0].alignedRect.box.topLeft.y }
        var pBottomRight = { x: resizedDetections[0].alignedRect.box.bottomRight.x, y: resizedDetections[0].alignedRect.box.bottomRight.y }
        var bb = { ix: (vidWidth / 100) * 21, iy: (vidHeight / 100) * 10, ax: (vidWidth / 100) * 77, ay: (vidHeight / 100) * 90 }

        //checking if face is inside the box.
        if ((isInside(pTopLeft, bb) && isInside(pBottomRight, bb)) || !settings.insideCheck) {
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          handleInside(false)
          const dist = faceapi.euclideanDistance([resizedDetections[0].landmarks.getRightEye()[0]._x, resizedDetections[0].landmarks.getRightEye()[0]._y], [resizedDetections[0].landmarks.getLeftEye()[0]._x, resizedDetections[0].landmarks.getLeftEye()[0]._y])
          const slope = (resizedDetections[0].landmarks.getLeftEye()[0]._y - resizedDetections[0].landmarks.getRightEye()[0]._y) / (resizedDetections[0].landmarks.getLeftEye()[0]._x - resizedDetections[0].landmarks.getRightEye()[0]._x)
          //checking if height and width are greater than 200px
          if ((resizedDetections[0].alignedRect.box.width > settings.minRes && resizedDetections[0].alignedRect.box.height > settings.minRes) || !settings.closeCheck) {
            handleClose(false)
            //checking if face is properly aligned.
            if (((dist > settings.minEyeDist && dist < settings.maxEyeDist) && (slope > settings.minSlope && slope < settings.maxSlope)) || !settings.alignCheck) {
              Promise.all([
                handleAlign(false)
              ])
                .then(() => {
                  var al = resizedDetections[0].landmarks.align()
                  // console.log(resizedDetections[0])
                  cropAndSave(e, al, interval, canvas,resizedDetections[0])
                })
            }
            else {
              handleAlign(true)
            }
          }
          else {
            handleClose(true)
          }
        }
        else {
          handleInside(true)
        }
      }
    }, 500)

  }

  const isInside = (p, bb) => {
    if (bb.ix <= p.x && p.x <= bb.ax && bb.iy <= p.y && p.y <= bb.ay) {
      return true
    }

    else {
      return false
    }
  }

  const cropAndSave = (e, box, interval, canvas,resizedDetections) => {

    const images = croppedImages
    var og = ogImages
    var srcimg = webcamRef.current.getScreenshot();

    Jimp.read(srcimg)
      .then((img) => {

        getImageLightness(img.bitmap, function (brightness) {
          console.log(brightness)
          //checking if brightness is not too high and not too low.
          if ((brightness > settings.minBright && brightness < settings.maxBright) || !settings.brightnessCheck) {
            handleInside(false)
            handleAlign(false)
            handleClose(false)
            handleBright(false)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              og[e.target.id] = src
              setOgImages(og)
              if (og[0] !== undefined && og[1] !== undefined && og[2] !== undefined && og[3] !== undefined) {
                document.getElementById("submit").style.display = "inline"
              }
            })
   
            if(settings.rotateAlign){
            var righteye = resizedDetections.landmarks.getRightEye()[0]
            var lefteye = resizedDetections.landmarks.getLeftEye()[0]
            var angle = calculateAngle(righteye._x, righteye._y,lefteye._x, lefteye._y,30,0,60,0)
            console.log(angle,"angle")
            
            img.crop(box.x, box.y, box.width, box.height)
            img.rotate(angle)
          }
          else{
            img.crop(box.x, box.y, box.width, box.height)
          }
            
            
            img.getBase64(Jimp.AUTO, async (err, src) => {
              clearInterval(interval)
              handleCaptured(src,e,canvas,images)
              setCroppedImages(images);
            })
          }
          else {
            handleBright(true)
          }
        })

      })
  }

  const matchImages = async (e) => {
    setFaceLoading(true)
    Promise.all([
      faceapi.loadFaceRecognitionModel('models'),
      faceapi.loadSsdMobilenetv1Model('models')
    ])
      .then(async () => {
        //detecting faces with descriptors
        const img1 = await faceapi.detectAllFaces(base64ToEl(ogImages[0]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img2 = await faceapi.detectAllFaces(base64ToEl(ogImages[1]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img3 = await faceapi.detectAllFaces(base64ToEl(ogImages[2]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const img4 = await faceapi.detectAllFaces(base64ToEl(ogImages[3]), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        const displaySize = { width: vidWidth, height: vidHeight };
        //resizing detections
        var detections = {
          detection1: faceapi.resizeResults(img1, displaySize),
          detection2: faceapi.resizeResults(img2, displaySize),
          detection3: faceapi.resizeResults(img3, displaySize),
          detection4: faceapi.resizeResults(img4, displaySize),
        }

        //getting eucledian distance between detections. Less means more close
        if (detections.detection1[0] && detections.detection2[0] && detections.detection3[0] && detections.detection4[0]) {
          const distance1 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection2[0].descriptor);
          const distance2 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection3[0].descriptor);
          const distance3 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection4[0].descriptor);
          if (distance1 < settings.faceMatchDist && distance2 < settings.faceMatchDist && distance3 < settings.faceMatchDist) {
            var finalArray = [
              {
                fullImg: ogImages[0],
                croppedImg: croppedImages[0],
                resizedDetections: detections.detection1,
                timeStamp: Date.now()
              },
              {
                fullImg: ogImages[0],
                croppedImg: croppedImages[1],
                resizedDetections: detections.detection2,
                timeStamp: Date.now()
              },
              {
                fullImg: ogImages[2],
                croppedImg: croppedImages[2],
                resizedDetections: detections.detection3,
                timeStamp: Date.now()
              },
              {
                fullImg: ogImages[3],
                croppedImg: croppedImages[3],
                resizedDetections: detections.detection4,
                timeStamp: Date.now()
              }
            ]

            var finalObj = {
              userData: JSON.parse(localStorage.getItem("userData")),
              images: finalArray,
              organization: settings.organization,
              project: settings.project,
            }


            const response = await fetch(settings.server_url, {
              method: settings.server_method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(finalObj)
            });
            console.log(response.json(), "response");

            setFaceLoading(false)
            document.getElementById("submit").style.display="inline"  
         
           handleSameFace()

          }

          else {
            setFaceLoading(false)
            document.getElementById("submit").style.display="inline"  
            handleNotSameFace()
          }
        }
        else {
          for (var i = 1; i < 5; i++) {
            if (detections["detection" + i].length == 0) {
              var imgEl = document.getElementById(i - 1)
              imgEl.src = "https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png"
              imgEl.style.border = "none"
              setFaceStat(`Take Image ${i} Again`)
            }
          }
          setFaceLoading(false)
          document.getElementById("submit").style.display="inline"  
          setTimeout(() => {
            setFaceStat("")
          }, 3000);

        }
      })
  }

  const base64ToEl = (src) => {
    var img = document.createElement("img")
    img.src = src
    return img;
  }

  const calculateAngle=(A1x,A1y,A2x,A2y,B1x,B1y,B2x,B2y)=>{
    var dAx = A2x - A1x;
    var dAy = A2y - A1y;
    var dBx = B2x - B1x;
    var dBy = B2y - B1y;
    console.log(A1x,A1y,A2x,A2y,B1x,B1y,B2x,B2y)
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy)
    if(angle < 0) {
    angle = angle * -1;
    var degree_angle = angle * (180 / Math.PI);
    console.log(degree_angle,"real angle")
    return degree_angle+180
  }
  else{
    var degree_angle = angle * (180 / Math.PI);
    console.log(degree_angle,"role angle")
    return (degree_angle+180)*-1
  }
  //   if(degree_angle>180){
  //   return degree_angle
  // }
  // else{
  //   return degree_angle+180
  // }
  }


  function getImageLightness(imageSrc, callback) {
    var colorSum = 0;

    var data = imageSrc.data;
    var r, g, b, avg;

    for (var x = 0, len = data.length; x < len; x += 4) {
      r = data[x];
      g = data[x + 1];
      b = data[x + 2];

      avg = Math.floor((r + g + b) / 3);
      colorSum += avg;
    }

    var brightness = Math.floor(colorSum / (imageSrc.width * imageSrc.height));
    callback(brightness);

  }

  const handleInside = async (status) => {
    if(status){
    setInside("Not Inside")
    }
    else{
      setInside("")
    }
  }

  const handleAlign = async (status) => {
    if(status){
      setAlign("Not Aligned")
      }
      else{
        setAlign("")
      }
  }

  const handleClose = async (status) => {
    if(status){
      setClose("Not Close")
      }
      else{
        setClose("")
      }
  }

  const handleBright = async (status) => {
    if(status){
      setBright("Too Bright Or Too Dark")
      }
      else{
        setBright("")
      }
  }

  const handleCaptured = (src,e,canvas,images) =>{
    e.target.src = src
    e.target.style = "border:4px solid green"
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    images[e.target.id] = src;
  }

  const handleSameFace=()=>{
    
    var canvas = document.getElementById("canvas1")
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Thanks!", canvas.width / 2, canvas.height / 2);
    setFaceStat("Same Faces")
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFaceStat("")
    }, 3000);;
  }

  const handleNotSameFace=()=>{
    setFaceStat("Not Same")
    setTimeout(() => {
      setFaceStat("")
    }, 3000);
  }






  return (
    <div className={classes.root}>
      <Grid container spacing={3}
        justify="center">
        <Grid item xs={12}>
          <Paper>
            <Typography variant="body1">Face Registration/New</Typography>
          </Paper>
        </Grid>
        <Grid container spacing={3} xs={12} justify="center">
          <Grid item xs={4.5}>


            {loading ? <CircularProgress />
              :
              <div className="row" style={{ border: "7px solid red" }}><Webcam
                audio={false}
                height={vidHeight}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={vidWidth}
              />
                <canvas id="canvas" width={vidWidth} height={vidHeight} />
                <canvas id="canvas1" width={vidWidth} height={vidHeight} />
              </div>}




          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <h3>Instruction Panel</h3>
              <div style={{ textAlign: "left" }}>
                {!loading && <p style={{ marginTop: "0px", marginBottom: "0px", color: "green", textAlign: "center" }}>Webcam Ready</p>}
                <p style={{ marginTop: "0px", marginBottom: "0px" }}>1. Put your face inside the square box.</p>
                <p style={{ marginTop: "0px", marginBottom: "0px" }}>2. Press camera icon to take picture.</p>
                <p style={{ marginTop: "0px", marginBottom: "0px" }}>3. Align face in front direction.</p>
                <p style={{ marginTop: "0px", marginBottom: "0px" }}>4. Make sure it is not too bright or too dark.</p>
                <p style={{ marginTop: "0px", marginBottom: "0px" }}>5. Press Submit after taking all 4 images to submit images.</p>
              </div>

              {faceLoading ? <CircularProgress /> :
                <div>
                  {/* {ogImages[0]!==undefined && ogImages[1]!==undefined && ogImages[2]!==undefined && ogImages[3]!==undefined &&  */}
                  <Button id="submit" variant="contained" color="primary" onClick={matchImages} style={{ display: "none" }}>
                    Submit
</Button>
                  <p>{faceStat}</p>
                </div>}
            </Paper>

          </Grid>
          <Grid item xs={4}>
            <Paper style={{ backgroundColor: "red", color: "white" }}>

              {(inside!=="" || close!=="" || align!=="" || bright!=="") && <h6>Errors:</h6>}
            <p>{inside}</p>
            <p>{close}</p>
            <p>{align}</p>
            <p>{bright}</p>
            </Paper>
          </Grid>
          <Grid id="icons-side" item xs={5}>
            <Paper>
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" id="img" width="100" height="100" id="0" className="ml-2 mt-2 mb-2" onClick={(e) => { performChecks(e) }} />
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" id="img" width="100" height="100" id="1" className="ml-2 mt-2 mb-2" onClick={(e) => { performChecks(e) }} />
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" id="img" width="100" height="100" id="2" className="ml-2 mt-2 mb-2" onClick={(e) => { performChecks(e) }} />
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" id="img" width="100" height="100" id="3" className="ml-2 mt-2 mb-2" onClick={(e) => { performChecks(e) }} />
            </Paper>
          </Grid>

        </Grid>
      </Grid>
    </div>

  )
}

export default Face;