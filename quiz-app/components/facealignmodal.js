import React, { useEffect,useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js';
import useInterval from 'react-useinterval';

const vidHeight = 160
const vidWidth = 213.33

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 300,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },
}));





export default function RecipeReviewCard() {
    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    const [settings, setSettings] = React.useState({})
    const [loading, setLoading] = React.useState(true)
    const [notAlign,setNotAlign] = React.useState(false)
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);
    const downloadRef = React.useRef(null);




    const handleStartCaptureClick = React.useCallback(() => {
      
        // mediaRecorderRef.current.onpause = []
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
          mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
          "dataavailable",
          handleDataAvailable
        );
        mediaRecorderRef.current.start();
      }, [webcamRef, setCapturing, mediaRecorderRef]);
    
      const handleDataAvailable = React.useCallback(
      
        ({ data }) => {
            var chunks = []
          if (data.size > 0) {
            setRecordedChunks((prev) => prev.concat(data));
              console.log(data,"blob")
            //   const url = URL.createObjectURL(data);
            //   const a = document.createElement("a");
            //   document.body.appendChild(a);
            //   a.style = "display: none";
            //   a.href = url;
            //   a.download = "react-webcam.webm";
            //   a.click();
            //   window.URL.revokeObjectURL(url);
            
          }
      
        },
        [setRecordedChunks]
      );
    
      const handleStopCaptureClick = React.useCallback(() => {
          console.log(mediaRecorderRef.current,"current")
        mediaRecorderRef.current.stop();
        setCapturing(false);
      }, [mediaRecorderRef, webcamRef, setCapturing,downloadRef]);


      const handleDownload = React.useCallback(() => {
        if (recordedChunks.length) {
          const blob = new Blob(recordedChunks, {
            type: "video/webm"
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          a.href = url;
          a.download = "react-webcam-stream-capture.webm";
          a.click();
          window.URL.revokeObjectURL(url);
          setRecordedChunks([]);
        }
      }, [recordedChunks]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
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
            performCheck(setting)
        })
    }

    function performCheck(setting){
        console.log(setting.vidWidth,"settingsinper")
        const video = webcamRef;
        //Creating a canvas to add overlay image
        const canvas = document.getElementById("canvas")
        const displaySize = { width: setting.vidWidth, height: setting.vidHeight };
        faceapi.matchDimensions(canvas, displaySize);
var interval = setInterval(async () => {
    
    var t0 = performance.now()
        const detections = await faceapi
        .detectAllFaces(video.current.video, new faceapi.TinyFaceDetectorOptions()) //Face Detectors
            .withFaceLandmarks() // Get cordinates of landmarks
        // Resize and Display the detections on the video frame using canvas
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // setPrevFace(resizedDetections[0])

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        if (resizedDetections[0] && resizedDetections[0].alignedRect.score > setting.minFaceScore) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            var facewidth = resizedDetections[0].alignedRect.box.width
            var faceheight = resizedDetections[0].alignedRect.box.height
            var nose = resizedDetections[0].landmarks.getNose()[6]
            var jawleft = resizedDetections[0].landmarks.getJawOutline()[3]
            var jawright = resizedDetections[0].landmarks.getJawOutline()[13]
            // console.log(nose,"nose")
            const dist1 = faceapi.euclideanDistance([nose.x, nose.y], [jawleft.x,jawleft.y])
            const dist2 = faceapi.euclideanDistance([nose.x, nose.y], [jawright.x,jawright.y])
            const diff = Math.abs(dist2-dist1)
            // console.log(diff,"distance")
            var t1 = performance.now()
            // console.log(t1-t0,'ms')
            if (diff<setting.alignDifference) {
                setNotAlign(false)
                // console.log('aligned')

            }
            else{
                // console.log(once,"once.cur")
                if(mediaRecorderRef.current==null){
                    handleStartCaptureClick()
                    handleStopCaptureClick()
                }
                else{
                if(mediaRecorderRef.current.state=="inactive"){
                  handleStartCaptureClick()
                  setTimeout(() => {
                    if(mediaRecorderRef.current.state!="inactive"){
                      handleStopCaptureClick()
                  }
                  }, 5000);
                    
                }
            }
                setNotAlign(true)
                // console.log("not aligned")
            }
        }
        
}, 100);
      
  
       
    }


    



    return (
        <Card className={classes.root}>
            <CardHeader
                action={
                    <IconButton
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: expanded,
                        })}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                }
                style={{ textAlign: 'center' }}
                title="Face Cam"
            /> 
                    {notAlign && <div style={{backgroundColor:'red',textAlign:'center',color:'white',borderRadius:'20px'}}>
                        <p>Face is Not Front Aligned</p>
                        </div>}
                        {capturing && <p style={{textAlign:'center'}}>Recording...</p>}
          
            <Collapse in={expanded} timeout="auto">
                <CardContent>
                    {!loading &&
                        <center>
                            <div className="row" style={{ width: vidWidth + 'px', height: vidHeight + 'px' }}>
                                <Webcam
                                    audio={true}
                                    height={vidHeight}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width={vidWidth}
                                />
                                <canvas width={vidWidth} height={vidHeight} id="canvas" style={{ position: "absolute", border: '1px solid red' }} />
                            </div>
                           
                           {recordedChunks.length>0 && <button id="dow" ref={downloadRef} onClick={handleDownload}>Download</button>}
                        </center>
                    }
                </CardContent>
            </Collapse>
        </Card>
    );
}


