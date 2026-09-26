export const SUBJECTS = ['Mathematics', 'Python Coding', 'General Science']

export const subjectDetails = {
  Mathematics: { description: 'Reason through patterns, shapes, and numbers.', eyebrow: 'Numbers & logic' },
  'Python Coding': { description: 'Build confidence one line of code at a time.', eyebrow: 'Code & create' },
  'General Science': { description: 'Explore the systems that shape our world.', eyebrow: 'Observe & discover' },
}

export const conceptNodes = [
  { name: 'Algebra', subject: 'Mathematics' },
  { name: 'Fractions', subject: 'Mathematics' },
  { name: 'Geometry', subject: 'Mathematics' },
  { name: 'Matter', subject: 'General Science' },
  { name: 'Loops', subject: 'Python Coding' },
  { name: 'Functions', subject: 'Python Coding' },
  { name: 'Syntax', subject: 'Python Coding' },
  { name: 'Cells', subject: 'General Science' },
  { name: 'Energy', subject: 'General Science' },
  { name: 'Forces', subject: 'General Science' },
]

export function calculateOverallMastery(subjectMastery) {
  const scores = Object.values(subjectMastery)
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
}

function createStudent(student) {
  return {
    ...student,
    baselineSubjectMastery: { ...student.subjectMastery },
    overallMastery: calculateOverallMastery(student.subjectMastery),
    assignmentsCompleted: 0,
    totalQuestionsAttempted: 0,
    quizzesTaken: 0,
    individualTopicMastery: { ...student.individualTopicMastery },
    quizHistory: [],
    loggedMisconceptions: [],
    nodeStatuses: Object.fromEntries(conceptNodes.map(({ name }) => [name, 'inProgress'])),
    progressInitialized: false,
  }
}

export const initialStudents = [
  createStudent({
    id: 'student:alex.morgan@edutrack.test',
    name: 'Alex Morgan',
    email: 'alex.morgan@edutrack.test',
    subjectMastery: { Mathematics: 74, 'Python Coding': 58, 'General Science': 68 },
    individualTopicMastery: { Fractions: 70, Algebra: 78, Geometry: 84, Python: 58 },
  }),
  createStudent({
    id: 'student:emma.liu@edutrack.test',
    name: 'Emma Liu',
    email: 'emma.liu@edutrack.test',
    subjectMastery: { Mathematics: 84, 'Python Coding': 73, 'General Science': 89 },
    individualTopicMastery: { Fractions: 82, Algebra: 88, Geometry: 92, Python: 73 },
  }),
  createStudent({
    id: 'student:jamal.carter@edutrack.test',
    name: 'Jamal Carter',
    email: 'jamal.carter@edutrack.test',
    subjectMastery: { Mathematics: 54, 'Python Coding': 42, 'General Science': 63 },
    individualTopicMastery: { Fractions: 48, Algebra: 58, Geometry: 68, Python: 42 },
  }),
  createStudent({
    id: 'student:sophia.chen@edutrack.test',
    name: 'Sophia Chen',
    email: 'sophia.chen@edutrack.test',
    subjectMastery: { Mathematics: 76, 'Python Coding': 82, 'General Science': 79 },
    individualTopicMastery: { Fractions: 71, Algebra: 76, Geometry: 83, Python: 82 },
  }),
]