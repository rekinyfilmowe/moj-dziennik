import NewStudentForm from "./ui-form";

export default function NewStudentPage() {
  return (
    <main className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Nowy uczeń</h1>
      <NewStudentForm />
    </main>
  );
}
