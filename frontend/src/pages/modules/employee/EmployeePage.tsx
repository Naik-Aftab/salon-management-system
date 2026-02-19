import React, { useMemo, useState } from "react";
import {
  Pagination,
  TableSortLabel,
} from "@mui/material";
import {
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
import AddEmployeeDialog from "./components/AddEmployeeDialog";
import EmployeeProfilePanel from "./components/EmployeeProfilePanel";
export interface EmployeeRow {
  employeeId: string;
  name: string;
  gender: string;
  designation: string;
  joinedOn: string;
  services: string;
  branch: string;
  status: "active" | "break" | "inactive";
}

export interface EmployeeFormData {
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

export interface AttendanceRow {
  estimateDate: string;
  duration: string;
  permissionDetail: string;
  action: "Approved" | "Rejected";
}

export interface EmployeeProfileMock {
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
              <EmployeeProfilePanel
                employee={selectedEmployee}
                profile={selectedEmployeeProfile}
                initials={initials}
                onBack={() => setSelectedEmployee(null)}
              />
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

      <AddEmployeeDialog
        open={isAddDialogOpen}
        formData={formData}
        formError={formError}
        branchOptions={branchOptions}
        designationOptions={designationOptions}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleCreateEmployee}
        onFieldChange={handleFormChange}
      />
    </section>
  );
}
