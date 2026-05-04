import { notFound } from 'next/navigation'
import Link from 'next/link'
import { storiesData } from '@/data/stories'
import StoryView from '@/components/organisms/StoryView'
import BlogCard from '@/components/molecules/BlogCard'
import EditorialLayout from '@/components/templates/EditorialLayout'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return storiesData.map(s => ({ slug: s.slug }))
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const storyIndex = storiesData.findIndex(s => s.slug === slug)
  if (storyIndex === -1) notFound()

  const story = storiesData[storyIndex]
  const prevStory = storyIndex > 0 ? storiesData[storyIndex - 1] : null
  const nextStory = storyIndex < storiesData.length - 1 ? storiesData[storyIndex + 1] : null

  const currentCategory = story.category
  const relatedStories = storiesData
    .filter(s => s.slug !== slug)
    .sort((a, b) => (a.category === currentCategory ? -1 : 1))
    .slice(0, 3)

  return (
    <EditorialLayout>
      <div className="story-detail-page">
        <StoryView story={story} />

        <div className="story-nav">
          {prevStory ? (
            <Link href={`/historias/${prevStory.slug}`} className="nav-item prev">
              <span className="nav-label">Anterior</span>
              <span className="nav-title">{prevStory.title}</span>
            </Link>
          ) : <div className="nav-item prev empty"></div>}

          {nextStory ? (
            <Link href={`/historias/${nextStory.slug}`} className="nav-item next">
              <span className="nav-label">Siguiente</span>
              <span className="nav-title">{nextStory.title}</span>
            </Link>
          ) : <div className="nav-item next empty"></div>}
        </div>

        <footer className="story-footer">
          <section className="blog-section" style={{ marginTop: '4rem' }}>
            <div className="container-fluid" style={{ padding: '0 2rem' }}>
              {relatedStories.length > 0 && (
                <div className="related-stories-section">
                  <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem' }}>Otras historias</h2>
                  <div className="blog-grid">
                    {relatedStories.map(s => (
                      <BlogCard key={s.id} {...s} />
                    ))}
                  </div>
                </div>
              )}
              <div className="story-footer-inner" style={{ marginTop: '8rem', paddingBottom: '4rem', justifyContent: 'center', opacity: 0.5 }}>
                <p className="story-date">{story.date} • {story.category} • La Magdalena</p>
              </div>
            </div>
          </section>
        </footer>
      </div>
    </EditorialLayout>
  )
}
