import React, { useState, useEffect, useRef, useMemo } from "react";
import SockJS from "sockjs-client";
import Lottie from "lottie-react";
import { Client } from "@stomp/stompjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./ChatApp.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BusyFingerAnimationLoader from "./BusyFingerAnimatedLoader";
import BellNotification from "./BellNotification";
import BellNotification2 from "./BellNotification2";
import RotatingComponent from "./RotatingComponent";
import ConnectionErrorModal from "./ConnectionErrorModal";
import LoginBackground from "./LoginBackground";
import GoldenFrameAvatar from "./GoldenFrameAvatar";
import UserAvatar from "./UserAvatar";
import GroupAvatar from "./GroupAvatar";
import GroupMembersModal from "./GroupMembersModal";

const ChatApp = () => {
  // State management
  const [expiringChats, setExpiringChats] = useState({}); // Track expiring chats
  const expiryTimersRef = useRef({}); // Store timer references
  const [countdown, setCountdown] = useState(null);
  const [currentUser, setCurrentUser] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [friends, setFriends] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState({});
  const currentMessages = chatHistory[friendUsername] || [];
  const [friendColors, setFriendColors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [sendAnimation, setSendAnimation] = useState(null);
  const sendLottieRef = useRef(null);

  // Add this with your other state declarations
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showGroupLoader, setShowGroupLoader] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const retryTimeoutRef = useRef(null);
  const maxRetries = 5;
  const baseRetryDelay = 3000; // 3 seconds
  const [authAnimation, setAuthAnimation] = useState(null);
  const authLottieRef = useRef(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
  const [currentGroupAdmin, setCurrentGroupAdmin] = useState("");

  //Group states here
  const [groups, setGroups] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [isGroupMode, setIsGroupMode] = useState(false); // false = private chat, true = group chat
  const [groupName, setGroupName] = useState("");
  const [inputGroupName, setInputGroupName] = useState("");
  const [showGroupChats, setShowGroupChats] = useState(false);

  // Add group to your existing states
  const [groupCodeId, setgroupCodeId] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showPublicGroups, setShowPublicGroups] = useState(false);
  //Group states end here

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      // Clear all expiry timers
      Object.values(expiryTimersRef.current).forEach((timer) => {
        clearInterval(timer);
      });
    };
  }, []);

  useEffect(() => {
    try {
      const anim = require("./assets/lottie/in.json");
      setAuthAnimation(anim);
    } catch (error) {
      console.error("Error loading auth animation:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup WebSocket connection
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }

      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const anim = require("./assets/lottie/sendmessage.json");
      setSendAnimation(anim);
    } catch (error) {
      console.error("Error loading send animation:", error);
    }
  }, []);

  useEffect(() => {
    const checkVisibility = () => {
      const loader = document.querySelector(".overlay-loader");
      const modal = document.querySelector("#createGroupModal");

      console.log("Loader:", {
        exists: !!loader,
        display: loader?.style.display,
        classList: loader?.classList,
        computedStyle: loader ? window.getComputedStyle(loader) : null,
      });

      console.log("Modal:", {
        exists: !!modal,
        show: modal?.classList.contains("show"),
        display: modal?.style.display,
      });
    };

    // Check every time loader state changes
    checkVisibility();
  }, [showGroupLoader]);

  // Add notification function
  const addNotification = (message, type = "message") => {
    const id = generateUniqueId();
    const newNotification = {
      id,
      message,
      type,
      show: true,
      timestamp: new Date(),
    };

    setNotifications((prev) => {
      // Limit to 3 notifications max
      const updated = [newNotification, ...prev.slice(0, 2)];
      return updated;
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}-${performance.now().toString(36).substr(2, 9)}`;
  };

  const generateId = () => {
    // Remove confusing characters: 0, O, o, 1, l, I
    const chars = "23456789abcdefghjkmnpqrstuvwxyz";
    let id = "";

    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
  };

  // Create a ref to track groups
  const groupsRef = useRef(groups);

  // Update the ref whenever groups changes

  useEffect(() => {
    groupsRef.current = groups;
    console.log("updated groups list:", groups);
  }, [groups]);

  //Group functions start here
  const showGroupMembers = () => {
    if (!isGroupMode || !currentGroupId) return;

    const currentGroup = groups.find((g) => g.id === currentGroupId);
    if (!currentGroup) return;

    setCurrentGroupMembers(currentGroup.groupMembers || []);
    setCurrentGroupAdmin(currentGroup.admin || "");
    setShowMembersModal(true);
  };

  // Create new group
  const createGroup = () => {
    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification(
        "Can't perform action - No connection to server",
        "error"
      );
      return;
    }
    if (!inputGroupName.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Group name required!.",
        icon: "error",
        confirmButtonText: "Cool",
      });
      return;
    }
    if (inputGroupName.length > 10) {
      Swal.fire({
        title: "Error!",
        text: "Group name too long. Max 10 characters.",
        icon: "error",
        confirmButtonText: "Cool",
      });
      setInputGroupName("");
      return;
    }

    setIsCreatingGroup(true);
    setShowGroupLoader(true);
    const groupId = generateUniqueId();

    const newGroup = {
      id: groupId,
      name: inputGroupName,
      groupMembers: [currentUser], // Add current user automatically
      admin: currentUser,
      createdAt: new Date().toISOString(),
    };

    stompClientRef.current.publish({
      destination: `/app/create/group`,
      body: JSON.stringify(newGroup),
    });

    // toast.success(`Group "${groupName}" created!`);
    setInputGroupName("");
  };

  // Send group message
  const sendGroupMessage = () => {
    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification(
        "Can't perform action - No connection to server",
        "error"
      );
      return;
    }
    if (!message.trim() || !currentGroupId || !stompClientRef.current) return;

    console.log("Sending group message to group name:", groupName);
    const currentGroup = groups.find((group) => group.name === groupName);
    if (!currentGroup) {
      toast.error("Group not found!");
      return;
    }

    const groupMessage = {
      groupId: Date.now(),
      group_name: groupName,
      groupMembers: currentGroup.groupMembers,
      sender: currentUser,
      content: message,
      type: "SENT",
      timestamp: new Date().toString(),
    };

    console.log(currentGroup.groupMembers);

    // Send to WebSocket
    stompClientRef.current.publish({
      destination: "/app/chat/group",
      body: JSON.stringify(groupMessage),
    });

    // Update local state
    const newMessage = {
      id: Date.now(),
      groupId: groupName,
      sender: currentUser,
      content: message,
      timestamp: new Date().toISOString(),
      type: "sent",
    };

    setChatHistory((prev) => ({
      ...prev,
      [groupName]: [...(prev[groupName] || []), groupMessage],
    }));

    setMessage("");
  };

  // Handle incoming group messages
  const handleIncomingGroupMessage = (receivedMessage) => {
    console.log("Group message arrived:", receivedMessage);
    const { group_name, sender, content } = receivedMessage;

    //check if group exists
    const groupExists = groupsRef.current.some(
      (group) => group.name === group_name
    );
    if (!groupExists) {
      console.log(
        `Group ${group_name} not found in local groups list for user ${currentUser}`
      );
      return; // Don't process message if group doesn't exist
    }

    const newMessage = {
      groupId: Date.now(),
      group_name: receivedMessage.group_name,
      groupMembers: receivedMessage.groupMembers,
      sender: sender,
      content: content,
      type: sender === currentUser ? "sent" : "received",
      timestamp: receivedMessage.timestamp,
    };

    // setChatHistory((prev) => ({
    //   ...prev,
    //   [group_name]: [...(prev[group_name] || []), newMessage],
    // }));

    setChatHistory((prev) => {
      const existingMessages = prev[group_name] || [];

      // Check if message already exists (by ID or content)
      const messageExists = existingMessages.some(
        (msg) => msg.groupId == receivedMessage.groupId
      );

      return {
        ...prev,
        [group_name]: messageExists
          ? existingMessages // Don't add if exists
          : [...existingMessages, newMessage], // Add if new
      };
    });

    // Show notification if not in this group chat
    if (
      group_name != groupNameRef.current ||
      groupNameRef.current.length == 1
    ) {
      console.log("currentGroupId", currentGroupId);
      console.log("group_name", group_name);
      console.log("groupName", groupNameRef.current);

      const cleanContent = content
        .trim()
        .replace(/\s+/g, "")
        .replace(/\n/g, "");
      const groupNameDisplay = group_name.toUpperCase();

      // const boldGroupName = <strong>{group_name}</strong>;
      if (sender !== currentUser) {
        addNotification(
          `In ${groupNameDisplay}, ${sender} says: "${cleanContent}"`,
          "group"
        );
      }

      // Update unread count
      setGroups((prev) =>
        prev.map((group) =>
          group.name === group_name
            ? { ...group, unread: group.unread + 1 }
            : group
        )
      );
    }
  };

  // Select group to chat
  const selectGroup = (groupId, groupName) => {
    setIsGroupMode(true);
    setCurrentGroupId(groupId);
    setGroupName(groupName);
    setFriendUsername(""); // Clear private chat selection
    resetGroupUnread(groupName);

    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
    console.log("Selected group:", groupName);
    console.log("current group id:", currentGroupId);
  };

  const resetGroupUnread = (groupName) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.name === groupName ? { ...group, unread: 0 } : group
      )
    );
  };

  // Toggle between friends and groups list
  const toggleChatMode = (mode, val) => {
    // setShowGroupChats(!showGroupChats);
    if (mode === "group") {
      setShowGroupChats(true);
      addNotification("Switched to group chats");
    } else {
      setShowGroupChats(false);
      addNotification("Switched to private chats");
    }
  };

  const friendExistsRef = useRef(false);

  const handleCreateOrLeavePersonalChat = (message) => {
    console.log("Personal Chat Object received", message);
    setShowGroupLoader(true);

    if (message.type == "remove") {
      console.log("Remove friend message received", message);
      setFriends((prev) =>
        prev.filter(
          (friend) =>
            friend.username !==
            (message.selfName === currentUser
              ? message.username
              : message.selfName)
        )
      );
      setFriendUsername("");
      setShowGroupLoader(false);
      clearChat(
        currentUser == message.selfName ? message.username : message.selfName
      );
      if (message.selfName == currentUser) {
        Swal.fire({
          title: "Removed!",
          text: `${message.username} has been removed from your friends list.`,
          icon: "success",
        });
      } else {
        addNotification(
          currentUser == message.selfName
            ? message.username
            : message.selfName + " has removed you from their friends list."
        );
      }
      setShowGroupLoader(false);
      return;
    }

    // Use the ref to check synchronously
    const friendN =
      message.selfName == currentUser ? message.username : message.selfName;
    const friendExists = friendsRef.current.some(
      (friend) => friend.username === friendN
    );

    if (friendExists) {
      setShowGroupLoader(false);
      if (message.selfName == currentUser) {
        addNotification("Friend already exists!");
      }
      setNewFriendUsername("");
      return;
    }

    // Add new friend
    const newFriend = {
      id: message.id,
      username:
        message.selfName == currentUser ? message.username : message.selfName,
      friendName:
        message.selfName == currentUser ? message.friendName : message.selfName,
      selfName: currentUser,
      online: true,
      type: "add",
      unread: 0,
    };

    setFriends((prev) => [...prev, newFriend]);

    if (message.selfName === currentUser) {
      addNotification("Friend added successfully!");
    } else {
      addNotification(
        `${message.selfName} has added you in their friends list.`
      );
    }

    setFriendUsername(newFriendUsername);
    setNewFriendUsername("");
    setShowGroupLoader(false);
  };

  // const handleCreateOrLeavePersonalChats = (message) => {
  //   console.log("Personal Chat Object received", message);
  //   setShowGroupLoader(true);
  //   if (message.type == "remove") {
  //     console.log("Remove friend message received", message);
  //     setFriends((prev) =>
  //       prev.filter(
  //         (friend) =>
  //           friend.username !==
  //           (message.selfName === currentUser
  //             ? message.username
  //             : message.selfName)
  //       )
  //     );
  //     setFriendUsername("");
  //     setShowGroupLoader(false);
  //     clearChat(
  //       currentUser == message.selfName ? message.username : message.selfName
  //     );
  //     if (message.selfName == currentUser) {
  //       Swal.fire({
  //         title: "Removed!",
  //         text: `${message.username} has been removed from your friends list.`,
  //         icon: "success",
  //       });
  //     } else {
  //       addNotification(
  //         currentUser == message.selfName
  //           ? message.username
  //           : message.selfName + " has removed you from their friends list."
  //       );
  //     }
  //     setShowGroupLoader(false);
  //     return;
  //   }

  //   setFriends((prev) => {
  //     const friendN =
  //       message.selfName == currentUser ? message.username : message.selfName;
  //     const friendIndex = prev.findIndex(
  //       (friend) => friend.username === friendN
  //     );

  //     console.log("4. Friend index?", friendIndex);

  //     if (friendIndex === -1) {
  //       // New friend
  //       friendExistsRef.current = false;
  //       const newFriend = {
  //         id: message.id,
  //         username:
  //           message.selfName == currentUser
  //             ? message.username
  //             : message.selfName,
  //         friendName:
  //           message.selfName == currentUser
  //             ? message.friendName
  //             : message.selfName,
  //         selfName: currentUser,
  //         online: true,
  //         type: "add",
  //         unread: 0,
  //       };
  //       console.log("6. Updated friends array:", [...prev, newFriend]);
  //       return [...prev, newFriend];
  //     } else {
  //       // Existing friend
  //       friendExistsRef.current = true;
  //       setShowGroupLoader(false);
  //       // if (message.selfName == currentUser) {
  //       //   addNotification("Friend already exists!");
  //       // }
  //       return prev;
  //     }
  //   });

  //   if (friendExistsRef.current && message.selfName == currentUser) {
  //     addNotification("Friend already exists!");
  //   } else if (message.selfName === currentUser) {
  //     addNotification("Friend added successfully!");
  //   } else if (friendExistsRef.current === false) {
  //     console.log("friendExists", friendExistsRef.current);
  //     addNotification(
  //       message.selfName + " has added you in their friends list."
  //     );
  //   }
  //   setFriendUsername(newFriendUsername);
  //   setNewFriendUsername("");
  //   setShowGroupLoader(false);
  // };

  const handleLeaveGroup = (message) => {
    setShowGroupLoader(true);
    console.log(message);
    const lastWord = message[0].split(":").pop();

    if (message[1] == currentUser) {
      setGroups((prev) => prev.filter((group) => group.id !== message[0]));
      clearChat(lastWord);
      setCurrentGroupId("");
      Swal.fire({
        title: "Removed!",
        text: `you successfully left the group "${lastWord}"`,
        icon: "success",
      });
    } else {
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === message[0]) {
            return {
              ...group,
              groupMembers: group.groupMembers.filter(
                (member) => member !== message[1]
              ),
            };
          }
          return group;
        })
      );

      setCurrentGroupMembers((prev) =>
        prev.filter((member) => member !== message[1])
      );

      addNotification(`${message[1]} left the group "${lastWord}"`);
    }
    console.log(groups);
    setShowGroupLoader(false);
  };

  // const handleCreateOrJoinGroup = (message) => {
  //   console.log("Group Object received", message);

  //   // Handle error cases
  //   if (!message.body) {
  //     setIsCreatingGroup(false);
  //     setShowGroupLoader(false);
  //     addNotification("Group already exists! please choose different name");
  //     return;
  //   }
  //   if (message.body === "1") {
  //     setIsCreatingGroup(false);
  //     setShowGroupLoader(false);
  //     addNotification("Group not found!");
  //     return;
  //   }

  //   const response = JSON.parse(message.body);
  //   console.log("Parsed response:", response);

  //   const groupAlreadyExists = groupsRef.current.some(
  //     (group) => group.name === response.name
  //   );
  //   const userExists = response.groupMembers.some(
  //     (member) => member === currentUser
  //   );
  //   console.log(userExists);
  //   console.log(groupAlreadyExists);

  //   if (groupAlreadyExists && response.request.memberName == currentUser) {
  //     setIsCreatingGroup(false);
  //     setShowGroupLoader(false);
  //     setInputGroupName("");
  //     addNotification("You are already a member of this group!");
  //     return;
  //   }

  //   if (response.type === "create") {
  //     // CREATE GROUP: Add new group
  //     const newGroup = {
  //       id: response.id,
  //       name: response.name,
  //       groupMembers: [...response.groupMembers],
  //       admin: response.admin,
  //       createdAt: new Date().toISOString(),
  //     };

  //     setGroups((prev) => {
  //       // Check if group already exists before adding
  //       const groupExists = prev.some((g) => g.id === response.id);
  //       return groupExists ? prev : [...prev, newGroup];
  //     });
  //     addNotification(`Group "${response.name}" created!`, "group");
  //   }

  //   if (
  //     response.type === "join" &&
  //     response.request.memberName == currentUser
  //   ) {
  //     // JOIN GROUP: Update existing group's members
  //     setGroups((prev) => {
  //       const groupExists = prev.some((g) => g.id === response.id);

  //       if (!groupExists) {
  //         // If group doesn't exist locally, add it (for the joiner)
  //         const newGroup = {
  //           id: response.id, // Use groupId from join response
  //           name: response.name,
  //           groupMembers: [...response.groupMembers],
  //           admin: response.admin,
  //           createdAt: response.createdAt || new Date().toISOString(),
  //         };
  //         return [...prev, newGroup];
  //       }

  //       // If group exists, update members
  //       return prev.map((group) => {
  //         if (group.id === response.id) {
  //           return {
  //             ...group,
  //             groupMembers: [...response.groupMembers],
  //           };
  //         }
  //         return group;
  //       });
  //     });

  //     // Hide loader and show success
  //     // setTimeout(() => {

  //     if (!groupAlreadyExists && response.request.memberName == currentUser) {
  //       addNotification(`You joined group:  ${response.name}`, "join");
  //       // } else if (newMember === currentUser) {
  //       //   // toast.success(`You joined group: ${response.name}`);
  //       //   addNotification(`You joined group:  ${response.name}`, "join");
  //       console.log("if block");
  //     }

  //     if (groupAlreadyExists) {
  //       // toast.info(`${newMember} joined the group`);
  //       console.log("else if block");
  //       addNotification(
  //         `${response.request.memberName} joined the group: "${response.name}"`,
  //         "join"
  //       );
  //     }
  //     // }, 1000);
  //   }

  //   if (groups.length == 1) {
  //     // setIsGroupMode(true);
  //     // setCurrentGroupId(response.id);
  //     // setGroupName(response.name);
  //     console.log(groupsRef.length == 1);
  //     console.log(groupsRef);
  //     selectGroup(response.id, response.name);
  //   }
  //   // setGroupName(""); // Only if you have an input field to clear
  //   setInputGroupName("");
  //   setShowGroupLoader(false);
  // };

  const handleCreateOrJoinGroup = (message) => {
    // Handle error cases
    if (!message.body) {
      setIsCreatingGroup(false);
      setShowGroupLoader(false);
      addNotification(
        "Group already exists! Please choose a different name",
        "error"
      );
      return;
    }

    console.log("Group Object received", message);
    const response = JSON.parse(message.body);
    console.log("Parsed response:", response);

    if (message.body === "1") {
      setIsCreatingGroup(false);
      setShowGroupLoader(false);
      addNotification("Group not found! Check the group name", "error");
      return;
    }

    const groupExists = groupsRef.current.some(
      (group) => group.name === response.name
    );

    // Check who is joining (from the request)
    const joiningMember = response.request?.memberName;
    const isCurrentUserJoining = joiningMember === currentUser;

    if (groupExists && isCurrentUserJoining) {
      setIsCreatingGroup(false);
      setShowGroupLoader(false);
      addNotification("You are already a member of this group!", "info");
      return;
    }

    // IMPORTANT: Only process if current user is the one joining
    // OR if it's a group creation where current user is the admin/creator
    if (response.type === "create") {
      // CREATE GROUP - only add if current user is the creator
      if (response.admin === currentUser) {
        const groupAlreadyExists = groupsRef.current.some(
          (group) => group.name === response.name || group.id === response.id
        );

        if (groupAlreadyExists) {
          setIsCreatingGroup(false);
          setShowGroupLoader(false);
          setInputGroupName("");
          addNotification("You already have this group in your list!", "info");
          return;
        }

        const newGroup = {
          id: response.id,
          name: response.name,
          groupMembers: [...response.groupMembers],
          admin: response.admin,
          createdAt: new Date().toISOString(),
          unread: 0,
        };

        setGroups((prev) => {
          const alreadyHasGroup = prev.some(
            (g) => g.id === response.id || g.name === response.name
          );
          return alreadyHasGroup ? prev : [...prev, newGroup];
        });

        addNotification(`Group "${response.name}" created!`, "success");

        // Auto-select if this is the first group
        if (groups.length === 0) {
          selectGroup(response.id, response.name);
        }
      }
      // If someone else created a group, don't add it to current user's list
    }

    if (response.type === "join") {
      // JOIN GROUP - CRITICAL: Only update local state if current user is the one joining

      if (isCurrentUserJoining) {
        // Current user is joining - update local state
        const groupAlreadyExists = groupsRef.current.some(
          (group) => group.name === response.name || group.id === response.id
        );

        // Check if user is already a member in the updated group
        const currentUserIsMember = response.groupMembers?.some(
          (member) => member === currentUser
        );

        if (currentUserIsMember && groupAlreadyExists) {
          // User is already a member and group exists locally
          setIsCreatingGroup(false);
          setShowGroupLoader(false);
          setInputGroupName("");
          addNotification("You are already a member of this group!", "info");
          return;
        }

        // Update groups state - only for the joining user
        setGroups((prev) => {
          const existingGroupIndex = prev.findIndex(
            (g) => g.id === response.id || g.name === response.name
          );

          if (existingGroupIndex === -1) {
            // Group doesn't exist locally, add it
            const newGroup = {
              id: response.id,
              name: response.name,
              groupMembers: [...response.groupMembers],
              admin: response.admin,
              createdAt: response.createdAt || new Date().toISOString(),
              unread: 0,
            };
            return [...prev, newGroup];
          } else {
            // Group exists, update members
            return prev.map((group, index) => {
              if (index === existingGroupIndex) {
                return {
                  ...group,
                  groupMembers: [...response.groupMembers],
                };
              }
              return group;
            });
          }
        });

        // Notification for the joining user
        if (groupAlreadyExists) {
          addNotification(`You rejoined group: ${response.name}`, "success");
        } else {
          addNotification(`You joined group: ${response.name}`, "success");

          // Auto-select the group if user just joined a new group
          if (!groupAlreadyExists) {
            selectGroup(response.id, response.name);
          }
        }
      } else {
        // Someone else is joining - DON'T update local state
        // Just show notification if current user is already a member

        // Check if current user is already a member of this group (from local state)
        const userGroups = groupsRef.current;
        const userIsMemberOfGroup = userGroups.some(
          (group) =>
            (group.name === response.name || group.id === response.id) &&
            group.groupMembers?.includes(currentUser)
        );

        console.log("userIsMemberOfGroup:", userIsMemberOfGroup);
        if (userIsMemberOfGroup) {
          // Current user is already a member - show notification
          addNotification(
            `${joiningMember} joined group: "${response.name}"`,
            "info"
          );

          // Optional: Update the group members in local state without adding new group
          setGroups((prev) =>
            prev.map((group) => {
              if (
                (group.name === response.name || group.id === response.id) &&
                !group.groupMembers.includes(joiningMember)
              ) {
                return {
                  ...group,
                  groupMembers: [...group.groupMembers, joiningMember],
                };
              }
              return group;
            })
          );
        }
        // If current user is NOT a member, do nothing
      }
    }

    // Clear input and loader
    setInputGroupName("");
    setShowGroupLoader(false);
    setIsCreatingGroup(false);
  };

  // Join existing group
  const joinGroup = () => {
    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification(
        "Can't perform action - No connection to server",
        "error"
      );
      return;
    }
    setShowGroupLoader(true);
    if (!inputGroupName.trim()) {
      setShowGroupLoader(false);
      addNotification("Please enter a valid group name");
      return;
    }

    // Send join request to backend
    const joinRequest = {
      memberName: currentUser,
      groupId: inputGroupName,
    };

    if (stompClientRef.current) {
      stompClientRef.current.publish({
        destination: "/app/join/group",
        body: JSON.stringify(joinRequest),
      });
    }

    // toast.info(`Request sent to join group: ${groupCodeId}`);
    setgroupCodeId("");
    // setInputGroupName("");
    // Otherwise treat as invite code
    // Validate with backend or process locally
    // handlegroupCodeId(groupCodeId);
  };

  // Handle group invite code
  const handlegroupCodeId = (inviteCode) => {
    // In a real app, you'd validate this with backend
    // For now, simulate finding group by invite code
    const simulatedGroup = {
      id: `group-${Date.now()}`,
      name: `Group from invite`,
      groupMembers: [currentUser, "AdminUser"],
      admin: "AdminUser",
      createdAt: new Date().toISOString(),
    };

    // Check if group already exists
    const groupExists = groups.some((g) => g.id === simulatedGroup.id);
    if (!groupExists) {
      setGroups((prev) => [...prev, simulatedGroup]);
      toast.success(`Successfully joined group: ${simulatedGroup.name}`);
      selectGroup(simulatedGroup.id);
    } else {
      toast.info("You're already a member of this group");
    }

    setgroupCodeId("");
  };

  // Generate random invite code
  const generateRandomInviteCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setgroupCodeId(code);
  };

  const groupNameRef = useRef(groupName);
  useEffect(() => {
    groupNameRef.current = groupName;
    console.log("Group name updated:", groupName);
    console.log("groupNameRef current:", groupNameRef.current);
  }, [groupName]);

  //Group functions end here

  const friendsRef = useRef(friends);
  const friendUsernameRef = useRef(friendUsername);

  // Update the ref whenever friends changes
  useEffect(() => {
    friendsRef.current = friends;
    console.log("Friends updated:", friends);
    console.log("FriendsRef current:", friendsRef.current);
  }, [friends]);

  useEffect(() => {
    if (friendUsername) {
      resetUnreadCount(friendUsername);
    }
    friendUsernameRef.current = friendUsername;
    console.log("Friend username updated:", friendUsernameRef.current);
  }, [friendUsername]);

  // Sample friends data
  const sampleFriends = [
    {
      id: 1,
      username: "alex_chen",
      name: "Alex Chen",
      online: true,
      unread: 2,
    },
    {
      id: 2,
      username: "sara_m",
      name: "Sara Martinez",
      online: true,
      unread: 0,
    },
    {
      id: 3,
      username: "mike_t",
      name: "Mike Thompson",
      online: false,
      unread: 0,
    },
    {
      id: 4,
      username: "priya_k",
      name: "Priya Kumar",
      online: true,
      unread: 1,
    },
  ];

  useEffect(() => {
    console.log("chatHistory updated:", chatHistory);
    console.log("currentMessages for", friendUsername, ":", currentMessages);
  }, [chatHistory, friendUsername]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize sample friends
  useEffect(() => {
    if (isAuthenticated) {
      setFriends([]);
    }
  }, [isAuthenticated]);

  // Initialize Bootstrap modal
  useEffect(() => {
    if (modalRef.current) {
      // Bootstrap modal is already initialized by the bundle
      // We just need to handle the ref
    }
  }, []);

  // WebSocket connection
  // const connectWebSocket = () => {
  //   if (!currentUser.trim()) return;

  //   // Clear any existing connection
  //   if (stompClientRef.current) {
  //     try {
  //       stompClientRef.current.deactivate();
  //     } catch (e) {
  //       console.log("Error deactivating previous connection:", e);
  //     }
  //   }

  //   const socket = new SockJS("http://localhost:8080/webSocket");

  //   const stompClient = new Client({
  //     webSocketFactory: () => socket,
  //     reconnectDelay: 5000,
  //   });

  //   stompClient.onConnect = () => {
  //     setIsConnected(true);

  //     stompClient.subscribe(
  //       `/topic/add-leave/friend/${currentUser}`,
  //       (message) => {
  //         try {
  //           const receivedMessage = JSON.parse(message.body);
  //           handleCreateOrLeavePersonalChat(receivedMessage);
  //           console.log("Received friend add/leave message:", receivedMessage);
  //         } catch (error) {
  //           console.error("Error parsing message:", error);
  //         }
  //       }
  //     );

  //     stompClient.subscribe(`/topic/send/${currentUser}`, (message) => {
  //       try {
  //         const receivedMessage = JSON.parse(message.body);
  //         handleIncomingMessage(receivedMessage);
  //       } catch (error) {
  //         console.error("Error parsing message:", error);
  //       }
  //     });

  //     // NEW: Group chat subscription
  //     stompClient.subscribe(`/topic/group/${currentUser}`, (message) => {
  //       try {
  //         // if (message.body.includes("joined")) {
  //         //   toast.info(message.body);
  //         //   return;
  //         // }
  //         const receivedMessage = JSON.parse(message.body);
  //         handleIncomingGroupMessage(receivedMessage);
  //       } catch (error) {
  //         console.error("Error parsing group message:", error);
  //       }
  //     });

  //     // NEW: Group activity related subscription
  //     stompClient.subscribe(`/topic/user/${currentUser}`, (message) => {
  //       try {
  //         console.log(message);
  //         handleCreateOrJoinGroup(message);
  //       } catch (error) {
  //         console.error("Error parsing group invite:", error);
  //       }
  //     });

  //     stompClient.subscribe("/topic/leave/group", (message) => {
  //       try {
  //         // console.log(message);
  //         const response = JSON.parse(message.body);
  //         handleLeaveGroup(response);
  //       } catch (error) {
  //         console.error("Error parsing object:", error);
  //       }
  //     });
  //   };

  //   stompClient.onStompError = () => {
  //     setIsConnected(false);
  //   };

  //   stompClient.activate();
  //   stompClientRef.current = stompClient;
  // };

  const connectWebSocket = () => {
    if (!currentUser.trim()) return;

    // Clear any existing connection
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (e) {
        console.log("Error deactivating previous connection:", e);
      }
    }

    const socket = new SockJS("http://localhost:8080/webSocket");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setConnectionError(false);
        setIsReconnecting(false);
        setRetryCount(0);

        // Clear any retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        // Your existing subscription logic here...
        stompClient.subscribe(
          `/topic/add-leave/friend/${currentUser}`,
          (message) => {
            try {
              const receivedMessage = JSON.parse(message.body);
              handleCreateOrLeavePersonalChat(receivedMessage);
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          }
        );

        stompClient.subscribe(`/topic/send/${currentUser}`, (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            handleIncomingMessage(receivedMessage);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });

        stompClient.subscribe(`/topic/group/${currentUser}`, (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            handleIncomingGroupMessage(receivedMessage);
          } catch (error) {
            console.error("Error parsing group message:", error);
          }
        });

        stompClient.subscribe(`/topic/user/${currentUser}`, (message) => {
          try {
            console.log(message);
            handleCreateOrJoinGroup(message);
          } catch (error) {
            console.error("Error parsing group invite:", error);
          }
        });

        stompClient.subscribe("/topic/leave/group", (message) => {
          try {
            const response = JSON.parse(message.body);
            handleLeaveGroup(response);
          } catch (error) {
            console.error("Error parsing object:", error);
          }
        });

        stompClient.subscribe(
          `/topic/chat/expiry/${currentUser}`,
          (message) => {
            try {
              const receivedMessage = JSON.parse(message.body);
              handleExpiryOfChats(receivedMessage);
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          }
        );

        // Notify user of successful connection
        if (retryCount > 0) {
          addNotification("Connection restored!", "success");
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setLastError(frame.headers?.message || "STOMP protocol error");
        handleConnectionError("STOMP error occurred");
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
        setLastError("WebSocket connection failed");
        handleConnectionError("WebSocket connection error");
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        handleConnectionError("Disconnected from server");
      },
    });

    // Handle connection failure
    stompClient.onWebSocketClose = (event) => {
      console.log("WebSocket closed:", event);
      if (!isReconnecting) {
        handleConnectionError("Connection closed");
      }
    };

    try {
      stompClient.activate();
      stompClientRef.current = stompClient;
    } catch (error) {
      console.error("Error activating STOMP client:", error);
      handleConnectionError("Failed to establish connection");
    }

    if (showGroupLoader) {
      setShowGroupLoader(false);
    }
  };

  const handleExpiryOfChats = (message) => {
    console.log("Chat expiry received:", message);
    const { streamKey, ttlSeconds, minutesRemaining } = message;
    addNotification(
      `Chat will expire in ${minutesRemaining} minute(s)`,
    );

    console.log("DEBUG: Received streamKey:", streamKey);
    console.log(
      "DEBUG: Expected format for friend chat:",
      `private-chat${currentUser}-friendname`
    );
    console.log("DEBUG: Current user:", currentUser);
    // Start countdown for this chat
    startCountdownWithCleanup(streamKey, ttlSeconds);
  };


  
  const startCountdownWithCleanup = (streamKey, initialSeconds) => {
    let secondsRemaining = initialSeconds;

    // Clear previous timer if exists
    if (expiryTimersRef.current[streamKey]) {
      clearInterval(expiryTimersRef.current[streamKey]);
    }

    // Update expiring chats state
    setExpiringChats((prev) => ({
      ...prev,
      [streamKey]: secondsRemaining,
    }));
    console.log(expiringChats);
    // Start new timer
    expiryTimersRef.current[streamKey] = setInterval(() => {
      secondsRemaining--;

      if (secondsRemaining <= 0) {
        // Chat expired - cleanup
        clearInterval(expiryTimersRef.current[streamKey]);
        delete expiryTimersRef.current[streamKey];

        setExpiringChats((prev) => {
          const updated = { ...prev };
          delete updated[streamKey];
          return updated;
        });
        console.log(expiringChats);
        // Remove chat from UI
        removeExpiredChat(streamKey);
      } else {
        // Update countdown in state
        setExpiringChats((prev) => ({
          ...prev,
          [streamKey]: secondsRemaining,
        }));
        console.log(expiringChats);
      }
    }, 1000);

    // Initial display
    updateCountdownDisplay(streamKey, secondsRemaining);
  };

  // const removeExpiredChat = (streamKey) => {
  //   console.log("Removing expired chat:", streamKey);

  //   if (streamKey.startsWith("group:chat:")) {
  //     // Group chat - remove from groups array
  //     const groupName = streamKey.replace("group:chat:", "");
  //     setGroups((prev) => prev.filter((group) => group.name !== groupName));
  //     clearChat(groupName);

  //     // If current chat is expired, clear it
  //     if (
  //       currentGroupId &&
  //       groups.find((g) => g.id === currentGroupId)?.name === groupName
  //     ) {
  //       setIsGroupMode(false);
  //       setCurrentGroupId("");
  //     }
  //   } else if (streamKey.includes("private-chat")) {
  //     // Private chat - remove from friends array
  //     const cleanKey = streamKey.replace("private-chat", "");
  //     console.log("cleanKey:", cleanKey);
  //     const [user1, user2] = cleanKey.split("-");
  //     console.log("user1:", user1, "user2:", user2);
  //     const friendName = currentUser.toLowerCase() === user1 ? user2 : user1;
  //     console.log("Expired private chat with:", friendName);
  //     // Remove from friends array
  //     setFriends((prev) =>
  //       prev.filter((friend) => friend.username.toLowerCase() !== friendName.toLowerCase())
  //     );
  //     console.log(friends);
  //     friendExistsRef.current = false;
  //     clearChat(friendName);

  //     // If current chat is expired, clear it
  //     if (friendUsername === friendName) {
  //       setFriendUsername("");
  //     }
  //     clearChat(friendName);
  //   }

  //   showExpiredNotification(streamKey);
  //   //  addNotification("Chat has expired and was removed", "info");
  // };

  const removeExpiredChat = (streamKey) => {
    console.log("Removing expired chat:", streamKey);

    if (streamKey.startsWith("group:chat:")) {
      const groupName = streamKey.replace("group:chat:", "");

      // Case-insensitive group name matching
      setGroups((prev) => {
        const updatedGroups = prev.filter((group) => {
          // Compare ignoring case
          const groupNameLower = groupName.toLowerCase();
          const storedGroupNameLower = group.name.toLowerCase();
          return storedGroupNameLower !== groupNameLower;
        });
        console.log("Groups after removal:", updatedGroups);
        return updatedGroups;
      });

      // Clear chat history with case-insensitive matching
      setChatHistory((prev) => {
        const updated = { ...prev };
        // Find the actual key (with correct case) that matches
        const matchingKey = Object.keys(updated).find(
          (key) => key.toLowerCase() === groupName.toLowerCase()
        );
        if (matchingKey) {
          console.log("Deleting chat history for group:", matchingKey);
          delete updated[matchingKey];
        }
        return updated;
      });

      // Reset current group if it's the expired one
      if (currentGroupId) {
        const currentGroup = groups.find((g) => g.id === currentGroupId);
        if (
          currentGroup &&
          currentGroup.name.toLowerCase() === groupName.toLowerCase()
        ) {
          console.log("Current group expired, clearing it");
        }
      }
      setIsGroupMode(false);
      setCurrentGroupId("");
    } else if (streamKey.includes("private-chat")) {
      console.log("Processing private chat expiry:", streamKey);

      // Extract usernames from streamKey
      const cleanKey = streamKey.replace("private-chat", "");
      const [user1, user2] = cleanKey.split("-");

      console.log("Extracted users:", user1, user2);
      console.log("Current user:", currentUser);

      // Find the friend name (the one that's NOT current user)
      let friendNameFromStream = "";
      if (currentUser.toLowerCase() === user1.toLowerCase()) {
        friendNameFromStream = user2; // This is the lowercase from backend
      } else if (currentUser.toLowerCase() === user2.toLowerCase()) {
        friendNameFromStream = user1; // This is the lowercase from backend
      }

      console.log("Friend name from stream (backend):", friendNameFromStream);
      console.log(
        "Current friends list:",
        friends.map((f) => f.username)
      );

      if (friendNameFromStream) {
        // Find the actual friend object with correct case
        const friendToRemove = friends.find(
          (friend) =>
            friend.username.toLowerCase() === friendNameFromStream.toLowerCase()
        );

        const actualFriendName = friendToRemove
          ? friendToRemove.username
          : friendNameFromStream;
        console.log("Actual friend name to remove:", actualFriendName);

        // Remove from friends array (case-insensitive)
        setFriends((prev) => {
          const updated = prev.filter(
            (friend) =>
              friend.username.toLowerCase() !==
              friendNameFromStream.toLowerCase()
          );
          console.log("Friends after removal:", updated);
          return updated;
        });

        // Clear chat history (find with correct case)
        setChatHistory((prev) => {
          const updated = { ...prev };
          // Find the key with correct case
          const matchingKey = Object.keys(updated).find(
            (key) => key.toLowerCase() === actualFriendName.toLowerCase()
          );
          if (matchingKey) {
            console.log("Deleting chat history for friend:", matchingKey);
            delete updated[matchingKey];
          }
          return updated;
        });

        // Reset current friend if it's the expired one
        if (friendUsername.toLowerCase() === actualFriendName.toLowerCase()) {
          console.log("Current friend expired, clearing it");
          setFriendUsername("");
        }
      }
    }

    showExpiredNotification(streamKey);
  };

  const showExpiredNotification = (streamKey) => {
    // Get chat name
    let chatName = streamKey;
    if (streamKey.startsWith("group:chat:")) {
      chatName = streamKey.replace("group:chat:", "Group: ");
    } else if (streamKey.includes("private-chat")) {
      const cleanKey = streamKey.replace("private-chat", "");
      const [user1, user2] = cleanKey.split("-");
      chatName =
        currentUser.toLowerCase() === user1.toLowerCase() ? `Chat with ${user2}` : `Chat with ${user1}`;
    }

    // Show toast notification
    addNotification(`${chatName} has expired and was removed`);
  };

  const updateCountdownDisplay = (streamKey, secondsRemaining) => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    const displayText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Update in chat UI
    const countdownElement = document.querySelector(
      `[data-chat-key="${streamKey}"] .expiry-countdown`
    );
    if (countdownElement) {
      countdownElement.textContent = `⏰ ${displayText}`;

      // Style based on urgency
      if (secondsRemaining < 60) {
        countdownElement.style.color = "red";
        countdownElement.classList.add("urgent");
      } else if (secondsRemaining < 300) {
        countdownElement.style.color = "orange";
      }
    }
  };

  const handleConnectionError = (errorMessage) => {
    console.error("Connection error:", errorMessage);
    setConnectionError(true);
    setIsConnected(false);
    setLastError(errorMessage);

    // Only auto-retry if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      const delay = baseRetryDelay * Math.pow(2, retryCount); // Exponential backoff

      setIsReconnecting(true);
      setRetryCount((prev) => prev + 1);

      addNotification(
        `Connection lost. Retrying in ${delay / 1000} seconds... (Attempt ${
          retryCount + 1
        }/${maxRetries})`,
        "error"
      );

      // Schedule retry
      retryTimeoutRef.current = setTimeout(() => {
        if (currentUser.trim()) {
          console.log(`Attempting reconnect #${retryCount + 1}`);
          connectWebSocket();
        }
      }, delay);
    } else {
      // Max retries reached
      addNotification(
        "Connection failed after multiple attempts. Please check your network and try again.",
        "error"
      );
    }
  };

  const manualRetryConnection = () => {
    if (isReconnecting) return;

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setRetryCount(0);
    setIsReconnecting(true);
    addNotification("Manually reconnecting...", "info");

    connectWebSocket();
  };
  const COLOR_PALETTE = [
    "#ffcfcfff",
    "#d6fffcff",
    "#f7ecd2ff",
    "#cbf7ebff",
    "#a7e6fbff",
    "#ffc1d0ff",
    "#ffeec5ff",
    "#ffc2b9ff",
    "#e0f9b8ff",
    "#c1e7ffff",
    "#e1cdfdff",
    "#ffbfe5ff",
    "#c3ebf8ff",
    "#c0f0e9ff",
    "#f3cebbff",
    "#e7cff5ff",
    "#e1fccaff",
    "#f7cfbbff",
    "#c4f1f5ff",
    "#f8d3f8ff",
  ];
  const getRandomColor = () => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  };

  const resetUnreadCount = (username) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.username === username ? { ...friend, unread: 0 } : friend
      )
    );
  };

  const handleIncomingMessage = (receivedMessage) => {
    // alert("current user " + friendUsernameRef.current);
    console.log(friendUsernameRef.current);

    console.log("Message arrived:", receivedMessage);
    console.log(currentMessages);
    const messageSender = receivedMessage.sender;
    console.log(friendsRef.current);

    const newMessage = {
      id: Date.now() + Math.random(),
      sender: messageSender,
      content: receivedMessage.content,
      timestamp: receivedMessage.timestamp || new Date().toISOString(),
      type: "received",
    };

    setChatHistory((prev) => ({
      ...prev,
      [messageSender]: [...(prev[messageSender] || []), newMessage],
    }));

    console.log(chatHistory);

    if (messageSender !== friendUsernameRef.current) {
      console.log("Showing notification for", messageSender);
      addNotification(
        `${messageSender}: ${receivedMessage.content}`,
        "message"
      );
    }

    setFriends((prev) => {
      const friendIndex = prev.findIndex(
        (friend) => friend.username == messageSender
      );

      console.log("4. Friend index?", friendIndex);

      if (friendIndex === -1) {
        // New friend
        console.log("received a message from a new friend:", messageSender);
        const newFriend = {
          id: Date.now(),
          username: messageSender,
          friendName: messageSender,
          name: messageSender,
          online: true,
          type: "add",
          unread: 1,
        };
        console.log("6. Updated friends array:", [...prev, newFriend]);
        return [...prev, newFriend];
      } else {
        // Existing friend - increment unread if not active
        if (messageSender !== friendUsernameRef.current) {
          return prev.map((friend, index) =>
            index === friendIndex
              ? { ...friend, unread: friend.unread + 1 }
              : friend
          );
        }
        return prev;
      }
    });

    // if (messageSender !== friendUsernameRef.current) {
    //   return prev.map((friend, index) =>
    //     index === friendIndex
    //       ? { ...friend, unread: friend.unread + 1 }
    //       : friend
    //   );
    // }
  };

  const clearChat = (group_name) => {
    setChatHistory((prev) => {
      const updated = { ...prev };
      delete updated[group_name];
      console.log(updated);
      return updated;
    });
  };

  // Clear all chats
  const clearAllChats = () => {
    setChatHistory({});
  };

  const leaveGroup = (currentGroupId, currentUser) => {
    Swal.fire({
      title: `Are you sure? you want to leave this group`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Leave!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!isConnected || !stompClientRef.current || connectionError) {
          addNotification(
            "Can't perform action - No connection to server",
            "error"
          );
          return;
        }
        setShowGroupLoader(true);
        stompClientRef.current.publish({
          destination: `/app/leave/group/${currentGroupId}/${currentUser}`,
        });
      }
    });
  };

  const removeFriend = (username) => {
    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification(
        "Can't perform action - No connection to server",
        "error"
      );
      return;
    }
    Swal.fire({
      title: `Are you sure? you want to remove ${username} from your friends list?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove!",
    }).then((result) => {
      if (result.isConfirmed) {
        setShowGroupLoader(true);
        const removeFriend = {
          id: Date.now().toString(),
          username: username,
          friendName: username,
          selfName: currentUser,
          type: "remove",
        };

        stompClientRef.current.publish({
          destination: "/app/friend/remove",
          body: JSON.stringify(removeFriend),
        });
        // setFriends((prev) =>
        //   prev.filter((friend) => friend.username !== username)
        // );
        // clearChat(username);
        // setFriendUsername("");
        // Swal.fire({
        //   title: "Removed!",
        //   text: `${username} has been removed from your friends list.`,
        //   icon: "success",
        // });
      }
    });
  };

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) {
      return friends; // Return all friends when search is empty
    }

    const query = searchQuery.toLowerCase().trim();
    return friends.filter(
      (friend) =>
        friend.friendName.toLowerCase().includes(query) ||
        friend.username.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) {
      return groups; // Return all groups when search is empty
    }
    console.log("group query", groupSearchQuery);
    const query = groupSearchQuery.toLowerCase().trim();
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.id.toLowerCase().includes(query)
    );
  }, [groups, groupSearchQuery]);

  const handleSearch = (mode, e) => {
    if (mode === "friends") {
      setSearchQuery(e.target.value);
    } else {
      setGroupSearchQuery(e.target.value);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const sendMessage = () => {
    // if (!message.trim() || !stompClientRef.current || !friendUsername.trim())
    //   return;

    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification("Cannot send message - No connection to server", "error");
      return;
    }

    if (isGroupMode && currentGroupId) {
      console.log("Sending group message", currentGroupId);
      sendGroupMessage();
    } else if (friendUsername.trim()) {
      const chatMessage = {
        id: Date.now(),
        sender: currentUser,
        receiver: friendUsername,
        content: message,
        timestamp: new Date().toISOString(),
        type: "SENT",
      };

      stompClientRef.current.publish({
        destination: "/app/chat/test",
        body: JSON.stringify(chatMessage),
      });

      const newMessage = {
        id: Date.now(),
        sender: currentUser,
        content: message,
        timestamp: new Date().toISOString(),
        type: "sent",
      };

      // Update chat history
      setChatHistory((prev) => ({
        ...prev,
        [friendUsername]: [...(prev[friendUsername] || []), chatMessage],
      }));

      console.log(chatHistory);

      // setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  // Mobile menu toggle
  const toggleSidebar = () => {
    console.log("Toggling sidebar");
    setFriendUsername("");
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when selecting a chat on mobile
  const selectFriend = (username) => {
    let privateChatId = "private-chat" + currentUser + "-" + username;
    // try {
    //   const response = await axios.get(
    //     "http://localhost:8080/private/chat/get/" + privateChatId
    //   );
    //   console.log("Private chat exists:", response.data);
    // } catch (error) {
    //   console.log(error);
    // }
    setGroupName("");
    setShowGroupChats(false);
    setIsGroupMode(false);
    setCurrentGroupId("");

    const color = getRandomColor();
    setFriendColors(color);

    console.log("Selecting friend:", username);
    setFriendUsername(username);
    console.log(friendUsernameRef.current);
    resetUnreadCount(username);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const addFriend = () => {
    if (!isConnected || !stompClientRef.current || connectionError) {
      addNotification(
        "Can't perform action - No connection to server",
        "error"
      );
      return;
    }
    setShowGroupLoader(true);
    if (!newFriendUsername.trim()) return;

    if (newFriendUsername.length > 10) {
      Swal.fire({
        title: "Error!",
        text: "Username too long. Max 10 characters.",
        icon: "error",
        confirmButtonText: "Cool",
      });
      setShowGroupLoader(false);
      setNewFriendUsername("");
      return;
    }
    if (newFriendUsername.toLowerCase() === currentUser.toLowerCase()) {
      Swal.fire({
        title: "Error!",
        text: "you can't add yourself.",
        icon: "error",
        confirmButtonText: "Cool",
      });
      setShowGroupLoader(false);
      setNewFriendUsername("");
      return;
    }

    // Check for duplicates (case insensitive)
    const friendExists = friends.some(
      (friend) =>
        friend.username.toLowerCase() === newFriendUsername.toLowerCase()
    );

    if (friendExists) {
      console.log("friend exists");
      addNotification("Friend already exists!");
      setNewFriendUsername("");
      setShowGroupLoader(false);
      return;
    }

    const newFriend = {
      id: Date.now().toString(),
      username: newFriendUsername,
      friendName: newFriendUsername,
      selfName: currentUser,
      online: true,
      type: "add",
      unread: 0,
    };

    stompClientRef.current.publish({
      destination: "/app/friend/add",
      body: JSON.stringify(newFriend),
    });

    // setFriends((prev) => [...prev, newFriend]);
    console.log("Added friend:", newFriend);

    // setFriends((prev) => {
    //   const updatedFriends = [...prev, newFriend];
    //   console.log("Updated friends list:", updatedFriends); // This will show correct data
    //   return updatedFriends;
    // });

    console.log(friends);
    // setNewFriendUsername("");

    // setFriendUsername(newFriendUsername);
    // setShowGroupLoader(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (currentUser.trim().length > 10) {
      Swal.fire({
        title: "Error!",
        text: "Name too long. Max 10 characters.",
        icon: "error",
        confirmButtonText: "Cool",
      });
      setCurrentUser("");
      return;
    }
    console.log(showGroupLoader);
    if (currentUser.trim()) {
      setIsAuthenticated(true);
      connectWebSocket();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (date === "Invalid Date") return "";
    return date;
  };

  // Login Screen

  if (!isAuthenticated) {
    return (
      <div className="minimal-auth">
        <div className="auth-container">
          <div className="auth-card">
            <div className="logo-section">
              <div className="auth-animation-wrapper">
                {authAnimation ? (
                  <Lottie
                    lottieRef={authLottieRef}
                    animationData={authAnimation}
                    loop={true}
                    autoplay={true}
                    style={{
                      width: "220px",
                      height: "220px",
                    }}
                  />
                ) : (
                  <div className="fallback-icon">💬</div>
                )}
              </div>

              <h1>Messenger</h1>
              <p>Simple, fast, secure messaging</p>
            </div>

            {/* ... rest of your form ... */}
            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary login-btn">
                Continue
              </button>
            </form>

            <div className="auth-footer">
              <p>By continuing, you agree to our Terms & Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messenger-app">
      {/* Connection Status Indicator */}
      {/* {isAuthenticated && (
        <div
          className={`connection-status-indicator ${
            connectionError
              ? "error"
              : isReconnecting
              ? "connecting"
              : isConnected
              ? "connected"
              : "disconnected"
          }`}
        >
          <span className="status-icon">
            {connectionError
              ? "⚠️"
              : isReconnecting
              ? "🔄"
              : isConnected
              ? "✅"
              : "❌"}
          </span>
          <span className="status-text">
            {connectionError
              ? "Disconnected"
              : isReconnecting
              ? "Reconnecting..."
              : isConnected
              ? "Connected"
              : "Connecting..."}
          </span>
          {connectionError && !isReconnecting && (
            <button
              className="btn btn-sm btn-outline-primary retry-btn-small ms-2"
              onClick={manualRetryConnection}
            >
              Retry
            </button>
          )}
        </div>
      )} */}

      {/* Connection Error Modal */}
      <ConnectionErrorModal
        isOpen={connectionError && retryCount >= maxRetries}
        onClose={() => setConnectionError(false)}
        onRetry={manualRetryConnection}
        errorMessage={lastError}
        retryCount={retryCount}
        maxRetries={maxRetries}
        isReconnecting={isReconnecting}
      />

      <BusyFingerAnimationLoader
        show={showGroupLoader}
        subtitle="Please wait..."
      />

      <div className="notification-stack">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="notification-item"
            style={{
              top: `${20 + index * 120}px`, // Stack them vertically
              left: "50%", // Center horizontally
              transform: "translateX(-50%)", // Center adjustment
              zIndex: 9998 - index,
            }}
          >
            <BellNotification
              message={notification.message}
              type={notification.type}
              show={notification.show}
              onClose={() => removeNotification(notification.id)}
              duration={4000}
              showCount={notifications.length > 1}
              count={notifications.length}
            />
          </div>
        ))}
      </div>

      {/* <BellNotification2 show={true} message="You have a new message!" textPosition="right" /> */}

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Add the active class to your existing sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <div className="sidebar-header bg-info-subtle">
          <div className="user-info">
            <div className="user-avatar">
              {/* <span>{currentUser.charAt(0).toUpperCase()}</span> */}
              <span>
                <UserAvatar
                  letter={currentUser.charAt(0).toUpperCase()}
                  name={currentUser}
                  size={82}
                  isOnline={isConnected ? true : false}
                  backgroundColor={getRandomColor()} // Your existing function
                />
              </span>
            </div>
            <div className="user-details">
              <h3 className="fs-4 mx-1">{currentUser}</h3>
              {/* <span
                className={`fs-6 status ${isConnected ? "online" : "offline"}`}
              >
                {isConnected ? "Online" : "Offline"}
              </span> */}
              {/* {isAuthenticated && (
                <div
                  className={`connection-status-indicator ${
                    connectionError
                      ? "error"
                      : isReconnecting
                      ? "connecting"
                      : isConnected
                      ? "connected"
                      : "disconnected"
                  }`}
                >
                  <span className="status-icon">
                    {connectionError
                      ? "⚠️"
                      : isReconnecting
                      ? "🔄"
                      : isConnected
                      ? "✅"
                      : "❌"}
                  </span>
                  <span className="status-text">
                    {connectionError
                      ? "Disconnected"
                      : isReconnecting
                      ? "Reconnecting..."
                      : isConnected
                      ? "Connected"
                      : "Connecting..."}
                  </span>
                  {connectionError && !isReconnecting && (
                    <button
                      className="btn btn-sm btn-outline-primary retry-btn-small ms-2"
                      onClick={manualRetryConnection}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )} */}
              {isAuthenticated && (
                <div className="connection-status-indicator">
                  <div className="status-animation">
                    {isConnected && !connectionError ? (
                      // Connected animation
                      <Lottie
                        animationData={require("./assets/lottie/gear.json")}
                        loop={true}
                        autoplay={true}
                        style={{ width: "32px", height: "32px" }}
                      />
                    ) : connectionError ? (
                      // Error animation
                      <Lottie
                        animationData={require("./assets/lottie/notconnected.json")}
                        loop={true}
                        autoplay={true}
                        style={{ width: "32px", height: "32px" }}
                      />
                    ) : (
                      // Connecting/Reconnecting animation
                      <Lottie
                        animationData={require("./assets/lottie/Retry.json")}
                        loop={true}
                        autoplay={true}
                        style={{ width: "32px", height: "32px" }}
                      />
                    )}
                  </div>

                  <span className="status-text">
                    {connectionError
                      ? "Disconnected"
                      : isReconnecting
                      ? "Reconnecting..."
                      : isConnected
                      ? "Connected"
                      : "Connecting..."}
                  </span>

                  {connectionError && !isReconnecting && (
                    <button
                      className="btn btn-sm btn-outline-primary retry-btn"
                      onClick={manualRetryConnection}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-header-actions d-flex justify-content-end">
            {/*<button
              className="btn btn-outline-primary new-chat-btn"
              data-bs-toggle="modal"
              data-bs-target="#addFriendModal"
              title="New chat"
            >
              <i className="bi bi-person-fill-add text-dark"></i>
            </button> */}

            {/* Mobile Close Button - Only show on mobile */}
            {/* <button
              className="btn btn-outline-primary sidebar-close-btn w-5 h-5"
              onClick={toggleSidebar}
              title="Close sidebar"
            >
              <i className="bi bi-x-square-fill text-dark"></i>
            </button> */}
          </div>
        </div>
        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${!showGroupChats ? "active" : ""}`}
            onClick={() => toggleChatMode("1-1")}
          >
            {/* <i className="bi bi-people text-dark"></i>  */}
            Friends
          </button>
          <button
            className={`tab-btn ${showGroupChats ? "active" : ""}`}
            onClick={() => toggleChatMode("group")}
          >
            {/* <i className="bi bi-chat-dots text-dark"></i>  */}
            Groups
          </button>
          {!showGroupChats ? (
            // Show "Add Friend" button when in Friends tab
            <button
              className="btn btn-outline-primary new-chat-btn"
              data-bs-toggle="modal"
              data-bs-target="#addFriendModal"
              title="New chat"
            >
              <i className="bi bi-person-fill-add text-dark"></i>
            </button>
          ) : (
            // Show "Create Group" button when in Groups tab
            <button
              className="btn btn-outline-primary new-chat-btn"
              data-bs-toggle="modal"
              data-bs-target="#createGroupModal"
              title="Create Group"
            >
              <i className="bi bi-people-fill text-dark"></i>
            </button>
          )}
          {window.innerWidth <= 768 && (
            <button
              className="btn btn-outline-primary sidebar-close-btn w-5 h-5"
              onClick={toggleSidebar}
              title="Close sidebar"
            >
              <i className="bi bi-x-square-fill text-dark"></i>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-box">
            <i className="bi bi-search text-dark"></i>
            <input
              type="text"
              placeholder={showGroupChats ? "Search Groups" : "Search Friends"}
              className="form-control search-input text-dark"
              value={!showGroupChats ? searchQuery : groupSearchQuery}
              onChange={(e) =>
                handleSearch(!showGroupChats ? "friends" : "groups", e)
              }
            />
          </div>
        </div>

        {/* Conditional rendering of Friends or Groups list */}
        {showGroupChats ? (
          /* Groups List */
          <div className="chats-list">
            {filteredGroups.map((group) => {
              const groupStreamKey = `group:chat:${group.name}`;
              const remainingSeconds = expiringChats[groupStreamKey];

              return (
                <div
                  key={group.id}
                  className={`chat-item ${
                    currentGroupId === group.id ? "active" : ""
                  }`}
                  onClick={() => selectGroup(group.id, group.name)}
                  data-chat-key={groupStreamKey}
                >
                  <div className="me-2">
                    <GroupAvatar
                      letter={group.name.charAt(0).toUpperCase() || "r"}
                      name={group.name || "r"}
                      size={62}
                      backgroundColor={getRandomColor()}
                      onClick={() =>
                        selectGroup(group.id || "r", group.name || "r")
                      }
                    />
                  </div>
                  <div className="chat-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4>{group.name}</h4>
                      {/* {remainingSeconds !== undefined &&
                        remainingSeconds > 0 && (
                          <span className="expiry-countdown">
                            ⏰ {formatCountdown(remainingSeconds)}
                          </span>
                        )} */}
                      {(() => {
                        let streamKey = "";
                        if (isGroupMode && currentGroupId) {
                          const groupName = groups.find(
                            (g) => g.id === currentGroupId
                          )?.name;
                          streamKey = `group:chat:${groupName}`;
                        }
                        const remainingSeconds = expiringChats[groupStreamKey];

                        if (
                          remainingSeconds !== undefined &&
                          remainingSeconds > 0
                        ) {
                          return (
                            <span className="header-expiry-countdown ms-2">
                              ⏰ {formatCountdown(remainingSeconds)}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="chat-preview">
                      <small className="text-muted">
                        {group.groupMembers?.length || 0} members •
                        {group.admin === currentUser
                          ? " You are admin"
                          : ` Admin: ${group.admin}`}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chats-list">
            {filteredFriends.map((friend) => {
              // const friendStreamKey = `private-chat${currentUser}-${friend.username}`;
              // const remainingSeconds = expiringChats[friendStreamKey];

              const friendStreamKey1 = `private-chat${currentUser}-${friend.username}`;
              const friendStreamKey2 = `private-chat${currentUser.toLowerCase()}-${friend.username.toLowerCase()}`;
              const friendStreamKey3 = `private-chat${currentUser}-${friend.username.toLowerCase()}`;

              // Try to find any matching streamKey in expiringChats
              const streamKeys = Object.keys(expiringChats);
              const matchingKey = streamKeys.find(
                (key) =>
                  key.includes(currentUser.toLowerCase()) &&
                  key.includes(friend.username.toLowerCase())
              );

              const remainingSeconds = matchingKey
                ? expiringChats[matchingKey]
                : undefined;

              return (
                <div
                  key={friend.id}
                  className={`chat-item ${
                    friendUsername === friend.username ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      friendUsername === friend.username
                        ? friendColors
                        : "transparent",
                    borderLeft: `4px solid ${friendColors}`,
                    transition: "background-color 0.3s ease",
                  }}
                  data-chat-key={friendStreamKey1}
                >
                  <div className="chat-avatar me-2">
                    <GoldenFrameAvatar
                      letter={friend.friendName.charAt(0).toUpperCase()}
                      name={friend.friendName}
                      size={62}
                      backgroundColor={getRandomColor()}
                      isOnline={friend.online}
                      onClick={() => selectFriend(friend.username)}
                    />
                  </div>

                  <div
                    className="chat-info ms-3"
                    onClick={() => {
                      selectFriend(friend.username);
                      if (window.innerWidth <= 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h4>{friend.friendName}</h4>
                      {remainingSeconds !== undefined &&
                        remainingSeconds > 0 && (
                          <span className="expiry-countdown mx-1">
                            ⏰ {formatCountdown(remainingSeconds)}
                          </span>
                        )}
                    </div>
                    <div className="chat-preview">
                      {chatHistory[friend.username]?.length > 0 && (
                        <i
                          className={`m-1 ${
                            chatHistory[friend.username]?.[
                              chatHistory[friend.username]?.length - 1
                            ]?.sender === currentUser
                              ? "bi bi-chat-left-text-fill"
                              : "bi bi-chat-right-text-fill"
                          }`}
                        ></i>
                      )}
                      <p className="m-1 fs-6 text-dark">
                        {chatHistory[friend.username]?.[
                          chatHistory[friend.username]?.length - 1
                        ]?.content || "no messages"}
                      </p>
                      {friend.unread > 0 && (
                        <span className="unread-badge mx-2">
                          {friend.unread}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-column">
                    <span className="time fs-6 text-dark">
                      {formatTime(
                        chatHistory[friend.username]?.[
                          chatHistory[friend.username]?.length - 1
                        ]?.timestamp
                      ) || "hh:mm"}
                    </span>

                    <button
                      className="btn btn-outline-danger action-btn"
                      onClick={() => removeFriend(friend.username)}
                      title="Remove Friend"
                    >
                      <i className="bi bi-person-x-fill"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {/* Mobile Header */}

        {friendUsername || currentGroupId ? (
          // <>
          //   <div
          //     className="navbar navbar-light mobile-header d-lg-none"
          //     style={{ backgroundColor: getRandomColor() }}
          //   >
          //     <div className="d-flex justify-content-between">
          //       <button
          //         className="mobile-menu-btn text-bold m-1"
          //         onClick={toggleSidebar}
          //       >
          //         <i className="bi bi-arrow-left text-dark"></i>{" "}
          //         {/* Changed to hamburger icon */}
          //       </button>

          //       {/* icon part */}
          //       {friendUsername ? (
          //         <div className="mt-2">
          //           {/* <span>{friendUsername.charAt(0).toUpperCase()}</span> */}
          //           <span>
          //             <GoldenFrameAvatar
          //               letter={friendUsername.charAt(0).toUpperCase()}
          //               name={friendUsername}
          //               size={62}
          //               backgroundColor={getRandomColor()} // Your existing function
          //               isOnline={true}
          //               onClick={() => selectFriend(friendUsername)}
          //             />
          //           </span>
          //         </div>
          //       ) : (
          //         <div className="m-3">
          //           {/* <span>
          //             <i className="bi bi-people-fill"></i>
          //           </span> */}
          //           <span>
          //             <GroupAvatar
          //               letter={
          //                 groups
          //                   .find((g) => g.id === currentGroupId)
          //                   ?.name.charAt(0)
          //                   .toUpperCase() || "g"
          //               }
          //               name={
          //                 groups.find((g) => g.id === currentGroupId)?.name ||
          //                 "g"
          //               }
          //               size={62}
          //               backgroundColor={getRandomColor()} // Your existing function
          //               onClick={() => null}
          //             />
          //           </span>
          //         </div>
          //       )}

          //       {/* name and details */}
          //       <div className="partner-details m-3">
          //         <h5 className="text-bold m-0 fs-4 text-dark">
          //           {/* {friendUsername || "Select a chat"} */}
          //           {isGroupMode
          //             ? groups.find((g) => g.id === currentGroupId)?.name ||
          //               "Group"
          //             : friendUsername}
          //         </h5>
          //         {/* Add countdown next to chat name */}
          //         {/* {(() => {
          //           let streamKey = "";
          //           if (isGroupMode && currentGroupId) {
          //             const groupName = groups.find(
          //               (g) => g.id === currentGroupId
          //             )?.name;
          //             streamKey = `group:chat:${groupName}`;
          //           } else if (friendUsername) {
          //             streamKey = `private-chat${currentUser.toLowerCase()}-${friendUsername.toLowerCase()}`;
          //           }

          //           const remainingSeconds = expiringChats[streamKey];

          //           if (
          //             remainingSeconds !== undefined &&
          //             remainingSeconds > 0
          //           ) {
          //             return (
          //               <span className="header-expiry-countdown ms-2">
          //                 ⏰ {formatCountdown(remainingSeconds)}
          //               </span>
          //             );
          //           }
          //           return null;
          //         })()} */}
          //         <span className="status text-dark">
          //           {/* {friendUsername ? "Online" : "Choose a friend to chat"} */}
          //           {isGroupMode
          //             ? `${
          //                 groups.find((g) => g.id === currentGroupId)
          //                   ?.groupMembers?.length || 0
          //               } members`
          //             : "Online"}
          //         </span>
          //       </div>
          //       <div>
          //         {(() => {
          //           let streamKey = "";
          //           if (isGroupMode && currentGroupId) {
          //             const groupName = groups.find(
          //               (g) => g.id === currentGroupId
          //             )?.name;
          //             streamKey = `group:chat:${groupName}`;
          //           } else if (friendUsername) {
          //             streamKey = `private-chat${currentUser.toLowerCase()}-${friendUsername.toLowerCase()}`;
          //           }

          //           const remainingSeconds = expiringChats[streamKey];

          //           if (
          //             remainingSeconds !== undefined &&
          //             remainingSeconds > 0
          //           ) {
          //             return (
          //               <span className="header-expiry-countdown ms-2">
          //                 ⏰ {formatCountdown(remainingSeconds)}
          //               </span>
          //             );
          //           }
          //           return null;
          //         })()}
          //       </div>
          //     </div>

          //     <div className="dropdown">
          //       <Dropdown>
          //         <Dropdown.Toggle
          //           style={{ color: getRandomColor() }}
          //           variant="info"
          //           id="dropdown-basic"
          //         >
          //           <i className="bi bi-three-dots"></i>
          //         </Dropdown.Toggle>

          //         <Dropdown.Menu align="end">
          //           <Dropdown.Item
          //             as="button"
          //             className="text-danger"
          //             onClick={() =>
          //               friendUsername
          //                 ? removeFriend(friendUsername)
          //                 : leaveGroup(currentGroupId, currentUser)
          //             }
          //           >
          //             {friendUsername ? (
          //               <>
          //                 <i className="bi bi-person-x-fill"></i> Remove Friend
          //               </>
          //             ) : (
          //               <>
          //                 <i className="bi bi-people-fill"></i> Leave Group
          //               </>
          //             )}
          //           </Dropdown.Item>

          //           {/* <Dropdown.Divider /> */}

          //           {(friendUsername &&
          //             chatHistory[friendUsername]?.length > 0) ||
          //             (isGroupMode && chatHistory[groupName]?.length > 0 && (
          //               <Dropdown.Item
          //                 as="button"
          //                 className="text-danger"
          //                 onClick={() =>
          //                   friendUsername
          //                     ? clearChat(friendUsername)
          //                     : clearChat(groupName)
          //                 }
          //               >
          //                 <i className="bi bi-trash"></i> Clear Chat
          //               </Dropdown.Item>
          //             ))}
          //         </Dropdown.Menu>
          //       </Dropdown>
          //     </div>
          //   </div>
          // </>
          <div
            className="navbar navbar-light mobile-header d-lg-none"
            style={{ backgroundColor: getRandomColor() }}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              {/* Left side: Menu button */}
              <div className="d-flex align-items-center">
                <button
                  className="mobile-menu-btn text-bold m-1"
                  onClick={toggleSidebar}
                >
                  <i className="bi bi-arrow-left text-dark"></i>
                </button>
              </div>

              {/* Center: Avatar and details */}
              <div className="d-flex flex-column align-items-center flex-grow-1 mx-2">
                <div className="d-flex align-items-center justify-content-center">
                  {/* Avatar */}
                  {friendUsername ? (
                    <div className="me-2">
                      <GoldenFrameAvatar
                        letter={friendUsername.charAt(0).toUpperCase()}
                        name={friendUsername}
                        size={42}
                        backgroundColor={getRandomColor()}
                        isOnline={true}
                        onClick={() => selectFriend(friendUsername)}
                      />
                    </div>
                  ) : (
                    <div className="me-2">
                      <GroupAvatar
                        letter={
                          groups
                            .find((g) => g.id === currentGroupId)
                            ?.name.charAt(0)
                            .toUpperCase() || "G"
                        }
                        name={
                          groups.find((g) => g.id === currentGroupId)?.name ||
                          "Group"
                        }
                        size={42}
                        backgroundColor={getRandomColor()}
                        onClick={() => null}
                      />
                    </div>
                  )}

                  {/* Name, status and countdown in a column */}
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center">
                      <h5 className="text-bold m-0 fs-6 text-dark">
                        {isGroupMode
                          ? groups.find((g) => g.id === currentGroupId)?.name ||
                            "Group"
                          : friendUsername || "Select a chat"}
                      </h5>

                      {/* Countdown displayed inline with name */}
                      {(() => {
                        let streamKey = "";
                        if (isGroupMode && currentGroupId) {
                          const groupName = groups.find(
                            (g) => g.id === currentGroupId
                          )?.name;
                          streamKey = `group:chat:${groupName}`;
                        } else if (friendUsername) {
                          streamKey = `private-chat${currentUser.toLowerCase()}-${friendUsername.toLowerCase()}`;
                        }

                        const remainingSeconds = expiringChats[streamKey];

                        if (
                          remainingSeconds !== undefined &&
                          remainingSeconds > 0
                        ) {
                          return (
                            <span className="header-expiry-countdown ms-2 text-nowrap">
                              ⏰ {formatCountdown(remainingSeconds)}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <span className="status text-dark text-start">
                      {isGroupMode
                        ? `${
                            groups.find((g) => g.id === currentGroupId)
                              ?.groupMembers?.length || 0
                          } members`
                        : friendUsername
                        ? "Online"
                        : "Choose a friend to chat"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Dropdown - always in fixed position */}
              <div className="dropdown" style={{ minWidth: "40px" }}>
                <Dropdown>
                  <Dropdown.Toggle
                    style={{ color: getRandomColor() }}
                    variant="info"
                    id="dropdown-basic"
                    className="p-1"
                  >
                    <i className="bi bi-three-dots"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end">
                    <Dropdown.Item
                      as="button"
                      className="text-danger"
                      onClick={() =>
                        friendUsername
                          ? removeFriend(friendUsername)
                          : leaveGroup(currentGroupId, currentUser)
                      }
                    >
                      {friendUsername ? (
                        <>
                          <i className="bi bi-person-x-fill"></i> Remove Friend
                        </>
                      ) : (
                        <>
                          <i className="bi bi-people-fill"></i> Leave Group
                        </>
                      )}
                    </Dropdown.Item>

                    {(friendUsername &&
                      chatHistory[friendUsername]?.length > 0) ||
                      (isGroupMode && chatHistory[groupName]?.length > 0 && (
                        <Dropdown.Item
                          as="button"
                          className="text-danger"
                          onClick={() =>
                            friendUsername
                              ? clearChat(friendUsername)
                              : clearChat(groupName)
                          }
                        >
                          <i className="bi bi-trash"></i> Clear Chat
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">💬</div>
                <h2>Your Messages</h2>
                <p>Send private messages to a friend or group</p>
                <button
                  className="btn btn-primary start-chat-btn"
                  // data-bs-toggle="modal"
                  // data-bs-target="#addFriendModal"
                  onClick={() =>
                    window.innerWidth <= 768
                      ? setIsSidebarOpen(true)
                      : addNotification(
                          "please add a friend or group to start chatting"
                        )
                  }
                >
                  <i className="bi bi-person-fill-add"></i>
                  Start a new chat
                </button>
              </div>
            </div> */}
          </>
        )}

        {/* Chat Header */}
        {friendUsername || currentGroupId ? (
          <>
            <div className="chat-header">
              <div className="chat-partner-info">
                <div>
                  {isGroupMode ? (
                    <span>
                      <GroupAvatar
                        letter={
                          groups
                            .find((g) => g.id === currentGroupId)
                            ?.name.charAt(0)
                            .toUpperCase() || "r"
                        }
                        name={
                          groups.find((g) => g.id === currentGroupId)?.name ||
                          "r"
                        }
                        size={62}
                        backgroundColor={getRandomColor()} // Your existing function
                        onClick={() => null}
                      />
                    </span>
                  ) : (
                    // <span>{friendUsername.charAt(0).toUpperCase()}</span>
                    <span>
                      <GoldenFrameAvatar
                        letter={friendUsername.charAt(0).toUpperCase()}
                        name={friendUsername}
                        size={62}
                        backgroundColor={getRandomColor()} // Your existing function
                        isOnline={true}
                        onClick={() => selectFriend(friendUsername)}
                      />
                    </span>
                  )}
                </div>

                <div className="partner-details">
                  <h3 className="fs-4 text-dark">
                    {isGroupMode
                      ? groups.find((g) => g.id === currentGroupId)?.name ||
                        "Group"
                      : friendUsername}
                  </h3>
                  {/* Add countdown next to chat name */}
                  <span
                    className="status text-dark fs-6 clickable-members"
                    onClick={isGroupMode ? showGroupMembers : undefined}
                    style={{
                      cursor: isGroupMode ? "pointer" : "default",
                      textDecoration: isGroupMode ? "underline" : "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (isGroupMode) {
                        e.currentTarget.style.color = "#007bff";
                        e.currentTarget.style.textDecoration = "underline";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isGroupMode) {
                        e.currentTarget.style.color = "";
                        e.currentTarget.style.textDecoration = "underline";
                      }
                    }}
                  >
                    {isGroupMode
                      ? `${
                          groups.find((g) => g.id === currentGroupId)
                            ?.groupMembers?.length || 0
                        } members`
                      : "Online"}
                  </span>
                </div>
              </div>

              <div className="chat-actions">
                <button
                  className="btn btn-outline-danger action-btn"
                  onClick={() =>
                    friendUsername
                      ? clearChat(friendUsername)
                      : clearChat(groupName)
                  }
                  title="Clear this chat"
                  disabled={
                    friendUsername
                      ? !chatHistory[friendUsername]?.length
                      : !chatHistory[groupName]?.length
                  }
                >
                  <i className="bi bi-trash"></i>
                </button>

                <button
                  className="btn btn-outline-danger action-btn"
                  onClick={() =>
                    friendUsername
                      ? removeFriend(friendUsername)
                      : leaveGroup(currentGroupId, currentUser)
                  }
                  title={currentGroupId ? "Leave Group" : "Remove Friend"}
                >
                  <i className="bi bi-person-x-fill"></i>
                </button>
                <div className="mt-1">
                  {(() => {
                    let streamKey = "";
                    if (isGroupMode && currentGroupId) {
                      const groupName = groups.find(
                        (g) => g.id === currentGroupId
                      )?.name;
                      streamKey = `group:chat:${groupName}`;
                    } else if (friendUsername) {
                      streamKey = `private-chat${currentUser.toLowerCase()}-${friendUsername.toLowerCase()}`;
                    }

                    const remainingSeconds = expiringChats[streamKey];

                    if (
                      remainingSeconds !== undefined &&
                      remainingSeconds > 0
                    ) {
                      return (
                        <span className="header-expiry-countdown ms-2">
                          ⏰ {formatCountdown(remainingSeconds)}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              <div className="messages-background">
                <RotatingComponent />
              </div>
              {(isGroupMode
                ? chatHistory[groupName]
                : chatHistory[friendUsername]
              )?.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-icon">💬</div>
                  <h3>No messages yet</h3>
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                (isGroupMode
                  ? chatHistory[groupName]
                  : chatHistory[friendUsername]
                )?.map((msg) => (
                  <div
                    key={msg.groupId || msg.id}
                    className={`message ${
                      msg.type === "SENT" ? "sent" : "received"
                    }`}
                  >
                    {isGroupMode && msg.sender !== currentUser && (
                      <div className="message-sender">{msg.sender}</div>
                    )}
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {/* onChange={() => {
                        if (message.trim() && sendLottieRef.current) {
                          sendLottieRef.current.play();
                        }
                      }} */}
            <div className="message-input-container">
              <div className="input-wrapper">
                <div className="text-input-container">
                  <textarea
                    className="form-control message-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                    onKeyUp={handleKeyPress}
                    rows="1"
                  />
                </div>

                {/* <button
                  className="btn btn-primary send-btn mb-1"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  <i className="bi bi-send"></i>
                </button> */}
                <button
                  className="send-lottie-btn-inline"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    padding: "0",
                    border: "none",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {sendAnimation ? (
                    <Lottie
                      lottieRef={sendLottieRef}
                      animationData={sendAnimation}
                      loop={true}
                      autoplay={true}
                      style={{
                        width: "40px",
                        height: "40px",
                        filter: !message.trim()
                          ? "grayscale(100%) opacity(0.5)"
                          : "none",
                      }}
                    />
                  ) : (
                    <i className="bi bi-send fs-5"></i>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Welcome Screen
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">💬</div>
              <h2>Your Messages</h2>
              <p>Send private messages to a friend or group</p>
              <button
                className="btn btn-primary start-chat-btn"
                // data-bs-toggle="modal"
                // data-bs-target="#addFriendModal"
                onClick={() =>
                  window.innerWidth <= 768
                    ? setIsSidebarOpen(true)
                    : addNotification(
                        "please add a friend or group to start chatting"
                      )
                }
              >
                <i className="bi bi-person-fill-add"></i>
                Start a new chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add friend Bootstrap 5 Modal */}
      <div
        className="modal fade"
        id="addFriendModal"
        tabIndex="-1"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Friend</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={() => setShowGroupLoader(false)}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="friendUsername" className="form-label">
                  Friend's Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="friendUsername"
                  placeholder="Enter username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addFriend}
                disabled={!newFriendUsername.trim()}
                data-bs-dismiss="modal"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {/* <div className="modal fade" id="createGroupModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create New Group</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Add Members (from your friends)
                </label>
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Type friend username"
                    value={newGroupMember}
                    onChange={(e) => setNewGroupMember(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      if (
                        newGroupMember.trim() &&
                        !selectedGroupMembers.includes(newGroupMember.trim())
                      ) {
                        setSelectedGroupMembers([
                          ...selectedGroupMembers,
                          newGroupMember.trim(),
                        ]);
                        setNewGroupMember("");
                      }
                    }}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                {selectedGroupMembers.length > 0 && (
                  <div className="selected-members mt-2">
                    <small className="text-muted">Selected members:</small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {selectedGroupMembers.map((member, index) => (
                        <span key={index} className="badge bg-primary">
                          {member}
                          <button
                            className="btn-close btn-close-white btn-sm ms-1"
                            onClick={() =>
                              setSelectedGroupMembers(
                                selectedGroupMembers.filter((m) => m !== member)
                              )
                            }
                          ></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={createGroup}
                disabled={!groupName.trim()}
                data-bs-dismiss="modal"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
        <div className="modal-content">
            <div className="modal-header">
      </div> */}

      <div className="modal fade" id="createGroupModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title fw-semibold">Manage Groups</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={() => setShowGroupLoader(false)}
              ></button>
            </div>

            {/* TABS */}
            <div className="px-3 pt-2">
              <ul className="nav nav-pills nav-fill group-tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className="nav-link active text-dark"
                    data-bs-toggle="tab"
                    data-bs-target="#create-tab-pane"
                    type="button"
                  >
                    <i className="bi bi-plus-circle me-1 text-dark"></i> Create
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link text-dark"
                    data-bs-toggle="tab"
                    data-bs-target="#join-tab-pane"
                    type="button"
                  >
                    <i className="bi bi-box-arrow-in-right me-1 text-dark"></i>{" "}
                    Join
                  </button>
                </li>
              </ul>
            </div>

            {/* BODY */}
            <div className="modal-body pt-4">
              <div className="tab-content">
                {/* CREATE GROUP */}
                <div className="tab-pane fade show active" id="create-tab-pane">
                  <div className="mb-3">
                    <label className="form-label">Group Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter group name"
                        value={inputGroupName}
                        onChange={(e) => setInputGroupName(e.target.value)}
                      />
                    </div>
                    <small className="text-muted d-block mt-1">
                      Group names are case sensitive
                    </small>
                  </div>

                  <button
                    className="btn btn-primary w-100"
                    onClick={createGroup}
                    disabled={!inputGroupName.trim()}
                    data-bs-dismiss="modal"
                  >
                    <i className="bi bi-check-circle me-1"></i> Create Group
                  </button>
                </div>

                {/* JOIN GROUP */}
                <div className="tab-pane fade" id="join-tab-pane">
                  <div className="mb-3">
                    <label className="form-label">Group Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control mx-2"
                        placeholder="Enter group name"
                        value={inputGroupName}
                        onChange={(e) => setInputGroupName(e.target.value)}
                      />
                      {/* <button
                        className="btn btn-outline-secondary"
                        onClick={generateRandomInviteCode}
                      >
                        <i className="bi bi-chevron-compact-right text-dark"></i>
                      </button> */}
                    </div>
                    <small className="text-muted d-block mt-1">
                      Group names are case sensitive
                    </small>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={joinGroup}
                    disabled={!inputGroupName.trim()}
                    data-bs-dismiss="modal"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Join Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          zIndex: 9999,
        }}
      />
      {/* )} */}

      <GroupMembersModal
        show={showMembersModal}
        onHide={() => setShowMembersModal(false)}
        members={currentGroupMembers}
        admin={currentGroupAdmin}
        groupName={groups.find((g) => g.id === currentGroupId)?.name || ""}
        currentUser={currentUser}
        onRemoveMember={null}
        isCurrentUserAdmin={currentGroupAdmin === currentUser}
      />
    </div>
  );
};
export default ChatApp;
