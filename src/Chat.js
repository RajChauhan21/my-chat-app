// src/components/ChatApp.js
// import React, { useState, useEffect, useRef } from "react";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import axios from "axios";
// import Swal from "sweetalert2";

// const ChatApp = ({ user }) => {
//   const [connected, setConnected] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [userChats, setUserChats] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const stompClientRef = useRef(null);

//   // Sample users for demonstration
//   const sampleUsers = [
//     {
//       id: 1,
//       name: "Alice Johnson",
//       username: "alice",
//       online: true,
//       avatar: "👩",
//       lastSeen: "2 min ago",
//     },
//     {
//       id: 2,
//       name: "Bob Smith",
//       username: "bob",
//       online: true,
//       avatar: "👨",
//       lastSeen: "Online",
//     },
//     {
//       id: 3,
//       name: "Charlie Brown",
//       username: "charlie",
//       online: false,
//       avatar: "👦",
//       lastSeen: "1 hour ago",
//     },
//     {
//       id: 4,
//       name: "Diana Prince",
//       username: "diana",
//       online: true,
//       avatar: "👧",
//       lastSeen: "Online",
//     },
//     {
//       id: 5,
//       name: "Ethan Hunt",
//       username: "ethan",
//       online: false,
//       avatar: "🧑",
//       lastSeen: "3 hours ago",
//     },
//   ];

//   console.log("User in ChatApp:", user);

//   useEffect(() => {
//     setOnlineUsers(user.userChatDetails || []);
//     getUserChats();
//     connectWebSocket();

//     return () => {
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//       }
//     };
//   }, []);

//   // const connectWebSocket = () => {
//   //   if (!user?.email) {
//   //     alert("User not found!");
//   //     return;
//   //   }

//   //   const socket = new SockJS("http://localhost:8080/webSocket");

//   //   const stompClient = new Client({
//   //     webSocketFactory: () => socket,
//   //     connectHeaders:{
//   //       Authorization: "Bearer " + user.token
//   //     },
//   //     reconnectDelay: 3000,
//   //     debug: (str) => console.log("[STOMP] " + str),
//   //   });

//   //   stompClient.onConnect = () => {
//   //     console.log("Connected to WebSocket!");

//   //     // Subscribe to chat topic
//   //     stompClient.subscribe("/user/queue/private", (msg) => {
//   //       const receivedMessage = JSON.parse(msg.body);
//   //       setMessages((prev) => [
//   //         ...prev,
//   //         { ...receivedMessage, type: "received" },
//   //       ]);
//   //       console.log(receivedMessage);
//   //     });

//   //     // Subscribe to token refresh topic
//   //     stompClient.subscribe("/user/queue/token-refresh", (message) => {
//   //       const data = JSON.parse(message.body);

//   //       if (data.type === "TOKEN_REFRESHED") {
//   //         console.log("Received new token:", data.newToken);

//   //         // Update token in storage
//   //         // localStorage.setItem("jwtToken", data.newToken);

//   //         // Optional: Show subtle notification
//   //         alert("Session extended automatically", "success", 3000);
//   //       }
//   //     });

//   //     // Subscribe to user status updates
//   //     // stompClient.subscribe("/topic/userStatus", (msg) => {
//   //     //   const userStatus = JSON.parse(msg.body);
//   //     //   updateUserStatus(userStatus);
//   //     // });

//   //     setConnected(true);

//   //     // Notify others that user is online
//   //     sendUserStatus("online");
//   //   };

//   //   stompClient.onWebSocketClose = () => {
//   //     console.log("WebSocket closed!");
//   //     setConnected(false);
//   //     sendUserStatus("offline");
//   //   };

//   //   stompClient.onStompError = (frame) => {
//   //     console.log("Broker error: " + frame.headers["message"]);
//   //   };

//   //   stompClient.activate();
//   //   stompClientRef.current = stompClient;
//   // };

//   const connectWebSocket = () => {
//     if (!user?.email || !user?.token) {
//       alert("User not found or token missing!");
//       return;
//     }

//     console.log("🔄 Attempting WebSocket connection with token:", user.token);

//     // Create SockJS instance
//     const socket = new SockJS("http://localhost:8080/webSocket");

//     const stompClient = new Client({
//       webSocketFactory: () => socket,
//       connectHeaders: {
//         Authorization: "Bearer " + user.token,
//       },
//       reconnectDelay: 5000,
//       heartbeatIncoming: 4000,
//       heartbeatOutgoing: 4000,
//       debug: (str) => console.log("[STOMP] " + str),
//     });

//     stompClient.onConnect = (frame) => {
//       console.log("✅ Successfully connected to WebSocket!");
//       console.log("Connection frame:", frame);

//       // Subscribe to private messages
//       stompClient.subscribe("/user/queue/private", (message) => {
//         try {
//           const receivedMessage = JSON.parse(message.body);
//           console.log("📨 Received private message:", receivedMessage);
//           setMessages((prev) => [
//             ...prev,
//             { ...receivedMessage, type: "received" },
//           ]);
//         } catch (error) {
//           console.error("Error parsing private message:", error);
//         }
//       });

//       // Subscribe to token refresh
//       stompClient.subscribe("/user/queue/token-refresh", (message) => {
//         try {
//           const data = JSON.parse(message.body);
//           console.log("🔄 Token refresh message:", data);

//           if (data.type === "TOKEN_REFRESHED") {
//             console.log("✅ New token received:", data.newToken);
//             // Update token in your state
//             // setUser(prev => ({...prev, token: data.newToken}));
//             // localStorage.setItem('token', data.newToken);
//             alert("Session extended automatically");
//           }
//         } catch (error) {
//           console.error("Error parsing token refresh:", error);
//         }
//       });

//       setConnected(true);
//       sendUserStatus("online");
//     };

//     stompClient.onStompError = (frame) => {
//       console.error("❌ STOMP Protocol Error:", frame);
//       console.error("Error details:", frame.headers);

//       if (
//         frame.headers?.message?.includes("401") ||
//         frame.headers?.message?.toLowerCase().includes("unauthorized")
//       ) {
//         alert("Authentication failed! Please check your token and try again.");
//       }
//     };

//     stompClient.onWebSocketError = (event) => {
//       console.error("❌ WebSocket Error:", event);
//       console.error(
//         "SockJS connection failed - check if server is running and CORS is configured"
//       );
//     };

//     stompClient.onDisconnect = (frame) => {
//       console.log("🔌 Disconnected from WebSocket");
//       setConnected(false);
//       sendUserStatus("offline");
//     };

//     // Handle SockJS specific events
//     socket.onopen = () => {
//       console.log("🔗 SockJS connection established");
//     };

//     socket.onclose = (event) => {
//       console.log("🔌 SockJS connection closed:", event);
//     };

//     socket.onerror = (error) => {
//       console.error("❌ SockJS error:", error);
//     };

//     stompClient.activate();
//     stompClientRef.current = stompClient;
//   };

//   const getUserChats = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/user/getUserChats/${user.id}`,
//         {
//           headers: {
//             Authorization: "Bearer " + user.token,
//           },
//         }
//       );
//       console.log(response);
//       setUserChats(response.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const sendUserStatus = (status) => {
//     if (stompClientRef.current && connected) {
//       const statusUpdate = {
//         userId: user.id,
//         username: user.username,
//         status: status,
//         timestamp: new Date().toISOString(),
//       };

//       // stompClientRef.current.publish({
//       //   destination: "/app/userStatus",
//       //   body: JSON.stringify(statusUpdate),
//       // });
//     }
//   };

//   const updateUserStatus = (userStatus) => {
//     setOnlineUsers((prev) =>
//       prev.map((u) =>
//         u.username === userStatus.username
//           ? {
//               ...u,
//               online: userStatus.status === "online",
//               lastSeen: userStatus.status === "online" ? "Online" : "Just now",
//             }
//           : u
//       )
//     );
//   };

//   const sendMessage = () => {
//     if (!message.trim() || !stompClientRef.current || !connected) return;

//     const payload = {
//       id: Date.now(),
//       sender: user.username,
//       senderName: user.name || user.username,
//       content: message.trim(),
//       timestamp: new Date().toISOString(),
//       type: "sent",
//       receiver: selectedUser?.username || "all",
//       avatar: user.avatar || "😊",
//     };

//     stompClientRef.current.publish({
//       destination: "/app/chat.private",
//       body: JSON.stringify({
//         content: message.trim(),
//         receiver: selectedUser?.email,
//         type: "CHAT",
//       }),
//     });

//     // stompClientRef.current.publish(
//     //   "/app/chat.private",
//     //   {},
//     //   JSON.stringify({
//     //     content: message.trim(),
//     //     receiver: selectedUser?.email,
//     //     type: "CHAT",
//     //   })
//     // );

//     // Add to local messages immediately
//     setMessages((prev) => [...prev, payload]);
//     setMessage("");
//     setIsTyping(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const getAvailableUsers = async (search) => {
//     if (!search || search.trim() === "") {
//       setOnlineUsers([]);
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `http://localhost:8080/user/getLikeUsers/${search}`,
//         {
//           headers: {
//             Authorization: "Bearer " + user.token,
//           },
//         }
//       );
//       console.log(response);
//       setOnlineUsers(response.data);
//     } catch (error) {
//       console.log("Error fetching users:", error);
//     }
//   };

//   const handleTyping = (e) => {
//     setMessage(e.target.value);
//     if (!isTyping && e.target.value.length > 0) {
//       setIsTyping(true);
//     } else if (e.target.value.length === 0) {
//       setIsTyping(false);
//     }
//   };

//   const getCurrentClient = (userItem) => {
//     setSelectedUser(userItem);
//     console.log("Selected User:", userItem);
//   };

//   const saveUserToChat = async (userid, clientId) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You want to add this user in your chats!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, add him!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const response = await axios.get(
//             `http://localhost:8080/chats/saveOneToOneUserChat/${userid}/${clientId}`,
//             {
//               headers: {
//                 Authorization: "Bearer " + user.token,
//               },
//             }
//           );
//           console.log(response);
//           getUserChats();
//           Swal.fire(
//             "Added!",
//             "The user has been added to your chats.",
//             "success"
//           );
//         } catch (error) {
//           console.log("Error adding user to chat:", error);
//           Swal.fire("Error!", "Failed to add the user to your chats.", "error");
//         }
//       } else {
//         Swal.fire("Cancelled", "The user was not added to your chats.");
//       }
//     });
//   };

//   const disconnect = () => {
//     if (stompClientRef.current) {
//       sendUserStatus("offline");
//       stompClientRef.current.deactivate();
//     }
//     setConnected(false);
//   };

//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // return (
//   //   <div className="container-fluid vh-100 bg-light p-0">
//   //     <div className="row h-100 m-0">
//   //       {/* Sidebar - Users List */}
//   //       <div className="col-md-4 col-lg-3 p-0 bg-white border-end">
//   //         <div className="d-flex flex-column h-100">
//   //           {/* Header */}
//   //           <div className="p-3 border-bottom bg-primary text-white">
//   //             <div className="d-flex justify-content-between align-items-center">
//   //               <div className="d-flex align-items-center">
//   //                 <span className="fs-4 me-2">💬</span>
//   //                 <h5 className="mb-0 fw-bold">ChatWave</h5>
//   //               </div>
//   //               <div className="d-flex align-items-center">
//   //                 <span
//   //                   className={`badge ${
//   //                     connected ? "bg-success" : "bg-danger"
//   //                   } me-2`}
//   //                 >
//   //                   {connected ? "🟢" : "🔴"}
//   //                 </span>
//   //                 <button
//   //                   className="btn btn-outline-light btn-sm"
//   //                   onClick={disconnect}
//   //                 >
//   //                   <i className="bi bi-power"></i>
//   //                 </button>
//   //               </div>
//   //             </div>
//   //             <div className="mt-2">
//   //               <small>
//   //                 Welcome, <strong>{user?.firstName || user?.userName}</strong>
//   //               </small>
//   //             </div>
//   //           </div>

//   //           {/* Search Bar */}
//   //           <div className="p-3 border-bottom">
//   //             <div className="input-group input-group-sm">
//   //               <span className="input-group-text bg-light border-0">
//   //                 <i className="bi bi-search"></i>
//   //               </span>
//   //               <input
//   //                 type="text"
//   //                 className="form-control border-0 bg-light"
//   //                 placeholder="Search users..."
//   //                 onChange={(e) => getAvailableUsers(e.target.value)}
//   //               />
//   //             </div>
//   //           </div>

//   //           {/* Users List */}
//   //           <div className="flex-grow-1 overflow-auto">
//   //             <div className="p-2">
//   //               <small className="text-muted text-uppercase fw-bold">
//   //                 Available Users
//   //               </small>
//   //             </div>
//   //             {onlineUsers.map((userItem) => (
//   //               <div
//   //                 key={userItem.id}
//   //                 className={`p-3 border-bottom cursor-pointer user-item ${
//   //                   selectedUser?.id === userItem.id ? "bg-light selected" : ""
//   //                 }`}
//   //                 onClick={() => getCurrentClient(userItem)}
//   //                 style={{ cursor: "pointer" }}
//   //               >
//   //                 <div className="d-flex align-items-center">
//   //                   <div className="position-relative">
//   //                     <span className="fs-5">{userItem.avatar}</span>
//   //                     <span className="position-absolute bottom-0 end-0 translate-middle p-1 bg-success border border-2 border-white rounded-circle">
//   //                       <span className="visually-hidden">Online</span>
//   //                     </span>
//   //                   </div>
//   //                   <div className="ms-3 flex-grow-1">
//   //                     <h6 className="mb-0 fw-bold">
//   //                       {userItem.firstName} {userItem.lastName}
//   //                     </h6>
//   //                     {/* <small className="text-success">
//   //                       <i className="bi bi-circle-fill me-1" style={{ fontSize: '6px' }}></i>
//   //                       {userItem.lastSeen}
//   //                     </small> */}
//   //                   </div>
//   //                   {selectedUser?.id === userItem.id && (
//   //                     <span className="text-primary">
//   //                       <i className="bi bi-chevron-right"></i>
//   //                       <i
//   //                         onClick={() => saveUserToChat(user.id, userItem.id)}
//   //                         className="bi bi-plus-lg"
//   //                       ></i>
//   //                     </span>
//   //                   )}
//   //                 </div>
//   //               </div>
//   //             ))}

//   //             <div className="p-2 mt-3">
//   //               <small className="text-muted text-uppercase fw-bold">
//   //                 Chats
//   //               </small>
//   //             </div>
//   //             {userChats.map((userItem) => (
//   //               <div
//   //                 key={userItem.id}
//   //                 className={`p-3 border-bottom cursor-pointer user-item ${
//   //                   selectedUser?.id === userItem.id ? "bg-light selected" : ""
//   //                 }`}
//   //                 onClick={() => getCurrentClient(userItem)}
//   //                 style={{ cursor: "pointer" }}
//   //               >
//   //                 <div className="d-flex align-items-center">
//   //                   <div className="position-relative">
//   //                     <span className="fs-5">{userItem.avatar}</span>
//   //                     <span className="position-absolute bottom-0 end-0 translate-middle p-1 bg-secondary border border-2 border-white rounded-circle">
//   //                       <span className="visually-hidden">Offline</span>
//   //                     </span>
//   //                   </div>
//   //                   <div className="ms-3 flex-grow-1">
//   //                     <h6 className="mb-0 text-muted">
//   //                       {userItem.firstName} {userItem.lastName}
//   //                     </h6>
//   //                     {/* <small className="text-muted">
//   //                       <i className="bi bi-clock me-1"></i>
//   //                       {userItem.lastSeen}
//   //                     </small> */}
//   //                   </div>
//   //                 </div>
//   //               </div>
//   //             ))}
//   //           </div>

//   //           {/* Current User Status */}
//   //           <div className="p-3 border-top bg-light">
//   //             <div className="d-flex align-items-center">
//   //               <span className="fs-5 me-2">😊</span>
//   //               <div className="flex-grow-1">
//   //                 <small className="fw-bold d-block">
//   //                   {user?.name || user?.username}
//   //                 </small>
//   //                 <small className={`text-${connected ? "success" : "danger"}`}>
//   //                   {connected ? "Online" : "Offline"}
//   //                 </small>
//   //               </div>
//   //             </div>
//   //           </div>
//   //         </div>
//   //       </div>

//   //       {/* Main Chat Area */}
//   //       <div className="col-md-8 col-lg-9 p-0 d-flex flex-column">
//   //         {/* Chat Header */}
//   //         <div className="p-3 bg-white border-bottom shadow-sm">
//   //           <div className="d-flex align-items-center">
//   //             {selectedUser ? (
//   //               <>
//   //                 <span className="fs-4 me-3">{selectedUser.avatar}</span>
//   //                 <div>
//   //                   <h5 className="mb-0 fw-bold">{selectedUser.name}</h5>
//   //                   <small
//   //                     className={`text-${
//   //                       selectedUser.online ? "success" : "muted"
//   //                     }`}
//   //                   >
//   //                     {selectedUser.online ? (
//   //                       <>
//   //                         <i
//   //                           className="bi bi-circle-fill me-1"
//   //                           style={{ fontSize: "6px" }}
//   //                         ></i>
//   //                         Online
//   //                       </>
//   //                     ) : (
//   //                       `Last seen ${selectedUser.lastSeen}`
//   //                     )}
//   //                   </small>
//   //                 </div>
//   //               </>
//   //             ) : (
//   //               <div className="text-center w-100">
//   //                 <h5 className="mb-0 text-muted">
//   //                   Select a user to start chatting
//   //                 </h5>
//   //                 <small className="text-muted">
//   //                   Choose from the sidebar to begin conversation
//   //                 </small>
//   //               </div>
//   //             )}
//   //           </div>
//   //         </div>

//   //         {/* Messages Area */}
//   //         <div
//   //           className="flex-grow-1 p-3 bg-chat"
//   //           style={{
//   //             backgroundImage:
//   //               "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
//   //             overflowY: "auto",
//   //             maxHeight: "calc(100vh - 200px)",
//   //           }}
//   //         >
//   //           {messages.length === 0 ? (
//   //             <div className="text-center h-100 d-flex align-items-center justify-content-center">
//   //               <div>
//   //                 <div className="fs-1 mb-3">💬</div>
//   //                 <h5 className="text-muted">No messages yet</h5>
//   //                 <p className="text-muted">
//   //                   Start a conversation by sending a message
//   //                 </p>
//   //               </div>
//   //             </div>
//   //           ) : (
//   //             messages.map((msg, index) => (
//   //               <div
//   //                 key={msg.id || index}
//   //                 className={`d-flex mb-3 ${
//   //                   msg.sender === user.username
//   //                     ? "justify-content-end"
//   //                     : "justify-content-start"
//   //                 }`}
//   //               >
//   //                 <div
//   //                   className={`rounded-4 p-3 position-relative ${
//   //                     msg.sender === user.username
//   //                       ? "bg-primary text-white"
//   //                       : "bg-light border"
//   //                   }`}
//   //                   style={{ maxWidth: "70%" }}
//   //                 >
//   //                   {msg.sender !== user.username && (
//   //                     <div className="d-flex align-items-center mb-1">
//   //                       <small className="fw-bold text-dark me-2">
//   //                         {msg.senderName}
//   //                       </small>
//   //                       <small className="text-muted">
//   //                         {formatTime(msg.timestamp)}
//   //                       </small>
//   //                     </div>
//   //                   )}
//   //                   <div className="mb-1">{msg.content}</div>
//   //                   {msg.sender === user.username && (
//   //                     <small
//   //                       className={`${
//   //                         msg.sender === user.username
//   //                           ? "text-white-50"
//   //                           : "text-muted"
//   //                       } d-block text-end`}
//   //                     >
//   //                       {formatTime(msg.timestamp)}
//   //                     </small>
//   //                   )}
//   //                 </div>
//   //               </div>
//   //             ))
//   //           )}
//   //           <div ref={useRef(null)} />
//   //         </div>

//   //         {/* Message Input */}
//   //         <div className="p-3 bg-white border-top">
//   //           <div className="input-group">
//   //             <textarea
//   //               className="form-control border-end-0"
//   //               placeholder="Type a message..."
//   //               rows="2"
//   //               value={message}
//   //               onChange={handleTyping}
//   //               onKeyPress={handleKeyPress}
//   //               style={{ borderRadius: "20px 0 0 20px", resize: "none" }}
//   //             />
//   //             <button
//   //               className="btn btn-primary px-4"
//   //               onClick={sendMessage}
//   //               disabled={!message.trim() || !connected}
//   //               style={{ borderRadius: "0 20px 20px 0" }}
//   //             >
//   //               <i className="bi bi-send-fill"></i>
//   //             </button>
//   //           </div>
//   //           <div className="mt-2 text-center">
//   //             <small
//   //               className={`text-muted ${
//   //                 connected ? "text-success" : "text-danger"
//   //               }`}
//   //             >
//   //               {connected ? "🟢 Connected to chat" : "🔴 Disconnected"}
//   //             </small>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>

//   //     <style>
//   //       {`
//   //         .user-item {
//   //           transition: all 0.2s ease;
//   //         }
//   //         .user-item:hover {
//   //           background-color: #f8f9fa !important;
//   //         }
//   //         .user-item.selected {
//   //           background-color: #e3f2fd !important;
//   //           border-left: 3px solid #0d6efd;
//   //         }
//   //         .bg-chat {
//   //           background-color: #f8f9fa;
//   //         }
//   //         .cursor-pointer {
//   //           cursor: pointer;
//   //         }
//   //       `}
//   //     </style>
//   //   </div>
//   // );
//   return (
//     <div className="container-fluid vh-100 bg-light p-0">
//       <div className="row h-100 m-0">
//         {/* Sidebar */}
//         <div className="col-md-4 col-lg-3 p-0 bg-white border-end shadow-sm">
//           <div className="d-flex flex-column h-100">
//             {/* Sidebar Header */}
//             <div className="p-3 bg-primary text-white shadow-sm">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div className="d-flex align-items-center">
//                   <i className="bi bi-chat-heart fs-3 me-2"></i>
//                   <h5 className="fw-bold mb-0">ChatWave</h5>
//                 </div>
//                 <button
//                   className="btn btn-light btn-sm rounded-circle"
//                   onClick={disconnect}
//                 >
//                   <i className="bi bi-power text-danger"></i>
//                 </button>
//               </div>
//               <div className="mt-2 small">
//                 Logged in as{" "}
//                 <strong>{user?.firstName || user?.username}</strong>
//               </div>
//             </div>

//             {/* Search Users */}
//             <div className="p-3 border-bottom bg-white">
//               <div className="input-group input-group-sm">
//                 <span className="input-group-text bg-light border-0">
//                   <i className="bi bi-search"></i>
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control border-0 bg-light"
//                   placeholder="Search users..."
//                   onChange={(e) => getAvailableUsers(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Users List */}
//             <div className="overflow-auto flex-grow-1">
//               {/* Section Title */}
//               <div className="px-3 pt-2 text-muted text-uppercase small fw-bold">
//                 Available Users
//               </div>

//               {onlineUsers.map((userItem) => (
//                 <div
//                   key={userItem.id}
//                   onClick={() => getCurrentClient(userItem)}
//                   className={`px-3 py-3 d-flex align-items-center border-bottom user-item ${
//                     selectedUser?.id === userItem.id ? "bg-light selected" : ""
//                   }`}
//                   style={{ cursor: "pointer" }}
//                 >
//                   {/* Avatar */}
//                   <div className="position-relative">
//                     <span className="fs-4">{userItem.avatar}</span>
//                     <span
//                       className={`status-dot ${
//                         userItem.online ? "bg-success" : "bg-secondary"
//                       }`}
//                     ></span>
//                   </div>

//                   <div className="ms-3 flex-grow-1">
//                     <h6 className="mb-0 fw-bold">
//                       {userItem.firstName} {userItem.lastName}
//                     </h6>
//                     <small className="text-muted">
//                       {userItem.online ? "Online" : "Offline"}
//                     </small>
//                   </div>

//                   {selectedUser?.id === userItem.id && (
//                     <button
//                       className="btn btn-outline-primary btn-sm rounded-circle"
//                       onClick={() => saveUserToChat(user.id, userItem.id)}
//                     >
//                       <i className="bi bi-plus-lg"></i>
//                     </button>
//                   )}
//                 </div>
//               ))}

//               {/* Saved Chats */}
//               <div className="px-3 pt-3 text-muted text-uppercase small fw-bold">
//                 Chats
//               </div>

//               {userChats.map((userItem) => (
//                 <div
//                   key={userItem.id}
//                   onClick={() => getCurrentClient(userItem)}
//                   className={`px-3 py-3 d-flex align-items-center border-bottom user-item ${
//                     selectedUser?.id === userItem.id ? "bg-light selected" : ""
//                   }`}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <span className="fs-4">{userItem.avatar}</span>
//                   <div className="ms-3">
//                     <h6 className="mb-0 text-muted">
//                       {userItem.firstName} {userItem.lastName}
//                     </h6>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Sidebar Footer */}
//             <div className="p-3 bg-light border-top">
//               <div className="d-flex align-items-center">
//                 <span className="fs-4 me-3">😊</span>
//                 <div>
//                   <div className="fw-bold">{user?.name || user?.username}</div>
//                   <div
//                     className={
//                       connected ? "text-success small" : "text-danger small"
//                     }
//                   >
//                     {connected ? "Online" : "Offline"}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Chat Area */}
//         <div className="col-md-8 col-lg-9 p-0 d-flex flex-column">
//           {/* Header */}
//           <div className="p-3 bg-white border-bottom shadow-sm d-flex align-items-center">
//             {selectedUser ? (
//               <>
//                 <span className="fs-3 me-3">{selectedUser.avatar}</span>
//                 <div>
//                   <h5 className="fw-bold mb-0">
//                     {selectedUser.firstName} {selectedUser.lastName}
//                   </h5>
//                   <small
//                     className={
//                       selectedUser.online ? "text-success" : "text-muted"
//                     }
//                   >
//                     {selectedUser.online
//                       ? "Online"
//                       : `Last seen ${selectedUser.lastSeen}`}
//                   </small>
//                 </div>
//               </>
//             ) : (
//               <div className="w-100 text-center text-muted">
//                 <h6>Select a user to start chatting</h6>
//               </div>
//             )}
//           </div>

//           {/* Messages Area */}
//           <div className="flex-grow-1 overflow-auto p-4 chat-bg">
//             {messages.length === 0 ? (
//               <div className="h-100 d-flex justify-content-center align-items-center text-center">
//                 <div>
//                   <i className="bi bi-chat-dots fs-1 text-muted"></i>
//                   <h6 className="text-muted mt-3">No messages yet</h6>
//                 </div>
//               </div>
//             ) : (
//               messages.map((msg, i) => (
//                 <div
//                   key={i}
//                   className={`message-row ${
//                     msg.sender === user.username ? "me" : "them"
//                   }`}
//                 >
//                   <div className="message-bubble shadow-sm">
//                     {msg.sender !== user.username && (
//                       <div className="small fw-bold mb-1">{msg.senderName}</div>
//                     )}
//                     {msg.content}
//                     <div className="small text-muted mt-1 text-end">
//                       {formatTime(msg.timestamp)}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Message Input */}
//           <div className="p-3 bg-white border-top">
//             <div className="input-group">
//               <textarea
//                 className="form-control border-end-0"
//                 placeholder="Type message..."
//                 value={message}
//                 onChange={handleTyping}
//                 onKeyPress={handleKeyPress}
//                 rows="2"
//                 style={{ borderRadius: "18px 0 0 18px" }}
//               ></textarea>

//               <button
//                 className="btn btn-primary px-4"
//                 disabled={!message.trim() || !connected}
//                 onClick={sendMessage}
//                 style={{ borderRadius: "0 18px 18px 0" }}
//               >
//                 <i className="bi bi-send-fill"></i>
//               </button>
//             </div>
//             <div className="text-center mt-2 small">
//               {connected ? (
//                 <span className="text-success">🟢 Connected</span>
//               ) : (
//                 <span className="text-danger">🔴 Offline</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CSS Enhancements */}
//       <style>
//         {`
//         .user-item { transition: 0.2s; }
//         .user-item:hover { background-color: #f1f1f1; }

//         .chat-bg {
//           background: #eef2f7;
//         }

//         .message-row {
//           display: flex;
//           margin-bottom: 12px;
//         }

//         .message-row.me {
//           justify-content: flex-end;
//         }

//         .message-row.them {
//           justify-content: flex-start;
//         }

//         .message-bubble {
//           max-width: 65%;
//           padding: 12px 16px;
//           border-radius: 16px;
//           background: white;
//         }

//         .message-row.me .message-bubble {
//           background: #0d6efd;
//           color: white;
//           border-bottom-right-radius: 4px;
//         }

//         .message-row.them .message-bubble {
//           background: white;
//           border-bottom-left-radius: 4px;
//         }

//         .status-dot {
//           width: 10px;
//           height: 10px;
//           border: 2px solid white;
//           border-radius: 50%;
//           position: absolute;
//           bottom: 0;
//           right: 0;
//         }
//       `}
//       </style>
//     </div>
//   );
// };

// export default ChatApp;

import React, { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap-icons/font/bootstrap-icons.css";

const ChatApp = ({ user }) => {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const stompClientRef = useRef(null);

  // -------------------------------------------------------------------
  // SAFETY CHECK
  // Prevent component from crashing when user is undefined
  // -------------------------------------------------------------------
  
  // -------------------------------------------------------------------
  // FETCH USER CHATS
  // -------------------------------------------------------------------
  const getUserChats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/getUserChats/${user.id}`,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );
      setUserChats(res.data);
    } catch (err) {
      console.log("Error fetching user chats:", err);
    }
  };

  // -------------------------------------------------------------------
  // SEARCH USERS
  // -------------------------------------------------------------------
  const getAvailableUsers = async (search) => {
    if (!search || search.trim() === "") {
      setOnlineUsers([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/getLikeUsers/${search}`,
        {
          headers: { Authorization: "Bearer " + user.token },
        }
      );
      setOnlineUsers(res.data);
    } catch (err) {
      console.log("Error fetching users:", err);
    }
  };

  // -------------------------------------------------------------------
  // CONNECT WEBSOCKET
  // -------------------------------------------------------------------
  const connectWebSocket = () => {
    if (!user.email || !user.token) {
      console.warn("User missing information. Cannot connect WebSocket.");
      return;
    }

    const socket = new SockJS("http://localhost:8080/webSocket");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      debug: (str) => console.log("[STOMP]", str),
    });

    // CONNECT SUCCESS
    stompClient.onConnect = () => {
      console.log("CONNECTED TO WS");

      // PRIVATE MESSAGE SUBSCRIPTION
      stompClient.subscribe(`/topic/send/`, (msg) => {
        try {
          const data = JSON.parse(msg.body);
          setMessages((prev) => [...prev, { ...data, type: "received" }]);
        } catch (err) {
          console.log("Error parsing private msg:", err);
        }
      });

      // TOKEN REFRESH
      stompClient.subscribe("/user/queue/token-refresh", (msg) => {
        try {
          const data = JSON.parse(msg.body);
          if (data.type === "TOKEN_REFRESHED") {
            Swal.fire("Session Extended", "", "success");
          }
        } catch (err) {
          console.log("Error parsing token refresh:", err);
        }
      });

      setConnected(true);
    };

    // STOMP ERROR
    stompClient.onStompError = (frame) => {
      console.log("STOMP ERROR:", frame.headers);
      Swal.fire("WebSocket Error", "Authentication or STOMP error", "error");
    };

    // SOCKET CLOSED
    stompClient.onWebSocketClose = () => {
      console.log("WebSocket Closed");
      setConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // -------------------------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------------------------
  useEffect(() => {
    // getUserChats();
    console.log("User on load:", user);
    connectWebSocket();

    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, []);

  // -------------------------------------------------------------------
  // DISCONNECT
  // -------------------------------------------------------------------
  const disconnect = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    setConnected(false);
  };

  // -------------------------------------------------------------------
  // SEND MESSAGE
  // -------------------------------------------------------------------
  const sendMessage = () => {
    if (!message.trim() || !connected || !stompClientRef.current) return;

    const payload = {
      id: Date.now(),
      sender: user.username,
      senderName: user.name,
      avatar: user.avatar || "😊",
      content: message,
      timestamp: new Date().toISOString(),
      type: "sent",
      receiver: selectedUser?.username || "all",
    };

    stompClientRef.current.publish({
      destination: "/app/chat.private",
      headers: {
        Authorization: "Bearer " + user.token,
      },
      body: JSON.stringify({
        sender: user.email,
        content: message,
        receiver: selectedUser?.email,
        type: "CHAT",
      }),
    });

    setMessages((prev) => [...prev, payload]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // -------------------------------------------------------------------
  // SELECT USER
  // -------------------------------------------------------------------
  const getCurrentClient = (u) => {
    setSelectedUser(u);
  };

  const formatTime = (timestamp) => {
    try {
      if (!timestamp) return ""; // no timestamp available

      // if timestamp is a number (ms) or ISO string, Date will handle it
      const d = new Date(timestamp);

      // if invalid date, return empty string
      if (isNaN(d.getTime())) return "";

      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.warn("formatTime error:", err);
      return "";
    }
  };

  // -------------------------------------------------------------------
  // ADD USER TO CHAT
  // -------------------------------------------------------------------
  const saveUserToChat = async (userid, clientId) => {
    Swal.fire({
      title: "Add this user?",
      icon: "question",
      showCancelButton: true,
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios.get(
            `http://localhost:8080/chats/saveOneToOneUserChat/${userid}/${clientId}`,
            { headers: { Authorization: "Bearer " + user.token } }
          );
          getUserChats();
          Swal.fire("Added!", "", "success");
        } catch (err) {
          Swal.fire("Error", "Failed to add user", "error");
        }
      }
    });
  };

  // -------------------------------------------------------------------
  // UI STARTS HERE
  // -------------------------------------------------------------------

  return (
    <div className="container-fluid vh-100 bg-light p-0">
      <div className="row h-100 m-0">
        {/* Sidebar */}
        <div className="col-md-4 col-lg-3 p-0 bg-white border-end shadow-sm">
          <div className="d-flex flex-column h-100">
            {/* Sidebar Header */}
            <div className="p-3 bg-primary text-white shadow-sm">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className="bi bi-chat-heart fs-3 me-2"></i>
                  <h5 className="fw-bold mb-0">ChatWave</h5>
                </div>
                <button
                  className="btn btn-light btn-sm rounded-circle"
                  onClick={disconnect}
                >
                  <i className="bi bi-power text-danger"></i>
                </button>
              </div>
              <div className="mt-2 small">
                Logged in as{" "}
                <strong>{user?.firstName || user?.username}</strong>
              </div>
            </div>

            {/* Search Users */}
            <div className="p-3 border-bottom bg-white">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light"
                  placeholder="Search users..."
                  onChange={(e) => getAvailableUsers(e.target.value)}
                />
              </div>
            </div>

            {/* Users List */}
            <div className="overflow-auto flex-grow-1">
              {/* Section Title */}
              <div className="px-3 pt-2 text-muted text-uppercase small fw-bold">
                Available Users
              </div>

              {onlineUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  onClick={() => getCurrentClient(userItem)}
                  className={`px-3 py-3 d-flex align-items-center border-bottom user-item ${
                    selectedUser?.id === userItem.id ? "bg-light selected" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {/* Avatar */}
                  <div className="position-relative">
                    <span className="fs-4">{userItem.avatar}</span>
                    <span
                      className={`status-dot ${
                        userItem.online ? "bg-success" : "bg-secondary"
                      }`}
                    ></span>
                  </div>

                  <div className="ms-3 flex-grow-1">
                    <h6 className="mb-0 fw-bold">
                      {userItem.firstName} {userItem.lastName}
                    </h6>
                    <small className="text-muted">
                      {userItem.online ? "Online" : "Offline"}
                    </small>
                  </div>

                  {selectedUser?.id === userItem.id && (
                    <button
                      className="btn btn-outline-primary btn-sm rounded-circle"
                      onClick={() => saveUserToChat(user.id, userItem.id)}
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  )}
                </div>
              ))}

              {/* Saved Chats */}
              <div className="px-3 pt-3 text-muted text-uppercase small fw-bold">
                Chats
              </div>

              {userChats.map((userItem) => (
                <div
                  key={userItem.id}
                  onClick={() => getCurrentClient(userItem)}
                  className={`px-3 py-3 d-flex align-items-center border-bottom user-item ${
                    selectedUser?.id === userItem.id ? "bg-light selected" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="fs-4">{userItem.avatar}</span>
                  <div className="ms-3">
                    <h6 className="mb-0 text-muted">
                      {userItem.firstName} {userItem.lastName}
                    </h6>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 bg-light border-top">
              <div className="d-flex align-items-center">
                <span className="fs-4 me-3">😊</span>
                <div>
                  <div className="fw-bold">{user?.name || user?.username}</div>
                  <div
                    className={
                      connected ? "text-success small" : "text-danger small"
                    }
                  >
                    {connected ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-md-8 col-lg-9 p-0 d-flex flex-column">
          {/* Header */}
          <div className="p-3 bg-white border-bottom shadow-sm d-flex align-items-center">
            {selectedUser ? (
              <>
                <span className="fs-3 me-3">{selectedUser.avatar}</span>
                <div>
                  <h5 className="fw-bold mb-0">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h5>
                  <small
                    className={
                      selectedUser.online ? "text-success" : "text-muted"
                    }
                  >
                    {selectedUser.online
                      ? "Online"
                      : `Last seen ${selectedUser.lastSeen}`}
                  </small>
                </div>
              </>
            ) : (
              <div className="w-100 text-center text-muted">
                <h6>Select a user to start chatting</h6>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-grow-1 overflow-auto p-4 chat-bg">
            {messages.length === 0 ? (
              <div className="h-100 d-flex justify-content-center align-items-center text-center">
                <div>
                  <i className="bi bi-chat-dots fs-1 text-muted"></i>
                  <h6 className="text-muted mt-3">No messages yet</h6>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message-row ${
                    msg.sender === user.username ? "me" : "them"
                  }`}
                >
                  <div className="message-bubble shadow-sm">
                    {msg.sender !== user.username && (
                      <div className="small fw-bold mb-1">{msg.senderName}</div>
                    )}
                    {msg.content}
                    <div className="small text-muted mt-1 text-end">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 bg-white border-top">
            <div className="input-group">
              <textarea
                className="form-control border-end-0"
                placeholder="Type message..."
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                rows="2"
                style={{ borderRadius: "18px 0 0 18px" }}
              ></textarea>

              <button
                className="btn btn-primary px-4"
                disabled={!message.trim() || !connected}
                onClick={sendMessage}
                style={{ borderRadius: "0 18px 18px 0" }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
            <div className="text-center mt-2 small">
              {connected ? (
                <span className="text-success">🟢 Connected</span>
              ) : (
                <span className="text-danger">🔴 Offline</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Enhancements */}
      <style>
        {`
        .user-item { transition: 0.2s; }
        .user-item:hover { background-color: #f1f1f1; }

        .chat-bg {
          background: #eef2f7;
        }

        .message-row {
          display: flex;
          margin-bottom: 12px;
        }

        .message-row.me {
          justify-content: flex-end;
        }

        .message-row.them {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 65%;
          padding: 12px 16px;
          border-radius: 16px;
          background: white;
        }

        .message-row.me .message-bubble {
          background: #0d6efd;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-row.them .message-bubble {
          background: white;
          border-bottom-left-radius: 4px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          bottom: 0;
          right: 0;
        }
      `}
      </style>
    </div>
  );
};

export default ChatApp;
