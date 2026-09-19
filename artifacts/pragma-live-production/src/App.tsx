import {
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  Cable,
  Lightbulb,
  type LucideIcon,
  MonitorPlay,
  RadioTower,
  Users,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/site/brand";
import { Header } from "@/components/site/header";
import { HeroMedia } from "@/components/site/hero-media";
import { ContactForm } from "@/components/site/contact-form";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import facadeImage from "@assets/pragma-facade-vehicle.jpg";

const queryClient = new QueryClient();

const capabilities: [string, string, string, LucideIcon][] = [
  [
    "01",
    "Som",
    "Clareza para cada palavra, impacto para cada momento. Sistemas pensados para a sala e para quem está em cena.",
    AudioLines,
  ],
  [
    "02",
    "Luz",
    "Desenhamos atmosferas que acompanham o ritmo da ideia, do primeiro foco ao último blackout.",
    Lightbulb,
  ],
  [
    "03",
    "Imagem",
    "LED walls, captação e transmissão: o que acontece no espaço, chega inteiro a qualquer lugar.",
    MonitorPlay,
  ],
  [
    "04",
    "Infraestrutura",
    "A camada invisível que segura tudo. Logística, rigging e energia coordenados no detalhe.",
    Cable,
  ],
  [
    "05",
    "Streaming",
    "A mesma presença, dentro e fora do espaço. Realização, distribuição e contingência em tempo real.",
    RadioTower,
  ],
  [
    "06",
    "Produção",
    "Pessoas certas, no lugar certo, antes mesmo de alguém pedir. A operação como extensão do seu time.",
    Users,
  ],
];

function Home() {
  return (
    <div className="pragma-page">
      <a className="skip-link" href="#top">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="top" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <HeroMedia />
          <div className="wrap hero-grid">
            <div className="hero-content">
              <p className="eyebrow mono">Live production / desde 2016</p>
              <h1 id="hero-title">
                A ideia entra.
                <br />
                <span>A experiência acontece.</span>
              </h1>
              <p className="hero-copy">
                Som, luz, imagem e pessoas. Uma operação integrada para
                transformar a sua ideia em um evento que marca.
              </p>
              <div className="hero-actions">
                <Button asChild size="lg">
                  <a href="#contact" data-testid="link-hero-contact">
                    Começar uma conversa <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
                <a className="text-link" href="#capabilities">
                  Conheça nossas capacidades{" "}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section intro" id="about" tabIndex={-1}>
          <div className="wrap intro-layout">
            <div>
              <div className="section-label">O que fazemos</div>
              <h2 className="section-title">
                Produção é parte da <em>ideia.</em>
              </h2>
            </div>
            <div className="intro-copy">
              <p>
                A PRAGMA entra cedo. Antes da primeira luz, existe uma conversa,
                um mapa, uma decisão. Trabalhamos ao lado de marcas, agências e
                criadores para transformar intenção em uma experiência que pode
                ser sentida.
              </p>
              <p>
                Do briefing ao último cabo recolhido, existe método. E existe
                gente.
              </p>
              <div className="number-list">
                <div className="number-item">
                  <span className="num">/ 01</span>
                  <p>Leitura precisa do que você quer dizer.</p>
                </div>
                <div className="number-item">
                  <span className="num">/ 02</span>
                  <p>Desenho técnico que não aparece, mas funciona.</p>
                </div>
                <div className="number-item">
                  <span className="num">/ 03</span>
                  <p>Execução humana, atenta e sem ruído.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section capabilities"
          id="capabilities"
          tabIndex={-1}
        >
          <div className="wrap">
            <div className="cap-head">
              <div>
                <div className="section-label">Capacidades</div>
                <h2 className="section-title">
                  Tudo conectado.
                  <br />
                  <em>Nada por acaso.</em>
                </h2>
              </div>
              <p>
                Uma operação integrada para quando a complexidade não pode
                aparecer. Você vê o resultado. A gente cuida do sistema.
              </p>
            </div>
            <div className="cap-grid">
              {capabilities.map(([index, title, copy, Icon]) => (
                <article
                  className="cap-card"
                  key={index}
                  data-testid={`card-capability-${index}`}
                >
                  <span className="cap-icon" aria-hidden="true">
                    <Icon size={23} strokeWidth={1.5} />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section work" id="work" tabIndex={-1}>
          <div className="wrap">
            <div className="section-label">Em campo</div>
            <h2 className="section-title">
              O cuidado começa <em>nos bastidores.</em>
            </h2>
            <div className="work-grid">
              <article
                className="work-feature"
                data-testid="card-project-pragma-base"
              >
                <img
                  className="work-media"
                  src={facadeImage}
                  alt="Fachada da base PRAGMA, com a van da equipe estacionada em frente"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                />
                <div className="work-bottom">
                  <p className="section-label">Base PRAGMA / Brasília, DF</p>
                  <h3>O lugar também faz parte do show.</h3>
                  <p>Uma casa para preparar, testar e fazer sair do papel.</p>
                </div>
              </article>
              <div className="work-stack">
                <article
                  className="work-tile"
                  data-testid="card-project-summit"
                >
                  <Users size={24} aria-hidden="true" />
                  <div>
                    <h3>O palco é só uma parte.</h3>
                    <p>
                      Planejamento, equipe e infraestrutura conectados para
                      cuidar de cada detalhe do encontro.
                    </p>
                  </div>
                </article>
                <article
                  className="work-tile"
                  data-testid="card-project-stream"
                >
                  <RadioTower size={24} aria-hidden="true" />
                  <div>
                    <h3>Presença não tem distância.</h3>
                    <p>
                      Captação, realização e streaming para levar a experiência
                      a quem acompanha de qualquer lugar.
                    </p>
                  </div>
                </article>
                <p className="work-statement">
                  O plano é importante.
                  <br />
                  <span>O momento é tudo.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section process" id="method" tabIndex={-1}>
          <div className="wrap process-layout">
            <div className="process-intro">
              <div className="section-label">Método</div>
              <h2 className="section-title">
                Do primeiro rascunho ao <em>último aplauso.</em>
              </h2>
              <p>
                Um bom evento parece simples. É porque cada camada foi pensada
                antes.
              </p>
            </div>
            <ol className="steps">
              {[
                [
                  "01",
                  "Escutar",
                  "Entender o que precisa ser dito, e o que não pode dar errado.",
                ],
                [
                  "02",
                  "Desenhar",
                  "Traduzir ideia em planta, timeline, rider e plano B.",
                ],
                [
                  "03",
                  "Preparar",
                  "Alinhar equipe, equipamento e expectativa na mesma frequência.",
                ],
                [
                  "04",
                  "Executar",
                  "Estar presente, atento e um passo à frente do momento.",
                ],
                [
                  "05",
                  "Entregar",
                  "Fechar o ciclo com o mesmo cuidado que abriu.",
                ],
              ].map(([num, title, copy]) => (
                <li
                  className="step"
                  key={num}
                  data-testid={`step-method-${num}`}
                >
                  <span className="step-index">{num}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section contact" id="contact" tabIndex={-1}>
          <div className="wrap contact-layout">
            <div>
              <div className="eyebrow mono">Vamos produzir</div>
              <h2>
                Tem uma ideia?
                <br />
                <span>Vamos fazer.</span>
              </h2>
              <p className="contact-note">
                Conte o que está planejando. Vamos encontrar um caminho claro
                para colocar isso em cena.
              </p>
              <a
                className="contact-email text-link"
                href="mailto:ola@pragma.live"
              >
                ola@pragma.live <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <Brand />
            <p>Fazer acontecer é o nosso método.</p>
          </div>
          <nav className="footer-links" aria-label="Navegação do rodapé">
            <a href="mailto:ola@pragma.live" data-testid="link-email">
              ola@pragma.live <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="#top" data-testid="link-back-top">
              Voltar ao topo <ArrowUp size={16} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
