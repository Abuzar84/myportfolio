import { Brain, Code, Database, Globe, Server } from "lucide-react";
import { Github } from "./Icons";

const skills = [
    { name: "Next.js", icon: Globe, description: "Building performant web applications with App Router and Server Components." },
    { name: "Tailwind CSS", icon: Code, description: "Rapid UI development with a utility-first approach and custom themes." },
    { name: "Supabase", icon: Database, description: "Full-stack backend features including PostgreSQL, Auth, and Realtime." },
    { name: "GitHub", icon: Github, description: "Collaborative development, version control, and CI/CD pipelines." },
    { name: "Vercel", icon: Server, description: "Seamless deployment and scaling with Edge Functions." },
];

export default function Skills() {
    return (
        <section id="skills" className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Technical Expertise</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        A focused set of modern technologies I use to build high-quality digital products.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="group p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all hover:shadow-xl dark:hover:shadow-white/5"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <skill.icon className="w-7 h-7 text-gray-900 dark:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{skill.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                {skill.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
