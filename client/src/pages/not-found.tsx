import { Link } from "wouter";
import notFoundAnimation from "@/assets/animations/404.json";
import { LottiePlayer } from "@/components/common/LottiePlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-lg md:max-w-2xl">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="w-full max-w-md md:max-w-lg aspect-video max-h-[min(50vh,320px)] mx-auto">
            <LottiePlayer animationData={notFoundAnimation} className="h-full w-full" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">404 — Page not found</h1>
            <p className="text-sm text-gray-600">
              This URL does not match any page in the app. Check the address or go back to a
              known route.
            </p>
          </div>

          <Button asChild variant="default">
            <Link href="/">Go to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
