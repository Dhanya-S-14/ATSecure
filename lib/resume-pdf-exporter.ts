import { jsPDF } from 'jspdf';
import { ResumeData } from './types';

/**
 * Downloads a pristine, ATS-compliant single-column PDF of the tailored resume.
 * Designed specifically for maximum parsing accuracy in Workday, Greenhouse, Lever, and Taleo.
 * Fully supports all standard and custom sections (Achievements, Certifications, Awards, Scholarships, Projects, etc.).
 */
export function downloadTailoredResumePdf(resume: ResumeData): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter' // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  };

  // Helper for section divider
  const renderSectionHeader = (title: string) => {
    checkPageBreak(35);
    cursorY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text(title.toUpperCase(), margin, cursorY);
    cursorY += 4;
    doc.setDrawColor(200, 200, 205);
    doc.setLineWidth(0.75);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 13;
  };

  // Helper for bullet list
  const renderBulletsList = (bullets: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    for (const bullet of bullets) {
      if (!bullet || !bullet.trim()) continue;
      checkPageBreak(18);
      const bulletIndent = 12;
      const textWidth = contentWidth - bulletIndent;
      const splitLines = doc.splitTextToSize(bullet.trim(), textWidth);

      doc.text('•', margin + 2, cursorY);

      for (let lIdx = 0; lIdx < splitLines.length; lIdx++) {
        if (lIdx > 0) checkPageBreak(12);
        doc.text(splitLines[lIdx], margin + bulletIndent, cursorY);
        cursorY += 12;
      }
      cursorY += 3;
    }
    cursorY += 3;
  };

  // --- 1. HEADER (Candidate Contact & Identity) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(resume.fullName || 'Candidate', margin, cursorY);
  cursorY += 16;

  if (resume.title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(37, 99, 235);
    doc.text(resume.title, margin, cursorY);
    cursorY += 14;
  }

  // Contact line
  const contactParts = [
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedin,
    resume.github
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    const contactLine = contactParts.join('  •  ');
    doc.text(contactLine, margin, cursorY);
    cursorY += 14;
  }

  // --- 2. PROFESSIONAL SUMMARY ---
  if (resume.summary && resume.summary.trim()) {
    renderSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);

    const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
    for (const line of summaryLines) {
      checkPageBreak(13);
      doc.text(line, margin, cursorY);
      cursorY += 13;
    }
  }

  // --- 3. WORK EXPERIENCE ---
  if (resume.experience && resume.experience.length > 0) {
    renderSectionHeader('Work Experience');

    for (const exp of resume.experience) {
      checkPageBreak(30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      const roleText = `${exp.role || 'Software Engineer'}`;
      doc.text(roleText, margin, cursorY);

      const roleWidth = doc.getTextWidth(roleText);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(` — ${exp.company || 'Enterprise'}`, margin + roleWidth, cursorY);

      if (exp.startDate) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        const dateText = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate;
        const dateWidth = doc.getTextWidth(dateText);
        doc.text(dateText, margin + contentWidth - dateWidth, cursorY);
      }
      cursorY += 13;

      if (exp.bullets && exp.bullets.length > 0) {
        renderBulletsList(exp.bullets);
      }
      cursorY += 4;
    }
  }

  // --- 4. TECHNICAL PROJECTS ---
  if (resume.projects && resume.projects.length > 0) {
    renderSectionHeader('Technical Projects');

    for (const proj of resume.projects) {
      checkPageBreak(25);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text(proj.title || 'Technical Project', margin, cursorY);

      if (proj.subtitle) {
        const titleWidth = doc.getTextWidth(proj.title || 'Technical Project');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(37, 99, 235);
        doc.text(` | ${proj.subtitle}`, margin + titleWidth, cursorY);
      }
      cursorY += 13;

      if (proj.bullets && proj.bullets.length > 0) {
        renderBulletsList(proj.bullets);
      }
      cursorY += 4;
    }
  }

  // --- 5. TECHNICAL SKILLS & TOOLS ---
  if (resume.skills && resume.skills.length > 0) {
    renderSectionHeader('Technical Skills & Tools');

    for (const cat of resume.skills) {
      if (!cat.items || cat.items.length === 0) continue;
      checkPageBreak(16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      const catLabel = `${cat.category}: `;
      doc.text(catLabel, margin, cursorY);

      const labelWidth = doc.getTextWidth(catLabel);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      const itemsText = cat.items.map(i => i.replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts')).join(', ');
      const skillLines = doc.splitTextToSize(itemsText, contentWidth - labelWidth);

      doc.text(skillLines[0] || '', margin + labelWidth, cursorY);
      cursorY += 12;

      for (let sIdx = 1; sIdx < skillLines.length; sIdx++) {
        checkPageBreak(12);
        doc.text(skillLines[sIdx], margin + labelWidth, cursorY);
        cursorY += 12;
      }
      cursorY += 2;
    }
  }

  // --- 6. KEY ACHIEVEMENTS ---
  if (resume.achievements && resume.achievements.length > 0) {
    renderSectionHeader('Key Achievements');
    renderBulletsList(resume.achievements);
  }

  // --- 7. LICENSES & CERTIFICATIONS ---
  if (resume.certifications && resume.certifications.length > 0) {
    renderSectionHeader('Licenses & Certifications');
    const certBullets = resume.certifications.map(c => c.year ? `${c.name} (${c.year})` : c.name);
    renderBulletsList(certBullets);
  }

  // --- 8. SCHOLARSHIPS & FELLOWSHIPS ---
  if (resume.scholarships && resume.scholarships.length > 0) {
    renderSectionHeader('Academic Scholarships & Fellowships');
    renderBulletsList(resume.scholarships);
  }

  // --- 9. HONORS & AWARDS ---
  if (resume.awards && resume.awards.length > 0) {
    renderSectionHeader('Honors & Awards');
    renderBulletsList(resume.awards);
  }

  // --- 10. LEADERSHIP & EXTRACURRICULAR ---
  if (resume.leadership && resume.leadership.length > 0) {
    renderSectionHeader('Leadership & Extracurricular');
    renderBulletsList(resume.leadership);
  }

  // --- 11. VOLUNTEER EXPERIENCE ---
  if (resume.volunteer && resume.volunteer.length > 0) {
    renderSectionHeader('Volunteer Experience');
    renderBulletsList(resume.volunteer);
  }

  // --- 12. PUBLICATIONS & RESEARCH ---
  if (resume.publications && resume.publications.length > 0) {
    renderSectionHeader('Publications & Research');
    const pubBullets = resume.publications.map(p => p.year ? `${p.title} (${p.year})` : p.title);
    renderBulletsList(pubBullets);
  }

  // --- 13. CUSTOM SECTIONS ---
  if (resume.customSections && resume.customSections.length > 0) {
    for (const sec of resume.customSections) {
      if (sec.items && sec.items.length > 0) {
        renderSectionHeader(sec.title);
        renderBulletsList(sec.items);
      }
    }
  }

  // --- 14. EDUCATION ---
  if (resume.education && resume.education.length > 0) {
    renderSectionHeader('Education');

    for (const edu of resume.education) {
      checkPageBreak(20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(edu.institution, margin, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const instWidth = doc.getTextWidth(edu.institution);
      doc.text(` — ${edu.degree}`, margin + instWidth, cursorY);

      if (edu.year) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        const yearWidth = doc.getTextWidth(edu.year);
        doc.text(edu.year, margin + contentWidth - yearWidth, cursorY);
      }
      cursorY += 14;
    }
  }

  // Generate clean filename
  const cleanName = (resume.fullName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${cleanName}_Tailored_Resume.pdf`;

  // Trigger instant browser download
  doc.save(fileName);
}

/**
 * Print Dialog Fallback: Opens a clean browser print preview
 * with strict ATS single-column printable styling for all sections.
 */
export function printTailoredResume(resume: ResumeData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    downloadTailoredResumePdf(resume);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${resume.fullName} - Tailored Resume</title>
  <style>
    @page { margin: 0.5in; size: letter; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      background: #ffffff;
      line-height: 1.4;
      font-size: 10pt;
      margin: 0;
      padding: 20px;
    }
    h1 { font-size: 18pt; margin: 0 0 2px 0; font-weight: bold; color: #111827; }
    .subtitle { font-size: 11pt; color: #2563eb; font-weight: bold; margin-bottom: 4px; }
    .contact { font-size: 9pt; color: #4b5563; margin-bottom: 12px; }
    .section-title {
      font-size: 10.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 14px 0 4px 0;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 2px;
      color: #111827;
    }
    .summary-text { font-size: 9.5pt; color: #374151; margin-bottom: 8px; }
    .job-header { display: flex; justify-content: space-between; font-size: 10pt; font-weight: bold; margin-top: 8px; }
    .job-company { font-weight: normal; color: #4b5563; }
    .job-date { font-size: 9pt; color: #6b7280; font-family: monospace; }
    ul { margin: 4px 0 8px 18px; padding: 0; }
    li { font-size: 9.5pt; color: #374151; margin-bottom: 3px; }
    .skills-row { font-size: 9pt; margin-bottom: 3px; }
    .skills-category { font-weight: bold; color: #111827; }
    .edu-item { display: flex; justify-content: space-between; font-size: 9.5pt; margin-bottom: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${resume.fullName}</h1>
  ${resume.title ? `<div class="subtitle">${resume.title}</div>` : ''}
  <div class="contact">
    ${[resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean).join('  •  ')}
  </div>

  ${resume.summary ? `
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${resume.summary}</div>
  ` : ''}

  ${resume.experience && resume.experience.length > 0 ? `
    <div class="section-title">Work Experience</div>
    ${resume.experience.map(exp => `
      <div class="job-header">
        <div><strong>${exp.role}</strong> <span class="job-company">— ${exp.company}</span></div>
        <div class="job-date">${exp.startDate || ''}</div>
      </div>
      <ul>
        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    `).join('')}
  ` : ''}

  ${resume.projects && resume.projects.length > 0 ? `
    <div class="section-title">Technical Projects</div>
    ${resume.projects.map(proj => `
      <div class="job-header">
        <div><strong>${proj.title}</strong> ${proj.subtitle ? `<span class="job-company">| ${proj.subtitle}</span>` : ''}</div>
      </div>
      <ul>
        ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    `).join('')}
  ` : ''}

  ${resume.skills && resume.skills.length > 0 ? `
    <div class="section-title">Technical Skills & Tools</div>
    ${resume.skills.map(s => `
      <div class="skills-row">
        <span class="skills-category">${s.category}:</span> ${s.items.map(i => i.replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts')).join(', ')}
      </div>
    `).join('')}
  ` : ''}

  ${resume.achievements && resume.achievements.length > 0 ? `
    <div class="section-title">Key Achievements</div>
    <ul>
      ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.certifications && resume.certifications.length > 0 ? `
    <div class="section-title">Licenses & Certifications</div>
    <ul>
      ${resume.certifications.map(c => `<li>${c.name} ${c.year ? `(${c.year})` : ''}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.scholarships && resume.scholarships.length > 0 ? `
    <div class="section-title">Academic Scholarships & Fellowships</div>
    <ul>
      ${resume.scholarships.map(s => `<li>${s}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.awards && resume.awards.length > 0 ? `
    <div class="section-title">Honors & Awards</div>
    <ul>
      ${resume.awards.map(aw => `<li>${aw}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.leadership && resume.leadership.length > 0 ? `
    <div class="section-title">Leadership & Extracurricular</div>
    <ul>
      ${resume.leadership.map(l => `<li>${l}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.volunteer && resume.volunteer.length > 0 ? `
    <div class="section-title">Volunteer Experience</div>
    <ul>
      ${resume.volunteer.map(v => `<li>${v}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.publications && resume.publications.length > 0 ? `
    <div class="section-title">Publications & Research</div>
    <ul>
      ${resume.publications.map(p => `<li>${p.title} ${p.year ? `(${p.year})` : ''}</li>`).join('')}
    </ul>
  ` : ''}

  ${resume.customSections && resume.customSections.length > 0 ? `
    ${resume.customSections.map(sec => `
      <div class="section-title">${sec.title}</div>
      <ul>
        ${sec.items.map(it => `<li>${it}</li>`).join('')}
      </ul>
    `).join('')}
  ` : ''}

  ${resume.education && resume.education.length > 0 ? `
    <div class="section-title">Education</div>
    ${resume.education.map(edu => `
      <div class="edu-item">
        <div><strong>${edu.institution}</strong> — ${edu.degree}</div>
        <div>${edu.year}</div>
      </div>
    `).join('')}
  ` : ''}

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();

  printWindow.document.write(html);
  printWindow.document.close();
}
