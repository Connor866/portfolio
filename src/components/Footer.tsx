import { getProfile } from '../api/profile'
import { getSettings } from '../api/settings'
import { useLocalData } from '../hooks/useLocalData'

export function Footer() {
  const profile = useLocalData(getProfile)
  const settings = useLocalData(getSettings)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-9 text-xs text-dim sm:flex-row sm:px-8">
        <p>
          © {year} {profile.name}. All rights reserved.
        </p>
        <p>{settings.footerText}</p>
      </div>
    </footer>
  )
}
