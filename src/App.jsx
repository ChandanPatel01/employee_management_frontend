import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Edit3,
  Eye,
  FileArchive,
  FileText,
  Gauge,
  GraduationCap,
  Hourglass,
  IdCard,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserCheck,
  Users,
  X,
  XCircle
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const API_PREFIX = `${API_BASE_URL}/api`;
const AUTH_STORAGE_KEY = "employee-management-auth";
const ACCESS_DENIED_MESSAGE = "Access denied. You do not have permission to access this module.";
// To swap in your uploaded PNG logo, place it at frontend/public/logo.png and change this to "/logo.png".
const BRAND_LOGO_SRC = "/assets/menspingo-logo.svg";

const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  jobTitle: "",
  salary: "",
  hireDate: today(),
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  photoUrl: "",
  status: "ACTIVE"
};

const emptyLeaveForm = {
  employeeId: "",
  leaveType: "Sick Leave",
  fromDate: today(),
  toDate: today(),
  description: ""
};

const emptyCustomerForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  projectName: "",
  projectStatus: "Active",
  paymentStatus: "Pending",
  paymentHistory: "",
  assignedTeam: "",
  supportTickets: "",
  previousCommunication: "",
  notes: ""
};

const emptyCrmTaskForm = {
  customerId: "",
  title: "",
  description: "",
  followUpDate: today(),
  followUpTime: "10:00",
  priority: "MEDIUM",
  status: "PENDING",
  assignedTo: "",
  reminderType: "EMAIL"
};

const emptyCommunicationForm = {
  customerId: "",
  communicationType: "EMAIL",
  subject: "",
  summary: "",
  communicationDate: nowLocal(),
  nextAction: "",
  createdBy: ""
};

const emptyDailyUpdateForm = {
  updateDate: today(),
  workSummary: "",
  blockers: "",
  hoursWorked: "8"
};

const emptyMyLeaveForm = {
  leaveType: "Sick Leave",
  fromDate: today(),
  toDate: today(),
  description: ""
};

const emptyTeamTaskForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "PENDING",
  dueDate: today(),
  assignedTo: ""
};

const emptyProjectForm = {
  projectName: "",
  clientName: "",
  startDate: today(),
  deadline: today(),
  status: "PLANNED",
  assignedTeam: ""
};

const emptyCandidateForm = {
  name: "",
  email: "",
  phone: "",
  skill: "",
  experience: "",
  resumeUrl: "",
  status: "NEW",
  interviewDate: today(),
  notes: ""
};

const emptyDocumentForm = {
  employeeId: "",
  documentType: "",
  documentUrl: ""
};

const emptyAttendanceForm = {
  userEmail: "",
  attendanceDate: today(),
  status: "PRESENT",
  checkInTime: "09:30",
  checkOutTime: "18:30",
  notes: ""
};

const leaveStatusLabels = {
  PENDING: "Pending",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected"
};

const roleDashboardTitles = {
  EMPLOYEE: "My Workspace",
  TEAM_LEAD: "Team Lead Dashboard",
  HR: "HR Dashboard",
  ADMIN: "Admin Dashboard",
  FOUNDER: "Founder Dashboard"
};

const allNavItems = {
  dashboard: { id: "dashboard", label: "Dashboard", title: "Management Dashboard", icon: Gauge },
  employees: { id: "employees", label: "Employees", title: "Manage Employees", icon: Users },
  departments: { id: "departments", label: "Departments", title: "Departments", icon: Building2 },
  leaves: { id: "leaves", label: "Leaves", title: "Manage Leaves", icon: CalendarCheck2 },
  salary: { id: "salary", label: "Salary", title: "Salary History", icon: Banknote },
  crm: { id: "crm", label: "CRM Portal", title: "CRM Portal", icon: FileText },
  settings: { id: "settings", label: "Settings", title: "Settings", icon: Settings },
  myTasks: { id: "myTasks", label: "My Tasks", title: "My Workspace", icon: ClipboardList },
  dailyUpdates: { id: "dailyUpdates", label: "Daily Updates", title: "Daily Updates", icon: ClipboardCheck },
  learningResources: { id: "learningResources", label: "Learning Resources", title: "Learning Resources", icon: BookOpen },
  profile: { id: "profile", label: "Profile", title: "My Profile", icon: IdCard },
  myAttendance: { id: "myAttendance", label: "My Attendance", title: "My Attendance", icon: CalendarCheck2 },
  myLeave: { id: "myLeave", label: "My Leave", title: "My Leave", icon: FileText },
  teamTasks: { id: "teamTasks", label: "Team Tasks", title: "Team Lead Dashboard", icon: ClipboardList },
  projectManagement: { id: "projectManagement", label: "Project Management", title: "Project Management", icon: BriefcaseBusiness },
  reports: { id: "reports", label: "Reports", title: "Reports", icon: BarChart3 },
  teamUpdates: { id: "teamUpdates", label: "Team Updates", title: "Team Updates", icon: ClipboardCheck },
  employeePerformance: { id: "employeePerformance", label: "Employee Performance", title: "Employee Performance", icon: UserCheck },
  candidates: { id: "candidates", label: "Candidates", title: "HR Dashboard", icon: UserPlus },
  documents: { id: "documents", label: "Documents", title: "Employee Documents", icon: FileArchive },
  attendance: { id: "attendance", label: "Attendance", title: "Attendance", icon: CalendarCheck2 },
  hrModule: { id: "hrModule", label: "HR Module", title: "HR Module", icon: GraduationCap },
  rolePermissions: { id: "rolePermissions", label: "Role & Permission Management", title: "Role & Permission Management", icon: ShieldCheck }
};

const roleMenus = {
  EMPLOYEE: ["myTasks", "dailyUpdates", "learningResources", "profile", "myAttendance", "myLeave"],
  TEAM_LEAD: ["teamTasks", "projectManagement", "reports", "teamUpdates", "employeePerformance"],
  HR: ["candidates", "employees", "documents", "attendance", "leaves", "salary"],
  ADMIN: ["dashboard", "employees", "departments", "leaves", "salary", "crm", "hrModule", "projectManagement", "reports", "settings", "rolePermissions"],
  FOUNDER: ["dashboard", "employees", "departments", "leaves", "salary", "crm", "hrModule", "projectManagement", "reports", "settings", "rolePermissions"]
};

function App() {
  const [auth, setAuth] = useState(readSavedAuth);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authSaving, setAuthSaving] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [crmCustomers, setCrmCustomers] = useState([]);
  const [crmTasks, setCrmTasks] = useState([]);
  const [crmCommunications, setCrmCommunications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [crmTaskForm, setCrmTaskForm] = useState(emptyCrmTaskForm);
  const [communicationForm, setCommunicationForm] = useState(emptyCommunicationForm);
  const [dailyUpdateForm, setDailyUpdateForm] = useState(emptyDailyUpdateForm);
  const [myLeaveForm, setMyLeaveForm] = useState(emptyMyLeaveForm);
  const [teamTaskForm, setTeamTaskForm] = useState(emptyTeamTaskForm);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [attendanceForm, setAttendanceForm] = useState(emptyAttendanceForm);
  const [decisionReasons, setDecisionReasons] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editingCrmTaskId, setEditingCrmTaskId] = useState(null);
  const [editingCommunicationId, setEditingCommunicationId] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [salarySearch, setSalarySearch] = useState("");
  const [crmTab, setCrmTab] = useState("customers");
  const [crmCustomerSearch, setCrmCustomerSearch] = useState("");
  const [crmTaskFilter, setCrmTaskFilter] = useState("all");
  const [crmCommunicationFilter, setCrmCommunicationFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [portalTasks, setPortalTasks] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [learningResources, setLearningResources] = useState([]);
  const [roleProfile, setRoleProfile] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [teamUpdates, setTeamUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskSummary, setTaskSummary] = useState(null);
  const [performanceRows, setPerformanceRows] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crmLoading, setCrmLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const userRole = auth?.user?.role || "EMPLOYEE";
  const navItems = useMemo(() => getNavigationForRole(userRole), [userRole]);
  const canAccessActiveView = navItems.some((item) => item.id === activeView);

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
    const payroll = employees.reduce((total, employee) => total + Number(employee.salary || 0), 0);
    return {
      total: employees.length,
      departmentsCount: departments.length,
      payroll
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

  const filteredCrmCustomers = useMemo(() => {
    const query = crmCustomerSearch.trim().toLowerCase();
    if (!query) {
      return crmCustomers;
    }

    return crmCustomers.filter((customer) => {
      return (customer.companyName || "").toLowerCase().includes(query)
        || (customer.contactPerson || "").toLowerCase().includes(query)
        || (customer.email || "").toLowerCase().includes(query)
        || (customer.projectName || "").toLowerCase().includes(query);
    });
  }, [crmCustomerSearch, crmCustomers]);

  const filteredCrmCommunications = useMemo(() => {
    if (!crmCommunicationFilter) {
      return crmCommunications;
    }

    return crmCommunications.filter((communication) => String(communication.customerId) === crmCommunicationFilter);
  }, [crmCommunicationFilter, crmCommunications]);

  useEffect(() => {
    if (!auth?.token || navItems.length === 0) {
      return;
    }

    if (!navItems.some((item) => item.id === activeView)) {
      setActiveView(navItems[0].id);
    }
  }, [auth?.token, activeView, navItems]);

  useEffect(() => {
    if (auth?.token && canAccessActiveView) {
      loadViewData(activeView);
    }
  }, [auth?.token, activeView, canAccessActiveView]);

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

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      setAuth(data);
      setActiveView(getDefaultViewForRole(data.user?.role));
      setAuthForm({ name: "", email: "", password: "" });
    } catch (apiError) {
      setAuthError(apiError.message);
    } finally {
      setAuthSaving(false);
    }
  }

  function handleLogout(showMessage = true) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setEmployees([]);
    setLeaves([]);
    setCrmCustomers([]);
    setCrmTasks([]);
    setCrmCommunications([]);
    setForm(emptyForm);
    setLeaveForm(emptyLeaveForm);
    setCustomerForm(emptyCustomerForm);
    setCrmTaskForm(emptyCrmTaskForm);
    setCommunicationForm(emptyCommunicationForm);
    setDailyUpdateForm(emptyDailyUpdateForm);
    setMyLeaveForm(emptyMyLeaveForm);
    setTeamTaskForm(emptyTeamTaskForm);
    setProjectForm(emptyProjectForm);
    setCandidateForm(emptyCandidateForm);
    setDocumentForm(emptyDocumentForm);
    setAttendanceForm(emptyAttendanceForm);
    setEditingId(null);
    setEditingCustomerId(null);
    setEditingCrmTaskId(null);
    setEditingCommunicationId(null);
    setSelectedEmployee(null);
    setShowEmployeeForm(false);
    setPortalTasks([]);
    setDailyUpdates([]);
    setLearningResources([]);
    setRoleProfile(null);
    setMyAttendance([]);
    setMyLeaves([]);
    setTeamTasks([]);
    setTeamUpdates([]);
    setProjects([]);
    setTaskSummary(null);
    setPerformanceRows([]);
    setCandidates([]);
    setDocuments([]);
    setAttendance([]);
    setManagedUsers([]);
    setRoles([]);
    setMessage(showMessage ? "Signed out." : "");
    setError(showMessage ? "" : "Session expired. Please log in again.");
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

  async function loadCrmData() {
    if (!auth?.token) {
      return;
    }

    setCrmLoading(true);
    setError("");

    try {
      const [customers, tasks, communications] = await Promise.all([
        request(`${API_PREFIX}/crm/customers`),
        request(`${API_PREFIX}/crm/tasks${crmTaskFilter === "all" ? "" : `/${crmTaskFilter}`}`),
        request(`${API_PREFIX}/crm/communications`)
      ]);
      setCrmCustomers(customers);
      setCrmTasks(tasks);
      setCrmCommunications(communications);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setCrmLoading(false);
    }
  }

  async function loadCrmCustomers() {
    if (!auth?.token) {
      return;
    }

    try {
      const data = await request(`${API_PREFIX}/crm/customers`);
      setCrmCustomers(data);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function loadCrmTasks(nextFilter = crmTaskFilter) {
    if (!auth?.token) {
      return;
    }

    setCrmTaskFilter(nextFilter);
    setCrmLoading(true);
    setError("");

    try {
      const endpoint = nextFilter === "all" ? `${API_PREFIX}/crm/tasks` : `${API_PREFIX}/crm/tasks/${nextFilter}`;
      const data = await request(endpoint);
      setCrmTasks(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setCrmLoading(false);
    }
  }

  async function loadCrmCommunications() {
    if (!auth?.token) {
      return;
    }

    try {
      const data = await request(`${API_PREFIX}/crm/communications`);
      setCrmCommunications(data);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function loadViewData(view = activeView) {
    if (!auth?.token) {
      return;
    }

    if (["dashboard", "employees", "departments", "salary"].includes(view)) {
      await loadEmployees("");
    }

    if (["dashboard", "leaves"].includes(view)) {
      await loadLeaves();
    }

    if (view === "crm") {
      await loadCrmData();
      return;
    }

    await loadRoleViewData(view);
  }

  async function loadRoleViewData(view) {
    setLoading(true);
    setError("");

    try {
      switch (view) {
        case "myTasks":
          setPortalTasks(await request(`${API_PREFIX}/portal/my-tasks`));
          break;
        case "dailyUpdates":
          setDailyUpdates(await request(`${API_PREFIX}/portal/daily-updates`));
          break;
        case "learningResources":
          setLearningResources(await request(`${API_PREFIX}/portal/learning-resources`));
          break;
        case "profile":
          setRoleProfile(await request(`${API_PREFIX}/portal/profile`));
          break;
        case "myAttendance":
          setMyAttendance(await request(`${API_PREFIX}/portal/my-attendance`));
          break;
        case "myLeave":
          setMyLeaves(await request(`${API_PREFIX}/portal/my-leaves`));
          break;
        case "teamTasks":
          setTeamTasks(await request(`${API_PREFIX}/team/tasks`));
          break;
        case "projectManagement":
          setProjects(await request(`${API_PREFIX}/projects`));
          break;
        case "reports": {
          const [summary, progress] = await Promise.all([
            request(`${API_PREFIX}/reports/task-summary`),
            request(`${API_PREFIX}/reports/team-progress`)
          ]);
          setTaskSummary(summary);
          setProjects(progress);
          break;
        }
        case "teamUpdates":
          setTeamUpdates(await request(`${API_PREFIX}/team/updates`));
          break;
        case "employeePerformance":
          setPerformanceRows(await request(`${API_PREFIX}/team/performance`));
          break;
        case "candidates":
          setCandidates(await request(`${API_PREFIX}/hr/candidates`));
          break;
        case "documents":
          setDocuments(await request(`${API_PREFIX}/hr/documents`));
          break;
        case "attendance":
          setAttendance(await request(`${API_PREFIX}/hr/attendance`));
          break;
        case "hrModule": {
          const [candidateRows, documentRows, attendanceRows] = await Promise.all([
            request(`${API_PREFIX}/hr/candidates`),
            request(`${API_PREFIX}/hr/documents`),
            request(`${API_PREFIX}/hr/attendance`)
          ]);
          setCandidates(candidateRows);
          setDocuments(documentRows);
          setAttendance(attendanceRows);
          break;
        }
        case "rolePermissions": {
          const [userRows, roleRows] = await Promise.all([
            request(`${API_PREFIX}/admin/users`),
            request(`${API_PREFIX}/admin/roles`)
          ]);
          setManagedUsers(userRows);
          setRoles(roleRows);
          break;
        }
        default:
          break;
      }
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
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

  function updateCustomerField(event) {
    const { name, value } = event.target;
    setCustomerForm((current) => ({ ...current, [name]: value }));
  }

  function updateCrmTaskField(event) {
    const { name, value } = event.target;
    setCrmTaskForm((current) => ({ ...current, [name]: value }));
  }

  function updateCommunicationField(event) {
    const { name, value } = event.target;
    setCommunicationForm((current) => ({ ...current, [name]: value }));
  }

  function updateStateField(setter, event) {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
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
      const data = await request(`${API_PREFIX}/uploads/employee-photos`, { method: "POST", body });
      setForm((current) => ({ ...current, photoUrl: data.photoUrl }));
    } catch (apiError) {
      setError(apiError.message || "Please select another image.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setValidationErrors({});
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

  async function submitEmployee(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    setValidationErrors({});

    try {
      const payload = { ...form, salary: Number(form.salary), dateOfBirth: form.dateOfBirth || null };
      const path = editingId ? `${API_PREFIX}/employees/${editingId}` : `${API_PREFIX}/employees`;
      const method = editingId ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(payload) });
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
        body: JSON.stringify({ ...leaveForm, employeeId: Number(leaveForm.employeeId) })
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

  function resetCustomerForm() {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
  }

  function resetCrmTaskForm() {
    setEditingCrmTaskId(null);
    setCrmTaskForm(emptyCrmTaskForm);
  }

  function resetCommunicationForm() {
    setEditingCommunicationId(null);
    setCommunicationForm({ ...emptyCommunicationForm, createdBy: auth?.user?.name || "" });
  }

  async function submitCustomer(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const path = editingCustomerId ? `${API_PREFIX}/crm/customers/${editingCustomerId}` : `${API_PREFIX}/crm/customers`;
      const method = editingCustomerId ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(customerForm) });
      setMessage(editingCustomerId ? "Customer updated." : "Customer created.");
      resetCustomerForm();
      await loadCrmCustomers();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  function editCustomer(customer) {
    setCrmTab("customers");
    setEditingCustomerId(customer.id);
    setCustomerForm({
      companyName: customer.companyName || "",
      contactPerson: customer.contactPerson || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      projectName: customer.projectName || "",
      projectStatus: customer.projectStatus || "",
      paymentStatus: customer.paymentStatus || "",
      paymentHistory: customer.paymentHistory || "",
      assignedTeam: customer.assignedTeam || "",
      supportTickets: customer.supportTickets || "",
      previousCommunication: customer.previousCommunication || "",
      notes: customer.notes || ""
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCustomer(customer) {
    const confirmed = window.confirm(`Delete ${customer.companyName}? Related CRM tasks and communications will also be removed.`);
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await request(`${API_PREFIX}/crm/customers/${customer.id}`, { method: "DELETE" });
      setMessage("Customer deleted.");
      await loadCrmData();
      if (editingCustomerId === customer.id) {
        resetCustomerForm();
      }
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function submitCrmTask(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const path = editingCrmTaskId ? `${API_PREFIX}/crm/tasks/${editingCrmTaskId}` : `${API_PREFIX}/crm/tasks`;
      const method = editingCrmTaskId ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify({ ...crmTaskForm, customerId: Number(crmTaskForm.customerId) }) });
      setMessage(editingCrmTaskId ? "Follow-up task updated." : "Follow-up task created.");
      resetCrmTaskForm();
      await loadCrmTasks();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  function editCrmTask(task) {
    setCrmTab("tasks");
    setEditingCrmTaskId(task.id);
    setCrmTaskForm({
      customerId: String(task.customerId || ""),
      title: task.title || "",
      description: task.description || "",
      followUpDate: task.followUpDate || today(),
      followUpTime: normalizeTime(task.followUpTime),
      priority: task.priority || "MEDIUM",
      status: task.status || "PENDING",
      assignedTo: task.assignedTo || "",
      reminderType: task.reminderType || "EMAIL"
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateCrmTaskStatus(task, status) {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await request(`${API_PREFIX}/crm/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerId: task.customerId,
          title: task.title,
          description: task.description,
          followUpDate: task.followUpDate,
          followUpTime: normalizeTime(task.followUpTime),
          priority: task.priority,
          status,
          assignedTo: task.assignedTo,
          reminderType: task.reminderType
        })
      });
      setMessage("Task status updated.");
      await loadCrmTasks();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCrmTask(task) {
    const confirmed = window.confirm(`Delete follow-up task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await request(`${API_PREFIX}/crm/tasks/${task.id}`, { method: "DELETE" });
      setMessage("Follow-up task deleted.");
      await loadCrmTasks();
      if (editingCrmTaskId === task.id) {
        resetCrmTaskForm();
      }
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function submitCommunication(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const path = editingCommunicationId
        ? `${API_PREFIX}/crm/communications/${editingCommunicationId}`
        : `${API_PREFIX}/crm/communications`;
      const method = editingCommunicationId ? "PUT" : "POST";
      await request(path, {
        method,
        body: JSON.stringify({
          ...communicationForm,
          customerId: Number(communicationForm.customerId),
          createdBy: communicationForm.createdBy || auth.user?.name || "Admin"
        })
      });
      setMessage(editingCommunicationId ? "Communication updated." : "Communication note added.");
      resetCommunicationForm();
      await loadCrmCommunications();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  function editCommunication(communication) {
    setCrmTab("communications");
    setEditingCommunicationId(communication.id);
    setCommunicationForm({
      customerId: String(communication.customerId || ""),
      communicationType: communication.communicationType || "EMAIL",
      subject: communication.subject || "",
      summary: communication.summary || "",
      communicationDate: normalizeDateTime(communication.communicationDate),
      nextAction: communication.nextAction || "",
      createdBy: communication.createdBy || auth.user?.name || ""
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCommunication(communication) {
    const confirmed = window.confirm(`Delete communication "${communication.subject}"?`);
    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await request(`${API_PREFIX}/crm/communications/${communication.id}`, { method: "DELETE" });
      setMessage("Communication deleted.");
      await loadCrmCommunications();
      if (editingCommunicationId === communication.id) {
        resetCommunicationForm();
      }
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleDailyUpdateSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/portal/daily-updates`, {
        method: "POST",
        body: JSON.stringify({ ...dailyUpdateForm, hoursWorked: Number(dailyUpdateForm.hoursWorked || 0) })
      });
      setDailyUpdateForm(emptyDailyUpdateForm);
      setMessage("Daily update submitted.");
      await loadRoleViewData("dailyUpdates");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleMyLeaveSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/portal/my-leaves`, {
        method: "POST",
        body: JSON.stringify(myLeaveForm)
      });
      setMyLeaveForm(emptyMyLeaveForm);
      setMessage("Leave request submitted.");
      await loadRoleViewData("myLeave");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTeamTaskSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/team/tasks`, {
        method: "POST",
        body: JSON.stringify(teamTaskForm)
      });
      setTeamTaskForm(emptyTeamTaskForm);
      setMessage("Team task saved.");
      await loadRoleViewData("teamTasks");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateTeamTaskStatus(task, status) {
    setError("");
    try {
      await request(`${API_PREFIX}/team/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...task, status })
      });
      setMessage("Task status updated.");
      await loadRoleViewData("teamTasks");
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function handleProjectSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/projects`, {
        method: "POST",
        body: JSON.stringify(projectForm)
      });
      setProjectForm(emptyProjectForm);
      setMessage("Project saved.");
      await loadRoleViewData("projectManagement");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCandidateSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/hr/candidates`, {
        method: "POST",
        body: JSON.stringify(candidateForm)
      });
      setCandidateForm(emptyCandidateForm);
      setMessage("Candidate saved.");
      await loadRoleViewData("candidates");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDocumentSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/hr/documents`, {
        method: "POST",
        body: JSON.stringify({ ...documentForm, employeeId: Number(documentForm.employeeId || 0) })
      });
      setDocumentForm(emptyDocumentForm);
      setMessage("Document saved.");
      await loadRoleViewData("documents");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAttendanceSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(`${API_PREFIX}/hr/attendance`, {
        method: "POST",
        body: JSON.stringify(attendanceForm)
      });
      setAttendanceForm(emptyAttendanceForm);
      setMessage("Attendance saved.");
      await loadRoleViewData("attendance");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateUserRole(userId, role) {
    setError("");

    try {
      await request(`${API_PREFIX}/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role })
      });
      setMessage("User role updated.");
      await loadRoleViewData("rolePermissions");
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function refreshActiveView() {
    loadViewData(activeView);
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

  const activeItem = navItems.find((item) => item.id === activeView) || navItems[0] || allNavItems.myTasks;
  const pageTitle = selectedEmployee
    ? "Employee Details"
    : activeView === "dashboard"
      ? roleDashboardTitles[userRole] || activeItem.title
      : activeItem.title;
  const pageSubtitle = selectedEmployee ? "Employee profile, work details, and quick management actions." : getPageSubtitle(activeView);

  return (
    <main className="app-shell">
      <header className="main-header">
        <div className="header-brand">
          <BrandLogo title="MensPingo EMS" subtitle="Tech Solutions" compact />
        </div>
        <div className="header-welcome">
          <span>Welcome back,</span>
          <strong>{auth.user?.name || "Admin"}</strong>
        </div>
        <button className="logout-button" type="button" onClick={() => handleLogout()}>Logout</button>
      </header>

      <div className="layout-shell">
        <Sidebar activeView={activeView} items={navItems} onSelect={selectView} />

        <section className="content-shell">
          <section className="page-heading">
            <div className="page-title-stack">
              <div>
                <h1>{pageTitle}</h1>
                <p>{pageSubtitle}</p>
              </div>
            </div>
            {!selectedEmployee && (
              <button className="refresh-button" type="button" onClick={refreshActiveView} disabled={loading || crmLoading}>
                <RefreshCcw size={17} aria-hidden="true" />
                Refresh
              </button>
            )}
          </section>

          {(message || error) && <div className={error ? "notice error" : "notice success"} role="status">{error || message}</div>}

          {loading && employees.length === 0 ? (
            <div className="screen-loader">
              <Loader2 className="spin" size={28} aria-hidden="true" />
              Loading {activeItem.label.toLowerCase()}...
            </div>
          ) : (
            <>
              {!canAccessActiveView ? renderAccessDenied() : renderActiveView()}
            </>
          )}
        </section>
      </div>
    </main>
  );

  function renderActiveView() {
    const views = {
      dashboard: renderDashboard,
      employees: renderEmployees,
      departments: renderDepartments,
      leaves: renderLeaves,
      salary: renderSalary,
      crm: renderCrmPortal,
      settings: renderSettings,
      myTasks: renderMyTasks,
      dailyUpdates: renderDailyUpdates,
      learningResources: renderLearningResources,
      profile: renderProfile,
      myAttendance: renderMyAttendance,
      myLeave: renderMyLeave,
      teamTasks: renderTeamTasks,
      projectManagement: renderProjectManagement,
      reports: renderReports,
      teamUpdates: renderTeamUpdates,
      employeePerformance: renderEmployeePerformance,
      candidates: renderCandidates,
      documents: renderDocuments,
      attendance: renderAttendance,
      hrModule: renderHrModule,
      rolePermissions: renderRolePermissions
    };

    return (views[activeView] || renderAccessDenied)();
  }

  function renderAccessDenied() {
    return (
      <section className="access-denied-card">
        <ShieldCheck size={34} aria-hidden="true" />
        <h2>Access denied</h2>
        <p>{ACCESS_DENIED_MESSAGE}</p>
      </section>
    );
  }

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
      return <EmployeeDetails employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} onEdit={editEmployee} />;
    }

    return (
      <section className="management-screen">
        <div className="toolbar-row">
          <label className="table-search">
            <Search size={17} aria-hidden="true" />
            <input value={employeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder="Search By Employee ID" aria-label="Search by employee ID" />
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
              <button className="icon-button" type="button" onClick={() => { resetForm(); setShowEmployeeForm(false); }} aria-label="Close employee form">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="form-grid">
              <label className="image-picker">
                <span>Employee image</span>
                <img src={employeePhoto(form, 96)} alt="Employee preview" />
                <input type="file" accept="image/*" onChange={updatePhoto} />
              </label>
              <Field label="First name" name="firstName" value={form.firstName} onChange={updateField} error={validationErrors.firstName} required />
              <Field label="Last name" name="lastName" value={form.lastName} onChange={updateField} error={validationErrors.lastName} required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} error={validationErrors.email} required />
              <Field label="Department" name="department" value={form.department} onChange={updateField} error={validationErrors.department} required />
              <Field label="Job title" name="jobTitle" value={form.jobTitle} onChange={updateField} error={validationErrors.jobTitle} required />
              <Field label="Salary" name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={updateField} error={validationErrors.salary} required />
              <Field label="Hire date" name="hireDate" type="date" value={form.hireDate} onChange={updateField} error={validationErrors.hireDate} required />
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
          {filteredEmployees.length === 0 ? <div className="empty-state">No employees found.</div> : (
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
                    <td><img className="employee-photo small" src={employeePhoto(employee, 64)} alt={`${employee.firstName} ${employee.lastName}`} /></td>
                    <td><strong>{employee.firstName} {employee.lastName}</strong><span>{employeeCode(employee)}</span></td>
                    <td>{formatDate(employee.dateOfBirth)}</td>
                    <td>{employee.department}</td>
                    <td>{employee.jobTitle}</td>
                    <td>
                      <div className="button-strip">
                        <button className="pill-action blue" type="button" onClick={() => setSelectedEmployee(employee)}><Eye size={15} aria-hidden="true" />View</button>
                        <button className="pill-action green" type="button" onClick={() => editEmployee(employee)}><Edit3 size={15} aria-hidden="true" />Edit</button>
                        <button className="pill-action yellow" type="button" onClick={() => showSalary(employee)}>Salary</button>
                        <button className="pill-action coral" type="button" onClick={() => showLeaves(employee)}>Leave</button>
                        <button className="pill-action danger-icon" type="button" onClick={() => deleteEmployee(employee)} aria-label={`Delete ${employee.firstName}`}><Trash2 size={15} aria-hidden="true" /></button>
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
        {departmentSummaries.length === 0 ? <article className="data-card"><div className="empty-state">No departments found.</div></article> : (
          departmentSummaries.map((summary) => (
            <article className="department-card" key={summary.department}>
              <Building2 size={28} aria-hidden="true" />
              <div><p>Department</p><h2>{summary.department}</h2></div>
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
          <div className="section-heading"><h2>Apply Leave</h2></div>
          <div className="leave-form-grid">
            <label className="field">
              <span>Employee</span>
              <select name="employeeId" value={leaveForm.employeeId} onChange={updateLeaveField} required>
                <option value="">Select employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employeeCode(employee)} - {employee.firstName} {employee.lastName}</option>)}
              </select>
            </label>
            <Field label="Leave type" name="leaveType" value={leaveForm.leaveType} onChange={updateLeaveField} required />
            <Field label="From" name="fromDate" type="date" value={leaveForm.fromDate} onChange={updateLeaveField} required />
            <Field label="To" name="toDate" type="date" value={leaveForm.toDate} onChange={updateLeaveField} required />
            <Field label="Description" name="description" value={leaveForm.description} onChange={updateLeaveField} />
          </div>
          <button className="solid-action" type="submit" disabled={saving}><Plus size={17} aria-hidden="true" />Save Leave</button>
        </form>
        <label className="table-search narrow">
          <Search size={17} aria-hidden="true" />
          <input value={leaveSearch} onChange={(event) => setLeaveSearch(event.target.value)} placeholder="Search By Status" aria-label="Search leaves by status" />
        </label>
        <div className="data-card">
          {filteredLeaveRows.length === 0 ? <div className="empty-state">No leave records found.</div> : (
            <table>
              <thead>
                <tr><th>SNO</th><th>Leave Type</th><th>From</th><th>To</th><th>Description</th><th>Applied Date</th><th>Status</th><th>Reason</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredLeaveRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td><strong>{row.leaveType}</strong><span>{employeeCode(row.employee)} - {row.employee.firstName} {row.employee.lastName}</span></td>
                    <td>{formatDate(row.fromDate)}</td>
                    <td>{formatDate(row.toDate)}</td>
                    <td>{row.description || "-"}</td>
                    <td>{formatDate(row.appliedDate)}</td>
                    <td><span className={`leave-status ${row.status.toLowerCase()}`}>{leaveStatusLabels[row.status]}</span></td>
                    <td><input className="reason-input" value={decisionReasons[row.id] ?? row.decisionReason ?? ""} onChange={(event) => updateDecisionReason(row.id, event.target.value)} placeholder="Reason" /></td>
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
          <input value={salarySearch} onChange={(event) => setSalarySearch(event.target.value)} placeholder="Search By Emp ID" aria-label="Search salary by employee ID" />
        </label>
        <div className="data-card">
          {salaryRows.length === 0 ? <div className="empty-state">No salary records found.</div> : (
            <table>
              <thead><tr><th>SNO</th><th>EMP ID</th><th>Salary</th><th>Allowance</th><th>Deduction</th><th>Total</th><th>Pay Date</th></tr></thead>
              <tbody>
                {salaryRows.map((row) => (
                  <tr key={row.employee.id}>
                    <td>{row.serial}</td><td>{employeeCode(row.employee)}</td><td>{formatCurrency(row.salary)}</td><td>{formatCurrency(row.allowance)}</td><td>{formatCurrency(row.deduction)}</td><td>{formatCurrency(row.total)}</td><td>{formatDate(row.payDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  }

  function renderCrmPortal() {
    return (
      <section className="management-screen crm-screen">
        <div className="crm-tabs" role="tablist" aria-label="CRM sections">
          <button className={crmTab === "customers" ? "active" : ""} type="button" onClick={() => setCrmTab("customers")}>Customers</button>
          <button className={crmTab === "tasks" ? "active" : ""} type="button" onClick={() => setCrmTab("tasks")}>Follow-ups</button>
          <button className={crmTab === "communications" ? "active" : ""} type="button" onClick={() => setCrmTab("communications")}>Communications</button>
        </div>
        {crmLoading && crmCustomers.length === 0 && crmTasks.length === 0 && crmCommunications.length === 0 ? (
          <div className="screen-loader"><Loader2 className="spin" size={28} aria-hidden="true" />Loading CRM portal...</div>
        ) : (
          <>
            {crmTab === "customers" && renderCrmCustomers()}
            {crmTab === "tasks" && renderCrmTasks()}
            {crmTab === "communications" && renderCrmCommunications()}
          </>
        )}
      </section>
    );
  }

  function renderCrmCustomers() {
    return (
      <>
        <form className="form-panel crm-form" onSubmit={submitCustomer}>
          <div className="section-heading">
            <h2>{editingCustomerId ? "Update Customer" : "Add Customer"}</h2>
            {editingCustomerId && <button className="icon-button" type="button" onClick={resetCustomerForm} aria-label="Cancel customer edit"><X size={18} aria-hidden="true" /></button>}
          </div>
          <div className="crm-form-grid">
            <Field label="Company name" name="companyName" value={customerForm.companyName} onChange={updateCustomerField} required />
            <Field label="Contact person" name="contactPerson" value={customerForm.contactPerson} onChange={updateCustomerField} required />
            <Field label="Email" name="email" type="email" value={customerForm.email} onChange={updateCustomerField} required />
            <Field label="Phone" name="phone" value={customerForm.phone} onChange={updateCustomerField} />
            <Field label="Project name" name="projectName" value={customerForm.projectName} onChange={updateCustomerField} />
            <label className="field"><span>Project status</span><select name="projectStatus" value={customerForm.projectStatus} onChange={updateCustomerField}><option value="">Select status</option><option value="Active">Active</option><option value="On Hold">On Hold</option><option value="Completed">Completed</option><option value="Support">Support</option></select></label>
            <label className="field"><span>Payment status</span><select name="paymentStatus" value={customerForm.paymentStatus} onChange={updateCustomerField}><option value="">Select status</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Overdue">Overdue</option></select></label>
            <Field label="Assigned team" name="assignedTeam" value={customerForm.assignedTeam} onChange={updateCustomerField} />
            <TextArea label="Address" name="address" value={customerForm.address} onChange={updateCustomerField} />
            <TextArea label="Payment history" name="paymentHistory" value={customerForm.paymentHistory} onChange={updateCustomerField} />
            <TextArea label="Support tickets" name="supportTickets" value={customerForm.supportTickets} onChange={updateCustomerField} />
            <TextArea label="Previous communication" name="previousCommunication" value={customerForm.previousCommunication} onChange={updateCustomerField} />
            <TextArea label="Notes" name="notes" value={customerForm.notes} onChange={updateCustomerField} className="span-2" />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}{editingCustomerId ? "Save customer" : "Create customer"}</button>
        </form>
        <div className="toolbar-row">
          <label className="table-search crm-search"><Search size={17} aria-hidden="true" /><input value={crmCustomerSearch} onChange={(event) => setCrmCustomerSearch(event.target.value)} placeholder="Search by company or customer" aria-label="Search CRM customers" /></label>
        </div>
        <div className="data-card">
          {filteredCrmCustomers.length === 0 ? <div className="empty-state">No customers found.</div> : (
            <table className="crm-customer-table">
              <thead><tr><th>Company</th><th>Contact</th><th>Project</th><th>Payment</th><th>Team</th><th>Updated</th><th>Action</th></tr></thead>
              <tbody>
                {filteredCrmCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td><strong>{customer.companyName}</strong><span>{customer.notes || "-"}</span></td>
                    <td><strong>{customer.contactPerson}</strong><span>{customer.email} {customer.phone ? `| ${customer.phone}` : ""}</span></td>
                    <td><strong>{customer.projectName || "-"}</strong><span>{customer.projectStatus || "-"}</span></td>
                    <td><span className={`crm-badge ${badgeTone(customer.paymentStatus)}`}>{customer.paymentStatus || "Not set"}</span></td>
                    <td>{customer.assignedTeam || "-"}</td><td>{formatDate(customer.updatedAt)}</td>
                    <td><div className="button-strip"><button className="pill-action green" type="button" onClick={() => editCustomer(customer)}><Edit3 size={15} aria-hidden="true" />Edit</button><button className="pill-action danger-icon" type="button" onClick={() => deleteCustomer(customer)} aria-label={`Delete ${customer.companyName}`}><Trash2 size={15} aria-hidden="true" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  function renderCrmTasks() {
    const quickTasks = ["Tomorrow client call", "Send quotation", "Payment reminder", "Demo meeting"];
    return (
      <>
        <form className="form-panel crm-form" onSubmit={submitCrmTask}>
          <div className="section-heading"><h2>{editingCrmTaskId ? "Update Follow-up" : "Add Follow-up Task"}</h2>{editingCrmTaskId && <button className="icon-button" type="button" onClick={resetCrmTaskForm} aria-label="Cancel task edit"><X size={18} aria-hidden="true" /></button>}</div>
          <div className="quick-actions" aria-label="Example CRM tasks">{quickTasks.map((taskTitle) => <button key={taskTitle} className="ghost-action" type="button" onClick={() => setCrmTaskForm((current) => ({ ...current, title: taskTitle }))}>{taskTitle}</button>)}</div>
          <div className="crm-form-grid compact">
            <label className="field"><span>Customer</span><select name="customerId" value={crmTaskForm.customerId} onChange={updateCrmTaskField} required><option value="">Select customer</option>{crmCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}</select></label>
            <Field label="Title" name="title" value={crmTaskForm.title} onChange={updateCrmTaskField} required />
            <Field label="Follow-up date" name="followUpDate" type="date" value={crmTaskForm.followUpDate} onChange={updateCrmTaskField} required />
            <Field label="Follow-up time" name="followUpTime" type="time" value={crmTaskForm.followUpTime} onChange={updateCrmTaskField} required />
            <label className="field"><span>Priority</span><select name="priority" value={crmTaskForm.priority} onChange={updateCrmTaskField} required><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
            <label className="field"><span>Status</span><select name="status" value={crmTaskForm.status} onChange={updateCrmTaskField} required><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option><option value="CANCELLED">Cancelled</option></select></label>
            <Field label="Assigned to" name="assignedTo" value={crmTaskForm.assignedTo} onChange={updateCrmTaskField} />
            <label className="field"><span>Reminder type</span><select name="reminderType" value={crmTaskForm.reminderType} onChange={updateCrmTaskField}><option value="EMAIL">Email</option><option value="CALL">Call</option><option value="WHATSAPP">WhatsApp</option><option value="IN_APP">In app</option></select></label>
            <TextArea label="Description" name="description" value={crmTaskForm.description} onChange={updateCrmTaskField} className="span-2" />
          </div>
          <button className="primary-button" type="submit" disabled={saving || crmCustomers.length === 0}>{saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}{editingCrmTaskId ? "Save task" : "Create task"}</button>
        </form>
        <div className="toolbar-row"><div className="crm-filter-row" aria-label="Follow-up filters">{["all", "today", "upcoming"].map((filter) => <button key={filter} className={crmTaskFilter === filter ? "filter-button active" : "filter-button"} type="button" onClick={() => loadCrmTasks(filter)}>{filter === "all" ? "All" : filter === "today" ? "Today" : "Upcoming"}</button>)}</div></div>
        <div className="data-card">
          {crmTasks.length === 0 ? <div className="empty-state">No follow-up tasks found.</div> : (
            <table className="crm-task-table">
              <thead><tr><th>Task</th><th>Customer</th><th>Follow-up</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Action</th></tr></thead>
              <tbody>
                {crmTasks.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong><span>{task.description || "-"}</span></td><td>{task.customerName}</td><td><strong>{formatDate(task.followUpDate)}</strong><span>{formatTime(task.followUpTime)} via {task.reminderType || "Reminder"}</span></td>
                    <td><span className={`crm-badge ${badgeTone(task.priority)}`}>{humanize(task.priority)}</span></td>
                    <td><select className="status-select" value={task.status} onChange={(event) => updateCrmTaskStatus(task, event.target.value)}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option><option value="CANCELLED">Cancelled</option></select></td>
                    <td>{task.assignedTo || "-"}</td><td><div className="button-strip"><button className="pill-action green" type="button" onClick={() => editCrmTask(task)}><Edit3 size={15} aria-hidden="true" />Edit</button><button className="pill-action danger-icon" type="button" onClick={() => deleteCrmTask(task)} aria-label={`Delete ${task.title}`}><Trash2 size={15} aria-hidden="true" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  function renderCrmCommunications() {
    return (
      <>
        <form className="form-panel crm-form" onSubmit={submitCommunication}>
          <div className="section-heading"><h2>{editingCommunicationId ? "Update Communication" : "Add Communication Note"}</h2>{editingCommunicationId && <button className="icon-button" type="button" onClick={resetCommunicationForm} aria-label="Cancel communication edit"><X size={18} aria-hidden="true" /></button>}</div>
          <div className="crm-form-grid compact">
            <label className="field"><span>Customer</span><select name="customerId" value={communicationForm.customerId} onChange={updateCommunicationField} required><option value="">Select customer</option>{crmCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}</select></label>
            <label className="field"><span>Type</span><select name="communicationType" value={communicationForm.communicationType} onChange={updateCommunicationField} required><option value="EMAIL">Email</option><option value="CALL">Call</option><option value="WHATSAPP">WhatsApp</option><option value="MEETING">Meeting</option><option value="NOTE">Note</option></select></label>
            <Field label="Subject" name="subject" value={communicationForm.subject} onChange={updateCommunicationField} required />
            <Field label="Communication date" name="communicationDate" type="datetime-local" value={communicationForm.communicationDate} onChange={updateCommunicationField} required />
            <Field label="Next action" name="nextAction" value={communicationForm.nextAction} onChange={updateCommunicationField} />
            <Field label="Created by" name="createdBy" value={communicationForm.createdBy} onChange={updateCommunicationField} placeholder={auth.user?.name || "Admin"} />
            <TextArea label="Summary" name="summary" value={communicationForm.summary} onChange={updateCommunicationField} className="span-2" required />
          </div>
          <button className="primary-button" type="submit" disabled={saving || crmCustomers.length === 0}>{saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}{editingCommunicationId ? "Save communication" : "Add communication"}</button>
        </form>
        <div className="toolbar-row"><label className="field filter-field"><span>Filter by customer</span><select value={crmCommunicationFilter} onChange={(event) => setCrmCommunicationFilter(event.target.value)}><option value="">All customers</option>{crmCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}</select></label></div>
        <div className="data-card">
          {filteredCrmCommunications.length === 0 ? <div className="empty-state">No communication history found.</div> : (
            <table className="crm-communication-table">
              <thead><tr><th>Communication</th><th>Customer</th><th>Date</th><th>Next Action</th><th>Created By</th><th>Action</th></tr></thead>
              <tbody>
                {filteredCrmCommunications.map((communication) => (
                  <tr key={communication.id}>
                    <td><strong>{communication.subject}</strong><span><span className="inline-badge">{humanize(communication.communicationType)}</span>{communication.summary}</span></td>
                    <td>{communication.customerName}</td><td>{formatDateTime(communication.communicationDate)}</td><td>{communication.nextAction || "-"}</td><td>{communication.createdBy || "-"}</td>
                    <td><div className="button-strip"><button className="pill-action green" type="button" onClick={() => editCommunication(communication)}><Edit3 size={15} aria-hidden="true" />Edit</button><button className="pill-action danger-icon" type="button" onClick={() => deleteCommunication(communication)} aria-label={`Delete ${communication.subject}`}><Trash2 size={15} aria-hidden="true" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  function renderMyTasks() {
    return (
      <section className="management-screen role-screen">
        <div className="overview-grid compact-grid">
          <OverviewCard icon={ClipboardList} tone="teal" label="Assigned Tasks" value={portalTasks.length} compact />
          <OverviewCard icon={Hourglass} tone="amber" label="Pending" value={portalTasks.filter((task) => task.status !== "COMPLETED").length} compact />
          <OverviewCard icon={CheckCircle2} tone="green" label="Completed" value={portalTasks.filter((task) => task.status === "COMPLETED").length} compact />
        </div>
        <div className="data-card">
          <table>
            <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Assigned By</th></tr></thead>
            <tbody>
              {portalTasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.title}</strong><span>{task.description || "No description"}</span></td>
                  <td><span className={`crm-badge ${priorityTone(task.priority)}`}>{task.priority}</span></td>
                  <td><span className={`crm-badge ${statusTone(task.status)}`}>{task.status}</span></td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>{task.assignedBy || "-"}</td>
                </tr>
              ))}
              {portalTasks.length === 0 && <tr><td colSpan="5">No assigned tasks yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderDailyUpdates() {
    return (
      <section className="management-screen role-screen">
        <form className="form-panel" onSubmit={handleDailyUpdateSubmit}>
          <div className="section-heading"><h2>Submit Daily Update</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Update Date" name="updateDate" type="date" value={dailyUpdateForm.updateDate} onChange={(event) => updateStateField(setDailyUpdateForm, event)} required />
            <Field label="Hours Worked" name="hoursWorked" type="number" min="0" step="0.5" value={dailyUpdateForm.hoursWorked} onChange={(event) => updateStateField(setDailyUpdateForm, event)} required />
            <TextArea label="Work Summary" name="workSummary" className="span-2" value={dailyUpdateForm.workSummary} onChange={(event) => updateStateField(setDailyUpdateForm, event)} required />
            <TextArea label="Blockers" name="blockers" className="span-2" value={dailyUpdateForm.blockers} onChange={(event) => updateStateField(setDailyUpdateForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Submit update"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Date</th><th>Summary</th><th>Blockers</th><th>Hours</th></tr></thead>
            <tbody>
              {dailyUpdates.map((update) => (
                <tr key={update.id}>
                  <td>{formatDate(update.updateDate)}</td>
                  <td><strong>{update.workSummary}</strong></td>
                  <td>{update.blockers || "-"}</td>
                  <td>{update.hoursWorked}</td>
                </tr>
              ))}
              {dailyUpdates.length === 0 && <tr><td colSpan="4">No daily updates submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderLearningResources() {
    return (
      <section className="panel-grid">
        {learningResources.map((resource) => (
          <article className="department-card resource-card" key={resource.id}>
            <BookOpen size={26} aria-hidden="true" />
            <div>
              <h2>{resource.title}</h2>
              <p><span className="inline-badge">{resource.type}</span>{resource.description || "Learning material"}</p>
            </div>
            <a className="solid-action link-action" href={resource.link} target="_blank" rel="noreferrer">Open resource</a>
          </article>
        ))}
        {learningResources.length === 0 && <div className="access-denied-card"><BookOpen size={30} aria-hidden="true" /><h2>No resources yet</h2><p>Learning resources added by HR will appear here.</p></div>}
      </section>
    );
  }

  function renderProfile() {
    const profile = roleProfile || auth.user || {};
    return (
      <section className="settings-grid">
        <article className="department-card">
          <IdCard size={28} aria-hidden="true" />
          <h2>{profile.name || auth.user?.name}</h2>
          <p>{profile.email || auth.user?.email}</p>
          <span className="inline-badge">{profile.role || userRole}</span>
        </article>
        <article className="department-card">
          <BriefcaseBusiness size={28} aria-hidden="true" />
          <h2>Employee Details</h2>
          <p>Department: {profile.department || "-"}</p>
          <p>Position: {profile.jobTitle || "-"}</p>
          <p>Employee ID: {profile.employeeCode || profile.employeeId || "-"}</p>
        </article>
      </section>
    );
  }

  function renderMyAttendance() {
    return (
      <section className="management-screen">
        <div className="data-card">
          <table>
            <thead><tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Notes</th></tr></thead>
            <tbody>
              {myAttendance.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.attendanceDate)}</td>
                  <td><span className={`crm-badge ${statusTone(row.status)}`}>{row.status}</span></td>
                  <td>{formatTime(row.checkInTime)}</td>
                  <td>{formatTime(row.checkOutTime)}</td>
                  <td>{row.notes || "-"}</td>
                </tr>
              ))}
              {myAttendance.length === 0 && <tr><td colSpan="5">No attendance records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderMyLeave() {
    return (
      <section className="management-screen">
        <form className="form-panel leave-form" onSubmit={handleMyLeaveSubmit}>
          <div className="section-heading"><h2>Apply Leave</h2></div>
          <div className="leave-form-grid">
            <Field label="Leave Type" name="leaveType" value={myLeaveForm.leaveType} onChange={(event) => updateStateField(setMyLeaveForm, event)} required />
            <Field label="From" name="fromDate" type="date" value={myLeaveForm.fromDate} onChange={(event) => updateStateField(setMyLeaveForm, event)} required />
            <Field label="To" name="toDate" type="date" value={myLeaveForm.toDate} onChange={(event) => updateStateField(setMyLeaveForm, event)} required />
            <TextArea label="Description" name="description" className="span-2" value={myLeaveForm.description} onChange={(event) => updateStateField(setMyLeaveForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Apply leave"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Leave Type</th><th>From</th><th>To</th><th>Status</th><th>Decision</th></tr></thead>
            <tbody>
              {myLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td><strong>{leave.leaveType}</strong><span>{leave.description || "-"}</span></td>
                  <td>{formatDate(leave.fromDate)}</td>
                  <td>{formatDate(leave.toDate)}</td>
                  <td><span className={`leave-status ${leave.status.toLowerCase()}`}>{leaveStatusLabels[leave.status] || leave.status}</span></td>
                  <td>{leave.decisionReason || "-"}</td>
                </tr>
              ))}
              {myLeaves.length === 0 && <tr><td colSpan="5">No leave requests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderTeamTasks() {
    return (
      <section className="management-screen role-screen">
        <form className="form-panel" onSubmit={handleTeamTaskSubmit}>
          <div className="section-heading"><h2>Assign Team Task</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Title" name="title" value={teamTaskForm.title} onChange={(event) => updateStateField(setTeamTaskForm, event)} required />
            <Field label="Assigned To Email" name="assignedTo" type="email" value={teamTaskForm.assignedTo} onChange={(event) => updateStateField(setTeamTaskForm, event)} required />
            <Field label="Due Date" name="dueDate" type="date" value={teamTaskForm.dueDate} onChange={(event) => updateStateField(setTeamTaskForm, event)} required />
            <label className="field"><span>Priority</span><select name="priority" value={teamTaskForm.priority} onChange={(event) => updateStateField(setTeamTaskForm, event)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
            <TextArea label="Description" name="description" className="span-2" value={teamTaskForm.description} onChange={(event) => updateStateField(setTeamTaskForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Assign task"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {teamTasks.map((task) => (
                <tr key={task.id}>
                  <td><strong>{task.title}</strong><span>{task.description || "-"}</span></td>
                  <td>{task.assignedTo}</td>
                  <td><span className={`crm-badge ${priorityTone(task.priority)}`}>{task.priority}</span></td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td><select className="status-select" value={task.status} onChange={(event) => updateTeamTaskStatus(task, event.target.value)}><option>PENDING</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>BLOCKED</option></select></td>
                </tr>
              ))}
              {teamTasks.length === 0 && <tr><td colSpan="5">No team tasks yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderProjectManagement() {
    return (
      <section className="management-screen">
        <form className="form-panel" onSubmit={handleProjectSubmit}>
          <div className="section-heading"><h2>Add Project</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Project Name" name="projectName" value={projectForm.projectName} onChange={(event) => updateStateField(setProjectForm, event)} required />
            <Field label="Client Name" name="clientName" value={projectForm.clientName} onChange={(event) => updateStateField(setProjectForm, event)} required />
            <Field label="Start Date" name="startDate" type="date" value={projectForm.startDate} onChange={(event) => updateStateField(setProjectForm, event)} />
            <Field label="Deadline" name="deadline" type="date" value={projectForm.deadline} onChange={(event) => updateStateField(setProjectForm, event)} />
            <label className="field"><span>Status</span><select name="status" value={projectForm.status} onChange={(event) => updateStateField(setProjectForm, event)}><option>PLANNED</option><option>ACTIVE</option><option>ON_HOLD</option><option>COMPLETED</option></select></label>
            <TextArea label="Assigned Team" name="assignedTeam" className="span-2" value={projectForm.assignedTeam} onChange={(event) => updateStateField(setProjectForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save project"}</button>
        </form>
        {renderProjectTable(projects)}
      </section>
    );
  }

  function renderReports() {
    return (
      <section className="management-screen">
        <div className="overview-grid compact-grid">
          <OverviewCard icon={ClipboardList} tone="teal" label="Total Tasks" value={taskSummary?.total || 0} compact />
          <OverviewCard icon={Hourglass} tone="amber" label="Pending" value={taskSummary?.pending || 0} compact />
          <OverviewCard icon={CheckCircle2} tone="green" label="Completed" value={taskSummary?.completed || 0} compact />
          <OverviewCard icon={XCircle} tone="red" label="High Priority" value={taskSummary?.highPriority || 0} compact />
        </div>
        {renderProjectTable(projects)}
      </section>
    );
  }

  function renderProjectTable(rows) {
    return (
      <div className="data-card">
        <table>
          <thead><tr><th>Project</th><th>Client</th><th>Start</th><th>Deadline</th><th>Status</th><th>Team</th></tr></thead>
          <tbody>
            {rows.map((project) => (
              <tr key={project.id}>
                <td><strong>{project.projectName}</strong></td>
                <td>{project.clientName}</td>
                <td>{formatDate(project.startDate)}</td>
                <td>{formatDate(project.deadline)}</td>
                <td><span className={`crm-badge ${statusTone(project.status)}`}>{project.status}</span></td>
                <td>{project.assignedTeam || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="6">No project records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTeamUpdates() {
    return (
      <section className="management-screen">
        <div className="data-card">
          <table>
            <thead><tr><th>Employee</th><th>Date</th><th>Summary</th><th>Blockers</th><th>Hours</th></tr></thead>
            <tbody>
              {teamUpdates.map((update) => (
                <tr key={update.id}><td>{update.userEmail}</td><td>{formatDate(update.updateDate)}</td><td>{update.workSummary}</td><td>{update.blockers || "-"}</td><td>{update.hoursWorked}</td></tr>
              ))}
              {teamUpdates.length === 0 && <tr><td colSpan="5">No team updates submitted yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderEmployeePerformance() {
    return (
      <section className="management-screen">
        <div className="data-card">
          <table>
            <thead><tr><th>Employee</th><th>Total Tasks</th><th>Completed</th><th>Daily Updates</th><th>Completion</th></tr></thead>
            <tbody>
              {performanceRows.map((row) => (
                <tr key={row.employeeEmail}><td><strong>{row.employeeEmail}</strong></td><td>{row.totalTasks}</td><td>{row.completedTasks}</td><td>{row.submittedUpdates}</td><td>{Math.round(row.completionRate)}%</td></tr>
              ))}
              {performanceRows.length === 0 && <tr><td colSpan="5">No performance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderCandidates() {
    return (
      <section className="management-screen">
        <form className="form-panel" onSubmit={handleCandidateSubmit}>
          <div className="section-heading"><h2>Add Candidate</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Name" name="name" value={candidateForm.name} onChange={(event) => updateStateField(setCandidateForm, event)} required />
            <Field label="Email" name="email" type="email" value={candidateForm.email} onChange={(event) => updateStateField(setCandidateForm, event)} required />
            <Field label="Phone" name="phone" value={candidateForm.phone} onChange={(event) => updateStateField(setCandidateForm, event)} />
            <Field label="Skill" name="skill" value={candidateForm.skill} onChange={(event) => updateStateField(setCandidateForm, event)} />
            <Field label="Experience" name="experience" value={candidateForm.experience} onChange={(event) => updateStateField(setCandidateForm, event)} />
            <Field label="Resume URL" name="resumeUrl" value={candidateForm.resumeUrl} onChange={(event) => updateStateField(setCandidateForm, event)} />
            <Field label="Interview Date" name="interviewDate" type="date" value={candidateForm.interviewDate} onChange={(event) => updateStateField(setCandidateForm, event)} />
            <label className="field"><span>Status</span><select name="status" value={candidateForm.status} onChange={(event) => updateStateField(setCandidateForm, event)}><option>NEW</option><option>SCREENING</option><option>INTERVIEW</option><option>SELECTED</option><option>REJECTED</option></select></label>
            <TextArea label="Notes" name="notes" className="span-2" value={candidateForm.notes} onChange={(event) => updateStateField(setCandidateForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save candidate"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Candidate</th><th>Skill</th><th>Experience</th><th>Interview</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}><td><strong>{candidate.name}</strong><span>{candidate.email}</span></td><td>{candidate.skill || "-"}</td><td>{candidate.experience || "-"}</td><td>{formatDate(candidate.interviewDate)}</td><td><span className={`crm-badge ${statusTone(candidate.status)}`}>{candidate.status}</span></td><td>{candidate.notes || "-"}</td></tr>
              ))}
              {candidates.length === 0 && <tr><td colSpan="6">No candidates yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderDocuments() {
    return (
      <section className="management-screen">
        <form className="form-panel" onSubmit={handleDocumentSubmit}>
          <div className="section-heading"><h2>Add Document</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Employee ID" name="employeeId" type="number" value={documentForm.employeeId} onChange={(event) => updateStateField(setDocumentForm, event)} required />
            <Field label="Document Type" name="documentType" value={documentForm.documentType} onChange={(event) => updateStateField(setDocumentForm, event)} required />
            <Field label="Document URL" name="documentUrl" value={documentForm.documentUrl} onChange={(event) => updateStateField(setDocumentForm, event)} required />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save document"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Employee ID</th><th>Type</th><th>Document</th><th>Uploaded</th></tr></thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}><td>{document.employeeId}</td><td>{document.documentType}</td><td><a href={document.documentUrl} target="_blank" rel="noreferrer">{document.documentUrl}</a></td><td>{formatDateTime(document.uploadedAt)}</td></tr>
              ))}
              {documents.length === 0 && <tr><td colSpan="4">No documents yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderAttendance() {
    return (
      <section className="management-screen">
        <form className="form-panel" onSubmit={handleAttendanceSubmit}>
          <div className="section-heading"><h2>Add Attendance</h2></div>
          <div className="form-grid role-form-grid">
            <Field label="Employee Email" name="userEmail" type="email" value={attendanceForm.userEmail} onChange={(event) => updateStateField(setAttendanceForm, event)} required />
            <Field label="Date" name="attendanceDate" type="date" value={attendanceForm.attendanceDate} onChange={(event) => updateStateField(setAttendanceForm, event)} required />
            <label className="field"><span>Status</span><select name="status" value={attendanceForm.status} onChange={(event) => updateStateField(setAttendanceForm, event)}><option>PRESENT</option><option>ABSENT</option><option>HALF_DAY</option><option>REMOTE</option></select></label>
            <Field label="Check In" name="checkInTime" type="time" value={attendanceForm.checkInTime} onChange={(event) => updateStateField(setAttendanceForm, event)} />
            <Field label="Check Out" name="checkOutTime" type="time" value={attendanceForm.checkOutTime} onChange={(event) => updateStateField(setAttendanceForm, event)} />
            <TextArea label="Notes" name="notes" className="span-2" value={attendanceForm.notes} onChange={(event) => updateStateField(setAttendanceForm, event)} />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save attendance"}</button>
        </form>
        <div className="data-card">
          <table>
            <thead><tr><th>Employee</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Notes</th></tr></thead>
            <tbody>
              {attendance.map((row) => (
                <tr key={row.id}><td>{row.userEmail}</td><td>{formatDate(row.attendanceDate)}</td><td><span className={`crm-badge ${statusTone(row.status)}`}>{row.status}</span></td><td>{formatTime(row.checkInTime)}</td><td>{formatTime(row.checkOutTime)}</td><td>{row.notes || "-"}</td></tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan="6">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderHrModule() {
    return (
      <section className="management-screen">
        <div className="overview-grid compact-grid">
          <OverviewCard icon={UserPlus} tone="teal" label="Candidates" value={candidates.length} compact />
          <OverviewCard icon={FileArchive} tone="amber" label="Documents" value={documents.length} compact />
          <OverviewCard icon={CalendarCheck2} tone="green" label="Attendance Records" value={attendance.length} compact />
        </div>
        <div className="panel-grid">
          <article className="department-card"><h2>HR Operations</h2><p>Use Candidates, Documents, Attendance, Leaves, Employees, and Salary from the sidebar for full HR workflows.</p></article>
          <article className="department-card"><h2>Access Scope</h2><p>HR can manage employee records, leave approvals, salary views, attendance, hiring, and employee documents.</p></article>
        </div>
      </section>
    );
  }

  function renderRolePermissions() {
    return (
      <section className="management-screen">
        <div className="data-card">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Current Role</th><th>Change Role</th></tr></thead>
            <tbody>
              {managedUsers.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong><span>ID {user.id}</span></td>
                  <td>{user.email}</td>
                  <td><span className="inline-badge">{user.role}</span></td>
                  <td><select className="status-select" value={user.role} onChange={(event) => updateUserRole(user.id, event.target.value)}>{roles.map((role) => <option key={role}>{role}</option>)}</select></td>
                </tr>
              ))}
              {managedUsers.length === 0 && <tr><td colSpan="4">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="settings-grid">
        <article className="data-card account-panel"><div className="avatar large">{initials(auth.user?.name)}</div><div><p>Account</p><h2>{auth.user?.name}</h2><span>{auth.user?.email}</span></div></article>
        <article className="data-card account-panel split"><div><p>Session</p><h2>JWT active</h2><span>{Math.round((auth.expiresIn || 0) / 60)} minutes</span></div><button className="danger-button" type="button" onClick={() => handleLogout()}><LogOut size={18} aria-hidden="true" />Logout</button></article>
      </section>
    );
  }
}

function AuthPage({ mode, form, saving, error, onModeChange, onChange, onSubmit }) {
  const isSignup = mode === "signup";
  const serviceChips = ["Employees", "CRM", "Leaves", "Salary", "Departments", "Operations"];

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="auth-brand-card">
          <BrandLogo title="MensPingo" subtitle="Tech Solutions" large />
          <div className="signal-card" aria-hidden="true"><span className="signal-node primary" /><span className="signal-node secondary" /><span className="signal-node tertiary" /><span className="signal-line horizontal" /><span className="signal-line vertical" /><span className="signal-wave" /></div>
          <p className="auth-eyebrow">Secure Internal Management Portal</p>
          <h1>MensPingo Employee Management System</h1>
          <p>Manage employees, departments, salary records, leaves, CRM customers, follow-ups, and company operations in one secure dashboard.</p>
          <p className="auth-built-for">Built for MensPingo Tech Solutions</p>
          <p className="auth-tagline">Smart Tech. Real Connections.</p>
          <div className="service-chips" aria-label="MensPingo services">{serviceChips.map((service) => <span key={service}>{service}</span>)}</div>
        </div>
      </section>
      <section className="auth-card" id="auth-panel" aria-label={isSignup ? "Sign up" : "Log in"}>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button className={!isSignup ? "active" : ""} type="button" onClick={() => onModeChange("login")}><LogIn size={17} aria-hidden="true" />Login</button>
          <button className={isSignup ? "active" : ""} type="button" onClick={() => onModeChange("signup")}><UserPlus size={17} aria-hidden="true" />Signup</button>
        </div>
        <form onSubmit={onSubmit}>
          <p className="auth-form-kicker">MensPingo Employee Management System</p>
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          {error && <div className="notice error">{error}</div>}
          <div className="auth-fields">
            {isSignup && <Field label="Name" name="name" value={form.name} onChange={onChange} required />}
            <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} minLength={isSignup ? 8 : undefined} required />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} aria-hidden="true" /> : isSignup ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}{isSignup ? "Create account" : "Login"}</button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ activeView, items, onSelect }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        {items.map(({ id, label, icon: Icon }) => <button className={activeView === id ? "active" : ""} key={id} type="button" onClick={() => onSelect(id)}><Icon size={19} aria-hidden="true" /><span>{label}</span></button>)}
      </nav>
    </aside>
  );
}

function BrandLogo({ title = "MensPingo", subtitle = "Tech Solutions", compact = false, large = false }) {
  const className = large ? "brand-logo large" : compact ? "brand-logo compact" : "brand-logo";
  return (
    <div className={className} aria-label={`${title} ${subtitle}`}>
      <span className="brand-mark"><img src={BRAND_LOGO_SRC} alt="MensPingo logo" /></span>
      <span className="brand-copy"><strong>{title}</strong><small>{subtitle}</small></span>
    </div>
  );
}

function OverviewCard({ icon: Icon, tone, label, value, compact = false }) {
  return (
    <article className={compact ? "overview-card compact" : "overview-card"}>
      <div className={`overview-icon ${tone}`}><Icon size={compact ? 26 : 30} aria-hidden="true" /></div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </article>
  );
}

function EmployeeDetails({ employee, onBack, onEdit }) {
  const details = [["Name", `${employee.firstName} ${employee.lastName}`], ["Employee ID", employeeCode(employee)], ["Date of Birth", formatDate(employee.dateOfBirth)], ["Gender", employee.gender || "-"], ["Department", employee.department], ["Position", employee.jobTitle], ["Marital Status", employee.maritalStatus || "-"]];
  return (
    <section className="employee-detail-card">
      <img className="employee-photo large-photo" src={employeePhoto(employee, 260)} alt={`${employee.firstName} ${employee.lastName}`} />
      <div className="detail-content"><h2>Employee Details</h2><dl>{details.map(([label, value]) => <div key={label}><dt>{label}:</dt><dd>{value}</dd></div>)}</dl><div className="detail-actions"><button className="ghost-action" type="button" onClick={onBack}>Back</button><button className="solid-action" type="button" onClick={() => onEdit(employee)}>Edit Employee</button></div></div>
    </section>
  );
}

function Field({ label, error, ...props }) {
  return <label className="field"><span>{label}</span><input {...props} />{error && <small>{error}</small>}</label>;
}

function TextArea({ label, error, className = "", ...props }) {
  return <label className={`field ${className}`}><span>{label}</span><textarea {...props} />{error && <small>{error}</small>}</label>;
}

function getNavigationForRole(role) {
  const menu = roleMenus[role] || roleMenus.EMPLOYEE;
  return menu.map((id) => allNavItems[id]).filter(Boolean);
}

function getDefaultViewForRole(role) {
  const menu = roleMenus[role] || roleMenus.EMPLOYEE;
  return menu[0] || "myTasks";
}

function readSavedAuth() {
  try {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) return null;
    const parsedAuth = JSON.parse(savedAuth);
    return parsedAuth;
  } catch {
    return null;
  }
}

function getPageSubtitle(view) {
  const subtitles = {
    dashboard: "Employee, CRM, salary, leave, and department insights for MensPingo Tech Solutions.",
    employees: "Manage employee records, profiles, departments, compensation, and work status.",
    departments: "Review department strength, active employees, and payroll distribution.",
    leaves: "Track leave applications, approvals, rejections, and notification decisions.",
    salary: "View salary, allowance, deduction, and pay-date summaries.",
    crm: "Manage customers, follow-ups, communication history, and support context.",
    settings: "Review account details and active JWT session information.",
    myTasks: "Your assigned work, priority, status, due dates, and ownership.",
    dailyUpdates: "Submit daily work summaries, blockers, and hours worked.",
    learningResources: "Training links and learning material shared for MensPingo teams.",
    profile: "Logged-in user and linked employee profile details.",
    myAttendance: "Your attendance history and daily attendance status.",
    myLeave: "Apply for leave and review your own leave request status.",
    teamTasks: "Assign tasks, update status, and track team progress.",
    projectManagement: "Manage projects, clients, timelines, status, and assigned teams.",
    reports: "Team progress reports and task completion summaries.",
    teamUpdates: "Daily updates submitted by employees.",
    employeePerformance: "Basic task completion and update submission performance.",
    candidates: "Manage candidate details, interview status, resume links, and notes.",
    documents: "Store and review employee document references.",
    attendance: "View and manage employee attendance records.",
    hrModule: "HR operations overview for candidates, documents, attendance, leaves, salary, and employees.",
    rolePermissions: "Manage portal user roles and access permissions."
  };
  return subtitles[view] || "";
}

function initials(value = "") {
  return value.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "EM";
}

function employeeCode(employee) {
  if (employee.employeeCode) return employee.employeeCode;
  const first = employee.firstName?.trim()?.[0] || "E";
  const last = employee.lastName?.trim()?.[0] || "M";
  return `${first}${last}${String(employee.id || 0).padStart(4, "0")}`.toUpperCase();
}

function employeePhoto(employee, size) {
  if (employee.photoUrl) return employee.photoUrl;
  const label = initials(`${employee.firstName || ""} ${employee.lastName || ""}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" rx="${size / 2}" fill="#15998e"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="${size / 3}" font-weight="700">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function offsetDate(value, days) {
  if (!value) return "";
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "-";
  const [hour = "00", minute = "00"] = value.split(":");
  return `${hour}:${minute}`;
}

function statusTone(status = "") {
  const normalized = status.toUpperCase();
  if (["APPROVED", "ACTIVE", "PRESENT", "COMPLETED", "SELECTED"].includes(normalized)) return "green";
  if (["PENDING", "PLANNED", "SCREENING", "INTERVIEW", "IN_PROGRESS", "REMOTE", "HALF_DAY"].includes(normalized)) return "amber";
  if (["REJECTED", "BLOCKED", "ABSENT"].includes(normalized)) return "red";
  return "neutral";
}

function priorityTone(priority = "") {
  const normalized = priority.toUpperCase();
  if (normalized === "HIGH") return "red";
  if (normalized === "MEDIUM") return "amber";
  if (normalized === "LOW") return "green";
  return "neutral";
}

function normalizeTime(value) {
  return value ? value.slice(0, 5) : "10:00";
}

function normalizeDateTime(value) {
  return value ? value.slice(0, 16) : nowLocal();
}

function humanize(value = "") {
  return value.toLowerCase().split("_").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function badgeTone(value = "") {
  const normalized = value.toLowerCase();
  if (["paid", "done", "completed", "low"].includes(normalized)) return "green";
  if (["pending", "medium", "partial", "in_progress", "on hold"].includes(normalized)) return "amber";
  if (["overdue", "urgent", "high"].includes(normalized)) return "red";
  return "neutral";
}

export default App;
