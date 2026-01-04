import React, { useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "bootstrap/dist/css/bootstrap.min.css";

// 🌈 Supports chatting with MULTIPLE USERS seamlessly.
// Left panel: friends list
// Right panel: chat window for selected user
// No props. Simple and clean.

export default function BeautifulChatComponent() {
  const [myUser, setMyUser] = useState("");
  const [friends, setFriends] = useState([]); // list of usernames
  const [newFriend, setNewFriend] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);

  const [messages, setMessages] = useState({}); // { friendName: [ {sender, content} ] }

  const stompClient = useRef(null);
  const chatsEndRef = useRef(null);

  useEffect(() => {
    if (chatsEndRef.current) {
      chatsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedFriend]);

  // Connect WebSocket
  const connectWS = () => {
    if (!myUser) {
      alert("Enter your username");
      return;
    }

    const socket = new SockJS("http://localhost:8080/webSocket");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setConnected(true);

      client.subscribe(`/topic/send/${myUser}`, (msg) => {
        const body = JSON.parse(msg.body);
        const sender = body.sender;

        setMessages((prev) => ({
          ...prev,
          [sender]: [...(prev[sender] || []), body],
        }));
      });
    };

    client.activate();
    stompClient.current = client;
  };

  // Add friend to list
  const addFriend = () => {
    if (!newFriend.trim()) return;

    if (!friends.includes(newFriend.trim())) {
      setFriends([...friends, newFriend.trim()]);
      setMessages((prev) => ({ ...prev, [newFriend.trim()]: prev[newFriend.trim()] || [] }));
    }

    setNewFriend("");
  };

  // Send message to selected friend
  const sendMessage = () => {
    if (!message.trim() || !selectedFriend) return;

    const msgObj = {
      sender: myUser,
      receiver: selectedFriend,
      content: message.trim(),
    };

    stompClient.current.publish({
      destination: "/app/chat/test",
      body: JSON.stringify(msgObj),
    });

    setMessages((prev) => ({
      ...prev,
      [selectedFriend]: [...(prev[selectedFriend] || []), msgObj],
    }));

    setMessage("");
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg,#F6D5F7,#FBE9D7)" }}
    >
      <div className="d-flex rounded-4 shadow-lg" style={{ width: "900px", height: "600px", background: "#fff" }}>
        {/* Left Sidebar */}
        <div
          className="p-3 border-end"
          style={{ width: "280px", background: "#f7f7ff" }}
        >
          <h5 className="fw-bold text-center mb-3">👤 Your Profile</h5>

          {!connected && (
            <>
              <input
                className="form-control rounded-pill mb-2"
                placeholder="Your Username"
                value={myUser}
                onChange={(e) => setMyUser(e.target.value)}
              />
              <button
                className="btn btn-primary w-100 rounded-pill mb-3"
                onClick={connectWS}
              >
                Connect 🚀
              </button>
            </>
          )}

          {connected && (
            <>
              <div className="fw-bold text-primary text-center mb-3">Connected as {myUser}</div>

              <div className="d-flex mb-3">
                <input
                  className="form-control rounded-pill me-2"
                  placeholder="Add friend..."
                  value={newFriend}
                  onChange={(e) => setNewFriend(e.target.value)}
                />
                <button
                  className="btn btn-success rounded-pill"
                  onClick={addFriend}
                >
                  +
                </button>
              </div>

              <div style={{ height: "420px", overflowY: "auto" }}>
                {friends.map((f, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-3 mb-2 ${
                      selectedFriend === f ? "bg-primary text-white" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedFriend(f)}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 d-flex flex-column" style={{ background: "#fff" }}>
          {/* Chat Header */}
          <div className="p-3 border-bottom bg-light">
            <h5 className="fw-bold m-0">
              {selectedFriend ? `Chatting with ${selectedFriend}` : "Select a friend to chat"}
            </h5>
          </div>

          {/* Messages */}
          <div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
            {selectedFriend && messages[selectedFriend] && (
              messages[selectedFriend].map((msg, i) => {
                const mine = msg.sender === myUser;
                return (
                  <div
                    key={i}
                    className="d-flex mb-2"
                    style={{ justifyContent: mine ? "end" : "start" }}
                  >
                    <div
                      className={`px-3 py-2 rounded-4 shadow-sm ${
                        mine ? "text-white" : ""
                      }`}
                      style={{
                        maxWidth: "70%",
                        background: mine
                          ? "linear-gradient(135deg,#84fab0,#8fd3f4)"
                          : "#f0f0f0",
                      }}
                    >
                      {!mine && (
                        <div className="fw-bold text-primary small">{msg.sender}</div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatsEndRef}></div>
          </div>

          {/* Message Input */}
          {selectedFriend && (
            <div className="d-flex p-3 border-top">
              <input
                className="form-control rounded-pill me-2"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="btn btn-warning rounded-pill px-4"
                onClick={sendMessage}
              >
                Send ➤
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
