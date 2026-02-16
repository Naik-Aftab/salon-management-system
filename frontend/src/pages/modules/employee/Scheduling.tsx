import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, CirclePlus, Funnel } from "lucide-react";

type ScheduleMode = "Shift Management" | "Leave Management";
type ViewMode = "weekly" | "monthly";

interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  colorClass: string;
}

interface NewShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  colorClass: string;
  description: string;
  date: string;
}

const initialShiftTypes: ShiftType[] = [
  { id: "morning", name: "Morning", startTime: "08:00", endTime: "16:00", colorClass: "bg-[#F1EAF8] text-[#7A58A2]" },
  { id: "afternoon", name: "Afternoon", startTime: "13:00", endTime: "17:00", colorClass: "bg-[#E9F4EE] text-[#4F8C67]" },
  { id: "evening", name: "Evening", startTime: "18:00", endTime: "23:00", colorClass: "bg-[#E9F4FA] text-[#4A93AA]" },
];

const colorOptions = [
  "bg-[#E9F4FA] text-[#4A93AA]",
  "bg-[#F1EAF8] text-[#7A58A2]",
  "bg-[#E9F4EE] text-[#4F8C67]",
  "bg-[#F7EEC7] text-[#8B7A35]",
  "bg-[#F9D8E9] text-[#A34676]",
  "bg-[#F8DBC6] text-[#A45A38]",
];

const pad = (value: number) => String(value).padStart(2, "0");

const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toDisplayTime = (time24h: string) => {
  const [h, m] = time24h.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const normalized = h % 12 === 0 ? 12 : h % 12;
  return `${normalized}${m === 0 ? "" : `:${pad(m)}`}${suffix}`;
};

const shiftTimeLabel = (shift: ShiftType) => `${toDisplayTime(shift.startTime)} - ${toDisplayTime(shift.endTime)}`;

const monthShort = (date: Date) => date.toLocaleDateString("en-GB", { month: "short" });
const weekdayShort = (date: Date) => date.toLocaleDateString("en-GB", { weekday: "short" });

const startOfWeekMonday = (seed: Date) => {
  const copy = new Date(seed);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
};

const getVisibleDates = (anchorDate: Date, viewMode: ViewMode) => {
  if (viewMode === "weekly") {
    const start = startOfWeekMonday(anchorDate);
    return Array.from({ length: 6 }, (_, index) => {
      const next = new Date(start);
      next.setDate(start.getDate() + index);
      return next;
    });
  }

  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
};

const getRangeLabel = (dates: Date[], viewMode: ViewMode) => {
  if (!dates.length) return "";
  if (viewMode === "weekly") {
    const first = dates[0];
    const last = dates[dates.length - 1];
    return `This week ${first.getDate()} - ${last.getDate()} ${monthShort(last)}, ${last.getFullYear()}`;
  }
  const date = dates[0];
  return `This month ${date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
};

const buildInitialSchedule = (dates: Date[]) => {
  const pattern = [
    ["morning", "evening", "afternoon", "morning", "evening"],
    ["evening", "morning", "afternoon", "evening", "morning"],
    ["afternoon", "evening", "evening", "afternoon", "evening"],
    ["evening", "morning", "afternoon", "morning", "afternoon"],
    ["evening", "afternoon", "morning", "evening", "morning"],
    ["afternoon", "evening", "morning", "afternoon", "evening"],
  ];

  return dates.reduce<Record<string, string[]>>((acc, date, index) => {
    const key = dateKey(date);
    acc[key] = pattern[index % pattern.length];
    return acc;
  }, {});
};

export default function SchedulingTab() {
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("Shift Management");
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [anchorDate, setAnchorDate] = useState(new Date(2024, 7, 1));
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>(initialShiftTypes);
  const [filterShiftId, setFilterShiftId] = useState<"all" | string>("all");
  const [scheduleByDate, setScheduleByDate] = useState<Record<string, string[]>>(() =>
    buildInitialSchedule(getVisibleDates(new Date(2024, 7, 1), "weekly"))
  );
  const [newShift, setNewShift] = useState<NewShiftForm>({
    name: "",
    startTime: "",
    endTime: "",
    colorClass: colorOptions[0],
    description: "",
    date: "2024-08-01",
  });

  const visibleDates = useMemo(() => getVisibleDates(anchorDate, viewMode), [anchorDate, viewMode]);

  const normalizedSchedule = useMemo(() => {
    const filled = { ...scheduleByDate };
    visibleDates.forEach((date, index) => {
      const key = dateKey(date);
      if (!filled[key]) {
        filled[key] = index % 3 === 0 ? ["morning", "evening"] : index % 3 === 1 ? ["evening", "afternoon"] : ["afternoon", "morning"];
      }
    });
    return filled;
  }, [scheduleByDate, visibleDates]);

  const filteredRowsByDate = useMemo(
    () =>
      visibleDates.map((date) => {
        const key = dateKey(date);
        const shiftIds = normalizedSchedule[key] ?? [];
        const ids = filterShiftId === "all" ? shiftIds : shiftIds.filter((id) => id === filterShiftId);
        return ids.map((id) => shiftTypes.find((shift) => shift.id === id)).filter(Boolean) as ShiftType[];
      }),
    [visibleDates, normalizedSchedule, filterShiftId, shiftTypes]
  );

  const maxRows = Math.max(1, ...filteredRowsByDate.map((items) => items.length));

  const rangeLabel = useMemo(() => getRangeLabel(visibleDates, viewMode), [visibleDates, viewMode]);

  const handleMoveRange = (direction: "prev" | "next") => {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "weekly") {
        next.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      } else {
        next.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      }
      return next;
    });
  };

  const handleOpenCreateShift = () => {
    setNewShift((prev) => ({ ...prev, date: dateKey(visibleDates[0] ?? new Date()) }));
    setIsCreateShiftOpen(true);
  };

  const handleCreateShift = () => {
    if (!newShift.name.trim() || !newShift.startTime || !newShift.endTime || !newShift.date) {
      return;
    }

    const existing = shiftTypes.find(
      (shift) =>
        shift.name.trim().toLowerCase() === newShift.name.trim().toLowerCase() &&
        shift.startTime === newShift.startTime &&
        shift.endTime === newShift.endTime &&
        shift.colorClass === newShift.colorClass
    );

    const shiftId = existing?.id ?? `custom-${Date.now()}`;

    if (!existing) {
      setShiftTypes((prev) => [
        ...prev,
        {
          id: shiftId,
          name: newShift.name.trim(),
          startTime: newShift.startTime,
          endTime: newShift.endTime,
          colorClass: newShift.colorClass,
        },
      ]);
    }

    setScheduleByDate((prev) => ({
      ...prev,
      [newShift.date]: [...(prev[newShift.date] ?? []), shiftId],
    }));

    setNewShift({
      name: "",
      startTime: "",
      endTime: "",
      colorClass: colorOptions[0],
      description: "",
      date: dateKey(visibleDates[0] ?? new Date()),
    });
    setIsCreateShiftOpen(false);
  };

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
        <button
          type="button"
          onClick={() => setScheduleMode("Shift Management")}
          className={`rounded-xl border px-4 py-2 text-left text-[0.95rem] font-semibold shadow-sm transition ${
            scheduleMode === "Shift Management"
              ? "border-[#DCE9ED] bg-[#EAF5F8] text-[#1D1D1D]"
              : "border-[#E2E5EE] bg-white text-[#1D1D1D] hover:bg-[#F7F9FD]"
          }`}
        >
          Shift Management
        </button>

        <button
          type="button"
          onClick={() => setScheduleMode("Leave Management")}
          className={`rounded-xl border px-4 py-2 text-left text-[0.95rem] font-semibold shadow-sm transition ${
            scheduleMode === "Leave Management"
              ? "border-[#DCE9ED] bg-[#EAF5F8] text-[#1D1D1D]"
              : "border-[#E2E5EE] bg-white text-[#1D1D1D] hover:bg-[#F7F9FD]"
          }`}
        >
          Leave Management
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#E2E5EE] bg-white px-4 text-[0.95rem] font-semibold text-[#1D1D1D] shadow-sm transition hover:bg-[#F7F9FD]"
          >
            <Funnel size={15} />
            Filter
            <ChevronDown size={14} />
          </button>
          {showFilterMenu ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-48 rounded-xl border border-[#DEE3F1] bg-white p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              <button
                type="button"
                onClick={() => {
                  setFilterShiftId("all");
                  setShowFilterMenu(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  filterShiftId === "all" ? "bg-[#EEF2FF] font-semibold text-[#2F3561]" : "text-slate-700 hover:bg-[#F5F7FE]"
                }`}
              >
                All
              </button>
              {shiftTypes.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => {
                    setFilterShiftId(shift.id);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    filterShiftId === shift.id ? "bg-[#EEF2FF] font-semibold text-[#2F3561]" : "text-slate-700 hover:bg-[#F5F7FE]"
                  }`}
                >
                  {shift.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleOpenCreateShift}
          className="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#DCE9ED] bg-[#EAF5F8] px-4 text-[0.95rem] font-semibold text-[#1D1D1D] shadow-sm transition hover:bg-[#DFF0F5]"
        >
          <CirclePlus size={15} />
          Add Shift
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-[#D8DEEE] bg-white p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode("weekly")}
            className={`rounded-md px-3 py-1 ${viewMode === "weekly" ? "bg-[#EEF2FF] text-[#2F3561]" : "text-[#5E6790]"}`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setViewMode("monthly")}
            className={`rounded-md px-3 py-1 ${viewMode === "monthly" ? "bg-[#EEF2FF] text-[#2F3561]" : "text-[#5E6790]"}`}
          >
            Monthly
          </button>
        </div>

        <p className="text-center text-[0.95rem] font-semibold text-[#1F1F1F]">{rangeLabel}</p>

        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleMoveRange("prev")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8DEEE] bg-white text-[#445084] hover:bg-[#F4F6FE]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleMoveRange("next")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8DEEE] bg-white text-[#445084] hover:bg-[#F4F6FE]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E4E7F0] bg-white">
        <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              {visibleDates.map((day) => (
                <th key={dateKey(day)} className="border-b border-r border-[#E4E7F0] px-2 py-2 text-center last:border-r-0">
                  <p className="text-[0.95rem] font-semibold text-[#2B2B2B]">
                    {weekdayShort(day)}, {day.getDate()} {monthShort(day)}
                  </p>
                  <p className="text-[0.78rem] font-semibold text-slate-500">24h</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {visibleDates.map((day, colIndex) => {
                  const shift = filteredRowsByDate[colIndex][rowIndex] ?? null;
                  return (
                    <td key={`${dateKey(day)}-${rowIndex}`} className="border-b border-r border-[#E4E7F0] p-1.5 align-top last:border-r-0">
                      {shift ? (
                        <div className={`rounded-[3px] px-2 py-2 text-center ${shift.colorClass}`}>
                          <p className="text-[0.86rem] font-medium">{shift.name}</p>
                          <p className="text-[0.78rem] font-semibold text-[#1F1F1F]">{shiftTimeLabel(shift)}</p>
                        </div>
                      ) : (
                        <div className="h-[54px] rounded-[3px] bg-[#F9FAFD]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateShiftOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[760px] rounded-2xl border border-[#DDE3F2] bg-white p-6 shadow-[0_22px_44px_rgba(15,23,42,0.25)]">
            <h3 className="text-xl font-semibold text-[#1F1F1F]">Create Shift Type</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">Shift Name</label>
                <input
                  value={newShift.name}
                  onChange={(event) => setNewShift((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="eg. Morning Shift"
                  className="w-full rounded-lg border border-[#D9DEED] px-3 py-2 text-sm outline-none focus:border-[#AAB6DD]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">Start Time</label>
                <input
                  type="time"
                  value={newShift.startTime}
                  onChange={(event) => setNewShift((prev) => ({ ...prev, startTime: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9DEED] px-3 py-2 text-sm outline-none focus:border-[#AAB6DD]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">End Time</label>
                <input
                  type="time"
                  value={newShift.endTime}
                  onChange={(event) => setNewShift((prev) => ({ ...prev, endTime: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9DEED] px-3 py-2 text-sm outline-none focus:border-[#AAB6DD]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">Schedule Date</label>
                <input
                  type="date"
                  value={newShift.date}
                  onChange={(event) => setNewShift((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full rounded-lg border border-[#D9DEED] px-3 py-2 text-sm outline-none focus:border-[#AAB6DD]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">Shift Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((colorClass) => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setNewShift((prev) => ({ ...prev, colorClass }))}
                      className={`h-7 w-7 rounded-full border-2 ${
                        newShift.colorClass === colorClass ? "border-[#445084]" : "border-transparent"
                      }`}
                    >
                      <span className={`block h-full w-full rounded-full ${colorClass.split(" ")[0]}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-[#2D325B]">Description (Optional)</label>
                <textarea
                  value={newShift.description}
                  onChange={(event) => setNewShift((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Add details about this shift type"
                  className="h-20 w-full resize-none rounded-lg border border-[#D9DEED] px-3 py-2 text-sm outline-none focus:border-[#AAB6DD]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateShiftOpen(false)}
                className="rounded-lg border border-[#D6DBEC] px-4 py-2 text-sm font-medium text-[#4C557F] hover:bg-[#F5F7FE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateShift}
                className="rounded-lg bg-[#4F69D9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#445CC0]"
              >
                Create Shift
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
