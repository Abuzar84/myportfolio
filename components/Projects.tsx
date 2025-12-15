export default function Projects() {
    return (
        <section id="projects" className="py-32 px-6 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Featured Work</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
                            Selected projects that showcase my passion for clean code and user experience.
                        </p>
                    </div>
                    <a href="https://github.com/Abuzar84" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
                        View all on GitHub &rarr;
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                </div>
            </div>
        </section>
    );
}
