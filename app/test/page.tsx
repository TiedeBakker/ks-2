import { Navbar } from "@/core/ui/Navbar";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-amber-600">Ontwikkel- & Testmodule</h1>
        <p className="text-slate-600">
          In deze module kunnen we op termijn knoppen toevoegen om snel dummy-kennisstructuren aan te maken en de hybride werking live te testen.
        </p>
      </main>
    </div>
  );
}