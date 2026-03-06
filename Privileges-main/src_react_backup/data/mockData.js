// Mock Data for Enterprise Management System

export const INITIAL_PERMISSIONS = [
    {
        id: 'P001',
        name: 'อาหารกลางวัน (Lunch)',
        type: 'auto_reset',
        icon: 'Coffee',
        fundTypes: ['Auto Reset'],
        value: 50,
        frequency: 'Daily',
        usageLimit: 1
    },
    {
        id: 'P002',
        name: 'กระเป๋าเงินสวัสดิการ (E-Wallet)',
        type: 'top_up',
        icon: 'DollarSign',
        fundTypes: ['Employee Fill', 'Admin Fill'],
        value: 0,
        frequency: 'No Reset',
        usageLimit: null
    },
    {
        id: 'P003',
        name: 'โบนัสวันเกิด (Birthday)',
        type: 'auto_reset',
        icon: 'Gift',
        fundTypes: ['Admin Fill'],
        value: 500,
        frequency: 'Monthly',
        usageLimit: 1
    }
];

export const INITIAL_BRANCHES = [
    { id: 'B001', name: 'โรงพยาบาลกรุงเทพ (HQ)', type: 'Hospital', status: 'Active', permissions: ['P001', 'P002', 'P003'] },
    { id: 'B002', name: 'โรงงานระยอง 1', type: 'Factory', status: 'Active', permissions: ['P001'] },
    { id: 'B003', name: 'โรงเรียนนานาชาติเชียงใหม่', type: 'School', status: 'Inactive', permissions: ['P001'] },
    { id: 'B004', name: 'โรงอาหารกลางบางนา', type: 'Canteen', status: 'Active', permissions: [] },
];

export const INITIAL_LOGS = [
    { id: 1, admin: 'System Admin', action: 'Update Status', details: 'Changed B003 to Inactive', timestamp: '2023-10-25 10:30:00' },
    { id: 2, admin: 'Branch Admin', action: 'Edit Permission', details: 'Added Wallet to B001', timestamp: '2023-10-25 11:15:00' },
];

export const INITIAL_BRANCH_CONFIG = {
    'P001': { enabled: true, validFrom: '2023-01-01', validTo: '2023-12-31' },
    'P002': { enabled: true, validFrom: '', validTo: '' }
};

export const INITIAL_BRANCH_GROUPS = [
    { id: 'G01', name: 'พนักงานประจำ', rules: [{ permId: 'P001', validFrom: '', validTo: '' }] }
];

export const INITIAL_BRANCH_EMPLOYEES = [
    { id: 'E001', name: 'นายใจดี รักสงบ', position: 'พนักงานต้อนรับ', groups: ['G01'] },
    { id: 'E002', name: 'นส.ขยัน ทำงาน', position: 'บัญชี', groups: [] }
];

export const WEEK_DAYS = [
    { id: 'Mon', label: 'จ' },
    { id: 'Tue', label: 'อ' },
    { id: 'Wed', label: 'พ' },
    { id: 'Thu', label: 'พฤ' },
    { id: 'Fri', label: 'ศ' },
    { id: 'Sat', label: 'ส' },
    { id: 'Sun', label: 'อา' },
];

export const BRANCH_TYPES = ['Hospital', 'Factory', 'School', 'Canteen'];
