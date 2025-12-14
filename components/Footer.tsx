export default function Footer() {
    return (
        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-center gap-6 mb-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                    GitHub
                </a>
                <a href="mailto:contact@example.com" className="hover:text-black dark:hover:text-white transition-colors">
                    Contact
                </a>
            </div>
            <p>&copy; {new Date().getFullYear()} Abuzar Wahadatullah Sayyed. All rights reserved.</p>
        </footer>
    );
}
