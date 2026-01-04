import React, { useState, useEffect, useRef } from "react";
import { Send, LogOut, User, MessageSquare, Activity } from "lucide-react";
import SockJS from "sockjs-client";
import { Client, Stomp } from "@stomp/stompjs";

export default function ChatGemini() {
  // --- Bootstrap 5 & Socket Libs Injection (For Preview/Standalone capability) ---
  useEffect(() => {
    // In a real app, you would include Bootstrap in your index.html or import it in App.js
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    // Injecting SockJS/Stomp for the preview to function without npm install
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js";
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js";
    document.head.appendChild(script2);
  }, []);

  // --- Component State ---
  const [username, setUsername] = useState("");
  const [friend, setFriend] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [error, setError] = useState("");

  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Auto-scroll to bottom ---
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

  // --- WebSocket Logic ---
  const connectWebSocket = () => {
    if (!username.trim() || !friend.trim()) {
      setError("Please enter both usernames to start chatting.");
      return;
    }
    setError("");

    // // --- MOCK CONNECTION FOR PREVIEW ---
    // const isSandbox = window.location.hostname.includes("googleusercontent");
    // if (isSandbox && !window.SockJS) {
    //    setConnected(true);
    //    setMessages([
    //      { sender: "System", content: "Connected to Demo Mode", timestamp: new Date().toISOString(), incoming: true },
    //      { sender: friend, content: "Hello! This component is now separate.", timestamp: new Date().toISOString(), incoming: true }
    //    ]);
    //    return;
    // }

    try {
    //   const SockJS = window.SockJS; 
    //   const Stomp = window.Stomp; 

    //   if (!SockJS || !Stomp) {
    //      alert("Libraries loading... try again in a second.");
    //      return;
    //   }

      const socket = new SockJS("http://localhost:8080/webSocket");
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          setConnected(true);
          const topic = `/user/topic/send/${username}`;
          client.subscribe(topic, (msg) => {
            const payload = JSON.parse(msg.body);
            setMessages((prev) => [...prev, { ...payload, incoming: true }]);
          });
        },
        onStompError: (frame) => {
           console.error("Broker error: " + frame.headers['message']);
           setError("Could not connect to localhost:8080. (Expected in Preview)");
        }
      });

      client.activate();
      clientRef.current = client;
    } catch (e) {
      console.error(e);
      setError("Connection failed. Ensure backend is running.");
    }
  };

  const disconnectWebSocket = () => {
    if (clientRef.current) clientRef.current.deactivate();
    clientRef.current = null;
    setConnected(false);
    setMessages([]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    const chatMessage = {
      sender: username,
      receiver: friend,
      content: msgText.trim(),
      timestamp: new Date().toISOString(),
    };

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/app/chat/test",
        body: JSON.stringify(chatMessage),
      });
    }

    setMessages((prev) => [...prev, { ...chatMessage, incoming: false }]);
    setMsgText("");
  };

  // --- Utilities ---
  const avatarColor = (name) => {
    if(!name) return '#ccc';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 75%, 45%)`;
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "?";

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Render ---
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light font-sans">
      <style>{`
        .chat-container { height: 500px; overflow-y: auto; }
        .chat-container::-webkit-scrollbar { width: 6px; }
        .chat-container::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 4px; }
        .msg-bubble { max-width: 75%; padding: 10px 15px; border-radius: 18px; position: relative; font-size: 0.95rem; line-height: 1.4; }
        .msg-incoming { background-color: #ffffff; border-bottom-left-radius: 4px; color: #212529; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e9ecef; }
        .msg-outgoing { background-color: #0d6efd; color: white; border-bottom-right-radius: 4px; box-shadow: 0 1px 2px rgba(13, 110, 253, 0.2); }
        .avatar-circle { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
      `}</style>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            
            {!connected ? (
              // Login View
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-5 text-center bg-white">
                  <div className="mb-4 d-inline-block p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                    <MessageSquare size={48} />
                  </div>
                  <h2 className="fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted mb-4">Enter your details to join the chat</p>
                  
                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  <div className="text-start">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small text-uppercase">Your Username</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <User size={20} className="text-muted" />
                        </span>
                        <input 
                          type="text" 
                          className="form-control bg-light border-start-0 ps-0" 
                          placeholder="e.g. Alice"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small text-uppercase">Friend's Username</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <Activity size={20} className="text-muted" />
                        </span>
                        <input 
                          type="text" 
                          className="form-control bg-light border-start-0 ps-0" 
                          placeholder="e.g. Bob"
                          value={friend}
                          onChange={(e) => setFriend(e.target.value)}
                        />
                      </div>
                    </div>

                    <button onClick={connectWebSocket} className="btn btn-primary w-100 btn-lg rounded-3 fw-bold shadow-sm">
                      Start Chatting
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Chat View
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ height: '650px' }}>
                <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between sticky-top">
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle shadow-sm me-3" style={{ backgroundColor: avatarColor(friend) }}>
                      {getInitials(friend)}
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold text-dark">{friend}</h5>
                      <div className="d-flex align-items-center">
                        <span className="d-inline-block bg-success rounded-circle me-1" style={{ width: '8px', height: '8px' }}></span>
                        <small className="text-muted">Online</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2">
                    <div className="text-end d-none d-sm-block me-3">
                      <small className="d-block text-muted text-uppercase" style={{fontSize: '0.65rem'}}>Logged in as</small>
                      <span className="fw-semibold text-primary">{username}</span>
                    </div>
                    <button onClick={disconnectWebSocket} className="btn btn-outline-danger btn-sm d-flex align-items-center rounded-pill px-3">
                      <LogOut size={16} className="me-1" />
                      <span className="d-none d-sm-inline">Exit</span>
                    </button>
                  </div>
                </div>

                <div className="card-body bg-light chat-container d-flex flex-column p-4">
                  {messages.length === 0 ? (
                    <div className="m-auto text-center text-muted">
                      <div className="mb-3 opacity-25"><MessageSquare size={64} /></div>
                      <p>No messages yet.<br/>Say hello to <strong>{friend}</strong>!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = !msg.incoming;
                      return (
                        <div key={index} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                          {!isMe && (
                             <div className="avatar-circle me-2 align-self-end mb-1 shadow-sm" style={{ backgroundColor: avatarColor(msg.sender), width: '32px', height: '32px', fontSize: '0.75rem' }}>
                               {getInitials(msg.sender)}
                             </div>
                          )}
                          <div className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{maxWidth: '80%'}}>
                            <div className={`msg-bubble shadow-sm ${isMe ? 'msg-outgoing' : 'msg-incoming'}`}>
                              {msg.content}
                            </div>
                            <small className="text-muted mt-1 mx-1" style={{ fontSize: '0.7rem' }}>
                              {isMe ? 'You' : msg.sender} • {formatTime(msg.timestamp)}
                            </small>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="card-footer bg-white border-top p-3">
                  <form onSubmit={sendMessage} className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0 rounded-pill px-4"
                      placeholder="Type a message..."
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className={`btn btn-primary btn-lg rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center ${!msgText.trim() ? 'disabled' : ''}`} style={{ width: '48px', height: '48px' }}>
                      <Send size={20} className={msgText.trim() ? 'ms-1' : ''} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}