export default function Hero() {
    return (
        <section id="about" className="min-h-screen flex flex-col justify-center items-center pt-20 px-6 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-3xl pointer-events-none" />

            <div className="max-w-4xl text-center space-y-8 relative z-10">
                <div className="inline-block px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-600 dark:text-gray-400 mb-4 animate-fade-in">
                    Based in India • Available for work
                </div>

                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight pb-2">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
                        Abuzar
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-gray-500 via-gray-700 to-gray-900 dark:from-gray-500 dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
                        Wahadatullah Sayyed
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                    Crafting exceptional digital experiences with <span className="font-semibold text-black dark:text-white">Next.js</span> and <span className="font-semibold text-black dark:text-white">Tailwind CSS</span>.
                </p>

                <div className="flex gap-4 justify-center pt-8">
                    <a
                        href="#skills"
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-black dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                        Explore Skills
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                    <a
                        href="#projects"
                        className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-900 dark:text-white transition-all duration-200 bg-transparent border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                        View Work
                    </a>
                </div>
            </div>
        </section>
    );
}
