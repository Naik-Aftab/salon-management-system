import { ArrowLeft } from "lucide-react";
import type { EmployeeProfileMock, EmployeeRow } from "../employeeTypes";

interface EmployeeProfilePanelProps {
  employee: EmployeeRow;
  profile: EmployeeProfileMock;
  initials: string;
  onBack: () => void;
}

function KVRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[78px_10px_minmax(0,1fr)] items-start gap-1.5 leading-[1.3]">
      <p className="text-[0.82rem] font-semibold text-[#111827]">{label}</p>
      <p className="text-[0.82rem] font-semibold text-[#111827]">:</p>
      <p className="text-[0.82rem] text-[#111827] break-words">{value || ""}</p>
    </div>
  );
}

export default function EmployeeProfilePanel({ employee, profile, initials, onBack }: EmployeeProfilePanelProps) {
  return (
    <div className="rounded-[24px] border border-[#E2E5ED] bg-[#F5F6F8] p-4 shadow-[0_10px_20px_rgba(20,25,40,0.05)] md:p-4">
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#E2E5ED] bg-white px-3.5 py-2.5 text-[#2F3561] shadow-sm">
        <button
          type="button"
          onClick={onBack}
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
              <p className="whitespace-nowrap text-[1.75rem] font-semibold leading-tight text-[#2D2D2D]">{employee.name}</p>
              <p className="text-[1.2rem] text-[#6F758F]">{employee.gender}</p>
              <p className="mt-1 text-[11px] font-medium text-[#66709C]">EMP.ID: {employee.employeeId}</p>
            </article>

            <article className="border-r border-[#E2E5ED] pr-4">
              <div className="space-y-2.5">
                <KVRow label="E-mail" value={profile.email} />
                <KVRow label="Cont" value={profile.contact} />
                <KVRow label="Age" value={profile.age} />
                <KVRow label="Ph. no." value={profile.phone} />
                <KVRow label="Alt" value={profile.altPhone} />
                <KVRow label="D.O.B." value={profile.dob} />
                <KVRow label="Marital" value={profile.maritalStatus} />
                <KVRow label="Addr." value={profile.address} />
              </div>
            </article>

            <article className="text-[0.84rem] text-[#1F1F1F]">
              {[
                ["Date of joining.", profile.dateOfJoining],
                ["Skill Set", profile.skillSet],
                ["Specialization", profile.specialization],
                ["Education", profile.education],
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
                <p>{profile.bank || ""}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#E2E5ED] bg-white px-2 py-3 text-center shadow-sm">
            <p className="text-[1.08rem] font-semibold leading-tight text-[#2A3158] underline underline-offset-2">Employee Tenure</p>
            <p className="mt-1 whitespace-nowrap text-[1.2rem] font-semibold leading-tight tracking-tight text-[#151515]">
              {profile.tenure}
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
                {profile.attendance.map((item, index) => (
                  <tr key={`${item.estimateDate}-${index}`} className="text-[0.86rem] text-[#202020]">
                    <td className="px-2 py-2">{item.estimateDate}</td>
                    <td className="px-2 py-2">{item.duration}</td>
                    <td className="px-2 py-2">{item.permissionDetail}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-[0.76rem] font-medium ${
                          item.action === "Approved" ? "bg-[#DFF2E5] text-[#2A7A44]" : "bg-[#F5DDE0] text-[#A74352]"
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
  );
}
