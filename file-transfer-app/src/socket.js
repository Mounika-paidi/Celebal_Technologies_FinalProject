import { io } from "socket.io-client";

const userEmail = localStorage.getItem("user");

// ✅ Use Render live backend URL
const socket = io("https://your-backend-service-name.onrender.com", {
  query: { email: userEmail },
});

export default socket;
