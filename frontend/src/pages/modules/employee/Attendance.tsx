import { useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  LocateFixed,
  PhoneCall,
  Search,
  Send,
  Target,
  UserRound,
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

const topNavItems = [
  { label: "Dashboard", icon: ChartNoAxesColumn },
  { label: "Performance Summary", icon: Send },
  { label: "Collection Analysis", icon: BriefcaseBusiness },
  { label: "Follow-up Analysis", icon: Send },
  { label: "Call Analysis", icon: PhoneCall },
  { label: "Attendance", icon: Clock3, active: true },
  { label: "Calendar", icon: CalendarDays },
  { label: "Target", icon: Target },
];

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
  {
    value: "0",
    label: "WFH",
    sub: "",
    icon: LocateFixed,
    tint: "bg-[#EAF1FB]",
    iconColor: "text-[#4282EA]",
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
      return <span className="text-[11px] font-semibold text-[#8A93A9]">WO</span>;
    }
    if (status === "P") {
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2DB75D] text-white">
          <Check size={15} />
        </span>
      );
    }
    if (status === "H") {
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F1C40F] text-white">
          <span className="text-[17px] leading-none">-</span>
        </span>
      );
    }
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EE4A4A] text-white">
        <X size={15} />
      </span>
    );
  };

  return (
    <section className="space-y-5">
      <article className="overflow-hidden rounded-2xl border border-[#E1E5F3] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EBF5] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7FD] text-[#273A63]">S</div>
            <p className="text-3xl font-bold text-[#2F4BC7]">Sat.ai</p>
            <span className="rounded-lg border border-[#E8D278] bg-[#FFF8D8] px-3 py-1 text-xs font-semibold text-[#8A6D1A]">
              Ma Pranaam Buildcon
            </span>
            <span className="rounded-lg border border-[#E8D278] bg-[#FFF8D8] px-3 py-1 text-xs font-semibold text-[#8A6D1A]">
              ID: BU603894
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-[#5D6888]">
              <span className="text-[#64C989]">●</span> 0 Active <span className="text-[#AAB2C8]">/ 2 Inactive</span>
            </p>
            <button className="rounded-lg border border-[#D6DCEB] bg-white px-3 py-1.5 text-sm text-[#2A3B61]">🔊 Sound On</button>
            <Send size={18} className="text-[#5B6688]" />
            <Bell size={19} className="text-[#5B6688]" />
            <div className="rounded-full bg-[#EEE9FF] p-2.5">
              <UserRound size={22} className="text-[#2D3658]" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[0.95rem] font-medium transition ${
                  item.active
                    ? "bg-[#F3EDFF] text-[#7C3AED] shadow-[inset_0_-2px_0_0_#7C3AED]"
                    : "text-[#4B587A] hover:bg-[#F4F6FD]"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </div>
      </article>

      <div>
        <h2 className="text-[2rem] font-semibold text-[#122B50]">Employee Attendance</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[170px_1fr_170px_auto]">
        <select className="h-11 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-medium text-[#223761] outline-none">
          <option>Today</option>
          <option>Yesterday</option>
          <option>This Week</option>
        </select>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#8A94B2]" />
          <input placeholder="Search by name" className="h-11 w-full rounded-lg border border-[#D7DDEA] bg-white pl-10 pr-3 text-sm text-[#223761] outline-none" />
        </div>

        <select className="h-11 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-medium text-[#223761] outline-none">
          <option>All Locations</option>
        </select>

        <button type="button" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#D7DDEA] bg-white px-4 text-sm font-semibold text-[#4253DB] hover:bg-[#F6F8FF]">
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className={`rounded-xl border border-[#E4E8F3] p-4 ${card.tint}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-5xl font-semibold leading-none text-[#253C62]">{card.value}</p>
                  <p className="mt-2 text-[1.1rem] font-medium text-[#30466C]">{card.label}</p>
                  {card.sub ? <p className="mt-1 text-sm text-[#60708E]">{card.sub}</p> : null}
                </div>
                <Icon size={26} className={card.iconColor} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#E2E6F3] bg-white p-5 shadow-sm">
          <h3 className="text-4xl font-semibold text-[#10284A]">Today&apos;s Distribution</h3>
          <div className="mt-5 rounded-xl border border-[#E8ECF6] bg-[#FCFDFF] p-4">
            <div className="h-[220px] border-l border-b border-[#D9DFEE] px-3 pb-2">
              <div className="flex h-full items-end justify-around">
                {[
                  { label: "Present", height: "8%", color: "#2DB75D" },
                  { label: "Late", height: "0%", color: "#AAB2C8" },
                  { label: "Half Day", height: "14%", color: "#2F8DE4" },
                  { label: "Absent", height: "35%", color: "#FF4C4C" },
                ].map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center gap-2">
                    <div className="w-10 rounded-t-md" style={{ height: bar.height, backgroundColor: bar.color }} />
                    <p className="text-xs text-[#5E6989]">{bar.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#E2E6F3] bg-white p-5 shadow-sm">
          <h3 className="text-4xl font-semibold text-[#10284A]">Attendance Trend (Last 7 Days)</h3>
          <div className="mt-5 rounded-xl border border-[#E8ECF6] bg-[#FCFDFF] p-4">
            <div className="mb-2 flex items-center justify-center gap-4 text-xs text-[#5B678A]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#7CC58A]" />
                Present
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#F4BE52]" />
                Late
              </div>
            </div>
            <div className="relative h-[220px]">
              <svg viewBox="0 0 460 220" className="h-full w-full">
                <line x1="20" y1="170" x2="440" y2="170" stroke="#D8DEEC" strokeWidth="1" />
                <polyline points="40,170 100,170 160,170 220,170 280,170 340,170 400,170" fill="none" stroke="#53B85F" strokeWidth="2.2" />
                {[40, 100, 160, 220, 280, 340, 400].map((x) => (
                  <circle key={x} cx={x} cy={170} r="4.6" fill="#FFFFFF" stroke="#53B85F" strokeWidth="2.2" />
                ))}
              </svg>
              <span className="absolute left-0 top-[148px] text-xs font-semibold text-[#5D6789]">0</span>
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-7 text-center text-xs text-[#616D8E]">
                {["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"].map((day) => (
                  <p key={day}>{day}</p>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#E1E5F3] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E6EAF5] px-5 py-4">
          <h3 className="text-2xl font-semibold text-[#1F3763]">Employee Attendance</h3>
          <div className="flex items-center gap-3 text-[#1F3763]">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-lg p-1.5 hover:bg-[#EFF2FA]">
              <ChevronLeft size={24} />
            </button>
            <p className="text-[2rem] font-semibold">{monthLabel}</p>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-lg p-1.5 hover:bg-[#EFF2FA]">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F5F7FB] text-[#111827]">
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">EMP.ID</th>
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">EMPLOYEE</th>
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">DESIGNATION</th>
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">PRESENT</th>
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">HALF DAY</th>
                <th className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-sm font-semibold">ABSENT</th>
                {dayHeaders.map((day) => (
                  <th key={day.day} className="border-b border-r border-[#D6DCEB] px-2 py-2 text-center last:border-r-0">
                    <p className="text-sm font-semibold">{day.day}</p>
                    <p className="text-xs font-semibold text-[#8A93A9]">{day.week}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((row, rowIndex) => (
                <tr key={row.id} className={rowIndex === 1 ? "bg-[#F1F4FF]" : "bg-white"}>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center font-semibold text-[#0F2E5D]">{row.id}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-left font-semibold text-[#0F2E5D]">{row.name}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-left text-[#344A74]">{row.designation}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-2xl font-semibold text-[#0A8A4B]">{row.present}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-2xl font-semibold text-[#9E6400]">{row.halfDay}</td>
                  <td className="border-b border-r border-[#D6DCEB] px-4 py-3 text-center text-2xl font-semibold text-[#C61D1D]">{row.absent}</td>
                  {row.days.map((status, idx) => (
                    <td key={`${row.id}-${idx}`} className="border-b border-r border-[#D6DCEB] px-2 py-2 text-center last:border-r-0">
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
