import { NextRequest, NextResponse } from 'next/server';
import { ResumeData, CareerCoachChangeItem, CareerCoachStructuredAction } from '@/lib/types';
import { enforceCanonicalCasing } from '@/lib/ats-validator';
import { classifyAndProcessCoachIntent, SECTION_METADATA } from '@/lib/career-coach-engine';

export const runtime = 'nodejs';

interface CareerCoachRequestBody {
  message: string;
  resume: ResumeData;
  targetJob?: {
    title?: string;
    company?: string;
    description?: string;
    extractedKeywords?: string[];
  };
  selectedBullet?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CareerCoachRequestBody = await req.json();
    const { message, resume, targetJob, selectedBullet } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Run our high-precision deterministic intent classifier and grammar repair engine first
    const localStructured = classifyAndProcessCoachIntent(
      message,
      resume,
      targetJob,
      selectedBullet ? { contextSentence: selectedBullet, section: 'experience' } : undefined
    );

    // 2. Check for Gemini API Key if available for advanced multi-sentence linguistic polish
    const clientKey = req.headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY;

    let finalStructured: CareerCoachStructuredAction = localStructured;

    if (clientKey) {
      try {
        const prompt = `You are ATSecure's AI Career Coach & Resume Optimization Engineer.
Analyze the user's natural language instruction and existing resume context.

MANDATORY RULES:
1. Identify the exact operation from:
   ADD_SECTION, UPDATE_SECTION, DELETE_SECTION, ADD_ACHIEVEMENT, ADD_SKILL, REMOVE_SKILL,
   UPDATE_SKILL, ADD_PROJECT, UPDATE_PROJECT, ADD_EXPERIENCE, UPDATE_EXPERIENCE,
   UPDATE_EDUCATION, UPDATE_SUMMARY, REWRITE_CONTENT, IMPROVE_GRAMMAR, IMPROVE_RESUME_BULLET, GENERAL_RESUME_QUERY.
2. NEVER classify general instructions as skills. Only classify as ADD_SKILL/REMOVE_SKILL when the user specifically mentions skills or technical keywords to add/remove from the skills section.
3. NEVER invent numbers, percentages, applicant counts, rankings, or facts not mentioned in the user's input.
4. Correct spelling and grammar flawlessly.
5. If creating a section, specify "CREATE_SECTION" or "CREATE_SECTION_AND_ADD_ITEM".
6. Target sections: "achievements", "certifications", "awards", "scholarships", "leadership", "volunteer", "publications", "projects", "experience", "skills", "education", "summary".

User Input: "${message}"

Existing Resume Context:
- Full Name: ${resume.fullName}
- Title: ${resume.title}
- Summary: ${resume.summary || 'None'}
- Top Roles: ${(resume.experience || []).map((e) => `${e.role} at ${e.company}`).join('; ')}
- Existing Sections: ${Object.keys(resume).filter(k => Array.isArray((resume as any)[k]) && (resume as any)[k].length > 0).join(', ')}

Return ONLY valid JSON matching this schema:
{
  "intent": "${localStructured.intent}",
  "action": "${localStructured.action}",
  "targetSection": "${localStructured.targetSection}",
  "sectionTitle": "${localStructured.sectionTitle}",
  "createSection": ${localStructured.createSectionIfMissing},
  "content": [
    {
      "title": "${localStructured.title || ''}",
      "description": "${localStructured.suggestedContent}"
    }
  ],
  "grammarCorrected": true,
  "requiresConfirmation": false,
  "actionPerformed": "${localStructured.actionPerformedMessage}",
  "explanation": "${localStructured.explanation}",
  "scoreDelta": ${localStructured.scoreDelta},
  "scoreIncreaseString": "${localStructured.scoreIncreaseString}"
}`;

        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const candidateText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText.replace(/```json\n?|```/g, '').trim());
            if (parsed.intent && parsed.targetSection) {
              const suggestedText = parsed.content?.[0]?.description || parsed.suggestedContent || localStructured.suggestedContent;
              finalStructured = {
                intent: parsed.intent || localStructured.intent,
                action: parsed.action || localStructured.action,
                targetSection: parsed.targetSection || localStructured.targetSection,
                sectionTitle: parsed.sectionTitle || SECTION_METADATA[parsed.targetSection]?.title || localStructured.sectionTitle,
                createSectionIfMissing: typeof parsed.createSection === 'boolean' ? parsed.createSection : localStructured.createSectionIfMissing,
                originalUserInput: message,
                suggestedContent: enforceCanonicalCasing(suggestedText),
                title: parsed.content?.[0]?.title || localStructured.title,
                explanation: parsed.explanation || localStructured.explanation,
                actionPerformedMessage: parsed.actionPerformed || localStructured.actionPerformedMessage,
                scoreDelta: typeof parsed.scoreDelta === 'number' ? parsed.scoreDelta : localStructured.scoreDelta,
                scoreIncreaseString: parsed.scoreIncreaseString || localStructured.scoreIncreaseString,
                grammarCorrected: true,
                requiresConfirmation: false,
                data: localStructured.data
              };
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini Career Coach call failed, using high-precision local engine:', geminiErr);
      }
    }

    // 3. Convert into CareerCoachChangeItem array for state updates
    const items: CareerCoachChangeItem[] = [];
    if (finalStructured.suggestedContent || finalStructured.data?.skillsToAdd || finalStructured.data?.skillsToRemove) {
      items.push({
        id: `item_${Date.now()}`,
        section: finalStructured.targetSection as any,
        action: finalStructured.action === 'REMOVE_ITEM' ? 'remove' : finalStructured.action === 'UPDATE_ITEM' || finalStructured.action === 'UPDATE_FIELD' ? 'update' : 'add',
        title: finalStructured.title || finalStructured.sectionTitle,
        appliedText: finalStructured.suggestedContent,
        explanation: finalStructured.explanation,
        ats_score_increase: finalStructured.scoreIncreaseString,
        score_delta_value: finalStructured.scoreDelta,
        data: finalStructured.data
      });
    }

    // 4. Format clean, professional chat message complying with Master Prompt Section 6:
    // Recognized Intent, Target Resume Section, Suggested Content, Action Performed
    let chatResponse = '';
    if (finalStructured.intent === 'GENERAL_RESUME_QUERY') {
      chatResponse = `📊 **Active Resume Diagnostic Assessment:**\n\n• **Overall ATS Score:** ${resume.ats_score || 78}/100\n• **Candidate Role:** ${resume.title || 'Software Engineering Professional'}\n• **Total Experience Bullets:** ${(resume.experience || []).reduce((acc, e) => acc + (e.bullets?.length || 0), 0)}\n• **Total Skills Count:** ${(resume.skills || []).reduce((acc, s) => acc + (s.items?.length || 0), 0)}\n\n💡 **Actionable Improvements:**\n1. Tell me accomplishments like *"got scholarships across 200000+ candidates"* or *"won hackathon and worked with team"*.\n2. Add certifications like *"add certifications section and AWS certification"*.\n3. Add technical skills like *"add Python and Java to skills"* or *"remove HTML from my skills"*.\n4. Click any bullet on the canvas to rewrite it with Google XYZ formula!`;
    } else {
      chatResponse = `🎯 **Recognized Intent:** ${finalStructured.intent.replace(/_/g, ' ')}\n\n` +
        `📁 **Target Section:** ${finalStructured.sectionTitle}\n\n` +
        (finalStructured.suggestedContent ? `📝 **Suggested Content:**\n"${finalStructured.suggestedContent}"\n\n` : '') +
        `⚡ **Action Performed:** ${finalStructured.actionPerformedMessage}\n\n` +
        `📈 **ATS Score Upgraded:** ${finalStructured.scoreIncreaseString}`;
    }

    return NextResponse.json({
      intent: finalStructured.intent,
      summary: finalStructured.actionPerformedMessage,
      items,
      chatResponse,
      totalScoreBoost: finalStructured.scoreDelta,
      structuredAction: finalStructured
    });
  } catch (err: any) {
    console.error('Career Coach API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process career coach message' },
      { status: 500 }
    );
  }
}
