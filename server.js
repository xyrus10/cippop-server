var express = require('express')
var app = express()
var http = require('http').createServer(app);
app.use(express.static('public'));

http.listen(process.env.PORT || 6996, function () {
    var host = http.address().address
    var port = http.address().port
    console.log(`App listening at http://${host}:${port}`)
});

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

const io = require("socket.io")(http, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }
});

clientList = []

io.on("connection", socket => {

    socket.on('connected', () => {
        console.log(`User Connected`)
        clientList[socket.id] = {
            username: socket.id, 
            score: 0
        }
        console.log(clientList)
        io.emit("userListUpdate", clientList)
    })

    socket.on('pencet', () => {
        // console.log("pencet");
        const score = clientList[socket.id].score + 1
        clientList[socket.id].score = score
        io.to(socket.id).emit('hello', score)
    })

    socket.on("disconnect", (reason) => {
        console.log("user leave", reason, clientList[socket.id])
        let flag = 0
        // Object.keys(clientList).forEach(item => {
        //     if (clientList[item].username == socket.id) flag = item;
        // })
        console.log(flag)
        clientListTampung = clientList

        clientList.splice(flag, 1)
        io.emit("userListUpdate", clientList)
    })

})