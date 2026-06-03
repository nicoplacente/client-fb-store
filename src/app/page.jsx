import SectionContainer from "@/modules/ui/section-container";

export const metadata = {
  title: {
    absolute: "FrancoBertello74 Store",
  },
  description:
    "Sitio oficial de la comunidad de FrancoBertello74 para canjear créditos, participar en sorteos y abrir soporte.",
  keywords: [
    "FrancoBertello74",
    "Kick",
    "tienda",
    "créditos",
    "canjes",
    "sorteos",
    "soporte",
  ],
  openGraph: {
    title: "FrancoBertello74 Store",
    description:
      "Canjeá créditos, participá en sorteos y revisá tus compras de la comunidad.",
    type: "website",
    locale: "es_AR",
  },
};

export default function Home() {
  return (
    <SectionContainer>
      <div className="space-y-8 sm:space-y-10">
        <h1 className="text-center text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
          <span className="block">FRANCO BERTELLO</span>
          STORE
        </h1>

        <div className="flex flex-col justify-center gap-4 sm:gap-6">
          <iframe
            width="1246"
            className="mx-auto aspect-video h-auto w-full max-w-4xl rounded-md border-2 border-dashed border-white/50 sm:border-4"
            height="701"
            src="https://kick.com/francobertello74"
            title="FrancoBertello74"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          <a
            href="https://chromewebstore.google.com/detail/bertellitos/aeghpachelnjfcckdhdgeegpacgbnpng?hl=es-419"
            className="mx-auto inline-flex w-full max-w-xs justify-center rounded-full border-2 border-red-500 bg-gradient-to-br from-red-900/50 to-red-500/30 px-6 py-2 text-base font-semibold transition-all duration-300 hover:translate-y-0.5 hover:saturate-200 sm:w-fit sm:text-xl"
            aria-label="Instalar extensión"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            Instalar extensión
          </a>
        </div>
      </div>
    </SectionContainer>
  );
} 
