import path from 'path';
import express from 'express';

import { app, server } from './sockets';
import { info } from './utils';

const PORT: number = 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) =>
{
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});


server.listen(PORT, () =>
{
	info(`listening on port ${PORT}`);
});
