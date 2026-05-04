import Heading from '@/components/atoms/Heading'
import Text from '@/components/atoms/Text'

export default function ServicesSection() {
  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <Text as="span" className="services-label">Nuestros servicios</Text>
      </div>

      <div className="services-ticker">
        <div className="ticker-track">
          <Heading level={2} className="services-giant-title">Comunicación para el impacto real / Comunicación para el impacto real / Comunicación para el impacto real / </Heading>
          <Heading level={2} className="services-giant-title">Comunicación para el impacto real / Comunicación para el impacto real / Comunicación para el impacto real / </Heading>
        </div>
      </div>

      <div className="container">
        <div className="services-grid">
          {[
            { title: 'Storytelling', lead: 'Diseñamos narrativas que conectan propósito, emoción y acción desde lo humano.', body: 'Partimos de las personas, quienes hacen, reciben y transforman los proyectos para convertir ideas, procesos e impactos reales en historias relevantes.' },
            { title: 'Producción audiovisual', lead: 'Damos vida a las historias a través de fotografía, video y texto.', body: 'Creamos piezas audiovisuales alineadas con objetivos claros de comunicación. Adaptamos formatos y lenguajes según la audiencia, el canal y el contexto.' },
            { title: 'Consultoria', lead: 'Acompañamos a organizaciones en el diseño de estrategias de impacto positivo.', body: 'Pensamos desde lo que se hace hasta cómo se cuenta, asegurando coherencia entre acción y relato.' },
            { title: 'Talleres', lead: 'Hoy las organizaciones hacen cosas importantes, pero sus equipos no siempre saben cómo contarlas.', body: 'Nuestros talleres fortalecen la capacidad de los equipos para contar historias claras, humanas y estratégicas, aplicables a su trabajo diario.' },
          ].map(s => (
            <div key={s.title} className="service-card">
              <div className="service-content">
                <Heading level={3}>{s.title}</Heading>
                <Text className="service-lead">{s.lead}</Text>
                <Text>{s.body}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
