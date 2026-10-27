
import { Route, Routes } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/landing.jsx";
import {VideoMeetConnections} from "./pages/videoMeet.jsx"
import Authentication from "./pages/authentication.jsx";
import {AuthProvider} from "./contexts/AuthContext.jsx";
import  HomeComponent  from "./pages/home.jsx";
import History from "./pages/history.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/home" element={<HomeComponent/>}/>
        <Route path="/history" element={<History/>}/>
        <Route path="/:url" element={<VideoMeetConnections/>}/>
      </Routes>
    </AuthProvider>
  );
}

export default App;
