import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Check, X, Edit3, Trash2 } from "lucide-react";

const API_URL = "https://todo-kb81.onrender.com/api/todos"; // change if your backend URL is different

export default function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Fetch todos on load
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setTodos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      const { data } = await axios.post(API_URL, { text: inputValue.trim() });
      setTodos([data, ...todos]);
      setInputValue("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id || t._id === id);
    if (!todo) return;

    try {
      const { data } = await axios.put(`${API_URL}/${id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return;
    try {
      const { data } = await axios.put(`${API_URL}/${editingId}`, {
        text: editValue.trim(),
      });
      setTodos(todos.map((t) => (t._id === editingId ? data : t)));
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    try {
      await Promise.all(
        completedTodos.map((t) => axios.delete(`${API_URL}/${t._id}`))
      );
      setTodos(todos.filter((t) => !t.completed));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  const handleKeyPress = (e) => {
    if (e.key === "Enter") addTodo();
  };

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") saveEdit();
    else if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {/* Add Todo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={addTodo}
              disabled={!inputValue.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {todos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {["all", "active", "completed"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors duration-200 ${
                    filter === filterType
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {filterType}{" "}
                  <span className="ml-2 text-sm">
                    {filterType === "all"
                      ? todos.length
                      : filterType === "active"
                      ? activeCount
                      : completedCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredTodos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Check size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                {todos.length === 0
                  ? "No todos yet"
                  : filter === "completed"
                  ? "No completed todos"
                  : "No active todos"}
              </h3>
              <p className="text-gray-400">
                {todos.length === 0
                  ? "Add your first todo above to get started!"
                  : `Switch to "${
                      filter === "active" ? "completed" : "active"
                    }" to see other todos`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <div
                  key={todo._id}
                  className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                    todo.completed ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleTodo(todo._id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                        todo.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {todo.completed && <Check size={16} />}
                    </button>

                    {/* Todo Text */}
                    <div className="flex-1">
                      {editingId === todo._id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          onBlur={saveEdit}
                          autoFocus
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <span
                          className={`block text-lg ${
                            todo.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {todo.text}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {editingId === todo._id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              startEdit(todo._id, todo.text)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{activeCount}</span> active,{" "}
                <span className="font-medium">{completedCount}</span> completed
              </div>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
