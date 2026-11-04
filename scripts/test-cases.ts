import { classifyAndProcessCoachIntent } from '../lib/career-coach-engine';
import { ResumeData } from '../lib/types';

const mockResume: ResumeData = {
  id: 'resume_test_1',
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '555-0199',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexjohnson',
  title: 'Full Stack Engineer',
  summary: 'Experienced developer building web applications.',
  experience: [
    {
      id: 'exp1',
      role: 'Full Stack Engineer',
      company: 'TechCorp',
      startDate: '2022',
      endDate: 'Present',
      bullets: [
        'Built full stack application using React and Node.',
        'Managed PostgreSQL database schema and queries.'
      ]
    }
  ],
  education: [
    {
      institution: 'State University',
      degree: 'B.S. in Computer Science',
      year: '2022'
    }
  ],
  skills: [
    {
      category: 'Technical Skills',
      items: ['React.js', 'Node.js', 'HTML', 'CSS', 'JavaScript']
    }
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Course Platform',
      subtitle: 'React, Node',
      bullets: ['Made website for student course.']
    }
  ],
  achievements: []
};

const testCases = [
  {
    name: 'TEST 1: Add achievement section',
    input: 'Add achievement section',
    validate: (res: any) => res.intent === 'ADD_SECTION' && res.targetSection === 'achievements' && res.action === 'CREATE_SECTION'
  },
  {
    name: 'TEST 2: Got scholarship among 200000+ candidates',
    input: 'Got scholarship among 200000+ candidates',
    validate: (res: any) => (res.intent === 'ADD_ACHIEVEMENT' || res.intent === 'ADD_SECTION') &&
      res.suggestedContent.includes('200,000') &&
      !res.suggestedContent.includes('Rank 1') // zero hallucination
  },
  {
    name: 'TEST 3: Add Python and Java to skills',
    input: 'Add Python and Java to skills',
    validate: (res: any) => res.intent === 'ADD_SKILL' &&
      res.targetSection === 'skills' &&
      res.data?.skillsToAdd?.includes('Python') &&
      res.data?.skillsToAdd?.includes('Java')
  },
  {
    name: 'TEST 4: Add certifications section and AWS certification',
    input: 'Add certifications section and AWS certification',
    validate: (res: any) => res.targetSection === 'certifications' &&
      res.suggestedContent.toLowerCase().includes('aws')
  },
  {
    name: 'TEST 5: Improve my project description',
    input: 'Improve my project description',
    validate: (res: any) => res.intent === 'UPDATE_PROJECT' &&
      res.targetSection === 'projects' &&
      res.suggestedContent.length > 20
  },
  {
    name: 'TEST 6: Remove HTML from my skills',
    input: 'Remove HTML from my skills',
    validate: (res: any) => res.intent === 'REMOVE_SKILL' &&
      res.targetSection === 'skills' &&
      res.data?.skillsToRemove?.some((s: string) => s.toLowerCase() === 'html')
  },
  {
    name: 'TEST 7: Add achievement section and mention my hackathon participation',
    input: 'Add achievement section and mention my hackathon participation',
    validate: (res: any) => (res.intent === 'ADD_ACHIEVEMENT' || res.intent === 'ADD_SECTION') &&
      res.targetSection === 'achievements' &&
      res.suggestedContent.toLowerCase().includes('hackathon')
  },
  {
    name: 'TEST 8: I received a scholarship (Zero hallucination)',
    input: 'I received a scholarship',
    validate: (res: any) => (res.intent === 'ADD_ACHIEVEMENT' || res.targetSection === 'scholarships' || res.targetSection === 'achievements') &&
      !res.suggestedContent.includes('200,000') && // must NOT invent numbers
      !res.suggestedContent.includes('$') // must NOT invent dollar amounts
  },
  {
    name: 'TEST 9: Make my summary more professional',
    input: 'Make my summary more professional',
    validate: (res: any) => res.intent === 'UPDATE_SUMMARY' &&
      res.targetSection === 'summary' &&
      res.suggestedContent.length > 30
  },
  {
    name: 'TEST 10: Add another achievement (appends without duplicate section)',
    input: 'Add another achievement',
    validate: (res: any) => res.intent === 'ADD_ACHIEVEMENT' &&
      res.targetSection === 'achievements'
  },
  {
    name: 'SPECIAL CRITICAL TEST: Add achievement section got scholarships across 200000+ candidates (Must NOT classify as skill)',
    input: 'Add achievement section got scholarships across 200000+ candidates',
    validate: (res: any) => res.intent !== 'ADD_SKILL' &&
      res.targetSection === 'achievements' &&
      res.suggestedContent.includes('200,000')
  }
];

let allPassed = true;
console.log('====================================================');
console.log('RUNNING ATSecure MASTER PROMPT INTENT & REWRITE TESTS');
console.log('====================================================\n');

for (const tc of testCases) {
  const result = classifyAndProcessCoachIntent(tc.input, mockResume);
  const passed = tc.validate(result);
  if (!passed) allPassed = false;

  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${tc.name}`);
  console.log(`   Input: "${tc.input}"`);
  console.log(`   Intent: ${result.intent}`);
  console.log(`   Action: ${result.action}`);
  console.log(`   Target Section: ${result.targetSection} (${result.sectionTitle})`);
  console.log(`   Suggested Content: "${result.suggestedContent}"`);
  if (result.data) console.log(`   Data:`, JSON.stringify(result.data));
  console.log('----------------------------------------------------');
}

console.log(`\nOVERALL RESULT: ${allPassed ? 'ALL TESTS PASSED! 🎉' : 'SOME TESTS FAILED! ❌'}`);
process.exit(allPassed ? 0 : 1);
