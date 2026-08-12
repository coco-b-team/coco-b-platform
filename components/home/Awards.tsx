const awards = [
  { year: '2024', title: "Traveler's Choice", source: 'TripAdvisor', description: 'Top 10% of properties worldwide' },
  { year: '2024', title: 'Best Luxury Villa', source: 'Luxury Travel Magazine', description: 'Caribbean & Mexico Edition' },
  { year: '2022', title: "Traveler's Choice", source: 'Conde Nast Traveler', description: 'Best island retreat center' },
  { year: '2016', title: 'Winner 2016', source: 'Boutique Hotels Award', description: 'Best private villa hotel' },
];

export function Awards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <p className="text-sm tracking-widest text-accent uppercase">Recognition</p>
      <h2 className="font-body mt-2 text-2xl font-normal">Awards</h2>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {awards.map((award) => (
          <div key={`${award.year}-${award.title}`}>
            <p className="text-sm tracking-widest text-accent">{award.year}</p>
            <div className="mt-2 mb-4 w-8 border-t border-border" />
            <p className="text-lg font-semibold">{award.title}</p>
            <p className="mt-1 text-sm font-medium tracking-widest text-accent uppercase">{award.source}</p>
            <p className="mt-2 text-text-muted">{award.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
