const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config();

const cities = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi'];

const seedEvents = [
  // TECH
  { title: 'AI & Quantum Computing Expo', description: 'Explore the intersection of artificial intelligence and quantum mechanics with 50+ global speakers.', category: 'Tech', price: 999, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'Full Stack Ninja Workshop', description: 'A 2-day intensive bootcamp covering React, Node, and System Architecture.', category: 'Tech', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
  { title: 'Cyber Defense Hackathon', description: 'Test your security skills in this 24-hour capture the flag challenge.', category: 'Tech', price: 0, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
  { title: 'Blockchain Revolution 2026', description: 'Deep dive into decentralized finance, NFTs, and the future of smart contracts.', category: 'Tech', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80' },
  { title: 'SaaS Founders Meetup', description: 'Networking and knowledge sharing for the next generation of software entrepreneurs.', category: 'Tech', price: 500, imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80' },

  // MUSIC
  { title: 'Neon Pulse EDM Night', description: 'Get lost in the lasers and bass with the top international DJs.', category: 'Music', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Classical Ragas Evening', description: 'A meditative evening of traditional Indian classical music under the banyan tree.', category: 'Music', price: 800, imageUrl: 'https://images.unsplash.com/photo-1582733754228-22073d60da1a?w=800&q=80' },
  { title: 'Retro Rock Legends Live', description: 'Relive the 80s with tributes to the greatest rock bands of all time.', category: 'Music', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1501386761578-e95c33bd014b?w=800&q=80' },
  { title: 'Soulful Jazz Brunch', description: 'Sunday morning jazz vibes accompanied by a world-class brunch menu.', category: 'Music', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
  { title: 'Hip Hop Street Jam', description: 'Live rap battles, beatboxing, and breaking in this urban culture festival.', category: 'Music', price: 0, imageUrl: 'https://images.unsplash.com/photo-1520127873598-1217ec37faf7?w=800&q=80' },

  // SPORTS
  { title: 'Corporate T20 Cricket Bash', description: 'The ultimate cricket tournament for the tech world. Winners take the trophy!', category: 'Sports', price: 500, imageUrl: 'https://images.unsplash.com/photo-1531415074941-6ef21368a594?w=800&q=80' },
  { title: 'Midnight Marathon Run', description: 'Run for a cause under the city lights. 5K, 10K, and Half Marathon options.', category: 'Sports', price: 400, imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
  { title: 'Indian Football League Final', description: 'Witness history in the making as the top two clubs battle for glory.', category: 'Sports', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80' },
  { title: 'Tennis Masters Championship', description: 'Elite level tennis featuring the best national and international talent.', category: 'Sports', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1595435066961-260195a63908?w=800&q=80' },
  { title: 'Yoga & Mindfulness Retreat', description: 'Align your body and mind with expert gurus at this day-long yoga festival.', category: 'Sports', price: 0, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Pro Kabaddi Fan Fest', description: 'Meet the stars of Kabaddi and enjoy live match screenings and games.', category: 'Sports', price: 200, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80' },
  { title: 'Basketball 3x3 Street Cup', description: 'Fast-paced basketball action in the heart of the city.', category: 'Sports', price: 300, imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },

  // FOOD
  { title: 'The Great Biryani Expo', description: 'Taste 100+ varieties of Biryani from every corner of India.', category: 'Food', price: 600, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
  { title: 'Artisanal Coffee Workshop', description: 'Learn the science of brewing, latte art, and bean selection.', category: 'Food', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
  { title: 'Vegan Dessert Masterclass', description: 'Create delicious, guilt-free pastries with award-winning chefs.', category: 'Food', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },
  { title: 'Wine & Cheese Soiree', description: 'An elegant evening of international wine pairings and artisanal cheeses.', category: 'Food', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
  { title: 'Spicy Street Food Carnival', description: 'A celebration of the boldest and spiciest flavors from the streets.', category: 'Food', price: 0, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },

  // BUSINESS
  { title: 'E-commerce Growth Summit', description: 'Scaling your online business to 10M+ in revenue. Strategies and case studies.', category: 'Business', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { title: 'Creative Leadership Forum', description: 'Leading with empathy and innovation in the modern workplace.', category: 'Business', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },
  { title: 'Startup Pitch Night', description: 'Watch the next big unicorns pitch to top venture capitalists.', category: 'Business', price: 0, imageUrl: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80' },
  { title: 'Digital Marketing Mastery', description: 'Advanced strategies for SEO, Meta Ads, and Influencer marketing.', category: 'Business', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?w=800&q=80' },
  { title: 'Future of Remote Work', description: 'Hybrid models, culture, and tools for a borderless workforce.', category: 'Business', price: 0, imageUrl: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&q=80' },

  // ART
  { title: 'Modern Mural Festival', description: 'Watch as world-class artists transform the city walls into massive murals.', category: 'Art', price: 0, imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80' },
  { title: 'Pottery & Clay Art Studio', description: 'Get your hands dirty and learn the ancient art of pottery.', category: 'Art', price: 900, imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&q=80' },
  { title: 'Fine Art & Photography Auction', description: 'Bidding on exclusive pieces from emerging Indian artists.', category: 'Art', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
  { title: 'Fluid Art & Sip Night', description: 'Create your own abstract masterpiece while enjoying premium cocktails.', category: 'Art', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80' },
  { title: 'Cinematography Masterclass', description: 'The art of lighting, framing, and visual storytelling.', category: 'Art', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80' },

  // WELLNESS
  { title: 'Glow in the Dark Yoga', description: 'An immersive yoga experience with UV lights and neon body paint.', category: 'Wellness', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Sound Healing & Meditation', description: 'Reset your nervous system with frequency therapy and crystal bowls.', category: 'Wellness', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80' },
  { title: 'Organic Skincare DIY', description: 'Make your own natural serums, creams, and masks using raw ingredients.', category: 'Wellness', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80' },
  { title: 'Mindfulness for High Achievers', description: 'Mental strategies to handle stress and peak performance.', category: 'Wellness', price: 0, imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Event.deleteMany({});
    console.log('Existing events cleared.');

    let admin = await User.findOne({ email: 'admin@eventure.com' });
    if (!admin) {
      admin = new User({ name: 'Eventure Admin', email: 'admin@eventure.com', password: 'password123', role: 'organizer' });
      await admin.save();
    }

    const finalEvents = [];
    // Duplicate events across cities to reach 100+ total events
    cities.forEach(city => {
      seedEvents.forEach(event => {
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 60) + 2);
        
        finalEvents.push({
          ...event,
          location: `${city}, India`,
          date: randomDate,
          time: '09:00 AM - 05:00 PM',
          organizer: admin._id,
          tickets: [{ type: 'General Admission', price: event.price, quantity: 200 }]
        });
      });
    });

    await Event.insertMany(finalEvents);
    console.log(`Successfully seeded ${finalEvents.length} unique events across all cities!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedDB();
