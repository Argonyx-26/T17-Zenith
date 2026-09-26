import { useState } from 'react'
import { ArrowRight, BookOpenCheck, GraduationCap, Sparkles, UsersRound } from 'lucide-react'

function initialsFor(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

function LoginForm({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanName || !cleanEmail) {
      setError('Enter your name and email address to continue.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.')
      return
    }
    onLogin({ name: cleanName, email: cleanEmail, role, initials: initialsFor(cleanName) })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-5 py-10">
      <div className="pointer-events-none absolute -left-28 top-[-90px] size-[370px] rounded-full border-[54px] border-lavender-wash" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-[-70px] size-[440px] rounded-full border-[68px] border-lavender-light/20" aria-hidden="true" />
      <div className="relative grid w-full max-w-[980px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_70px_rgba(58,42,69,0.08)] md:grid-cols-[1fr_0.92fr]">
        <section className="flex flex-col justify-between bg-lavender-wash p-7 sm:p-10 md:min-h-[610px] md:p-12">
          <a href="#home" className="flex w-fit items-center gap-3" aria-label="MindGap home"><span className="grid size-11 place-items-center rounded-2xl bg-lavender text-white"><GraduationCap size={24} /></span><span className="font-display text-[27px] text-ink">MindGap</span></a>
          <div className="py-10 md:py-0"><p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-lavender"><Sparkles size={14} /> A clearer path to learning</p><h1 className="max-w-[420px] font-display text-[38px] leading-[1.12] text-ink sm:text-[48px]">Every small step makes a stronger foundation.</h1><p className="mt-5 max-w-[390px] text-sm leading-6 text-muted">See what’s clicking, find the missing building block, and choose the next best step together.</p></div>
          <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-line bg-white p-4"><BookOpenCheck size={19} className="mb-3 text-on-track" /><p className="text-xs font-bold text-ink">Learning that connects</p><p className="mt-1 text-[11px] leading-4 text-muted">Skills build on what came before.</p></div><div className="rounded-2xl border border-line bg-white p-4"><UsersRound size={19} className="mb-3 text-lavender" /><p className="text-xs font-bold text-ink">One shared picture</p><p className="mt-1 text-[11px] leading-4 text-muted">Students and teachers stay in sync.</p></div></div>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-lavender">Welcome to MindGap</p><h2 className="mt-2 font-display text-[30px] text-ink">Sign in to your workspace</h2><p className="mt-2 text-sm leading-6 text-muted">Use your name and email to connect to your learning profile.</p></div>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-name" className="mb-1.5 block text-xs font-bold text-ink">Username / Full Name</label>
            <input id="login-name" name="name" autoComplete="name" required value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="Alex Morgan" className="mb-4 h-11 w-full rounded-2xl border border-line bg-white px-3.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lavender focus:ring-2 focus:ring-lavender/15" />
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-ink">Email Address</label>
            <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="you@school.edu" className="mb-5 h-11 w-full rounded-2xl border border-line bg-white px-3.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-lavender focus:ring-2 focus:ring-lavender/15" />
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-ink">Choose your role</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'student', label: 'Student', icon: BookOpenCheck },
                  { value: 'teacher', label: 'Teacher', icon: GraduationCap },
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-sm font-semibold transition-colors ${role === value ? 'border-lavender bg-lavender-wash text-ink' : 'border-line text-muted hover:bg-page'}`}>
                    <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="size-4 accent-[#9F84B1]" />
                    <Icon size={16} /> {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {error && <p role="alert" className="mt-3 rounded-xl bg-at-risk-bg px-3 py-2 text-xs font-semibold text-at-risk">{error}</p>}
            <button type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender">Sign In <ArrowRight size={16} /></button>
          </form>
          <p className="mt-5 text-center text-[11px] leading-5 text-muted">Your progress is saved locally and shared with your class dashboard.</p>
        </section>
      </div>
    </main>
  )
}

export default LoginForm