import { io } from "socket.io-client";

// ✅ Use sessionStorage to avoid user info conflict across tabs
const userEmail = sessionStorage.getItem("user");

// 🌐 Replace with your actual backend URL on Render
const socket = io("https://your-backend-name.onrender.com", {
  query: { email: userEmail },
});

export default socket;
