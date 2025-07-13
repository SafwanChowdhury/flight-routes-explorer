import { Suspense } from "react";
import CircularRoutesList from "@/components/CircularRoutesList";

export default function CircularRoutesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CircularRoutesList />
    </Suspense>
  );
}
