// offlineStorage.js - Robust IndexedDB & localStorage persistence layer for MineSight Offline-First Architecture

const DB_NAME = "minesight_offline_db";
const DB_VERSION = 1;
const STORES = [
  "mines",
  "inspections",
  "compliances",
  "contractors",
  "alerts",
  "workers",
  "attendance",
  "supportTickets",
  "supportDirectory",
  "appState",
  "syncQueue",
  "media",
];

// Open / initialize IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return resolve(null); // Fallback to localStorage
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "_id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn("IndexedDB open error, falling back to localStorage:", request.error);
      resolve(null);
    };
  });
}

// Fallback localStorage helpers
const lsPrefix = "minesight_offline_";

function getLs(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${lsPrefix}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLs(key, val) {
  try {
    localStorage.setItem(`${lsPrefix}${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// Low-level IndexedDB transaction helpers
async function dbGetAll(storeName) {
  const db = await openDatabase();
  if (!db) return getLs(storeName, []);

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve(getLs(storeName, []));
    } catch {
      resolve(getLs(storeName, []));
    }
  });
}

async function dbGet(storeName, key) {
  const db = await openDatabase();
  if (!db) {
    const list = getLs(storeName, []);
    return list.find((item) => item._id === key) || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function dbPut(storeName, item) {
  if (!item._id) item._id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const db = await openDatabase();

  // Also update localStorage mirror for instant reliability
  const currentLs = getLs(storeName, []);
  const existingIdx = currentLs.findIndex((i) => i._id === item._id);
  if (existingIdx >= 0) {
    currentLs[existingIdx] = { ...currentLs[existingIdx], ...item };
  } else {
    currentLs.unshift(item);
  }
  setLs(storeName, currentLs);

  if (!db) return item;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => resolve(item);
    } catch {
      resolve(item);
    }
  });
}

async function dbPutBatch(storeName, items) {
  if (!Array.isArray(items)) return;
  const db = await openDatabase();
  setLs(storeName, items);

  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      items.forEach((item) => {
        if (!item._id) item._id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        store.put(item);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function dbDelete(storeName, key) {
  const db = await openDatabase();
  const currentLs = getLs(storeName, []);
  setLs(storeName, currentLs.filter((i) => i._id !== key));

  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// Media storage helper (blobs, images, voice recordings)
export async function saveOfflineMedia(key, blobOrDataUrl) {
  return dbPut("media", { _id: key, data: blobOrDataUrl, timestamp: Date.now() });
}

export async function getOfflineMedia(key) {
  const item = await dbGet("media", key);
  return item ? item.data : null;
}

// Key-Value App State helper (e.g. summaries, analytics snapshots)
export async function getAppState(key, fallback = null) {
  const item = await dbGet("appState", key);
  if (item && item.value !== undefined) return item.value;
  return getLs(`state_${key}`, fallback);
}

export async function setAppState(key, value) {
  setLs(`state_${key}`, value);
  return dbPut("appState", { _id: key, value, updatedAt: Date.now() });
}

// Initial Rich Seed Data (matches backend/seed.js so offline features work on fresh load)
export const initialMines = [
  {
    _id: "mine_001",
    name: "Jayant Open Cast Mine",
    code: "NCL-JYT-01",
    subsidiary: "Northern Coalfields Limited",
    location: { type: "Point", coordinates: [82.45, 24.12] },
    address: "Jayant, Singrauli, Madhya Pradesh",
    status: "active",
    complianceScore: 78,
    riskLevel: "medium",
    disasterProne: true,
    disasterSeason: "Jun-Sep (monsoon)",
    visibility: "public",
  },
  {
    _id: "mine_002",
    name: "Amlohri Project",
    code: "NCL-AML-02",
    subsidiary: "Northern Coalfields Limited",
    location: { type: "Point", coordinates: [82.52, 24.08] },
    address: "Amlohri, Singrauli, Madhya Pradesh",
    status: "active",
    complianceScore: 92,
    riskLevel: "low",
    disasterProne: false,
    disasterSeason: "Not specified",
    visibility: "public",
  },
  {
    _id: "mine_003",
    name: "Kusmunda Open Cast",
    code: "SECL-KUS-01",
    subsidiary: "South Eastern Coalfields Limited",
    location: { type: "Point", coordinates: [82.68, 22.35] },
    address: "Kusmunda, Korba, Chhattisgarh",
    status: "active",
    complianceScore: 65,
    riskLevel: "high",
    disasterProne: true,
    disasterSeason: "Apr-Jun (heat and fire)",
    visibility: "public",
  },
  {
    _id: "mine_004",
    name: "Nigahi Open Cast Mine",
    code: "NCL-NIG-03",
    subsidiary: "Northern Coalfields Limited",
    location: { type: "Point", coordinates: [82.59, 24.02] },
    address: "Nigahi, Singrauli, Madhya Pradesh",
    status: "active",
    complianceScore: 86,
    riskLevel: "low",
    disasterProne: false,
    disasterSeason: "Not specified",
    visibility: "public",
  },
  {
    _id: "mine_005",
    name: "Dudhichua Open Cast Mine",
    code: "NCL-DDC-04",
    subsidiary: "Northern Coalfields Limited",
    location: { type: "Point", coordinates: [82.66, 24.14] },
    address: "Dudhichua, Singrauli, Madhya Pradesh",
    status: "active",
    complianceScore: 74,
    riskLevel: "medium",
    disasterProne: true,
    disasterSeason: "Jun-Sep (monsoon)",
    visibility: "public",
  },
  {
    _id: "mine_006",
    name: "Gevra Open Cast Mine",
    code: "SECL-GEV-02",
    subsidiary: "South Eastern Coalfields Limited",
    location: { type: "Point", coordinates: [82.56, 22.35] },
    address: "Gevra, Korba, Chhattisgarh",
    status: "active",
    complianceScore: 69,
    riskLevel: "high",
    disasterProne: true,
    disasterSeason: "Apr-Jun (heat and fire)",
    visibility: "public",
  },
  {
    _id: "mine_007",
    name: "Dipka Open Cast Mine",
    code: "SECL-DPK-03",
    subsidiary: "South Eastern Coalfields Limited",
    location: { type: "Point", coordinates: [82.52, 22.3] },
    address: "Dipka, Korba, Chhattisgarh",
    status: "active",
    complianceScore: 81,
    riskLevel: "medium",
    disasterProne: true,
    disasterSeason: "Jun-Sep (monsoon)",
    visibility: "public",
  },
];

export const initialInspections = [
  {
    _id: "insp_001",
    mineId: initialMines[0],
    inspectorId: { _id: "usr_001", name: "Rajesh Kumar", email: "rajesh@ncl.gov.in" },
    type: "safety",
    title: "Haul Road Safety Inspection",
    description: "Routine inspection of main haul road safety berms and grade slope.",
    location: { type: "Point", coordinates: [82.451, 24.121] },
    observations: "Some berms are damaged on the eastern boundary and dust suppression nozzles are misaligned.",
    status: "open",
    severity: "high",
    riskScore: 72,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    violations: [
      {
        _id: "viol_001",
        description: "Damaged safety berms on haul road Section C",
        category: "safety",
        severity: "high",
        correctiveAction: "Rebuild berms to 2m height within 7 days",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "open",
      },
    ],
    photos: [],
  },
  {
    _id: "insp_002",
    mineId: initialMines[2],
    inspectorId: { _id: "usr_001", name: "Rajesh Kumar", email: "rajesh@ncl.gov.in" },
    type: "environment",
    title: "Dust Suppression & Air Quality Check",
    description: "Quarterly environmental dust suppression verification in pit.",
    location: { type: "Point", coordinates: [82.682, 22.352] },
    observations: "Sprinklers not working in sector B, excessive particulate matter measured.",
    status: "in_progress",
    severity: "critical",
    riskScore: 88,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    violations: [
      {
        _id: "viol_002",
        description: "Non-functional dust suppression system",
        category: "environment",
        severity: "critical",
        correctiveAction: "Repair high-pressure pump immediately and deploy water tanker",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        status: "open",
      },
    ],
    photos: [],
  },
  {
    _id: "insp_003",
    mineId: initialMines[1],
    inspectorId: { _id: "usr_002", name: "Priya Sharma", email: "priya@ncl.gov.in" },
    type: "scheduled",
    title: "PPE Compliance & Equipment Verification",
    description: "Shift workers safety gear, helmets, gas monitors and footwear check.",
    location: { type: "Point", coordinates: [82.521, 24.081] },
    observations: "All 42 active shift miners equipped with verified safety gear.",
    status: "closed",
    severity: "low",
    riskScore: 18,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    closedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    violations: [],
    photos: [],
  },
];

export const initialCompliances = [
  {
    _id: "comp_001",
    mineId: initialMines[0],
    category: "safety",
    title: "DGMS Safety Audit - Q3",
    description: "Quarterly statutory safety audit as per DGMS guidelines",
    statutoryReference: "DGMS Circular 02/2023",
    frequency: "quarterly",
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    status: "pending",
  },
  {
    _id: "comp_002",
    mineId: initialMines[0],
    category: "environment",
    title: "Air Quality Monitoring Report",
    description: "Monthly ambient air quality monitoring and dust analysis submission",
    statutoryReference: "MoEFCC Notification 2022",
    frequency: "monthly",
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: "overdue",
  },
  {
    _id: "comp_003",
    mineId: initialMines[1],
    category: "labour",
    title: "Contract Labour Safety Compliance",
    description: "CLRA Act safety gear issuance and wage register compliance check",
    statutoryReference: "CLRA Act 1970",
    frequency: "monthly",
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    status: "compliant",
  },
  {
    _id: "comp_004",
    mineId: initialMines[2],
    category: "production",
    title: "Monthly Coal Production & Overburden Report",
    description: "Submit certified volumetric overburden and coal dispatch figures to CIL HQ",
    frequency: "monthly",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: "pending",
  },
];

export const initialContractors = [
  {
    _id: "cont_001",
    name: "Bharat Earth Movers Ltd",
    registrationNo: "BEML-2022-045",
    contactPerson: "Suresh Patel",
    phone: "9123456780",
    email: "suresh@beml.in",
    mineIds: [initialMines[0]._id, initialMines[1]._id],
    contractStart: "2023-01-01",
    contractEnd: "2026-12-31",
    status: "active",
    complianceScore: 88,
  },
  {
    _id: "cont_002",
    name: "Singrauli Transport Co.",
    registrationNo: "STC-2021-112",
    contactPerson: "Amit Verma",
    phone: "9123456781",
    email: "amit@stc.in",
    mineIds: [initialMines[0]._id],
    contractStart: "2022-06-01",
    contractEnd: "2025-05-31",
    status: "active",
    complianceScore: 72,
  },
  {
    _id: "cont_003",
    name: "Shakti Infra & Mining Contractors Pvt. Ltd.",
    registrationNo: "MP-SGR-2024-1187",
    contactPerson: "Ananya Singh",
    phone: "9876543212",
    email: "ananya@shakticontractors.in",
    mineIds: [initialMines[0]._id, initialMines[3]._id],
    contractStart: "2024-04-01",
    contractEnd: "2027-03-31",
    status: "active",
    complianceScore: 94,
  },
];

export const initialAlerts = [
  {
    _id: "alert_001",
    mineId: initialMines[0],
    type: "high_risk",
    title: "High Risk Inspection Detected",
    message: "Haul Road Safety Inspection has risk score 72. Immediate action required.",
    severity: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: "alert_002",
    mineId: initialMines[2],
    type: "violation",
    title: "Critical Environment Violation",
    message: "Dust suppression system non-functional in Kusmunda mine.",
    severity: "critical",
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    _id: "alert_003",
    mineId: initialMines[0],
    type: "compliance_due",
    title: "Overdue: Air Quality Report",
    message: "Air Quality Monitoring Report is overdue by 5 days.",
    severity: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export const initialAttendance = [
  {
    _id: "att_001",
    workerName: "Amit Yadav",
    workerId: "EMP-001",
    mineId: initialMines[0],
    role: "Mining Operations Foreman",
    shift: "Shift A (Morning)",
    zone: "Pit-1 Underground Face",
    liveStatus: "inside_mine",
    safetyGearVerified: true,
    bodyTemp: "36.6",
    checkIn: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "present",
  },
  {
    _id: "att_002",
    workerName: "Sunita Devi",
    workerId: "EMP-002",
    mineId: initialMines[1],
    role: "Safety Inspector",
    shift: "Shift A (Morning)",
    zone: "Surface Processing Bay",
    liveStatus: "surface_area",
    safetyGearVerified: true,
    bodyTemp: "36.5",
    checkIn: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    status: "present",
  },
  {
    _id: "att_003",
    workerName: "Rameshwar Prasad",
    workerId: "EMP-003",
    mineId: initialMines[0],
    role: "Heavy Equipment Operator",
    shift: "Shift A (Morning)",
    zone: "Haulage Seam 4",
    liveStatus: "inside_mine",
    safetyGearVerified: true,
    bodyTemp: "36.7",
    checkIn: new Date(Date.now() - 2.8 * 3600000).toISOString(),
    status: "present",
  },
];

export const initialSupportDirectory = [
  {
    _id: "dir_001",
    name: "Central Mine Emergency Control Room (DGMS)",
    role: "National Rescue & Emergency Dispatch",
    phone: "1800-345-3467",
    email: "emergency@dgms.gov.in",
    location: "Dhanbad HQ, Jharkhand (24/7 National)",
    category: "emergency",
  },
  {
    _id: "dir_002",
    name: "Central Coalfields Rescue Station (Singrauli)",
    role: "Underground Mines Rescue Base",
    phone: "07805-266120",
    email: "rescue.singrauli@cil.gov.in",
    location: "Singrauli Coalfield, MP (24/7 Base)",
    category: "rescue",
  },
  {
    _id: "dir_003",
    name: "MineSight Field Tech Support",
    role: "Technical System & Mobile Offline Support",
    phone: "+91 800-419-7890",
    email: "support@minesight.cil.gov.in",
    location: "New Delhi / Remote Field Ops",
    category: "technical",
  },
  {
    _id: "dir_004",
    name: "Korba Coalfield Hospital & Trauma Centre",
    role: "Medical Emergency & Occupational Health",
    phone: "07759-224500",
    email: "hospital.korba@secl.gov.in",
    location: "SECL Hospital, Korba, CG",
    category: "medical",
  },
];

export const initialSupportTickets = [
  {
    _id: "ticket_001",
    subject: "Gas Sensor Drift in Pit-2",
    category: "safety",
    priority: "high",
    mineId: initialMines[0]._id,
    description: "Methane telemetry sensor MTH-04 reading fluctuating values near loading section.",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    responses: [
      {
        sender: "Safety Officer",
        message: "Technician dispatched to calibrate detector with standard test gas.",
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ],
  },
  {
    _id: "ticket_002",
    subject: "[DISASTER] Monsoon Water Ingress Risk - Eastern Slope",
    category: "emergency",
    priority: "critical",
    mineId: initialMines[0]._id,
    description: "Pre-monsoon drainage ditch overflow risk observed near haul ramp.",
    status: "open",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    responses: [],
  },
];

// Seed storage if empty
export async function seedStorageIfEmpty() {
  const existingMines = await dbGetAll("mines");
  if (!existingMines || existingMines.length === 0) {
    await dbPutBatch("mines", initialMines);
  }

  const existingInspections = await dbGetAll("inspections");
  if (!existingInspections || existingInspections.length === 0) {
    await dbPutBatch("inspections", initialInspections);
  }

  const existingCompliances = await dbGetAll("compliances");
  if (!existingCompliances || existingCompliances.length === 0) {
    await dbPutBatch("compliances", initialCompliances);
  }

  const existingContractors = await dbGetAll("contractors");
  if (!existingContractors || existingContractors.length === 0) {
    await dbPutBatch("contractors", initialContractors);
  }

  const existingAlerts = await dbGetAll("alerts");
  if (!existingAlerts || existingAlerts.length === 0) {
    await dbPutBatch("alerts", initialAlerts);
  }

  const existingAttendance = await dbGetAll("attendance");
  if (!existingAttendance || existingAttendance.length === 0) {
    await dbPutBatch("attendance", initialAttendance);
  }

  const existingDirectory = await dbGetAll("supportDirectory");
  if (!existingDirectory || existingDirectory.length === 0) {
    await dbPutBatch("supportDirectory", initialSupportDirectory);
  }

  const existingTickets = await dbGetAll("supportTickets");
  if (!existingTickets || existingTickets.length === 0) {
    await dbPutBatch("supportTickets", initialSupportTickets);
  }
}

// Higher-level collection accessors with dynamic computation
export const offlineStorage = {
  // Collections
  async getMines() {
    await seedStorageIfEmpty();
    return dbGetAll("mines");
  },
  async getMine(id) {
    await seedStorageIfEmpty();
    const item = await dbGet("mines", id);
    if (item) return item;
    const all = await dbGetAll("mines");
    return all.find((m) => m._id === id || m.code === id) || null;
  },
  async saveMine(mine) {
    return dbPut("mines", mine);
  },

  async getInspections() {
    await seedStorageIfEmpty();
    const list = await dbGetAll("inspections");
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
  async getInspection(id) {
    await seedStorageIfEmpty();
    const item = await dbGet("inspections", id);
    if (item) return item;
    const all = await dbGetAll("inspections");
    return all.find((i) => i._id === id) || null;
  },
  async saveInspection(inspection) {
    return dbPut("inspections", inspection);
  },
  async deleteInspection(id) {
    return dbDelete("inspections", id);
  },

  async getCompliances() {
    await seedStorageIfEmpty();
    return dbGetAll("compliances");
  },
  async saveCompliance(compliance) {
    return dbPut("compliances", compliance);
  },

  async getContractors() {
    await seedStorageIfEmpty();
    return dbGetAll("contractors");
  },
  async saveContractor(contractor) {
    return dbPut("contractors", contractor);
  },

  async getAlerts() {
    await seedStorageIfEmpty();
    const alerts = await dbGetAll("alerts");
    return alerts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
  async saveAlert(alert) {
    return dbPut("alerts", alert);
  },

  async getAttendance() {
    await seedStorageIfEmpty();
    const att = await dbGetAll("attendance");
    return att.sort((a, b) => new Date(b.checkIn || 0) - new Date(a.checkIn || 0));
  },
  async saveAttendance(item) {
    return dbPut("attendance", item);
  },

  async getSupportDirectory() {
    await seedStorageIfEmpty();
    return dbGetAll("supportDirectory");
  },
  async getSupportTickets() {
    await seedStorageIfEmpty();
    const tickets = await dbGetAll("supportTickets");
    return tickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
  async getSupportTicket(id) {
    await seedStorageIfEmpty();
    const item = await dbGet("supportTickets", id);
    if (item) return item;
    const all = await dbGetAll("supportTickets");
    return all.find((t) => t._id === id) || null;
  },
  async saveSupportTicket(ticket) {
    return dbPut("supportTickets", ticket);
  },

  // Computed Dashboard & Analytics
  async getDashboardSummary() {
    await seedStorageIfEmpty();
    const [mines, inspections, compliances, contractors, alerts] = await Promise.all([
      dbGetAll("mines"),
      dbGetAll("inspections"),
      dbGetAll("compliances"),
      dbGetAll("contractors"),
      dbGetAll("alerts"),
    ]);

    const openInspections = inspections.filter((i) => i.status === "open" || i.status === "in_progress").length;
    const criticalInspections = inspections.filter((i) => i.severity === "critical").length;
    const overdueCompliances = compliances.filter((c) => c.status === "overdue").length;
    const unreadAlerts = alerts.filter((a) => !a.isRead).length;

    const complianceScores = mines.map((m) => m.complianceScore || 80);
    const avgComplianceScore = complianceScores.length
      ? Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length)
      : 82;

    const riskDistribution = {
      low: mines.filter((m) => m.riskLevel === "low").length,
      medium: mines.filter((m) => m.riskLevel === "medium").length,
      high: mines.filter((m) => m.riskLevel === "high").length,
      critical: mines.filter((m) => m.riskLevel === "critical").length,
    };

    return {
      totalMines: mines.length,
      openInspections,
      criticalInspections,
      overdueCompliances,
      avgComplianceScore,
      activeContractors: contractors.filter((c) => c.status === "active").length,
      unreadAlerts,
      riskDistribution,
    };
  },

  async getAnalytics() {
    await seedStorageIfEmpty();
    const [mines, inspections] = await Promise.all([
      dbGetAll("mines"),
      dbGetAll("inspections"),
    ]);

    const highRiskInspections = inspections.filter(
      (i) => i.severity === "high" || i.severity === "critical"
    );

    return {
      totalMines: mines.length,
      inspectionsCount: inspections.length,
      highRiskInspections,
      monthlyTrends: [
        { month: "Jan", inspections: 14, violations: 4 },
        { month: "Feb", inspections: 18, violations: 7 },
        { month: "Mar", inspections: 22, violations: 5 },
        { month: "Apr", inspections: 19, violations: 8 },
        { month: "May", inspections: 25, violations: 6 },
        { month: "Jun", inspections: 20, violations: 3 },
      ],
      severityCounts: {
        low: inspections.filter((i) => i.severity === "low").length,
        medium: inspections.filter((i) => i.severity === "medium").length,
        high: inspections.filter((i) => i.severity === "high").length,
        critical: inspections.filter((i) => i.severity === "critical").length,
      },
    };
  },

  async getRealtimeAttendance() {
    await seedStorageIfEmpty();
    const list = await dbGetAll("attendance");
    const active = list.filter((a) => !a.checkOut && a.liveStatus === "inside_mine");
    const surface = list.filter((a) => !a.checkOut && a.liveStatus === "surface_area");
    return {
      activeWorkersInsideMine: active.length,
      surfacePersonnel: surface.length,
      totalTrackedToday: list.length,
      safeEvacuationStatus: "Normal Operating Conditions",
      activeZones: [
        { name: "Pit-1 Underground Face", count: active.length },
        { name: "Surface Processing Bay", count: surface.length },
      ],
    };
  },

  async getWorkerSummary() {
    await seedStorageIfEmpty();
    const att = await dbGetAll("attendance");
    return {
      workers: att.map((a) => ({
        _id: a.workerId || a._id,
        name: a.workerName,
        employeeId: a.workerId,
        department: a.role || "Mining",
        role: "worker",
        attendanceToday: a.status || "present",
        liveStatus: a.liveStatus || "surface_area",
        zone: a.zone,
        shift: a.shift,
      })),
      totals: {
        totalRegistered: att.length,
        presentToday: att.filter((a) => a.status === "present").length,
        insideMine: att.filter((a) => a.liveStatus === "inside_mine").length,
      },
    };
  },

  async getMineralResourceSummary() {
    return {
      totalSites: 12480,
      activeMines: 3820,
      explorationProjects: 5120,
      developedDeposits: 3540,
      commodityBreakdown: [
        { name: "Coal & Lignite", count: 4850, percentage: 38.8 },
        { name: "Iron Ore", count: 2890, percentage: 23.1 },
        { name: "Bauxite", count: 1820, percentage: 14.5 },
        { name: "Manganese", count: 1450, percentage: 11.6 },
        { name: "Copper & Base Metals", count: 1470, percentage: 11.8 },
      ],
      stateDistribution: [
        { state: "Madhya Pradesh", count: 3200 },
        { state: "Chhattisgarh", count: 2950 },
        { state: "Jharkhand", count: 2840 },
        { state: "Odisha", count: 2100 },
        { state: "West Bengal", count: 1390 },
      ],
    };
  },

  async getMineralResourceRecords(params = {}) {
    const summary = await this.getMineralResourceSummary();
    const records = [
      {
        _id: "res_001",
        NAME: "Jayant Singrauli Seam",
        CITY: "Singrauli",
        STATE: "Madhya Pradesh",
        COUNTY: "Singrauli",
        NAICSDESCR: "Bituminous Coal Underground Mining",
        MINE_TYPE: "Surface / Open Pit",
        COMMODITY: "Coal",
        LATITUDE: 24.12,
        LONGITUDE: 82.45,
      },
      {
        _id: "res_002",
        NAME: "Kusmunda Dip Seam",
        CITY: "Korba",
        STATE: "Chhattisgarh",
        COUNTY: "Korba",
        NAICSDESCR: "Coal Mining Operations",
        MINE_TYPE: "Open Cast",
        COMMODITY: "Coal",
        LATITUDE: 22.35,
        LONGITUDE: 82.68,
      },
      {
        _id: "res_003",
        NAME: "Gevra Mega Pit",
        CITY: "Korba",
        STATE: "Chhattisgarh",
        COUNTY: "Korba",
        NAICSDESCR: "High Capacity Open Cast Coal",
        MINE_TYPE: "Open Cast",
        COMMODITY: "Coal",
        LATITUDE: 22.35,
        LONGITUDE: 82.56,
      },
      {
        _id: "res_004",
        NAME: "Amlohri Deep Seam Project",
        CITY: "Singrauli",
        STATE: "Madhya Pradesh",
        COUNTY: "Singrauli",
        NAICSDESCR: "Bituminous Coal",
        MINE_TYPE: "Surface",
        COMMODITY: "Coal",
        LATITUDE: 24.08,
        LONGITUDE: 82.52,
      },
      {
        _id: "res_005",
        NAME: "Nigahi Pit Reserve",
        CITY: "Singrauli",
        STATE: "Madhya Pradesh",
        COUNTY: "Singrauli",
        NAICSDESCR: "Coal Extraction",
        MINE_TYPE: "Open Cast",
        COMMODITY: "Coal",
        LATITUDE: 24.02,
        LONGITUDE: 82.59,
      },
    ];

    return {
      records,
      total: records.length,
      page: params.page || 1,
      totalPages: 1,
    };
  },
};

// Auto-seed on initial load
if (typeof window !== "undefined") {
  seedStorageIfEmpty().catch(console.warn);
}
