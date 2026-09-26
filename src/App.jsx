import { useEffect, useMemo, useReducer } from 'react'
import PerformanceAnalytics from './components/PerformanceAnalytics.jsx'
import LoginForm from './components/LoginForm.jsx'
import QuizSession from './components/QuizSession.jsx'
import StudentHub from './components/StudentHub.jsx'
import TeacherControlCenter from './components/TeacherControlCenter.jsx'
import TopBar from './components/TopBar.jsx'
import { createInitialState, databaseKey, appReducer } from './appState.js'
import { pickRandomQuestions } from './questionBanks.js'

function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)
  const serializedDatabase = useMemo(() => JSON.stringify({ studentsList: state.studentsList, activeAccounts: state.activeAccounts }), [state.studentsList, state.activeAccounts])

  useEffect(() => {
    window.localStorage.setItem(databaseKey, serializedDatabase)
  }, [serializedDatabase])

  useEffect(() => {
    function syncDatabase(event) {
      if (event.key !== databaseKey || !event.newValue || event.newValue === serializedDatabase) return
      try {
        dispatch({ type: 'HYDRATE_DATABASE', database: JSON.parse(event.newValue) })
      } catch {
        return
      }
    }
    window.addEventListener('storage', syncDatabase)
    return () => window.removeEventListener('storage', syncDatabase)
  }, [serializedDatabase])

  if (!state.currentUser) {
    return <LoginForm onLogin={(profile) => dispatch({ type: 'SIGN_IN', profile })} />
  }

  const student = state.studentsList.find((entry) => entry.id === state.currentUser.studentId)
  const isStudent = state.currentUser.role === 'student'
  const availableViews = isStudent
    ? [
      { id: 'hub', label: 'Learning hub' },
      ...(state.currentQuizState.questions.length && !state.currentQuizState.completedSession ? [{ id: 'quiz', label: 'Active quiz' }] : []),
      ...(state.currentQuizState.completedSession ? [{ id: 'analytics', label: 'Analytics' }] : []),
    ]
    : [{ id: 'progress', label: 'Class overview' }, { id: 'reports', label: 'Reports' }]

  function startQuiz(subject) {
    dispatch({
      type: 'START_QUIZ',
      subject,
      questions: pickRandomQuestions(subject),
      startingScore: student.subjectMastery[subject] ?? 0,
    })
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <TopBar
        user={state.currentUser}
        view={state.activeView}
        availableViews={availableViews}
        onViewChange={(view) => dispatch({ type: 'SET_VIEW', view })}
        onSignOut={() => dispatch({ type: 'SIGN_OUT' })}
      />
      {isStudent ? (
        state.activeView === 'quiz' && state.currentQuizState.questions.length ? (
          <QuizSession
            student={student}
            quizState={state.currentQuizState}
            dispatch={dispatch}
          />
        ) : state.activeView === 'analytics' && state.currentQuizState.completedSession ? (
          <PerformanceAnalytics
            student={student}
            session={state.currentQuizState.completedSession}
            onReturn={() => dispatch({ type: 'RETURN_TO_HUB' })}
          />
        ) : (
          <StudentHub
            student={student}
            onStartQuiz={startQuiz}
          />
        )
      ) : (
        <TeacherControlCenter studentsList={state.studentsList} view={state.activeView} />
      )}
    </div>
  )
}

export default App
