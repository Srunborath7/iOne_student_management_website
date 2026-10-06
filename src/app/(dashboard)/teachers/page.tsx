"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, RefreshCw, Search, Users, X } from "lucide-react";
import { teacherApi, type Teacher, type TeacherCreate } from "@/src/services/teacher";
import { userApi, type UserAccount } from "@/src/services/user";
import { useAuthStore } from "@/src/store/auth.store";

const emptyTeacher: TeacherCreate = {
  name: "",
  gender: "male",
  age: 25,
  phone: "",
  email: "",
  address: "",
  note: "",
  user_id: null,
};

export default function TeachersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canAssignUser = currentUser?.role.toLowerCase() === "admin" || currentUser?.role.toLowerCase() === "manager";
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Omit<Teacher, "id"> | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<TeacherCreate>(emptyTeacher);

  const loadTeachers = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      setTeachers(await teacherApi.list(query.trim()));
      if (canAssignUser) {
        setUserAccounts(await userApi.list());
      } else {
        setUserAccounts([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load teachers.");
    } finally {
      setLoading(false);
    }
  }, [canAssignUser]);

  useEffect(() => { void loadTeachers(); }, [loadTeachers]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadTeachers(search);
  }

  function startEditing(teacher: Teacher) {
    setError(null);
    setEditingId(teacher.id);
    setEditValues({ ...teacher });
  }

  async function saveTeacher(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    if (!editValues) return;
    setSavingId(id);
    setError(null);
    try {
      const updated = await teacherApi.update(id, {
        ...editValues,
        ...(canAssignUser ? {} : { user_id: undefined }),
        name: editValues.name.trim(),
        email: editValues.email.trim(),
        phone: editValues.phone.trim(),
        address: editValues.address.trim(),
        note: editValues.note?.trim() || null,
      });
      setTeachers((current) => current.map((teacher) => teacher.id === id ? updated : teacher));
      setEditingId(null);
      setEditValues(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the teacher.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTeacher(teacher: Teacher) {
    if (!window.confirm(`Delete ${teacher.name}? This cannot be undone.`)) return;
    setDeletingId(teacher.id);
    setError(null);
    try {
      await teacherApi.delete(teacher.id);
      setTeachers((current) => current.filter((item) => item.id !== teacher.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the teacher.");
    } finally {
      setDeletingId(null);
    }
  }

  async function createTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateSubmitting(true);
    setError(null);
    try {
      const created = await teacherApi.create({
        ...createForm,
        ...(canAssignUser ? {} : { user_id: undefined }),
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        address: createForm.address.trim(),
        note: createForm.note?.trim() || null,
        age: Number(createForm.age),
      });
      setTeachers((current) => [created, ...current]);
      setIsCreateOpen(false);
      setCreateForm(emptyTeacher);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the teacher.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const editClass = "rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500";
  function isUserAssigned(userId: number, exceptTeacherId?: number) {
    return teachers.some((teacher) => teacher.user_id === userId && teacher.id !== exceptTeacherId);
  }

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="mt-1 text-sm text-gray-600">View, search, and manage registered teacher records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void loadTeachers(search)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={16} /> Add Teacher
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search teachers</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, phone, or address..." className={`${inputClass} py-2.5 pl-10`} />
        </label>
        <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">Search</button>
      </form>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void loadTeachers(search)} className="font-semibold underline">Try again</button></div>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><h2 className="font-semibold text-gray-900">Teacher Records ({teachers.length})</h2></div>
        {loading ? <p className="px-5 py-12 text-center text-sm text-gray-500">Loading teachers...</p> : teachers.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center"><Users size={28} className="mb-3 text-gray-400" /><p className="font-medium text-gray-800">No teachers found</p><p className="mt-1 text-sm text-gray-500">Try another search or add a new teacher.</p></div>
        ) : <div className="table-scroll"><table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th scope="col" className="px-5 py-3">ID</th><th scope="col" className="px-5 py-3">Name</th><th scope="col" className="px-5 py-3">Gender</th><th scope="col" className="px-5 py-3">Age</th><th scope="col" className="px-5 py-3">Phone</th><th scope="col" className="px-5 py-3">Email</th><th scope="col" className="px-5 py-3">Address</th><th scope="col" className="px-5 py-3">User Account</th><th scope="col" className="px-5 py-3">Note</th><th scope="col" className="px-5 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{teachers.map((teacher) => {
            const editing = editingId === teacher.id && editValues !== null;
            return <tr key={teacher.id} className="text-gray-700 hover:bg-gray-50">
              <td className="px-5 py-4 font-mono text-xs text-gray-500">#{teacher.id}</td>
              {editing && editValues ? <>
                <td className="px-3 py-3"><input aria-label="Teacher name" required value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className={`${editClass} w-36`} /></td>
                <td className="px-3 py-3"><select aria-label="Teacher gender" value={editValues.gender} onChange={(e) => setEditValues({ ...editValues, gender: e.target.value as Teacher["gender"] })} className={editClass}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></td>
                <td className="px-3 py-3"><input aria-label="Teacher age" required type="number" min="15" max="100" value={editValues.age} onChange={(e) => setEditValues({ ...editValues, age: Number(e.target.value) })} className={`${editClass} w-20`} /></td>
                <td className="px-3 py-3"><input aria-label="Teacher phone" required value={editValues.phone} onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })} className={`${editClass} w-32`} /></td>
                <td className="px-3 py-3"><input aria-label="Teacher email" required type="email" value={editValues.email} onChange={(e) => setEditValues({ ...editValues, email: e.target.value })} className={`${editClass} w-44`} /></td>
                <td className="px-3 py-3"><input aria-label="Teacher address" required value={editValues.address} onChange={(e) => setEditValues({ ...editValues, address: e.target.value })} className={`${editClass} w-40`} /></td>
                <td className="px-3 py-3">{canAssignUser ? <select aria-label="Linked user account" value={editValues.user_id ?? ""} onChange={(e) => setEditValues({ ...editValues, user_id: e.target.value ? Number(e.target.value) : null })} className={`${editClass} w-40`}><option value="">No linked account</option>{userAccounts.filter((account) => !isUserAssigned(account.id, teacher.id)).map((account) => <option key={account.id} value={account.id}>{account.username} ({account.role})</option>)}</select> : editValues.user_id ? "Linked account" : "—"}</td>
                <td className="px-3 py-3"><input aria-label="Teacher note" value={editValues.note ?? ""} onChange={(e) => setEditValues({ ...editValues, note: e.target.value || null })} className={`${editClass} w-32`} /></td>
                <td className="px-3 py-3"><form onSubmit={(event) => void saveTeacher(event, teacher.id)} className="flex items-center gap-2"><button type="submit" disabled={savingId === teacher.id} className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">{savingId === teacher.id ? "Saving..." : "Save"}</button><button type="button" disabled={savingId === teacher.id} onClick={() => { setEditingId(null); setEditValues(null); }} className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100">Cancel</button></form></td>
              </> : <>
                <td className="px-5 py-4 font-medium text-gray-900">{teacher.name}</td><td className="px-5 py-4 capitalize">{teacher.gender}</td><td className="px-5 py-4">{teacher.age}</td><td className="px-5 py-4 font-mono text-xs text-gray-600">{teacher.phone}</td><td className="px-5 py-4 text-gray-600">{teacher.email}</td><td className="px-5 py-4">{teacher.address}</td><td className="px-5 py-4">{canAssignUser ? userAccounts.find((account) => account.id === teacher.user_id)?.username ?? (teacher.user_id ? `User #${teacher.user_id}` : <span className="text-gray-400">Not linked</span>) : teacher.user_id ? "Linked" : <span className="text-gray-400">—</span>}</td><td className="px-5 py-4">{teacher.note || <span className="text-gray-400">—</span>}</td>
                <td className="px-3 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => startEditing(teacher)} disabled={deletingId !== null || savingId !== null} className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">Edit</button><button type="button" onClick={() => void deleteTeacher(teacher)} disabled={deletingId !== null || savingId !== null} className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50">{deletingId === teacher.id ? "Deleting..." : "Delete"}</button></div></td>
              </>}
            </tr>;
          })}</tbody>
        </table></div>}
      </div>

      {isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
        <div role="dialog" aria-modal="true" aria-labelledby="create-teacher-title" className="my-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b pb-4"><h3 id="create-teacher-title" className="text-lg font-semibold text-gray-900">Add New Teacher</h3><button type="button" aria-label="Close" onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
          <form onSubmit={createTeacher} className="mt-4 space-y-4">
            <div><label htmlFor="teacher-name" className="block text-xs font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label><input id="teacher-name" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Chan Sokha" className={`mt-1 ${inputClass}`} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="teacher-email" className="block text-xs font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label><input id="teacher-email" required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={`mt-1 ${inputClass}`} /></div><div><label htmlFor="teacher-phone" className="block text-xs font-medium text-gray-700">Phone <span className="text-red-500">*</span></label><input id="teacher-phone" required value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className={`mt-1 ${inputClass}`} /></div></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="teacher-age" className="block text-xs font-medium text-gray-700">Age <span className="text-red-500">*</span></label><input id="teacher-age" required type="number" min="15" max="100" value={createForm.age} onChange={(e) => setCreateForm({ ...createForm, age: Number(e.target.value) })} className={`mt-1 ${inputClass}`} /></div><div><label htmlFor="teacher-gender" className="block text-xs font-medium text-gray-700">Gender <span className="text-red-500">*</span></label><select id="teacher-gender" value={createForm.gender} onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value as Teacher["gender"] })} className={`mt-1 ${inputClass}`}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div></div>
            <div><label htmlFor="teacher-address" className="block text-xs font-medium text-gray-700">Address <span className="text-red-500">*</span></label><input id="teacher-address" required value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} className={`mt-1 ${inputClass}`} /></div>
            {canAssignUser && <div><label htmlFor="teacher-user-id" className="block text-xs font-medium text-gray-700">Linked User Account</label><select id="teacher-user-id" value={createForm.user_id ?? ""} onChange={(e) => setCreateForm({ ...createForm, user_id: e.target.value ? Number(e.target.value) : null })} className={`mt-1 ${inputClass}`}><option value="">No linked account</option>{userAccounts.filter((account) => !isUserAssigned(account.id)).map((account) => <option key={account.id} value={account.id}>{account.username} ({account.role})</option>)}</select><p className="mt-1 text-xs text-gray-500">Only one teacher can be linked to each user account.</p></div>}
            <div><label htmlFor="teacher-note" className="block text-xs font-medium text-gray-700">Note</label><textarea id="teacher-note" rows={2} value={createForm.note ?? ""} onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })} className={`mt-1 ${inputClass}`} /></div>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{createSubmitting ? "Creating..." : "Create Teacher"}</button></div>
          </form>
        </div>
      </div>}
    </section>
  );
}
