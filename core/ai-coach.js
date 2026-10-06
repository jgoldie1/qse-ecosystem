/**
 * Stubbs AI Wellness Guide - Sculptify/QSE guidance.
 * General wellness information only; no diagnosis or prescribing.
 */
const motivationalTips = [
  'Choose one realistic wellness goal today and make it easy to repeat.',
  'Consistency matters more than intensity for most sustainable routines.',
  'Hydration, rest, movement and recovery are strong foundations for general wellness.',
  'Track how you feel before and after a routine so you can notice useful patterns.',
  'Ask a qualified provider what is appropriate for your goals, history and comfort.'
];

function urgentMedicalLanguage(text) {
  return /(chest pain|can't breathe|cannot breathe|severe bleeding|stroke|suicid|overdose|emergency)/.test(text);
}

const aiCoach = {
  respond({ userId, message, context }) {
    const lowerMsg = String(message || '').toLowerCase();
    let reply = 'I can help you explore Sculptify services, booking, training and general wellness routines.';

    if (urgentMedicalLanguage(lowerMsg)) {
      reply = 'That may need urgent professional attention. Please contact emergency services or an appropriate licensed medical professional now rather than relying on this wellness guide.';
    } else if (lowerMsg.includes('reiki')) {
      reply = 'Sculptify offers Reiki as a relaxation and mindfulness-oriented wellness service. It can complement self-care, but it should not replace medical diagnosis or treatment.';
    } else if (lowerMsg.includes('massage')) {
      reply = 'Massage therapy can support relaxation and general wellness. Choose a qualified provider and share relevant health considerations with them before the session.';
    } else if (lowerMsg.includes('sculpt') || lowerMsg.includes('body contour')) {
      reply = 'For body sculpting, start with your goal, ask which method the provider uses, review contraindications, and confirm the provider is appropriately trained for that service.';
    } else if (lowerMsg.includes('acupuncture') || lowerMsg.includes('acupressure')) {
      reply = 'For acupuncture or acupressure, review provider qualifications and whether the service is appropriate for you. Licensing requirements vary by location.';
    } else if (lowerMsg.includes('book') || lowerMsg.includes('appointment')) {
      reply = 'Use the Book an Appointment section, choose the service and session type, then select your preferred date.';
    } else if (lowerMsg.includes('train') || lowerMsg.includes('learn') || lowerMsg.includes('certif')) {
      reply = 'Open the Training section for Sculptify learning pathways covering body sculpting, Reiki, massage-related client care and provider safety.';
    } else if (lowerMsg.includes('goal') || lowerMsg.includes('routine')) {
      reply = 'Pick one small wellness goal, make it measurable, and repeat it consistently. If the goal involves a medical condition, ask a licensed clinician what is appropriate.';
    } else if (lowerMsg.includes('motivat')) {
      reply = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];
    }

    return {
      userId: userId || 'anonymous',
      context: context || 'sculptify',
      message,
      reply,
      poweredBy: 'Stubbs AI',
      timestamp: new Date().toISOString()
    };
  },

  getMotivationalTips() {
    return motivationalTips;
  }
};

module.exports = aiCoach;
