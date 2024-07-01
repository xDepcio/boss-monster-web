import { getIo } from "../app.js";


const io = getIo()
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    });

    socket.on('test', (data) => {
        console.log("SOCKET:", data)
        socket.emit('xd', { data: 1 })
    })
});

export { }
