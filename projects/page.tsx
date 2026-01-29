import AppCard from '@/components/AppCard';
import projects from '@/data/projects.json';

export const metadata = {
    title: 'Projects'
};

type Project = typeof projects[number];

export default function ProjectsPage() {
    const APPS = projects as Project[];

    return (
        <section className="grid gap-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight dark:text-white">Projects</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                    A curated selection of tools and scripts I’ve built.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {APPS.map((app) => (
                    <AppCard key={app.title} {...app} />
                ))}
            </div>
        </section>
    );
}
