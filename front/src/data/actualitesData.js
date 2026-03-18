import img1 from "../assets/images/News1.jpg";
import img2 from "../assets/images/News2.jpg";
import img3 from "../assets/images/News3.jpg";
import img4 from "../assets/images/News4.jpg";

const actualitesData = [
  {
    id: 1,
    titre: "Ouverture des inscriptions – Session 2026",
    sousTitre: "Une nouvelle opportunité de formation dans le domaine de l’audiovisuel",
    date: "15 Janvier 2026",
    image: img1,
    contenu: [
      {
        titre: "Annonce officielle",
        paragraphe: [
          "L’Institut National Spécialisé de la Formation Professionnelle Audiovisuelle informe l’ensemble des candidats de l’ouverture officielle des inscriptions.",
          "Cette session vise à renforcer les compétences professionnelles dans les métiers de l’audiovisuel."
        ]
      },
      {
        titre: "Procédure d’inscription",
        paragraphe: [
          "Les inscriptions se font exclusivement via la plateforme nationale du ministère.",
          "Aucune inscription n’est prise en charge directement par l’institut."
        ]
      }
    ]
  },

  {
    id: 2,
    titre: "Nouvelles formations audiovisuelles",
    sousTitre: "Renforcement de l’offre pédagogique",
    date: "05 Février 2026",
    image: img2,
    contenu: [
      {
        titre: "Objectifs",
        paragraphe: [
          "L’INSFP Audiovisuel élargit son offre de formation.",
          "Ces formations répondent aux besoins du marché."
        ]
      }
    ]
  },

  {
    id: 3,
    titre: "Rentrée pédagogique 2026",
    sousTitre: "Organisation et encadrement",
    date: "20 Février 2026",
    image: img3,
    contenu: [
      {
        titre: "Déroulement",
        paragraphe: [
          "La rentrée pédagogique est prévue pour mars 2026.",
          "Les stagiaires seront encadrés par des formateurs spécialisés."
        ]
      }
    ]
  }
];

export default actualitesData;
