import Todo from "../models/Todo.js";

// @desc    Get all todos
// @route   GET /api/todos
// @access  Public
export const getTodos = async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Public
export const createTodo = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Todo text is required");
  }
  const todo = await Todo.create({ text });
  res.status(201).json(todo);
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Public
export const updateTodo = async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }

  todo.text = req.body.text ?? todo.text;
  todo.completed = req.body.completed ?? todo.completed;

  const updatedTodo = await todo.save();
  res.json(updatedTodo);
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Public
export const deleteTodo = async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) {
    res.status(404);
    throw new Error("Todo not found");
  }
  await todo.remove();
  res.json({ message: "Todo removed" });
};
