import { Facebook, Github, Instagram, Mail, X } from './Icons';

export default function Footer() {
    return (
        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-center gap-6 mb-4">
                <a
                    href="https://github.com/Abuzar84"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black dark:hover:text-white transition-colors"
                >
                    <Github className="w-5 h-5" />
                    <span className="sr-only">GitHub</span>
                </a>
                <a
                    href="https://www.facebook.com/sayyed.abuzar.941349/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black dark:hover:text-white transition-colors"
                >
                    <Facebook className="w-5 h-5" />
                    <span className="sr-only">Facebook</span>
                </a>
                <a
                    href="https://www.instagram.com/sayyedabuzar844/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black dark:hover:text-white transition-colors"
                >
                    <Instagram className="w-5 h-5" />
                    <span className="sr-only">Instagram</span>
                </a>
                <a
                    href="https://x.com/SayyedAbuz46392"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black dark:hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                    <span className="sr-only">X</span>
                </a>
                <a
                    href="mailto:sayyedabuzar021@gmail.com"
                    className="hover:text-black dark:hover:text-white transition-colors"
                >
                    <Mail className="w-5 h-5" />
                    <span className="sr-only">Email</span>
                </a>
            </div>
            <p>&copy; {new Date().getFullYear()} Abuzar Wahadatullah Sayyed. All rights reserved.</p>
        </footer>
    );
}
