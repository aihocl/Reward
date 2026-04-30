export const MODELS = [
  { id: 'OA6', nm: 'Oppo A6', ic: '📱', cl: '#9FA8DA', bg: 'rgba(159,168,218,.1)' },
  { id: 'OA6P', nm: 'Oppo A6 Pro', ic: '📲', cl: '#D4D86E', bg: 'rgba(212,216,110,.1)' },
  { id: 'OA6X', nm: 'Oppo A6x', ic: '📳', cl: '#D28C55', bg: 'rgba(212,140,85,.1)' },
  { id: 'OF31', nm: 'Oppo F31', ic: '🔮', cl: '#6E6A8E', bg: 'rgba(110,106,142,.1)' },
  { id: 'OF33', nm: 'Oppo F33', ic: '💎', cl: '#4ECDC4', bg: 'rgba(78,205,196,.1)' },
  { id: 'OR15', nm: 'Reno 15', ic: '⚡', cl: '#FFD700', bg: 'rgba(255,215,0,.08)' },
  { id: 'OR14', nm: 'Reno 14', ic: '🌟', cl: '#FF6B9D', bg: 'rgba(255,107,157,.1)' },
  { id: 'OR11', nm: 'Reno 11', ic: '✨', cl: '#9B7AFF', bg: 'rgba(155,122,255,.1)' },
];

export const BRANDS = [
  { id: 'B01', nm: 'Amazon', ct: 'E-commerce', pt: 500, sk: 40, ic: '🛒', bg: 'linear-gradient(135deg,#232f3e,#131921)', ds: 'Amazon.in Gift Card', dm: [250, 500, 1000, 2000], tg: 'best' },
  { id: 'B02', nm: 'Flipkart', ct: 'E-commerce', pt: 500, sk: 35, ic: '🛍️', bg: 'linear-gradient(135deg,#2874f0,#1a5dc7)', ds: 'Flipkart Gift', dm: [250, 500, 1000], tg: 'best' },
  { id: 'B03', nm: 'Swiggy', ct: 'Food', pt: 300, sk: 60, ic: '🍽️', bg: 'linear-gradient(135deg,#fc8019,#e06c00)', ds: 'Food voucher', dm: [200, 500] },
  { id: 'B04', nm: 'PVR INOX', ct: 'Entertainment', pt: 350, sk: 50, ic: '🎬', bg: 'linear-gradient(135deg,#1a1a2e,#2d1f3d)', ds: 'Movie voucher', dm: [250, 500], tg: 'hot' },
  { id: 'B05', nm: 'Myntra', ct: 'Fashion', pt: 400, sk: 25, ic: '👗', bg: 'linear-gradient(135deg,#ff3f6c,#e8356a)', ds: 'Fashion card', dm: [500, 1000], tg: 'hot' },
  { id: 'B06', nm: 'Nykaa', ct: 'Beauty', pt: 400, sk: 30, ic: '💄', bg: 'linear-gradient(135deg,#fc2779,#d91f65)', ds: 'Beauty card', dm: [500, 1000] },
  { id: 'B07', nm: 'MakeMyTrip', ct: 'Travel', pt: 800, sk: 15, ic: '✈️', bg: 'linear-gradient(135deg,#ef4123,#0770E3)', ds: 'Travel card', dm: [1000, 2000], tg: 'new' },
  { id: 'B08', nm: 'Starbucks', ct: 'Food', pt: 350, sk: 30, ic: '☕', bg: 'linear-gradient(135deg,#006241,#00432d)', ds: 'Coffee card', dm: [250, 500], tg: 'hot' },
];

export const CTS = ['All', 'E-commerce', 'Fashion', 'Food', 'Travel', 'Entertainment', 'Beauty'];
export const AREAS = ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Bhavnagar'];
export const TIERS = [
  { nm: 'Bronze', min: 0, cl: '#CD7F32', ic: '🥉' },
  { nm: 'Silver', min: 2000, cl: '#C0C0C0', ic: '🥈' },
  { nm: 'Gold', min: 5000, cl: '#FFD700', ic: '🥇' },
  { nm: 'Platinum', min: 10000, cl: '#E5E4E2', ic: '💎' }
];

export const BADGES = [
  { id: 'b1', nm: 'Top Performer', ic: '🏆', ds: 'Rank #1', er: true },
  { id: 'b2', nm: 'Target Achiever', ic: '🎯', ds: 'Hit 80%+ target', er: true },
  { id: 'b3', nm: 'Streak Master', ic: '🔥', ds: '15-day streak', er: true },
  { id: 'b4', nm: 'Sales Champion', ic: '💎', ds: '₹10L+ sales', er: false },
  { id: 'b5', nm: 'Rising Star', ic: '⭐', ds: 'Fastest earner', er: false },
  { id: 'b6', nm: 'IMEI King', ic: '👑', ds: '50+ approved', er: false },
];

export const FAQ = [
  { q: 'How does IMEI approval work?', a: 'Submit IMEI → Admin reviews → Approved IMEI counts toward target achievement and awards points.' },
  { q: 'What is the duplicate IMEI policy?', a: 'Each IMEI can only be registered once across all stores. Duplicates are automatically blocked.' },
  { q: 'How are tiers calculated?', a: 'Tiers are based on total approved points: Bronze (0+), Silver (2000+), Gold (5000+), Platinum (10000+).' },
  { q: 'When do I get points?', a: 'Points are credited when admin approves your IMEI submission. Base points are added per approved IMEI, plus model bonuses.' },
  { q: 'What rewards can I redeem?', a: 'Gift cards from Amazon, Flipkart, Myntra, and more. New rewards are added regularly by admin.' },
  { q: 'What happens if IMEI is rejected?', a: 'Rejected IMEIs don\'t count. You\'ll be notified with the reason.' },
];

export const TERMS = [
  'All IMEI must be genuine from actual sales.',
  'Duplicate IMEI across stores = auto-reject.',
  'Admin approval mandatory for achievement count.',
  'Fraud = point deduction + possible suspension.',
  'Points expire after 12 months.',
  'Admin can modify targets/rewards anytime.',
  'Model assignments managed by admin.',
  'Rewards subject to stock availability.'
];

const AVS = ['#ff6b9d', '#9b7aff', '#2ee89d', '#ffb347', '#4ecdc4', '#e74c3c', '#3498db', '#f39c12'];

function initTgts() {
  const t: any = {};
  MODELS.forEach((m) => {
    const tg = Math.floor(Math.random() * 40) + 20;
    t[m.id] = { tgt: tg, ach: Math.floor(Math.random() * tg * 0.8) };
  });
  return t;
}

export const DF = {
  models: JSON.parse(JSON.stringify(MODELS)),
  mgrs: [
    { id: 'M01', nm: 'Jordyn Kenter', ph: '+91 98765 43210', store: 'Navrangpura', pts: 96239, st: 'active', av: 'JK', area: 'Ahmedabad', targets: null, imeis: [], totalImei: 62, pendingImei: 3, approvedImei: 59, streak: 22, avClr: AVS[0] },
    { id: 'M02', nm: 'Alena Bator', ph: '+91 87654 32109', store: 'SG Highway', pts: 84787, st: 'active', av: 'AB', area: 'Ahmedabad', targets: null, imeis: [], totalImei: 54, pendingImei: 2, approvedImei: 52, streak: 18, avClr: AVS[1] },
    { id: 'M03', nm: 'Carl Oliver', ph: '+91 76543 21098', store: 'Satellite', pts: 82139, st: 'active', av: 'CO', area: 'Surat', targets: null, imeis: [], totalImei: 48, pendingImei: 1, approvedImei: 47, streak: 15, avClr: AVS[2] },
    { id: 'M04', nm: 'Davis Curtis', ph: '+91 65432 10987', store: 'Maninagar', pts: 80857, st: 'active', av: 'DC', area: 'Rajkot', targets: null, imeis: [], totalImei: 45, pendingImei: 4, approvedImei: 41, streak: 12, avClr: AVS[3] },
    { id: 'M05', nm: 'Isona Dthid', ph: '+91 54321 09876', store: 'Vastrapur', pts: 76128, st: 'active', av: 'ID', area: 'Ahmedabad', targets: null, imeis: [], totalImei: 42, pendingImei: 2, approvedImei: 40, streak: 10, avClr: AVS[4] },
    { id: 'M06', nm: 'Makenna George', ph: '+91 43210 98765', store: 'CG Road', pts: 71667, st: 'active', av: 'MG', area: 'Vadodara', targets: null, imeis: [], totalImei: 38, pendingImei: 3, approvedImei: 35, streak: 8, avClr: AVS[5] },
    { id: 'M07', nm: 'Kianna Batista', ph: '+91 32109 87654', store: 'CP Delhi', pts: 68439, st: 'active', av: 'KB', area: 'Gandhinagar', targets: null, imeis: [], totalImei: 35, pendingImei: 1, approvedImei: 34, streak: 14, avClr: AVS[6] },
    { id: 'M08', nm: 'Maxith Cullep', ph: '+91 21098 76543', store: 'MG Road', pts: 66981, st: 'active', av: 'MC', area: 'Bhavnagar', targets: null, imeis: [], totalImei: 32, pendingImei: 2, approvedImei: 30, streak: 6, avClr: AVS[7] },
    { id: 'M09', nm: 'Zain Dias', ph: '+91 10987 65432', store: 'Ring Road', pts: 50546, st: 'active', av: 'ZD', area: 'Surat', targets: null, imeis: [], totalImei: 28, pendingImei: 3, approvedImei: 25, streak: 4, avClr: '#1abc9c' },
  ],
  rw: BRANDS,
  tx: [
    { id: 'T01', mid: 'M01', tp: 'credit', pt: 5000, rs: 'Monthly target champion', dt: '29-04-2026', by: 'System' },
    { id: 'T02', mid: 'M01', tp: 'credit', pt: 450, rs: '3x Reno 15 IMEI approved', dt: '27-04-2026', by: 'Admin' },
    { id: 'T03', mid: 'M01', tp: 'debit', pt: 500, rs: 'Redeemed: Amazon ₹500', dt: '25-04-2026', by: 'System' },
    { id: 'T04', mid: 'M02', tp: 'credit', pt: 1500, rs: 'Weekly target bonus', dt: '25-04-2026', by: 'System' },
    { id: 'T05', mid: 'M03', tp: 'debit', pt: 350, rs: 'Redeemed: PVR INOX', dt: '24-04-2026', by: 'System' },
    { id: 'T06', mid: 'M04', tp: 'credit', pt: 1200, rs: 'Festival bonus', dt: '22-04-2026', by: 'System' },
    { id: 'T07', mid: 'M02', tp: 'debit', pt: 800, rs: 'Redeemed: MakeMyTrip', dt: '20-04-2026', by: 'System' }
  ],
  nf: [
    { id: 'N01', mid: 'M01', mg: '🎉 5,000 pts! Monthly champion!', dt: '29-04-2026', rd: false },
    { id: 'N02', mid: 'M01', mg: '✅ 3 Reno 15 IMEI approved', dt: '27-04-2026', rd: false },
    { id: 'N03', mid: 'M01', mg: '🏆 You\'re now #1 on leaderboard!', dt: '26-04-2026', rd: true }
  ],
  rd: [
    { id: 'R01', mid: 'M01', rid: 'B01', rnm: 'Amazon ₹500', pt: 500, sts: 'approved', dt: '25-04-2026', dn: 500 },
    { id: 'R02', mid: 'M03', rid: 'B04', rnm: 'PVR INOX ₹350', pt: 350, sts: 'approved', dt: '24-04-2026', dn: 350 },
    { id: 'R03', mid: 'M02', rid: 'B07', rnm: 'MakeMyTrip ₹1000', pt: 800, sts: 'approved', dt: '20-04-2026', dn: 1000 },
    { id: 'R04', mid: 'M04', rid: 'B03', rnm: 'Swiggy ₹500', pt: 300, sts: 'approved', dt: '18-04-2026', dn: 500 },
    { id: 'R05', mid: 'M05', rid: 'B01', rnm: 'Amazon ₹1000', pt: 500, sts: 'approved', dt: '15-04-2026', dn: 1000 }
  ],
  imeiLog: [] as string[],
  pendingImeis: [
    { id: 'IM01', mid: 'M01', imei: '352093087463821', model: 'OR15', dt: '29-04-2026', sts: 'pending' },
    { id: 'IM02', mid: 'M01', imei: '352093087463822', model: 'OA6P', dt: '28-04-2026', sts: 'approved' },
    { id: 'IM03', mid: 'M02', imei: '352093087463830', model: 'OF31', dt: '28-04-2026', sts: 'pending' },
    { id: 'IM04', mid: 'M04', imei: '352093087463835', model: 'OA6X', dt: '27-04-2026', sts: 'pending' },
  ],
  policy: {
    basePtsPerImei: 150,
    tgtBonusPts: 1000,
    modelPts: {} as Record<string, number>
  }
};

DF.mgrs.forEach((m: any) => { m.targets = initTgts(); });
