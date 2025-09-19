export type CollectionItem = {
  title: string;
  description: string;
  subtitle: string;
  href?: string;
};

export type CollectionSection = {
  title: string;
  description: string;
  items: CollectionItem[];
};

export const collectionSections: CollectionSection[] = [
  {
    title: 'Studium',
    description:
      'Module und Schwerpunkte aus meinem Studium. Jede Sammlung bündelt Blogposts, Zusammenfassungen und Materialien, die beim Lernen helfen.',
    items: [
      {
        href: '/sammlungen/mathe-eins',
        title: 'Mathe I – Lineare Algebra & Analysis',
        description:
          'Grundlagen, Verständnisfragen und Repetitorien für den Einstieg – von linearen Gleichungssystemen bis zu Differenzialrechnung.',
        subtitle: '1. Semester',
      },
    ],
  },
  {
    title: 'Kuratiert & Experimente',
    description:
      'Sammlungen abseits der Uni: Lernpfade, Experimente und thematische Deep-Dives aus meinem persönlichen Wissensarchiv.',
    items: [
      {
        title: 'In Planung',
        description:
          'Weitere Sammlungen folgen – von Produktivität über KI-Werkzeuge bis hin zu kreativen Projekten. Stay tuned!',
        subtitle: 'Demnächst',
      },
    ],
  },
];

export const collectionMetadataBySlug = collectionSections
  .flatMap((section) => section.items)
  .filter((item): item is CollectionItem & { href: string } => Boolean(item.href))
  .reduce<Record<string, { title: string; href: string }>>((acc, item) => {
    const normalizedSlug = item.href.replace(/^\/+/, '').replace(/\/$/, '');
    const slug = normalizedSlug.replace(/^sammlungen\//, '');
    acc[slug] = {
      title: item.title,
      href: item.href,
    };
    return acc;
  }, {});
