import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Subject, Module, Chapter } from "../types";

export function subscribeToSubjects(callback: (subjects: Subject[]) => void) {
  const q = query(collection(db, "subjects"), orderBy("year"), orderBy("order"));
  return onSnapshot(q, (snapshot) => {
    const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
    callback(subjects);
  });
}

export async function getModules(subjectId: string): Promise<Module[]> {
  const q = query(collection(db, `subjects/${subjectId}/modules`), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
}

export async function getChapters(subjectId: string, moduleId: string): Promise<Chapter[]> {
  const q = query(collection(db, `subjects/${subjectId}/modules/${moduleId}/chapters`), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
}

export async function getBooks(subjectId: string): Promise<any[]> {
  const q = query(collection(db, `subjects/${subjectId}/books`), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getSummaries(subjectId: string): Promise<any[]> {
  const q = query(collection(db, `subjects/${subjectId}/summaries`), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCases(subjectId: string): Promise<any[]> {
  const q = query(collection(db, `subjects/${subjectId}/cases`), orderBy("order"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
