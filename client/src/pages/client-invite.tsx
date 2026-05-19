import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import staffosLogo from "@/assets/staffos logo 2.png";

function useInviteToken(): string {
  const [location] = useLocation();
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("token");
    if (fromUrl) return fromUrl;
  }
  const match = location.match(/[?&]token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

type InvitePreview =
  | { valid: true; name: string; email: string; companyName: string; expiresAt: string }
  | { valid: false; message: string };

export default function ClientInvitePage() {
  const token = useInviteToken();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const { data: preview, isLoading, error } = useQuery<InvitePreview>({
    queryKey: ["/api/client/invites/validate", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/client/invites/validate?token=${encodeURIComponent(token)}`,
        undefined,
      );
      const body = await res.json();
      if (!res.ok) {
        return { valid: false as const, message: body.message || "Invalid invite" };
      }
      return body as InvitePreview;
    },
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const res = await apiRequest("POST", "/api/client/invites/accept", {
        token,
        password,
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Failed to accept invitation");
      }
      return body;
    },
    onSuccess: () => {
      setAccepted(true);
      toast({
        title: "Account ready",
        description: "You can sign in with your email and new password.",
      });
    },
    onError: (e: Error) => {
      toast({
        title: "Could not complete setup",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!token && !isLoading) {
      // no token in URL
    }
  }, [token, isLoading]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>
              This invitation link is missing a token. Ask your Client Admin to send a new invite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employer-login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const invalidPreview =
    preview && "valid" in preview && preview.valid === false
      ? preview
      : error
        ? { valid: false as const, message: "Could not load invitation" }
        : null;

  if (invalidPreview && !accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Invitation unavailable
            </CardTitle>
            <CardDescription>{invalidPreview.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/employer-login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              You&apos;re all set
            </CardTitle>
            <CardDescription>
              Your Client Member account has been created. Sign in to open your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/employer-login")}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const valid = preview && "valid" in preview && preview.valid === true ? preview : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-3">
          <img src={staffosLogo} alt="StaffOS" className="h-12 w-12 mx-auto rounded-full object-cover" />
          <CardTitle>Join {valid?.companyName || "your team"}</CardTitle>
          <CardDescription>
            {valid?.name}, set a password to accept your Client Member invitation for{" "}
            <strong>{valid?.email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              acceptMutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={6}
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <Alert variant="destructive">
                <AlertDescription>Passwords do not match</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={
                acceptMutation.isPending ||
                password.length < 6 ||
                password !== confirmPassword
              }
            >
              {acceptMutation.isPending ? "Creating account…" : "Accept invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
