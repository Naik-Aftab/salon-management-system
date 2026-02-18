interface PayrollRow {
  employeeName: string;
  paidDays: number;
  ctcAnnual: string;
  grossMonthly: string;
  basicDaProrated: string;
  taxes: string;
  hraProrated: string;
  conveyanceProrated: string;
  specialAllowance: string;
  cca: string;
  reimbursements: string;
  totalEarnings: string;
  netPay: string;
}

const payrollRows: PayrollRow[] = [
  {
    employeeName: "Onkar Shrimangle",
    paidDays: 26,
    ctcAnnual: "₹ 5,40,000.00",
    grossMonthly: "₹ 45,000.00",
    basicDaProrated: "₹ 18,000.00",
    taxes: "₹ 2,25000.00",
    hraProrated: "₹ 9,000.00",
    conveyanceProrated: "₹ 1,600.00",
    specialAllowance: "₹ 12,400.00",
    cca: "₹ 1,000.00",
    reimbursements: "₹ 2,400.00",
    totalEarnings: "₹ 44,400.00",
    netPay: "₹ 42,150.00",
  },
  {
    employeeName: "Riya Patil",
    paidDays: 25,
    ctcAnnual: "₹ 4,80,000.00",
    grossMonthly: "₹ 40,000.00",
    basicDaProrated: "₹ 16,000.00",
    taxes: "₹ 1,950.00",
    hraProrated: "₹ 8,000.00",
    conveyanceProrated: "₹ 1,600.00",
    specialAllowance: "₹ 10,800.00",
    cca: "₹ 1,000.00",
    reimbursements: "₹ 1,800.00",
    totalEarnings: "₹ 39,200.00",
    netPay: "₹ 37,250.00",
  },
  {
    employeeName: "Aman Tiwari",
    paidDays: 28,
    ctcAnnual: "₹ 7,20,000.00",
    grossMonthly: "₹ 60,000.00",
    basicDaProrated: "₹ 24,000.00",
    taxes: "₹ 3,500.00",
    hraProrated: "₹ 12,000.00",
    conveyanceProrated: "₹ 1,600.00",
    specialAllowance: "₹ 18,400.00",
    cca: "₹ 1,500.00",
    reimbursements: "₹ 2,800.00",
    totalEarnings: "₹ 60,300.00",
    netPay: "₹ 56,800.00",
  },
  {
    employeeName: "Sia More",
    paidDays: 24,
    ctcAnnual: "₹ 4,20,000.00",
    grossMonthly: "₹ 35,000.00",
    basicDaProrated: "₹ 14,000.00",
    taxes: "₹ 1,450.00",
    hraProrated: "₹ 7,000.00",
    conveyanceProrated: "₹ 1,600.00",
    specialAllowance: "₹ 9,900.00",
    cca: "₹ 900.00",
    reimbursements: "₹ 1,200.00",
    totalEarnings: "₹ 34,600.00",
    netPay: "₹ 33,150.00",
  },
  {
    employeeName: "Kunal Verma",
    paidDays: 23,
    ctcAnnual: "₹ 3,96,000.00",
    grossMonthly: "₹ 33,000.00",
    basicDaProrated: "₹ 13,200.00",
    taxes: "₹ 1,300.00",
    hraProrated: "₹ 6,600.00",
    conveyanceProrated: "₹ 1,600.00",
    specialAllowance: "₹ 8,900.00",
    cca: "₹ 900.00",
    reimbursements: "₹ 900.00",
    totalEarnings: "₹ 32,100.00",
    netPay: "₹ 30,800.00",
  },
];

const payrollColumns = [
  "EMPLOYEE NAME",
  "PAID DAYS",
  "CTC (ANNUAL)",
  "GROSS (MONTHLY)",
  "BASIC + DA (PRORATED)",
  "TAXES",
  "HRA (PRORATED)",
  "CONVEYANCE (PRORATED)",
  "SPECIAL ALLOWANCE",
  "CCA",
  "REIMBURSEMENTS",
  "TOTAL EARNINGS",
  "NET PAY",
] as const;

export default function PayrollTab() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Period</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">01/02/2026 - 28/02/2026</p>
          <p className="mt-4 text-sm font-semibold text-[#212538]">Payroll Cost (Gross for Period)</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 17,80,000.00</p>
        </article>

        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Employees Net Pay (Prorated)</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 2,77,155.00</p>
          <p className="mt-4 text-sm font-semibold text-[#212538]">Employees</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">119</p>
        </article>

        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Total CTC (Annual)</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 2,13,59,994.00</p>
          <p className="mt-4 text-sm font-semibold text-[#212538]">Total Paid Days</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">613.5</p>
        </article>

        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Pay Day</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">28</p>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Feb 2026</p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Taxes</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 22,595.00</p>
        </article>

        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Pre-Tax Deductions</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 0.00</p>
        </article>

        <article className="rounded-xl border border-[#DCE2EE] bg-[#fff] px-4 py-4">
          <p className="text-sm font-semibold text-[#212538]">Post-Tax Deductions</p>
          <p className="mt-0.5 text-base font-bold leading-none text-[#111827]">Rs. 0.00</p>
        </article>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E2E6F3] bg-white shadow-sm">
        <table className="w-full min-w-[1650px] table-auto border-separate border-spacing-0 whitespace-nowrap">
          <thead>
            <tr>
              {payrollColumns.map((column) => (
                <th
                  key={column}
                  className="sticky top-0 border-b border-r border-[#E3E7F2] bg-[#F6F8FC] px-3 py-2 text-left text-xs font-bold tracking-wide text-[#2F3561] whitespace-nowrap last:border-r-0"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payrollRows.map((row) => (
              <tr key={row.employeeName} className="odd:bg-white even:bg-[#FBFCFF]">
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm font-semibold text-[#20263F] whitespace-nowrap">{row.employeeName}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.paidDays}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.ctcAnnual}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.grossMonthly}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.basicDaProrated}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.taxes}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.hraProrated}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.conveyanceProrated}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.specialAllowance}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.cca}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm text-[#334155] whitespace-nowrap">{row.reimbursements}</td>
                <td className="border-b border-r border-[#E8ECF6] px-3 py-2 text-sm font-semibold text-[#20263F] whitespace-nowrap">{row.totalEarnings}</td>
                <td className="border-b border-[#E8ECF6] px-3 py-2 text-sm font-bold text-[#111827] whitespace-nowrap">{row.netPay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
