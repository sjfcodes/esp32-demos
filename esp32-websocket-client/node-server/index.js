const express = require('express')
const { WebSocketServer } = require("ws")

const SERVER_PORT = 3000;
const WSS_PORT = 443;

// serve static website
express()
    .use((_, res) => res.sendFile('/index.html', { root: __dirname }))
    .listen(SERVER_PORT, () => console.log(`Open browser to: http://0.0.0.0:${SERVER_PORT}`))

// serve websocket to clients
const wssHeaterGpioState = new WebSocketServer({ path: "/message_path", port: WSS_PORT });

let serverState = { isOn: false }

wssHeaterGpioState.on("connection", (ws) => {
    console.log("New client connected!");
    // send initial serverState to new client
    ws.send(JSON.stringify(serverState));

    // handle events
    ws.on("close", () => console.log("Client has disconnected!"));
    ws.on("message", (data) => {
        wssHeaterGpioState.clients.forEach((client) => {
            console.log(`distributing message: ${data}`);
            client.send(`${data}`);
        });
    });
    ws.onerror = () => {
        console.log("websocket error");
    };
});

setInterval(() => {
    // mock client invoked serverState change
    serverState.isOn = !serverState.isOn;
    wssHeaterGpioState.clients.forEach((client) => {
        client.send(JSON.stringify(serverState));
    });

}, 5000)