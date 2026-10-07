// offlineStorage.js - Robust IndexedDB & localStorage persistence layer for MineSight Offline-First Architecture

const DB_NAME = "minesight_offline_db";
const DB_VERSION = 2;
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

// Open / initialize IndexedDB with cached connection promise
let cachedDbPromise = null;
function openDatabase() {
  if (cachedDbPromise) return cachedDbPromise;

  cachedDbPromise = new Promise((resolve) => {
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

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        try {
          db.close();
        } catch {
          // ignore
        }
        cachedDbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      console.warn("IndexedDB open error, falling back to localStorage:", request.error);
      cachedDbPromise = null;
      resolve(null);
    };

    request.onblocked = () => {
      console.warn("IndexedDB open blocked by another tab or connection");
      cachedDbPromise = null;
      resolve(null);
    };
  });

  return cachedDbPromise;
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

  // Safely update localStorage mirror without large media payloads to prevent QuotaExceededError
  if (storeName !== "media") {
    try {
      const currentLs = getLs(storeName, []);
      const existingIdx = currentLs.findIndex((i) => i._id === item._id);

      // Strip giant inline data URLs from localStorage mirror; IndexedDB retains full resolution
      const itemToMirror = storeName === "inspections" && Array.isArray(item.photos)
        ? {
            ...item,
            photos: item.photos.map((p) => {
              if (typeof p === "string") return p;
              return {
                ...p,
                url: (typeof p?.url === "string" && p.url.startsWith("data:")) ? (p.mediaKey || "stored_offline_media") : p?.url,
              };
            }),
            audio: (typeof item.audio === "string" && item.audio.startsWith("data:")) ? "stored_offline_audio" : item.audio,
            audioUrl: (typeof item.audioUrl === "string" && item.audioUrl.startsWith("data:")) ? "stored_offline_audio" : item.audioUrl,
          }
        : item;

      if (existingIdx >= 0) {
        currentLs[existingIdx] = { ...currentLs[existingIdx], ...itemToMirror };
      } else {
        currentLs.unshift(itemToMirror);
      }
      setLs(storeName, currentLs);
    } catch (e) {
      console.warn("localStorage mirror update skipped:", e);
    }
  }

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
    _id: "dir_cat_001",
    category: "Emergency & Disaster Response",
    contacts: [
      {
        title: "DGMS National Mine Emergency Control Room",
        number: "1800-345-3467",
        alt: "0326-2221000",
        timing: "24/7 Available",
        badge: "Immediate SOS",
      },
      {
        title: "Central Coalfields Rescue Station (Dhanbad / Singrauli)",
        number: "0326-2202356",
        alt: "07805-266120",
        timing: "24/7 Emergency Dispatch",
        badge: "Underground Rescue",
      },
      {
        title: "CIL Safety & Health Directorate",
        number: "033-23246633",
        timing: "08:00 - 20:00 IST",
        badge: "Statutory Reporting",
      },
    ],
  },
  {
    _id: "dir_cat_002",
    category: "Technical & Systems Support",
    contacts: [
      {
        title: "MineSight IoT & Telemetry Hotline",
        number: "+91 800-419-7890",
        email: "support@minesight.cil.gov.in",
        timing: "24/7 Technical Ops",
        badge: "System Helpdesk",
      },
      {
        title: "DGMS Portal Sync & Statutory Filing Helpdesk",
        number: "+91 11-2338-9011",
        email: "dgms-portal@nic.in",
        timing: "09:30 - 18:00 IST",
        badge: "Compliance",
      },
    ],
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

let isStorageSeeded = false;

// Seed storage if empty
export async function seedStorageIfEmpty() {
  if (isStorageSeeded) return;

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

  isStorageSeeded = true;
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
    const stored = await dbGetAll("supportDirectory");
    if (!stored || stored.length === 0 || !stored[0]?.contacts) {
      await dbPutBatch("supportDirectory", initialSupportDirectory);
      return initialSupportDirectory;
    }
    return stored;
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
  async deleteSupportTicket(id) {
    return dbDelete("supportTickets", id);
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

    let user = null;
    try {
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      if (stored) user = JSON.parse(stored);
    } catch {}

    const isWorkerOrOfficial = user && ["worker", "mine_official"].includes(user.role);

    let filteredInspections = inspections;
    let filteredMines = mines;
    if (isWorkerOrOfficial) {
      if (user.mineId) {
        const uMineId = typeof user.mineId === "object" ? user.mineId?._id || user.mineId?.code : user.mineId;
        const matched = inspections.filter((i) => {
          const iMineId = typeof i.mineId === "object" ? i.mineId?._id || i.mineId?.code : i.mineId;
          const iInspectorId = typeof i.inspectorId === "object" ? i.inspectorId?._id : i.inspectorId;
          return iMineId === uMineId || iInspectorId === user._id;
        });
        filteredInspections = matched.length > 0 ? matched : inspections;

        const mineMatched = mines.filter((m) => m._id === uMineId || m.code === uMineId);
        if (mineMatched.length > 0) filteredMines = mineMatched;
      } else {
        const matched = inspections.filter((i) => {
          const iInspectorId = typeof i.inspectorId === "object" ? i.inspectorId?._id : i.inspectorId;
          return iInspectorId === user._id;
        });
        filteredInspections = matched.length > 0 ? matched : inspections;
      }
    }

    const openInspections = filteredInspections.filter((i) => i.status === "open" || i.status === "in_progress").length;
    const criticalInspections = filteredInspections.filter((i) => (i.severity === "critical" || Number(i.riskScore) >= 80) && i.status !== "closed").length;
    const totalInspections = filteredInspections.length;
    const overdueCompliances = compliances.filter((c) => c.status === "overdue").length;
    const unreadAlerts = alerts.filter((a) => !a.isRead).length;

    const complianceScores = filteredMines.map((m) => m.complianceScore || 80);
    const avgComplianceScore = complianceScores.length
      ? Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length)
      : 82;

    const riskDistribution = isWorkerOrOfficial
      ? {
          low: filteredInspections.filter((i) => (i.severity || "").toLowerCase() === "low").length,
          medium: filteredInspections.filter((i) => (i.severity || "").toLowerCase() === "medium").length,
          high: filteredInspections.filter((i) => (i.severity || "").toLowerCase() === "high").length,
          critical: filteredInspections.filter((i) => (i.severity || "").toLowerCase() === "critical").length,
        }
      : {
          low: mines.filter((m) => m.riskLevel === "low").length,
          medium: mines.filter((m) => m.riskLevel === "medium").length,
          high: mines.filter((m) => m.riskLevel === "high").length,
          critical: mines.filter((m) => m.riskLevel === "critical").length,
        };

    return {
      totalMines: filteredMines.length,
      totalInspections,
      openInspections,
      criticalInspections,
      overdueCompliances,
      avgComplianceScore,
      activeContractors: contractors.filter((c) => c.status === "active").length,
      unreadAlerts,
      riskDistribution,
    };
  },

  async getAnalytics(params = {}) {
    await seedStorageIfEmpty();
    const [mines, allInspections] = await Promise.all([
      dbGetAll("mines"),
      dbGetAll("inspections"),
    ]);

    let inspections = [...allInspections];
    if (params.startDate) {
      const startTime = new Date(params.startDate).getTime();
      if (!isNaN(startTime)) {
        inspections = inspections.filter((i) => {
          const t = new Date(i.createdAt || i.inspectionDate || 0).getTime();
          return t >= startTime;
        });
      }
    }
    if (params.endDate) {
      const endTime = new Date(params.endDate).getTime() + 86400000; // include entire end day
      if (!isNaN(endTime)) {
        inspections = inspections.filter((i) => {
          const t = new Date(i.createdAt || i.inspectionDate || 0).getTime();
          return t <= endTime;
        });
      }
    }
    if (params.severity) {
      inspections = inspections.filter(
        (i) => (i.severity || "").toLowerCase() === params.severity.toLowerCase()
      );
    }
    if (params.status) {
      inspections = inspections.filter(
        (i) => (i.status || "").toLowerCase() === params.status.toLowerCase()
      );
    }

    const highRiskInspections = inspections
      .filter((i) => (i.riskScore || 0) >= 60 || i.severity === "high" || i.severity === "critical")
      .slice(0, 10);

    const violationCount = {};
    inspections.forEach((insp) => {
      (insp.violations || []).forEach((v) => {
        const cat = v.category || "General Safety";
        violationCount[cat] = (violationCount[cat] || 0) + 1;
      });
    });

    let recurringViolations = Object.entries(violationCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    if (recurringViolations.length === 0) {
      recurringViolations = [
        { category: "Ventilation & Gas", count: 8 },
        { category: "Haul Road Safety", count: 6 },
        { category: "PPE & Protective Gear", count: 5 },
        { category: "Slope Stability", count: 4 },
        { category: "Electrical Grounding", count: 3 },
      ];
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      monthlyTrend.push({
        _id: { year: y, month: m },
        count: Math.floor(10 + ((i * 3) % 7)),
        avgRisk: Math.floor(38 + ((i * 7) % 25)),
      });
    }

    return {
      totalMines: mines.length,
      inspectionsCount: inspections.length,
      highRiskInspections,
      recurringViolations,
      monthlyTrend,
      periodComparison: {
        period: params.period || "monthly",
        current: {
          inspectionCount: inspections.length || 18,
          highRiskCount: highRiskInspections.length || 4,
          avgRisk: inspections.length ? Math.round(inspections.reduce((s, x) => s + (x.riskScore || 40), 0) / inspections.length) : 42,
          violationCount: recurringViolations.reduce((acc, v) => acc + v.count, 0),
        },
        previous: {
          inspectionCount: Math.max(0, (inspections.length || 18) - 3),
          highRiskCount: Math.max(0, (highRiskInspections.length || 4) + 1),
          avgRisk: 48,
          violationCount: recurringViolations.reduce((acc, v) => acc + v.count, 0) + 4,
        },
      },
    };
  },

  async getRealtimeAttendance() {
    await seedStorageIfEmpty();
    const list = await dbGetAll("attendance");
    const active = list.filter((a) => !a.checkOut && a.liveStatus === "inside_mine");
    const surface = list.filter((a) => !a.checkOut && a.liveStatus === "surface_area");
    const count = active.length > 0 ? active.length : 4;
    return {
      insideMineCount: count,
      activeWorkersInsideMine: count,
      surfacePersonnel: surface.length || 2,
      surfaceAreaCount: surface.length || 2,
      totalTrackedToday: list.length || 6,
      safeEvacuationStatus: "Normal Operating Conditions",
      activeZones: [
        { name: "Pit-1 Underground Face", count },
        { name: "Surface Processing Bay", count: surface.length || 2 },
      ],
    };
  },

  async getWorkerSummary() {
    await seedStorageIfEmpty();
    const [att, mines] = await Promise.all([
      dbGetAll("attendance"),
      dbGetAll("mines"),
    ]);

    const workers = att.map((a) => {
      const mineObj =
        mines.find((m) => m._id === a.mineId?._id || m._id === a.mineId) ||
        mines[0] || { _id: "mine_001", name: "Jayant Open Cast Mine" };
      return {
        _id: a.workerId || a._id,
        name: a.workerName || "Amit Yadav",
        employeeId: a.workerId || "EMP-001",
        department: a.role || "Mining Operations",
        role: "worker",
        pendingTasks: 1,
        completedTasks: 3,
        totalTasks: 4,
        attendance: {
          present: 18,
          absent: 1,
          late: 2,
          leave: 0,
          latest: {
            status: a.status || "present",
            date: a.checkIn || new Date().toISOString(),
          },
        },
        mineSites: [mineObj],
        mineWork: [
          {
            mine: mineObj,
            totalTasks: 4,
            pendingTasks: 1,
            completedTasks: 3,
            attendanceDays: 20,
            workedHours: 160,
            trackedSince:
              a.checkIn || new Date(Date.now() - 30 * 86400000).toISOString(),
          },
        ],
        tasks: [
          {
            _id: `task_${a._id}_1`,
            title: "Check methane sensor calibration at Seam-4",
            status: "pending",
            priority: "high",
            mineId: mineObj,
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            _id: `task_${a._id}_2`,
            title: "Routine pre-shift haul truck inspection",
            status: "completed",
            priority: "medium",
            mineId: mineObj,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ],
      };
    });

    return {
      workers,
      totals: {
        workers: workers.length,
        pendingTasks: workers.reduce((sum, w) => sum + (w.pendingTasks || 0), 0),
        completedTasks: workers.reduce((sum, w) => sum + (w.completedTasks || 0), 0),
        presentToday: att.filter((a) => a.status === "present").length,
      },
    };
  },

  async saveMineralResourceSummary(summary) {
    if (!summary) return;
    setLs("mineral_summary", summary);
  },

  async saveMineralResourceRecords(records) {
    if (!Array.isArray(records) || records.length === 0) return;
    setLs("mineral_records", records);
  },

  async getMineralResourceSummary() {
    const cached = getLs("mineral_summary");
    if (cached && (cached.spatialClusters || cached.states || cached.industryClasses)) {
      return cached;
    }

    return {
      totalRecords: 12480,
      totalSites: 12480,
      activeMines: 3820,
      explorationProjects: 5120,
      developedDeposits: 3540,
      columns: [
        "FID",
        "NAME",
        "CITY",
        "STATE",
        "COUNTY",
        "NAICSDESCR",
        "MINE_TYPE",
        "COMMODITY",
        "LATITUDE",
        "LONGITUDE",
      ],
      states: [
        { state: "Madhya Pradesh", count: 3200 },
        { state: "Chhattisgarh", count: 2950 },
        { state: "Jharkhand", count: 2840 },
        { state: "Odisha", count: 2100 },
        { state: "West Bengal", count: 1390 },
      ],
      stateDistribution: [
        { state: "Madhya Pradesh", count: 3200 },
        { state: "Chhattisgarh", count: 2950 },
        { state: "Jharkhand", count: 2840 },
        { state: "Odisha", count: 2100 },
        { state: "West Bengal", count: 1390 },
      ],
      industryClasses: [
        { name: "Bituminous Coal Underground Mining", count: 4850 },
        { name: "Coal Mining Operations", count: 2890 },
        { name: "Iron Ore Mining", count: 2100 },
        { name: "Bauxite Mining", count: 1820 },
        { name: "Manganese Ore Mining", count: 1450 },
        { name: "Copper Ore and Nickel Ore Mining", count: 1470 },
      ],
      commodityBreakdown: [
        { name: "Coal & Lignite", count: 4850, percentage: 38.8 },
        { name: "Iron Ore", count: 2890, percentage: 23.1 },
        { name: "Bauxite", count: 1820, percentage: 14.5 },
        { name: "Manganese", count: 1450, percentage: 11.6 },
        { name: "Copper & Base Metals", count: 1470, percentage: 11.8 },
      ],
      spatialClusters: [
        {
          id: 1,
          siteCount: 42,
          center: { latitude: 24.12, longitude: 82.45 },
          dominantState: "Madhya Pradesh",
          dominantIndustry: "Bituminous Coal Underground Mining",
          sites: [
            { latitude: 24.12, longitude: 82.45, state: "Madhya Pradesh", industry: "Bituminous Coal Underground Mining" },
            { latitude: 24.08, longitude: 82.52, state: "Madhya Pradesh", industry: "Bituminous Coal" },
            { latitude: 24.02, longitude: 82.59, state: "Madhya Pradesh", industry: "Coal Extraction" },
            { latitude: 24.14, longitude: 82.66, state: "Madhya Pradesh", industry: "Surface Mining" },
          ],
        },
        {
          id: 2,
          siteCount: 38,
          center: { latitude: 22.35, longitude: 82.68 },
          dominantState: "Chhattisgarh",
          dominantIndustry: "Coal Mining Operations",
          sites: [
            { latitude: 22.35, longitude: 82.68, state: "Chhattisgarh", industry: "Coal Mining Operations" },
            { latitude: 22.35, longitude: 82.56, state: "Chhattisgarh", industry: "High Capacity Open Cast Coal" },
            { latitude: 22.30, longitude: 82.52, state: "Chhattisgarh", industry: "Coal Extraction" },
          ],
        },
        {
          id: 3,
          siteCount: 31,
          center: { latitude: 23.79, longitude: 86.43 },
          dominantState: "Jharkhand",
          dominantIndustry: "Bituminous Coal Underground Mining",
          sites: [
            { latitude: 23.79, longitude: 86.43, state: "Jharkhand", industry: "Bituminous Coal Underground Mining" },
            { latitude: 23.75, longitude: 86.35, state: "Jharkhand", industry: "Underground Mining" },
          ],
        },
        {
          id: 4,
          siteCount: 26,
          center: { latitude: 21.82, longitude: 84.85 },
          dominantState: "Odisha",
          dominantIndustry: "Iron Ore Mining",
          sites: [
            { latitude: 21.82, longitude: 84.85, state: "Odisha", industry: "Iron Ore Mining" },
            { latitude: 21.95, longitude: 85.10, state: "Odisha", industry: "Iron Ore Mining" },
          ],
        },
        {
          id: 5,
          siteCount: 19,
          center: { latitude: 23.68, longitude: 87.05 },
          dominantState: "West Bengal",
          dominantIndustry: "Coal Mining Operations",
          sites: [
            { latitude: 23.68, longitude: 87.05, state: "West Bengal", industry: "Coal Mining Operations" },
            { latitude: 23.72, longitude: 87.15, state: "West Bengal", industry: "Coal Mining Operations" },
          ],
        },
      ],
    };
  },

  async getMineralResourceRecords(params = {}) {
    const cachedRecords = getLs("mineral_records");
    const rawMineralData = [
      { name: "Jayant Singrauli Seam", city: "Singrauli", state: "Madhya Pradesh", county: "Singrauli", descr: "Bituminous Coal Underground", type: "Surface / Open Pit", comm: "Coal", lat: 24.12, lng: 82.45 },
      { name: "Kusmunda Dip Seam", city: "Korba", state: "Chhattisgarh", county: "Korba", descr: "Coal Mining Operations", type: "Open Cast", comm: "Coal", lat: 22.35, lng: 82.68 },
      { name: "Gevra Mega Pit", city: "Korba", state: "Chhattisgarh", county: "Korba", descr: "High Capacity Open Cast Coal", type: "Open Cast", comm: "Coal", lat: 22.35, lng: 82.56 },
      { name: "Amlohri Deep Seam Project", city: "Singrauli", state: "Madhya Pradesh", county: "Singrauli", descr: "Bituminous Coal", type: "Surface", comm: "Coal", lat: 24.08, lng: 82.52 },
      { name: "Nigahi Pit Reserve", city: "Singrauli", state: "Madhya Pradesh", county: "Singrauli", descr: "Coal Extraction", type: "Open Cast", comm: "Coal", lat: 24.02, lng: 82.59 },
      { name: "Dudhichua Boundary Mine", city: "Singrauli", state: "Madhya Pradesh", county: "Singrauli", descr: "Bituminous Coal", type: "Open Cast", comm: "Coal", lat: 24.14, lng: 82.66 },
      { name: "Dipka Expansion Pit", city: "Korba", state: "Chhattisgarh", county: "Korba", descr: "High Capacity Open Cast Coal", type: "Open Cast", comm: "Coal", lat: 22.30, lng: 82.52 },
      { name: "Jharia Deep Shaft #4", city: "Dhanbad", state: "Jharkhand", county: "Dhanbad", descr: "Coking Coal Underground", type: "Underground", comm: "Coal", lat: 23.75, lng: 86.42 },
      { name: "Moonidih Mechanized Longwall", city: "Dhanbad", state: "Jharkhand", county: "Dhanbad", descr: "Deep Coking Coal", type: "Underground Longwall", comm: "Coal", lat: 23.74, lng: 86.35 },
      { name: "Bailadila Deposit 5", city: "Kirandul", state: "Chhattisgarh", county: "Dantewada", descr: "High Grade Hematite", type: "Open Cast", comm: "Iron Ore", lat: 18.68, lng: 81.25 },
      { name: "Bailadila Deposit 14", city: "Bacheli", state: "Chhattisgarh", county: "Dantewada", descr: "Hematite Extraction", type: "Open Cast", comm: "Iron Ore", lat: 18.72, lng: 81.28 },
      { name: "Noamundi Iron Mine", city: "Noamundi", state: "Jharkhand", county: "West Singhbhum", descr: "Banded Hematite Jasper", type: "Open Cast", comm: "Iron Ore", lat: 22.15, lng: 85.50 },
      { name: "Joda East Mine", city: "Joda", state: "Odisha", county: "Kendujhar", descr: "High Grade Iron Ore", type: "Open Cast", comm: "Iron Ore", lat: 22.02, lng: 85.42 },
      { name: "Barbil Khondbond Deposit", city: "Barbil", state: "Odisha", county: "Kendujhar", descr: "Iron & Manganese Ore", type: "Open Cast", comm: "Iron Ore", lat: 22.08, lng: 85.38 },
      { name: "Dalli-Rajhara Complex", city: "Rajhara", state: "Chhattisgarh", county: "Balod", descr: "Captive Iron Ore for BSP", type: "Open Cast", comm: "Iron Ore", lat: 20.58, lng: 81.08 },
      { name: "Panchpatmali Bauxite Mine", city: "Damanjodi", state: "Odisha", county: "Koraput", descr: "Metallurgical Grade Bauxite", type: "Open Cast", comm: "Bauxite", lat: 18.84, lng: 83.02 },
      { name: "Baphlimali Bauxite Deposit", city: "Rayagada", state: "Odisha", county: "Rayagada", descr: "Lateritic Bauxite", type: "Open Cast", comm: "Bauxite", lat: 19.32, lng: 82.98 },
      { name: "Khetri Copper Complex", city: "Khetri", state: "Rajasthan", county: "Jhunjhunu", descr: "Chalcopyrite Underground", type: "Underground", comm: "Copper", lat: 28.01, lng: 75.78 },
      { name: "Kolihan Copper Mine", city: "Khetri", state: "Rajasthan", county: "Jhunjhunu", descr: "Copper Sulphide Ore", type: "Underground", comm: "Copper", lat: 28.03, lng: 75.76 },
      { name: "Malanjkhand Copper Project", city: "Malanjkhand", state: "Madhya Pradesh", county: "Balaghat", descr: "Granite Hosted Copper Porphyry", type: "Open Cast / UG", comm: "Copper", lat: 22.02, lng: 80.71 },
      { name: "Rampura Agucha Super Pit", city: "Gulabpura", state: "Rajasthan", county: "Bhilwara", descr: "World Class Zinc-Lead Ore", type: "Open Cast / UG", comm: "Zinc & Lead", lat: 25.83, lng: 74.74 },
      { name: "Sindesar Khurd Mine", city: "Dariba", state: "Rajasthan", county: "Rajsamand", descr: "Silver-Rich Zinc Ore", type: "Underground", comm: "Zinc & Lead", lat: 24.98, lng: 74.15 },
      { name: "Zawar Group of Mines", city: "Udaipur", state: "Rajasthan", county: "Udaipur", descr: "Ancient Lead-Zinc Mines", type: "Underground", comm: "Zinc & Lead", lat: 24.35, lng: 73.71 },
      { name: "Sukinda Valley Chromite #1", city: "Sukinda", state: "Odisha", county: "Jajpur", descr: "High Grade Chromite", type: "Open Cast", comm: "Chromite", lat: 21.03, lng: 85.80 },
      { name: "South Kaliapani Chromite", city: "Sukinda", state: "Odisha", county: "Jajpur", descr: "Metallurgical Chromite", type: "Open Cast", comm: "Chromite", lat: 21.05, lng: 85.83 },
      { name: "Neyveli Lignite Mine I", city: "Neyveli", state: "Tamil Nadu", county: "Cuddalore", descr: "Lignite Open Cast", type: "Open Cast", comm: "Lignite", lat: 11.59, lng: 79.48 },
      { name: "Neyveli Lignite Mine II", city: "Neyveli", state: "Tamil Nadu", county: "Cuddalore", descr: "Power Grade Lignite", type: "Open Cast", comm: "Lignite", lat: 11.53, lng: 79.46 },
      { name: "Barsingsar Lignite Project", city: "Bikaner", state: "Rajasthan", county: "Bikaner", descr: "Tertiary Lignite", type: "Open Cast", comm: "Lignite", lat: 27.82, lng: 73.20 },
      { name: "Hutti Gold Mines", city: "Hutti", state: "Karnataka", county: "Raichur", descr: "Auriferous Quartz Veins", type: "Underground", comm: "Gold", lat: 16.20, lng: 76.65 },
      { name: "Kolar Champion Reef", city: "KGF", state: "Karnataka", county: "Kolar", descr: "Deep Reef Gold Deposit", type: "Historic UG", comm: "Gold", lat: 12.96, lng: 78.27 },
      { name: "Singareni KTK 6 Incline", city: "Bhupalpally", state: "Telangana", county: "Jayashankar", descr: "Godavari Valley Coal", type: "Underground", comm: "Coal", lat: 18.42, lng: 79.86 },
      { name: "Singareni RG OC III", city: "Ramagundam", state: "Telangana", county: "Peddapalli", descr: "Continuous Surface Mining", type: "Open Cast", comm: "Coal", lat: 18.76, lng: 79.52 },
      { name: "Singareni Manuguru OC IV", city: "Manuguru", state: "Telangana", county: "Bhadradri", descr: "High Seam Coal Stripping", type: "Open Cast", comm: "Coal", lat: 17.98, lng: 80.75 },
      { name: "Talcher Bharatpur Pit", city: "Talcher", state: "Odisha", county: "Angul", descr: "Thermal Coal Horizon", type: "Open Cast", comm: "Coal", lat: 20.95, lng: 85.18 },
      { name: "Talcher Ananta Quarry", city: "Talcher", state: "Odisha", county: "Angul", descr: "Heavy Mining Earthmoving", type: "Open Cast", comm: "Coal", lat: 20.94, lng: 85.16 },
      { name: "Ib Valley Lakhanpur OC", city: "Jharsuguda", state: "Odisha", county: "Jharsuguda", descr: "Ib River Basin Coal", type: "Open Cast", comm: "Coal", lat: 21.75, lng: 83.82 },
      { name: "Pipilaguda Limestone Quarry", city: "Yerraguntla", state: "Andhra Pradesh", county: "Kadapa", descr: "Cement Grade Limestone", type: "Open Cast", comm: "Limestone", lat: 14.63, lng: 78.53 },
      { name: "Wadi Limestone Quarry #2", city: "Wadi", state: "Karnataka", county: "Kalaburagi", descr: "Sedimentary Limestone", type: "Open Cast", comm: "Limestone", lat: 17.05, lng: 76.99 },
      { name: "Nimbahera Limestone Pit", city: "Nimbahera", state: "Rajasthan", county: "Chittorgarh", descr: "High Purity Calcite Limestone", type: "Open Cast", comm: "Limestone", lat: 24.62, lng: 74.68 },
      { name: "Dongri Buzurg Manganese Mine", city: "Tumsar", state: "Maharashtra", county: "Bhandara", descr: "Ferromanganese Ore Deposit", type: "Open Cast", comm: "Manganese", lat: 21.55, lng: 79.68 },
      { name: "Balaghat Bharweli Mine", city: "Balaghat", state: "Madhya Pradesh", county: "Balaghat", descr: "Deep Underground Manganese", type: "Underground", comm: "Manganese", lat: 21.87, lng: 80.22 },
      { name: "Tirodi Manganese Project", city: "Tirodi", state: "Madhya Pradesh", county: "Balaghat", descr: "Pyrolusite & Psilomelane", type: "Open Cast", comm: "Manganese", lat: 21.68, lng: 79.72 },
      { name: "Raniganj Sodepur Colliery", city: "Asansol", state: "West Bengal", county: "Paschim Bardhaman", descr: "Raniganj Coalfield Pioneer", type: "Underground", comm: "Coal", lat: 23.68, lng: 86.98 },
      { name: "Khottadih Combined Mine", city: "Pandaveswar", state: "West Bengal", county: "Paschim Bardhaman", descr: "Mechanized Longwall Coal", type: "Underground", comm: "Coal", lat: 23.65, lng: 87.26 },
      { name: "Kankartala Coal Project", city: "Dubrajpur", state: "West Bengal", county: "Birbhum", descr: "Sub-Bituminous Coal", type: "Open Cast", comm: "Coal", lat: 23.80, lng: 87.35 },
      { name: "Codli Iron Ore Block", city: "Sanguem", state: "Goa", county: "South Goa", descr: "Export Grade Blue Dust", type: "Open Cast", comm: "Iron Ore", lat: 15.30, lng: 74.15 },
      { name: "Bicholim Iron Project", city: "Bicholim", state: "Goa", county: "North Goa", descr: "Low Silica Hematite", type: "Open Cast", comm: "Iron Ore", lat: 15.60, lng: 73.95 },
      { name: "Jaduguda Uranium Mine", city: "Jaduguda", state: "Jharkhand", county: "East Singhbhum", descr: "Uraninite Underground Mine", type: "Underground", comm: "Uranium", lat: 22.65, lng: 86.35 },
      { name: "Narwapahar Uranium Project", city: "Narwapahar", state: "Jharkhand", county: "East Singhbhum", descr: "Trackless Mining System", type: "Underground", comm: "Uranium", lat: 22.70, lng: 86.27 },
      { name: "Tummalapalle Uranium Mine", city: "Pulivendula", state: "Andhra Pradesh", county: "Kadapa", descr: "Carbonate Hosted Uranium", type: "Underground Decline", comm: "Uranium", lat: 14.33, lng: 78.26 },
      { name: "Kudremukh Magnetite Deposit", city: "Kudremukh", state: "Karnataka", county: "Chikkamagaluru", descr: "Banded Iron Formation", type: "Surface Bench", comm: "Iron Ore", lat: 13.22, lng: 75.25 },
      { name: "Donimalai Iron Ore Mine", city: "Sandur", state: "Karnataka", county: "Ballari", descr: "High Grade Pellets Feed", type: "Open Cast", comm: "Iron Ore", lat: 15.08, lng: 76.62 },
      { name: "Kumaraswamy Iron Pit", city: "Sandur", state: "Karnataka", county: "Ballari", descr: "Hematite Open Pit", type: "Open Cast", comm: "Iron Ore", lat: 15.02, lng: 76.58 },
      { name: "Panna Majhgawan Diamond Pipe", city: "Panna", state: "Madhya Pradesh", county: "Panna", descr: "Kimberlite Diamond Pipe", type: "Open Cast", comm: "Diamond", lat: 24.64, lng: 80.04 },
      { name: "Chavara Heavy Mineral Beach Sand", city: "Kollam", state: "Kerala", county: "Kollam", descr: "Ilmenite & Rutile Monazite", type: "Placer Mining", comm: "Rare Earths", lat: 8.99, lng: 76.53 },
      { name: "Manavalakurichi Placer Deposit", city: "Kanyakumari", state: "Tamil Nadu", county: "Kanyakumari", descr: "Garnet and Zircon Sand", type: "Placer Dredging", comm: "Rare Earths", lat: 8.14, lng: 77.30 }
    ];

    const defaultRecords = rawMineralData.map((item, idx) => ({
      _id: `res_seed_${idx + 1}`,
      FID: String(idx + 1),
      NAME: item.name,
      CITY: item.city,
      STATE: item.state,
      COUNTY: item.county,
      NAICSDESCR: item.descr,
      MINE_TYPE: item.type,
      COMMODITY: item.comm,
      LATITUDE: item.lat,
      LONGITUDE: item.lng
    }));

    const allRecords = Array.isArray(cachedRecords) && cachedRecords.length > 0 ? cachedRecords : defaultRecords;

    const search = String(params.search || "").trim().toLowerCase();
    const filtered = search
      ? allRecords.filter((record) =>
          Object.values(record).some((val) =>
            String(val ?? "").toLowerCase().includes(search)
          )
        )
      : allRecords;

    const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(params.limit, 10) || 25);
    const totalRecords = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const records = filtered.slice((page - 1) * limit, page * limit);
    const columns = Object.keys(allRecords[0] || {});

    return {
      columns,
      records,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
      total: totalRecords,
      totalPages,
    };
  },
};

// Auto-seed on initial load
if (typeof window !== "undefined") {
  seedStorageIfEmpty().catch(console.warn);
}

export default offlineStorage;
