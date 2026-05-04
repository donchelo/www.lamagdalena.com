import MainLayout from '@/components/templates/MainLayout'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
