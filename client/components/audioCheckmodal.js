import React, { useEffect,useImperativeHandle,forwardRef } from 'react';
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


var analyser
var dataArray
var drawVisual
var audioCtx
var distortion
var source
// var array = new Uint8Array()

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

const audioCheckModal=forwardRef((props,ref)=> {
    const classes = useStyles();
    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const [recordedChunks, setRecordedChunks] = React.useState([]);
    const [capturing, setCapturing] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);
    const [avg,setAverage] = React.useState(false)
    const [settings, setSettings] = React.useState(require("../Settings/settings.json"))




    
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
      }, [mediaRecorderRef, webcamRef, setCapturing]);


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


    useEffect(() => {
      if(props.ended){
        cancelAnimationFrame(drawVisual)
        }
        else{
       navigator.webkitGetUserMedia({audio:true}, function(stream){
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            distortion = audioCtx.createWaveShaper();
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            // analyser.connect(distortion);    
            distortion.connect(audioCtx.destination);
            analyser.fftSize = 2048;
            var bufferLength = analyser.fftSize;
            console.log(bufferLength);
            dataArray = new Uint8Array(bufferLength);
        draw(bufferLength)                
            }, function(e){ console.log(e)})
        }
    },[props.ended])


    const draw=(bufferLength)=> {
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var average = getAverageVolume(array)
        if(average>settings.audioLevel){
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
            setAverage(true)
        }
        else{
            setAverage(false)
        }
     
        var canvas = document.getElementById('audio-canvas')
        var ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteTimeDomainData(dataArray);
        var WIDTH = canvas.width
        var HEIGHT = canvas.height

        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';

        ctx.beginPath();

        var sliceWidth = WIDTH * 1.0 / 1024;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
          var v = dataArray[i] / 128.0;
          var y = v * HEIGHT/2;

          if(i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }


        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
        drawVisual = requestAnimationFrame(draw)


    }

    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        average = values / length;
        return average;
  }



    const handleExpandClick = () => {
        setExpanded(!expanded);
    };


        

    


  



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
                title="Audio Visualizer"
            />
            {avg && <div style={{backgroundColor:'red',textAlign:'center',color:'white',borderRadius:'20px'}}>
                        <p>Too Much Noise</p>
                        </div>}
                        {capturing && <p style={{textAlign:'center'}}>Recording...</p>}

            <Collapse in={expanded} timeout="auto">
                <CardContent>
                    <canvas width={200} height={50} id="audio-canvas" /><br/>
                    <Webcam ref={webcamRef} style={{display:"none"}}/><br/><br/>
                    <center>
                    {recordedChunks.length>0 && <button id="dow" onClick={handleDownload}>Download</button>}
                    </center>
                </CardContent>
            </Collapse>
        </Card>
    );
})

export default audioCheckModal