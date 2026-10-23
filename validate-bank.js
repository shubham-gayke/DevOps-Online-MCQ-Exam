global.window = { QUESTION_BANK: [] };
['git', 'github', 'terraform', 'ansible', 'docker', 'kubernetes'].forEach(t => {
  require('./js/questions/' + t + '.js');
});

const bank = global.window.QUESTION_BANK;
console.log('Total bank questions loaded:', bank.length);

const topicCounts = {};
const diffCounts = {};
let sequenceCount = 0;
const issues = [];
const ids = new Set();

bank.forEach((q, idx) => {
  if (!q.id) issues.push(`Index ${idx}: missing id`);
  if (ids.has(q.id)) issues.push(`Duplicate ID: ${q.id}`);
  ids.add(q.id);

  topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
  diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;

  if (!q.question || q.question.trim().length === 0) issues.push(`${q.id}: empty question`);
  if (!Array.isArray(q.options) || q.options.length !== 4) issues.push(`${q.id}: does not have 4 options`);

  const optIds = (q.options || []).map(o => o.id);
  if (!optIds.includes(q.correct)) issues.push(`${q.id}: correct answer '${q.correct}' not in options ${optIds}`);

  // check for forbidden text
  q.options.forEach(o => {
    const text = o.text.toLowerCase();
    if (text.includes('all of the above') || text.includes('none of the above') || text.includes('both a and b') || text.includes('both b and c')) {
      issues.push(`${q.id}: option '${o.id}' contains forbidden phrase: ${o.text}`);
    }
  });

  if (!q.explanation || q.explanation.length < 30) {
    issues.push(`${q.id}: explanation too short or missing`);
  }

  // Check sequence questions in Git
  if (q.topic === 'Git') {
    const isSeq = q.options.some(o => o.text.includes('→') || o.text.includes('->'));
    if (isSeq) sequenceCount++;
  }
});

console.log('Topic counts:', topicCounts);
console.log('Difficulty counts:', diffCounts);
console.log('Git sequence questions count:', sequenceCount);
console.log('Total issues:', issues.length);
if (issues.length > 0) {
  issues.forEach(iss => console.log(' - ' + iss));
}
