import Image from "next/image";
import updateLogo from "./assests/update logo.png";

const productLinks = ["Features", "Pricing", "How It Works", "Changelog"];
const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="inline-flex items-center gap-2">
                 <a className="flex items-center gap-2.5" href="/"> <Image src={updateLogo} alt="Dealflow icon" width={40} height={40} className="object-contain" />
              <span className="font-display font-bold text-xl tracking-tight text-white">
                DEAL<span className="text-secondary">FLOW</span>
              </span>  </a>
              
            </div>
            <p className="text-white/40 text-sm mt-3 leading-relaxed">
              Your deals. Your clients. Under control.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { label: "Twitter", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1s-2 .9-3.36 1.22A4.48 4.48 0 0 0 11.5 6.35a12.73 12.73 0 0 1-9.24-4.69s-4 9 5 13a11.06 11.06 0 0 1-6.54 1.85c9 5.5 20 0 20-11.5a4.49 4.49 0 0 0-.08-.84A7.72 7.72 0 0 0 23 3z" },
                { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-secondary hover:border-secondary/30 hover:bg-secondary/10 transition-all duration-300"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex gap-16">
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-4">Product</p>
              <ul className="space-y-3">
                {productLinks.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-white/50 text-sm hover:text-white transition-colors block">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-4">Company</p>
              <ul className="space-y-3">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/50 text-sm hover:text-white transition-colors block">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs">© 2026 Dealflow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-white/25 text-xs hover:text-white/50 transition-colors">Privacy Policy</a>
            <span className="text-white/15 text-xs">·</span>
            <a href="/terms" className="text-white/25 text-xs hover:text-white/50 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
