import SectionContainer from "@/modules/ui/section-container";
import Link from "next/link";
import {
  IconArrowRight,
  IconBrandChrome,
  IconGift,
  IconShoppingBag,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    <SectionContainer className="space-y-6 lg:space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.03] sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-300/70 to-transparent" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase text-red-100">
              <IconSparkles size={15} />
              Marketplace oficial
            </div>
            <div>
              <h1 className="text-4xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                FRANCO
                <span className="block text-red-400">BERTELLO</span>
                STORE
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-7 text-neutral-400 sm:text-lg">
                Canjea creditos, participa en sorteos y desbloquea recompensas
                de la comunidad con una experiencia rapida, oscura y premium.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/market"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none focus:ring-2 focus:ring-red-300/50"
              >
                Ir a la tienda
                <IconArrowRight size={18} />
              </Link>
              <Link
                href="/gifts"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/35 bg-[#1A1A1A] px-5 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/12 focus:outline-none focus:ring-2 focus:ring-red-300/40"
              >
                Ver sorteos
                <IconGift size={18} />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-2 shadow-2xl shadow-black/40">
            <iframe
              width="1246"
              className="aspect-video h-auto w-full rounded-lg"
              height="701"
              src="https://player.kick.com/francobertello74"
              title="FrancoBertello74"
              loading="eager"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; storage-access; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#121212]/88 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-black uppercase text-red-300">Extension</p>
          <h2 className="mt-1 text-xl font-black text-white">
            Suma la experiencia Bertellitos a Chrome
          </h2>
        </div>
        <a
          href="https://chromewebstore.google.com/detail/bertellitos/aeghpachelnjfcckdhdgeegpacgbnpng?hl=es-419"
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/35 bg-[#1A1A1A] px-5 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/12 focus:outline-none focus:ring-2 focus:ring-red-300/40 sm:w-fit"
          aria-label="Instalar extensión"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          <IconBrandChrome size={18} />
          Instalar extension
        </a>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <HomeFeature
          icon={IconShoppingBag}
          title="Canjes directos"
          text="Productos, codigos y beneficios organizados para encontrar rapido lo que queres desbloquear."
        />
        <HomeFeature
          icon={IconTrophy}
          title="Competencia viva"
          text="Ranking, puntos y creditos conectados a la actividad real de la comunidad."
        />
        <HomeFeature
          icon={IconGift}
          title="Sorteos activos"
          text="Participa con creditos, revisa estados y consulta resultados desde el mismo ecosistema."
        />
      </div>
    </SectionContainer>
  );
}

function HomeFeature({ icon: Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#121212]/88 p-5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:border-red-300/25 hover:bg-[#1A1A1A]/90">
      <span className="grid size-11 place-items-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-100">
        <Icon size={21} />
      </span>
      <h2 className="mt-5 text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-neutral-400">
        {text}
      </p>
    </article>
  );
}
