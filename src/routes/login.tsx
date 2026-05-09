import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/site/Logo";
import { login } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import hero from "@/assets/hero-ranch.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — El Milagrito" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@milagrito.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const s = login(email, password);
      setLoading(false);
      if (!s) {
        toast.error("Credenciales incorrectas");
      } else {
        toast.success(`Bienvenido, ${s.nombre}`);
        navigate({ to: "/admin" });
      }
    }, 400);
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative h-full flex items-end p-10">
          <div className="text-primary-foreground max-w-sm">
            <h2 className="font-display text-4xl mb-2">Bienvenido de nuevo</h2>
            <p className="text-primary-foreground/80 text-sm">Acceda a su panel de administración para gestionar el hato y la producción.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-elevated">
          <div className="mb-6"><Logo /></div>
          <h1 className="font-display text-3xl mb-1">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mb-6">Acceso para administradores y trabajadores.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="e">Correo</Label>
              <Input id="e" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="p">Contraseña</Label>
              <Input id="p" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="forest" size="lg" className="w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Cuentas de demostración:</p>
            <p>admin@milagrito.com / admin123</p>
            <p>ordeno@milagrito.com / ordeno123</p>
            <p>contador@milagrito.com / contador123</p>
          </div>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary mt-4">← Volver al sitio</Link>
        </Card>
      </div>
    </div>
  );
}
