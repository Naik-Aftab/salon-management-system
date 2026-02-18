import React, { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grow,
  IconButton,
  MenuItem,
  Pagination,
  TableSortLabel,
  TextField,
  type SxProps,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import type { Theme } from "@mui/material/styles";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  Download,
  Filter,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import CommissionTab from "./Commission";
import PayrollTab from "./Payroll";
import SchedulingTab from "./Scheduling";
import AttendanceTab from "./Attendance";

interface EmployeeRow {
  employeeId: string;
  name: string;
  gender: string;
  designation: string;
  joinedOn: string;
  services: string;
  branch: string;
  status: "active" | "break" | "inactive";
}

interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  hireDate: string;
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  status: "active" | "break" | "inactive";
  email: string;
  phone: string;
  salary: string;
  bankAccountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  branchId: string;
  designationId: string;
  skillIds: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface AttendanceRow {
  estimateDate: string;
  duration: string;
  permissionDetail: string;
  action: "Approved" | "Rejected";
}

interface EmployeeProfileMock {
  email: string;
  contact: string;
  dob: string;
  age: string;
  phone: string;
  altPhone: string;
  maritalStatus: string;
  address: string;
  dateOfJoining: string;
  skillSet: string;
  specialization: string;
  education: string;
  bank: string;
  tenure: string;
  attendance: AttendanceRow[];
}

type SortableKey = "employeeId" | "joinedOn";
type SortOrder = "asc" | "desc";
type EmployeeTopTab = "All Staff" | "Scheduling" | "Attendance" | "Payroll" | "Commission";
const topTabs: EmployeeTopTab[] = ["All Staff", "Scheduling", "Attendance", "Payroll", "Commission"];
const rowsPerPage = 10;

const initialEmployeeRows: EmployeeRow[] = [
  {
    employeeId: "EMP-1012",
    name: "Onkar Shrimangle",
    gender: "Male",
    designation: "Stylist",
    joinedOn: "2025-07-12",
    services: "Hair stylist",
    branch: "Nandanwan colony",
    status: "active",
  },
  {
    employeeId: "EMP-1003",
    name: "Riya Patil",
    gender: "Female",
    designation: "Beautician",
    joinedOn: "2025-07-01",
    services: "Skin treatment",
    branch: "Nandanwan colony",
    status: "active",
  },
  {
    employeeId: "EMP-1025",
    name: "Aman Tiwari",
    gender: "Male",
    designation: "Manager",
    joinedOn: "2025-08-09",
    services: "Operations",
    branch: "Sadar branch",
    status: "active",
  },
  {
    employeeId: "EMP-0988",
    name: "Sia More",
    gender: "Female",
    designation: "Reception",
    joinedOn: "2025-06-16",
    services: "Front desk",
    branch: "Sadar branch",
    status: "active",
  },
  {
    employeeId: "EMP-1031",
    name: "Kunal Verma",
    gender: "Male",
    designation: "Stylist",
    joinedOn: "2025-08-18",
    services: "Hair stylist",
    branch: "Nandanwan colony",
    status: "break",
  },
  {
    employeeId: "EMP-0994",
    name: "Pooja Kale",
    gender: "Female",
    designation: "Manager",
    joinedOn: "2025-06-22",
    services: "Team handling",
    branch: "Wardha road",
    status: "inactive",
  },
];

const emptyForm: EmployeeFormData = {
  employeeId: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  hireDate: "",
  employmentType: "full_time",
  status: "active",
  email: "",
  phone: "",
  salary: "",
  bankAccountHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfscCode: "",
  branchId: "",
  designationId: "",
  skillIds: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const branchOptions = [
  { id: "1", label: "Nandanwan colony" },
  { id: "2", label: "Sadar branch" },
  { id: "3", label: "Wardha road" },
];

const designationOptions = [
  { id: "1", label: "Stylist" },
  { id: "2", label: "Beautician" },
  { id: "3", label: "Reception" },
  { id: "4", label: "Manager" },
];

const statusStyles = {
  active: "bg-[#E8EFE9] text-slate-700",
  break: "bg-[#EFE3CC] text-[#8D6A2A]",
  inactive: "bg-[#F0DFE2] text-[#5D3236]",
} as const;

const dialogTransition = (props: TransitionProps & { children: React.ReactElement }) => (
  <Grow {...props} timeout={250} />
);

const defaultAttendanceRows: AttendanceRow[] = [
  { estimateDate: "12-july-25", duration: "12 hours", permissionDetail: "Half day", action: "Rejected" },
  { estimateDate: "12-july-25", duration: "6 hours", permissionDetail: "Vacation Leave", action: "Approved" },
  { estimateDate: "12-july-25", duration: "8 hours", permissionDetail: "Annual Leave", action: "Rejected" },
  { estimateDate: "12-july-25", duration: "12 hours", permissionDetail: "Half day", action: "Approved" },
  { estimateDate: "12-july-25", duration: "6 hours", permissionDetail: "Vacation Leave", action: "Rejected" },
  { estimateDate: "12-july-25", duration: "8 hours", permissionDetail: "Annual Leave", action: "Approved" },
  { estimateDate: "12-july-25", duration: "12 hours", permissionDetail: "Half day", action: "Rejected" },
];

function formatJoinedDate(rawDate: string): string {
  const date = new Date(rawDate);
  return date
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
    .replace(/ /g, "-");
}

const defaultProfileData = (employee: EmployeeRow): EmployeeProfileMock => ({
  email: `${employee.name.toLowerCase().replace(/\s+/g, "")}08@gmail.com`,
  contact: "982393766",
  dob: "18-09-2004",
  age: "21",
  phone: "9823963766",
  altPhone: "7517216777",
  maritalStatus: "Married",
  address: `${employee.branch}, Jalna`,
  dateOfJoining: formatJoinedDate(employee.joinedOn),
  skillSet: employee.services === "Operations" ? "Operations, Floor handling" : "Hair Cut, Shaving",
  specialization: employee.designation === "Manager" ? "Branch Operations" : "Side Hair Cut",
  education: "B.C.A. (Bachelor of Computer Application)",
  bank: "",
  tenure: "7 Years,6 Month,2 Day",
  attendance: defaultAttendanceRows,
});

const employeeProfileMockById: Record<string, Partial<EmployeeProfileMock>> = {
  "EMP-1012": {
    dateOfJoining: "23 April 2025",
    skillSet: "Hair Cut, Shaving",
    specialization: "Side Hair Cut",
    education: "B.C.A. (Bachelor of Computer Application)",
    tenure: "7 Years,6 Month,2 Day",
  },
  "EMP-1003": {
    contact: "9823123456",
    specialization: "Skin treatment",
    skillSet: "Skin treatment, Cleanup",
    tenure: "3 Years,2 Month,11 Day",
  },
};

const fieldSx: SxProps<Theme> = {
  "& .MuiInputBase-input::placeholder": {
    color: "#8A92B5",
    opacity: 1,
    fontSize: "0.84rem",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fbfcff",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  "& .MuiOutlinedInput-root:hover fieldset": {
    borderColor: "#98A2D4",
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    borderColor: "#5C6699",
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root": {
    color: "#5D668F",
    fontWeight: 600,
    fontSize: "0.88rem",
  },
};
function KVRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[78px_10px_minmax(0,1fr)] items-start gap-1.5 leading-[1.3]">
      <p className="text-[0.82rem] font-semibold text-[#111827]">{label}</p>
      <p className="text-[0.82rem] font-semibold text-[#111827]">:</p>
      <p className="text-[0.82rem] text-[#111827] break-words">{value || ""}</p>
    </div>
  );
}

export default function EmployeePage() {
  const [activeTopTab, setActiveTopTab] = useState<EmployeeTopTab>("All Staff");
  const [employeeRows, setEmployeeRows] = useState<EmployeeRow[]>(initialEmployeeRows);
  const [customEmployeeProfiles, setCustomEmployeeProfiles] = useState<Record<string, Partial<EmployeeProfileMock>>>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortableKey>("joinedOn");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);

  const sortedRows = useMemo(() => {
    const rows = [...employeeRows];
    rows.sort((a, b) => {
      if (sortBy === "joinedOn") {
        const aValue = new Date(a.joinedOn).getTime();
        const bValue = new Date(b.joinedOn).getTime();
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      const aValue = Number(a.employeeId.split("-")[1]);
      const bValue = Number(b.employeeId.split("-")[1]);
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
    return rows;
  }, [employeeRows, sortBy, sortOrder]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [page, sortedRows]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  const handleSort = (key: SortableKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortOrder("desc");
    setPage(1);
  };

  const handleFormChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEmployee = () => {
    const requiredFields: (keyof EmployeeFormData)[] = [
      "employeeId",
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "hireDate",
      "employmentType",
      "status",
      "email",
      "phone",
      "salary",
      "bankAccountHolderName",
      "bankName",
      "bankAccountNumber",
      "bankIfscCode",
      "branchId",
      "designationId",
      "skillIds",
      "address",
      "emergencyContactName",
      "emergencyContactPhone",
    ];
    const hasEmptyField = requiredFields.some((field) => String(formData[field]).trim() === "");
    if (hasEmptyField) {
      setFormError("Please fill all required fields before saving.");
      return;
    }

    const selectedDesignation = designationOptions.find((item) => item.id === formData.designationId)?.label || "Staff";
    const selectedBranch = branchOptions.find((item) => item.id === formData.branchId)?.label || "Main branch";
    const normalizedSkillIds = formData.skillIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const employmentTypeLabel = formData.employmentType.replace("_", " ");
    const bankSummary = `${formData.bankAccountHolderName.trim()} - ${formData.bankName.trim()} (${formData.bankAccountNumber.trim()}, ${formData.bankIfscCode.trim()})`;

    const newEmployee: EmployeeRow = {
      employeeId: formData.employeeId.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase(),
      designation: selectedDesignation,
      joinedOn: formData.hireDate,
      services: normalizedSkillIds.length ? `Skill IDs: ${normalizedSkillIds.join(", ")}` : "General",
      branch: selectedBranch,
      status: formData.status,
    };

    setEmployeeRows((prev) => [...prev, newEmployee]);
    setCustomEmployeeProfiles((prev) => ({
      ...prev,
      [newEmployee.employeeId]: {
        email: formData.email.trim(),
        contact: formData.phone.trim(),
        age: "",
        phone: formData.phone.trim(),
        altPhone: formData.emergencyContactPhone.trim(),
        dob: formData.dateOfBirth,
        maritalStatus: "",
        address: formData.address.trim(),
        dateOfJoining: formatJoinedDate(formData.hireDate),
        skillSet: normalizedSkillIds.length ? `Skill IDs: ${normalizedSkillIds.join(", ")}` : "",
        specialization: `Employment: ${employmentTypeLabel}`,
        education: "",
        bank: bankSummary,
      },
    }));
    setFormData(emptyForm);
    setFormError("");
    setIsAddDialogOpen(false);
    setPage(1);
  };

  const selectedEmployeeProfile = useMemo(() => {
    if (!selectedEmployee) return null;
    const defaults = defaultProfileData(selectedEmployee);
    const mockOverrides = employeeProfileMockById[selectedEmployee.employeeId] || {};
    const customOverrides = customEmployeeProfiles[selectedEmployee.employeeId] || {};
    return { ...defaults, ...mockOverrides, ...customOverrides };
  }, [customEmployeeProfiles, selectedEmployee]);

  const staffMembers = useMemo(() => employeeRows.map((row) => row.name), [employeeRows]);

  const initials = useMemo(() => {
    if (!selectedEmployee) return "";
    return selectedEmployee.name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [selectedEmployee]);

  return (
    <section className="h-full">
      <div className="h-full">
        <div className="mb-3 rounded-2xl border border-[#E1E5F3] bg-white px-3 py-2">
          <nav className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-semibold text-[#55608E]">
            {topTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTopTab(tab);
                  if (tab === "All Staff") {
                    setSelectedEmployee(null);
                  }
                }}
                className={`border-b-2 px-3 py-1.5 transition-all ${
                  activeTopTab === tab
                    ? "border-[#2F3561] text-[#2F3561]"
                    : "border-transparent hover:border-[#2F3561]/55 hover:text-[#2F3561]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTopTab === "Scheduling" ? (
          <SchedulingTab staffMembers={staffMembers} />
        ) : activeTopTab === "All Staff" ? (
          <>
            {selectedEmployee && selectedEmployeeProfile ? (
          <div className="rounded-[24px] border border-[#E2E5ED] bg-[#F5F6F8] p-4 shadow-[0_10px_20px_rgba(20,25,40,0.05)] md:p-4">
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#E2E5ED] bg-white px-3.5 py-2.5 text-[#2F3561] shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D8DDF0] text-[#2F3561] transition hover:bg-[#F2F2F2]"
              >
                <ArrowLeft size={16} />
              </button>
              <p className="text-[0.95rem] font-semibold tracking-tight">Employee Profile</p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="rounded-2xl border border-[#E2E5ED] bg-white p-3 shadow-sm lg:col-span-9">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,1fr)]">
                  <article className="rounded-2xl border border-[#E2E5ED] bg-[#FBFCFF] p-4 text-center">
                    <div className="mx-auto mb-2.5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#DDE2EE]">
                      <span className="text-3xl font-bold text-[#29335D]">{initials}</span>
                    </div>
                    <p className="whitespace-nowrap text-[1.75rem] font-semibold leading-tight text-[#2D2D2D]">
                      {selectedEmployee.name}
                    </p>
                    <p className="text-[1.2rem] text-[#6F758F]">{selectedEmployee.gender}</p>
                    <p className="mt-1 text-[11px] font-medium text-[#66709C]">EMP.ID: {selectedEmployee.employeeId}</p>
                  </article>

                  <article className="border-r border-[#E2E5ED] pr-4">
                    <div className="space-y-2.5">
                      <KVRow label="E-mail" value={selectedEmployeeProfile.email} />
                      <KVRow label="Cont" value={selectedEmployeeProfile.contact} />
                      <KVRow label="Age" value={selectedEmployeeProfile.age} />
                      <KVRow label="Ph. no." value={selectedEmployeeProfile.phone} />
                      <KVRow label="Alt" value={selectedEmployeeProfile.altPhone} />
                      <KVRow label="D.O.B." value={selectedEmployeeProfile.dob} />
                      <KVRow label="Marital" value={selectedEmployeeProfile.maritalStatus} />
                      <KVRow label="Addr." value={selectedEmployeeProfile.address} />
                    </div>
                  </article>

                  <article className="text-[0.84rem] text-[#1F1F1F]">
                    {[
                      ["Date of joining.", selectedEmployeeProfile.dateOfJoining],
                      ["Skill Set", selectedEmployeeProfile.skillSet],
                      ["Specialization", selectedEmployeeProfile.specialization],
                      ["Education", selectedEmployeeProfile.education],
                    ].map(([k, v]) => (
                      <div key={k} className="mb-2 grid grid-cols-[108px_10px_minmax(0,1fr)] gap-1 leading-[1.35]">
                        <p className="font-semibold">{k}</p>
                        <p>:</p>
                        <p className="break-words">{v}</p>
                      </div>
                    ))}
                  </article>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-3">
                <article className="min-h-[230px] rounded-2xl border border-[#E2E5ED] bg-white p-4 shadow-sm">
                  <h3 className="text-center text-[1.65rem] font-semibold leading-tight text-[#2A3158] underline underline-offset-2">
                    Account Details
                  </h3>
                  <div className="mt-4 rounded-xl border border-[#E2E5ED] bg-[#FAFBFF] p-3.5">
                    <div className="grid grid-cols-[56px_10px_1fr] text-[0.85rem] text-[#1F1F1F]">
                    <p className="font-semibold">Bank</p>
                    <p>:</p>
                    <p>{selectedEmployeeProfile.bank || ""}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-[#E2E5ED] bg-white px-2 py-3 text-center shadow-sm">
                  <p className="text-[1.08rem] font-semibold leading-tight text-[#2A3158] underline underline-offset-2">
                    Employee Tenure
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[1.2rem] font-semibold leading-tight tracking-tight text-[#151515]">
                    {selectedEmployeeProfile.tenure}
                  </p>
                </article>
              </div>

              <article className="min-h-[300px] rounded-2xl border border-[#E2E5ED] bg-white p-4 shadow-sm lg:col-span-4">
                <h3 className="whitespace-nowrap text-center text-[1.85rem] font-semibold leading-tight text-[#3A3A3A]">
                  Salary &amp; Commission
                </h3>
              </article>

              <article className="rounded-2xl border border-[#E2E5ED] bg-white p-4 shadow-sm lg:col-span-8">
                <h3 className="whitespace-nowrap text-center text-[1.85rem] font-semibold leading-tight text-[#3A3A3A] underline underline-offset-2">
                  Attendance
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="text-[0.9rem] text-[#1F1F1F]">
                        <th className="px-2 py-2 font-semibold">Estimate Date</th>
                        <th className="px-2 py-2 font-semibold">Duration</th>
                        <th className="px-2 py-2 font-semibold">Permission Detail</th>
                        <th className="px-2 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF0FB] bg-white">
                      {selectedEmployeeProfile.attendance.map((item, index) => (
                        <tr key={`${item.estimateDate}-${index}`} className="text-[0.86rem] text-[#202020]">
                          <td className="px-2 py-2">{item.estimateDate}</td>
                          <td className="px-2 py-2">{item.duration}</td>
                          <td className="px-2 py-2">{item.permissionDetail}</td>
                          <td className="px-2 py-2">
                            <span
                              className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-[0.76rem] font-medium ${
                                item.action === "Approved"
                                  ? "bg-[#DFF2E5] text-[#2A7A44]"
                                  : "bg-[#F5DDE0] text-[#A74352]"
                              }`}
                            >
                              {item.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

            </div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <Users size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Total Staff</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">
                  {employeeRows.length}
                </p>
              </article>

              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#6FA978]">
                  <Check className="rounded-full bg-[#89C093] p-1.5 text-white" size={20} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Active Today</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">
                  {employeeRows.filter((r) => r.status === "active").length}
                </p>
              </article>

              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <CalendarClock size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">On Leave</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">
                  0
                </p>
              </article>

              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <UserPlus size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">New Hire</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">
                  0
                </p>
              </article>
            </div>

            {/* Filters */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-[#D2B076] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#c7a768]"
                >
                  <Filter size={14} />
                  Filter
                  <ChevronDown size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setIsAddDialogOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#CBCDDF] bg-white px-3 py-1.5 text-sm font-semibold text-[#2F3561] hover:bg-[#F3F3FC]"
                >
                  <CirclePlus size={15} />
                  Add employee
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-[#CBCDDF] bg-white px-3 py-1.5 text-sm font-semibold text-[#2F3561] hover:bg-[#F3F3FC]"
                >
                  <Download size={15} />
                  Download
                </button>
              </div>

              <div className="relative w-full max-w-[300px]">
                <input
                  type="text"
                  placeholder="Number or Name"
                  className="w-full rounded-xl border border-[#D8DAEC] bg-white py-1.5 pl-4 pr-11 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#C1C5E9]"
                />
                <Search size={18} className="absolute right-3 top-2 text-[#5B648F]" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E0E1F0] bg-white">
              <div className="custom-scrollbar overflow-x-auto">
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-[#F8F8FD]">
                    <tr className="text-left text-[0.92rem] font-semibold text-[#2F3561]">
                      <th className="px-4 py-2">
                        <TableSortLabel
                          active={sortBy === "employeeId"}
                          direction={sortBy === "employeeId" ? sortOrder : "desc"}
                          onClick={() => handleSort("employeeId")}
                        >
                          Employee ID
                        </TableSortLabel>
                      </th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Gender</th>
                      <th className="px-4 py-2">Designation</th>
                      <th className="px-4 py-2">
                        <TableSortLabel
                          active={sortBy === "joinedOn"}
                          direction={sortBy === "joinedOn" ? sortOrder : "desc"}
                          onClick={() => handleSort("joinedOn")}
                        >
                          Date of Joining
                        </TableSortLabel>
                      </th>
                      <th className="px-4 py-2">Services</th>
                      <th className="px-4 py-2">Branch</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.employeeId} className="border-t border-[#F0F1F7] text-[0.9rem] text-slate-700">
                        <td className="px-4 py-1.5 font-medium text-[#303864]">{row.employeeId}</td>

                        <td className="px-4 py-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEmployee(row)}
                            className="font-medium text-[#303864] underline-offset-2 transition hover:text-[#1F2547] hover:underline"
                          >
                            {row.name}
                          </button>
                        </td>

                        <td className="px-4 py-1.5">{row.gender}</td>
                        <td className="px-4 py-1.5">{row.designation}</td>
                        <td className="px-4 py-1.5">{formatJoinedDate(row.joinedOn)}</td>
                        <td className="px-4 py-1.5">{row.services}</td>
                        <td className="px-4 py-1.5">{row.branch}</td>

                        <td className="px-4 py-1.5">
                          <span
                            className={`inline-flex min-w-24 items-center justify-center gap-1 rounded-lg px-3 py-1 font-medium capitalize ${statusStyles[row.status]}`}
                          >
                            {row.status === "active" ? <Check size={15} /> : null}
                            {row.status === "break" ? <Clock3 size={15} /> : null}
                            {row.status === "inactive" ? <X size={15} /> : null}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-center border-t border-[#F0F1F7] bg-[#FAFAFE] py-2.5">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                  size="small"
                  sx={{
                    "& .MuiPaginationItem-root": { color: "#3C4474" },
                    "& .Mui-selected": { backgroundColor: "#D9B870 !important", color: "#2F3561", fontWeight: 700 },
                  }}
                />
              </div>
            </div>
          </>
            )}
          </>
        ) : activeTopTab === "Attendance" ? (
          <AttendanceTab />
        ) : activeTopTab === "Payroll" ? (
          <PayrollTab />
        ) : (
          <CommissionTab />
        )}
      </div>

      {/* Add employee dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        keepMounted
        TransitionComponent={dialogTransition}
        PaperProps={{
          sx: {
            width: "500px",
            maxWidth: "calc(100vw - 32px)",
            borderRadius: "20px",
            border: "1px solid #E2E6F5",
            overflow: "hidden",
            boxShadow: "0 24px 70px rgba(25, 38, 89, 0.28)",
            backgroundImage: "linear-gradient(180deg, rgba(247,248,255,0.95) 0%, rgba(255,255,255,0.98) 40%)",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(31, 40, 82, 0.26)",
              backdropFilter: "blur(2px)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #E6E9F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p className="m-0 text-[1.35rem] font-bold tracking-tight text-[#2F3561]">Add Employee</p>
            <DialogContentText sx={{ m: 0, mt: 0.5, color: "#70789C", fontSize: "0.82rem" }}>
              Fill in the details below to onboard a new team member.
            </DialogContentText>
          </div>

          <IconButton
            size="small"
            onClick={() => setIsAddDialogOpen(false)}
            sx={{ border: "1px solid #D6DBEE", borderRadius: "10px" }}
          >
            <X size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <div className="grid grid-cols-1 gap-3.5 pt-1 md:grid-cols-2">
            {/* <TextField
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => handleFormChange("employeeId", e.target.value)}
              placeholder="EMP-1075"
              size="small"
              required
              sx={fieldSx}
            /> */}

            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
              placeholder="sahil"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
              placeholder="mujawar"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              placeholder="sahil@example.com"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              placeholder="+1-555-234-5678"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              select
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleFormChange("gender", e.target.value)}
              size="small"
              required
              sx={fieldSx}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
              size="small"
              required
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            <TextField
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleFormChange("hireDate", e.target.value)}
              size="small"
              required
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />

            <TextField
              select
              label="Employment Type"
              value={formData.employmentType}
              onChange={(e) => handleFormChange("employmentType", e.target.value)}
              size="small"
              required
              sx={fieldSx}
            >
              <MenuItem value="full_time">Full Time</MenuItem>
              <MenuItem value="part_time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="intern">Intern</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
              size="small"
              required
              sx={fieldSx}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="break">Break</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            <TextField
              label="CTC"
              type="number"
              value={formData.salary}
              onChange={(e) => handleFormChange("salary", e.target.value)}
              placeholder="45000"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Bank Account Holder Name"
              value={formData.bankAccountHolderName}
              onChange={(e) => handleFormChange("bankAccountHolderName", e.target.value)}
              placeholder="Rahul Kumar"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => handleFormChange("bankName", e.target.value)}
              placeholder="State Bank of India"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Bank Account Number"
              value={formData.bankAccountNumber}
              onChange={(e) => handleFormChange("bankAccountNumber", e.target.value)}
              placeholder="123456789012"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Bank IFSC Code"
              value={formData.bankIfscCode}
              onChange={(e) => handleFormChange("bankIfscCode", e.target.value)}
              placeholder="SBIN0001234"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              select
              label="Branch"
              value={formData.branchId}
              onChange={(e) => handleFormChange("branchId", e.target.value)}
              size="small"
              required
              sx={fieldSx}
            >
              <MenuItem value="">Select</MenuItem>
              {branchOptions.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Designation"
              value={formData.designationId}
              onChange={(e) => handleFormChange("designationId", e.target.value)}
              size="small"
              required
              sx={fieldSx}
            >
              <MenuItem value="">Select</MenuItem>
              {designationOptions.map((designation) => (
                <MenuItem key={designation.id} value={designation.id}>
                  {designation.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              placeholder="Enter address"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Skills"
              value={formData.skillIds}
              onChange={(e) => handleFormChange("skillIds", e.target.value)}
              placeholder="1, 2, 3"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) => handleFormChange("emergencyContactName", e.target.value)}
              placeholder="Rohan Sharma"
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Emergency Contact Phone"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleFormChange("emergencyContactPhone", e.target.value)}
              placeholder="+1-555-999-8888"
              size="small"
              required
              sx={fieldSx}
            />
          </div>

          {formError ? <p className="mt-3 rounded-lg bg-rose-50 px-2.5 py-2 text-sm text-rose-700">{formError}</p> : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
          <Button
            onClick={() => setIsAddDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#CDD3E9",
              color: "#4C557F",
              borderRadius: "10px",
              px: 2.2,
              "&:hover": { borderColor: "#B7BFE0", backgroundColor: "#F6F7FD" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreateEmployee}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 2.4,
              fontWeight: 700,
              background: "linear-gradient(135deg, #2F3561 0%, #444D87 100%)",
              boxShadow: "0 10px 20px rgba(47,53,97,0.26)",
              "&:hover": {
                background: "linear-gradient(135deg, #28305B 0%, #3E477F 100%)",
                boxShadow: "0 12px 24px rgba(47,53,97,0.32)",
              },
            }}
          >
            Save Employee
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
