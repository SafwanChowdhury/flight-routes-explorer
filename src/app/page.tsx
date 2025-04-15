import { Suspense } from "react";
import RoutesList from "@/components/RoutesList";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoutesList />
    </Suspense>
  );
}
