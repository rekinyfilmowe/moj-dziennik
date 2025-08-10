// app/dashboard/lessons/page.tsx
import LessonScreen from "@/components/lesson/LessonScreen";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Realizacja programu nauczania</h1>
      <LessonScreen />
    </main>
  );
}
