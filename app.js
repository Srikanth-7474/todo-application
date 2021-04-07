const express = require("express");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getTodosQuery = "";

  if (
    request.query.status !== undefined &&
    request.query.priority !== undefined
  ) {
    getTodosQuery = `
      SELECT *
      FROM 
        todo
      WHERE 
          todo LIKE '%${search_q}%' AND
          status = '${status}' AND
          priority = '${priority}';`;
  } else if (request.query.status !== undefined) {
    getTodosQuery = `
      SELECT *
      FROM 
        todo
      WHERE 
          todo LIKE '%${search_q}%' AND
          status = '${status}' ;`;
  } else if (request.query.priority !== undefined) {
    getTodosQuery = `
      SELECT *
      FROM 
        todo
      WHERE 
          todo LIKE '%${search_q}%' AND
          priority = '${priority}';`;
  } else {
    getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }
  const todoArray = await db.all(getTodosQuery);
  response.send(todoArray);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;

  const todo = await db.get(getTodoQuery);
  console.log(todo);
  response.send(todo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
    INSERT INTO
      todo(id, todo, priority, status)
    VALUES(${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updatedColumn = "";

  if (requestBody.status !== undefined) {
    updatedColumn = "Status";
  } else if (requestBody.priority !== undefined) {
    updatedColumn = "Priority";
  } else if (requestBody.todo !== undefined) {
    updatedColumn = "Todo";
  }
  const previousTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoQuery = `
    UPDATE todo
    SET 
      todo = '${todo}',
      priority = '${priority}'
      status = '${status}'
    WHERE id = ${todoId};`;
  await db.run(updateTodoQuery);
  response.send(`${updatedColumn} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
