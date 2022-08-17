const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(obj => obj.username == username);

  if(!user){
    return response.status(404).json({error: "Usuário não encontrado."})
  }
  request.user = user;
  next();
};

function checkExistsTodo(request, response, next){
  const {username} = request.headers;
  const {id} = request.params;

  const user = users.find(obj => obj.username == username);
  const todo = user.todos.find(obj => obj.id == id);

  if(!todo){
    return response.status(404).json({error: "Tarefa não encontrada"});
  };

  request.todo = todo;

  next();

}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const id = uuidv4();
  const user = users.find(obj => obj.username == username);

  if(user){
    return response.status(400).json({error: "Usuário já cadastrado"});
  }

  const userData = {
    name,
    username,
    id,
    todos: []
  };

  users.push(userData);

  return response.status(201).json(userData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
    let {title, deadline} = request.body;
    const id = uuidv4();
  
    const todoData = {
      id,
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    };

    user.todos.push(todoData);
  
    return response.status(201).json(todoData);
  });

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {user, todo} = request;
  const {title, deadline} = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {todo} = request;

  if(todo.done == true){
    return response.status(400).json({error: "Tarefa já finalizada"});
  }
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {user, todo} = request;

  const todoIndex = user.todos.findIndex(obj => obj == todo);

  console.log(todoIndex);

  user.todos.splice(todoIndexya, 1);

  return response.status(204).json(user);

});

module.exports = app;