import React from "react";
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
  TextField,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { TransitionProps } from "@mui/material/transitions";
import { X } from "lucide-react";
import type { EmployeeFormData } from "../EmployeePage";

const dialogTransition = (props: TransitionProps & { children: React.ReactElement }) => (
  <Grow {...props} timeout={250} />
);

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

interface AddEmployeeDialogProps {
  open: boolean;
  formData: EmployeeFormData;
  formError: string;
  branchOptions: { id: string; label: string }[];
  designationOptions: { id: string; label: string }[];
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof EmployeeFormData, value: string) => void;
}

export default function AddEmployeeDialog({
  open,
  formData,
  formError,
  branchOptions,
  designationOptions,
  onClose,
  onSave,
  onFieldChange,
}: AddEmployeeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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

        <IconButton size="small" onClick={onClose} sx={{ border: "1px solid #D6DBEE", borderRadius: "10px" }}>
          <X size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <div className="grid grid-cols-1 gap-3.5 pt-1 md:grid-cols-2">
          <TextField
            label="First Name"
            value={formData.firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            placeholder="sahil"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            placeholder="mujawar"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            placeholder="sahil@example.com"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="+1-555-234-5678"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            select
            label="Gender"
            value={formData.gender}
            onChange={(e) => onFieldChange("gender", e.target.value)}
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
            onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />

          <TextField
            label="Hire Date"
            type="date"
            value={formData.hireDate}
            onChange={(e) => onFieldChange("hireDate", e.target.value)}
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />

          <TextField
            select
            label="Employment Type"
            value={formData.employmentType}
            onChange={(e) => onFieldChange("employmentType", e.target.value)}
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
            onChange={(e) => onFieldChange("status", e.target.value)}
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
            onChange={(e) => onFieldChange("salary", e.target.value)}
            placeholder="45000"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Bank Account Holder Name"
            value={formData.bankAccountHolderName}
            onChange={(e) => onFieldChange("bankAccountHolderName", e.target.value)}
            placeholder="Rahul Kumar"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Bank Name"
            value={formData.bankName}
            onChange={(e) => onFieldChange("bankName", e.target.value)}
            placeholder="State Bank of India"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Bank Account Number"
            value={formData.bankAccountNumber}
            onChange={(e) => onFieldChange("bankAccountNumber", e.target.value)}
            placeholder="123456789012"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Bank IFSC Code"
            value={formData.bankIfscCode}
            onChange={(e) => onFieldChange("bankIfscCode", e.target.value)}
            placeholder="SBIN0001234"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            select
            label="Branch"
            value={formData.branchId}
            onChange={(e) => onFieldChange("branchId", e.target.value)}
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
            onChange={(e) => onFieldChange("designationId", e.target.value)}
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
            onChange={(e) => onFieldChange("address", e.target.value)}
            placeholder="Enter address"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Skills"
            value={formData.skillIds}
            onChange={(e) => onFieldChange("skillIds", e.target.value)}
            placeholder="1, 2, 3"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Emergency Contact Name"
            value={formData.emergencyContactName}
            onChange={(e) => onFieldChange("emergencyContactName", e.target.value)}
            placeholder="Rohan Sharma"
            size="small"
            required
            sx={fieldSx}
          />

          <TextField
            label="Emergency Contact Phone"
            value={formData.emergencyContactPhone}
            onChange={(e) => onFieldChange("emergencyContactPhone", e.target.value)}
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
          onClick={onClose}
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
          onClick={onSave}
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
  );
}
