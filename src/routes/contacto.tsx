import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Hacienda El Milagrito" },
      { name: "description", content: "Escríbanos por WhatsApp o formulario. Lo atendemos personalmente." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [enviando, setEnviando] = useState(false);
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      toast.success("Mensaje enviado. Le responderemos pronto.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  }
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Contacto</span>
          <h1 className="font-display text-5xl">Hablemos</h1>
          <p className="text-muted-foreground">Estamos a la orden para ventas, visitas guiadas o pedidos de leche.</p>
          <div className="space-y-3 pt-4">
            <Card className="p-4 flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /> +503 7000 0000</Card>
            <Card className="p-4 flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> Cantón El Milagrito, El Salvador</Card>
            <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
              <a href="https://wa.me/50370000000" target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5" /> Escribir por WhatsApp</a>
            </Button>
          </div>
        </div>
        <Card className="p-6 shadow-soft">
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label htmlFor="n">Nombre</Label><Input id="n" required /></div>
            <div><Label htmlFor="t">Teléfono</Label><Input id="t" required /></div>
            <div><Label htmlFor="m">Mensaje</Label><Textarea id="m" rows={5} required /></div>
            <Button type="submit" variant="forest" size="lg" className="w-full" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar mensaje"}
            </Button>
          </form>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
