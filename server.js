const express = require("express");
// const app = express();
var app = require("http").createServer(handler),
  io = require("socket.io").listen(app),
  fs = require("fs");
//app.use(express.static(__dirname + '/pong/dist/pong'));
var clients = {};
var players = 1;
var count = 0;
app.listen(9011);
function handler(req, res) {
  if (players == 1) {
    console.log("player 1");
    players = players + 1;

    fs.readFile(__dirname + "/views/playera.ejs", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading page" + err);
      }

      res.writeHead(200);
      res.end(data);
    });
  } else if (players == 2) {
    console.log("player 2");

    fs.readFile(__dirname + "/views/playerb.ejs", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading page" + err);
      }

      res.writeHead(200);
      res.end(data);
    });
  } else {
    fs.readFile(__dirname + "/housefull.html", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading page" + err);
      }

      res.writeHead(200);
      res.end(data);
    });
  }
}

io.sockets.on("connection", function (socket) {
  // store the username in the socket session for this client
  socket.username = socket.id;

  // add the client's username to the global list
  clients[count] = socket.id;

  //sending the client its socket id for later identification
  socket.emit("myid", socket.id);

  console.log(socket.id + " just connected");

  if (count < 2) count++;

  socket.on("updateBall", function (uid, x, y) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("updateBall", x, y);
      }
    }
  });

  socket.on("updateScore", function (uid, scorea, scoreb) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("updateScore", scorea, scoreb);
      }
    }
  });

  socket.on("updateAttributes", function (
    uid,
    ballspeed,
    maxscore,
    paddlespeed
  ) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("updateAttributes", ballspeed, maxscore, paddlespeed);
      }
    }
  });

  socket.on("updatePaddle", function (uid, position) {
    socket.broadcast.emit("updatePaddle", position);
  });

  socket.on("endgame", function (uid, signal) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("endgame", signal);
      }
    }
  });

  socket.on("start", function (uid, signal) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("start", signal);
      }
    }
  });

  socket.on("pause", function (uid, signal) {
    for (var i = 0; i < count; i++) {
      if (clients[i] != uid) {
        io.emit("pause", signal);
      }
    }
  });
});
