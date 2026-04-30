import * as pdfjsLib from 'pdfjs-dist';
import type { Candidate } from './data';

// Set up the PDF.js worker using Vite's asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/* ──────────── Text extraction ──────────── */

async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lineText = content.items.map((item: any) => item.str).join(' ');
    pages.push(lineText);
  }
  return pages.join('\n');
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

export async function extractText(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await extractPdfText(file);
    }
    if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      return await extractDocxText(file);
    }
  } catch {
    // Fall back to filename-based parsing
  }
  return '';
}

/* ──────────── Skills pool ──────────── */

const ALL_SKILLS = [
  'Python', 'TensorFlow', 'PyTorch', 'LLMs', 'RAG', 'Vector Databases', 'LangChain',
  'Pandas', 'NumPy', 'Scikit-Learn', 'FastAPI', 'Docker', 'Kubernetes',
  'SQL', 'MongoDB', 'ElasticSearch', 'Azure', 'AWS', 'Google Cloud',
  'NLP', 'Computer Vision', 'Reinforcement Learning', 'Spark', 'Kafka',
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'Go', 'C++', 'Java',
  'Django', 'Flask', 'Spring', 'Redis', 'PostgreSQL', 'MySQL', 'GraphQL',
  'Machine Learning', 'Deep Learning', 'Data Science', 'MLOps', 'CI/CD', 'Git',
  'Hugging Face', 'OpenAI', 'Transformers', 'BERT', 'GPT', 'Stable Diffusion',
  'Power BI', 'Tableau', 'Excel', 'R', 'Scala', 'MATLAB',
];

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchSkills(text: string): string[] {
  return ALL_SKILLS.filter(skill =>
    new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i').test(text)
  );
}

/* ──────────── Name extraction ──────────── */

function extractName(text: string, filename: string): string {
  const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 1);
  // First line that looks like "Firstname Lastname" (2–4 capitalized words, no digits)
  for (const line of lines.slice(0, 8)) {
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every(w => /^[A-Z][a-zA-Z'-]{1,}$/.test(w)) &&
      !/\d/.test(line) &&
      line.length < 50
    ) {
      return line;
    }
  }
  // Fallback: derive from filename
  return filename
    .replace(/\.(pdf|docx?)$/i, '')
    .replace(/[_\-\.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/* ──────────── Experience extraction ──────────── */

function extractYearsOfExperience(text: string): number {
  // Patterns like "5 years", "5+ years of experience", "7 yrs"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi,
    /(?:experience|exp)[^\d]*(\d+)\+?\s*(?:years?|yrs?)/gi,
  ];
  const nums: number[] = [];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const n = parseInt(m[1]);
      if (n > 0 && n < 50) nums.push(n);
    }
  }
  if (nums.length) return Math.max(...nums);

  // Count year ranges in work history: "2018 – 2023" → 5 years
  const yearRanges = [...text.matchAll(/\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/gi)];
  if (yearRanges.length) {
    const currentYear = new Date().getFullYear();
    let total = 0;
    for (const r of yearRanges) {
      const start = parseInt(r[1]);
      const endStr = r[2].toLowerCase();
      const end = /present|current/.test(endStr) ? currentYear : parseInt(r[2]);
      total += end - start;
    }
    if (total > 0) return Math.min(total, 30);
  }

  return 2; // Default
}

/* ──────────── Education extraction ──────────── */

function extractEducation(text: string): string {
  if (/ph\.?\s*d|doctorate/i.test(text)) return 'Ph.D. in Computer Science';
  if (/m\.?\s*tech|master|m\.?\s*sc|mba|m\.?\s*eng/i.test(text)) return 'M.Sc. in Data Science';
  if (/b\.?\s*tech|bachelor|b\.?\s*sc|b\.?\s*eng/i.test(text)) return 'B.Sc. in Computer Science';
  return 'Diploma / Other';
}

function educationScore(edu: string): number {
  if (edu.startsWith('Ph.D')) return 95;
  if (edu.startsWith('M.Sc')) return 80;
  if (edu.startsWith('B.Sc')) return 65;
  return 45;
}

/* ──────────── Certifications extraction ──────────── */

const CERT_KEYWORDS = [
  'AWS Certified', 'Google Cloud', 'Azure', 'TensorFlow Developer',
  'Certified Kubernetes', 'CKA', 'PMP', 'Scrum', 'CISSP', 'CompTIA',
];

function extractCertifications(text: string): string[] {
  return CERT_KEYWORDS.filter(c => new RegExp(escapeRegex(c), 'i').test(text));
}

/* ──────────── Document Validation ──────────── */

function validateDocument(text: string): { isLikelyResume: boolean; missingSections: string[] } {
  const sections = {
    Experience: /experience|work history|employment|career/i,
    Education: /education|academic|university|college|degree/i,
    Skills: /skills|technologies|stack|competencies/i,
    Contact: /contact|email|phone|address|linkedin/i,
  };

  const missingSections = Object.entries(sections)
    .filter(([_, regex]) => !regex.test(text))
    .map(([name]) => name);

  return {
    isLikelyResume: missingSections.length <= 1, // Allow 1 missing section
    missingSections,
  };
}

/* ──────────── Main parse function ──────────── */

export interface ParsedJobDesc {
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: string;
}

export function parseCandidate(
  text: string,
  id: number,
  filename: string,
  jobDesc: ParsedJobDesc
): Candidate {
  const name = extractName(text, filename);
  const yearsOfExperience = extractYearsOfExperience(text);
  const skills = matchSkills(text);
  const education = extractEducation(text);
  const certifications = extractCertifications(text);
  const { isLikelyResume, missingSections } = validateDocument(text);

  // Scoring
  const allJobSkills = [...jobDesc.requiredSkills, ...jobDesc.preferredSkills];
  const matchedRequired = skills.filter(s =>
    jobDesc.requiredSkills.some(r => r.toLowerCase() === s.toLowerCase())
  ).length;
  const matchedPreferred = skills.filter(s =>
    jobDesc.preferredSkills.some(r => r.toLowerCase() === s.toLowerCase())
  ).length;

  const relevanceScore = Math.min(
    ((matchedRequired * 2 + matchedPreferred) / Math.max(allJobSkills.length, 1)) * 100,
    100
  );

  // Min experience from job desc e.g. "5+ years" → 5
  const minExp = parseInt(jobDesc.experienceRequired.match(/\d+/)?.[0] || '3');
  const experienceScore = Math.min((yearsOfExperience / (minExp * 2)) * 100, 100);

  const eduScore = educationScore(education);

  // Soft indicators from text
  const leadershipKeywords = /lead|managed|mentored|directed|headed/i.test(text);
  const achievementKeywords = /improved|reduced|increased|launched|delivered|built/i.test(text);
  const softSkillsScore = (leadershipKeywords ? 75 : 55) + (achievementKeywords ? 15 : 0);
  const achievementsScore = achievementKeywords ? 78 : 62;

  const totalScore = Math.round(
    relevanceScore * 0.4 +
    experienceScore * 0.25 +
    achievementsScore * 0.15 +
    eduScore * 0.1 +
    softSkillsScore * 0.1
  );

  let category: Candidate['category'] = '⚠ Bottom 10';
  if (totalScore > 85) category = '⭐ Top 10';
  else if (totalScore > 70) category = '👍 Next 15';
  else if (totalScore > 50) category = '🤝 Middle 15';

  const displaySkills = skills.length > 0 ? skills : ['General Skills'];
  const standoutStrengths: string[] = [];
  if (matchedRequired > 0) standoutStrengths.push(`${matchedRequired} required skill${matchedRequired > 1 ? 's' : ''} matched`);
  if (yearsOfExperience >= minExp) standoutStrengths.push(`${yearsOfExperience} years of experience`);
  if (certifications.length) standoutStrengths.push(certifications[0]);
  if (!standoutStrengths.length) standoutStrengths.push('Strong technical background');

  const potentialConcerns: string[] = [];
  if (matchedRequired === 0) potentialConcerns.push('No required skills matched');
  if (yearsOfExperience < minExp) potentialConcerns.push(`Only ${yearsOfExperience} yrs (min ${minExp} required)`);
  if (!isLikelyResume) {
    potentialConcerns.push(`Irrelevant Doc: Missing ${missingSections.join(', ')}`);
  }

  const justification = isLikelyResume 
    ? `${name} has ${yearsOfExperience} yrs of experience with ${displaySkills.slice(0, 3).join(', ')} skills. Relevance: ${Math.round(relevanceScore)}%.`
    : `⚠️ DOCUMENT WARNING: This file appears to be a ${filename.includes('report') ? 'project report' : 'non-resume'} (Missing sections: ${missingSections.join(', ')}). Analysis may be inaccurate.`;

  return {
    id: `CAND-${id.toString().padStart(3, '0')}`,
    name,
    yearsOfExperience,
    skills: displaySkills,
    education,
    certifications,
    achievements: achievementKeywords ? ['Demonstrated measurable impact'] : [],
    softSkills: leadershipKeywords ? ['Leadership', 'Team Management'] : ['Collaboration'],
    roleConsistency: isLikelyResume ? 'Analyzed' : 'Uncertain (Non-Resume Doc)',
    relevanceScore: Math.round(relevanceScore),
    experienceScore: Math.round(experienceScore),
    achievementsScore,
    educationScore: eduScore,
    softSkillsScore,
    totalScore: isLikelyResume ? totalScore : Math.min(totalScore, 30), // Penalize non-resumes
    justification,
    category: isLikelyResume ? category : '⚠ Bottom 10',
    standoutStrengths,
    potentialConcerns,
    isLikelyResume,
  };
}
