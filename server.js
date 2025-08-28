const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configurar CORS para permitir conexiones desde cualquier origen
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Middleware
app.use(cors());
app.use(express.static('public'));

// Array para almacenar los mensajes en memoria (se pierden al reiniciar)
let messages = [];

// Ruta principal
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Caesar Chat Server</h1>
    <p>Servidor funcionando correctamente!</p>
    <p>Socket.IO está ejecutándose en este servidor.</p>
    <p>Conecta tus clientes a este servidor para chatear.</p>
  `);
});

// Ruta de salud para Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Enviar mensajes existentes al nuevo usuario
  socket.emit('load_messages', messages);

  // Escuchar nuevos mensajes
  socket.on('new_message', (message) => {
    console.log('Nuevo mensaje recibido:', message);

    // Agregar timestamp del servidor
    message.serverTimestamp = new Date().toISOString();

    // Guardar mensaje en memoria
    messages.push(message);

    // Limitar a los últimos 100 mensajes para evitar sobrecarga de memoria
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    // Retransmitir mensaje a todos los clientes conectados
    io.emit('message_received', message);
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// El puerto lo asigna Render automáticamente
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📡 Socket.IO listo para conexiones`);
});
