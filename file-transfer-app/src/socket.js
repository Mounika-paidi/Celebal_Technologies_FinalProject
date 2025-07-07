import { io } from "socket.io-client";

const userEmail = localStorage.getItem("user");

const socket = io("http://localhost:5000", {
  query: { email: userEmail }, // send email on connect
});

export default socket;
