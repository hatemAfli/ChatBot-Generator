import   db  from "../src/config/dbConn" ; // adjust path to your drizzle db instance
import { users, bots, botConfigs } from "../src/db/schema";

async function seed() {
  // Users
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: "superadmin@example.com",
        role: "superadmin",
        motdepasse: "hashedpassword1", // normally hashed
        nom: "Dupont",
        prenom: "Jean",
        num: "+33123456789",
      },
      {
        email: "admin@example.com",
        role: "admin",
        motdepasse: "hashedpassword2",
        nom: "Martin",
        prenom: "Claire",
        num: "+33198765432",
      },
      {
        email: "analyste@example.com",
        role: "analyste",
        motdepasse: "hashedpassword3",
        nom: "Bernard",
        prenom: "Luc",
        num: "+33678901234",
      },
    ])
    .returning();

  console.log("✅ Users inserted:", insertedUsers);

  // Bots
  const insertedBots = await db
    .insert(bots)
    .values([
      {
        name: "Immo Assistant",
        status: "active",
        ownerId: insertedUsers[1].id, // admin owns this bot
      },
      {
        name: "SupportBot",
        status: "inactive",
        ownerId: insertedUsers[2].id, // analyste owns this bot
      },
    ])
    .returning();

  console.log("✅ Bots inserted:", insertedBots);

  // Bot Configs
  await db.insert(botConfigs).values([
    {
      generalJson: {
        domaines_expertise: ["immobilier", "location", "achat"],
        lier_pages_sources: false,
        envoi_emails_directs: {
          active: true,
          adresse_expedition: "contact@immo.fr",
        },
        integration_whatsapp: {
          active: false,
          groupe: "",
          numero: "",
        },
        soumission_formulaire_api: {
          active: false,
          headers: {},
          endpoint: "",
        },
        fallback_connaissance_interne: false,
      },
      designeJson: {
        couleurs: {
          neutre: "#F0F0F0",
          primaire: "#008000",
          secondaire: "#FFD700",
        },
        border_radius: "large",
        icone_lanceur: "house_icon.png",
        taille_police: "grande",
        animation_taper: "vague",
        icone_reponse_bot: false,
      },
      behaviorJson: {
        nom_agent: "Claire",
        mode_reponses: "statique",
        streaming_reponses: false,
        messages_generiques: {
          refus: ["Désolé, je ne peux pas répondre à cette demande."],
          salutation: ["Bienvenue sur notre agence en ligne !"],
          confirmation: [
            "Votre demande a été reçue et sera traitée rapidement.",
          ],
        },
        gestion_prenom_visiteur: "ignorer",
      },
      sourcesJson: {
        agences: [
          {
            nom: "Agence Marseille",
            url: "https://immo.fr/marseille",
            maps_url: "https://maps.google.com/?q=Agence+Marseille",
            telephone: "+33456789012",
            inclure_numero: false,
          },
        ],
        coordonnees: {
          email: "support@immo.fr",
          whatsapp: "",
          telephones: ["+33456789012"],
          reseaux_sociaux: {
            facebook: "fb.com/immobilier",
            instagram: "@immobilier_fr",
          },
        },
        tables_tarification: {
          table: [
            { prix: "Gratuit", service: "Estimation bien" },
            { prix: "50€", service: "Visite guidée" },
          ],
          pages_url: ["https://immo.fr/tarifs"],
        },
        connaissance_generale: ["https://immo.fr/faq"],
      },
      fromJson: {
        types: ["rappel"],
        champs: ["nom", "telephone"],
        mapping_api_externe: false,
      },
      botId: insertedBots[0].idBot, // linked to first bot
    },
  ]);

  console.log("✅ BotConfigs inserted");
}

seed()
  .then(() => {
    console.log("🌱 Seeding completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
