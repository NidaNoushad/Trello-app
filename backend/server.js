
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const KEY = process.env.TRELLO_KEY;
const TOKEN = process.env.TRELLO_TOKEN;
const BOARD_ID = process.env.TRELLO_BOARD_ID;

const TRELLO_BASE = 'https://api.trello.com/1';

// WEBSOCKET SERVER 
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: { origin: "*",
  methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// CREATE CARD
app.post('/api/tasks', async (req, res) => {
  const { listId, name, desc,clientId } = req.body;

  try {
    const response = await axios.post(`${TRELLO_BASE}/cards`, null, {
      params: { idList: listId, name, desc, key: KEY, token: TOKEN }
    });

    io.emit("trelloEvent", {
      sourceClient: clientId,
      source: "backend",
      action: "cardCreated",
      data: response.data,
    
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error.response?.data || error.message });
  }
});

// UPDATE CARD
app.put('/api/tasks/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const { name, desc, idList,pos ,clientId} = req.body;

  try {
    const response = await axios.put(`${TRELLO_BASE}/cards/${cardId}`, null, {
      params: { name, desc, idList,pos, key: KEY, token: TOKEN }
    });

    io.emit("trelloEvent", {
      sourceClient: clientId,
      source: "backend",
      action: "cardUpdated",
      data: response.data
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error.response?.data || error.message });
  }
});

// DELETE CARD
app.delete('/api/tasks/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const { clientId } = req.body;

  try {
    await axios.delete(`${TRELLO_BASE}/cards/${cardId}`, {
      params: { key: KEY, token: TOKEN }
    });

    io.emit("trelloEvent", {
      sourceClient: clientId,
      source: "backend",
      action: "cardDeleted",
      data: { id: cardId }
    });

    res.json({ message: "Card deleted", id: cardId });
  } catch (error) {
    res.status(400).json({ error: error.response?.data || error.message });
  }
});


// CREATE BOARD 
app.post('/api/boards', async (req, res) => {
  const { name, defaultLists } = req.body;

  try {
    const response = await axios.post(`${TRELLO_BASE}/boards`, null, {
      params: { name, defaultLists, key: KEY, token: TOKEN }
    });

    io.emit("trelloEvent", {
      sourceClient: req.body.clientId,
      source: "backend",
      action: "boardCreated",
      data: response.data
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error.response?.data || error.message });
  }
});

//GET FULL BOARD (lists + cards)

app.get("/api/board", async (req, res) => {
  try {

    // 1. Get all lists
    const listsRes = await axios.get(`${TRELLO_BASE}/boards/${BOARD_ID}/lists`, {
      params: { key: KEY, token: TOKEN }
    });

    const lists = listsRes.data;

    // 2. For each list, fetch cards
    const listsWithCards = [];
    for (let list of lists) {
      const cardsRes = await axios.get(`${TRELLO_BASE}/lists/${list.id}/cards`, {
        params: { key: KEY, token: TOKEN }
      });

      listsWithCards.push({
        ...list,
        cards: cardsRes.data
      });
    }

    res.json({
      boardId: BOARD_ID,
      lists: listsWithCards
    });

  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

// GET all Boards
app.get('/api/boards', async (req, res) => {
  try {
    const response = await axios.get(`${TRELLO_BASE}/members/me/boards`, {
      params: { key: KEY, token: TOKEN }
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error.response?.data || error.message });
  }
});

// GET Single Board (lists + cards)
app.get('/api/board/:id', async (req, res) => {
  const boardId = req.params.id;

  try {
    const listsRes = await axios.get(`${TRELLO_BASE}/boards/${boardId}/lists`, {
      params: { key: KEY, token: TOKEN }
    });

    const lists = listsRes.data;

    const listsWithCards = [];

    for (let list of lists) {
      const cardsRes = await axios.get(`${TRELLO_BASE}/lists/${list.id}/cards`, {
        params: { key: KEY, token: TOKEN }
      });

      listsWithCards.push({
        ...list,
        cards: cardsRes.data
      });
    }

    res.json({
      id: boardId,
      lists: listsWithCards
    });

  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});


// WEBHOOK 

app.head("/webhook", (req, res) => res.sendStatus(200));

app.post("/webhook", (req, res) => {
  console.log("Webhook event received:", req.body);

  io.emit("trelloEvent", {
    sourceClient: req.body.clientId,
    source: "trello",
    action: "webhookEvent",
    data: req.body
  });

  res.sendStatus(200);
});

// START SERVER

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
