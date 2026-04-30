import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUserLoginMutation } from "@/api/authApi";
import { UserCircle } from "lucide-react";

export const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [userLogin, { isLoading }] = useUserLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await userLogin({ email, password }).unwrap();
      
      // ✅ Save to Zustand
      setUser(res.user);

      // ✅ Store token
      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mx-auto opacity-5 pointer-events-none">
        <img src="/bg1.png" alt="" className="w-full h-full object-cover" />
      </div>
      <Card className="w-full max-w-md shadow-lg bg-background/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Sign in</CardTitle>
          <CardDescription>
            Officer & PMS Portal Access
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 text-left">
            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@berhanbanksc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
