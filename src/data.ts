export type Candidate = {
  id: string;
  name: string;
  yearsOfExperience: number;
  skills: string[];
  education: string;
  certifications: string[];
  achievements: string[];
  softSkills: string[];
  roleConsistency: string;
  relevanceScore: number;
  experienceScore: number;
  achievementsScore: number;
  educationScore: number;
  softSkillsScore: number;
  totalScore: number;
  justification: string;
  category: "⭐ Top 10" | "👍 Next 15" | "🤝 Middle 15" | "⚠ Bottom 10";
  standoutStrengths: string[];
  potentialConcerns: string[];
  isLikelyResume: boolean;
};

export const jobDescription = {
  role: "Lead AI Engineer",
  experienceRequired: "5+ years",
  requiredSkills: ["Python", "TensorFlow", "PyTorch", "LLMs", "RAG", "Vector Databases", "LangChain"],
  preferredSkills: ["React", "FastAPI", "Docker", "Kubernetes", "AWS/Azure", "Cloud Infrastructure"],
  qualifications: "Master's or Ph.D. in Computer Science, Data Science, or related field.",
  certifications: ["TensorFlow Developer", "AWS Certified Machine Learning - Specialty"],
  softSkills: ["Team Leadership", "Problem-solving", "Strategic Thinking", "Collaboration"],
  weighting: {
    skills: 0.4,
    experience: 0.25,
    achievements: 0.15,
    education: 0.1,
    softSkills: 0.1
  }
};

const generateRandomSkill = (skills: string[]) => skills[Math.floor(Math.random() * skills.length)];

const technicalSkillsPool = [
  "Python", "TensorFlow", "PyTorch", "LLMs", "RAG", "Vector Databases", "LangChain", 
  "Pandas", "NumPy", "Scikit-Learn", "FastAPI", "Docker", "Kubernetes", 
  "SQL", "MongoDB", "ElasticSearch", "Azure", "AWS", "Google Cloud", 
  "NLP", "Computer Vision", "Reinforcement Learning", "Spark", "Kafka",
  "React", "Node.js", "TypeScript", "JavaScript", "Go", "C++", "Java"
];

const names = [
  "Alice Thompson", "Bob Richards", "Charlie Davis", "Diana Green", "Ethan Carter", 
  "Fiona Ward", "George Miller", "Hannah Brooks", "Ian Black", "Julia Roberts",
  "Kevin White", "Laura King", "Michael Scott", "Natalie Portman", "Oscar Wilde", 
  "Paula Dean", "Quirky Quill", "Ryan Reynolds", "Sarah Connor", "Thomas Anderson",
  "Ursula K. Le Guin", "Victor Hugo", "William Shakespeare", "Xena Warrior", "Yara Greyjoy", 
  "Zeke Smith", "Adrian Monk", "Brendon Burchard", "Catherine Zeta-Jones", "David Beckham",
  "Emma Watson", "Frank Sinatra", "Grace Hopper", "Harry Potter", "Iris West", 
  "Jack Sparrow", "Katherine Heigl", "Leo Messi", "Mona Lisa", "Noah Ark", 
  "Oprah Winfrey", "Peter Parker", "Queen Elizabeth", "Ronald McDonald", "Steve Jobs", 
  "Tim Cook", "Uma Thurman", "Voldemort Riddle", "Walt Disney", "Zoe Saldana"
];

const generateCandidate = (id: number, name: string): Candidate => {
  const yearsOfExperience = Math.floor(Math.random() * 15) + 1;
  const numSkills = Math.floor(Math.random() * 10) + 5;
  const skills = Array.from({ length: numSkills }, () => generateRandomSkill(technicalSkillsPool));
  
  // Scoring logic
  const skillMatchCount = skills.filter(skill => jobDescription.requiredSkills.includes(skill) || jobDescription.preferredSkills.includes(skill)).length;
  const relevanceScore = Math.min((skillMatchCount / 7) * 100, 100);
  const experienceScore = Math.min((yearsOfExperience / 10) * 100, 100);
  const achievementsScore = Math.floor(Math.random() * 41) + 60; // Random 60-100
  const educationScore = Math.floor(Math.random() * 51) + 40; // Random 40-90
  const softSkillsScore = Math.floor(Math.random() * 41) + 60; // Random 60-100
  
  const totalScore = Math.round(
    (relevanceScore * 0.4) + 
    (experienceScore * 0.25) + 
    (achievementsScore * 0.15) + 
    (educationScore * 0.1) + 
    (softSkillsScore * 0.1)
  );

  let category: Candidate["category"] = "⚠ Bottom 10";
  if (totalScore > 85) category = "⭐ Top 10";
  else if (totalScore > 70) category = "👍 Next 15";
  else if (totalScore > 50) category = "🤝 Middle 15";

  return {
    id: `CAND-${id.toString().padStart(3, '0')}`,
    name,
    yearsOfExperience,
    skills,
    education: id % 3 === 0 ? "Ph.D. in Computer Science" : "M.Sc. in Data Science",
    certifications: ["AWS Machine Learning Specialist"],
    achievements: ["Reduced training cost by 30%", "Implemented real-time RAG pipeline"],
    softSkills: ["Problem-solving", "Collaboration"],
    roleConsistency: "High",
    relevanceScore,
    experienceScore,
    achievementsScore,
    educationScore,
    softSkillsScore,
    totalScore,
    justification: `Candidate ${name} shows a strong command over ${skills.slice(0, 3).join(", ")} with ${yearsOfExperience} years of experience in AI.`,
    category,
    standoutStrengths: ["Strong technical background", "Relevant domain experience"],
    potentialConcerns: id % 10 === 0 ? ["Minimal cloud experience"] : [],
    isLikelyResume: true
  };
};

export const candidates: Candidate[] = names.map((name, index) => generateCandidate(index + 1, name))
  .sort((a, b) => b.totalScore - a.totalScore)
  .map((c, idx) => {
    // Re-assign categories correctly based on ranking
    if (idx < 10) return { ...c, category: "⭐ Top 10" };
    if (idx < 25) return { ...c, category: "👍 Next 15" };
    if (idx < 40) return { ...c, category: "🤝 Middle 15" };
    return { ...c, category: "⚠ Bottom 10" };
  });
