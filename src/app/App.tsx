import { useEffect } from 'react'
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import {
  BarChart3,
  CalendarClock,
  HeartPulse,
  Home,
  NotebookPen,
  Settings,
} from 'lucide-react'
import { usePouchlessStore } from './store'
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen'
import { TodayScreen } from '../features/today/TodayScreen'
import { CravingScreen } from '../features/craving/CravingScreen'
import { LogPouchScreen } from '../features/pouchLog/LogPouchScreen'
import { PlanScreen } from '../features/plan/PlanScreen'
import { InsightsScreen } from '../features/insights/InsightsScreen'
import { JournalScreen } from '../features/journal/JournalScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { Button } from '../components/Button'

const navigationItems = [
  { to: '/today', label: 'Today', icon: Home },
  { to: '/plan', label: 'Plan', icon: CalendarClock },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function App() {
  const initialize = usePouchlessStore((state) => state.initialize)
  const initialized = usePouchlessStore((state) => state.initialized)
  const storageError = usePouchlessStore((state) => state.storageError)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (storageError) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-950">
          <HeartPulse className="mb-4 h-8 w-8" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">Storage needs attention</h1>
          <p className="mt-3 text-sm leading-6">
            Pouchless stores your data locally in this browser. IndexedDB is not
            available right now, so the app cannot safely save logs.
          </p>
          <p className="mt-3 text-sm leading-6">
            Try another browser profile, turn off private browsing, or check
            browser storage permissions.
          </p>
        </div>
      </main>
    )
  }

  if (!initialized) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-50 px-5 text-teal-950">
        <div className="text-center">
          <HeartPulse className="mx-auto mb-4 h-9 w-9 text-teal-700" />
          <p className="font-medium">Opening Pouchless...</p>
        </div>
      </main>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<StartRedirect />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route element={<RequireOnboarding />}>
        <Route element={<AppLayout />}>
          <Route path="/today" element={<TodayScreen />} />
          <Route path="/craving" element={<CravingScreen />} />
          <Route path="/log" element={<LogPouchScreen />} />
          <Route path="/plan" element={<PlanScreen />} />
          <Route path="/insights" element={<InsightsScreen />} />
          <Route path="/journal" element={<JournalScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function StartRedirect() {
  const settings = usePouchlessStore((state) => state.settings)
  return (
    <Navigate
      to={settings?.onboardingCompleted ? '/today' : '/onboarding'}
      replace
    />
  )
}

function RequireOnboarding() {
  const settings = usePouchlessStore((state) => state.settings)
  const location = useLocation()

  if (!settings?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />
  }

  return <Outlet />
}

function AppLayout() {
  return (
    <div className="min-h-svh bg-slate-50 text-teal-950">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
        <header className="sticky top-0 z-20 border-b border-teal-100 bg-slate-50/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/today" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold leading-5">
                  Pouchless
                </span>
                <span className="block text-xs text-teal-700">
                  Create a little space
                </span>
              </span>
            </NavLink>
            <Button to="/craving" size="sm">
              I want one
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-teal-100 bg-white/95 px-2 py-2 shadow-[0_-8px_28px_rgba(15,23,42,0.08)] backdrop-blur"
          aria-label="Primary"
        >
          <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.7rem] font-medium',
                      isActive
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-teal-900',
                    ].join(' ')
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
