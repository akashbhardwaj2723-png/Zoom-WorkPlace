import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TextField from "@mui/material/TextField";

import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

import style from "../VideoStyle/videoComponent.module.css";
import { width } from "@mui/system";
import { useNavigate } from "react-router-dom";

const server_url = "https://zoom-workplace.onrender.com";

const peerConFigConnection = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export const VideoMeetConnections = () => {
  var scoketRef = useRef();
  let scoketIdRef = useRef();
  const videoRef = useRef([]);
  const connections = useRef({});

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState(false);
  let [screen, setScreen] = useState(false);

  let [showModel, setShowModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");

  let [newMessage, setNewMessage] = useState(3);
  let [askForUserName, setAskForUserName] = useState(true);
  let [userName, setUserName] = useState("");
  let [nameError, setNameError] = useState("");
  const LocalVideoRef = useRef(null);
  const permissionPromiseRef = useRef(null);
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    // Reuse the current camera/microphone stream if it is still live.
    if (
      window.localStream &&
      window.localStream
        .getTracks()
        .some((track) => track.readyState === "live")
    ) {
      if (LocalVideoRef.current) {
        LocalVideoRef.current.srcObject = window.localStream;
      }
      setVideoAvailable(window.localStream.getVideoTracks().length > 0);
      setAudioAvailable(window.localStream.getAudioTracks().length > 0);
      setScreenAvailable(Boolean(navigator.mediaDevices?.getDisplayMedia));
      return window.localStream;
    }

    // Avoid starting duplicate permission requests at the same time.
    if (permissionPromiseRef.current) return permissionPromiseRef.current;

    permissionPromiseRef.current = (async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setVideoAvailable(userMediaStream.getVideoTracks().length > 0);
        setAudioAvailable(userMediaStream.getAudioTracks().length > 0);
        setScreenAvailable(Boolean(navigator.mediaDevices?.getDisplayMedia));

        // Keep the original stream setup and track-ended handling.
        getUserMediaSuccess(userMediaStream);
        return userMediaStream;
      } catch (error) {
        console.log("Camera/microphone permission error:", error);
        setVideoAvailable(false);
        setAudioAvailable(false);
        setScreenAvailable(Boolean(navigator.mediaDevices?.getDisplayMedia));
        return null;
      } finally {
        permissionPromiseRef.current = null;
      }
    })();

    return permissionPromiseRef.current;
  };

  useEffect(() => {
    getPermissions();
  }, []);



  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;

    if (LocalVideoRef.current) {
      LocalVideoRef.current.srcObject = stream;
    }

    for (let id in connections.current) {
      if (id === scoketIdRef.current) continue;

      try {
        connections.current[id].addStream(window.localStream);

        connections.current[id]
          .createOffer()
          .then((description) => {
            return connections.current[id].setLocalDescription(description);
          })
          .then(() => {
            scoketRef.current.emit(
              "signal",
              id,
              JSON.stringify({
                sdp: connections.current[id].localDescription,
              }),
            );
          })
          .catch((error) => console.log(error));
      } catch (error) {
        console.log(error);
      }
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          let tracks = LocalVideoRef.current.srcObject.getTracks();

          tracks.forEach((track) => {
            track.stop();
          });
        } catch (error) {
          console.log(error);
        }

        let blackSlience = (...args) =>
          new MediaStream([black(...args), slience()]);

        window.localStream = blackSlience();

        if (LocalVideoRef.current) {
          LocalVideoRef.current.srcObject = window.localStream;
        }

        for (let id in connections.current) {
          try {
            connections.current[id].addStream(window.localStream);

            connections.current[id]
              .createOffer()
              .then((description) => {
                return connections.current[id].setLocalDescription(description);
              })
              .then(() => {
                scoketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({
                    sdp: connections.current[id].localDescription,
                  }),
                );
              })
              .catch((error) => console.log(error));
          } catch (error) {
            console.log(error);
          }
        }
      };
    });
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== scoketIdRef.current) {
      const peer = connections.current[fromId];

      if (!peer) return;

      if (signal.sdp) {
        peer
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              return peer.createAnswer().then((description) => {
                return peer.setLocalDescription(description).then(() => {
                  scoketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({
                      sdp: peer.localDescription,
                    }),
                  );
                });
              });
            }
          })
          .catch((error) => console.log(error));
      }

      if (signal.ice) {
        peer
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((error) => console.log(error));
      }
    }
  };

  let slience = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };

  let black = ({ height = 408, width = 640 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);

    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], {
      enabled: false,
    });
  };

  let getUserMedia = () => {
    // Do not stop/recreate the stream when toggling camera or microphone.
    // Reuse the same tracks so the existing WebRTC peer connections stay alive.
    const stream = window.localStream;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = Boolean(video && videoAvailable);
    });
    stream.getAudioTracks().forEach((track) => {
      track.enabled = Boolean(audio && audioAvailable);
    });

    if (LocalVideoRef.current && LocalVideoRef.current.srcObject !== stream) {
      LocalVideoRef.current.srcObject = stream;
    }
  };

  useEffect(() => {
    if (!askForUserName) getUserMedia();
  }, [video, audio, askForUserName, videoAvailable, audioAvailable]);

  useEffect(() => {
    if (LocalVideoRef.current && window.localStream) {
      LocalVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUserName]);


  let addMessage = (data, sender, scoketIdSender) => {

    
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: sender,
        data: data,
        scoketIdSender: scoketIdSender
      }
    ]);

    if (scoketIdSender !== scoketIdRef.current) {
      setNewMessage((prev) => prev + 1);
    }
  };


  let connectToScoketServer = () => {
    if (scoketRef.current) return;

    scoketRef.current = io.connect(server_url, {
      secure: false,
    });

    scoketRef.current.on("signal", gotMessageFromServer);

    scoketRef.current.on("connect", () => {
      scoketRef.current.emit("join_call", window.location.href);

      scoketIdRef.current = scoketRef.current.id;

      scoketRef.current.on("chat_message", addMessage);

      scoketRef.current.on("user_left", (id) => {
        setVideos((videos) => videos.filter((video) => video.scoketId !== id));

        if (connections.current[id]) {
          connections.current[id].close();
          delete connections.current[id];
        }
      });

      scoketRef.current.on("user_join", async (id, clients) => {
        clients.forEach((scoketListId) => {
          if (
            scoketListId === scoketIdRef.current ||
            connections.current[scoketListId]
          ) {
            return;
          }

          connections.current[scoketListId] = new RTCPeerConnection(
            peerConFigConnection,
          );

          connections.current[scoketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              scoketRef.current.emit(
                "signal",
                scoketListId,
                JSON.stringify({
                  ice: event.candidate,
                }),
              );
            }
          };

          connections.current[scoketListId].onaddstream = (event) => {
            let newVideo = {
              scoketId: scoketListId,
              stream: event.stream,
              autoPlay: true,
              playsinline: true,
            };

            setVideos((videos) => {
              let videoExists = videos.find(
                (video) => video.scoketId === scoketListId,
              );

              let updateVideos;

              if (videoExists) {
                updateVideos = videos.map((video) =>
                  video.scoketId === scoketListId
                    ? {
                      ...video,
                      stream: event.stream,
                    }
                    : video,
                );
              } else {
                updateVideos = [...videos, newVideo];
              }

              videoRef.current = updateVideos;

              return updateVideos;
            });
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections.current[scoketListId].addStream(window.localStream);
          } else {
            let blackSlience = (...args) =>
              new MediaStream([black(...args), slience()]);

            window.localStream = blackSlience();

            connections.current[scoketListId].addStream(window.localStream);
          }
        });

        if (id === scoketIdRef.current) {
          for (let id2 in connections.current) {
            if (id2 === scoketIdRef.current) continue;

            try {
              connections.current[id2].addStream(window.localStream);

              connections.current[id2]
                .createOffer()
                .then((description) => {
                  return connections.current[id2].setLocalDescription(
                    description,
                  );
                })
                .then(() => {
                  scoketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections.current[id2].localDescription,
                    }),
                  );
                })
                .catch((error) => console.log(error));
            } catch (error) { }
          }
        }
      });
    });
  };

  let getMedia = () => {
    const stream = window.localStream;
    setVideo(Boolean(stream && stream.getVideoTracks().length));
    setAudio(Boolean(stream && stream.getAudioTracks().length));
    connectToScoketServer();
  };

  let routeTo = useNavigate();

  let connect = async () => {
    // Check karo ki username khaali to nahi hai
    if (!userName.trim()) {
      setNameError("Please enter a user name");
      return;
    }

    // Username sahi hai to error hata do
    setNameError("");

    await getPermissions();
    setAskForUserName(false);
    getMedia();
  };


  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;

    if (LocalVideoRef.current) {
      LocalVideoRef.current.srcObject = stream;
    }

    for (let id in connections.current) {
      if (id === scoketIdRef.current) continue;

      const peer = connections.current[id];
      if (!peer) continue;

      const screenTrack = stream.getVideoTracks()[0];

      if (!screenTrack) continue;

      const videoSender = peer
        .getSenders()
        .find((sender) => sender.track?.kind === "video");

      if (videoSender) {
        videoSender.replaceTrack(screenTrack).catch((error) => {
          console.log("Screen track replace error:", error);
        });
      }
    }


    stream.getVideoTracks().forEach((track) => {
      track.onended = async () => {
        setScreen(false);

        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          const cameraTrack = cameraStream.getVideoTracks()[0];
          const audioTrack = cameraStream.getAudioTracks()[0];

          // Camera aur microphone ki current settings apply karo
          if (cameraTrack) {
            cameraTrack.enabled = Boolean(video && videoAvailable);
          }

          if (audioTrack) {
            audioTrack.enabled = Boolean(audio && audioAvailable);
          }

          // Local video ko camera par wapas lao
          window.localStream = cameraStream;

          if (LocalVideoRef.current) {
            LocalVideoRef.current.srcObject = cameraStream;
          }

          // Existing WebRTC connection mein camera track restore karo
          for (let id in connections.current) {
            if (id === scoketIdRef.current) continue;

            const peer = connections.current[id];
            if (!peer) continue;

            try {
              const videoSender = peer
                .getSenders()
                .find((sender) => sender.track?.kind === "video");

              if (videoSender && cameraTrack) {
                await videoSender.replaceTrack(cameraTrack);
              }

              const audioSender = peer
                .getSenders()
                .find((sender) => sender.track?.kind === "audio");

              if (audioSender && audioTrack) {
                await audioSender.replaceTrack(audioTrack);
              }
            } catch (error) {
              console.log("Camera restore connection error:", error);
            }
          }

          // Camera stream ko local video par hi rakho
          console.log("Camera restored successfully");
        } catch (error) {
          console.log("Camera restore error:", error);
        }
      };
    });

  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    
     if (!message.trim()) {
        return;
    }
    scoketRef.current.emit("chat_message", message, userName);
    setMessage("")
  }

  let handleEndCall = () => {
    try {
      let tracks = LocalVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    } catch (error) {
      console.log(e);

    }
    routeTo("/home")
  }

  return (
    <div>
      {askForUserName ? (
        <div className={style.lobbyContainer}>
          <h2 className={style.lobbyTitle}>Enter into Lobby</h2>

          <div className={style.lobbyForm}>

            <TextField
              label="Enter your name"
              variant="outlined"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);

                if (e.target.value.trim()) {
                  setNameError("");
                }
              }}
              className={style.lobbyInput}
            />

            {nameError && (
              <p style={{ color: "red", margin: "5px 0" }}>
                {nameError}
              </p>
            )}

            <Button
              variant="contained"
              onClick={connect}
              className={style.lobbyButton}
            >
              Connect
            </Button>

          </div>

          <div className={style.lobbyVideoContainer}>
            <video
              className={style.lobbyVideo}
              ref={LocalVideoRef}
              autoPlay
              muted
              playsInline
            />
          </div>
        </div>
      ) : (
        <div className={style.meetVideoContainer}>


          {showModel ? (
            <div className={style.chatRoom}>
              <div className={style.chatConatiner}>
                <h1>Chat</h1>

                <div className={style.chatDisplay}>
                  {messages.map((item, idx) => (
                    <div
                      key={idx}
                      className={
                        item.scoketIdSender === scoketIdRef.current
                          ? style.myMessage
                          : style.otherMessage
                      }
                    >
                      <p className={style.chatStyle}>
                        <strong>{item.sender}</strong>
                        <br />
                        {item.data}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={style.chatingArea}>
                  <TextField
                    label="Enter your Chat"
                    variant="outlined"
                    size="small"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}



          <div className={style.btnContainer}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? (
                <VideocamIcon sx={{ fontSize: "40px !important" }} />
              ) : (
                <VideocamOffIcon sx={{ fontSize: "40px !important" }} />
              )}
            </IconButton>

            <IconButton style={{ color: "red" }} onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "blue" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton style={{ color: "white" }} onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessage} max={999} color="secondary">
              <IconButton style={{ color: "white" }} onClick={() => setShowModel(!showModel)}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={style.meetUserVideo}
            ref={LocalVideoRef}
            autoPlay
            muted
          ></video>

          <div className={style.confranceView}>
            {videos.map((video) => (
              <div key={video.scoketId}>
                <video
                  data-scoket={video.scoketId}
                  ref={(ref) => {
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;

                      ref.play().catch((error) => {
                        console.log("Remote video play error:", error);
                      });
                    }
                  }}
                  autoPlay
                  playsInline
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
