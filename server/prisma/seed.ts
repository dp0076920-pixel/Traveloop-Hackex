import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const cities = [
  { name: 'Paris', country: 'France', continent: 'Europe', lat: 48.8566, lng: 2.3522, costIndex: 'luxury', popularityScore: 9.8, flagEmoji: '🇫🇷', avgDailyCost: 180, weatherCategory: 'temperate' },
  { name: 'Tokyo', country: 'Japan', continent: 'Asia', lat: 35.6762, lng: 139.6503, costIndex: 'mid', popularityScore: 9.7, flagEmoji: '🇯🇵', avgDailyCost: 150, weatherCategory: 'temperate' },
  { name: 'New York', country: 'USA', continent: 'North America', lat: 40.7128, lng: -74.0060, costIndex: 'luxury', popularityScore: 9.6, flagEmoji: '🇺🇸', avgDailyCost: 200, weatherCategory: 'temperate' },
  { name: 'Bali', country: 'Indonesia', continent: 'Asia', lat: -8.3405, lng: 115.0920, costIndex: 'budget', popularityScore: 9.5, flagEmoji: '🇮🇩', avgDailyCost: 60, weatherCategory: 'tropical' },
  { name: 'Barcelona', country: 'Spain', continent: 'Europe', lat: 41.3851, lng: 2.1734, costIndex: 'mid', popularityScore: 9.4, flagEmoji: '🇪🇸', avgDailyCost: 120, weatherCategory: 'temperate' },
  { name: 'Dubai', country: 'UAE', continent: 'Asia', lat: 25.2048, lng: 55.2708, costIndex: 'luxury', popularityScore: 9.3, flagEmoji: '🇦🇪', avgDailyCost: 220, weatherCategory: 'desert' },
  { name: 'Bangkok', country: 'Thailand', continent: 'Asia', lat: 13.7563, lng: 100.5018, costIndex: 'budget', popularityScore: 9.2, flagEmoji: '🇹🇭', avgDailyCost: 50, weatherCategory: 'tropical' },
  { name: 'Rome', country: 'Italy', continent: 'Europe', lat: 41.9028, lng: 12.4964, costIndex: 'mid', popularityScore: 9.1, flagEmoji: '🇮🇹', avgDailyCost: 130, weatherCategory: 'temperate' },
  { name: 'Sydney', country: 'Australia', continent: 'Oceania', lat: -33.8688, lng: 151.2093, costIndex: 'luxury', popularityScore: 9.0, flagEmoji: '🇦🇺', avgDailyCost: 190, weatherCategory: 'temperate' },
  { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', lat: 52.3676, lng: 4.9041, costIndex: 'mid', popularityScore: 8.9, flagEmoji: '🇳🇱', avgDailyCost: 140, weatherCategory: 'temperate' },
  { name: 'Singapore', country: 'Singapore', continent: 'Asia', lat: 1.3521, lng: 103.8198, costIndex: 'luxury', popularityScore: 8.8, flagEmoji: '🇸🇬', avgDailyCost: 170, weatherCategory: 'tropical' },
  { name: 'Prague', country: 'Czech Republic', continent: 'Europe', lat: 50.0755, lng: 14.4378, costIndex: 'budget', popularityScore: 8.7, flagEmoji: '🇨🇿', avgDailyCost: 70, weatherCategory: 'cold' },
  { name: 'Istanbul', country: 'Turkey', continent: 'Asia', lat: 41.0082, lng: 28.9784, costIndex: 'budget', popularityScore: 8.6, flagEmoji: '🇹🇷', avgDailyCost: 65, weatherCategory: 'temperate' },
  { name: 'Maldives', country: 'Maldives', continent: 'Asia', lat: 3.2028, lng: 73.2207, costIndex: 'luxury', popularityScore: 9.5, flagEmoji: '🇲🇻', avgDailyCost: 350, weatherCategory: 'beach' },
  { name: 'Santorini', country: 'Greece', continent: 'Europe', lat: 36.3932, lng: 25.4615, costIndex: 'luxury', popularityScore: 9.4, flagEmoji: '🇬🇷', avgDailyCost: 200, weatherCategory: 'temperate' },
  { name: 'Kyoto', country: 'Japan', continent: 'Asia', lat: 35.0116, lng: 135.7681, costIndex: 'mid', popularityScore: 9.3, flagEmoji: '🇯🇵', avgDailyCost: 130, weatherCategory: 'temperate' },
  { name: 'Marrakech', country: 'Morocco', continent: 'Africa', lat: 31.6295, lng: -7.9811, costIndex: 'budget', popularityScore: 8.5, flagEmoji: '🇲🇦', avgDailyCost: 55, weatherCategory: 'desert' },
  { name: 'Cape Town', country: 'South Africa', continent: 'Africa', lat: -33.9249, lng: 18.4241, costIndex: 'mid', popularityScore: 8.8, flagEmoji: '🇿🇦', avgDailyCost: 90, weatherCategory: 'temperate' },
  { name: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', lat: -22.9068, lng: -43.1729, costIndex: 'mid', popularityScore: 8.7, flagEmoji: '🇧🇷', avgDailyCost: 100, weatherCategory: 'tropical' },
  { name: 'Machu Picchu', country: 'Peru', continent: 'South America', lat: -13.1631, lng: -72.5450, costIndex: 'mid', popularityScore: 9.2, flagEmoji: '🇵🇪', avgDailyCost: 80, weatherCategory: 'temperate' },
  { name: 'London', country: 'UK', continent: 'Europe', lat: 51.5074, lng: -0.1278, costIndex: 'luxury', popularityScore: 9.5, flagEmoji: '🇬🇧', avgDailyCost: 210, weatherCategory: 'temperate' },
  { name: 'Vienna', country: 'Austria', continent: 'Europe', lat: 48.2082, lng: 16.3738, costIndex: 'mid', popularityScore: 8.9, flagEmoji: '🇦🇹', avgDailyCost: 130, weatherCategory: 'cold' },
  { name: 'Lisbon', country: 'Portugal', continent: 'Europe', lat: 38.7223, lng: -9.1393, costIndex: 'mid', popularityScore: 8.8, flagEmoji: '🇵🇹', avgDailyCost: 100, weatherCategory: 'temperate' },
  { name: 'Phuket', country: 'Thailand', continent: 'Asia', lat: 7.8804, lng: 98.3923, costIndex: 'budget', popularityScore: 8.9, flagEmoji: '🇹🇭', avgDailyCost: 55, weatherCategory: 'beach' },
  { name: 'New Zealand', country: 'New Zealand', continent: 'Oceania', lat: -40.9006, lng: 174.8860, costIndex: 'mid', popularityScore: 8.7, flagEmoji: '🇳🇿', avgDailyCost: 140, weatherCategory: 'temperate' },
  { name: 'Reykjavik', country: 'Iceland', continent: 'Europe', lat: 64.1265, lng: -21.8174, costIndex: 'luxury', popularityScore: 8.6, flagEmoji: '🇮🇸', avgDailyCost: 230, weatherCategory: 'cold' },
  { name: 'Havana', country: 'Cuba', continent: 'North America', lat: 23.1136, lng: -82.3666, costIndex: 'budget', popularityScore: 8.3, flagEmoji: '🇨🇺', avgDailyCost: 45, weatherCategory: 'tropical' },
  { name: 'Cairo', country: 'Egypt', continent: 'Africa', lat: 30.0444, lng: 31.2357, costIndex: 'budget', popularityScore: 8.5, flagEmoji: '🇪🇬', avgDailyCost: 40, weatherCategory: 'desert' },
  { name: 'Mumbai', country: 'India', continent: 'Asia', lat: 19.0760, lng: 72.8777, costIndex: 'budget', popularityScore: 8.2, flagEmoji: '🇮🇳', avgDailyCost: 35, weatherCategory: 'tropical' },
  { name: 'Seoul', country: 'South Korea', continent: 'Asia', lat: 37.5665, lng: 126.9780, costIndex: 'mid', popularityScore: 8.9, flagEmoji: '🇰🇷', avgDailyCost: 110, weatherCategory: 'temperate' },
  { name: 'Mexico City', country: 'Mexico', continent: 'North America', lat: 19.4326, lng: -99.1332, costIndex: 'budget', popularityScore: 8.1, flagEmoji: '🇲🇽', avgDailyCost: 50, weatherCategory: 'temperate' },
  { name: 'Buenos Aires', country: 'Argentina', continent: 'South America', lat: -34.6037, lng: -58.3816, costIndex: 'budget', popularityScore: 8.4, flagEmoji: '🇦🇷', avgDailyCost: 55, weatherCategory: 'temperate' },
  { name: 'Zurich', country: 'Switzerland', continent: 'Europe', lat: 47.3769, lng: 8.5417, costIndex: 'luxury', popularityScore: 8.5, flagEmoji: '🇨🇭', avgDailyCost: 280, weatherCategory: 'cold' },
  { name: 'Copenhagen', country: 'Denmark', continent: 'Europe', lat: 55.6761, lng: 12.5683, costIndex: 'luxury', popularityScore: 8.6, flagEmoji: '🇩🇰', avgDailyCost: 200, weatherCategory: 'cold' },
  { name: 'Budapest', country: 'Hungary', continent: 'Europe', lat: 47.4979, lng: 19.0402, costIndex: 'budget', popularityScore: 8.7, flagEmoji: '🇭🇺', avgDailyCost: 65, weatherCategory: 'cold' },
  { name: 'Hanoi', country: 'Vietnam', continent: 'Asia', lat: 21.0285, lng: 105.8542, costIndex: 'budget', popularityScore: 8.3, flagEmoji: '🇻🇳', avgDailyCost: 35, weatherCategory: 'tropical' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', continent: 'Asia', lat: 10.8231, lng: 106.6297, costIndex: 'budget', popularityScore: 8.2, flagEmoji: '🇻🇳', avgDailyCost: 30, weatherCategory: 'tropical' },
  { name: 'Colombo', country: 'Sri Lanka', continent: 'Asia', lat: 6.9271, lng: 79.8612, costIndex: 'budget', popularityScore: 7.9, flagEmoji: '🇱🇰', avgDailyCost: 40, weatherCategory: 'tropical' },
  { name: 'Nairobi', country: 'Kenya', continent: 'Africa', lat: -1.2921, lng: 36.8219, costIndex: 'budget', popularityScore: 7.8, flagEmoji: '🇰🇪', avgDailyCost: 45, weatherCategory: 'temperate' },
  { name: 'Toronto', country: 'Canada', continent: 'North America', lat: 43.6532, lng: -79.3832, costIndex: 'luxury', popularityScore: 8.5, flagEmoji: '🇨🇦', avgDailyCost: 160, weatherCategory: 'cold' },
  { name: 'Vancouver', country: 'Canada', continent: 'North America', lat: 49.2827, lng: -123.1207, costIndex: 'luxury', popularityScore: 8.6, flagEmoji: '🇨🇦', avgDailyCost: 170, weatherCategory: 'temperate' },
  { name: 'Los Angeles', country: 'USA', continent: 'North America', lat: 34.0522, lng: -118.2437, costIndex: 'luxury', popularityScore: 9.0, flagEmoji: '🇺🇸', avgDailyCost: 190, weatherCategory: 'temperate' },
  { name: 'Miami', country: 'USA', continent: 'North America', lat: 25.7617, lng: -80.1918, costIndex: 'luxury', popularityScore: 8.8, flagEmoji: '🇺🇸', avgDailyCost: 180, weatherCategory: 'beach' },
  { name: 'Berlin', country: 'Germany', continent: 'Europe', lat: 52.5200, lng: 13.4050, costIndex: 'mid', popularityScore: 8.7, flagEmoji: '🇩🇪', avgDailyCost: 110, weatherCategory: 'cold' },
  { name: 'Milan', country: 'Italy', continent: 'Europe', lat: 45.4654, lng: 9.1859, costIndex: 'luxury', popularityScore: 8.6, flagEmoji: '🇮🇹', avgDailyCost: 160, weatherCategory: 'temperate' },
  { name: 'Florence', country: 'Italy', continent: 'Europe', lat: 43.7696, lng: 11.2558, costIndex: 'mid', popularityScore: 9.0, flagEmoji: '🇮🇹', avgDailyCost: 130, weatherCategory: 'temperate' },
  { name: 'Petra', country: 'Jordan', continent: 'Asia', lat: 30.3285, lng: 35.4444, costIndex: 'mid', popularityScore: 9.1, flagEmoji: '🇯🇴', avgDailyCost: 80, weatherCategory: 'desert' },
  { name: 'Kathmandu', country: 'Nepal', continent: 'Asia', lat: 27.7172, lng: 85.3240, costIndex: 'budget', popularityScore: 8.4, flagEmoji: '🇳🇵', avgDailyCost: 30, weatherCategory: 'cold' },
  { name: 'Queenstown', country: 'New Zealand', continent: 'Oceania', lat: -45.0312, lng: 168.6626, costIndex: 'mid', popularityScore: 9.0, flagEmoji: '🇳🇿', avgDailyCost: 150, weatherCategory: 'temperate' },
  { name: 'Cancun', country: 'Mexico', continent: 'North America', lat: 21.1619, lng: -86.8515, costIndex: 'mid', popularityScore: 8.7, flagEmoji: '🇲🇽', avgDailyCost: 90, weatherCategory: 'beach' },
];

const activityTemplates = [
  { name: 'City Walking Tour', category: 'sightseeing', description: 'Explore the city on foot with a local guide', costEstimate: 25, durationHours: 3, rating: 4.5 },
  { name: 'Local Food Tour', category: 'food', description: 'Taste authentic local cuisine at hidden gems', costEstimate: 45, durationHours: 3, rating: 4.7 },
  { name: 'Museum Visit', category: 'culture', description: 'Explore world-class art and history collections', costEstimate: 20, durationHours: 2.5, rating: 4.3 },
  { name: 'Sunset Cruise', category: 'sightseeing', description: 'Enjoy breathtaking views from the water', costEstimate: 60, durationHours: 2, rating: 4.8 },
  { name: 'Street Food Adventure', category: 'food', description: 'Sample street food from local vendors', costEstimate: 15, durationHours: 2, rating: 4.6 },
  { name: 'Hiking Trail', category: 'adventure', description: 'Trek through scenic natural landscapes', costEstimate: 10, durationHours: 5, rating: 4.5 },
  { name: 'Cooking Class', category: 'culture', description: 'Learn to cook traditional local dishes', costEstimate: 55, durationHours: 3, rating: 4.9 },
  { name: 'Night Market', category: 'shopping', description: 'Browse local crafts and street food at night', costEstimate: 20, durationHours: 2, rating: 4.4 },
  { name: 'Spa & Wellness', category: 'wellness', description: 'Relax with traditional massage and treatments', costEstimate: 70, durationHours: 2, rating: 4.7 },
  { name: 'Rooftop Bar', category: 'nightlife', description: 'Enjoy cocktails with panoramic city views', costEstimate: 40, durationHours: 2, rating: 4.5 },
  { name: 'Bike Tour', category: 'adventure', description: 'Cycle through scenic routes and neighborhoods', costEstimate: 30, durationHours: 3, rating: 4.4 },
  { name: 'Historic Landmark Visit', category: 'sightseeing', description: 'Visit iconic historical monuments and sites', costEstimate: 15, durationHours: 2, rating: 4.6 },
  { name: 'Local Market', category: 'shopping', description: 'Shop for fresh produce and local goods', costEstimate: 10, durationHours: 1.5, rating: 4.3 },
  { name: 'Boat Tour', category: 'adventure', description: 'Explore waterways and coastal areas by boat', costEstimate: 50, durationHours: 3, rating: 4.6 },
  { name: 'Wine Tasting', category: 'food', description: 'Sample local wines with expert guidance', costEstimate: 65, durationHours: 2, rating: 4.7 },
  { name: 'Photography Walk', category: 'culture', description: 'Capture stunning shots at iconic locations', costEstimate: 0, durationHours: 2, rating: 4.2 },
  { name: 'Temple/Church Visit', category: 'culture', description: 'Explore sacred religious architecture', costEstimate: 5, durationHours: 1.5, rating: 4.5 },
  { name: 'Beach Day', category: 'wellness', description: 'Relax on pristine beaches', costEstimate: 0, durationHours: 4, rating: 4.8 },
  { name: 'Zip-lining', category: 'adventure', description: 'Soar through the air on thrilling zip lines', costEstimate: 80, durationHours: 2, rating: 4.7 },
  { name: 'Jazz/Live Music', category: 'nightlife', description: 'Enjoy live local music performances', costEstimate: 30, durationHours: 2.5, rating: 4.6 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create cities
  const createdCities = await Promise.all(
    cities.map((city) => prisma.city.create({ data: city }))
  );
  console.log(`✅ Created ${createdCities.length} cities`);

  // Create 4 activities per city
  let activityCount = 0;
  for (const city of createdCities) {
    const shuffled = [...activityTemplates].sort(() => Math.random() - 0.5).slice(0, 4);
    for (const template of shuffled) {
      await prisma.activity.create({
        data: {
          ...template,
          cityId: city.id,
          name: `${template.name} in ${city.name}`,
        },
      });
      activityCount++;
    }
  }
  console.log(`✅ Created ${activityCount} activities`);

  // Create admin user
  const bcrypt = (await import('bcryptjs')).default;
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@traveloop.com', passwordHash: hash, isAdmin: true },
  });
  console.log('✅ Created admin user: admin@traveloop.com / admin123');
  console.log('🎉 Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
