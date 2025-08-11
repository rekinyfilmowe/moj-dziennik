import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
