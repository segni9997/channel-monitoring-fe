import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export const SuperLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.email === email && user?.password === password) {
      navigate("/");
    } else {
      setError("Invalid administrative credentials.");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decoration for Super Login */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-2xl bg-background/80 backdrop-blur-xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Privileged Access</CardTitle>
          <CardDescription>
            System Owner & Root Authorization
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 text-left">
            {error && (
              <div className="text-xs font-medium text-destructive bg-destructive/10 p-2 rounded border border-destructive/20 text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Identity (Email)
              </label>
              <Input
                id="email"
                type="text"
                placeholder="root@system"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Access Key
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            
            <div className="pt-2">
              <div className="p-3 rounded-md bg-secondary/50 border border-border text-[10px] text-muted-foreground">
                <p>Establishing secure tunnel... identity validation required for root privileges. Domain restrictions are bypassed for this gateway.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full shadow-lg shadow-primary/20">
              Authorize Root Access
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
