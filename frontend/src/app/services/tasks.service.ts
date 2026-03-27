import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/tasks.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private tasksCollection: CollectionReference<Task>;
  private readonly RAILWAY_API_URL = 'https://task-manager-app-production-0fb2.up.railway.app';

  constructor(private firestore: Firestore) {
    this.tasksCollection = collection(this.firestore, 'tasks') as CollectionReference<Task>;
  }

  getTasks(): Observable<Task[]> {
    return collectionData(this.tasksCollection, {
      idField: 'id'
    }) as Observable<Task[]>;
  }

  async addTask(task: Task) {
    const docRef = await addDoc(this.tasksCollection, task);
    const taskWithId = {
      ...task,
      id: docRef.id
    };
    this.mirrorToRailway('POST', '/tasks', taskWithId).catch(console.error);
    return docRef;
  }

  async updateTask(id: string, task: Task) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    await updateDoc(taskDoc, { ...task });
    this.mirrorToRailway('PUT', `/tasks/${id}`, task).catch(console.error);
  }

  async deleteTask(id: string) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    await deleteDoc(taskDoc);
    this.mirrorToRailway('DELETE', `/tasks/${id}`).catch(console.error);
  }

  private mirrorToRailway(method: string, endpoint: string, data?: any) {
    const url = `${this.RAILWAY_API_URL}${endpoint}`;
    const options: RequestInit = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return fetch(url, options);
  }

}
