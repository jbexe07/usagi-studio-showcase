import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Asterisk, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import architectureImage from "@/assets/project-architecture.jpg";
import coffeeImage from "@/assets/project-coffee.jpg";
import fashionImage from "@/assets/project-fashion.jpg";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";
import logo from "@/assets/logotipo.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Usagi Studio — Sites que movem marcas" },
      { name: "description", content: "Design e desenvolvimento de sites autorais para marcas que querem sair do comum." },
      { property: "og:title", content: "Usagi Studio — Sites que movem marcas" },
      { property: "og:description", content: "Design e desenvolvimento de sites autorais para marcas que querem sair do comum." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const projects: CoverflowSlide[] = [
  { src: architectureImage, alt: "Projeto digital de arquitetura contemporânea", title: "Noma Arquitetura", subtitle: "Estratégia · UX/UI · Desenvolvimento", number: "01 / 03" },
  { src: fashionImage, alt: "Campanha digital de moda conceitual", title: "Aura Studio", subtitle: "Direção de arte · E-commerce", number: "02 / 03" },
  { src: coffeeImage, alt: "Identidade digital de marca de café", title: "Ponto Café", subtitle: "Branding · Web design", number: "03 / 03" },
];

const navItems = [
  ["Sobre", "#sobre"],
  ["Projetos", "#projetos"],
  ["Processo", "#processo"],
] as const;

// Número do WhatsApp em formato internacional, apenas dígitos (DDI + DDD + número).
// Troque pelo número oficial quando tiver, ex: "5531991234567".
const WHATSAPP_NUMBER = "5537991189566";

type ContactForm = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

function buildWhatsAppUrl(form: ContactForm): string {
  const text = [
    `Olá, Usagi Studio! Meu nome é ${form.name}.`,
    "",
    `Tipo de projeto: ${form.projectType}`,
    `E-mail: ${form.email}`,
    "",
    "Mensagem:",
    form.message,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const projectTypes = ["Site", "Landing page", "E-commerce", "Outro"] as const;

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", projectType: "Site", message: "" });
  const [sending, setSending] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }), { threshold: 0.14 });
    document.querySelectorAll("[data-reveal]").forEach((element) => reveal.observe(element));

    const moveCursor = (event: MouseEvent) => {
      dotRef.current?.style.setProperty("transform", `translate3d(${event.clientX}px, ${event.clientY}px, 0)`);
      ringRef.current?.animate({ transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0)` }, { duration: 520, fill: "forwards" });
    };
    window.addEventListener("mousemove", moveCursor);
    return () => { reveal.disconnect(); window.removeEventListener("mousemove", moveCursor); };
  }, []);

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim().slice(0, 80);
    const email = form.email.trim().slice(0, 255);
    const message = form.message.trim().slice(0, 1000);
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSending(true);
    window.open(buildWhatsAppUrl({ name, email, projectType: form.projectType, message }), "_blank", "noopener,noreferrer");
    setSending(false);
    setForm((current) => ({ ...current, name: "", email: "", message: "" }));
  };

  return (
    <main className="overflow-clip">
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />

      <header className="floating-nav">
        <a href="#inicio" className="brand" aria-label="Usagi Studio, início">
          <img src={logo} alt="Usagi Studio" className="brand-logo" />
        </a>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Navegação principal">
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a href="#contato" className="nav-cta" onClick={() => setMenuOpen(false)}>Iniciar projeto <ArrowUpRight size={14} /></a>
        </nav>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="section-wrap hero-content">
          <p className="eyebrow animate-fade-in">Tirando seu sonho do papel · Pará de Minas, MG</p>
          <h1 className="hero-title"><span>IDEIAS QUE</span><span>MOVEM <em>MARCAS.</em></span></h1>
          <div className="hero-bottom">
            <p>Estratégia, design e tecnologia para criar presenças digitais que ninguém esquece.</p>
            <a href="#projetos" className="circle-link" aria-label="Ver projetos"><ArrowDownRight size={24} /></a>
          </div>
        </div>
        <div className="hero-marquee" aria-hidden="true"><span>WEBSITES • IDENTIDADES • EXPERIÊNCIAS DIGITAIS • </span><span>WEBSITES • IDENTIDADES • EXPERIÊNCIAS DIGITAIS • </span></div>
      </section>

      <section id="sobre" className="about-section section-wrap" data-reveal>
        <div className="section-index">01 <span>Sobre</span></div>
        <div className="about-copy">
          <p className="statement">A gente não faz só sites.<br /><strong>Cria pontos de virada.</strong></p>
          <div className="about-detail">
            <Asterisk size={34} />
            <p>A Usagi Studio une pensamento estratégico, design expressivo e desenvolvimento preciso para transformar boas ideias em experiências digitais marcantes.</p>
          </div>
        </div>
      </section>

      <section id="projetos" className="projects-section" data-reveal>
        <div className="section-wrap projects-heading">
          <div className="section-index">02 <span>Projetos selecionados</span></div>
          <h2>TRABALHO QUE<br />FALA POR SI.</h2>
        </div>
        <CoverflowCarousel slides={projects} />
        <p className="drag-hint">Arraste para explorar</p>
      </section>

      <section id="processo" className="objection-section" data-reveal>
        <div className="section-wrap">
          <div className="section-index light">03 <span>Sem complicação</span></div>
          <div className="objection-grid">
            <h2>“MAS MEU PROJETO<br />AINDA ESTÁ <i>NO PAPEL.</i>”</h2>
            <div>
              <p>Ótimo. É exatamente aí que entramos.</p>
              <p>Você não precisa chegar com tudo resolvido. Nosso processo organiza suas ideias, encontra o que torna sua marca única e traduz isso em uma presença digital pronta para crescer.</p>
              <a href="#contato" className="text-link">Entenda nosso processo <ArrowUpRight size={17} /></a>
            </div>
          </div>
          <div className="benefits-grid">
            <article><span>01</span><h3>Clareza desde o início</h3><p>Você acompanha cada etapa e entende cada decisão.</p></article>
            <article><span>02</span><h3>Feito para sua marca</h3><p>Nada de template genérico ou solução reciclada.</p></article>
            <article><span>03</span><h3>Pronto para performar</h3><p>Beleza, velocidade e estratégia no mesmo projeto.</p></article>
          </div>
        </div>
      </section>

      <section id="contato" className="contact-section" data-reveal>
        <div className="section-wrap">
          <p className="eyebrow">Tem uma ideia?</p>
          <h2>VAMOS TIRAR<br />DO <em>PAPEL.</em></h2>
          <form className="contact-form" onSubmit={submitContact} noValidate={false}>
            <div className="form-grid">
              <label className="field">
                <span className="form-label">Seu nome</span>
                <input type="text" required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Como você se chama?" />
              </label>
              <label className="field">
                <span className="form-label">Seu e-mail</span>
                <input type="email" required maxLength={255} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="voce@email.com" />
              </label>
            </div>
            <div className="field">
              <span className="form-label">Tipo de projeto</span>
              <div className="type-options" role="group" aria-label="Tipo de projeto">
                {projectTypes.map((type) => (
                  <button type="button" key={type} className={type === form.projectType ? "is-active" : ""} onClick={() => setForm({ ...form, projectType: type })}>{type}</button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="form-label">Conte sobre o projeto</span>
              <textarea required maxLength={1000} rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Objetivo, prazo, referências…" />
            </label>
            <div className="form-actions">
              <button className="submit-btn" type="submit" disabled={sending}>
                Enviar pelo WhatsApp <ArrowUpRight size={18} />
              </button>
            </div>
          </form>
          <div className="footer-line"><span>© 2026 Usagi Studio</span><span>Pará de Minas · MG — Brasil</span><a href="#inicio">Voltar ao topo ↑</a></div>
        </div>
      </section>
    </main>
  );
}
