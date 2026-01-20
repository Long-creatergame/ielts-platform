export type RiskLevel = "low" | "medium" | "high";

export function computeMockVsRealRisk(input: { confidence?: number; templateRisk?: number; wordCount?: number }): RiskLevel {
  const confidence = typeof input.confidence === "number" ? input.confidence : 0.65;
  const templateRisk = typeof input.templateRisk === "number" ? input.templateRisk : 0;
  const wordCount = typeof input.wordCount === "number" ? input.wordCount : undefined;

  let score = 0;
  // Lower confidence => higher risk
  score += (1 - confidence) * 1.4;
  // Template-like writing => higher risk
  score += templateRisk * 1.2;
  // Very short responses => higher risk
  if (wordCount !== undefined && wordCount < 220) score += 0.6;

  if (score >= 1.3) return "high";
  if (score >= 0.7) return "medium";
  return "low";
}

export function riskBadge(level: RiskLevel): { label: string; className: string } {
  if (level === "high") return { label: "HIGH RISK", className: "bg-red-600 text-white" };
  if (level === "medium") return { label: "MEDIUM RISK", className: "bg-amber-500 text-black" };
  return { label: "LOW RISK", className: "bg-emerald-600 text-white" };
}

