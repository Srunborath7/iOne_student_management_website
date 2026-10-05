"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Search, RefreshCw, Users } from "lucide-react";
import { studentService } from "@/src/services/student.service";
import type { Student } from "@/src/types/auth";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Omit<Student, "id"> | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadStudents = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.list(query.trim());
      setStudents(result);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load students.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadStudents(search);
  }

  function startEditing(student: Student) {
    setError(null);
    setEditingId(student.id);
    setEditValues({
      name: student.name,
      email: student.email,
      age: student.age,
      phone: student.phone,
      major: student.major ?? "",
    });
  }

  async function saveStudent(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    if (!editValues) return;

    setSavingId(id);
    setError(null);
    try {
      const updated = await studentService.update(id, {
        ...editValues,
        name: editValues.name.trim(),
        email: editValues.email.trim(),
        phone: editValues.phone.trim(),
        major: editValues.major?.trim() || null,
      });
      setStudents((current) => current.map((student) => student.id === id ? updated : student));
      setEditingId(null);
      setEditValues(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the student.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteStudent(student: Student) {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;

    setDeletingId(student.id);
    setError(null);
    try {
      await studentService.delete(student.id);
      setStudents((current) => current.filter((item) => item.id !== student.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the student.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and search student records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStudents(search)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search students</span>
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Search
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadStudents(search)}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Student records</h2>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            Loading students...
          </p>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <Users size={28} className="mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">No students found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or refresh the list.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Age
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Phone
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Major
                  </th>
                  <th scope="col" className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="text-gray-700 hover:bg-gray-50"
                  >
                    {editingId === student.id && editValues ? (
                      <>
                        <td className="px-3 py-3"><input aria-label="Student name" required value={editValues.name} onChange={(event) => setEditValues({ ...editValues, name: event.target.value })} className="w-36 rounded border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-3"><input aria-label="Student email" type="email" required value={editValues.email} onChange={(event) => setEditValues({ ...editValues, email: event.target.value })} className="w-48 rounded border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-3"><input aria-label="Student age" type="number" min="1" required value={editValues.age} onChange={(event) => setEditValues({ ...editValues, age: Number(event.target.value) })} className="w-20 rounded border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-3"><input aria-label="Student phone" required value={editValues.phone} onChange={(event) => setEditValues({ ...editValues, phone: event.target.value })} className="w-32 rounded border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-3"><input aria-label="Student major" value={editValues.major ?? ""} onChange={(event) => setEditValues({ ...editValues, major: event.target.value })} className="w-32 rounded border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-3">
                          <form onSubmit={(event) => void saveStudent(event, student.id)} className="flex items-center gap-2">
                            <button type="submit" disabled={savingId === student.id} className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{savingId === student.id ? "Saving..." : "Save"}</button>
                            <button type="button" onClick={() => { setEditingId(null); setEditValues(null); }} disabled={savingId === student.id} className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100">Cancel</button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 font-medium text-gray-900">{student.name}</td>
                        <td className="px-5 py-4">{student.email}</td>
                        <td className="px-5 py-4">{student.age}</td>
                        <td className="px-5 py-4">{student.phone}</td>
                        <td className="px-5 py-4">{student.major || "—"}</td>
                        <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(student)}
                          disabled={deletingId !== null || savingId !== null}
                          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteStudent(student)}
                          disabled={deletingId !== null || savingId !== null}
                          className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === student.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
