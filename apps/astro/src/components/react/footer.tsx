import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-cyan-500/5 to-orange-500/5" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <a href="/" className="text-xl font-bold text-white hover:text-orange-400 transition-colors">
            Cloudflare Native Kit
          </a>

          <nav className="text-sm" aria-label="quick links">
            <ul className="flex gap-x-8">
              <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </nav>

          <div className="flex gap-x-6">
            <a 
              href="https://github.com/br3nden/cloudflare-native-web-starter-kit" 
              aria-label="Cloudflare Native Kit on GitHub"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Cloudflare Native Kit. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a href="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 