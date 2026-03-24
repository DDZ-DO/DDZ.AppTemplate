import { AppLayout } from '@ddz/shared-react'
import { AppHeader } from './AppHeader'

export function Layout() {
  return (
    <AppLayout
      header={<AppHeader />}
      maxWidth="max-w-[1600px]"
    />
  )
}
