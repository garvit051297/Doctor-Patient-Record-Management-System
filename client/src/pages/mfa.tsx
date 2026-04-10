import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ShieldCheck, RefreshCw, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MfaPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(true);
  const [otp, setOtp] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem("mediportal_user");
    if (!userStr) {
      setLocation("/login");
      return;
    }
    const user = JSON.parse(userStr);
    const email = user.email || "";
    if (email.includes("@")) {
      const [local, domain] = email.split("@");
      const maskedPart = local.length > 2 ? local.substring(0, 2) + "***" : "***";
      setMaskedPhone(maskedPart + "@" + domain);
    } else {
      setMaskedPhone("your registered email");
    }

    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Code Sent",
        description: "A 6-digit verification code has been sent to your email address.",
      });
    }, 1500);
  }, []);

  const handleResend = () => {
    setIsSending(true);
    setOtp("");
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Check Email",
        description: "If you want another code, please try signing in again.",
      });
    }, 1500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { otp });
      const user = await res.json();
      
      localStorage.setItem("mediportal_user", JSON.stringify(user));
      
      toast({
        title: "Verified",
        description: "Successfully verified your identity.",
      });
      setLocation(user.role === "admin" ? "/audit-log" : "/dashboard");
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive"
      });
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
            {isSending ? (
              <Mail className="w-8 h-8 text-primary animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {isSending ? "Sending Code..." : "Verify It's You"}
            </CardTitle>
            <CardDescription className="text-slate-500 text-base max-w-[300px] mx-auto">
              {isSending ? (
                "Sending a verification code to your email..."
              ) : (
                <span>
                  Enter the 6-digit code sent to <br/>
                  <span className="font-semibold text-slate-700">{maskedPhone}</span>
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isSending ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-8 flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex justify-center w-full">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  data-testid="input-otp"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot index={0} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                    <InputOTPSlot index={1} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                    <InputOTPSlot index={2} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                  </InputOTPGroup>
                  <div className="w-4" />
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot index={3} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                    <InputOTPSlot index={4} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                    <InputOTPSlot index={5} className="h-14 w-12 border-2 border-slate-300/60 bg-white/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-sm rounded-lg text-slate-900 font-bold text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-primary/95 hover:bg-primary group"
                disabled={isLoading || otp.length !== 6}
                data-testid="button-verify"
              >
                {isLoading ? "Verifying..." : "Verify Identity"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 bg-slate-50/30 rounded-b-xl border-t border-slate-200/50 backdrop-blur-sm">
          {!isSending && (
            <div className="text-center text-sm text-slate-500 animate-in fade-in slide-in-from-bottom-2">
              Didn't receive the code?{" "}
              <button
                className="font-semibold text-primary hover:text-primary/80 cursor-pointer transition-colors ml-1 inline-flex items-center group/btn"
                onClick={handleResend}
                data-testid="button-resend"
              >
                Resend code <RefreshCw className="ml-1 w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          )}

          <div className="text-center">
            <Link href="/login">
              <span className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors inline-flex items-center">
                <ArrowLeft className="mr-1 w-3 h-3" /> Back to sign in
              </span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}