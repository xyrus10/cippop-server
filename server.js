const express = require('express')
const app = express()
const http = require('http').createServer(app);
app.use(express.static('public'));

var data = "do shash'owania";
var crypto = require('crypto');
crypto.createHash('md5').update(data).digest("hex");

http.listen(process.env.PORT || 6996, function () {
    var host = http.address().address
    var port = http.address().port
    console.log(`App listening at http://${host}:${port}`)
});

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

function md5(text, loop = 1) {
    var crypto = require('crypto');
    return crypto.createHash('md5').update(text).digest("hex");
}

const io = require("socket.io")(http, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }
});

clientList = []

function getPlayerList(array) {
    let arrayList = []
    Object.keys(array).forEach((value, index) => {
        arrayList.push(array[value])
    })
    arrayList.sort(function (a, b){
        return b.score - a.score
    })
    return arrayList
}

io.on("connection", socket => {

    socket.on('connected', (username) => {
        console.log(`User Connected`)
        clientList[socket.id] = {
            id: socket.id, 
            username: username, 
            token: md5(socket.id),
            score: 0
        }
        console.log(clientList)
        io.emit("userUpdate", getPlayerList(clientList))
    })

    socket.on('pencet', () => {
        const score = clientList[socket.id].score + 1
        clientList[socket.id].score = score
        io.to(socket.id).emit('cokotScore', score)
        io.emit("userUpdate", getPlayerList(clientList))
    })

    socket.on("disconnect", (reason) => {
        console.log("user leave", reason, clientList[socket.id])
        delete(clientList[socket.id])
        io.emit("userUpdate", getPlayerList(clientList))
        console.log("user konek", clientList);
    })

})
