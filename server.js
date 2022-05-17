var path = require('path');
const express = require('express');

const { app, server } = require('./src/sockets');

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) =>
{
	res.sendFile(path.join(__dirname, 'index.html'));
});


server.listen(PORT, () =>
{
	console.log(`listening on localhost:${PORT}`);
});
