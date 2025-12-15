import Link from "next/link";
import { Github } from "./Icons";

export default function Navbar() {
    return (
        <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between mx-auto max-w-5xl px-6 py-3 rounded-full border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-sm">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                AWS
            </Link>
            <div className="flex items-center gap-8">
                <Link href="#about" className="text-sm font-medium hover:text-black dark:hover:text-white transition-colors">
                    About
                </Link>
                <Link href="#skills" className="text-sm font-medium hover:text-black dark:hover:text-white transition-colors">
                    Skills
                </Link>
                <Link href="#projects" className="text-sm font-medium hover:text-black dark:hover:text-white transition-colors">
                    Projects
                </Link>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                <a
                    href="https://github.com/Abuzar84"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <Github className="w-5 h-5" />
                    <span className="sr-only">GitHub</span>
                </a>
            </div>
        </nav>
    );
}
