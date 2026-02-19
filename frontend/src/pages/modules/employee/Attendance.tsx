import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Search,
  X,
} from "lucide-react";

type DayStatus = "P" | "A" | "H" | "WO";

interface AttendanceEmployeeRow {
  id: string;
  name: string;
  designation: string;
  present: number;
  halfDay: number;
  absent: number;
  days: DayStatus[];
}

const summaryCards = [
  {
    value: "0",
    label: "Present",
    sub: "0% On Time",
    icon: CheckCircle2,
    tint: "bg-[#E9F6EE]",
    iconColor: "text-[#22B65E]",
  },
  {
    value: "1",
    label: "Half Day",
    sub: "",
    icon: Clock3,
    tint: "bg-[#F7F1E8]",
    iconColor: "text-[#FF8A1A]",
  },
  {
    value: "0",
    label: "Late",
    sub: "",
    icon: CircleAlert,
    tint: "bg-[#F8F1E8]",
    iconColor: "text-[#F47D1B]",
  },
];

const employeeRows: AttendanceEmployeeRow[] = [
  {
    id: "2026MM360",
    name: "Madan Hr",
    designation: "Hr Manager",
    present: 0,
    halfDay: 0,
    absent: 14,
    days: ["WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A"],
  },
  {
    id: "2026PT364",
    name: "prachi testing",
    designation: "CRM Executive",
    present: 1,
    halfDay: 1,
    absent: 12,
    days: ["WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A", "A", "A", "P", "A", "WO", "A", "H"],
  },
  {
    id: "2026TM365",
    name: "tester madan",
    designation: "CRM Executive",
    present: 4,
    halfDay: 0,
    absent: 10,
    days: ["WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A", "P", "A", "P", "P", "WO", "P", "A"],
  },
  {
    id: "2026TM364",
    name: "tester madan",
    designation: "CRM Executive",
    present: 0,
    halfDay: 0,
    absent: 14,
    days: ["WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A", "A", "A", "A", "A", "WO", "A", "A"],
  },
];

const weekLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function AttendanceTab() {
  const [monthView, setMonthView] = useState(new Date(2026, 1, 1));
  const daysCount = 17;

  const dayHeaders = useMemo(() => {
    const year = monthView.getFullYear();
    const month = monthView.getMonth();
    return Array.from({ length: daysCount }, (_, index) => {
      const date = new Date(year, month, index + 1);
      return {
        day: index + 1,
        week: weekLabels[date.getDay()],
      };
    });
  }, [monthView]);

  const monthLabel = monthView.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const shiftMonth = (step: number) => {
    setMonthView((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + step);
      return next;
    });
  };

  const renderStatus = (status: DayStatus) => {
    if (status === "WO") {
      return <span className="text-[10px] font-semibold text-[#8A93A9]">WO</span>;
    }
    if (status === "P") {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2DB75D] text-white">
          <Check size={13} />
        </span>
      );
    }
    if (status === "H") {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F1C40F] text-white">
          <span className="text-[15px] leading-none">-</span>
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EE4A4A] text-white">
        <X size={13} />
      </span>
    );
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[1.75rem] font-semibold leading-tight text-[#122B50]">Employee Attendance</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[170px_1fr_170px_auto]">
        <select className="h-10 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-medium text-[#223761] outline-none">
          <option>Today</option>
          <option>Yesterday</option>
          <option>This Week</option>
        </select>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#8A94B2]" />
          <input placeholder="Search by name" className="h-10 w-full rounded-lg border border-[#D7DDEA] bg-white pl-10 pr-3 text-sm text-[#223761] outline-none" />
        </div>

        <select className="h-10 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-medium text-[#223761] outline-none">
          <option>All Locations</option>
        </select>

        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-semibold text-[#4253DB] hover:bg-[#F6F8FF]">
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`rounded-xl border border-[#E4E8F3] p-3 ${card.tint}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[2.05rem] font-semibold leading-none text-[#253C62]">{card.value}</p>
                  <p className="mt-1 text-[1rem] font-medium text-[#30466C]">{card.label}</p>
                  {card.sub ? <p className="mt-0.5 text-[0.85rem] text-[#60708E]">{card.sub}</p> : null}
                </div>
                <Icon size={22} className={card.iconColor} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="flex h-[320px] flex-col rounded-2xl border border-[#E2E6F3] bg-white p-4 shadow-sm">
          <h3 className="text-[1.55rem] font-semibold text-[#10284A]">Today&apos;s Distribution</h3>
          <div className="mt-3 flex-1 rounded-xl border border-[#E8ECF6] bg-[#FCFDFF] p-3">
            <div className="h-full overflow-hidden">
              <svg viewBox="0 0 520 220" className="block h-full w-full">
                <line x1="56" y1="34" x2="498" y2="34" stroke="#E3E8F4" strokeWidth="1" />
                <line x1="56" y1="96" x2="498" y2="96" stroke="#E3E8F4" strokeWidth="1" />
                <line x1="56" y1="158" x2="498" y2="158" stroke="#CDD5E7" strokeWidth="1" />
                <line x1="56" y1="34" x2="56" y2="158" stroke="#CDD5E7" strokeWidth="1" />

                <rect x="122" y="158" width="44" height="0" rx="6" fill="#2DB75D" />
                <rect x="220" y="158" width="44" height="0" rx="6" fill="#AAB2C8" />
                <rect x="318" y="146" width="44" height="12" rx="6" fill="#2F8DE4" />
                <rect x="416" y="122" width="44" height="36" rx="6" fill="#FF4C4C" />

                <text x="20" y="38" fill="#667390" fontSize="13">10</text>
                <text x="26" y="100" fill="#667390" fontSize="13">5</text>
                <text x="28" y="162" fill="#667390" fontSize="13">0</text>

                <text x="144" y="204" textAnchor="middle" fill="#5E6989" fontSize="15">Present</text>
                <text x="242" y="204" textAnchor="middle" fill="#5E6989" fontSize="15">Late</text>
                <text x="340" y="204" textAnchor="middle" fill="#5E6989" fontSize="15">Half Day</text>
                <text x="438" y="204" textAnchor="middle" fill="#5E6989" fontSize="15">Absent</text>
              </svg>
            </div>
          </div>
        </article>

        <article className="flex h-[320px] flex-col rounded-2xl border border-[#E2E6F3] bg-white p-4 shadow-sm">
          <h3 className="text-[1.55rem] font-semibold text-[#10284A]">Attendance Trend (Last 7 Days)</h3>
          <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-[#E8ECF6] bg-[#FCFDFF] p-3">
            <div className="mb-2 shrink-0 flex items-center justify-center gap-4 text-xs text-[#5B678A]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#7CC58A]" />
                Present
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#F4BE52]" />
                Late
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <svg viewBox="0 0 520 210" preserveAspectRatio="none" className="block h-full w-full">
                <line x1="56" y1="34" x2="498" y2="34" stroke="#E3E8F4" strokeWidth="1" />
                <line x1="56" y1="96" x2="498" y2="96" stroke="#E3E8F4" strokeWidth="1" />
                <line x1="56" y1="156" x2="498" y2="156" stroke="#D8DEEC" strokeWidth="1" />
                <line x1="56" y1="34" x2="56" y2="156" stroke="#CDD5E7" strokeWidth="1" />

                <polyline points="102,156 158,156 214,156 270,156 326,156 382,156 438,156" fill="none" stroke="#53B85F" strokeWidth="2.4" />
                {[102, 158, 214, 270, 326, 382, 438].map((x) => (
                  <circle key={x} cx={x} cy={156} r="4.6" fill="#FFFFFF" stroke="#53B85F" strokeWidth="2.4" />
                ))}

                <text x="27" y="160" fill="#5D6789" fontSize="13" fontWeight="600">0</text>
                <text x="102" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Wed</text>
                <text x="158" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Thu</text>
                <text x="214" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Fri</text>
                <text x="270" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Sat</text>
                <text x="326" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Sun</text>
                <text x="382" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Mon</text>
                <text x="438" y="194" textAnchor="middle" fill="#616D8E" fontSize="14">Tue</text>
              </svg>
            </div>
          </div>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#E1E5F3] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E6EAF5] px-5 py-3">
          <h3 className="text-[1.45rem] font-semibold text-[#1F3763]">Employee Attendance</h3>
          <div className="flex items-center gap-3 text-[#1F3763]">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-lg p-1.5 hover:bg-[#EFF2FA]">
              <ChevronLeft size={20} />
            </button>
            <p className="text-[1.45rem] font-semibold">{monthLabel}</p>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-lg p-1.5 hover:bg-[#EFF2FA]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F5F7FB] text-[#111827]">
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">EMP.ID</th>
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">EMPLOYEE</th>
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">DESIGNATION</th>
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">PRESENT</th>
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">HALF DAY</th>
                <th className="border-b border-r border-[#D6DCEB] px-3 py-2.5 text-center text-[0.84rem] font-semibold">ABSENT</th>
                {dayHeaders.map((day) => (
                  <th key={day.day} className="border-b border-r border-[#D6DCEB] px-1.5 py-1.5 text-center last:border-r-0">
                    <p className="text-[0.84rem] font-semibold">{day.day}</p>
                    <p className="text-[0.75rem] font-semibold text-[#8A93A9]">{day.week}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((row, rowIndex) => (
                <tr key={row.id} className={rowIndex === 1 ? "bg-[#F1F4FF]" : "bg-white"}>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-center text-[0.96rem] font-semibold text-[#0F2E5D]">{row.id}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-left text-[0.96rem] font-semibold text-[#0F2E5D]">{row.name}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-left text-[0.96rem] text-[#344A74]">{row.designation}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-center text-[1.15rem] font-semibold text-[#0A8A4B]">{row.present}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-center text-[1.15rem] font-semibold text-[#9E6400]">{row.halfDay}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-3 py-2 text-center text-[1.15rem] font-semibold text-[#C61D1D]">{row.absent}</td>
                  {row.days.map((status, idx) => (
                    <td key={`${row.id}-${idx}`} className="border-b border-r border-[#D6DCEB] px-1.5 py-1.5 text-center last:border-r-0">
                      {renderStatus(status)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
