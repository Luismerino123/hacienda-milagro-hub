import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import hero from "@/assets/hero-ranch.jpg";
import milk from "@/assets/product-milk.jpg";
import cowImg from "@/assets/cow-holstein.jpg";
import { ArrowRight, Award, Leaf, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hacienda El Milagrito — Ganado y leche fresca del campo" },
      { name: "description", content: "Hacienda ganadera familiar. Catálogo de ganado lechero y de engorde, leche fresca diaria, atención personalizada." },
      { property: "og:title", content: "Hacienda El Milagrito" },
      { property: "og:description", content: "Tradición ganadera, leche fresca y ganado de calidad." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center">
        <img src={hero} alt="Hacienda El Milagrito" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto px-4 py-20 text-primary-foreground">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur px-4 py-1.5 border border-primary-foreground/20 text-xs uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Tradición desde 1978
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-balance">
              Del campo a su mesa, con el cuidado de siempre.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-xl">
              Conozca nuestro hato lechero, ganado en venta y la leche fresca que producimos cada amanecer en Hacienda El Milagrito.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="xl" variant="hero">
                <Link to="/catalogo">Ver catálogo <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Link to="/contacto">Contáctenos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: "100% pastoreo natural", desc: "Nuestras vacas se alimentan en potreros abiertos con pasto fresco todos los días." },
            { icon: ShieldCheck, title: "Sanidad certificada", desc: "Control veterinario constante, vacunación al día y trazabilidad por cada animal." },
            { icon: Award, title: "Genética seleccionada", desc: "Razas Holstein, Jersey, Brahman y Pardo Suizo, criadas con cuidado generación tras generación." },
          ].map((v, i) => (
            <Card key={i} className="p-7 bg-card border-border shadow-soft hover:shadow-elevated transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src={cowImg} alt="Vaca lechera" loading="lazy" className="rounded-2xl shadow-elevated w-full aspect-[4/5] object-cover" />
          </div>
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold">Sobre nosotros</span>
            <h2 className="font-display text-4xl md:text-5xl text-balance">Una familia, una vocación: el campo.</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hacienda El Milagrito nació hace más de cuatro décadas como un sueño familiar. Hoy contamos con cerca de 100 cabezas de ganado, un equipo comprometido y procesos modernos que respetan lo esencial: el bienestar del animal y la calidad del producto.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cada vaca tiene su nombre, su historia y su lugar. Esa cercanía es lo que nos hace diferentes.
            </p>
            <Button asChild variant="forest"><Link to="/nosotros">Conozca nuestra historia</Link></Button>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Nuestros productos</span>
          <h2 className="font-display text-4xl md:text-5xl mt-2">Frescura del campo</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden group cursor-pointer shadow-soft hover:shadow-elevated transition-shadow">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={milk} alt="Leche fresca" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl mb-1">Leche fresca diaria</h3>
              <p className="text-sm text-muted-foreground">Recolección dos veces al día, distribución directa a clientes y queserías locales.</p>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer shadow-soft hover:shadow-elevated transition-shadow">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={cowImg} alt="Ganado en venta" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="p-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl mb-1">Ganado en venta</h3>
                <p className="text-sm text-muted-foreground">Lecheras, engorde y reproductores. Trazabilidad completa.</p>
              </div>
              <Button asChild variant="gold" size="sm"><Link to="/catalogo">Ver catálogo</Link></Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-balance">¿Interesado en conocer la hacienda?</h2>
          <p className="text-primary-foreground/80 mb-8">Visítenos o escríbanos. Le atenderemos personalmente.</p>
          <Button asChild size="xl" variant="hero"><Link to="/contacto">Contáctenos</Link></Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
