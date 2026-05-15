import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Gauge,
  Hourglass,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle
} from "lucide-react";
import menspingoLogo from "./assets/menspingo-logo.svg";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const API_PREFIX = `${API_BASE_URL}/api`;
const AUTH_STORAGE_KEY = "employee-management-auth";
const ADMIN_ACCESS_DENIED = "Access denied. Only admin users can access this management portal.";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  jobTitle: "",
  salary: "",
  hireDate: new Date().toISOString().slice(0, 10),
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  photoUrl: "",
  status: "ACTIVE"
};

const emptyLeaveForm = {
  employeeId: "",
  leaveType: "Sick Leave",
  fromDate: new Date().toISOString().slice(0, 10),
  toDate: new Date().toISOString().slice(0, 10),
  description: ""
};

const statusLabels = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ON_LEAVE: "On leave"
};

const leaveStatusLabels = {
  PENDING: "Pending",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected"
};

const navItems = [
  { id: "dashboard", label: "Dashboard", title: "Dashboard Overview", icon: Gauge },
  { id: "employees", label: "Employees", title: "Manage Employees", icon: Users },
  { id: "departments", label: "Departments", title: "Departments", icon: Building2 },
  { id: "leaves", label: "Leaves", title: "Manage Leaves", icon: CalendarCheck2 },
  { id: "salary", label: "Salary", title: "Salary History", icon: Banknote },
  { id: "settings", label: "Setting", title: "Setting", icon: Settings }
];

function App() {
  const [auth, setAuth] = useState(readSavedAuth);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authSaving, setAuthSaving] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm);
  const [decisionReasons, setDecisionReasons] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [salarySearch, setSalarySearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const departments = useMemo(() => {
    return [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  }, [employees]);

  const departmentSummaries = useMemo(() => {
    return departments.map((department) => {
      const departmentEmployees = employees.filter((employee) => employee.department === department);
      const payroll = departmentEmployees.reduce((total, employee) => total + Number(employee.salary || 0), 0);

      return {
        department,
        total: departmentEmployees.length,
        active: departmentEmployees.filter((employee) => employee.status === "ACTIVE").length,
        payroll
      };
    });
  }, [departments, employees]);

  const stats = useMemo(() => {
    const activeCount = employees.filter((employee) => employee.status === "ACTIVE").length;
    const onLeaveCount = employees.filter((employee) => employee.status === "ON_LEAVE").length;
    const inactiveCount = employees.filter((employee) => employee.status === "INACTIVE").length;
    const payroll = employees.reduce((total, employee) => total + Number(employee.salary || 0), 0);
    const averageSalary = employees.length ? payroll / employees.length : 0;
    const highestSalary = employees.reduce((highest, employee) => Math.max(highest, Number(employee.salary || 0)), 0);

    return {
      total: employees.length,
      activeCount,
      inactiveCount,
      onLeaveCount,
      departmentsCount: departments.length,
      payroll,
      monthlyPay: payroll / 12,
      averageSalary,
      highestSalary
    };
  }, [departments.length, employees]);

  const leaveStats = useMemo(() => {
    return {
      applied: leaves.length,
      approved: leaves.filter((leave) => leave.status === "APPROVED").length,
      pending: leaves.filter((leave) => leave.status === "PENDING").length,
      rejected: leaves.filter((leave) => leave.status === "REJECTED").length,
      cancelled: leaves.filter((leave) => leave.status === "CANCELLED").length
    };
  }, [leaves]);

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return employeeCode(employee).toLowerCase().includes(query)
        || fullName.includes(query)
        || employee.email.toLowerCase().includes(query);
    });
  }, [employeeSearch, employees]);

  const filteredLeaveRows = useMemo(() => {
    const query = leaveSearch.trim().toLowerCase();
    if (!query) {
      return leaves;
    }

    return leaves.filter((row) => {
      const fullName = `${row.employee.firstName} ${row.employee.lastName}`.toLowerCase();
      return leaveStatusLabels[row.status].toLowerCase().includes(query)
        || row.leaveType.toLowerCase().includes(query)
        || fullName.includes(query)
        || employeeCode(row.employee).toLowerCase().includes(query);
    });
  }, [leaves, leaveSearch]);

  const salaryRows = useMemo(() => {
    const query = salarySearch.trim().toLowerCase();

    return employees
      .filter((employee) => {
        if (!query) {
          return true;
        }

        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        return employeeCode(employee).toLowerCase().includes(query) || fullName.includes(query);
      })
      .map((employee, index) => {
        const salary = Number(employee.salary || 0);
        const allowance = Math.round(salary * 0.05);
        const deduction = Math.round(salary * 0.03);

        return {
          employee,
          serial: index + 1,
          salary,
          allowance,
          deduction,
          total: salary + allowance - deduction,
          payDate: offsetDate(employee.hireDate, 30)
        };
      });
  }, [employees, salarySearch]);

  useEffect(() => {
    if (auth?.token) {
      loadEmployees("");
      loadLeaves();
    }
  }, [auth?.token]);

  async function request(path, { token = auth?.token, ...options } = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const isFormData = options.body instanceof FormData;
    const response = await fetch(url, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      if (response.status === 401 && auth?.token) {
        handleLogout(false);
      }

      const apiError = new Error(data?.message || "Something went wrong");
      apiError.validationErrors = data?.validationErrors || {};
      throw apiError;
    }

    return data;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSaving(true);
    setAuthError("");

    const payload = authMode === "signup"
      ? authForm
      : { email: authForm.email, password: authForm.password };

    try {
      const data = await request(`${API_PREFIX}/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(payload),
        token: null
      });

      if (data.user?.role !== "ADMIN") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthError(ADMIN_ACCESS_DENIED);
        return;
      }

      saveAuth(data);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (apiError) {
      setAuthError(apiError.message);
    } finally {
      setAuthSaving(false);
    }
  }

  function saveAuth(nextAuth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  function handleLogout(showMessage = true) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setEmployees([]);
    setLeaves([]);
    setMessage(showMessage ? "Signed out." : "");
    setError(showMessage ? "" : "Session expired. Please log in again.");
    resetForm();
    setSelectedEmployee(null);
  }

  async function loadEmployees(nextDepartment = departmentFilter) {
    if (!auth?.token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = nextDepartment ? `?department=${encodeURIComponent(nextDepartment)}` : "";
      const data = await request(`${API_PREFIX}/employees${query}`);
      setEmployees(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaves() {
    if (!auth?.token) {
      return;
    }

    try {
      const data = await request(`${API_PREFIX}/leaves`);
      setLeaves(data);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setValidationErrors((current) => ({ ...current, [name]: undefined }));
  }

  function updateAuthField(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
    setAuthError("");
  }

  function updateLeaveField(event) {
    const { name, value } = event.target;
    setLeaveForm((current) => ({ ...current, [name]: value }));
  }

  function updateDecisionReason(leaveId, value) {
    setDecisionReasons((current) => ({ ...current, [leaveId]: value }));
  }

  async function updatePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setSaving(true);
    setError("");

    try {
      const data = await request(`${API_PREFIX}/uploads/employee-photos`, {
        method: "POST",
        body
      });
      setForm((current) => ({ ...current, photoUrl: data.photoUrl }));
    } catch (apiError) {
      setError(apiError.message || "Please select another image.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  function startNewEmployee() {
    resetForm();
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  }

  function editEmployee(employee) {
    setActiveView("employees");
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
    setEditingId(employee.id);
    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      jobTitle: employee.jobTitle,
      salary: employee.salary,
      hireDate: employee.hireDate,
      dateOfBirth: employee.dateOfBirth || "",
      gender: employee.gender || "",
      maritalStatus: employee.maritalStatus || "",
      photoUrl: employee.photoUrl || "",
      status: employee.status
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setValidationErrors({});
  }

  async function submitEmployee(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    setValidationErrors({});

    const payload = {
      ...form,
      salary: Number(form.salary),
      dateOfBirth: form.dateOfBirth || null
    };

    try {
      const path = editingId ? `${API_PREFIX}/employees/${editingId}` : `${API_PREFIX}/employees`;
      const method = editingId ? "PUT" : "POST";
      await request(path, {
        method,
        body: JSON.stringify(payload)
      });

      setMessage(editingId ? "Employee updated." : "Employee created.");
      resetForm();
      setShowEmployeeForm(false);
      await loadEmployees();
    } catch (apiError) {
      setError(apiError.message);
      setValidationErrors(apiError.validationErrors || {});
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee) {
    const confirmed = window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/employees/${employee.id}`, { method: "DELETE" });
      setMessage("Employee deleted.");
      await loadEmployees();
      await loadLeaves();
      if (editingId === employee.id) {
        resetForm();
        setShowEmployeeForm(false);
      }
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function applyDepartmentFilter(event) {
    event.preventDefault();
    loadEmployees(departmentFilter);
  }

  function clearDepartmentFilter() {
    setDepartmentFilter("");
    loadEmployees("");
  }

  function showSalary(employee) {
    setSalarySearch(employeeCode(employee));
    setActiveView("salary");
    setSelectedEmployee(null);
  }

  function showLeaves(employee) {
    setLeaveForm((current) => ({ ...current, employeeId: String(employee.id) }));
    setLeaveSearch(employeeCode(employee));
    setActiveView("leaves");
    setSelectedEmployee(null);
  }

  async function submitLeave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await request(`${API_PREFIX}/leaves`, {
        method: "POST",
        body: JSON.stringify({
          ...leaveForm,
          employeeId: Number(leaveForm.employeeId)
        })
      });

      setMessage("Leave request saved.");
      setLeaveForm(emptyLeaveForm);
      await loadLeaves();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateLeaveDecision(leave, status) {
    const reason = (decisionReasons[leave.id] || "").trim();
    if ((status === "CANCELLED" || status === "REJECTED") && !reason) {
      setError("Mention Reason");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = await request(`${API_PREFIX}/leaves/${leave.id}/decision`, {
        method: "PUT",
        body: JSON.stringify({ status, reason })
      });

      setMessage(data.message || (data.emailSent
        ? "Leave status updated and notification email sent."
        : "Leave status updated, but email notification could not be sent."));
      setDecisionReasons((current) => ({ ...current, [leave.id]: "" }));
      await loadLeaves();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  function selectView(view) {
    setActiveView(view);
    setMessage("");
    setError("");
    if (view !== "employees") {
      setSelectedEmployee(null);
    }
  }

  if (!auth) {
    return (
      <AuthPage
        mode={authMode}
        form={authForm}
        saving={authSaving}
        error={authError || error}
        onModeChange={(nextMode) => {
          setAuthMode(nextMode);
          setAuthError("");
          setError("");
        }}
        onChange={updateAuthField}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  const activeItem = navItems.find((item) => item.id === activeView) || navItems[0];

  return (
    <main className="app-shell">
      <header className="main-header">
        <div className="header-brand">Employee MS</div>
        <div className="header-welcome">Welcome, {auth.user?.name || "Admin"}</div>
        <button className="logout-button" type="button" onClick={() => handleLogout()}>
          Logout
        </button>
      </header>

      <div className="layout-shell">
        <Sidebar activeView={activeView} onSelect={selectView} />

        <section className="content-shell">
          <section className="page-heading">
            <h1>{selectedEmployee ? "Employee Details" : activeItem.title}</h1>
            {!selectedEmployee && (
              <button className="refresh-button" type="button" onClick={() => loadEmployees()} disabled={loading}>
                <RefreshCcw size={17} aria-hidden="true" />
                Refresh
              </button>
            )}
          </section>

          {(message || error) && (
            <div className={error ? "notice error" : "notice success"} role="status">
              {error || message}
            </div>
          )}

          {loading && employees.length === 0 ? (
            <div className="screen-loader">
              <Loader2 className="spin" size={28} aria-hidden="true" />
              Loading employees...
            </div>
          ) : (
            <>
              {activeView === "dashboard" && renderDashboard()}
              {activeView === "employees" && renderEmployees()}
              {activeView === "departments" && renderDepartments()}
              {activeView === "leaves" && renderLeaves()}
              {activeView === "salary" && renderSalary()}
              {activeView === "settings" && renderSettings()}
            </>
          )}
        </section>
      </div>
    </main>
  );

  function renderDashboard() {
    return (
      <section className="dashboard-screen">
        <div className="overview-grid">
          <OverviewCard icon={Users} tone="teal" label="Total Employees" value={stats.total} />
          <OverviewCard icon={Building2} tone="amber" label="Total Departments" value={stats.departmentsCount} />
          <OverviewCard icon={Banknote} tone="red" label="Total Salary" value={formatCurrency(stats.payroll)} />
        </div>

        <h2 className="section-title centered">Leave Details</h2>
        <div className="leave-summary-grid">
          <OverviewCard icon={FileText} tone="teal" label="Leave Applied" value={leaveStats.applied} compact />
          <OverviewCard icon={CheckCircle2} tone="green" label="Leave Approved" value={leaveStats.approved} compact />
          <OverviewCard icon={Hourglass} tone="amber" label="Leave Pending" value={leaveStats.pending} compact />
          <OverviewCard icon={XCircle} tone="red" label="Leave Rejected" value={leaveStats.rejected + leaveStats.cancelled} compact />
        </div>
      </section>
    );
  }

  function renderEmployees() {
    if (selectedEmployee) {
      return (
        <EmployeeDetails
          employee={selectedEmployee}
          onBack={() => setSelectedEmployee(null)}
          onEdit={editEmployee}
        />
      );
    }

    return (
      <section className="management-screen">
        <div className="toolbar-row">
          <label className="table-search">
            <Search size={17} aria-hidden="true" />
            <input
              value={employeeSearch}
              onChange={(event) => setEmployeeSearch(event.target.value)}
              placeholder="Search By Employee ID"
              aria-label="Search by employee ID"
            />
          </label>
          <button className="solid-action" type="button" onClick={startNewEmployee}>
            <Plus size={18} aria-hidden="true" />
            Add New Employee
          </button>
        </div>

        {showEmployeeForm && (
          <form className="form-panel" onSubmit={submitEmployee}>
            <div className="section-heading">
              <h2>{editingId ? "Update Employee" : "Add Employee"}</h2>
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  resetForm();
                  setShowEmployeeForm(false);
                }}
                aria-label="Close employee form"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="form-grid">
              <label className="image-picker">
                <span>Employee image</span>
                <img src={employeePhoto(form, 96)} alt="Employee preview" />
                <input type="file" accept="image/*" onChange={updatePhoto} />
              </label>
              <Field label="First name" name="firstName" value={form.firstName} onChange={updateField} error={validationErrors.firstName} />
              <Field label="Last name" name="lastName" value={form.lastName} onChange={updateField} error={validationErrors.lastName} />
              <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} error={validationErrors.email} />
              <Field label="Department" name="department" value={form.department} onChange={updateField} error={validationErrors.department} />
              <Field label="Job title" name="jobTitle" value={form.jobTitle} onChange={updateField} error={validationErrors.jobTitle} />
              <Field label="Salary" name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={updateField} error={validationErrors.salary} />
              <Field label="Hire date" name="hireDate" type="date" value={form.hireDate} onChange={updateField} error={validationErrors.hireDate} />
              <Field label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} />
              <label className="field">
                <span>Gender</span>
                <select name="gender" value={form.gender} onChange={updateField}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field">
                <span>Marital status</span>
                <select name="maritalStatus" value={form.maritalStatus} onChange={updateField}>
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={updateField}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On leave</option>
                </select>
                {validationErrors.status && <small>{validationErrors.status}</small>}
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
              {editingId ? "Save changes" : "Create employee"}
            </button>
          </form>
        )}

        <div className="data-card">
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">No employees found.</div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr key={employee.id}>
                    <td>{index + 1}</td>
                    <td>
                      <img className="employee-photo small" src={employeePhoto(employee, 64)} alt={`${employee.firstName} ${employee.lastName}`} />
                    </td>
                    <td>
                      <strong>{employee.firstName} {employee.lastName}</strong>
                      <span>{employeeCode(employee)}</span>
                    </td>
                    <td>{formatDate(employee.dateOfBirth)}</td>
                    <td>{employee.department}</td>
                    <td>{employee.jobTitle}</td>
                    <td>
                      <div className="button-strip">
                        <button className="pill-action blue" type="button" onClick={() => setSelectedEmployee(employee)}>
                          <Eye size={15} aria-hidden="true" />
                          View
                        </button>
                        <button className="pill-action green" type="button" onClick={() => editEmployee(employee)}>
                          <Edit3 size={15} aria-hidden="true" />
                          Edit
                        </button>
                        <button className="pill-action yellow" type="button" onClick={() => showSalary(employee)}>
                          Salary
                        </button>
                        <button className="pill-action coral" type="button" onClick={() => showLeaves(employee)}>
                          Leave
                        </button>
                        <button className="pill-action danger-icon" type="button" onClick={() => deleteEmployee(employee)} aria-label={`Delete ${employee.firstName}`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  }

  function renderDepartments() {
    return (
      <section className="panel-grid">
        {departmentSummaries.length === 0 ? (
          <article className="data-card">
            <div className="empty-state">No departments found.</div>
          </article>
        ) : (
          departmentSummaries.map((summary) => (
            <article className="department-card" key={summary.department}>
              <Building2 size={28} aria-hidden="true" />
              <div>
                <p>Department</p>
                <h2>{summary.department}</h2>
              </div>
              <div className="mini-stats">
                <span>{summary.total} employees</span>
                <span>{summary.active} active</span>
                <span>{formatCurrency(summary.payroll)}</span>
              </div>
            </article>
          ))
        )}
      </section>
    );
  }

  function renderLeaves() {
    return (
      <section className="management-screen">
        <form className="leave-form data-card" onSubmit={submitLeave}>
          <div className="section-heading">
            <h2>Apply Leave</h2>
          </div>
          <div className="leave-form-grid">
            <label className="field">
              <span>Employee</span>
              <select name="employeeId" value={leaveForm.employeeId} onChange={updateLeaveField} required>
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employeeCode(employee)} - {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Leave type" name="leaveType" value={leaveForm.leaveType} onChange={updateLeaveField} required />
            <Field label="From" name="fromDate" type="date" value={leaveForm.fromDate} onChange={updateLeaveField} required />
            <Field label="To" name="toDate" type="date" value={leaveForm.toDate} onChange={updateLeaveField} required />
            <Field label="Description" name="description" value={leaveForm.description} onChange={updateLeaveField} />
          </div>
          <button className="solid-action" type="submit" disabled={saving}>
            <Plus size={17} aria-hidden="true" />
            Save Leave
          </button>
        </form>

        <label className="table-search narrow">
          <Search size={17} aria-hidden="true" />
          <input
            value={leaveSearch}
            onChange={(event) => setLeaveSearch(event.target.value)}
            placeholder="Search By Status"
            aria-label="Search leaves by status"
          />
        </label>

        <div className="data-card">
          {filteredLeaveRows.length === 0 ? (
            <div className="empty-state">No leave records found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Description</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{row.leaveType}</strong>
                      <span>{employeeCode(row.employee)} - {row.employee.firstName} {row.employee.lastName}</span>
                    </td>
                    <td>{formatDate(row.fromDate)}</td>
                    <td>{formatDate(row.toDate)}</td>
                    <td>{row.description || "-"}</td>
                    <td>{formatDate(row.appliedDate)}</td>
                    <td>
                      <span className={`leave-status ${row.status.toLowerCase()}`}>
                        {leaveStatusLabels[row.status]}
                      </span>
                    </td>
                    <td>
                      <input
                        className="reason-input"
                        value={decisionReasons[row.id] ?? row.decisionReason ?? ""}
                        onChange={(event) => updateDecisionReason(row.id, event.target.value)}
                        placeholder="Reason"
                      />
                    </td>
                    <td>
                      <div className="button-strip leave-actions">
                        <button className="pill-action green" type="button" onClick={() => updateLeaveDecision(row, "APPROVED")}>Approve</button>
                        <button className="pill-action yellow" type="button" onClick={() => updateLeaveDecision(row, "PENDING")}>Pending</button>
                        <button className="pill-action coral" type="button" onClick={() => updateLeaveDecision(row, "CANCELLED")}>Cancel</button>
                        <button className="pill-action danger-icon wide" type="button" onClick={() => updateLeaveDecision(row, "REJECTED")}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  }

  function renderSalary() {
    return (
      <section className="management-screen">
        <label className="table-search narrow align-right">
          <Search size={17} aria-hidden="true" />
          <input
            value={salarySearch}
            onChange={(event) => setSalarySearch(event.target.value)}
            placeholder="Search By Emp ID"
            aria-label="Search salary by employee ID"
          />
        </label>

        <div className="data-card">
          {salaryRows.length === 0 ? (
            <div className="empty-state">No salary records found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>EMP ID</th>
                  <th>Salary</th>
                  <th>Allowance</th>
                  <th>Deduction</th>
                  <th>Total</th>
                  <th>Pay Date</th>
                </tr>
              </thead>
              <tbody>
                {salaryRows.map((row) => (
                  <tr key={row.employee.id}>
                    <td>{row.serial}</td>
                    <td>{employeeCode(row.employee)}</td>
                    <td>{formatCurrency(row.salary)}</td>
                    <td>{formatCurrency(row.allowance)}</td>
                    <td>{formatCurrency(row.deduction)}</td>
                    <td>{formatCurrency(row.total)}</td>
                    <td>{formatDate(row.payDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="settings-grid">
        <article className="data-card account-panel">
          <div className="avatar large">{initials(auth.user?.name)}</div>
          <div>
            <p>Account</p>
            <h2>{auth.user?.name}</h2>
            <span>{auth.user?.email}</span>
          </div>
        </article>
        <article className="data-card account-panel split">
          <div>
            <p>Session</p>
            <h2>JWT active</h2>
            <span>{Math.round((auth.expiresIn || 0) / 60)} minutes</span>
          </div>
          <button className="danger-button" type="button" onClick={() => handleLogout()}>
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </article>
      </section>
    );
  }
}

function AuthPage({ mode, form, saving, error, onModeChange, onChange, onSubmit }) {
  const isSignup = mode === "signup";
  const serviceChips = ["Backend", "AI Integration", "Cloud", "Microservices"];

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="auth-brand-card">
          <div className="brand-lockup" aria-label="MensPingo Tech Solutions">
            <div className="brand-logo-panel">
              <img src={menspingoLogo} alt="MensPingo logo" />
            </div>
            <div>
              <span className="brand-script">MensPingo Tech Solutions</span>
              <span className="brand-tagline">Smart Tech. Real Connections.</span>
            </div>
          </div>

          <div className="signal-card" aria-hidden="true">
            <span className="signal-node primary" />
            <span className="signal-node secondary" />
            <span className="signal-node tertiary" />
            <span className="signal-line horizontal" />
            <span className="signal-line vertical" />
            <span className="signal-wave" />
          </div>

          <p className="auth-eyebrow">Secure Internal Management Portal</p>
          <h1>MensPingo Employee Management System</h1>
          <p>
            Streamline HR workflows, team records, payroll insights, and approval processes in one secure MensPingo
            workspace.
          </p>

          <div className="service-chips" aria-label="MensPingo services">
            {serviceChips.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-card" id="auth-panel" aria-label={isSignup ? "Sign up" : "Log in"}>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button className={!isSignup ? "active" : ""} type="button" onClick={() => onModeChange("login")}>
            <LogIn size={17} aria-hidden="true" />
            Login
          </button>
          <button className={isSignup ? "active" : ""} type="button" onClick={() => onModeChange("signup")}>
            <UserPlus size={17} aria-hidden="true" />
            Signup
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <p className="auth-form-kicker">Employee Management Portal</p>
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          {error && <div className="notice error">{error}</div>}

          <div className="auth-fields">
            {isSignup && (
              <Field label="Name" name="name" value={form.name} onChange={onChange} required />
            )}
            <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} minLength={isSignup ? 8 : undefined} required />
          </div>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : isSignup ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
            {isSignup ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ activeView, onSelect }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={activeView === id ? "active" : ""}
            key={id}
            type="button"
            onClick={() => onSelect(id)}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function OverviewCard({ icon: Icon, tone, label, value, compact = false }) {
  return (
    <article className={compact ? "overview-card compact" : "overview-card"}>
      <div className={`overview-icon ${tone}`}>
        <Icon size={compact ? 26 : 30} aria-hidden="true" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function EmployeeDetails({ employee, onBack, onEdit }) {
  const details = [
    ["Name", `${employee.firstName} ${employee.lastName}`],
    ["Employee ID", employeeCode(employee)],
    ["Date of Birth", formatDate(employee.dateOfBirth)],
    ["Gender", employee.gender || "-"],
    ["Department", employee.department],
    ["Position", employee.jobTitle],
    ["Marital Status", employee.maritalStatus || "-"]
  ];

  return (
    <section className="employee-detail-card">
      <img className="employee-photo large-photo" src={employeePhoto(employee, 260)} alt={`${employee.firstName} ${employee.lastName}`} />
      <div className="detail-content">
        <h2>Employee Details</h2>
        <dl>
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}:</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="detail-actions">
          <button className="ghost-action" type="button" onClick={onBack}>Back</button>
          <button className="solid-action" type="button" onClick={() => onEdit(employee)}>Edit Employee</button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}

function readSavedAuth() {
  try {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) {
      return null;
    }

    const parsedAuth = JSON.parse(savedAuth);
    if (parsedAuth?.user?.role !== "ADMIN") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsedAuth;
  } catch {
    return null;
  }
}

function initials(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "EM";
}

function employeeCode(employee) {
  if (employee.employeeCode) {
    return employee.employeeCode;
  }

  const first = employee.firstName?.trim()?.[0] || "E";
  const last = employee.lastName?.trim()?.[0] || "M";
  return `${first}${last}${String(employee.id || 0).padStart(4, "0")}`.toUpperCase();
}

function employeePhoto(employee, size) {
  if (employee.photoUrl) {
    return employee.photoUrl;
  }

  const label = initials(`${employee.firstName || ""} ${employee.lastName || ""}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" rx="${size / 2}" fill="#15998e"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="${size / 3}" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function offsetDate(value, days) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default App;
