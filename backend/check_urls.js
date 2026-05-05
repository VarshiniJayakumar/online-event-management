const https = require('https');
const seedEvents = [
  // TECH (4)
  { title: 'AI Frontier Summit', category: 'Tech', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'Web3 & Crypto Expo', category: 'Tech', imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80' },
  { title: 'Robotics Workshop', category: 'Tech', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
  { title: 'DevOps Conference', category: 'Tech', imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aadebc25a?w=800&q=80' },

  // MUSIC (4)
  { title: 'Electronic Beats Festival', category: 'Music', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80' },
  { title: 'Jazz & Wine Night', category: 'Music', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
  { title: 'Rock Anthems Live', category: 'Music', imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&q=80' },
  { title: 'Sitar Melody Evening', category: 'Music', imageUrl: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=800&q=80' },

  // SPORTS (4)
  { title: 'Corporate T20 Cricket', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1531415074941-6ef21368a594?w=800&q=80' },
  { title: 'City Half Marathon', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
  { title: 'Elite Football Cup', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80' },
  { title: 'Tennis Open 2026', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?w=800&q=80' },

  // FOOD (4)
  { title: 'Biryani Food Street', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
  { title: 'Coffee Art Workshop', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
  { title: 'Italian Pasta Night', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80' },
  { title: 'Baking Masterclass', category: 'Food', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80' },

  // BUSINESS (4)
  { title: 'Startup Founders Summit', category: 'Business', imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80' },
  { title: 'Marketing Strategy 2026', category: 'Business', imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?w=800&q=80' },
  { title: 'E-commerce Mastery', category: 'Business', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
  { title: 'Creative Leadership', category: 'Business', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },

  // ART & WELLNESS (5)
  { title: 'Modern Art Auction', category: 'Art', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80' },
  { title: 'Pottery Experience', category: 'Art', imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800&q=80' },
  { title: 'Zen Meditation Retreat', category: 'Wellness', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
  { title: 'Power Yoga Intensive', category: 'Wellness', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
  { title: 'Landscape Photography', category: 'Art', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 400) {
        resolve(false);
      } else {
        resolve(true);
      }
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  for (const event of seedEvents) {
    const ok = await checkUrl(event.imageUrl);
    if (!ok) {
      console.log(`BROKEN: ${event.category} - ${event.title}`);
    } else {
      console.log(`OK: ${event.title}`);
    }
  }
}
main();
