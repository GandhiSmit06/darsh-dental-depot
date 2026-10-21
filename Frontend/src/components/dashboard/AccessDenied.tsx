import React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AccessDeniedProps {
  requiredRole: string;
  currentRole?: string;
}

export function AccessDenied({ requiredRole, currentRole }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-border/80">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This administrative area requires <span className="font-semibold text-foreground">{requiredRole}</span> privileges.
            {currentRole ? (
              <span> You are currently logged in with the <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted font-medium">{currentRole}</span> role.</span>
            ) : (
              <span> Please authenticate with an authorized account to continue.</span>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>

          {currentRole === "doctor" && (
            <Button asChild className="gap-2">
              <Link to="/doctor">
                <ArrowLeft className="w-4 h-4" />
                Go to Doctor Portal
              </Link>
            </Button>
          )}

          {currentRole === "shop_owner" && (
            <Button asChild className="gap-2">
              <Link to="/shop">
                <ArrowLeft className="w-4 h-4" />
                Go to Shop Dashboard
              </Link>
            </Button>
          )}

          {!currentRole && (
            <Button asChild className="gap-2">
              <Link to="/login">
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
