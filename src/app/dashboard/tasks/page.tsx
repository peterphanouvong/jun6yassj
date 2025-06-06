"use client";

import React, { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      alert("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOrUpdateTask() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      if (editingTask) {
        // Update existing
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingTask.id,
            title,
            description,
          }),
        });

        if (res.ok) {
          await fetchTasks();
          setEditingTask(null);
          setTitle("");
          setDescription("");
        } else {
          alert("Failed to update task");
        }
      } else {
        // Create new
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description }),
        });

        if (res.ok) {
          await fetchTasks();
          setTitle("");
          setDescription("");
        } else {
          alert("Failed to add task");
        }
      }
    } catch (error) {
      alert("Error saving task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm("Are you sure to delete this task?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.status === 204) {
        await fetchTasks();
      } else {
        alert("Failed to delete task");
      }
    } catch (error) {
      alert("Error deleting task");
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(task: Task) {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        alert("Failed to update task");
      }
    } catch (error) {
      alert("Error updating task");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
  }

  function cancelEdit() {
    setEditingTask(null);
    setTitle("");
    setDescription("");
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Tasks</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="flex-grow px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="flex-grow px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddOrUpdateTask}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button
            onClick={cancelEdit}
            disabled={loading}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </div>
      {loading && <p className="mb-4 text-gray-600">Loading...</p>}
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-4 border rounded shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task)}
                disabled={loading}
                className="w-5 h-5 text-blue-600"
              />
              <span
                onClick={() => startEdit(task)}
                className={`cursor-pointer ${
                  task.completed ? "line-through text-gray-500" : "text-gray-900"
                }`
                }
              >
                {task.title}
              </span>
            </div>
            <button
              onClick={() => handleDeleteTask(task.id)}
              disabled={loading}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
