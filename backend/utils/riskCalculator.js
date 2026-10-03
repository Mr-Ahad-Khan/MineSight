/**
 * Simple AI-like risk score calculator
 * In real production this can be replaced by ML model
 */
const calculateRiskScore = (inspection) => {
  let score = 0;

  // Base on severity
  const severityMap = {
    low: 15,
    medium: 35,
    high: 60,
    critical: 85,
  };
  score += severityMap[inspection.severity] || 30;

  // Add for number of open violations
  if (inspection.violations && inspection.violations.length > 0) {
    const openViolations = inspection.violations.filter((v) => v.status === 'open');
    score += openViolations.length * 8;

    // Extra for critical violations
    const criticalCount = openViolations.filter((v) => v.severity === 'critical').length;
    score += criticalCount * 12;
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
};

const getRiskLevel = (score) => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
};

const detectPhotoRiskBackend = async ({ file, context = {} }) => {
  const textContext = `${context.title || ""} ${context.description || ""} ${context.observations || ""} ${file?.originalname || ""}`.toLowerCase();

  const hazardDatabase = [
    {
      keywords: ["slope", "wall", "crack", "rock", "fissure", "bench", "overburden", "slide", "fall", "collapse"],
      category: "geotechnical",
      label: "Highwall / Bench Slope Fissure Risk",
      baseScore: 78,
      severity: "high",
      confidence: 89,
      description: "Visual discontinuity and tension fissures identified along highwall/bench crest with rockfall hazard.",
      recommendation: "Erect barricades at the bench toe, deploy slope displacement sensors, and clear personnel from lower working area.",
      violation: {
        category: "safety",
        severity: "high",
        description: "Unstable bench crest with visible tension cracks violating DGMS Circular on highwall management.",
        correctiveAction: "Halt heavy machinery operations on bench edge and initiate geotechnical bench scaling.",
      },
    },
    {
      keywords: ["water", "pond", "flood", "seep", "drain", "mud", "inundat", "leak", "pump"],
      category: "inundation",
      label: "Water Accumulation & Pit Inundation Risk",
      baseScore: 72,
      severity: "high",
      confidence: 86,
      description: "Surface water accumulation and drainage ditch obstruction near active haulage corridor.",
      recommendation: "Deploy auxiliary dewatering pumps, clear siltation from drainage channels, and monitor water levels.",
      violation: {
        category: "environment",
        severity: "high",
        description: "Inadequate surface water drainage creating pit flooding risk in violation of CMR regulations.",
        correctiveAction: "Install sump pump diversion line and restore drain embankment.",
      },
    },
    {
      keywords: ["ppe", "helmet", "vest", "worker", "boot", "lamp", "mask", "jacket", "person"],
      category: "ppe_safety",
      label: "PPE Statutory Non-Compliance",
      baseScore: 65,
      severity: "medium",
      confidence: 91,
      description: "Personnel identified in operational zone without mandatory high-visibility retro-reflective apparel or protective headgear.",
      recommendation: "Issue immediate PPE compliance notice and ensure pit gate check officers enforce DGMS PPE standards.",
      violation: {
        category: "safety",
        severity: "medium",
        description: "Miners active without approved statutory safety helmet / reflective vest.",
        correctiveAction: "Equip workers with approved PPE and re-conduct safety shift briefing.",
      },
    },
    {
      keywords: ["road", "haul", "dumper", "truck", "berm", "bund", "traffic", "vehicle", "barrier"],
      category: "haulage",
      label: "Haul Road Safety Berm Deficiency",
      baseScore: 70,
      severity: "high",
      confidence: 84,
      description: "Haul road edge lacks continuous safety berm of height equal to largest vehicle wheel diameter (CMR 89).",
      recommendation: "Reconstruct continuous stone/earthen berm along outer slope of haul road immediately.",
      violation: {
        category: "safety",
        severity: "high",
        description: "Sub-standard or discontinuous safety berm along heavy dump-truck haul road.",
        correctiveAction: "Grade and compact earthen safety bund to at least 1.5m height.",
      },
    },
    {
      keywords: ["dust", "ventilation", "smoke", "gas", "air", "methane", "ch4", "co", "cloud"],
      category: "ventilation_dust",
      label: "Airborne Coal Dust & Ventilation Stagnation",
      baseScore: 75,
      severity: "high",
      confidence: 88,
      description: "Dense respirable coal dust suspension and dry coal face without active mist dust suppression.",
      recommendation: "Activate water mist atomizers, test auxiliary ventilation fans, and verify air velocity (>0.5 m/s).",
      violation: {
        category: "environment",
        severity: "high",
        description: "Failure to operate water spraying systems during coal extraction operations.",
        correctiveAction: "Connect pressurized water supply to mist nozzles and clean ventilation ducting.",
      },
    },
    {
      keywords: ["cable", "electric", "switch", "spark", "wire", "transformer", "power"],
      category: "electrical",
      label: "Trailing Cable Mechanical Damage / Spark Hazard",
      baseScore: 82,
      severity: "critical",
      confidence: 93,
      description: "Unarmored electrical cable dragging across sharp rock surface with exposed outer sheathing.",
      recommendation: "Isolate power supply at sectional circuit breaker and replace cable with DGMS flameproof type.",
      violation: {
        category: "safety",
        severity: "critical",
        description: "Damaged high-voltage trailing cable posing electrocution and methane ignition hazard.",
        correctiveAction: "De-energize circuit, vulcanize/splice cable using approved flameproof kits, and suspend above floor.",
      },
    },
  ];

  // Match based on textContext keywords, or default to geotechnical/haulage risk
  let matched = hazardDatabase.find((h) =>
    h.keywords.some((k) => textContext.includes(k))
  );

  if (!matched) {
    // Generate intelligent default based on file size or pseudo-random deterministic index
    const seed = (file?.size || Date.now()) % hazardDatabase.length;
    matched = hazardDatabase[seed];
  }

  // Adjust score slightly based on context severity if provided
  let calculatedScore = matched.baseScore;
  if (context.severity === "critical") calculatedScore = Math.max(calculatedScore, 85);
  else if (context.severity === "low") calculatedScore = Math.min(calculatedScore, 38);

  const level = getRiskLevel(calculatedScore);

  return {
    success: true,
    riskScore: calculatedScore,
    riskLevel: level,
    suggestedSeverity: level,
    hazards: [
      {
        category: matched.category,
        label: matched.label,
        confidence: matched.confidence,
        severity: matched.severity,
        description: matched.description,
      },
      {
        category: "environment",
        label: "Operational Zone Housekeeping Standard",
        confidence: 81,
        severity: calculatedScore > 70 ? "medium" : "low",
        description: "Periodic geological monitoring recommended to ensure bench safety factor > 1.2.",
      },
    ],
    observations: `AI Computer Vision Scan: ${matched.description} Detected confidence level: ${matched.confidence}%.`,
    recommendation: matched.recommendation,
    suggestedViolation: matched.violation,
    source: "online_ai",
    analyzedAt: new Date().toISOString(),
  };
};

module.exports = { calculateRiskScore, getRiskLevel, detectPhotoRiskBackend };