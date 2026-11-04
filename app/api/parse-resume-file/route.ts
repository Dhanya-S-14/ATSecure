import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { cleanExtractedText, isReadableText } from '@/lib/pdf-parser';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const apiKey = (formData.get('apiKey') as string) || process.env.AFFINDA_API_KEY || process.env.APILAYER_API_KEY;
    const provider = (formData.get('provider') as string) || 'python';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    // 1. Try Python FastAPI PyPDF & Text Parsing Engine first if available
    try {
      const pyFormData = new FormData();
      pyFormData.append('file', file, file.name);

      const pyResponse = await fetch(`${PYTHON_BACKEND_URL}/api/v1/parser/upload`, {
        method: 'POST',
        body: pyFormData
      });

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        const cleanedPy = cleanExtractedText(pyData.parsedText || '');
        if (cleanedPy && isReadableText(cleanedPy)) {
          return NextResponse.json({
            success: true,
            provider: pyData.provider || 'Python PyPDF Engine',
            parsedText: cleanedPy,
            extractedEmail: pyData.extractedEmail,
            extractedPhone: pyData.extractedPhone,
            detectedSkills: pyData.detectedSkills,
            structuredResume: pyData.structuredResume
          });
        }
      }
    } catch (pyErr) {
      // Python service not running or unreachable
    }

    // 2. Fallback to Affinda API if key provided
    if (apiKey && provider === 'affinda') {
      try {
        const affindaForm = new FormData();
        affindaForm.append('file', file);

        const response = await fetch('https://api.affinda.com/v3/documents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          body: affindaForm
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || {};

          const name = data.name?.raw || 'Parsed Candidate';
          const email = data.emails?.[0] || '';
          const phone = data.phoneNumbers?.[0] || '';
          const summary = data.summary?.raw || '';
          const skills = (data.skills || []).map((s: { name: string }) => s.name);

          const formattedText = `
NAME: ${name}
EMAIL: ${email}
PHONE: ${phone}

SUMMARY:
${summary}

SKILLS:
${skills.join(', ')}

EXPERIENCE:
${(data.workExperience || [])
  .map(
    (job: { jobTitle?: { raw: string }; organization?: { raw: string }; dates?: { raw: string }; jobDescription?: string }) =>
      `${job.jobTitle?.raw || 'Role'} at ${job.organization?.raw || 'Company'} (${job.dates?.raw || ''})\n- ${job.jobDescription || ''}`
  )
  .join('\n\n')}
          `.trim();

          const cleanedAffinda = cleanExtractedText(formattedText);
          if (cleanedAffinda && isReadableText(cleanedAffinda)) {
            return NextResponse.json({
              success: true,
              provider: 'Affinda ML Parser',
              parsedText: cleanedAffinda,
              structuredData: data
            });
          }
        }
      } catch (affindaErr) {
        console.error('Affinda API call error:', affindaErr);
      }
    }

    // 3. Node.js Native Server PDF / DOCX Parsing Engine
    let extractedServerText = '';

    if (extension === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let pageString = '';
          let lastY: number | null = null;

          for (const item of textContent.items as any[]) {
            if (!item.str) continue;

            const currentY = item.transform ? item.transform[5] : null;

            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
              pageString += '\n';
            } else if (pageString.length > 0 && !pageString.endsWith('\n') && !pageString.endsWith(' ')) {
              pageString += ' ';
            }

            pageString += item.str;
            lastY = currentY;
          }

          if (pageString.trim()) {
            pageTexts.push(pageString.trim());
          }
        }

        extractedServerText = pageTexts.join('\n\n');
      } catch (pdfErr) {
        console.error('Server-side PDFJS parsing failed:', pdfErr);
      }
    } else if (extension === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer });
        extractedServerText = res.value || '';
      } catch (docxErr) {
        console.error('Server-side DOCX mammoth parsing failed:', docxErr);
      }
    } else {
      try {
        extractedServerText = await file.text();
      } catch {
        extractedServerText = '';
      }
    }

    const cleanResult = cleanExtractedText(extractedServerText);

    if (cleanResult && isReadableText(cleanResult)) {
      return NextResponse.json({
        success: true,
        provider: 'JobSync Engine',
        parsedText: cleanResult
      });
    }

    return NextResponse.json(
      {
        error: 'Unable to read PDF text. Please paste text directly or upload a text-based PDF/DOCX file.',
        success: false
      },
      { status: 422 }
    );
  } catch (error) {
    console.error('Error in parse-resume-file API:', error);
    return NextResponse.json(
      { error: 'Unable to read PDF text. Please paste text directly or upload a text-based PDF/DOCX file.' },
      { status: 500 }
    );
  }
}
