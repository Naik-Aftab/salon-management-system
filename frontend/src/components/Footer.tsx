export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="h-12 border-t border-slate-200 bg-white px-6 text-sm text-slate-500 flex items-center">
      {year} Salon SMS. All rights reserved.
    </footer>
  );
}
