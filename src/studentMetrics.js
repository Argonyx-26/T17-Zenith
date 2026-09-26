import { calculateOverallMastery, misconceptionName } from './mockData.js'

export { calculateOverallMastery }

export function getStudentStatus(student) {
  if (student.loggedMisconceptions.length > 0 || student.overallMastery < 60) return 'Needs Support'
  if (student.overallMastery >= 80) return 'On Track'
  return 'Progressing'
}

export function getStudentWeakAreas(student) {
  const lowMasteryTopics = Object.entries(student.individualTopicMastery)
    .filter(([, score]) => score < 65)
    .map(([topic]) => topic)
  const hasFractionMisconception = student.loggedMisconceptions.includes(misconceptionName)
  if (hasFractionMisconception && !lowMasteryTopics.includes('Fractions')) lowMasteryTopics.push('Fractions')
  return lowMasteryTopics
}

export function getClassMetrics(studentsList) {
  const classAverage = studentsList.length
    ? Math.round(studentsList.reduce((sum, student) => sum + student.overallMastery, 0) / studentsList.length)
    : 0
  const weakAreasFlagged = studentsList.reduce((sum, student) => sum + student.loggedMisconceptions.length, 0)
  const assignmentsCompleted = studentsList.reduce((sum, student) => sum + student.assignmentsCompleted, 0)
  const totalQuestionsAttempted = studentsList.reduce((sum, student) => sum + student.totalQuestionsAttempted, 0)
  return { classAverage, weakAreasFlagged, assignmentsCompleted, totalQuestionsAttempted, studentCount: studentsList.length }
}

export function getTopicAverages(studentsList) {
  const topicNames = Object.keys(studentsList[0]?.individualTopicMastery ?? {})
  return topicNames.map((name) => {
    const scores = studentsList.map((student) => student.individualTopicMastery[name]).filter(Number.isFinite)
    return {
      name,
      mastery: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    }
  })
}

export function getNodeStatus(student, node) {
  const topicScore = node.topic ? student.individualTopicMastery[node.topic] : null
  if (topicScore !== null && topicScore !== undefined) {
    if (node.topic === 'Fractions' && student.loggedMisconceptions.includes(misconceptionName)) return 'needsPractice'
    if (topicScore < 60) return 'needsPractice'
    return topicScore >= 80 ? 'mastered' : 'inProgress'
  }
  return student.knowledgeNodes[node.name] ?? 'inProgress'
}

export function countMasteredNodes(student, conceptNodes) {
  return conceptNodes.filter((node) => getNodeStatus(student, node) === 'mastered').length
}