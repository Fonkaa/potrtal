import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECIC Exam Result Portal',
  description: 'Electronics and Communication Engineering Innovation Club - Dynamic Exam Result Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#070F1E] text-slate-100 min-h-screen flex flex-col relative selection:bg-amber-400 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}