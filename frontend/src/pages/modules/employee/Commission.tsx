import { useMemo, useState } from "react";

interface ServiceCommissionRow {
  serviceEntryId: string;
  employee: string;
  clientName: string;
  serviceNames: string[];
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  payoutStatus: "Paid" | "Pending";
}

interface ProductCommissionRow {
  invoiceNo: string;
  invoiceDate: string;
  employee: string;
  clientName: string;
  itemsSold: number;
  productRevenue: number;
  commissionRate: number;
  commissionAmount: number;
}

interface OutsideExpertRow {
  assignmentId: string;
  assignmentDate: string;
  expertName: string;
  clientName: string;
  serviceType: string;
  billingAmount: number;
  payoutModel: string;
  payoutAmount: number;
  status: "Released" | "Due";
}

type CommissionSubModule = "services" | "inventory" | "outside";

const serviceCommissionRows: ServiceCommissionRow[] = [
  {
    serviceEntryId: "SV-10021",
    employee: "Onkar Shrimangle",
    clientName: "Aarav Jain",
    serviceNames: ["Hair Cut"],
    grossAmount: 1200,
    commissionRate: 12,
    commissionAmount: 144,
    payoutStatus: "Paid",
  },
  {
    serviceEntryId: "SV-10022",
    employee: "Riya Patil",
    clientName: "Nisha Kale",
    serviceNames: ["Cleanup", "Detan", "Threading"],
    grossAmount: 2650,
    commissionRate: 10,
    commissionAmount: 265,
    payoutStatus: "Pending",
  },
  {
    serviceEntryId: "SV-10023",
    employee: "Kunal Verma",
    clientName: "Meera Soni",
    serviceNames: ["Hair Spa", "Blow Dry"],
    grossAmount: 3100,
    commissionRate: 9,
    commissionAmount: 279,
    payoutStatus: "Paid",
  },
  {
    serviceEntryId: "SV-10024",
    employee: "Onkar Shrimangle",
    clientName: "Vikram Rao",
    serviceNames: ["Beard Styling"],
    grossAmount: 700,
    commissionRate: 12,
    commissionAmount: 84,
    payoutStatus: "Paid",
  },
];

const productCommissionRows: ProductCommissionRow[] = [
  {
    invoiceNo: "INV-5541",
    invoiceDate: "11 Feb 2026",
    employee: "Sia More",
    clientName: "Ritu Sharma",
    itemsSold: 3,
    productRevenue: 2850,
    commissionRate: 6,
    commissionAmount: 171,
  },
  {
    invoiceNo: "INV-5544",
    invoiceDate: "12 Feb 2026",
    employee: "Riya Patil",
    clientName: "Aditi Patne",
    itemsSold: 2,
    productRevenue: 1960,
    commissionRate: 5,
    commissionAmount: 98,
  },
  {
    invoiceNo: "INV-5548",
    invoiceDate: "13 Feb 2026",
    employee: "Onkar Shrimangle",
    clientName: "Harsh Vora",
    itemsSold: 1,
    productRevenue: 920,
    commissionRate: 4,
    commissionAmount: 37,
  },
  {
    invoiceNo: "INV-5550",
    invoiceDate: "13 Feb 2026",
    employee: "Sia More",
    clientName: "Neelam Das",
    itemsSold: 4,
    productRevenue: 3740,
    commissionRate: 6,
    commissionAmount: 224,
  },
];

const outsideExpertRows: OutsideExpertRow[] = [
  {
    assignmentId: "ASG-3007",
    assignmentDate: "09 Feb 2026",
    expertName: "Neha Bridal Studio",
    clientName: "Pooja Wankhede",
    serviceType: "Bridal Makeup",
    billingAmount: 30000,
    payoutModel: "Per Assignment",
    payoutAmount: 18000,
    status: "Released",
  },
  {
    assignmentId: "ASG-3011",
    assignmentDate: "12 Feb 2026",
    expertName: "Ritwik Spa Therapy",
    clientName: "Sneha Koli",
    serviceType: "Deep Tissue Spa",
    billingAmount: 9000,
    payoutModel: "Revenue Share 60%",
    payoutAmount: 5400,
    status: "Due",
  },
  {
    assignmentId: "ASG-3014",
    assignmentDate: "14 Feb 2026",
    expertName: "Ink & Tone Artist",
    clientName: "Karan Shah",
    serviceType: "Tattoo Session",
    billingAmount: 16000,
    payoutModel: "Revenue Share 55%",
    payoutAmount: 8800,
    status: "Released",
  },
];

const subModuleTabs: { key: CommissionSubModule; label: string }[] = [
  { key: "services", label: "Salon Services" },
  { key: "inventory", label: "Inventory Product Sales" },
  { key: "outside", label: "Outside Visit Experts" },
];

const formatMoney = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;
const formatPct = (value: number) => `${value.toFixed(1)}%`;

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-xl border border-[#E2E6F3] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5D678F]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1C2446]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#65709A]">{hint}</p> : null}
    </article>
  );
}

function StatusPill({ label }: { label: "Paid" | "Pending" | "Released" | "Due" }) {
  const palette =
    label === "Paid" || label === "Released"
      ? "bg-[#E7F6EC] text-[#1F7A45]"
      : "bg-[#FCEBEF] text-[#A04355]";

  return <span className={`inline-flex min-w-20 justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${palette}`}>{label}</span>;
}

export default function CommissionTab() {
  const [activeSubModule, setActiveSubModule] = useState<CommissionSubModule>("services");

  const activeMetrics = useMemo(() => {
    if (activeSubModule === "services") {
      const grossServices = serviceCommissionRows.reduce((sum, row) => sum + row.grossAmount, 0);
      const commissionBooked = serviceCommissionRows.reduce((sum, row) => sum + row.commissionAmount, 0);
      const pendingPayout = serviceCommissionRows
        .filter((row) => row.payoutStatus === "Pending")
        .reduce((sum, row) => sum + row.commissionAmount, 0);
      const multiServiceBills = serviceCommissionRows.filter((row) => row.serviceNames.length > 1).length;
      return [
        { label: "Service Entries", value: serviceCommissionRows.length.toString(), hint: "Per service / combo bills" },
        // { label: "Multi-Service Bills", value: multiServiceBills.toString(), hint: "Entries with 2+ services" },
        { label: "Gross Services", value: formatMoney(grossServices), hint: "Service billing value" },
        { label: "Pending Payout", value: formatMoney(pendingPayout), hint: `Booked ${formatMoney(commissionBooked)}` },
      ];
    }

    if (activeSubModule === "inventory") {
      const invoices = productCommissionRows.length;
      const totalItems = productCommissionRows.reduce((sum, row) => sum + row.itemsSold, 0);
      const revenue = productCommissionRows.reduce((sum, row) => sum + row.productRevenue, 0);
      const commissionBooked = productCommissionRows.reduce((sum, row) => sum + row.commissionAmount, 0);
      return [
        { label: "Invoices", value: invoices.toString(), hint: "Per invoice view" },
        { label: "Items Sold", value: totalItems.toString(), hint: "Total line-item qty" },
        { label: "Invoice Revenue", value: formatMoney(revenue), hint: "Product sales value" },
        { label: "Commission Booked", value: formatMoney(commissionBooked), hint: formatPct((commissionBooked / revenue) * 100) },
      ];
    }

    const assignments = outsideExpertRows.length;
    const billing = outsideExpertRows.reduce((sum, row) => sum + row.billingAmount, 0);
    const payout = outsideExpertRows.reduce((sum, row) => sum + row.payoutAmount, 0);
    const due = outsideExpertRows.filter((row) => row.status === "Due").reduce((sum, row) => sum + row.payoutAmount, 0);
    return [
      { label: "Assignments", value: assignments.toString(), hint: "Per assignment records" },
      { label: "Expert Billing", value: formatMoney(billing), hint: "Customer billed amount" },
      { label: "Payout Booked", value: formatMoney(payout), hint: "Freelancer payable" },
      { label: "Due Payout", value: formatMoney(due), hint: "Awaiting release" },
    ];
  }, [activeSubModule]);

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-[#E2E6F3] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E6EAF5] bg-[#F8FAFF] p-1.5">
          {subModuleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSubModule(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                activeSubModule === tab.key
                  ? "bg-white text-[#2F3561] shadow-sm"
                  : "text-[#5E678B] hover:bg-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {activeMetrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
          ))}
        </div>

        {activeSubModule === "services" ? (
          <div className="overflow-x-auto rounded-xl border border-[#E6EAF5]">
            <table className="min-w-[1120px] w-full">
              <thead className="bg-[#F8FAFF] text-xs text-[#2F3561]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Service Entry ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Employee</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-left font-semibold">Service Name(s)</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2 text-right font-semibold">Rate</th>
                  <th className="px-3 py-2 text-right font-semibold">Commission</th>
                  <th className="px-3 py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceCommissionRows.map((row) => {
                  const isMultiService = row.serviceNames.length > 1;
                  return (
                    <tr key={row.serviceEntryId} className="border-t border-[#EDF1F9] text-sm text-[#334155]">
                      <td className="px-3 py-2 font-medium text-[#1F2A4D]">{row.serviceEntryId}</td>
                      <td className="px-3 py-2">{row.employee}</td>
                      <td className="px-3 py-2">{row.clientName}</td>
                      <td className="px-3 py-2">{row.serviceNames.join(", ")}</td>
                      <td className="px-3 py-2">{isMultiService ? "Multi Service" : "Per Service"}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(row.grossAmount)}</td>
                      <td className="px-3 py-2 text-right">{formatPct(row.commissionRate)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-[#1F2A4D]">{formatMoney(row.commissionAmount)}</td>
                      <td className="px-3 py-2 text-center">
                        <StatusPill label={row.payoutStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeSubModule === "inventory" ? (
          <div className="overflow-x-auto rounded-xl border border-[#E6EAF5]">
            <table className="min-w-[1080px] w-full">
              <thead className="bg-[#F8FAFF] text-xs text-[#2F3561]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Invoice No</th>
                  <th className="px-3 py-2 text-left font-semibold">Invoice Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Employee</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-right font-semibold">Items</th>
                  <th className="px-3 py-2 text-right font-semibold">Invoice Amount</th>
                  <th className="px-3 py-2 text-right font-semibold">Rate</th>
                  <th className="px-3 py-2 text-right font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody>
                {productCommissionRows.map((row) => (
                  <tr key={row.invoiceNo} className="border-t border-[#EDF1F9] text-sm text-[#334155]">
                    <td className="px-3 py-2 font-medium text-[#1F2A4D]">{row.invoiceNo}</td>
                    <td className="px-3 py-2">{row.invoiceDate}</td>
                    <td className="px-3 py-2">{row.employee}</td>
                    <td className="px-3 py-2">{row.clientName}</td>
                    <td className="px-3 py-2 text-right">{row.itemsSold}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(row.productRevenue)}</td>
                    <td className="px-3 py-2 text-right">{formatPct(row.commissionRate)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-[#1F2A4D]">{formatMoney(row.commissionAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeSubModule === "outside" ? (
          <div className="overflow-x-auto rounded-xl border border-[#E6EAF5]">
            <table className="min-w-[1160px] w-full">
              <thead className="bg-[#F8FAFF] text-xs text-[#2F3561]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Assignment ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Expert</th>
                  <th className="px-3 py-2 text-left font-semibold">Client</th>
                  <th className="px-3 py-2 text-left font-semibold">Service Type</th>
                  <th className="px-3 py-2 text-right font-semibold">Billing</th>
                  <th className="px-3 py-2 text-left font-semibold">Payout Model</th>
                  <th className="px-3 py-2 text-right font-semibold">Payout</th>
                  <th className="px-3 py-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {outsideExpertRows.map((row) => (
                  <tr key={row.assignmentId} className="border-t border-[#EDF1F9] text-sm text-[#334155]">
                    <td className="px-3 py-2 font-medium text-[#1F2A4D]">{row.assignmentId}</td>
                    <td className="px-3 py-2">{row.assignmentDate}</td>
                    <td className="px-3 py-2">{row.expertName}</td>
                    <td className="px-3 py-2">{row.clientName}</td>
                    <td className="px-3 py-2">{row.serviceType}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(row.billingAmount)}</td>
                    <td className="px-3 py-2">{row.payoutModel}</td>
                    <td className="px-3 py-2 text-right font-semibold text-[#1F2A4D]">{formatMoney(row.payoutAmount)}</td>
                    <td className="px-3 py-2 text-center">
                      <StatusPill label={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </section>
  );
}
