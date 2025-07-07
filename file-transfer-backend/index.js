const emailToSocketMap = {};

io.on("connection", (socket) => {
  const userEmail = socket.handshake.query.email;
  console.log(`👤 ${userEmail} connected`);

  if (userEmail) {
    emailToSocketMap[userEmail] = socket.id;
  }

  socket.on("send-file", ({ name, buffer, to }) => {
    const receiverSocketId = emailToSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-file", { name, buffer });
      console.log(`📤 Sent file "${name}" to ${to}`);
    } else {
      console.log(`❌ Could not find socket for: ${to}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${userEmail} disconnected`);
    delete emailToSocketMap[userEmail];
  });
});
