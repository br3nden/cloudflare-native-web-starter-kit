'use client'
import {Fragment, type ReactNode} from 'react'
import {Popover, Transition} from '@headlessui/react'
import clsx from 'clsx'
import {Github} from 'lucide-react'

function MobileNavLink({href, children}: { href: string, children: ReactNode }) {
  return (
    <Popover.Button as="a" href={href} className="block w-full p-2 text-gray-300 hover:text-white transition-colors">
      {children}
    </Popover.Button>
  )
}

function MobileNavIcon({open}: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-gray-300"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0'
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0'
        )}
      />
    </svg>
  )
}

function MobileNavigation() {
  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {({open}) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-slate-900/80 backdrop-blur-lg p-4 text-lg tracking-tight shadow-xl ring-1 ring-white/10"
          >
            <MobileNavLink href="#features">Features</MobileNavLink>
            <MobileNavLink href="/docs">Documentation</MobileNavLink>
            <hr className="m-2 border-white/10" />
            <MobileNavLink href="https://github.com/br3nden/cloudflare-native-web-starter-kit">
              GitHub
            </MobileNavLink>
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg border-b border-white/10" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="relative z-50 flex justify-between items-center">
          <div className="flex items-center md:gap-x-12">
            <a href="/" aria-label="Home" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transition-transform hover:scale-105 duration-200">
                Cloudflare Native Kit
              </span>
            </a>
            <div className="hidden md:flex md:gap-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block">
              <a 
                href="https://github.com/br3nden/cloudflare-native-web-starter-kit" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
            </div>
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
} 