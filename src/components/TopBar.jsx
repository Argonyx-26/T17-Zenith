import { Activity, BookOpenCheck, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react'

const teacherTabs = [
  { id: 'progress', label: 'Class overview', icon: GraduationCap },
  { id: 'reports', label: 'Reports', icon: BookOpenCheck },
]

function TopBar({ user, view, availableViews, onViewChange, onSignOut }) {
  const studentIcons = { hub: LayoutDashboard, quiz: BookOpenCheck, analytics: Activity }
  const studentTabs = availableViews.map(({ id, label }) => ({ id, label, icon: studentIcons[id] ?? LayoutDashboard }))
  const tabs = user.role === 'student' ? studentTabs : teacherTabs
  const productName = user.role === 'student' ? 'MindGap' : 'EduTrack'

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#dashboard" className="flex shrink-0 items-center gap-2.5" aria-label={`${productName} dashboard`}>
          <span className="grid size-10 place-items-center rounded-xl bg-lavender text-white"><GraduationCap size={22} /></span>
          <span className="hidden font-display text-[22px] text-ink sm:inline">{productName}</span>
        </a>
        <nav className="ml-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:ml-7" aria-label="Dashboard navigation">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} aria-current={view === id ? 'page' : undefined} onClick={() => onViewChange(id)} className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${view === id ? 'bg-lavender-wash text-ink' : 'text-muted hover:bg-page hover:text-ink'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 border-l border-line pl-3 sm:gap-3 sm:pl-5">
          <span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${user.role === 'student' ? 'bg-lavender-wash text-lavender' : 'bg-on-track-bg text-on-track'}`} aria-hidden="true">{user.initials}</span>
          <div className="hidden min-w-0 sm:block"><p className="max-w-[145px] truncate text-xs font-bold text-ink">{user.name}</p><p className="max-w-[145px] truncate text-[10px] text-muted">{user.email}</p><span className="text-[9px] font-bold uppercase tracking-[0.1em] text-lavender">{user.role}</span></div>
          <button type="button" onClick={onSignOut} title="Log Out" aria-label="Log Out" className="grid size-9 place-items-center rounded-2xl text-muted transition-colors hover:bg-at-risk-bg hover:text-at-risk"><LogOut size={17} /></button>
        </div>
      </div>
    </header>
  )
}

export default TopBar