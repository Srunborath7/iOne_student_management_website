"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  userApi,
  type UserAccount,
  type UserCreate,
  type UserRole,
} from "@/src/services/user";

const emptyForm: UserCreate = { username: "", password: "", role: "manager" };

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    username: string;
    role: UserRole;
  } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UserCreate>(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadUsers = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await userApi.list(query.trim()));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function searchUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadUsers(search);
  }

  async function saveUser(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    if (!editValues) return;
    setSavingId(id);
    setError(null);
    try {
      const updated = await userApi.update(id, {
        username: editValues.username.trim(),
        role: editValues.role,
      });
      setUsers((current) =>
        current.map((user) => (user.id === id ? updated : user)),
      );
      setEditingId(null);
      setEditValues(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update user.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await userApi.create({
        ...createForm,
        username: createForm.username.trim(),
      });
      setUsers((current) => [created, ...current]);
      setCreateOpen(false);
      setCreateForm(emptyForm);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create user.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(user: UserAccount) {
    if (!window.confirm(`Delete user ${user.username}? This cannot be undone.`))
      return;
    setDeletingId(user.id);
    setError(null);
    try {
      await userApi.delete(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete user.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <section className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage administrator and manager accounts.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadUsers(search)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>
      <form onSubmit={searchUsers} className="flex max-w-xl gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search users</span>
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username or role..."
            className={`${inputClass} py-2.5 pl-10`}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
            onClick={() => void loadUsers(search)}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            User Accounts ({users.length})
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <Users size={28} className="mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">No users found</p>
            <p className="mt-1 text-sm text-gray-500">
              Add a user account to get started.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="text-gray-700 hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      #{user.id}
                    </td>
                    {editingId === user.id && editValues ? (
                      <>
                        <td className="px-3 py-3">
                          <input
                            aria-label="Username"
                            required
                            value={editValues.username}
                            onChange={(event) =>
                              setEditValues({
                                ...editValues,
                                username: event.target.value,
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            aria-label="Role"
                            value={editValues.role}
                            onChange={(event) =>
                              setEditValues({
                                ...editValues,
                                role: event.target.value as UserRole,
                              })
                            }
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="teacher">Teacher</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <form
                            onSubmit={(event) => void saveUser(event, user.id)}
                            className="flex gap-2"
                          >
                            <button
                              disabled={savingId === user.id}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                            >
                              {savingId === user.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              disabled={savingId === user.id}
                              onClick={() => {
                                setEditingId(null);
                                setEditValues(null);
                              }}
                              className="rounded-md border border-gray-300 px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium capitalize text-violet-700">
                            <Shield size={13} />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={
                                deletingId !== null || savingId !== null
                              }
                              onClick={() => {
                                setEditingId(user.id);
                                setEditValues({
                                  username: user.username,
                                  role:
                                    user.role === "admin" ? "admin" : "manager",
                                });
                              }}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={
                                deletingId !== null || savingId !== null
                              }
                              onClick={() => void deleteUser(user)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId === user.id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash2 size={13} />
                                  Delete
                                </>
                              )}
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
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create User
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(event) => void createUser(event)}
              className="mt-4 space-y-4"
            >
              <label className="block text-xs font-medium text-gray-700">
                Username
                <input
                  required
                  autoComplete="username"
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      username: event.target.value,
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-medium text-gray-700">
                Password
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={5}
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      password: event.target.value,
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-medium text-gray-700">
                Role
                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      role: event.target.value as UserRole,
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
