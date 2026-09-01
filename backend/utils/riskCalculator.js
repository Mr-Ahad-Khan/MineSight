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

module.exports = { calculateRiskScore, getRiskLevel };