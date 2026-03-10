/**
 * AI Coach - Motivational and guidance AI for QSE Ecosystem users
 */

const motivationalTips = [
  'Set one small goal today and celebrate when you hit it.',
  'Consistency beats perfection every time.',
  'Your network is your net worth - connect with one new person today.',
  'Track your progress; what gets measured gets improved.',
  'Invest in learning - one new skill can open many doors.',
  'Take care of your health; it is your most valuable asset.',
  'Break big goals into small daily actions.',
  'Ask for help - it is a sign of strength, not weakness.'
];

const aiCoach = {
  respond({ userId, message, context }) {
    const lowerMsg = message.toLowerCase();
    let reply = 'Keep pushing forward! You are making progress every day.';

    if (lowerMsg.includes('goal')) {
      reply = 'Break your goal into three small steps. What is step one?';
    } else if (lowerMsg.includes('help') || lowerMsg.includes('stuck')) {
      reply = 'It is okay to feel stuck. Identify the smallest next action and take it.';
    } else if (lowerMsg.includes('motivat')) {
      reply = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];
    } else if (lowerMsg.includes('train') || lowerMsg.includes('learn')) {
      reply = 'Consistent daily practice - even 15 minutes - builds real skills over time.';
    } else if (lowerMsg.includes('money') || lowerMsg.includes('earn')) {
      reply = 'Focus on delivering value first. Income follows when you solve real problems.';
    }

    return {
      userId: userId || 'anonymous',
      message,
      reply,
      timestamp: new Date().toISOString()
    };
  },

  getMotivationalTips() {
    return motivationalTips;
  }
};

module.exports = aiCoach;
