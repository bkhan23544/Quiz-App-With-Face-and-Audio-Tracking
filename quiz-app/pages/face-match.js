import React, { useEffect } from 'react'
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress'
import Jimp from 'jimp'
import { useRouter } from 'next/router'




const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'center',
    textAlign: 'center'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function FaceMatch(props) {



//   const loadSettings=()=>{
 
  
//   }
  


  const classes = useStyles();
  const router = useRouter()
  const webcamRef = React.useRef(null);
  const [settings, setSettings] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [croppedImage, setcroppedImage] = React.useState("")
  const [ogImage, setogImage] = React.useState("")
  const [inside, setInside] = React.useState("")
  const [close, setClose] = React.useState("")
  const [align, setAlign] = React.useState("")
  const [bright, setBright] = React.useState("")
  const [faceLoading, setFaceLoading] = React.useState(false)
  const [faceStat, setFaceStat] = React.useState("")
  




  useEffect(async () => {
    var setting = {}
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    if (parsed.setting) {
      setting = require("../Match-settings/" + parsed.setting)
      //setting can be accessed from anywhere in the component
      setSettings(setting)
    }
    else {
      setting = require("../Match-settings/settings.json")  
      setSettings(setting)
    }
    // props.setTitle("Face Matching")
    loadModels(setting)
}, [])

  const loadModels = (setting) => {
    Promise.all([
      faceapi.loadFaceLandmarkModel('models'),
      faceapi.loadTinyFaceDetectorModel('models'),
      faceapi.loadFaceRecognitionModel('models'),
      faceapi.loadSsdMobilenetv1Model('models')

    ]).then(() => {
      setLoading(false)
      var c = document.getElementById("canvas1")
      var ctx = c.getContext("2d")
      ctx.strokeStyle = "#FF0000";
      ctx.setLineDash([6]);
      ctx.strokeRect((setting.vidWidth / 100) * setting.boxPercentX, (setting.vidHeight / 100) * setting.boxPercentY, setting.boxWidth * setting.vidHeight, setting.vidHeight*setting.boxHeight );
      performChecks(setting)
      // console.log("loaded")
    })
  }

  function performChecks(setting) {
    const video = webcamRef;
    //Creating a canvas to add overlay image
    const canvas = document.getElementById("canvas")
    const displaySize = { width: setting.vidWidth, height: setting.vidHeight };
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
      if (resizedDetections[0] && resizedDetections[0].alignedRect.score > setting.minFaceScore) {
        var pTopLeft = { x: resizedDetections[0].alignedRect.box.topLeft.x, y: resizedDetections[0].alignedRect.box.topLeft.y }
        var pBottomRight = { x: resizedDetections[0].alignedRect.box.bottomRight.x, y: resizedDetections[0].alignedRect.box.bottomRight.y }
        var bb = { ix: (setting.vidWidth / 100) * 21, iy: (setting.vidHeight / 100) * 10, ax: (setting.vidWidth / 100) * 77, ay: (setting.vidHeight / 100) * 90 }

        //checking if face is inside the box.
        if ((isInside(pTopLeft, bb) && isInside(pBottomRight, bb)) || !setting.insideCheck) {
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          handleInside(false)
          const dist = faceapi.euclideanDistance([resizedDetections[0].landmarks.getRightEye()[0]._x, resizedDetections[0].landmarks.getRightEye()[0]._y], [resizedDetections[0].landmarks.getLeftEye()[0]._x, resizedDetections[0].landmarks.getLeftEye()[0]._y])
          const slope = (resizedDetections[0].landmarks.getLeftEye()[0]._y - resizedDetections[0].landmarks.getRightEye()[0]._y) / (resizedDetections[0].landmarks.getLeftEye()[0]._x - resizedDetections[0].landmarks.getRightEye()[0]._x)
          //checking if height and width are greater than 200px
          if ((resizedDetections[0].alignedRect.box.width > setting.minRes && resizedDetections[0].alignedRect.box.height > setting.minRes) || !setting.closeCheck) {
            handleClose(false)
            //checking if face is properly aligned.
            if (((dist > setting.minEyeDist && dist < setting.maxEyeDist) && (slope > setting.minSlope && slope < setting.maxSlope)) || !setting.alignCheck) {
              Promise.all([
                handleAlign(false)
              ])
                .then(() => {
                  var al = resizedDetections[0].landmarks.align()
                  // console.log(resizedDetections[0])
                  cropAndSave(setting, al, interval, canvas)
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
    }, setting.duration)

  }

  const isInside = (p, bb) => {
    if (bb.ix <= p.x && p.x <= bb.ax && bb.iy <= p.y && p.y <= bb.ay) {
      return true
    }

    else {
      return false
    }
  }

  const cropAndSave = (setting, box, interval, canvas) => {
    var srcimg = webcamRef.current.getScreenshot();
    var fullImg = ""

    Jimp.read(srcimg)
      .then((img) => {

        getImageLightness(img.bitmap, function (brightness) {
          //checking if brightness is not too high and not too low.
          if ((brightness > setting.minBright && brightness < setting.maxBright) || !setting.brightnessCheck) {
            handleInside(false)
            handleAlign(false)
            handleClose(false)
            handleBright(false)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              setogImage(src)
              if (src !== undefined) {
                // document.getElementById("submit").style.display = "inline"
                fullImg = src
              }
            })
            img.crop(box.x, box.y, box.width, box.height)
            img.getBase64(Jimp.AUTO, async (err, src) => {
              onSubmit(fullImg, setting, src,interval)
              // e.target.src = src
              // e.target.style = "border:4px solid green"
              // clearInterval(interval)
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              setcroppedImage(src);
            })
          }
          else {
            handleBright(true)
          }
        })

      })
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

  const handleSameFace=(interval)=>{
    setFaceStat("Same Faces")
    // router.reload("/quiz")
    setTimeout(() => {
      setFaceStat("")
    }, 3000);
  }

  const handleNotSameFace=()=>{
    setFaceStat("Not Same")
    setTimeout(() => {
      setFaceStat("")
    }, 3000);
  }

  const onSubmit = async (ogImage, setting, croppedImage,interval) => {
    var sample = require("./sample.json")
    var src = sample.images[0].fullImg
    setFaceLoading(true)
    if (setting.client_matching) {
      const img1 = await faceapi.detectAllFaces(base64ToEl(src), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
      const img2 = await faceapi.detectAllFaces(base64ToEl(ogImage), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
      const displaySize = { width: setting.vidWidth, height: setting.vidHeight };
      var detections = {
        detection1: faceapi.resizeResults(img1, displaySize),
        detection2: faceapi.resizeResults(img2, displaySize),
      }

      if (detections.detection1[0] && detections.detection2[0]) {
        const distance1 = faceapi.euclideanDistance(detections.detection1[0].descriptor, detections.detection2[0].descriptor);
        if (distance1 < setting.faceMatchDist) {
          setFaceLoading(false)
          clearInterval(interval)
          handleSameFace(interval)
          var finalObj = {
            // fullImg: ogImage,
            croppedImg: croppedImage,
            organization: setting.organization,
            project: setting.project,
            matching_mode: setting.matching_mode,
            client_matching: setting.client_matching,
            server_matching: setting.server_matching
          }

          // console.log(finalObj,"finalobj")

          const abc={
            name:"car",
            call:"var"
          }
        //   const response = await fetch(setting.server_url, {
        //     method: setting.server_method,
        //     headers: {
        //       "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(finalObj)
        //   })
        //   console.log(response.json(), "response");
        router.push("/startquiz")
       
        
       

        }
        else {
          setFaceLoading(false)
     handleNotSameFace()
        }
      }

      else {
        setFaceStat(`Take Image Again`)
        setFaceLoading(false)
        setTimeout(() => {
          setFaceStat("")
        }, 3000);

      }


    }
    else {
      setFaceLoading(false)
      var finalObj = {
        fullImg: ogImage,
        croppedImg: croppedImage,
        organization: setting.organization,
        project: setting.project,
        matching_mode: setting.matching_mode,
        client_matching: setting.client_matching,
        server_matching: setting.server_matching
      }
      const response = await fetch(setting.server_url, {
        method: setting.server_method,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.json(), "response");

    }
  }

  const base64ToEl = (src) => {
    var img = document.createElement("img")
    img.src = src
    return img;
  }





  return (
    <div className={classes.root}>
      <Grid container spacing={3}
        justify="center">

        <Grid container spacing={3} item xs={12} justify="center">
          <Grid item xs={4.5}>


            {loading ? <CircularProgress />
              :
              <div className="row" style={{ border: "7px solid red" }}><Webcam
                audio={false}
                height={settings.vidHeight}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={settings.vidWidth}
              />
                <canvas id="canvas" width={settings.vidWidth} height={settings.vidHeight} />
                <canvas id="canvas1" width={settings.vidWidth} height={settings.vidHeight} />
              </div>}




          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              <h5>Past Result Messages</h5>
              <div id="facestat">
                <p>{faceStat}</p>
              </div>

            </Paper>

          </Grid>
          <Grid id="icons-side" item xs={8}>
            <Paper style={{ backgroundColor: "red", color: "white" }}>
            {(inside!=="" || close!=="" || align!=="" || bright!=="") && <h6>Errors:</h6>}
            <p>{inside}</p>
            <p>{close}</p>
            <p>{align}</p>
            <p>{bright}</p>
            </Paper>
          </Grid>
          {/* <Grid item xs={2}>
            <Paper>
              <img src="https://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Image-Capture-icon.png" width="100" height="100" id="0" className="ml-1" onClick={(e) => { performChecks(e) }} />
            </Paper>
          </Grid> */}


        </Grid>
      </Grid>
    </div>
  )
}