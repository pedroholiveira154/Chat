// Importando o módulo 'express' e atribuindo-o à constante 'app'
const app = require('express')();
// Importando o módulo 'http' e criando um servidor com ele, atribuindo-o à constante 'http'
const http = require('http').createServer(app);
// Importando o módulo 'socket.io' e passando o servidor 'http' como parâmetro, atribuindo-o à constante 'io'
const io = require('socket.io')(http);

// Lista de usuários conectados (armazenada em memória simples)
let connectedUsers = [];

// Rota para a página inicial
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// Evento para quando o cliente se conecta ao servidor via Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Evento para quando o cliente confirma o nome e entra no chat
  socket.on('join', (data) => {
    const user = { id: socket.id, name: data.name, online: true };
    connectedUsers.push(user);
    socket.user = user; // Armazena no socket para facilitar remoção na desconexão

    // Emite a lista atualizada de usuários para TODOS os clientes conectados
    io.emit('users', connectedUsers);

    // Opcional: Notifica entrada no chat (como mensagem de sistema)
    socket.broadcast.emit('system', `${data.name} entrou no chat.`);
  });

  // Evento para quando o cliente solicita a lista de usuários (opcional, para inicialização)
  socket.on('request users', () => {
    socket.emit('users', connectedUsers);
  });

  // Evento para quando o cliente envia uma mensagem via Socket.io
  socket.on('chat message', (data) => io.emit('chat message', data));

  // Evento para quando o cliente se desconecta do servidor via Socket.io
  socket.on('disconnect', () => {
    if (socket.user) {
      // Remove o usuário da lista
      connectedUsers = connectedUsers.filter(u => u.id !== socket.id);
      // Emite a lista atualizada para TODOS os clientes
      io.emit('users', connectedUsers);
      // Opcional: Notifica saída no chat
      socket.broadcast.emit('system', `${socket.user.name} saiu do chat.`);
    }
    console.log('Usuário desconectado:', socket.id);
  });
});

// Inicia o servidor na porta 3000
http.listen(3000, () => {
  console.log(`Servidor rodando na porta 3000 - Link http://localhost:3000`);
});