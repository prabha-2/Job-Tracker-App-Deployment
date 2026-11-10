
import { useEffect, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  Building2,
  ChartNoAxesColumn,
  Settings,
  Search,
  Bell,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

type Status =
  | "Applied"
  | "Interview"
  | "Shortlisted"
  | "Offer"
  | "Rejected";

type Application = {
  id: number;
  company: string;
  role: string;
  date: string;
  status: Status;
  job_url?: string | null;
  notes?: string | null;
};

const API_BASE_URL = "https://backend.prabhagurunaathan.workers.dev";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Applications", icon: BriefcaseBusiness },
  { label: "Interviews", icon: CalendarDays },
  { label: "Companies", icon: Building2 },
  { label: "Analytics", icon: ChartNoAxesColumn },
  { label: "Settings", icon: Settings },
];

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Status>("Applied");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch applications from the deployed backend
  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/applications`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();

        const formattedApplications: Application[] =
          data.applications.map((item: any) => ({
            id: item.id,
            company: item.company,
            role: item.role,
            date: item.applied_date,
            status: item.status as Status,
            job_url: item.job_url,
            notes: item.notes,
          }));

        setApplications(formattedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(
          "Unable to load applications. Check the backend connection."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const totalApplications = applications.length;

  const totalInterviews = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const totalOffers = applications.filter(
    (app) => app.status === "Offer"
  ).length;

  const totalRejections = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  function resetForm() {
    setCompany("");
    setRole("");
    setStatus("Applied");
    setDate(new Date().toLocaleDateString("en-CA"));
    setJobUrl("");
    setNotes("");
    setEditingApplication(null);
  }

  function openAddForm() {
    resetForm();
    setError("");
    setShowForm(true);
  }

  function openEditForm(application: Application) {
    setCompany(application.company);
    setRole(application.role);
    setStatus(application.status);
    setDate(application.date);
    setJobUrl(application.job_url || "");
    setNotes(application.notes || "");
    setEditingApplication(application);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const isEditing = editingApplication !== null;

      const url = isEditing
        ? `${API_BASE_URL}/api/applications/${editingApplication.id}`
        : `${API_BASE_URL}/api/applications`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          status,
          applied_date: date,
          job_url: jobUrl.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save application"
        );
      }

      if (isEditing) {
        setApplications((previous) =>
          previous.map((app) =>
            app.id === editingApplication.id
              ? {
                  ...app,
                  company: company.trim(),
                  role: role.trim(),
                  date,
                  status,
                  job_url: jobUrl.trim(),
                  notes: notes.trim(),
                }
              : app
          )
        );
      } else {
        const newApplication: Application = {
          id: data.id,
          company: company.trim(),
          role: role.trim(),
          date,
          status,
          job_url: jobUrl.trim(),
          notes: notes.trim(),
        };

        setApplications((previous) => [
          newApplication,
          ...previous,
        ]);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving application:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/applications/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete application"
        );
      }

      setApplications((previous) =>
        previous.filter((app) => app.id !== id)
      );
    } catch (err) {
      console.error("Error deleting application:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting."
      );
    }
  }

  function formatDate(value: string) {
    return new Date(value + "T00:00:00").toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:block">
        <h1 className="mb-10 text-2xl font-bold text-indigo-600">
          ApplyTrack
        </h1>

        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                  index === 0
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className="mt-16 rounded-xl bg-indigo-50 p-4">
          <p className="font-semibold text-indigo-700">
            Keep going!
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Stay organized and keep track of your job search progress.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div>
            <h2 className="text-lg font-semibold">
              Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Welcome back! Here's your job search overview.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex">
              <Search size={17} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-32 text-sm outline-none"
              />
            </div>

            <Bell size={20} className="cursor-pointer text-slate-500" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              U
            </div>
          </div>
        </header>

        <section className="p-5 md:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monitor your job applications and progress.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Application
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Applications"
              value={totalApplications}
              subtitle="Applications tracked"
              icon={BriefcaseBusiness}
            />

            <StatCard
              title="Interviews"
              value={totalInterviews}
              subtitle="Interview opportunities"
              icon={Users}
            />

            <StatCard
              title="Offers Received"
              value={totalOffers}
              subtitle="Successful applications"
              icon={CheckCircle}
            />

            <StatCard
              title="Rejections"
              value={totalRejections}
              subtitle="Applications closed"
              icon={XCircle}
            />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h3 className="font-semibold">
                  Recent Applications
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest job application activity.
                </p>
              </div>

              <span className="text-sm font-semibold text-indigo-600">
                {applications.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">Position</th>
                    <th className="px-5 py-4">Applied Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Loading applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No applications found. Click Add Application to get started.
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr
                        key={application.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-semibold">
                          {application.company}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {application.role}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(application.date)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={application.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditForm(application)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-indigo-600 hover:bg-indigo-50"
                              title="Edit application"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(application.id)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                              title="Delete application"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            ApplyTrack © 2026. Your job search, organized.
          </p>
        </section>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingApplication
                  ? "Edit Job Application"
                  : "New Job Application"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Company Name
                </label>

                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Enter company name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Job Position
                </label>

                <input
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Enter job title"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Application Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Status)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Offer">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Application Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Job URL (Optional)
                </label>

                <input
                  type="url"
                  value={jobUrl}
                  onChange={(event) => setJobUrl(event.target.value)}
                  placeholder="https://example.com/job"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Notes (Optional)
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingApplication
                      ? "Update Application"
                      : "Save Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <Icon size={21} className="text-indigo-500" />
      </div>

      <h3 className="mt-4 text-3xl font-bold">
        {String(value).padStart(2, "0")}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Applied: "bg-blue-50 text-blue-700",
    Interview: "bg-purple-50 text-purple-700",
    Shortlisted: "bg-green-50 text-green-700",
    Offer: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
  };

  const label = status === "Offer" ? "Offer Received" : status;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {label}
    </span>
  );
}

export default App;
