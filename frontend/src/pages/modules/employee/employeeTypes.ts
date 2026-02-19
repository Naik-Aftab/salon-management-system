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

export type SortableKey = "employeeId" | "joinedOn";
export type SortOrder = "asc" | "desc";
export type EmployeeTopTab = "All Staff" | "Scheduling" | "Attendance" | "Payroll" | "Commission";
