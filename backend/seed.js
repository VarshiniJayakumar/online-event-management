const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config();

const cities = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi'];

const seedEvents = [
  // TECH (4)
  { title: 'AI & Quantum Computing Expo', description: 'Explore the intersection of artificial intelligence and quantum mechanics with 50+ global speakers.', category: 'Tech', price: 999, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'Full Stack Bootcamp', description: 'A 2-day intensive bootcamp covering React, Node, and System Architecture.', category: 'Tech', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
  { title: 'Cyber Defense Challenge', description: 'Test your security skills in this 24-hour capture the flag challenge.', category: 'Tech', price: 0, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
  { title: 'Blockchain Revolution', description: 'Deep dive into decentralized finance, NFTs, and the future of smart contracts.', category: 'Tech', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80' },

  // MUSIC (4)
  { title: 'Neon Pulse EDM Night', description: 'Get lost in the lasers and bass with the top international DJs.', category: 'Music', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Classical Ragas Evening', description: 'A meditative evening of traditional Indian classical music under the banyan tree.', category: 'Music', price: 800, imageUrl: 'https://images.unsplash.com/photo-1582733754228-22073d60da1a?w=800&q=80' },
  { title: 'Retro Rock Legends', description: 'Relive the 80s with tributes to the greatest rock bands of all time.', category: 'Music', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1501386761578-e95c33bd014b?w=800&q=80' },
  { title: 'Soulful Jazz Brunch', description: 'Sunday morning jazz vibes accompanied by a world-class brunch menu.', category: 'Music', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },

  // SPORTS (4)
  { title: 'Corporate T20 Cricket', description: 'The ultimate cricket tournament for the tech world. Winners take the trophy!', category: 'Sports', price: 500, imageUrl: 'https://images.unsplash.com/photo-1531415074941-6ef21368a594?w=800&q=80' },
  { title: 'Midnight City Marathon', description: 'Run for a cause under the city lights. 5K, 10K, and Half Marathon options.', category: 'Sports', price: 400, imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
  { title: 'Football League Final', description: 'Witness history in the making as the top two clubs battle for glory.', category: 'Sports', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80' },
  { title: 'Tennis Masters Cup', description: 'Elite level tennis featuring the best national and international talent.', category: 'Sports', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1595435066961-260195a63908?w=800&q=80' },

  // FOOD (4)
  { title: 'Indian Biryani Expo', description: 'Taste 100+ varieties of Biryani from every corner of India.', category: 'Food', price: 600, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
  { title: 'Coffee Brewing Workshop', description: 'Learn the science of brewing, latte art, and bean selection.', category: 'Food', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
  { title: 'Vegan Dessert Class', description: 'Create delicious, guilt-free pastries with award-winning chefs.', category: 'Food', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },
  { title: 'Wine & Cheese Evening', description: 'An elegant evening of international wine pairings and artisanal cheeses.', category: 'Food', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },

  // BUSINESS (4)
  { title: 'E-commerce Summit', description: 'Scaling your online business to 10M+ in revenue. Strategies and case studies.', category: 'Business', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { title: 'Startup Pitch Night', description: 'Watch the next big unicorns pitch to top venture capitalists.', category: 'Business', price: 0, imageUrl: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80' },
  { title: 'Digital Marketing Pro', description: 'Advanced strategies for SEO, Meta Ads, and Influencer marketing.', category: 'Business', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?w=800&q=80' },
  { title: 'Leadership Forum', description: 'Leading with empathy and innovation in the modern workplace.', category: 'Business', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },

  // ART & WELLNESS (5)
  { title: 'Modern Mural Festival', description: 'Watch as world-class artists transform the city walls into massive murals.', category: 'Art', price: 0, imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80' },
  { title: 'Pottery Studio Day', description: 'Get your hands dirty and learn the ancient art of pottery.', category: 'Art', price: 900, imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&q=80' },
  { title: 'Sound Healing Session', description: 'Reset your nervous system with frequency therapy and crystal bowls.', category: 'Wellness', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80' },
  { title: 'Sunrise Yoga Flow', description: 'Align your body and mind with expert gurus at this day-long yoga festival.', category: 'Wellness', price: 0, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Landscape Painting', description: 'Two days of artistic immersion in nature. Capture the beauty on canvas.', category: 'Art', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Event.deleteMany({});
    console.log('Existing events cleared.');

    let admin = await User.findOne({ email: 'admin@eventure.com' });
    if (!admin) {
      admin = new User({ name: 'Eventure Admin', email: 'admin@eventure.com', password: 'password123', role: 'organizer' });
      await admin.save();
    }

    const finalEvents = seedEvents.map((event, index) => {
      // Distribute 25 events across cities
      const city = cities[index % cities.length];
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 60) + 2);
      
      return {
        ...event,
        location: `${city}, India`,
        date: randomDate,
        time: '10:00 AM - 04:00 PM',
        organizer: admin._id,
        tickets: [{ type: 'General Admission', price: event.price, quantity: 150 }]
      };
    });

    await Event.insertMany(finalEvents);
    console.log(`Successfully seeded exactly ${finalEvents.length} premium events!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedDB();
