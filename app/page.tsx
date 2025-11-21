import MediaLibrary from "@/components/MediaLibrary";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <MediaLibrary />
    </main>
  );
}
