import SectionContainer from "@/modules/ui/section-container";
import Carrousel from "@/modules/carrousel/Carrousel";

export default function Home() {
  return (
    <SectionContainer>
      <div>
        <h1 className="text-6xl font-bold mb-18 text-center">
          <span className="text-7xl">FRANCO BERTELLO</span> <br />
          STORE
        </h1>

        <div className="flex justify-center flex-col gap-9">
          <iframe
            width="1246"
            className="aspect-video h-96 w-3xl mx-auto border-dashed border-4 border-white/50 rounded-md"
            height="701"
            src="https://www.youtube.com/embed/1vl9vioLo7o?list=RD1vl9vioLo7o"
            title="Nico Placente - My Head"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>

          <a
            href="#"
            className="text-xl font-semibold gap-2 px-6 py-1.5 rounded-full border-2 w-fit mx-auto bg-gradient-to-br from-red-900/50 to-red-500/30 border-red-500 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
            aria-label="Instalar extensión"
            rel="noopener noreferrer nofollow"
          >
            Instalar extensión
          </a>
        </div>
      </div>

      <Carrousel />
    </SectionContainer>
  );
}
