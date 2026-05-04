const crypto = require('crypto');
global.crypto = crypto;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config();

const cities = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi'];
const categories = ['Tech', 'Music', 'Food', 'Business', 'Art', 'Wellness'];

const seedEvents = [
  // TECH
  { title: 'AI & Machine Learning Global Expo 2026', description: 'Experience the next wave of neural intelligence with world-renowned experts.', category: 'Tech', price: 999, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'The Web3 Architecture Summit', description: 'Building the decentralized future. Workshops on Solidity, Rust, and IPFS.', category: 'Tech', price: 0, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { title: 'CyberSecurity Defense Forum', description: 'Protecting the digital borders. Live hacking demos and defense strategies.', category: 'Tech', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
  { title: 'Robotics for Tomorrow', description: 'Meet the machines that will define the next decade of industry.', category: 'Tech', price: 750, imageUrl: 'https://images.unsplash.com/photo-1581092921461-7d15cb8905ed?w=800&q=80' },
  { title: 'Cloud Native & Kubernetes Day', description: 'Scale your infrastructure to the moon with modern DevOps practices.', category: 'Tech', price: 300, imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80' },
  { title: 'Future of EV & Sustainable Tech', description: 'Exploring the revolution in green mobility and energy storage.', category: 'Tech', price: 400, imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80' },
  { title: 'AR/VR Immersive Experience', description: 'Dive into the metaverse with the latest in spatial computing.', category: 'Tech', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1478416402424-89173699c4d1?w=800&q=80' },

  // MUSIC
  { title: 'Neon Pulse: Electronic Music Festival', description: 'A massive 12-hour journey through house, techno, and trance.', category: 'Music', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Symphony Under the Stars', description: 'A breathtaking performance by the National Philharmonic Orchestra.', category: 'Music', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1465847733345-d46ad9b20754?w=800&q=80' },
  { title: 'Soulful Jazz & Blues Night', description: 'Intimate performances from legendary blues artists.', category: 'Music', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
  { title: 'Indie Rock Underground', description: 'Discover the next big bands in the alternative rock scene.', category: 'Music', price: 600, imageUrl: 'https://images.unsplash.com/photo-1501386761578-e95c33bd014b?w=800&q=80' },
  { title: 'Classical Ragas & Fusion', description: 'A beautiful blend of traditional Hindustani and modern fusion.', category: 'Music', price: 800, imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?w=800&q=80' },
  { title: 'K-Pop Universe India', description: 'The ultimate celebration of Korean pop culture and music.', category: 'Music', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80' },
  { title: 'Retro 80s Disco Night', description: 'Put on your dancing shoes for a night of pure nostalgia.', category: 'Music', price: 500, imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },

  // FOOD
  { title: 'The Great Indian Street Food Trail', description: 'A culinary journey through the diverse flavors of the subcontinent.', category: 'Food', price: 400, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  { title: 'Wine & Cheese Pairing Soiree', description: 'An elegant evening for the sophisticated palate.', category: 'Food', price: 2800, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
  { title: 'Global Vegan Pastry Workshop', description: 'Learn the secrets of world-class vegan baking.', category: 'Food', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80' },
  { title: 'Craft Beer & Burger Fest', description: 'The best local breweries meet gourmet burger chefs.', category: 'Food', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=80' },
  { title: 'Seafood Paradise Extravaganza', description: 'The freshest catch prepared by coastal master chefs.', category: 'Food', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80' },
  { title: 'Chocolatier Masterclass', description: 'From bean to bar: The art of artisanal chocolate making.', category: 'Food', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80' },
  { title: 'Farm to Table Harvest Dinner', description: 'Organic, locally sourced ingredients in a 5-course meal.', category: 'Food', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },

  // BUSINESS
  { title: 'VC & Angel Investor Networking', description: 'Where great ideas find the fuel to scale.', category: 'Business', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&q=80' },
  { title: 'Marketing in the Age of AI', description: 'Revolutionize your brand strategy with data-driven insights.', category: 'Business', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { title: 'Real Estate Investment Forum', description: 'Unlocking wealth through strategic property portfolios.', category: 'Business', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
  { title: 'Global Supply Chain Logistics', description: 'Optimizing the movement of goods in a complex world.', category: 'Business', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80' },
  { title: 'Women in Leadership Summit', description: 'Empowering the next generation of female CEOs.', category: 'Business', price: 0, imageUrl: 'https://images.unsplash.com/photo-1573161158362-5972760127b4?w=800&q=80' },
  { title: 'FinTech Revolution 2026', description: 'The intersection of banking, technology, and regulation.', category: 'Business', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
  { title: 'Sustainable Business Growth', description: 'Profit with purpose: Implementing ESG goals.', category: 'Business', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },

  // ART
  { title: 'Midnight Gallery: Modern Surrealism', description: 'An exclusive look at the avant-garde movement in India.', category: 'Art', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80' },
  { title: 'Pottery & Ceramic Design', description: 'Get your hands dirty and create something beautiful.', category: 'Art', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&q=80' },
  { title: 'Urban Graffiti & Mural Art', description: 'The streets are the canvas. Live mural painting session.', category: 'Art', price: 0, imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80' },
  { title: 'Cinematography Masterclass', description: 'Lighting, framing, and storytelling with pro directors.', category: 'Art', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80' },
  { title: 'Landscape Painting Retreat', description: 'Two days of artistic immersion in nature.', category: 'Art', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
  { title: 'Calligraphy & Lettering Art', description: 'The meditative beauty of the written word.', category: 'Art', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1582213726895-32ac44ed32b1?w=800&q=80' },
  { title: 'Photography: Darkroom Magic', description: 'Developing film and the science of silver halides.', category: 'Art', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=800&q=80' },

  // WELLNESS
  { title: 'Sun Salutation Yoga Festival', description: '108 Surya Namaskars at sunrise with a massive community.', category: 'Wellness', price: 0, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Mental Health Awareness Summit', description: 'Breaking the stigma through shared stories and expert panels.', category: 'Wellness', price: 0, imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
  { title: 'Bio-Hacking for Longevity', description: 'The latest science in living longer and healthier.', category: 'Wellness', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80' },
  { title: 'Crystal Healing & Meditation', description: 'Align your chakras with frequency and sound therapy.', category: 'Wellness', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80' },
  { title: 'Pilates Power Session', description: 'Core strength and flexibility for peak performance.', category: 'Wellness', price: 800, imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80' },
  { title: 'Organic Skincare & DIY Workshop', description: 'Create your own natural beauty products.', category: 'Wellness', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80' },
  { title: 'Sound Bath & Forest Bathing', description: 'Total immersion in healing sounds and nature.', category: 'Wellness', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1511412385180-7216359c903e?w=800&q=80' },
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event-management';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Existing events cleared.');

    // Find or Create a Dummy Admin User to be the organizer
    let admin = await User.findOne({ email: 'admin@eventure.com' });
    if (!admin) {
      admin = new User({
        name: 'Eventure Admin',
        email: 'admin@eventure.com',
        password: 'password123',
        role: 'organizer'
      });
      await admin.save();
    }

    // Prepare events with random cities and dates
    const finalEvents = seedEvents.map(event => {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 90) + 5);

      return {
        ...event,
        location: `${randomCity}, India`,
        date: randomDate,
        time: '10:00 AM - 06:00 PM',
        organizer: admin._id,
        tickets: [{ type: 'General Admission', price: event.price, quantity: 100 }]
      };
    });

    await Event.insertMany(finalEvents);
    console.log(`Successfully seeded ${finalEvents.length} elegant events across ${cities.join(', ')}!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedDB();
