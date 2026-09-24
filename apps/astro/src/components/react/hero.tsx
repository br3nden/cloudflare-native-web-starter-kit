import { GithubIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const technologies = [
  [
    { name: 'Expo', description: 'Cross-platform mobile apps', logo: '/logos/expo.svg', isCloudflare: false },
    { name: 'Astro', description: 'High-performance web framework', logo: '/logos/astro.svg', isCloudflare: false },
    { name: 'Clerk', description: 'Authentication & user management', logo: '/logos/clerk.svg', isCloudflare: false },
    { name: 'tRPC', description: 'End-to-end typesafe APIs', logo: '/logos/trpc.svg', isCloudflare: false },
  ],
  [
    { name: 'Turborepo', description: 'Monorepo build system', logo: '/logos/turborepo.svg', isCloudflare: false },
    { name: 'Cloudflare Workers', description: 'Edge computing platform', logo: '/logos/workers.svg', isCloudflare: true },
    { name: 'Cloudflare D1', description: 'Serverless SQL database', logo: '/logos/d1.svg', isCloudflare: true },
    { name: 'Cloudflare R2', description: 'Object storage service', logo: '/logos/r2.svg', isCloudflare: true },
  ],
]

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-40 pb-24">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-cyan-500/5 to-transparent" />
      
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          <span className="font-mono text-xl text-orange-400 uppercase tracking-widest">
            Cloudflare Native Web Starter Kit
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build AI-powered apps
            <span className="block text-orange-400">with Cloudflare Workers</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            A complete starter template for building AI-powered mobile and web applications using Cloudflare workers, 
            featuring cross-platform support, edge computing, and modern development practices.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a href="https://github.com/br3nden/cloudflare-native-web-starter-kit">
              <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                <GithubIcon className="mr-2 h-5 w-5" />
                Clone Repository
              </Button>
            </a>
          </div>

          <div className="mt-24 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-4 text-base font-semibold text-gray-400">
                Built to scale and develop with ease
              </span>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex flex-col gap-12">
              {technologies.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="flex justify-center items-center"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 md:gap-16 w-full max-w-4xl">
                    {group.map((tech) => (
                      <div
                        key={tech.name}
                        className="group flex flex-col items-center justify-center transition-transform duration-300 hover:scale-110"
                      >
                        <div className="relative overflow-hidden rounded-2xl bg-white/[0.07] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[6px] border border-white/[0.18] transition-all duration-300 hover:bg-white/[0.1] hover:shadow-orange-500/25">
                          {/* Gradient overlay */}
                          <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 transition duration-300 group-hover:opacity-100" />
                          
                          {/* Logo container */}
                          <div className="relative flex h-24 w-56 items-center justify-center p-6">
                            <div className="relative flex items-center justify-center h-full w-full">
                              <img
                                src={tech.logo}
                                alt={tech.name}
                                className={`h-auto w-auto max-h-full max-w-full object-contain transition-all duration-300 ${
                                  tech.name === 'Expo' || tech.name === 'Clerk' ? 'scale-[1.75]' : ''
                                } ${
                                  tech.isCloudflare 
                                    ? 'brightness-125 contrast-125 [filter:sepia(100%)_saturate(2000%)_hue-rotate(360deg)_brightness(100%)_contrast(0.8)]' 
                                    : 'brightness-150 contrast-150 group-hover:brightness-125 group-hover:contrast-125'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col items-center text-center min-h-[3.5rem]">
                          <div className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white">
                            {tech.name}
                          </div>
                          <div className="mt-1 text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                            {tech.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
