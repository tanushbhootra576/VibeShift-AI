import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { Task, TaskStatus } from "@/types/task";

export const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
  const tasksRef = collection(db, "tasks");
  const newTaskRef = doc(tasksRef); // Auto-generate ID
  
  const newTask: Task = {
    ...taskData,
    id: newTaskRef.id,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(newTaskRef, newTask);
  return newTask;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  await updateTask(taskId, { status });
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data() as Task);
};
