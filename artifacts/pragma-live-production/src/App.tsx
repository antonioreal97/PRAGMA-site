import { type FormEvent, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import coverImage from '@assets/pragma-brand-cover.png';
import facadeImage from '@assets/pragma-facade-vehicle.png';
import heroVideo from '@assets/1108328_1080p_4k_1280x720_1789673316521.mp4';

const queryClient = new QueryClient();

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-label="PRAGMA symbol">
      <path d="M8 5h8v25H8zM16 5h8c6.4 0 10 3.4 10 8.2S30.4 21.5 24 21.5h-5v-7h4.5c2 0 3.1-.5 3.1-1.6s-1.1-1.6-3.1-1.6H16zM19 27h8l7 5H19z" fill="currentColor" />
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a className="brand" href="#top" onClick={closeMenu} data-testid="link-home">
          <Mark />
          <span className="brand-word">PRAGMA<small>LIVE PRODUCTION</small></span>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" data-testid="button-menu">
          {menuOpen ? '×' : '≡'}
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Navegação principal">
          <a href="#capabilities" onClick={closeMenu} data-testid="link-capabilities">Capacidades</a>
          <a href="#method" onClick={closeMenu} data-testid="link-method">Método</a>
          <a href="#work" onClick={closeMenu} data-testid="link-work">Projetos</a>
          <a href="#contact" onClick={closeMenu} className="nav-cta" data-testid="link-contact">Falar com a PRAGMA</a>
        </nav>
      </div>
    </header>
  );
}

const capabilities = [
  ['01', 'Som', 'Clareza para cada palavra, impacto para cada momento. Sistemas pensados para a sala e para quem está em cena.', '⌁'],
  ['02', 'Luz', 'Desenhamos atmosferas que acompanham o ritmo da ideia — do primeiro foco ao último blackout.', '✦'],
  ['03', 'Imagem', 'LED walls, captação e transmissão: o que acontece no espaço, chega inteiro a qualquer lugar.', '▣'],
  ['04', 'Infraestrutura', 'A camada invisível que segura tudo. Logística, rigging e energia coordenados no detalhe.', '⌗'],
  ['05', 'Streaming', 'A mesma presença, dentro e fora do venue. Realização, distribuição e contingência em tempo real.', '◌'],
  ['06', 'Produção', 'Pessoas certas, no lugar certo, antes mesmo de alguém pedir. A operação como extensão do seu time.', '→'],
];

function Home() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return (
    <main className="pragma-page" id="top">
      <div className="noise" />
      <Header />
      <section className="hero" aria-label="PRAGMA Live Production">
        <video
          className="hero-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={coverImage}
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow mono reveal">Live production / desde 2016</div>
            <h1 className="reveal delay-1">A ideia<br />entra.<br /><span>A experiência</span><br />acontece.</h1>
          </div>
          <div className="hero-copy reveal delay-2">
            <strong>Fazer acontecer<br />é o nosso método.</strong>
            Coordenamos som, luz, imagem e pessoas para que o seu evento tenha presença — antes, durante e depois do palco.
            <div style={{ marginTop: 27 }}>
              <a href="#contact" className="button-primary mono" data-testid="link-hero-contact">Começar uma conversa ↗</a>
            </div>
          </div>
        </div>
        <div className="hero-side-line mono">Ideias ganham forma</div>
        <div className="wrap hero-meta mono">
          <span><i className="live-dot" />sistema online</span>
          <span>São Paulo / Brasil — 2024—25</span>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><div className="ticker-track">
        {Array.from({ length: 2 }).map((_, index) => <span key={index}>planejamento</span>)}
        {Array.from({ length: 2 }).map((_, index) => <span key={`b-${index}`}>pessoas</span>)}
        {Array.from({ length: 2 }).map((_, index) => <span key={`c-${index}`}>execução</span>)}
        {Array.from({ length: 2 }).map((_, index) => <span key={`d-${index}`}>presença</span>)}
      </div></div>

      <section className="section intro" id="about">
        <div className="wrap intro-layout">
          <div>
            <div className="eyebrow mono">01 / O que fazemos</div>
            <h2 className="section-title">Produção não é suporte. É parte da <em>ideia.</em></h2>
          </div>
          <div className="intro-copy">
            <p>A PRAGMA entra cedo. Antes da primeira luz, existe uma conversa, um mapa, uma decisão. Trabalhamos ao lado de marcas, agências e criadores para transformar intenção em uma experiência que pode ser sentida.</p>
            <p>Do briefing ao último cabo recolhido, existe método. E existe gente.</p>
            <div className="number-list">
              <div className="number-item"><span className="num">/ 01</span><p>Leitura precisa do que você quer dizer.</p></div>
              <div className="number-item"><span className="num">/ 02</span><p>Desenho técnico que não aparece — mas funciona.</p></div>
              <div className="number-item"><span className="num">/ 03</span><p>Execução humana, atenta e sem ruído.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section capabilities" id="capabilities">
        <div className="wrap">
          <div className="cap-head">
            <div><div className="eyebrow mono">02 / Capacidades</div><h2 className="section-title">Tudo conectado.<br /><em>Nada por acaso.</em></h2></div>
            <p>Uma operação integrada para quando a complexidade não pode aparecer. Você vê o resultado. A gente cuida do sistema.</p>
          </div>
          <div className="cap-grid">
            {capabilities.map(([index, title, copy, icon]) => <article className="cap-card" key={index} data-testid={`card-capability-${index}`}>
              <span className="cap-index">{index}</span><span className="cap-icon" aria-hidden="true">{icon}</span>
              <h3>{title}</h3><p>{copy}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="section statement" aria-label="Manifesto PRAGMA">
        <div className="wrap statement-inner">
          <div className="eyebrow mono" style={{ justifyContent: 'center' }}>03 / Nosso ponto de vista</div>
          <blockquote>O plano é importante.<br /><span>O momento é tudo.</span></blockquote>
        </div>
      </section>

      <section className="section work" id="work">
        <div className="wrap">
          <div className="eyebrow mono">04 / Em campo</div>
          <h2 className="section-title">Quando a operação<br />vira <em>memória.</em></h2>
          <div className="work-grid">
            <article className="work-feature" style={{ backgroundImage: `url(${facadeImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} data-testid="card-project-pragma-base">
              <div className="work-label mono">Base PRAGMA / São Paulo</div>
              <div className="work-bottom"><div><div className="mono" style={{ color: 'var(--acid)' }}>01 — presença</div><h3>O lugar também<br />faz parte do show.</h3></div><p>Uma casa para preparar, testar e fazer sair do papel.</p></div>
            </article>
            <div className="work-stack">
              <article className="work-tile one" data-testid="card-project-summit"><div className="work-tile-content"><div className="mono" style={{ color: 'var(--acid)' }}>02 — encontro</div><h3>O palco é só<br />uma parte.</h3></div></article>
              <article className="work-tile two" data-testid="card-project-stream"><div className="work-tile-content"><div className="mono" style={{ color: 'var(--acid)' }}>03 — transmissão</div><h3>Presença não<br />tem distância.</h3></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="section process" id="method">
        <div className="wrap process-layout">
          <div className="process-intro"><div className="eyebrow mono">05 / Método</div><h2 className="section-title">Do primeiro<br />rascunho ao<br /><em>último aplauso.</em></h2><p>Um bom evento parece simples. É porque cada camada foi pensada antes.</p></div>
          <div className="steps">
            {[
              ['01', 'Escutar', 'Entender o que precisa ser dito — e o que não pode dar errado.'],
              ['02', 'Desenhar', 'Traduzir ideia em planta, timeline, rider e plano B.'],
              ['03', 'Preparar', 'Alinhar equipe, equipamento e expectativa na mesma frequência.'],
              ['04', 'Executar', 'Estar presente, atento e um passo à frente do momento.'],
              ['05', 'Entregar', 'Fechar o ciclo com o mesmo cuidado que abriu.'],
            ].map(([num, title, copy]) => <div className="step" key={num} data-testid={`step-method-${num}`}><span className="step-index">{num}</span><div><h3>{title}</h3><p>{copy}</p></div><span className="step-mark">↗</span></div>)}
          </div>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="wrap contact-layout">
          <div><div className="eyebrow mono">06 / Vamos produzir</div><h2>Tem uma ideia?<br /><span>Vamos fazer.</span></h2><p className="contact-note">Conte o que está planejando. A gente responde com perguntas boas, um caminho claro e a vontade de colocar isso em cena.</p></div>
          <form className="contact-form" onSubmit={handleSubmit} data-testid="form-contact">
            <div className="field"><label className="mono" htmlFor="name">Seu nome</label><input id="name" name="name" required placeholder="Como podemos te chamar?" data-testid="input-name" /></div>
            <div className="field"><label className="mono" htmlFor="email">Seu e-mail</label><input id="email" type="email" name="email" required placeholder="voce@empresa.com" data-testid="input-email" /></div>
            <div className="field"><label className="mono" htmlFor="project">O que vamos colocar de pé?</label><textarea id="project" name="project" required placeholder="Evento, conteúdo, transmissão..." data-testid="input-project" /></div>
            <div className="form-foot">{submitted ? <span className="form-message" data-testid="status-form-success">Recebido. A sala já está acesa.</span> : <span className="mono" style={{ color: 'var(--paper-dim)' }}>retorno em até 1 dia útil</span>}<button className="submit" type="submit" data-testid="button-submit-contact">Enviar briefing ↗</button></div>
          </form>
        </div>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><span className="mono">PRAGMA LIVE PRODUCTION — fazer acontecer é o nosso método.</span><span className="mono"><a href="mailto:ola@pragma.live" data-testid="link-email">ola@pragma.live</a> &nbsp; / &nbsp; <a href="#top" data-testid="link-back-top">voltar ao topo ↑</a></span></div></footer>
    </main>
  );
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;