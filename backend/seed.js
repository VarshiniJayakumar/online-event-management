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
  { title: 'AI Frontier Summit', description: 'Deep dive into Generative AI and Neural Networks.', category: 'Tech', price: 999, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'Web3 & Crypto Expo', description: 'The future of decentralized finance and blockchain.', category: 'Tech', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80' },
  { title: 'Robotics Workshop', description: 'Build and program your first autonomous robot.', category: 'Tech', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
  { title: 'DevOps Conference', description: 'Scaling infrastructure with modern cloud tools.', category: 'Tech', price: 0, imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aadebc25a?w=800&q=80' },

  // MUSIC (4)
  { title: 'Electronic Beats Festival', description: 'International DJs performing live on 3 stages.', category: 'Music', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Jazz & Wine Night', description: 'Sophisticated jazz in an intimate rooftop setting.', category: 'Music', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
  { title: 'Rock Anthems Live', description: 'Classic rock hits performed by the best tribute bands.', category: 'Music', price: 800, imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&q=80' },
  { title: 'Sitar Melody Evening', description: 'Traditional Indian classical music by moonlight.', category: 'Music', price: 500, imageUrl: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=800&q=80' },

  // SPORTS (4)
  { title: 'Corporate T20 Cricket', description: 'The ultimate cricket tournament for the tech world.', category: 'Sports', price: 500, imageUrl: 'https://images.unsplash.com/photo-1531415074941-6ef21368a594?w=800&q=80' },
  { title: 'City Half Marathon', description: 'Run for health and a better future.', category: 'Sports', price: 300, imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
  { title: 'Elite Football Cup', description: 'Witness the local clubs battle for the trophy.', category: 'Sports', price: 1000, imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80' },
  { title: 'Tennis Open 2026', description: 'Grand slam style tournament for all age groups.', category: 'Sports', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?w=800&q=80' },

  // FOOD (4)
  { title: 'Biryani Food Street', description: 'Every type of biryani you can imagine in one place.', category: 'Food', price: 600, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
  { title: 'Coffee Art Workshop', description: 'Master the art of espresso and latte patterns.', category: 'Food', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
  { title: 'Italian Pasta Night', description: 'Handmade pasta and authentic sauces by guest chefs.', category: 'Food', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80' },
  { title: 'Baking Masterclass', description: 'Learn to bake professional level cakes and pastries.', category: 'Food', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },

  // BUSINESS (4)
  { title: 'Startup Founders Summit', description: 'Networking and pitches with top VCs.', category: 'Business', price: 0, imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80' },
  { title: 'Marketing Strategy 2026', description: 'Advanced digital growth and brand building.', category: 'Business', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?w=800&q=80' },
  { title: 'E-commerce Mastery', description: 'Scaling your D2C brand to new heights.', category: 'Business', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
  { title: 'Creative Leadership', description: 'Leading teams with empathy and innovation.', category: 'Business', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },

  // ART & WELLNESS (5)
  { title: 'Modern Art Auction', description: 'Exhibition and bidding on contemporary pieces.', category: 'Art', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80' },
  { title: 'Pottery Experience', description: 'Relaxing day at the wheel creating clay art.', category: 'Art', price: 900, imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&q=80' },
  { title: 'Zen Meditation Retreat', description: 'A day of silence, breathing, and inner peace.', category: 'Wellness', price: 0, imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
  { title: 'Power Yoga Intensive', description: 'Strength and flexibility focused yoga workshop.', category: 'Wellness', price: 500, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Landscape Photography', description: 'Capture the city and nature with expert guidance.', category: 'Art', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
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
    console.log(`Successfully seeded ${finalEvents.length} unique events!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

seedDB();
