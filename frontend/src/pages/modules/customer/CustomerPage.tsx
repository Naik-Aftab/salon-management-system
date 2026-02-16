import { useMemo, useState } from 'react';
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
  type SxProps,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { ArrowLeft, ChevronDown, CirclePlus, Download, Filter, Search, Users, X } from 'lucide-react';
import type { TransitionProps } from '@mui/material/transitions';
import type { Theme } from '@mui/material/styles';

interface CustomerRow {
  customerId: string;
  name: string;
  gender: string;
  customerType: 'Regular' | 'Premium' | 'VIP';
  services: string;
  lastVisit: string;
  stylist: string;
  branch: string;
}

interface CustomerFormData {
  mobileNo: string;
  alternateNo: string;
  name: string;
  dob: string;
  email: string;
  anniversary: string;
  gender: string;
  ageGroup: string;
  country: string;
  address: string;
  city: string;
  area: string;
}

interface ProfileHistoryRow {
  branch: string;
  invoiceNo: string;
  dateTime: string;
  total: string;
  discount: string;
  gst: string;
  finalAmount: string;
  paymentMode: string;
}

interface MembershipInfo {
  plan: string;
  memberId: string;
  duration: string;
  status: string;
  expiryDate: string;
  membershipType: string;
  services: string;
}

interface CustomerProfileMock {
  email: string;
  dob: string;
  age: string;
  phone: string;
  altPhone: string;
  town: string;
  loyaltyProgress: number;
  notes: string;
  membership: MembershipInfo;
  historyByTab: Record<DetailHistoryTab, ProfileHistoryRow[]>;
}

type SortableKey = 'customerId' | 'lastVisit';
type SortOrder = 'asc' | 'desc';
type DetailHistoryTab = 'Billing history' | 'Service history' | 'Package history';

const topTabs = ['Appointments', 'Membership', 'Feedback', 'Loyalty'];
const rowsPerPage = 10;
const detailTabs: DetailHistoryTab[] = ['Billing history', 'Service history', 'Package history'];

const initialCustomerRows: CustomerRow[] = [
  { customerId: 'CUS-1408', name: 'Sonal Sharma', gender: 'Female', customerType: 'Premium', services: 'Hair Color', lastVisit: '2026-01-11', stylist: 'Onkar', branch: 'Nandanwan colony' },
  { customerId: 'CUS-1402', name: 'Arjun Kapse', gender: 'Male', customerType: 'Regular', services: 'Hair Cut', lastVisit: '2025-12-26', stylist: 'Ankit', branch: 'Sadar branch' },
  { customerId: 'CUS-1419', name: 'Prerna Desai', gender: 'Female', customerType: 'VIP', services: 'Bridal Package', lastVisit: '2026-01-29', stylist: 'Riya', branch: 'Wardha road' },
  { customerId: 'CUS-1388', name: 'Rohit More', gender: 'Male', customerType: 'Regular', services: 'Beard + Hair', lastVisit: '2025-11-19', stylist: 'Yash', branch: 'Nandanwan colony' },
  { customerId: 'CUS-1421', name: 'Anjali Tiwari', gender: 'Female', customerType: 'Premium', services: 'Skin Care', lastVisit: '2026-02-02', stylist: 'Pooja', branch: 'Sadar branch' },
  { customerId: 'CUS-1396', name: 'Kartik Jain', gender: 'Male', customerType: 'Regular', services: 'Hair Spa', lastVisit: '2025-12-08', stylist: 'Rahul', branch: 'Wardha road' },
  { customerId: 'CUS-1435', name: 'Nidhi Patil', gender: 'Female', customerType: 'VIP', services: 'Luxury Facial', lastVisit: '2026-02-08', stylist: 'Sia', branch: 'Nandanwan colony' },
  { customerId: 'CUS-1379', name: 'Amit Khetan', gender: 'Male', customerType: 'Regular', services: 'Hair Cut', lastVisit: '2025-11-10', stylist: 'Kunal', branch: 'Sadar branch' },
  { customerId: 'CUS-1441', name: 'Komal Gupta', gender: 'Female', customerType: 'Premium', services: 'Hair Treatment', lastVisit: '2026-02-10', stylist: 'Neha', branch: 'Wardha road' },
  { customerId: 'CUS-1367', name: 'Sagar Kulkarni', gender: 'Male', customerType: 'Regular', services: 'Hair Cut', lastVisit: '2025-10-21', stylist: 'Ankit', branch: 'Nandanwan colony' },
  { customerId: 'CUS-1428', name: 'Mrunal Joshi', gender: 'Female', customerType: 'Premium', services: 'Skin Glow', lastVisit: '2026-01-30', stylist: 'Riya', branch: 'Sadar branch' },
  { customerId: 'CUS-1450', name: 'Pallavi Date', gender: 'Female', customerType: 'VIP', services: 'Bridal Package', lastVisit: '2026-02-11', stylist: 'Sia', branch: 'Wardha road' },
];

const emptyCustomerForm: CustomerFormData = {
  mobileNo: '',
  alternateNo: '',
  name: '',
  dob: '',
  email: '',
  anniversary: '',
  gender: '',
  ageGroup: '',
  country: '',
  address: '',
  city: '',
  area: '',
};

const typeStyles = {
  Regular: 'bg-[#EEF0F8] text-[#3E476F]',
  Premium: 'bg-[#E9F0EA] text-[#2F6A3D]',
  VIP: 'bg-[#F6E9EA] text-[#82414A]',
} as const;

const baseProfileHistoryRows: ProfileHistoryRow[] = [
  {
    branch: 'Nandanwan colony, JALNA.',
    invoiceNo: '1234578',
    dateTime: '18-Sep-2024',
    total: '2,000/-',
    discount: '1,400',
    gst: '50',
    finalAmount: '1,450',
    paymentMode: 'UPI',
  },
  {
    branch: 'Nandanwan colony, JALNA.',
    invoiceNo: '1234578',
    dateTime: '18-Sep-2024',
    total: '2,000/-',
    discount: '1,400',
    gst: '50',
    finalAmount: '1,450',
    paymentMode: 'UPI',
  },
  {
    branch: 'Nandanwan colony, JALNA.',
    invoiceNo: '1234578',
    dateTime: '18-Sep-2024',
    total: '2,000/-',
    discount: '1,400',
    gst: '50',
    finalAmount: '1,450',
    paymentMode: 'UPI',
  },
];

const defaultMembershipInfo: MembershipInfo = {
  plan: 'Gold',
  memberId: '123456',
  duration: '30 Days',
  status: 'Inactive',
  expiryDate: '20-July-2025',
  membershipType: 'Individual | Family | Group',
  services: 'Hair Cut | Facial | Spa',
};

const dialogTransition = (props: TransitionProps & { children: React.ReactElement }) => (
  <Grow {...props} timeout={250} />
);

const fieldSx: SxProps<Theme> = {
  '& .MuiInputBase-input::placeholder': {
    color: '#8A92B5',
    opacity: 1,
    fontSize: '0.84rem',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#fbfcff',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  },
  '& .MuiOutlinedInput-root:hover fieldset': {
    borderColor: '#98A2D4',
  },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
    borderColor: '#5C6699',
    borderWidth: '1px',
  },
  '& .MuiInputLabel-root': {
    color: '#5D668F',
    fontWeight: 600,
    fontSize: '0.88rem',
  },
};

function formatDate(rawDate: string): string {
  const date = new Date(rawDate);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
}

const defaultProfileData = (customer: CustomerRow): CustomerProfileMock => ({
  email: `${customer.name.toLowerCase().replace(/\s+/g, '')}08@gmail.com`,
  dob: '18-09-2004',
  age: '21',
  phone: '9823963766',
  altPhone: '7517216777',
  town: `${customer.branch}, Ambad Road, JALNA.`,
  loyaltyProgress: customer.customerType === 'VIP' ? 90 : customer.customerType === 'Premium' ? 80 : 55,
  notes: '',
  membership: defaultMembershipInfo,
  historyByTab: {
    'Billing history': baseProfileHistoryRows,
    'Service history': [
      { ...baseProfileHistoryRows[0], invoiceNo: 'SVC-9101' },
      { ...baseProfileHistoryRows[1], invoiceNo: 'SVC-9102' },
      { ...baseProfileHistoryRows[2], invoiceNo: 'SVC-9103' },
    ],
    'Package history': [
      { ...baseProfileHistoryRows[0], invoiceNo: 'PKG-3101' },
      { ...baseProfileHistoryRows[1], invoiceNo: 'PKG-3102' },
      { ...baseProfileHistoryRows[2], invoiceNo: 'PKG-3103' },
    ],
  },
});

export default function CustomerPage() {
  const [customerRows, setCustomerRows] = useState<CustomerRow[]>(initialCustomerRows);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortableKey>('lastVisit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailHistoryTab>('Billing history');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(emptyCustomerForm);
  const [formError, setFormError] = useState('');

  const sortedRows = useMemo(() => {
    const rows = [...customerRows];
    rows.sort((a, b) => {
      if (sortBy === 'lastVisit') {
        const aValue = new Date(a.lastVisit).getTime();
        const bValue = new Date(b.lastVisit).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aValue = Number(a.customerId.split('-')[1]);
      const bValue = Number(b.customerId.split('-')[1]);
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return rows;
  }, [customerRows, sortBy, sortOrder]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [page, sortedRows]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  const selectedCustomerProfile = useMemo(() => {
    if (!selectedCustomer) {
      return null;
    }
    return defaultProfileData(selectedCustomer);
  }, [selectedCustomer]);

  const activeHistoryRows = useMemo(() => {
    if (!selectedCustomerProfile) {
      return [];
    }
    return selectedCustomerProfile.historyByTab[activeDetailTab] ?? [];
  }, [activeDetailTab, selectedCustomerProfile]);

  const initials = useMemo(() => {
    if (!selectedCustomer) {
      return '';
    }
    return selectedCustomer.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [selectedCustomer]);

  const handleSort = (key: SortableKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(key);
    setSortOrder('desc');
    setPage(1);
  };

  const handleFormChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCustomer = () => {
    const requiredFields: (keyof CustomerFormData)[] = [
      'mobileNo',
      'name',
      'gender',
      'ageGroup',
      'country',
      'city',
      'area',
    ];
    const hasEmptyField = requiredFields.some((field) => String(formData[field]).trim() === '');
    if (hasEmptyField) {
      setFormError('Please fill all required fields before submitting.');
      return;
    }

    const highestExistingId = customerRows.reduce((max, row) => {
      const parsed = Number(row.customerId.split('-')[1]);
      return Number.isNaN(parsed) ? max : Math.max(max, parsed);
    }, 1400);

    const newCustomerId = `CUS-${String(highestExistingId + 1).padStart(4, '0')}`;

    setCustomerRows((prev) => [
      {
        customerId: newCustomerId,
        name: formData.name,
        gender: formData.gender,
        customerType: 'Regular',
        services: 'Hair Cut',
        lastVisit: new Date().toISOString().slice(0, 10),
        stylist: 'Not assigned',
        branch: formData.area || formData.city || 'Nandanwan colony',
      },
      ...prev,
    ]);
    setFormData(emptyCustomerForm);
    setFormError('');
    setIsAddDialogOpen(false);
    setPage(1);
  };

  return (
    <section className="h-full">
      <div className="h-full">
        <div className="mb-3 rounded-2xl border border-[#E1E5F3] bg-white px-3 py-2">
          <nav className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-semibold text-[#55608E]">
            {topTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  index === 0 ? 'bg-[#F1F3FC] text-[#2F3561]' : 'hover:bg-[#F4F6FF] hover:text-[#2F3561]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {selectedCustomer && selectedCustomerProfile ? (
          <div className="rounded-[24px] border border-[#DCE2F0] bg-gradient-to-br from-[#F9FAFF] to-[#F2F5FD] p-3 shadow-[0_16px_30px_rgba(34,44,86,0.08)] md:p-4">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[#E4E8F5] bg-white px-3 py-2 text-[#2F3561] shadow-[0_4px_10px_rgba(32,41,81,0.05)]">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D8DDF0] text-[#2F3561] transition hover:bg-[#F2F2F2]"
              >
                <ArrowLeft size={16} />
              </button>
              <p className="text-sm font-semibold">Customer Profile</p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <article className="rounded-2xl border border-[#E4E8F5] bg-white p-3 text-center shadow-[0_8px_18px_rgba(30,37,76,0.05)] lg:col-span-4">
                <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-[#DDE2EE] text-3xl font-bold text-[#29335D]">
                  {initials}
                </div>
                <p className="text-[1.75rem] font-semibold leading-tight text-[#242C52]">{selectedCustomer.name}</p>
                <p className="text-base text-[#6F758F]">{selectedCustomer.gender}</p>
              </article>

              <article className="rounded-2xl border border-[#E4E8F5] bg-white shadow-[0_8px_18px_rgba(30,37,76,0.05)] lg:col-span-4">
                <h3 className="border-b border-[#E4E8F5] px-3 py-2 text-center text-[1.65rem] font-semibold leading-tight text-[#2A3158]">General Information</h3>
                <div className="text-[0.9rem] text-[#1F1F1F]">
                  <div className="grid grid-cols-[90px_10px_1fr] border-b border-[#ECEFFC] px-3 py-1.5"><p className="font-semibold">E-mail</p><p>:</p><p>{selectedCustomerProfile.email}</p></div>
                  <div className="grid grid-cols-[90px_10px_1fr] border-b border-[#ECEFFC] px-3 py-1.5"><p className="font-semibold">D.O.B.</p><p>:</p><p>{selectedCustomerProfile.dob}</p></div>
                  <div className="grid grid-cols-[90px_10px_1fr] border-b border-[#ECEFFC] px-3 py-1.5"><p className="font-semibold">Age</p><p>:</p><p>{selectedCustomerProfile.age}</p></div>
                  <div className="grid grid-cols-[90px_10px_1fr] border-b border-[#ECEFFC] px-3 py-1.5"><p className="font-semibold">Ph. no.</p><p>:</p><p>{selectedCustomerProfile.phone}</p></div>
                  <div className="grid grid-cols-[90px_10px_1fr] border-b border-[#ECEFFC] px-3 py-1.5"><p className="font-semibold">Alt</p><p>:</p><p>{selectedCustomerProfile.altPhone}</p></div>
                  <div className="grid grid-cols-[90px_10px_1fr] px-3 py-1.5"><p className="font-semibold">Town</p><p>:</p><p>{selectedCustomerProfile.town}</p></div>
                </div>
              </article>

              <div className="flex flex-col gap-3 lg:col-span-4">
                <article className="rounded-2xl border border-[#E4E8F5] bg-white p-3 shadow-[0_8px_18px_rgba(30,37,76,0.05)]">
                  <h3 className="text-center text-[1.65rem] font-semibold leading-tight text-[#2A3158]">Loyalty Point</h3>
                  <div
                    className="mx-auto mt-2 flex h-28 w-28 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#8B8B8B ${selectedCustomerProfile.loyaltyProgress}%, #DDDDDD ${selectedCustomerProfile.loyaltyProgress}% 100%)`,
                    }}
                  >
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white text-2xl font-semibold text-[#2D2D2D]">
                      {selectedCustomerProfile.loyaltyProgress}%
                    </div>
                  </div>
                </article>
                <article className="flex-1 rounded-2xl border border-[#E4E8F5] bg-white p-3 shadow-[0_8px_18px_rgba(30,37,76,0.05)]">
                  <h3 className="text-center text-[1.65rem] font-semibold leading-tight text-[#2A3158]">Notes</h3>
                  <p className="mt-2 rounded-xl border border-dashed border-[#D6DBEE] bg-[#FBFCFF] px-2 py-4 text-center text-sm leading-relaxed text-[#616161]">
                    {selectedCustomerProfile.notes || 'No notes available'}
                  </p>
                </article>
              </div>

              <article className="rounded-2xl border border-[#E4E8F5] bg-white p-2.5 shadow-[0_8px_18px_rgba(30,37,76,0.05)] lg:col-span-9">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#E6EAF7] px-1 pb-1.5">
                  {detailTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveDetailTab(tab)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                        activeDetailTab === tab
                          ? 'bg-[#EAF0FF] text-[#2E3A73]'
                          : 'text-[#666] hover:bg-[#F4F4F4]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 space-y-2">
                  {activeHistoryRows.map((historyRow, index) => (
                    <div key={`${historyRow.invoiceNo}-${index}`} className="overflow-hidden rounded-xl border border-[#E8ECFA] bg-[#FCFDFF]">
                      <div className="grid grid-cols-2 gap-0 border-l-[3px] border-[#1D1D1D] text-[0.82rem] text-[#3A3A3A] md:grid-cols-4 xl:grid-cols-8 xl:divide-x xl:divide-[#E9ECF7]">
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Branch</p><p className="font-medium">{historyRow.branch}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Invoice no.</p><p className="font-medium">{historyRow.invoiceNo}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Date & time</p><p className="font-medium">{historyRow.dateTime}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Total</p><p className="font-medium">{historyRow.total}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Discount</p><p className="font-medium">{historyRow.discount}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">GST</p><p className="font-medium">{historyRow.gst}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Final Amt.</p><p className="font-semibold text-[#2F2F2F]">{historyRow.finalAmount}</p></div>
                        <div className="px-2 py-2"><p className="text-[11px] text-[#8A8A8A]">Payment Mode</p><p className="font-medium">{historyRow.paymentMode}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-[#D5C198] bg-[#F8EBCB] shadow-[0_8px_18px_rgba(125,90,28,0.2)] lg:col-span-3">
                <h3 className="px-3 py-2 text-center text-[1.65rem] font-semibold leading-tight text-[#2D2D2D]">Membership</h3>
                <div className="px-3 pb-3">
                  <div className="overflow-hidden rounded-[24px] bg-gradient-to-b from-[#D8A82E] to-[#B2871D] text-[#2D2D2D]">
                    <div className="flex justify-end px-3 pt-2">
                      <div className="min-w-[140px] rounded-full bg-white px-5 py-1 text-center text-[1.55rem] font-bold tracking-[0.16em] text-[#B48A1E] shadow-[0_2px_8px_rgba(70,54,18,0.2)]">
                        {selectedCustomerProfile.membership.plan.toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-1.5 px-3 py-2.5 text-[0.9rem]">
                      <div className="grid grid-cols-2 gap-2"><p className="font-semibold">Membership ID</p><p>{selectedCustomerProfile.membership.memberId}</p></div>
                      <div className="grid grid-cols-2 gap-2"><p className="font-semibold">Duration</p><p>{selectedCustomerProfile.membership.duration}</p></div>
                      <div className="grid grid-cols-2 gap-2"><p className="font-semibold">Status</p><p>{selectedCustomerProfile.membership.status}</p></div>
                      <div className="grid grid-cols-2 gap-2"><p className="font-semibold">Expiry Date</p><p>{selectedCustomerProfile.membership.expiryDate}</p></div>
                      <div><p className="font-semibold">Membership</p><p>{selectedCustomerProfile.membership.membershipType}</p></div>
                    </div>
                    <div className="border-t border-[#E7C672] px-3 py-2">
                      <p className="text-center font-semibold underline">Services</p>
                      <p className="text-center text-sm">{selectedCustomerProfile.membership.services}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <Users size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Total Customers</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">456</p>
              </article>
              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#6FA978]">
                  <Users size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Visited This Week</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">123</p>
              </article>
              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <Users size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Premium / VIP</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">178</p>
              </article>
              <article className="rounded-2xl border border-[#E5E5F2] bg-white px-4 py-2">
                <div className="flex items-center gap-3 text-[#9E7434]">
                  <Users size={18} />
                  <p className="text-lg font-semibold tracking-tight text-[#2F3561]">Revisit Due</p>
                </div>
                <p className="mt-1 text-center text-3xl font-semibold leading-none tracking-tight text-[#2F3561]">42</p>
              </article>
            </div>

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
                    setFormError('');
                    setIsAddDialogOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#CBCDDF] bg-white px-3 py-1.5 text-sm font-semibold text-[#2F3561] hover:bg-[#F3F3FC]"
                >
                  <CirclePlus size={15} />
                  Add customer
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-[#CBCDDF] bg-white px-3 py-1.5 text-sm font-semibold text-[#2F3561] hover:bg-[#F3F3FC]"
                >
                  <Download size={15} />
                  Export
                </button>
              </div>

              <div className="relative w-full max-w-[300px]">
                <input
                  type="text"
                  placeholder="Phone or Name"
                  className="w-full rounded-xl border border-[#D8DAEC] bg-white py-1.5 pl-4 pr-11 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#C1C5E9]"
                />
                <Search size={18} className="absolute right-3 top-2 text-[#5B648F]" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E0E1F0] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-[#F8F8FD]">
                    <tr className="text-left text-[0.92rem] font-semibold text-[#2F3561]">
                      <th className="px-4 py-2">
                        <TableSortLabel
                          active={sortBy === 'customerId'}
                          direction={sortBy === 'customerId' ? sortOrder : 'desc'}
                          onClick={() => handleSort('customerId')}
                        >
                          Customer ID
                        </TableSortLabel>
                      </th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Gender</th>
                      <th className="px-4 py-2">Customer Type</th>
                      <th className="px-4 py-2">Services</th>
                      <th className="px-4 py-2">
                        <TableSortLabel
                          active={sortBy === 'lastVisit'}
                          direction={sortBy === 'lastVisit' ? sortOrder : 'desc'}
                          onClick={() => handleSort('lastVisit')}
                        >
                          Last Visit
                        </TableSortLabel>
                      </th>
                      <th className="px-4 py-2">Preferred Stylist</th>
                      <th className="px-4 py-2">Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => (
                      <tr key={row.customerId} className="border-t border-[#F0F1F7] text-[0.9rem] text-slate-700">
                        <td className="px-4 py-1.5 font-medium text-[#303864]">{row.customerId}</td>
                        <td className="px-4 py-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(row);
                              setActiveDetailTab('Billing history');
                            }}
                            className="font-medium text-[#303864] underline-offset-2 transition hover:text-[#1F2547] hover:underline"
                          >
                            {row.name}
                          </button>
                        </td>
                        <td className="px-4 py-1.5">{row.gender}</td>
                        <td className="px-4 py-1.5">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${typeStyles[row.customerType]}`}>
                            {row.customerType}
                          </span>
                        </td>
                        <td className="px-4 py-1.5">{row.services}</td>
                        <td className="px-4 py-1.5">{formatDate(row.lastVisit)}</td>
                        <td className="px-4 py-1.5">{row.stylist}</td>
                        <td className="px-4 py-1.5">{row.branch}</td>
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
                    '& .MuiPaginationItem-root': {
                      color: '#3C4474',
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#D9B870 !important',
                      color: '#2F3561',
                      fontWeight: 700,
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        fullWidth={false}
        maxWidth="sm"
        keepMounted
        TransitionComponent={dialogTransition}
        PaperProps={{
          sx: {
            width: '500px',
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: '20px',
            border: '1px solid #E2E6F5',
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(25, 38, 89, 0.28)',
            backgroundImage: 'linear-gradient(180deg, rgba(247,248,255,0.95) 0%, rgba(255,255,255,0.98) 40%)',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(31, 40, 82, 0.26)',
              backdropFilter: 'blur(2px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E6E9F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="m-0 text-[1.35rem] font-bold tracking-tight text-[#2F3561]">Add Customer</p>
            <DialogContentText sx={{ m: 0, mt: 0.5, color: '#70789C', fontSize: '0.82rem' }}>
              Fill in the details below to register a new customer.
            </DialogContentText>
          </div>
          <IconButton size="small" onClick={() => setIsAddDialogOpen(false)} sx={{ border: '1px solid #D6DBEE', borderRadius: '10px' }}>
            <X size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <div className="grid grid-cols-1 gap-3.5 pt-1 md:grid-cols-2">
            <TextField label="Mobile no." value={formData.mobileNo} onChange={(e) => handleFormChange('mobileNo', e.target.value)} placeholder="Enter mobile number" size="small" required sx={fieldSx} />
            <TextField label="Alternate no." value={formData.alternateNo} onChange={(e) => handleFormChange('alternateNo', e.target.value)} placeholder="Enter alternate number" size="small" sx={fieldSx} />
            <TextField label="Name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="Enter your name" size="small" required sx={fieldSx} />
            <TextField label="Date Of Birth" type="date" value={formData.dob} onChange={(e) => handleFormChange('dob', e.target.value)} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} />
            <TextField label="Email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="Enter your email" size="small" sx={fieldSx} />
            <TextField label="Anniversary" type="date" value={formData.anniversary} onChange={(e) => handleFormChange('anniversary', e.target.value)} size="small" InputLabelProps={{ shrink: true }} sx={fieldSx} />
            <div className="grid grid-cols-2 gap-2">
              <TextField select label="Gender" value={formData.gender} onChange={(e) => handleFormChange('gender', e.target.value)} size="small" required sx={fieldSx}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField select label="Age group" value={formData.ageGroup} onChange={(e) => handleFormChange('ageGroup', e.target.value)} size="small" required sx={fieldSx}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="18-25">18-25</MenuItem>
                <MenuItem value="26-35">26-35</MenuItem>
                <MenuItem value="36-45">36-45</MenuItem>
                <MenuItem value="46+">46+</MenuItem>
              </TextField>
            </div>
            <TextField select label="Country" value={formData.country} onChange={(e) => handleFormChange('country', e.target.value)} size="small" required sx={fieldSx}>
              <MenuItem value="">Select country</MenuItem>
              <MenuItem value="India">India</MenuItem>
              <MenuItem value="UAE">UAE</MenuItem>
              <MenuItem value="USA">USA</MenuItem>
            </TextField>
            <TextField label="Address" value={formData.address} onChange={(e) => handleFormChange('address', e.target.value)} placeholder="Enter your address" size="small" sx={fieldSx} />
            <div className="grid grid-cols-2 gap-2">
              <TextField select label="City" value={formData.city} onChange={(e) => handleFormChange('city', e.target.value)} size="small" required sx={fieldSx}>
                <MenuItem value="">Select city</MenuItem>
                <MenuItem value="Jalna">Jalna</MenuItem>
                <MenuItem value="Nagpur">Nagpur</MenuItem>
                <MenuItem value="Pune">Pune</MenuItem>
              </TextField>
              <TextField select label="Area" value={formData.area} onChange={(e) => handleFormChange('area', e.target.value)} size="small" required sx={fieldSx}>
                <MenuItem value="">Select area</MenuItem>
                <MenuItem value="Nandanwan colony">Nandanwan colony</MenuItem>
                <MenuItem value="Sadar branch">Sadar branch</MenuItem>
                <MenuItem value="Wardha road">Wardha road</MenuItem>
              </TextField>
            </div>
          </div>
          {formError ? <p className="mt-3 rounded-lg bg-rose-50 px-2.5 py-2 text-sm text-rose-700">{formError}</p> : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5 }}>
          <Button
            onClick={() => setIsAddDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#CDD3E9',
              color: '#4C557F',
              borderRadius: '10px',
              px: 2.2,
              '&:hover': { borderColor: '#B7BFE0', backgroundColor: '#F6F7FD' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCustomer}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              px: 2.4,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2F3561 0%, #444D87 100%)',
              boxShadow: '0 10px 20px rgba(47,53,97,0.26)',
              '&:hover': {
                background: 'linear-gradient(135deg, #28305B 0%, #3E477F 100%)',
                boxShadow: '0 12px 24px rgba(47,53,97,0.32)',
              },
            }}
          >
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
