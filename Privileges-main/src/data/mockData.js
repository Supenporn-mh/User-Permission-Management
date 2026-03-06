// Enterprise-grade Mock Data for Privilege Management System

export const INITIAL_PERMISSIONS = [
    {
        id: 'P001',
        name: 'อาหารกลางวัน',
        type: 'auto_reset',
        icon: 'Coffee',
        fundTypes: ['มาตรฐาน'],
        value: 50,
        frequency: 'Daily',
        frequencySub: null,
        timesPerCycle: 1,
        timesPerDay: 1,
        amountPerTime: 50,
        status: 'Active'
    },
    {
        id: 'P002',
        name: 'กระเป๋าเงินสวัสดิการ',
        type: 'top_up',
        icon: 'Wallet',
        fundTypes: ['มาตรฐาน'],
        value: 1000,
        frequency: 'Daily',
        frequencySub: null,
        timesPerCycle: null,
        timesPerDay: null,
        amountPerTime: null,
        status: 'Active'
    },
    {
        id: 'P003',
        name: 'เบี้ยเลี้ยงเดินทาง',
        type: 'auto_reset',
        icon: 'Car',
        fundTypes: ['มาตรฐาน'],
        value: 500,
        frequency: 'Monthly',
        frequencySub: '1',
        timesPerCycle: 4,
        timesPerDay: null,
        amountPerTime: 500,
        status: 'Active'
    }
];

export const INITIAL_BRANCHES = [
    { id: 'B001', name: '[BIH] โรงพยาบาลบำรุงราษฎร์', type: 'โรงพยาบาล', status: 'Active', permissions: ['P001', 'P002', 'P003'], pendingSync: false },
    { id: 'B002', name: 'โรงงานระยอง', type: 'โรงงาน', status: 'Active', permissions: ['P001', 'P003'], pendingSync: false },
    { id: 'B003', name: 'คลังสินค้า เชียงใหม่', type: 'คลังสินค้า', status: 'Active', permissions: ['P001'], pendingSync: false }
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_LOGS = [
    { id: 1, admin: 'ผู้ดูแลระบบ', action: 'ระบบ', details: 'เริ่มต้นระบบสวัสดิการพนักงาน', timestamp: `${today} 09:00:00` },
    { id: 2, admin: 'ผู้ดูแลระบบ', action: 'สาขา', details: 'สร้างสาขาใหม่: สำนักงานใหญ่', timestamp: `${today} 09:05:00` }
];

export const INITIAL_BRANCH_CONFIG = {
    'P001': { enabled: true, validFrom: '2024-01-01', validTo: '' }
};

export const INITIAL_BRANCH_GROUPS = [
    { id: 'G_CONTROLLER', name: 'Controller', rules: [{ permId: 'P001', validFrom: '', validTo: '' }] },
    { id: 'G_EXEC', name: 'ผู้บริหาร', rules: [{ permId: 'P001', validFrom: '', validTo: '' }] },
    { id: 'G_STAFF', name: 'พนักงานทั่วไป', rules: [{ permId: 'P001', validFrom: '', validTo: '' }] }
];

export const INITIAL_BRANCH_EMPLOYEES = [
    { id: 'E1', externalId: 'S0127', name: 'ธนน โอกาศพัฒน์', name_en: 'Tamon O.', email: 'tamon.o@email.com', card_sn: '1029384756', status: 'Active', groups: ['G1'] },
    { id: 'E2', externalId: 'S0128', name: 'ธนา วงศ์วรสาธร', name_en: 'Thana W.', email: 'thana.w@email.com', card_sn: '5647382910', status: 'Active', groups: ['G1'] },
    { id: 'E3', externalId: 'S0129', name: 'นนท์ สว่างวิทยา', name_en: 'Non S.', email: 'non.s@email.com', card_sn: '8837465012', status: 'Active', groups: ['G1'] },
    { id: 'E4', externalId: 'S0130', name: 'กฤนธ กระจ่างวงศ์', name_en: 'Grison K.', email: 'grison.k@email.com', card_sn: '4455667788', status: 'Active', groups: ['G1'] },
    { id: 'E5', externalId: 'S0131', name: 'บดินทร์ ไชยสงคราม', name_en: 'Bodin C.', email: 'bodin.c@email.com', card_sn: '2233445566', status: 'Active', groups: ['G1'] },
    { id: 'E6', externalId: 'S0132', name: 'รวินทร์ อาทิตย์ดารงค์ชัย สุวรรณเวชราชา ประดิษฐ์วงศาวรรต', name_en: 'Tanin A.', email: 'tanin.atthiapornchai@email.com', card_sn: '9900112233', status: 'Active', groups: ['G1'] },
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

export const BRANCH_TYPES = ['โรงเรียน', 'โรงงาน', 'โรงพยาบาล'];
