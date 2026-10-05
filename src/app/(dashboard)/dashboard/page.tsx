"use client";
import { useAuthStore } from "@/src/store/auth.store";

// Placeholder data: replace with your API calls
const stats = [
  { label: "Total users", value: "1,284", change: "+12 this week", up: true },
  { label: "Active today", value: "342", change: "+5% vs yesterday", up: true },
  { label: "Open tasks", value: "27", change: "4 overdue", up: false },
  { label: "Revenue this month", value: "$18,420", change: "+8.2% vs last month", up: true },
];

const activity = [
  { who: "Sokha", what: "created a new project", when: "5 min ago" },
  { who: "Dara", what: "updated billing details", when: "42 min ago" },
  { who: "Maly", what: "invited 3 team members", when: "2 hours ago" },
  { who: "Vireak", what: "closed task #214", when: "Yesterday" },
];

const actions = ["Add user", "Create project", "Export report"];

export default function Dashboard() {
  const { user } = useAuthStore();
  const name = user?.username ?? "there";

  return (
    <div className="text-slate-900">
        {/* Header */}
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {name}
            </h1>
            <p className="mt-1 text-slate-500">
              Here is what changed since your last visit.
            </p>
          </div>
          <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
            Create project
          </button>
        </header>

        {/* Key numbers: one connected panel instead of separate cards */}
        <section
          aria-label="Key numbers"
          className="mt-8 grid grid-cols-2 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="p-6">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
              <p
                className={`mt-1 text-sm ${
                  s.up ? "text-teal-700" : "text-rose-700"
                }`}
              >
                {s.change}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-3">
          {/* Activity */}
          <section className="xl:col-span-2">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <ul className="m  t-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                    {a.who[0]}
                  </span>
                  <p className="flex-1 text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-slate-600">{a.what}</span>
                  </p>
                  <time className="text-sm text-slate-400">{a.when}</time>
                </li>
              ))}
            </ul>
          </section>

          {/* Shortcuts */}
          <section>
            <h2 className="text-lg font-semibold">Shortcuts</h2>
            <div className="mt-3 flex flex-col gap-2">
              {actions.map((label) => (
                <button
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium transition hover:border-teal-700 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>
    </div>
  );
}
