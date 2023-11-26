const SocketIOServer = require("socket.io").Server;

const initSocketServer = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("notification", (data) => {
            io.emit("newNotification", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });

    io.on("connect_error", (err) => {
        console.error(`connect_error due to ${err.message}`);
    });
};

module.exports = { initSocketServer };
