import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import hero from "@/assets/hacienda-hero.jpg";
import donLuis from "@/assets/don-luis-fundador.jpg";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros — Hacienda El Milagrito" },
      { name: "description", content: "Una hacienda familiar con más de 40 años de tradición ganadera y lechera." },
    ],
  }),
  component: Nosotros,
});

function Nosotros() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="relative h-[40vh] flex items-end">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto px-4 pb-10">
          <h1 className="font-display text-5xl md:text-6xl text-primary-foreground">Nuestra historia</h1>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 max-w-4xl space-y-10">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center gap-4 md:sticky md:top-8">
            <img src={donLuis} alt="Don Luis de Jesús Merino Guardado" className="w-48 h-48 rounded-full object-cover shadow-lg ring-4 ring-accent/30" />
            <div className="text-center">
              <div className="font-display text-xl">Don Luis de Jesús Merino</div>
              <div className="text-sm text-muted-foreground">Fundador &amp; Propietario</div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-5 text-foreground/85 leading-relaxed">
            <p>Hacienda El Milagrito fue fundada en 1978 por <strong>Don Luis de Jesús Merino Guardado</strong>, con un sueño grande: levantar una finca lechera en Sonsonate que pudiera sostener a la familia y servir a la comunidad.</p>
            <p>Hoy contamos con cerca de 100 animales entre vacas lecheras, ganado de engorde y reproductores de razas Holstein, Jersey, Brahman y Pardo Suizo, manejados con dedicación y conocimiento heredado de generación en generación.</p>
            <p>Creemos en lo simple bien hecho: pasto fresco, agua limpia, sombra, y mucho cariño. Ese es el secreto de la leche que ordeñamos todos los días al amanecer en las tierras sonsonatecas.</p>
            <h2 className="font-display text-3xl pt-4">Nuestros valores</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Bienestar animal por encima de todo.</li>
              <li>Trazabilidad y sanidad estricta.</li>
              <li>Trato justo a nuestros trabajadores y clientes.</li>
              <li>Respeto por la tierra y los recursos.</li>
            </ul>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
