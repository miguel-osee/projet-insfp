import { Target } from "lucide-react"
export default function Missions() {
  const missions = [
    {
      id: 1,
      text: "Offrir des formations de qualité dans les métiers techniques de l’audiovisuel.",
    },
    {
      id: 2,
      text: "Développer les compétences professionnelles des stagiaires en phase avec les standards du marché.",
    },
    {
      id: 3,
      text: "Contribuer au développement des ressources humaines spécialisées dans le domaine audiovisuel et numérique.",
    },
    {
      id: 4,
      text: "Assurer une pédagogie pratique grâce à des infrastructures adaptées et des équipements modernes.",
    },
  ];

  return (
    <section className="container py-20 bg-white">
      <div className="">

        {/* Titre */}

        <div className="flex justify-center ">
  <div className="max-w-4xl mb-16 text-center">
    <h2 className="mb-6 text-3xl font-bold md:text-4xl text-primary">
      Missions
    </h2>
    <p className="text-lg leading-relaxed text-gray-700">
L’INSFP Audiovisuel Echahid Ahmed Mehdi Ouled Fayet poursuit sa mission de former des talents qualifiés, en développant
 des compétences adaptées aux standards du marché et en valorisant l’innovation pédagogique.
    </p>
  </div>
</div>

        {/* Cartes */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="flex items-start gap-4 p-8 bg-white shadow-sm rounded-2xl border border-primary/100"
            >
              {/* Icône */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                  <Target className="text-sm text-white" />
                </div>
              </div>

              {/* Texte */}
              <p className="leading-relaxed text-gray-700">
                {mission.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
