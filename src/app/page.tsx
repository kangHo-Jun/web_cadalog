import ProductTable from '@/components/ProductTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-indigo-500 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 py-12">
        <ProductTable />
      </div>

      <footer className="relative z-10 py-12 border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2025 Cafe24 Integrated Catalog. Built for professional e-commerce management.
        </div>
      </footer>
    </main>
  );
}
