import { calculateOverallMastery, conceptNodes, initialStudents, SUBJECTS } from './mockData.js'

export const databaseKey = 'mindgap-classroom-records-v2'

function emptyQuizState() {
  return {
    subject: null,
    questions: [],
    questionIndex: 0,
    answers: [],
    selectedOptionIndex: null,
    answerRevealed: false,
    latestAnswer: null,
    startingScore: 0,
    score: 0,
    misconceptions: [],
    nodeResults: {},
    completedSession: null,
  }
}

function readDatabase() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(databaseKey) ?? 'null')
    if (saved && Array.isArray(saved.studentsList)) {
      return {
        studentsList: saved.studentsList,
        activeAccounts: Array.isArray(saved.activeAccounts) ? saved.activeAccounts : [],
      }
    }
  } catch {
    return { studentsList: initialStudents, activeAccounts: [] }
  }
  return { studentsList: initialStudents, activeAccounts: [] }
}

export function createInitialState() {
  return {
    ...readDatabase(),
    currentUser: null,
    activeView: 'hub',
    currentQuizState: emptyQuizState(),
  }
}

function createStudent(profile) {
  const subjectMastery = Object.fromEntries(SUBJECTS.map((subject) => [subject, 0]))
  return {
    id: `student:${profile.email.toLowerCase()}`,
    name: profile.name,
    email: profile.email.toLowerCase(),
    subjectMastery,
    baselineSubjectMastery: { ...subjectMastery },
    overallMastery: 0,
    quizzesTaken: 0,
    assignmentsCompleted: 0,
    totalQuestionsAttempted: 0,
    individualTopicMastery: { Fractions: 0, Algebra: 0, Geometry: 0, Python: 0 },
    quizHistory: [],
    loggedMisconceptions: [],
    nodeStatuses: Object.fromEntries(conceptNodes.map(({ name }) => [name, 'inProgress'])),
    progressInitialized: true,
  }
}

function initializeFirstLogin(student) {
  if (student.progressInitialized) return student
  if (student.quizHistory?.length) {
    return { ...student, progressInitialized: true, quizzesTaken: student.quizzesTaken ?? student.quizHistory.length }
  }

  const subjectMastery = Object.fromEntries(SUBJECTS.map((subject) => [subject, 0]))
  return {
    ...student,
    subjectMastery,
    baselineSubjectMastery: { ...subjectMastery },
    overallMastery: 0,
    quizzesTaken: 0,
    assignmentsCompleted: 0,
    totalQuestionsAttempted: 0,
    individualTopicMastery: { Fractions: 0, Algebra: 0, Geometry: 0, Python: 0 },
    quizHistory: [],
    loggedMisconceptions: [],
    nodeStatuses: Object.fromEntries(conceptNodes.map(({ name }) => [name, 'inProgress'])),
    progressInitialized: true,
  }
}

function updateStudent(studentsList, studentId, updater) {
  return studentsList.map((student) => student.id === studentId ? updater(student) : student)
}

function answerQuestion(state, optionIndex) {
  const quiz = state.currentQuizState
  if (quiz.answerRevealed || !quiz.questions.length) return state
  const question = quiz.questions[quiz.questionIndex]
  const selectedOption = question.options[optionIndex]
  if (!selectedOption) return state
  const correctOption = question.options.find((option) => option.isCorrect)
  const isCorrect = selectedOption.isCorrect
  const answerRecord = {
    questionId: question.id,
    concept: question.concept,
    selectedOption: selectedOption.label,
    isCorrect,
    misconception: isCorrect ? '' : selectedOption.misconception,
  }
  const nodeResults = { ...quiz.nodeResults, [question.concept]: isCorrect ? 'mastered' : 'needsPractice' }
  return {
    ...state,
    currentQuizState: {
      ...quiz,
      answers: [...quiz.answers, answerRecord],
      selectedOptionIndex: optionIndex,
      answerRevealed: true,
      latestAnswer: { isCorrect, selectedOption, correctOption, question },
      score: quiz.score + Number(isCorrect),
      misconceptions: isCorrect ? quiz.misconceptions : [...quiz.misconceptions, selectedOption.misconception],
      nodeResults,
    },
  }
}

function completeQuiz(state) {
  const quiz = state.currentQuizState
  const studentId = state.currentUser?.studentId
  const student = state.studentsList.find((entry) => entry.id === studentId)
  if (!student || quiz.answers.length !== 10 || quiz.completedSession) return state

  const score = Math.round((quiz.score / quiz.questions.length) * 100)
  const previousSubjectSessions = student.quizHistory.filter((session) => session.subject === quiz.subject)
  const previousQuestions = previousSubjectSessions.reduce((sum, session) => sum + session.questionsTotal, 0)
  const previousPoints = previousSubjectSessions.reduce((sum, session) => sum + session.score * session.questionsTotal, 0)
  const updatedMastery = previousQuestions
    ? Math.round((previousPoints + score * quiz.questions.length) / (previousQuestions + quiz.questions.length))
    : score
  const session = {
    id: `${studentId}-${Date.now()}`,
    subject: quiz.subject,
    startingScore: quiz.startingScore,
    score,
    correctCount: quiz.score,
    questionsTotal: quiz.questions.length,
    areasOfConcern: [...quiz.misconceptions],
    conceptsOfConcern: [...new Set(quiz.answers.filter((answer) => !answer.isCorrect).map((answer) => answer.concept))],
    nodeResults: { ...quiz.nodeResults },
    completedAt: new Date().toISOString(),
  }
  const subjectMastery = { ...student.subjectMastery, [quiz.subject]: updatedMastery }
  const individualTopicMastery = { ...student.individualTopicMastery }
  for (const [concept, status] of Object.entries(quiz.nodeResults)) {
    if (Object.hasOwn(individualTopicMastery, concept)) {
      individualTopicMastery[concept] = status === 'mastered'
        ? Math.min(100, individualTopicMastery[concept] + 5)
        : Math.max(0, individualTopicMastery[concept] - 5)
    }
  }
  const studentsList = updateStudent(state.studentsList, studentId, (currentStudent) => ({
    ...currentStudent,
    subjectMastery,
    overallMastery: calculateOverallMastery(subjectMastery),
    quizzesTaken: (currentStudent.quizzesTaken ?? currentStudent.quizHistory.length) + 1,
    assignmentsCompleted: currentStudent.assignmentsCompleted + 1,
    totalQuestionsAttempted: currentStudent.totalQuestionsAttempted + quiz.questions.length,
    individualTopicMastery,
    quizHistory: [...currentStudent.quizHistory, session],
    loggedMisconceptions: [...currentStudent.loggedMisconceptions, ...quiz.misconceptions],
    nodeStatuses: { ...currentStudent.nodeStatuses, ...quiz.nodeResults },
  }))
  return {
    ...state,
    studentsList,
    activeView: 'analytics',
    currentQuizState: { ...quiz, completedSession: session },
  }
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'SIGN_IN': {
      const email = action.profile.email.toLowerCase()
      const accountId = `${action.profile.role}:${email}`
      const account = { ...action.profile, email, id: accountId }
      const activeAccounts = [...state.activeAccounts.filter((entry) => entry.id !== accountId), account]
      let studentsList = state.studentsList
      let currentUser = account
      if (account.role === 'student') {
        let student = studentsList.find((entry) => entry.email.toLowerCase() === email)
        if (!student) {
          student = createStudent(account)
          studentsList = [...studentsList, student]
        } else {
          const initializedStudent = initializeFirstLogin(student)
          if (initializedStudent !== student) {
            student = initializedStudent
            studentsList = updateStudent(studentsList, student.id, () => student)
          }
        }
        currentUser = { ...account, studentId: student.id }
      }
      return { ...state, studentsList, activeAccounts, currentUser, activeView: account.role === 'student' ? 'hub' : 'progress', currentQuizState: emptyQuizState() }
    }
    case 'SIGN_OUT':
      return { ...state, currentUser: null, activeView: 'hub', currentQuizState: emptyQuizState() }
    case 'SET_VIEW':
      return { ...state, activeView: action.view }
    case 'HYDRATE_DATABASE':
      if (!Array.isArray(action.database?.studentsList)) return state
      return { ...state, studentsList: action.database.studentsList, activeAccounts: action.database.activeAccounts ?? state.activeAccounts }
    case 'START_QUIZ':
      if (!SUBJECTS.includes(action.subject) || action.questions.length !== 10) return state
      return {
        ...state,
        activeView: 'quiz',
        currentQuizState: { ...emptyQuizState(), subject: action.subject, questions: action.questions, startingScore: action.startingScore },
      }
    case 'ANSWER_QUESTION':
      return answerQuestion(state, action.optionIndex)
    case 'NEXT_QUESTION':
      if (state.currentQuizState.questionIndex >= state.currentQuizState.questions.length - 1) return completeQuiz(state)
      return { ...state, currentQuizState: { ...state.currentQuizState, questionIndex: state.currentQuizState.questionIndex + 1, selectedOptionIndex: null, answerRevealed: false, latestAnswer: null } }
    case 'RETURN_TO_HUB':
      return { ...state, activeView: 'hub', currentQuizState: emptyQuizState() }
    default:
      return state
  }
}