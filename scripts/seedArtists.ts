
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db";
import PublicArtist from "../models/PublicArtist";

const artists = [
  {
    id: "pers-1",
    legacyId: "abhi-soni",
    slug: "abhi-soni",
    name: "Abhi Soni",
    role: "Actor",
    imageUrl: "/team/abhisoni.jpg",
    bio:
      "Abhi Soni is an actor and influencer associated with the growing Rajasthani entertainment space. With an interest in acting and digital entertainment, he is part of a new generation of artists contributing to regional storytelling and cinema.",
    dob: "1995-12-12",
    birthPlace: "Rajasthan",
    highlights: [
      "Actor",
      "Rajasthani Cinema",
      "MAYAD Artist",
    ],
    tag: "STAR",
  },

  {
    id: "pers-2",
    legacyId: "kailash-mewadi",
    slug: "kailash-mewadi",
    name: "Kailash Mewadi",
    role: "Actor",
    imageUrl: "/kailash.jpg",
    bio:
      "Kailash Aachrcya is an Indian actor born in Rajasthan and have great interest in acting.",
    dob: "1998-02-18",
    birthPlace: "Rajasthan",
    highlights: [
      "Actor",
      "Rajasthani Cinema",
      "Folk Culture",
    ],
    tag: "STAR",
  },

  {
    id: "pers-3",
    legacyId: "ramesh-nagda",
    slug: "ramesh-nagda",
    name: "Ramesh Nagda",
    role: "Actor",
    imageUrl: "/RameshNagda.jpg",
    bio:
      "रमेश नागदा Actor | Udaipur, Rajasthan उदयपुर, राजस्थान से ताल्लुक रखने वाले रमेश नागदा एक अनुभवी और बहुमुखी अभिनेता हैं। 65 वर्ष की आयु में भी वे अपने दमदार अभिनय, सहज अभिव्यक्ति और हर किरदार को जीवंत बनाने की क्षमता के लिए जाने जाते हैं। रंगमंच, फिल्मों और क्षेत्रीय सिनेमा में उनके वर्षों के अनुभव ने उन्हें एक सशक्त कलाकार के रूप में पहचान दिलाई है। रमेश नागदा का अभिनय हमेशा स्वाभाविक, भावनात्मक और प्रभावशाली रहा है। वे हर भूमिका में अपनी गहरी समझ और समर्पण के साथ दर्शकों के दिलों पर अमिट छाप छोड़ते हैं। उनका अनुभव, अनुशासन और कला के प्रति समर्पण नई पीढ़ी के कलाकारों के लिए भी प्रेरणास्रोत है। मयड़ OTT पर उनका स्वागत करते हुए हमें गर्व है, जहाँ दर्शक उनके बेहतरीन अभिनय का आनंद ले सकते हैं।",
    dob: "1971-04-13",
    birthPlace: "Udaipur, Rajasthan",
    highlights: [
      "Actor",
      "Rajasthani Cinema",
      "Performer",
    ],
    tag: "STAR",
  },

  {
    id: "pers-5",
    legacyId: "tarashree",
    slug: "tarashree",
    name: "Tara shree",
    role: "Mayad Actor",
    imageUrl: "/tarashree.jpg",
    bio: "",
    dob: "1996-08-08",
    birthPlace: "Rajasthan",
    highlights: [
      "Actor",
      "Rajasthani Cinema",
      "Performer",
    ],
    tag: "STAR",
  },

  {
    id: "pers-6",
    legacyId: "garvakarnikarathore",
    slug: "garvakarnikarathore",
    name: "Garvakarnika Rathore",
    role: "Mayad Actor",
    imageUrl: "/Default.jpg",
    bio:
      "Garvakarnika Rathore is an Indian actor born in Rajasthan and have great interest in acting.",
    dob: "1996-05-14",
    birthPlace: "Rajasthan",
    highlights: [
      "Actor",
      "Rajasthani Cinema",
      "Performer",
    ],
    tag: "STAR",
  },
];

const seedArtists = async () => {
  try {
    await connectDB();

    console.log("Starting artist seeding...");

    for (const artist of artists) {
      if (!artist.legacyId || !artist.slug) {
        throw new Error(
          `Missing legacyId or slug for ${artist.name}`
        );
      }

      await PublicArtist.findOneAndUpdate(
        { legacyId: artist.legacyId },
        {
          $set: {
            ...artist,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          runValidators: true,
        }
      );

      console.log(`Seeded: ${artist.name}`);
    }

    const total = await PublicArtist.countDocuments();

    console.log("--------------------------------");
    console.log("Artists processed:", artists.length);
    console.log("Total artists in MongoDB:", total);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Artist seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedArtists();
