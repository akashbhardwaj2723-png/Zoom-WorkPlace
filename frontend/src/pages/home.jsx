import React, { use, useState } from 'react'

import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import "../App.css";
import Button from '@mui/material/Button';
import { useContext } from 'react';

import { AuthContext } from '../contexts/AuthContext';



function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("")

  const { addToUserHistory } = useContext(AuthContext)
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
  }
  return (
    <div className='main'>
      <div className="navBar">
        <div className="navBarContent">
          <h2>My Video Call</h2>

          <div className="navBarActions">
            <IconButton
              sx={{ color: "ButtonFace" }}
              onClick={() => navigate("/history")}
            >
              <RestoreIcon />
            </IconButton>

            <p>History</p>

            <Button sx={{
              backgroundColor: "blue",
              color: "white", padding: "4px 9px", borderRadius: "8px",
              "&:hover": { backgroundColor: "darkblue" }
            }}
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className='meetContainer'>
        <div className='leftPanel'>
          <h2>Providing Quality Video Call  Just Like A Quality Education</h2>
          <br /> <br />
          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              label="Meeting Code"
              variant="outlined"
              id='outlined-basic'
            />
            <Button onClick={handleJoinVideoCall} variant='contained'>Jion</Button>
          </div>
        </div>
        <div className='rightPanel'>
          <img src="./onDraw.svg" alt="" />
        </div>
      </div>


    </div>
  );
}
export default withAuth(HomeComponent)
