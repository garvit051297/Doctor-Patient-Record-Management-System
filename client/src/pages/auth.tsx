import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const user = await res.json();
      localStorage.setItem("mediportal_user", JSON.stringify(user));
      setLocation(user.role === "admin" ? "/audit-log" : "/mfa");
    } catch (error: any) {
      const message = error?.message || "Login failed";
      if (message.startsWith("401:")) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      } else if (message.startsWith("429:")) {
        toast({
          title: "Too Many Attempts",
          description: message.replace(/^429:\s*/, ""),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-animated-gradient">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] pointer-events-none" />
      <Card className="w-full max-w-[440px] glass-card animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out relative z-10">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pt-10 pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
            <div className="w-8 h-8 border-[3px] border-primary rounded-lg rotate-45 transform transition-transform duration-700 hover:rotate-90" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500 text-base">
              Sign in to your Patient Management Portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-600 font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="h-11 bg-white/50 border-slate-200/60 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-slate-600 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="h-11 bg-white/50 border-slate-200/60 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-primary/95 hover:bg-primary"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password">
                <span className="text-sm font-medium text-slate-500 hover:text-primary cursor-pointer transition-colors">
                  Forgot password?
                </span>
              </Link>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 bg-slate-50/30 rounded-b-xl border-t border-slate-200/50 backdrop-blur-sm">
          <div className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup">
              <span className="font-semibold text-primary hover:text-primary/80 cursor-pointer transition-colors ml-1">
                Create new account here
              </span>
            </Link>
          </div>

          <div className="text-xs text-center text-slate-400 max-w-[280px] mx-auto leading-relaxed opacity-80 hover:opacity-100 transition-opacity">
            Need help? Contact the <span className="font-medium text-slate-500 cursor-pointer hover:underline">IT Service Desk</span> at <br />
            <span className="font-mono text-slate-500">xxx-xxx-xxxx</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
