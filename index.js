const express = require('express');
const fs = require('fs');

const server = express();

server.use(express.json());

const users = [
  { name: 'Lucas', id: 1 },
  { name: 'Pedro', id: 2 },
  { name: 'Ana', id: 3 },
  { name: 'Eliane', id: 4 },
  { name: 'Duda', id: 5 },
  { name: 'Diego', id: 6 },
];

// LOG MIDDLEWARE
server.use((req, res, next) => {
  const start = new Date().getTime();
  next();
  const end = new Date().getTime();

  const jsonFile = fs.readFileSync('./logs.json');
  const jsObject = JSON.parse(jsonFile);
  const time_stamp = Date();
  const duration = end - start;
  const status = res.statusCode;

  jsObject.counter++;
  jsObject.last_log = time_stamp;
  jsObject.logs.push({
    method: req.method,
    url: req.url,
    duration,
    status,
    time_stamp,
  });

  fs.writeFileSync('./logs.json', JSON.stringify(jsObject, null, 2));
});

// VALIDATION MIDDLEWARE
const nameValidation = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({ ERROR: 'Name is required' });
  }
  return next();
};

const idValidation = (req, res, next) => {
  const { id } = req.params;
  const index = users.findIndex(user => user.id == id);
  if (index === -1) {
    return res.status(404).send({ Error: 'Not Found' });
  }

  req.index = index;
  return next();
};

server.get('/users', (req, res) => {
  return res.status(200).json(users);
});

server.get('/users/:id', idValidation, (req, res) => {
  const { index } = req;
  return res.status(200).json(users[index]);
});

server.post('/users', nameValidation, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send({ Error: 'Bad Request' });
  }

  const user = { name, id: Date.now() };
  users.push(user);

  return res.status(201).json(user);
});

server.put('/users/:id', idValidation, nameValidation, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).send({ Error: 'Bad Request' });
  }

  const index = users.findIndex(user => user.id == id);
  if (index === -1) {
    return res.status(404).send({ Error: 'Not Found' });
  }
  users[index].name = name;
  return res.status(200).json(users[index]);
});

server.delete('/users/:id', idValidation, (req, res) => {
  const { index } = req;
  users.splice(index, 1);
  return res.status(200).send();
});

server.listen(process.env.PORT || 3000);
