/**
 * Rule-based resume analysis engine.
 * No external AI API needed – everything runs locally.
 */

// ---------- Skill database ----------
const SKILLS = {
  Languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang', 'rust',
    'php', 'ruby', 'kotlin', 'swift', 'scala', 'r', 'sql', 'bash', 'dart',
  ],
  Frontend: [
    'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'angular', 'vue', 'vue.js', 'svelte',
    'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'redux', 'jquery', 'webpack', 'vite',
    'material ui', 'framer motion',
  ],
  Backend: [
    'node.js', 'nodejs', 'node', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring',
    'spring boot', 'laravel', 'nestjs', 'graphql', 'rest', 'restful', 'rest api', 'microservices',
    'websocket', 'socket.io', 'jwt',
  ],
  Database: [
    'mongodb', 'mongoose', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'firebase',
    'dynamodb', 'oracle', 'cassandra', 'elasticsearch', 'prisma',
  ],
  'DevOps & Cloud': [
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform',
    'nginx', 'linux', 'github actions', 'heroku', 'vercel', 'netlify',
  ],
  'Data & AI': [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
    'nlp', 'computer vision', 'power bi', 'tableau', 'data analysis', 'opencv', 'langchain',
  ],
  'Tools & Practices': [
    'git', 'github', 'gitlab', 'jira', 'postman', 'figma', 'agile', 'scrum', 'tdd', 'jest',
    'mocha', 'cypress', 'selenium', 'unit testing', 'oop', 'dsa', 'data structures', 'algorithms',
    'system design',
  ],
  'Soft Skills': [
    'leadership', 'communication', 'teamwork', 'problem solving', 'collaboration', 'mentoring',
    'time management', 'critical thinking', 'adaptability',
  ],
};

// Build a flat lookup: skill -> category
const SKILL_LOOKUP = {};
Object.entries(SKILLS).forEach(([cat, list]) => list.forEach((s) => (SKILL_LOOKUP[s] = cat)));

// Aliases so "reactjs" and "react" count as one skill on display
const CANONICAL = {
  'react.js': 'react', reactjs: 'react', nextjs: 'next.js', 'vue.js': 'vue',
  nodejs: 'node.js', node: 'node.js', 'express.js': 'express', golang: 'go',
  postgres: 'postgresql', restful: 'rest', 'rest api': 'rest', 'data structures': 'dsa',
};

// ---------- Section detection ----------
const SECTION_PATTERNS = {
  Summary: /\b(summary|objective|profile|about me|professional summary)\b/i,
  Experience: /\b(experience|work history|employment|internship|internships)\b/i,
  Education: /\b(education|academic|qualification|degree)\b/i,
  Skills: /\b(skills|technical skills|technologies|tech stack|core competencies)\b/i,
  Projects: /\b(projects|personal projects|academic projects)\b/i,
  Certifications: /\b(certifications?|courses|licenses|achievements|awards)\b/i,
};
const REQUIRED_SECTIONS = ['Experience', 'Education', 'Skills', 'Projects'];

// ---------- Language quality ----------
const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'created', 'led', 'managed', 'optimized',
  'improved', 'increased', 'reduced', 'launched', 'delivered', 'automated', 'architected',
  'engineered', 'integrated', 'deployed', 'migrated', 'analyzed', 'collaborated', 'mentored',
  'achieved', 'streamlined', 'refactored', 'resolved', 'established', 'spearheaded', 'drove',
];

const WEAK_PHRASES = [
  'responsible for', 'worked on', 'helped with', 'duties included', 'tasked with',
  'assisted in', 'familiar with', 'hard working', 'team player', 'go-getter', 'detail oriented',
];

// ---------- Target roles (for role-fit scoring) ----------
const ROLES = {
  'Full Stack Developer': ['react', 'node.js', 'express', 'mongodb', 'javascript', 'html', 'css', 'rest', 'git', 'sql'],
  'Frontend Developer': ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'figma', 'git', 'next.js'],
  'Backend Developer': ['node.js', 'express', 'python', 'java', 'sql', 'mongodb', 'rest', 'docker', 'redis', 'microservices'],
  'Data Analyst': ['python', 'sql', 'pandas', 'numpy', 'tableau', 'power bi', 'data analysis', 'r'],
  'ML Engineer': ['python', 'machine learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'deep learning', 'nlp'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'linux', 'jenkins', 'bash', 'git'],
};

// ---------- Helpers ----------
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasTerm(text, term) {
  // Word-ish boundary that also works for terms like "c++", "node.js", "ci/cd"
  const re = new RegExp(`(^|[^a-z0-9+#])${escapeRegex(term)}(?![a-z0-9+#])`, 'i');
  return re.test(text);
}

function extractContact(text) {
  const email = (text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i) || [])[0] || '';
  const phone = (text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/) || [])[0] || '';
  const linkedin = (text.match(/linkedin\.com\/in\/[a-z0-9-_%]+/i) || [])[0] || '';
  const github = (text.match(/github\.com\/[a-z0-9-_]+/i) || [])[0] || '';
  return { email, phone: phone.trim(), linkedin, github };
}

function extractSkills(text) {
  const found = new Map(); // canonical -> category
  Object.keys(SKILL_LOOKUP).forEach((skill) => {
    if (hasTerm(text, skill)) {
      const canon = CANONICAL[skill] || skill;
      found.set(canon, SKILL_LOOKUP[skill]);
    }
  });
  // Single-letter languages (c, r, go) cause false positives – keep them only if listed in a skills-like context
  ['c', 'r', 'go'].forEach((k) => {
    if (found.has(k) && !/skills?[\s\S]{0,300}\b(c|r|go)\b/i.test(text)) found.delete(k);
  });
  return [...found.entries()].map(([name, category]) => ({ name, category }));
}

function groupByCategory(skills) {
  return skills.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s.name);
    return acc;
  }, {});
}

function detectSections(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const found = [];
  Object.entries(SECTION_PATTERNS).forEach(([name, re]) => {
    // A heading is a short line that matches the section pattern
    if (lines.some((l) => l.length <= 40 && re.test(l))) found.push(name);
  });
  const missing = REQUIRED_SECTIONS.filter((s) => !found.includes(s));
  return { found, missing };
}

function countActionVerbs(text) {
  const lower = text.toLowerCase();
  return ACTION_VERBS.reduce((n, v) => n + (lower.match(new RegExp(`\\b${v}\\b`, 'g')) || []).length, 0);
}

function countQuantified(text) {
  const matches = text.match(/\b\d+(\.\d+)?\s?(%|x|k|m|\+)|\$\s?\d+|₹\s?\d+|\b\d{2,}\s+(users|customers|requests|projects|members|clients|students)\b/gi);
  return matches ? matches.length : 0;
}

function findWeakPhrases(text) {
  const lower = text.toLowerCase();
  return WEAK_PHRASES.filter((p) => lower.includes(p));
}

// Pull meaningful keywords out of a job description
const STOP = new Set(('a an the and or of to in for with on at by from is are be as we you your our will this that ' +
  'it its their they them have has had can able must should strong good great excellent experience years year ' +
  'work working role job candidate team looking required preferred responsibilities requirements skills ' +
  'knowledge ability including etc plus using use new more other such').split(' '));

function jdKeywords(jd) {
  const lower = jd.toLowerCase();
  const kws = new Set();
  // 1) known skills mentioned in the JD
  Object.keys(SKILL_LOOKUP).forEach((s) => {
    if (s.length > 1 && hasTerm(lower, s)) kws.add(CANONICAL[s] || s);
  });
  // 2) frequent meaningful words
  const freq = {};
  (lower.match(/[a-z][a-z+#.]{2,}/g) || []).forEach((w) => {
    if (!STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .forEach(([w]) => kws.add(w));
  return [...kws];
}

// ---------- Main ----------
function analyzeResume(rawText, { targetRole = '', jobDescription = '' } = {}) {
  const text = rawText.replace(/\r/g, '');
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const contact = extractContact(text);
  const skills = extractSkills(lower);
  const skillsByCategory = groupByCategory(skills);
  const { found: sectionsFound, missing: sectionsMissing } = detectSections(text);
  const actionVerbCount = countActionVerbs(text);
  const quantifiedCount = countQuantified(text);
  const weakPhrases = findWeakPhrases(text);

  // ----- sub-scores -----
  let contactScore = 0;
  if (contact.email) contactScore += 40;
  if (contact.phone) contactScore += 25;
  if (contact.linkedin) contactScore += 20;
  if (contact.github) contactScore += 15;

  const sectionScore = clamp((sectionsFound.filter((s) => REQUIRED_SECTIONS.includes(s)).length / REQUIRED_SECTIONS.length) * 85 +
    (sectionsFound.includes('Summary') ? 8 : 0) + (sectionsFound.includes('Certifications') ? 7 : 0));

  const technical = skills.filter((s) => s.category !== 'Soft Skills').length;
  const skillScore = clamp((technical / 14) * 100);

  const impactScore = clamp(
    Math.min(actionVerbCount / 10, 1) * 55 + Math.min(quantifiedCount / 5, 1) * 45 - weakPhrases.length * 5
  );

  let readability = 100;
  if (wordCount < 250) readability -= 35;
  else if (wordCount < 350) readability -= 15;
  if (wordCount > 1000) readability -= 25;
  else if (wordCount > 800) readability -= 10;
  readability -= weakPhrases.length * 4;
  readability = clamp(readability);

  const scores = { contact: contactScore, sections: sectionScore, skills: skillScore, impact: impactScore, readability };

  // ----- ATS score (formatting / parseability / keyword readiness) -----
  let atsScore = clamp(contactScore * 0.25 + sectionScore * 0.3 + skillScore * 0.25 + readability * 0.2);

  // ----- Job description match -----
  let jdMatchScore = null;
  let matchedKeywords = [];
  let missingKeywords = [];
  if (jobDescription && jobDescription.trim().length > 30) {
    const kws = jdKeywords(jobDescription);
    matchedKeywords = kws.filter((k) => hasTerm(lower, k));
    missingKeywords = kws.filter((k) => !hasTerm(lower, k));
    jdMatchScore = kws.length ? clamp((matchedKeywords.length / kws.length) * 100) : null;
  }

  // ----- Role fit -----
  const skillNames = new Set(skills.map((s) => s.name));
  const roleFit = Object.entries(ROLES)
    .map(([role, req]) => ({
      role,
      score: clamp((req.filter((r) => skillNames.has(CANONICAL[r] || r)).length / req.length) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  // ----- Overall -----
  const parts = [
    [scores.contact, 0.1],
    [scores.sections, 0.2],
    [scores.skills, 0.25],
    [scores.impact, 0.25],
    [scores.readability, 0.2],
  ];
  let overallScore = parts.reduce((sum, [v, w]) => sum + v * w, 0);
  if (jdMatchScore !== null) overallScore = overallScore * 0.75 + jdMatchScore * 0.25;
  overallScore = clamp(overallScore);

  // ----- Suggestions -----
  const suggestions = [];
  const add = (type, textMsg) => suggestions.push({ type, text: textMsg });

  if (!contact.email) add('critical', 'No email address detected. Recruiters and ATS systems need a clear email at the top.');
  if (!contact.phone) add('warning', 'Add a phone number so recruiters can reach you quickly.');
  if (!contact.linkedin) add('tip', 'Add your LinkedIn URL (linkedin.com/in/yourname) to build credibility.');
  if (!contact.github && technical > 0) add('tip', 'Add your GitHub link – it lets recruiters verify your code and projects.');

  sectionsMissing.forEach((s) => add('critical', `Missing "${s}" section. Add a clearly labelled "${s}" heading so ATS can parse it.`));
  if (!sectionsFound.includes('Summary')) add('tip', 'Add a 2–3 line professional summary highlighting your strongest skills and goal.');

  if (technical < 8) add('warning', `Only ${technical} technical skills detected. List more relevant tools, languages and frameworks.`);
  if (quantifiedCount < 3) add('warning', `Only ${quantifiedCount} quantified achievements found. Add numbers, e.g. "Reduced API latency by 40%" or "Served 2,000+ users".`);
  if (actionVerbCount < 6) add('warning', 'Start bullet points with strong action verbs such as Built, Optimized, Led, Designed, Deployed.');
  if (weakPhrases.length) add('warning', `Replace weak phrases (${weakPhrases.slice(0, 4).map((p) => `"${p}"`).join(', ')}) with specific accomplishments.`);

  if (wordCount < 250) add('warning', `Resume is quite short (${wordCount} words). Expand projects and experience with more detail.`);
  if (wordCount > 900) add('warning', `Resume is long (${wordCount} words). Aim for 1 page (fresher) or 2 pages (experienced).`);

  if (missingKeywords.length) {
    add('critical', `Add these job-description keywords if you genuinely have them: ${missingKeywords.slice(0, 8).join(', ')}.`);
  }
  if (targetRole && ROLES[targetRole]) {
    const need = ROLES[targetRole].filter((r) => !skillNames.has(CANONICAL[r] || r));
    if (need.length) add('tip', `For "${targetRole}" roles, consider adding: ${need.slice(0, 6).join(', ')}.`);
  }
  if (overallScore >= 80) add('success', 'Great job! Your resume is strong. Tailor it to each job description for the best results.');

  const order = { critical: 0, warning: 1, tip: 2, success: 3 };
  suggestions.sort((a, b) => order[a.type] - order[b.type]);

  return {
    wordCount,
    overallScore,
    atsScore,
    scores,
    contact,
    sectionsFound,
    sectionsMissing,
    skills,
    skillsByCategory,
    matchedKeywords,
    missingKeywords,
    jdMatchScore,
    actionVerbCount,
    quantifiedCount,
    weakPhrases,
    suggestions,
    roleFit,
  };
}

module.exports = { analyzeResume, ROLES: Object.keys(ROLES) };
