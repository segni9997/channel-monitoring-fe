import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MOCK_USERS } from "@/data/mock";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate("/");
    } else {
      setError("Invalid email. Check mock data.");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2  mx-auto opacity-5 pointer-events-none">
        <img src="/bg1.png" alt="" className="w-full h-full object-cover" />
      </div>
      <Card className="w-full max-w-md shadow-lg bg-background/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Sign in</CardTitle>
          <CardDescription>
            Enter your email to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm font-medium text-destructive">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@bank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-1">Available Mock Accounts:</p>
              <ul className="list-disc pl-4 space-y-1">
                {MOCK_USERS.map(u => (
                  <li key={u.id}>{u.firstName} {u.lastName} - {u.email} ({u.role})</li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
