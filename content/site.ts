// Company details and page copy. Edit freely: every page reads from here.

export const languages = { en: "English", es: "Español", it: "Italiano" } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";

// Same in every language
export const site = {
  name: "it-tudes",
  domain: "it-tudes.tech",
  url: "https://it-tudes.tech",
  email: "hello@it-tudes.tech", // TODO: confirm the public contact address
  // Shown in the footer when set (required on Italian company websites).
  legalName: "",
  vatId: "Y5825223G",
  // "Technologies" box. TODO: keep only what you want to be hired for.
  technologies: [".NET", "C#", "Java", "TypeScript", "React", "Vue", "PostgreSQL", "SQL Server", "Docker", "Linux", "gRPC", "FIX"],
};

interface Item { title: string; text: string }

interface Copy {
  description: string;
  hero: { text: string; primary: string; secondary: string };
  services: (Item & { tags: string[] })[];
  approach: { intro: string; steps: Item[] };
  principles: Item[];
  /** The live code editor section (home page) */
  editor: { title: string; text: string; alt: string };
  about: string;
  contact: { title: string; text: string; steps: string[] };
  /** Short line in the side boxes */
  contactText: string;
}

// Per-language copy. Keep the lists the same length in every language.
export const copy: Record<Lang, Copy> = {
  en: {
    description:
      "it-tudes is a software engineering company. We design, build and run custom software: platforms, integrations and data flows that keep working long after launch.",
    hero: {
      text: "it-tudes is a software engineering company. We design, build and run the software behind your business: platforms, integrations and data flows that keep working long after launch. Small senior team, direct contact, no hand-offs.",
      primary: "Start a project",
      secondary: "See our work",
    },
    services: [
      { title: "Custom software", text: "Back-end platforms, web applications and APIs designed around how your business actually works.", tags: ["Platforms", "Web apps", "APIs"] },
      { title: "System integration", text: "Connect what you already have, from ERPs and payment providers to exchanges and partner APIs, without replacing systems that work.", tags: ["APIs", "Messaging", "Financial protocols"] },
      { title: "Cloud & DevOps", text: "Infrastructure you can rebuild from scratch: containers, CI/CD, monitoring and backups that are tested, not assumed.", tags: ["Containers", "CI/CD", "Observability"] },
      { title: "Modernisation", text: "Move legacy applications to current technology step by step, keeping the business running during the change.", tags: ["Legacy", "Migration", "Refactoring"] },
      { title: "Data & automation", text: "Pipelines, reports and automated workflows that remove manual steps, with AI where it earns its place.", tags: ["Data pipelines", "Reporting", "AI"] },
      { title: "Technical consulting", text: "Architecture reviews, code audits and senior engineers who join your team for as long as you need them.", tags: ["Architecture", "Audits", "Team extension"] },
    ],
    approach: {
      intro: "A consultative approach: we start from the problem, not from a technology.",
      steps: [
        { title: "Understand", text: "We learn your processes, constraints and existing systems before proposing anything." },
        { title: "Design", text: "A clear architecture and plan, with scope, timing and cost you can check." },
        { title: "Build", text: "Short iterations with working software you can see and test at every step." },
        { title: "Run", text: "We deploy, monitor and maintain what we build, and keep it up to date." },
      ],
    },
    principles: [
      { title: "Senior people, direct contact", text: "You talk to the engineers who write the code. No account managers in between." },
      { title: "Built to last", text: "Readable code, tests and documentation, so the system stays maintainable, by us or by your team." },
      { title: "Integrate, don't replace", text: "We extend and connect what already works instead of starting from zero." },
      { title: "Technology follows the problem", text: "We pick tools for your context, not for our habits." },
    ],
    editor: {
      title: "Meanwhile, in our editor",
      text: "Real patterns, steady rhythm, keep coding!",
      alt: "Animation: an editor typing C# code, fixing a typo now and then",
    },
    about:
      "it-tudes is a software engineering company. We take systems from the first idea to production, and we stay to run them.",
    contact: {
      title: "Let's talk about your project",
      text: "Tell us what you are building, or what needs fixing.",
      steps: [
        "You write to us with a few lines about the project.",
        "We reply with questions and a first assessment.",
        "We agree on scope, timing and cost, then start.",
      ],
    },
    contactText: "Tell us what you are building.",
  },

  es: {
    description:
      "it-tudes es una empresa de ingeniería de software. Diseñamos, desarrollamos y mantenemos software a medida: plataformas, integraciones y flujos de datos que siguen funcionando mucho después del lanzamiento.",
    hero: {
      text: "it-tudes es una empresa de ingeniería de software. Diseñamos, desarrollamos y mantenemos el software que mueve tu negocio: plataformas, integraciones y flujos de datos que siguen funcionando mucho después del lanzamiento. Equipo senior y reducido, trato directo, sin intermediarios.",
      primary: "Empezar un proyecto",
      secondary: "Ver nuestro trabajo",
    },
    services: [
      { title: "Software a medida", text: "Plataformas backend, aplicaciones web y APIs diseñadas en torno a cómo funciona realmente tu negocio.", tags: ["Plataformas", "Aplicaciones web", "APIs"] },
      { title: "Integración de sistemas", text: "Conectamos lo que ya tienes, desde ERPs y pasarelas de pago hasta mercados financieros y APIs de socios, sin sustituir los sistemas que funcionan.", tags: ["APIs", "Mensajería", "Protocolos financieros"] },
      { title: "Cloud y DevOps", text: "Infraestructura que se puede reconstruir desde cero: contenedores, CI/CD, monitorización y copias de seguridad probadas, no supuestas.", tags: ["Contenedores", "CI/CD", "Observabilidad"] },
      { title: "Modernización", text: "Llevamos aplicaciones heredadas a tecnología actual paso a paso, sin detener el negocio durante el cambio.", tags: ["Legacy", "Migración", "Refactorización"] },
      { title: "Datos y automatización", text: "Pipelines, informes y flujos automatizados que eliminan pasos manuales, con IA donde de verdad aporta.", tags: ["Pipelines de datos", "Informes", "IA"] },
      { title: "Consultoría técnica", text: "Revisiones de arquitectura, auditorías de código e ingenieros senior que se suman a tu equipo el tiempo que haga falta.", tags: ["Arquitectura", "Auditorías", "Refuerzo de equipo"] },
    ],
    approach: {
      intro: "Un enfoque consultivo: partimos del problema, no de una tecnología.",
      steps: [
        { title: "Entender", text: "Conocemos tus procesos, limitaciones y sistemas existentes antes de proponer nada." },
        { title: "Diseñar", text: "Una arquitectura y un plan claros, con alcance, plazos y costes que puedes verificar." },
        { title: "Desarrollar", text: "Iteraciones cortas con software funcionando que puedes ver y probar en cada paso." },
        { title: "Operar", text: "Desplegamos, supervisamos y mantenemos lo que construimos, y lo tenemos siempre al día." },
      ],
    },
    principles: [
      { title: "Perfiles senior, trato directo", text: "Hablas con los ingenieros que escriben el código, sin gestores de cuenta de por medio." },
      { title: "Hecho para durar", text: "Código legible, tests y documentación, para que el sistema siga siendo mantenible, por nosotros o por tu equipo." },
      { title: "Integrar, no sustituir", text: "Ampliamos y conectamos lo que ya funciona en lugar de empezar de cero." },
      { title: "La tecnología sigue al problema", text: "Elegimos las herramientas según tu contexto, no según nuestras costumbres." },
    ],
    editor: {
      title: "Mientras tanto, en nuestro editor",
      text: "Patrones reales, ritmo constante y sigue programando!",
      alt: "Animación: un editor escribiendo código C# y corrigiendo alguna errata",
    },
    about:
      "it-tudes es una empresa de ingeniería de software. Llevamos cada sistema desde la primera idea hasta producción, y nos quedamos para mantenerlo en marcha.",
    contact: {
      title: "Hablemos de tu proyecto",
      text: "Cuéntanos qué estás construyendo, o qué hay que arreglar.",
      steps: [
        "Nos escribes unas líneas sobre el proyecto.",
        "Te respondemos con preguntas y una primera valoración.",
        "Acordamos alcance, plazos y costes, y empezamos.",
      ],
    },
    contactText: "Cuéntanos qué estás construyendo.",
  },

  it: {
    description:
      "it-tudes è una società di ingegneria del software. Progettiamo, sviluppiamo e gestiamo software su misura: piattaforme, integrazioni e flussi di dati che continuano a funzionare ben oltre il lancio.",
    hero: {
      text: "it-tudes è una società di ingegneria del software. Progettiamo, sviluppiamo e gestiamo il software che fa funzionare la tua azienda: piattaforme, integrazioni e flussi di dati che continuano a funzionare ben oltre il lancio. Team piccolo e senior, contatto diretto, nessun passaggio di mano.",
      primary: "Avvia un progetto",
      secondary: "Guarda i nostri lavori",
    },
    services: [
      { title: "Software su misura", text: "Piattaforme backend, applicazioni web e API progettate attorno a come lavora davvero la tua azienda.", tags: ["Piattaforme", "Web app", "API"] },
      { title: "Integrazione di sistemi", text: "Colleghiamo ciò che hai già, dagli ERP ai sistemi di pagamento fino a mercati finanziari e API dei partner, senza sostituire i sistemi che funzionano.", tags: ["API", "Messaggistica", "Protocolli finanziari"] },
      { title: "Cloud e DevOps", text: "Infrastruttura che si può ricostruire da zero: container, CI/CD, monitoraggio e backup verificati, non dati per scontati.", tags: ["Container", "CI/CD", "Osservabilità"] },
      { title: "Modernizzazione", text: "Portiamo le applicazioni legacy su tecnologie attuali un passo alla volta, senza fermare l'azienda durante il cambiamento.", tags: ["Legacy", "Migrazione", "Refactoring"] },
      { title: "Dati e automazione", text: "Pipeline, report e flussi automatici che eliminano i passaggi manuali, con l'IA dove porta un vantaggio reale.", tags: ["Data pipeline", "Report", "IA"] },
      { title: "Consulenza tecnica", text: "Revisioni di architettura, audit del codice e ingegneri senior che affiancano il tuo team per tutto il tempo necessario.", tags: ["Architettura", "Audit", "Team extension"] },
    ],
    approach: {
      intro: "Un approccio consulenziale: partiamo dal problema, non da una tecnologia.",
      steps: [
        { title: "Capire", text: "Conosciamo processi, vincoli e sistemi esistenti prima di proporre qualsiasi cosa." },
        { title: "Progettare", text: "Un'architettura e un piano chiari, con perimetro, tempi e costi verificabili." },
        { title: "Sviluppare", text: "Iterazioni brevi con software funzionante che puoi vedere e provare a ogni passo." },
        { title: "Gestire", text: "Rilasciamo, monitoriamo e manteniamo ciò che costruiamo, e lo teniamo aggiornato." },
      ],
    },
    principles: [
      { title: "Persone senior, contatto diretto", text: "Parli con gli ingegneri che scrivono il codice, senza account manager in mezzo." },
      { title: "Fatto per durare", text: "Codice leggibile, test e documentazione, perché il sistema resti manutenibile, da noi o dal tuo team." },
      { title: "Integrare, non sostituire", text: "Estendiamo e colleghiamo ciò che già funziona invece di ripartire da zero." },
      { title: "La tecnologia segue il problema", text: "Scegliamo gli strumenti in base al tuo contesto, non alle nostre abitudini." },
    ],
    editor: {
      title: "Nel frattempo, nel nostro editor",
      text: "Pattern reali, ritmo costante e continua a programmare!",
      alt: "Animazione: un editor che scrive codice C# e corregge qualche refuso",
    },
    about:
      "it-tudes è una società di ingegneria del software. Portiamo ogni sistema dalla prima idea alla produzione, e restiamo a gestirlo.",
    contact: {
      title: "Parliamo del tuo progetto",
      text: "Raccontaci cosa stai costruendo, o cosa c'è da sistemare.",
      steps: [
        "Ci scrivi due righe sul progetto.",
        "Ti rispondiamo con domande e una prima valutazione.",
        "Concordiamo perimetro, tempi e costi, e si parte.",
      ],
    },
    contactText: "Raccontaci cosa stai costruendo.",
  },
};
