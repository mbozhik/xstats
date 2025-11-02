import Container from '~/global/container'
import StatsGenerator from '~~/index/stats-generator'
import {H1, SPAN} from '~/ui/typography'

export default function IndexPage() {
  return (
    <Container>
      <section data-section="hero-index" className="text-center space-y-2">
        <H1>Generate Your X Card</H1>
        <SPAN className="text-muted-foreground">Enter your X username to create a personalized card</SPAN>
      </section>

      <StatsGenerator />
    </Container>
  )
}
