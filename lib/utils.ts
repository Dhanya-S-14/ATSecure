import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ResumeData, JobApplication, CoverLetter } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INITIAL_RESUME: ResumeData = {
  id: 'res_default',
  title: 'Senior Software Engineer Resume',
  fullName: 'Alex Vance',
  email: 'alex.vance@techdev.io',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexvance-dev',
  github: 'github.com/alexvance',
  summary: 'Results-driven Senior Software Engineer with 6+ years of experience building high-scale cloud platforms, distributed microservices, and modern React web applications. Proven track record in optimizing system architecture, leading cross-functional engineering teams, and increasing API throughput by 45%.',
  experience: [
    {
      id: 'exp_1',
      company: 'Apex Cloud Systems',
      role: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      startDate: '2022 - Present',
      endDate: 'Present',
      bullets: [
        'Architected real-time analytics pipeline using Node.js, Next.js, and PostgreSQL processing 10M+ daily events.',
        'Led migration of monolithic application to AWS Lambda microservices, reducing infrastructure overhead costs by 32%.',
        'Implemented strict CI/CD workflow with GitHub Actions and Docker, reducing deployment cycle times from 2 hours to 15 minutes.'
      ]
    },
    {
      id: 'exp_2',
      company: 'DataPulse Technologies',
      role: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: '2019 - 2022',
      endDate: '2022',
      bullets: [
        'Developed interactive React frontend dashboard with TypeScript and Tailwind CSS used by 50,000+ monthly active users.',
        'Designed GraphQL & REST API endpoints, improving frontend client response latency by 200ms.',
        'Collaborated with product designers to implement responsive, accessible UI components following WCAG 2.1 guidelines.'
      ]
    }
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      year: '2015 - 2019'
    }
  ],
  skills: [
    {
      category: 'Languages & Tools',
      items: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL', 'HTML5/CSS3', 'Git']
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux / Zustand', 'Prisma']
    },
    {
      category: 'Cloud & Database',
      items: ['PostgreSQL', 'Supabase', 'AWS (S3, Lambda)', 'Docker', 'Redis', 'GraphQL']
    }
  ],
  ats_score: 86,
  created_at: '2026-10-01'
};

export const SAMPLE_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_1',
    user_id: 'usr_1',
    company: 'Stripe',
    role: 'Senior Staff Frontend Engineer',
    location: 'Remote',
    salary: '$185,000 - $210,000',
    job_description: 'Looking for a Senior Frontend Engineer to build robust payment web interfaces using React, TypeScript, GraphQL, Next.js, and Tailwind CSS. Experience with micro-frontends and high reliability systems is required.',
    status: 'Interviewing',
    applied_date: '2026-10-02',
    ats_score: 91,
    match_keywords: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Tailwind CSS'],
    missing_keywords: ['Micro-frontends', 'System Architecture'],
    notes: 'Technical Interview scheduled for Oct 12.'
  },
  {
    id: 'app_2',
    user_id: 'usr_1',
    company: 'Vercel',
    role: 'Full Stack AI Product Engineer',
    location: 'San Francisco, CA',
    salary: '$170,000 - $195,000',
    job_description: 'Join Vercel to craft the future of AI SDKs and web infrastructure. We need experts in Next.js App Router, Server Actions, OpenAI API, Supabase, and TypeScript.',
    status: 'Applied',
    applied_date: '2026-10-04',
    ats_score: 88,
    match_keywords: ['Next.js', 'TypeScript', 'Supabase', 'React'],
    missing_keywords: ['OpenAI API', 'Server Actions', 'AI SDK'],
    notes: 'Submitted via company career portal.'
  },
  {
    id: 'app_3',
    user_id: 'usr_1',
    company: 'Datadog',
    role: 'Senior Software Engineer - UI Systems',
    location: 'New York, NY (Hybrid)',
    salary: '$180,000 - $205,000',
    job_description: 'Seeking a Senior Frontend Engineer with deep expertise in performance optimization, canvas rendering, TypeScript, and distributed monitoring metrics.',
    status: 'Draft',
    applied_date: '2026-10-06',
    ats_score: 74,
    match_keywords: ['TypeScript', 'React', 'Performance'],
    missing_keywords: ['Canvas API', 'Webpack Plugins', 'Prometheus', 'Monitoring Metrics'],
    notes: 'Need to tailor resume bullets for canvas rendering.'
  },
  {
    id: 'app_4',
    user_id: 'usr_1',
    company: 'Figma',
    role: 'Lead Application Engineer',
    location: 'San Francisco, CA',
    salary: '$190,000 - $220,000',
    job_description: 'Engineers who love complex state management, WebAssembly, WebGL, C++, and React.',
    status: 'Offer',
    applied_date: '2026-09-18',
    ats_score: 95,
    match_keywords: ['React', 'TypeScript', 'State Management'],
    missing_keywords: ['WebAssembly', 'C++'],
    notes: 'Offer letter received! Reviewing compensation package.'
  }
];

export const INITIAL_COVER_LETTER: CoverLetter = {
  id: 'cl_1',
  application_id: 'app_2',
  company: 'Vercel',
  role: 'Full Stack AI Product Engineer',
  content: `Dear Hiring Team at Vercel,

I am writing to express my strong enthusiasm for the Full Stack AI Product Engineer position at Vercel. Having spent the past 6+ years designing scalable cloud solutions and modern web applications with Next.js, TypeScript, and React, I have consistently watched Vercel set the gold standard for web development and developer experience.

In my recent role at Apex Cloud Systems, I architected real-time data pipelines and engineered cloud microservices that processed over 10M daily events while reducing server overhead costs by 32%. My hands-on work with Next.js App Router, state-driven frontends, and RESTful/GraphQL backend services aligns directly with Vercel's vision for seamless web app delivery.

Furthermore, I have actively integrated AI capabilities and LLM API endpoints into product workflows to optimize client-side interactions and streamline content synthesis. Joining Vercel represents an exciting opportunity to apply my full-stack engineering expertise to advance your cutting-edge web infrastructure.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and passion for high-impact web products will contribute to Vercel's mission.

Sincerely,
Alex Vance`,
  created_at: '2026-10-04'
};
