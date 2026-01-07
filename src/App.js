import logo from "./logo.svg";
import "./App.css";
import ChatApp from "./Chat";
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import LoginPage from "./LoginPage";
import LandingPage from "./LandingPage";
import BeautifulChatComponent from "./ChatNewPage";
import ChatAppDeep from "./ChatApp";
import ChatGemini from "./ChatGemini";

function AppWrapper() {
  return React.createElement(Router, null, React.createElement(App));
}

function App() {
  const [user, setUser] = useState(null);
  // const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/chat" element={<ChatAppDeep />} />

          {/* <Route
            path="/login"
            element={
              user ? (
                <ChatApp user={user} />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
