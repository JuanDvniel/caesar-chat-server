const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);


const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});


app.use(cors());
app.use(express.static('public'));


let messages = [];

app.get('/', (req, res) => {
  res.send(`
    <h1> Caesar Chat Server</h1>
    <p>Servidor funcionando correctamente!</p>
    <p>Socket.IO está ejecutándose en este servidor.</p>
    <p>Conecta tus clientes a este servidor para chatear.</p>
  `);
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);


  socket.emit('load_messages', messages);

  socket.on('new_message', (message) => {
    console.log('Nuevo mensaje recibido:', message);


    message.serverTimestamp = new Date().toISOString();

    
    messages.push(message);


    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

   
    io.emit('message_received', message);
  });


  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(` Servidor ejecutándose en puerto ${PORT}`);
  console.log(` Socket.IO listo para conexiones`);
});
