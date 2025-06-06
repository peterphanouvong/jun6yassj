import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * In-memory tasks storage for demo purpose.
 * In production, replace with real database connection.
 */
const tasks = new Map();

export async function GET() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser();
  // Get all tasks for the user
  const userId = user?.id;
  const userTasks = tasks.get(userId) || [];

  return NextResponse.json(userTasks);
}

export async function POST(request: Request) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser();
  const userId = user?.id;

  const data = await request.json();
  if (!data?.title) {
    return new Response("Missing task title", { status: 400 });
  }

  const newTask = {
    id: Date.now().toString(),
    title: data.title,
    description: data.description || "",
    completed: false,
  };

  if (!tasks.has(userId)) {
    tasks.set(userId, []);
  }
  tasks.get(userId).push(newTask);

  return NextResponse.json(newTask, { status: 201 });
}

export async function PATCH(request: Request) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser();
  const userId = user?.sub;

  const data = await request.json();
  if (!data?.id) {
    return new Response("Missing task id", { status: 400 });
  }

  const userTasks = tasks.get(userId) || [];
  const task = userTasks.find((t) => t.id === data.id);
  if (!task) {
    return new Response("Task not found", { status: 404 });
  }

  if (typeof data.title === "string") {
    task.title = data.title;
  }
  if (typeof data.description === "string") {
    task.description = data.description;
  }
  if (typeof data.completed === "boolean") {
    task.completed = data.completed;
  }

  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser();
  const userId = user?.sub;

  const data = await request.json();
  if (!data?.id) {
    return new Response("Missing task id", { status: 400 });
  }

  const userTasks = tasks.get(userId) || [];
  const index = userTasks.findIndex((t) => t.id === data.id);
  if (index === -1) {
    return new Response("Task not found", { status: 404 });
  }

  userTasks.splice(index, 1);
  return new Response(null, { status: 204 });
}
