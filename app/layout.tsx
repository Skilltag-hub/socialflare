import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SkillTag',
  description: 'Join the waitlist for SkillTag - your gateway to micro gigs and skill tags.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 