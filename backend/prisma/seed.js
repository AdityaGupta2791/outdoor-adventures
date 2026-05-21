import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter, log: ['error'] })

const img = (slug) => `https://picsum.photos/seed/${slug}/1200/800`

const inr = (rupees) => rupees * 100

const daysFromNow = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(6, 0, 0, 0)
  return d
}

const categories = [
  {
    slug: 'trekking',
    name: 'Trekking',
    description: 'Multi-day mountain treks across the Indian Himalayas.',
    displayOrder: 1,
  },
  {
    slug: 'camping',
    name: 'Camping',
    description: 'Overnight stays under the stars — riverside, lakeside, high-altitude.',
    displayOrder: 2,
  },
  {
    slug: 'hiking',
    name: 'Hiking',
    description: 'Short weekend hikes — ideal for first-timers and city escapes.',
    displayOrder: 3,
  },
  {
    slug: 'adventure',
    name: 'Adventure',
    description: 'High-difficulty expeditions for experienced trekkers.',
    displayOrder: 4,
  },
]

const tripsData = [
  {
    slug: 'kedarkantha-winter-trek',
    title: 'Kedarkantha Winter Trek',
    shortDescription: 'A snow-capped summit trek in Uttarakhand, perfect for first-time winter trekkers.',
    description:
      'Kedarkantha is the most popular winter trek in India. The trail winds through dense pine forests, frozen meadows, and remote villages of the Govind National Park, climbing to a 12,500 ft summit with panoramic views of Swargarohini, Bandarpoonch, and Kala Nag.',
    categorySlug: 'trekking',
    difficulty: 'MODERATE',
    durationDays: 6,
    location: 'Uttarakhand',
    basePrice: 9500,
    inclusions: ['All meals during trek', 'Camping gear (tent, sleeping bag)', 'Certified trek leader', 'Forest permits', 'First aid kit'],
    exclusions: ['Travel to/from Sankri', 'Personal expenses', 'Trekking insurance', 'Anything not in inclusions'],
    itinerary: [
      { day: 1, title: 'Drive Dehradun → Sankri', description: '10-hour scenic drive through Mussoorie and the Yamuna valley.' },
      { day: 2, title: 'Sankri → Juda ka Talab', description: '4 km uphill trek through oak and pine forests.' },
      { day: 3, title: 'Juda ka Talab → Kedarkantha Base', description: '4 km moderate trek, camp in a clearing.' },
      { day: 4, title: 'Summit day', description: 'Pre-dawn start, 6 km round-trip to 12,500 ft. Sunrise from the summit.' },
      { day: 5, title: 'Descent to Sankri', description: 'Trek down via Hargaon.' },
      { day: 6, title: 'Drive back to Dehradun', description: 'Reach by evening.' },
    ],
    departures: [
      { offsetDays: 25, durationDays: 6, price: 9500, seats: 18 },
      { offsetDays: 45, durationDays: 6, price: 9800, seats: 18 },
    ],
  },
  {
    slug: 'hampta-pass-trek',
    title: 'Hampta Pass Trek',
    shortDescription: 'A dramatic crossover trek from green Kullu valley to the arid Lahaul desert.',
    description:
      'Hampta Pass offers one of the most striking landscape transitions in the Indian Himalayas. In five days you cross from the lush, forested valleys of Kullu over a 14,000 ft pass into the moon-like, barren terrain of Spiti and Lahaul.',
    categorySlug: 'trekking',
    difficulty: 'MODERATE',
    durationDays: 5,
    location: 'Himachal Pradesh',
    basePrice: 10500,
    inclusions: ['All meals during trek', 'Camping gear', 'Trek leader and support staff', 'Forest permits'],
    exclusions: ['Travel to/from Manali', 'Personal expenses', 'Insurance'],
    itinerary: [
      { day: 1, title: 'Manali → Jobra → Chika', description: 'Short drive then 2-hour easy walk to first camp.' },
      { day: 2, title: 'Chika → Balu ka Ghera', description: '7 km moderate trek along the Rani Nallah.' },
      { day: 3, title: 'Cross Hampta Pass → Shea Goru', description: 'Steep ascent to 14,100 ft, descent to high-altitude desert camp.' },
      { day: 4, title: 'Shea Goru → Chatru → Chandra Tal', description: 'Trek out, drive to the moon-lake.' },
      { day: 5, title: 'Return to Manali via Rohtang', description: '6-hour drive.' },
    ],
    departures: [
      { offsetDays: 30, durationDays: 5, price: 10500, seats: 16 },
      { offsetDays: 60, durationDays: 5, price: 10500, seats: 16 },
    ],
  },
  {
    slug: 'valley-of-flowers-trek',
    title: 'Valley of Flowers Trek',
    shortDescription: 'A UNESCO World Heritage trek through alpine meadows carpeted with rare flowers.',
    description:
      'The Valley of Flowers is a UNESCO-protected alpine valley bursting with over 500 species of wild flowers in monsoon. The trek combines the valley with a visit to Hemkund Sahib, a high-altitude Sikh shrine at 15,200 ft.',
    categorySlug: 'trekking',
    difficulty: 'MODERATE',
    durationDays: 6,
    location: 'Uttarakhand',
    basePrice: 11000,
    inclusions: ['All meals', 'Guest house stay in Ghangaria', 'Trek leader', 'National park permits'],
    exclusions: ['Travel to/from Govindghat', 'Personal expenses', 'Insurance'],
    itinerary: [
      { day: 1, title: 'Haridwar → Joshimath', description: '9-hour drive along the Alaknanda.' },
      { day: 2, title: 'Joshimath → Govindghat → Ghangaria', description: 'Drive and 9 km moderate trek.' },
      { day: 3, title: 'Ghangaria → Valley of Flowers → back', description: 'Day trip to the valley, 8 km round-trip.' },
      { day: 4, title: 'Ghangaria → Hemkund Sahib → back', description: 'Steep 12 km round-trip to the sacred lake.' },
      { day: 5, title: 'Trek down to Govindghat, drive to Joshimath', description: '' },
      { day: 6, title: 'Drive back to Haridwar', description: '' },
    ],
    departures: [
      { offsetDays: 90, durationDays: 6, price: 11000, seats: 20 },
      { offsetDays: 120, durationDays: 6, price: 11500, seats: 20 },
    ],
  },
  {
    slug: 'roopkund-trek',
    title: 'Roopkund Trek',
    shortDescription: 'The mystery skeleton lake at 16,000 ft — one of India’s most challenging high-altitude treks.',
    description:
      'Roopkund is a glacial lake at 16,000 ft surrounded by skeletons believed to be over 1,200 years old. The trek is steep, exposed, and physically demanding — only experienced trekkers should attempt it.',
    categorySlug: 'trekking',
    difficulty: 'DIFFICULT',
    durationDays: 8,
    location: 'Uttarakhand',
    basePrice: 15500,
    inclusions: ['All meals', 'Camping gear', 'Certified trek leader', 'High-altitude permits', 'Crampons and ice axe'],
    exclusions: ['Travel to/from Lohajung', 'Personal expenses', 'Mandatory trek insurance'],
    itinerary: [
      { day: 1, title: 'Drive Kathgodam → Lohajung', description: '10-hour mountain drive.' },
      { day: 2, title: 'Lohajung → Didna Village', description: '6 km moderate trek.' },
      { day: 3, title: 'Didna → Ali Bugyal → Bedni Bugyal', description: '11 km across vast meadows at 11,500 ft.' },
      { day: 4, title: 'Bedni → Patar Nachauni', description: 'Climbing to 12,800 ft.' },
      { day: 5, title: 'Patar Nachauni → Bhagwabasa', description: 'Steep climb through Kalu Vinayak Pass.' },
      { day: 6, title: 'Summit day — Roopkund + Junargali', description: 'Pre-dawn climb to 16,000 ft. Hard, exposed, freezing.' },
      { day: 7, title: 'Descend to Bedni Bugyal', description: '' },
      { day: 8, title: 'Trek out and drive to Kathgodam', description: '' },
    ],
    departures: [
      { offsetDays: 110, durationDays: 8, price: 15500, seats: 14 },
    ],
  },
  {
    slug: 'brahmatal-trek',
    title: 'Brahmatal Winter Trek',
    shortDescription: 'A beginner-friendly snow trek with stunning Trishul and Nanda Ghunti views.',
    description:
      'Brahmatal is the easiest winter trek that still gives you fresh snow, frozen lakes, and front-row views of the Trishul and Nanda Ghunti peaks. Ideal first-time snow trek.',
    categorySlug: 'trekking',
    difficulty: 'EASY',
    durationDays: 6,
    location: 'Uttarakhand',
    basePrice: 8800,
    inclusions: ['All meals', 'Camping gear', 'Trek leader', 'Forest permits'],
    exclusions: ['Travel to/from Lohajung', 'Personal expenses', 'Insurance'],
    itinerary: [
      { day: 1, title: 'Kathgodam → Lohajung', description: '10-hour mountain drive.' },
      { day: 2, title: 'Lohajung → Bekaltal', description: '7 km gentle ascent through forest.' },
      { day: 3, title: 'Bekaltal → Brahmatal', description: 'Trek to the frozen lake.' },
      { day: 4, title: 'Brahmatal summit + back to Tilbudi', description: 'Sunrise summit, then descend.' },
      { day: 5, title: 'Trek down to Lohajung', description: '' },
      { day: 6, title: 'Drive back to Kathgodam', description: '' },
    ],
    departures: [
      { offsetDays: 35, durationDays: 6, price: 8800, seats: 20 },
      { offsetDays: 55, durationDays: 6, price: 8800, seats: 20 },
    ],
  },
  {
    slug: 'sandakphu-trek',
    title: 'Sandakphu Singalila Trek',
    shortDescription: 'The only trek that shows four of the five tallest peaks in the world.',
    description:
      'From the ridge of Sandakphu (11,930 ft) you can see Everest, Kanchenjunga, Lhotse, and Makalu lined up on the horizon. The trail runs along the India-Nepal border through rhododendron forests.',
    categorySlug: 'trekking',
    difficulty: 'MODERATE',
    durationDays: 7,
    location: 'West Bengal',
    basePrice: 12500,
    inclusions: ['All meals', 'Trekkers hut stay', 'Trek leader', 'Permits'],
    exclusions: ['Travel to/from NJP', 'Personal expenses', 'Insurance'],
    itinerary: [
      { day: 1, title: 'NJP → Manebhanjan', description: '4-hour drive.' },
      { day: 2, title: 'Manebhanjan → Tumling', description: '11 km moderate climb.' },
      { day: 3, title: 'Tumling → Kalapokhri', description: '14 km through Singalila National Park.' },
      { day: 4, title: 'Kalapokhri → Sandakphu', description: '6 km final push to the summit ridge.' },
      { day: 5, title: 'Sunrise + descend to Gurdum', description: 'Sleeping mountain views at dawn.' },
      { day: 6, title: 'Gurdum → Srikhola → Manebhanjan', description: '' },
      { day: 7, title: 'Drive to NJP', description: '' },
    ],
    departures: [
      { offsetDays: 200, durationDays: 7, price: 12500, seats: 18 },
    ],
  },
  {
    slug: 'spiti-valley-camping',
    title: 'Spiti Valley Camping Expedition',
    shortDescription: '8 days through high-altitude monasteries, river camps, and remote villages.',
    description:
      'A road and camping journey through Spiti — Kaza, Key, Kibber, Chandratal — with overnight stays in tents pitched in some of the highest inhabited valleys on earth.',
    categorySlug: 'camping',
    difficulty: 'MODERATE',
    durationDays: 8,
    location: 'Himachal Pradesh',
    basePrice: 18500,
    inclusions: ['All meals', 'Camping gear', 'Innova travel', 'Permits', 'Local guide'],
    exclusions: ['Travel to/from Manali', 'Personal expenses', 'Monastery donations'],
    itinerary: [
      { day: 1, title: 'Manali → Kaza', description: 'Long but stunning drive via Kunzum Pass.' },
      { day: 2, title: 'Kaza → Key Monastery → Kibber', description: '' },
      { day: 3, title: 'Kibber → Tashigang → Komic', description: 'World’s highest motorable villages.' },
      { day: 4, title: 'Komic → Langza → Hikkim → Kaza', description: '' },
      { day: 5, title: 'Kaza → Pin Valley → Mudh', description: '' },
      { day: 6, title: 'Mudh → Chandratal', description: 'Camp by the moon-lake at 14,100 ft.' },
      { day: 7, title: 'Chandratal → Manali', description: '' },
      { day: 8, title: 'Departure', description: '' },
    ],
    departures: [
      { offsetDays: 80, durationDays: 8, price: 18500, seats: 12 },
    ],
  },
  {
    slug: 'pangong-lake-camping',
    title: 'Pangong Lake Camping',
    shortDescription: 'Two nights of luxury camping beside the surreal blue Pangong in Ladakh.',
    description:
      'Pangong Tso is a 134 km long brackish lake at 14,000 ft that changes color from blue to green to grey through the day. Stay in premium tents on the Ladakh side, with private camp dining.',
    categorySlug: 'camping',
    difficulty: 'EASY',
    durationDays: 4,
    location: 'Ladakh',
    basePrice: 14000,
    inclusions: ['All meals at camp', 'Premium tent', 'Innova travel from Leh', 'Permits'],
    exclusions: ['Flights to Leh', 'Personal expenses', 'Acclimatization day'],
    itinerary: [
      { day: 1, title: 'Leh acclimatization', description: 'Rest day, light walks around Leh.' },
      { day: 2, title: 'Leh → Pangong via Chang La', description: '5-hour drive.' },
      { day: 3, title: 'Full day at Pangong', description: 'Sunrise, sunset, lake walks.' },
      { day: 4, title: 'Drive back to Leh', description: '' },
    ],
    departures: [
      { offsetDays: 100, durationDays: 4, price: 14000, seats: 12 },
      { offsetDays: 130, durationDays: 4, price: 14500, seats: 12 },
    ],
  },
  {
    slug: 'rishikesh-river-camping',
    title: 'Rishikesh River Camping Weekend',
    shortDescription: 'Riverside camping plus rafting on the Ganga — the perfect weekend escape.',
    description:
      'Two days of riverside camping on the banks of the Ganga in Shivpuri, with a 16 km rafting session through Grade III rapids. Easy to reach from Delhi.',
    categorySlug: 'camping',
    difficulty: 'EASY',
    durationDays: 2,
    location: 'Uttarakhand',
    basePrice: 3500,
    inclusions: ['Tented accommodation', 'All meals', 'Rafting session', 'Bonfire'],
    exclusions: ['Travel to Rishikesh', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Shivpuri, check in to camp', description: 'Evening bonfire and dinner.' },
      { day: 2, title: 'Rafting + check out', description: '16 km Grade III rafting from Shivpuri to Rishikesh.' },
    ],
    departures: [
      { offsetDays: 14, durationDays: 2, price: 3500, seats: 30 },
      { offsetDays: 21, durationDays: 2, price: 3500, seats: 30 },
      { offsetDays: 28, durationDays: 2, price: 3800, seats: 30 },
    ],
  },
  {
    slug: 'triund-hike',
    title: 'Triund Weekend Hike',
    shortDescription: 'A quick overnight hike above McLeod Ganj with sunrise over Dhauladhar.',
    description:
      'Triund is the most accessible Himalayan hike in India. A 9 km climb from Galu Devi temple takes you to a grassy ridge at 9,400 ft with the Dhauladhar peaks looming directly overhead.',
    categorySlug: 'hiking',
    difficulty: 'EASY',
    durationDays: 2,
    location: 'Himachal Pradesh',
    basePrice: 2800,
    inclusions: ['Tent and sleeping bag', 'Dinner and breakfast', 'Guide', 'Forest permit'],
    exclusions: ['Travel to McLeod Ganj', 'Lunch'],
    itinerary: [
      { day: 1, title: 'McLeod Ganj → Triund', description: '9 km gradual ascent, camp on the ridge.' },
      { day: 2, title: 'Sunrise + descent', description: 'Sunrise over Dhauladhar, then descend to McLeod Ganj.' },
    ],
    departures: [
      { offsetDays: 10, durationDays: 2, price: 2800, seats: 25 },
      { offsetDays: 17, durationDays: 2, price: 2800, seats: 25 },
    ],
  },
  {
    slug: 'nag-tibba-hike',
    title: 'Nag Tibba Weekend Hike',
    shortDescription: 'The closest Himalayan summit hike from Delhi — perfect first trek.',
    description:
      'Nag Tibba is the highest peak in the lower Garhwal at 9,915 ft. Reachable in a weekend from Delhi, with a real summit and panoramic Bandarpoonch / Swargarohini views.',
    categorySlug: 'hiking',
    difficulty: 'EASY',
    durationDays: 2,
    location: 'Uttarakhand',
    basePrice: 3200,
    inclusions: ['Camping gear', 'All meals', 'Trek leader'],
    exclusions: ['Travel to Pantwari', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Pantwari → Nag Tibba Base Camp', description: '5 km steady climb.' },
      { day: 2, title: 'Summit + descent', description: 'Pre-dawn summit, then trek down to Pantwari.' },
    ],
    departures: [
      { offsetDays: 12, durationDays: 2, price: 3200, seats: 20 },
      { offsetDays: 26, durationDays: 2, price: 3200, seats: 20 },
    ],
  },
  {
    slug: 'kheerganga-hike',
    title: 'Kheerganga Hike',
    shortDescription: 'Hot springs at 9,700 ft surrounded by pine forests in Parvati Valley.',
    description:
      'A 12 km hike up Parvati Valley to natural hot-water springs. Camp on the meadow at the top, soak in the springs at sunset.',
    categorySlug: 'hiking',
    difficulty: 'EASY',
    durationDays: 3,
    location: 'Himachal Pradesh',
    basePrice: 4500,
    inclusions: ['Camping gear', 'Meals', 'Guide'],
    exclusions: ['Travel to Barshaini', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Barshaini → Kheerganga', description: '12 km moderate hike through Parvati Valley.' },
      { day: 2, title: 'Day at Kheerganga', description: 'Hot springs, rest.' },
      { day: 3, title: 'Descent to Barshaini', description: '' },
    ],
    departures: [
      { offsetDays: 20, durationDays: 3, price: 4500, seats: 22 },
    ],
  },
  {
    slug: 'bhrigu-lake-trek',
    title: 'Bhrigu Lake Trek',
    shortDescription: 'A short high-altitude lake trek with one of the steepest ascents in India.',
    description:
      'Bhrigu Lake sits at 14,100 ft in the Kullu valley. Short but steep — four days of fast altitude gain. The lake stays frozen most of the year.',
    categorySlug: 'trekking',
    difficulty: 'MODERATE',
    durationDays: 4,
    location: 'Himachal Pradesh',
    basePrice: 8500,
    inclusions: ['Camping gear', 'All meals', 'Trek leader', 'Permits'],
    exclusions: ['Travel to/from Manali', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Manali → Gulaba → Jonker Thatch', description: 'Short drive then 4 km climb.' },
      { day: 2, title: 'Jonker Thatch → Roli Kholi', description: 'Climbing fast through meadows.' },
      { day: 3, title: 'Bhrigu Lake + back to Gulaba', description: 'Long summit day.' },
      { day: 4, title: 'Drive to Manali', description: '' },
    ],
    departures: [
      { offsetDays: 50, durationDays: 4, price: 8500, seats: 18 },
    ],
  },
  {
    slug: 'chadar-frozen-river-trek',
    title: 'Chadar Frozen River Trek',
    shortDescription: 'Walk on the frozen Zanskar river in Ladakh — one of the toughest treks in India.',
    description:
      'The Chadar is the frozen sheet of ice that forms over the Zanskar river in mid-winter. Temperatures drop to -25°C. Trek along the river ice for 9 days — only for very experienced trekkers.',
    categorySlug: 'adventure',
    difficulty: 'CHALLENGING',
    durationDays: 9,
    location: 'Ladakh',
    basePrice: 23500,
    inclusions: ['All meals', 'Camping gear rated for -30°C', 'Certified guide', 'All permits', 'Acclimatization days in Leh'],
    exclusions: ['Flights to Leh', 'Trek insurance (mandatory)', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Leh, rest', description: '' },
      { day: 2, title: 'Acclimatization day in Leh', description: '' },
      { day: 3, title: 'Drive to Chilling, trek to Tilad Do', description: '' },
      { day: 4, title: 'Tilad Do → Shingra Koma', description: '' },
      { day: 5, title: 'Shingra Koma → Tibb Cave', description: '' },
      { day: 6, title: 'Tibb Cave → Nerak waterfall', description: 'Frozen waterfall at the turnaround point.' },
      { day: 7, title: 'Nerak → Tibb Cave', description: '' },
      { day: 8, title: 'Trek out to Chilling, drive to Leh', description: '' },
      { day: 9, title: 'Departure', description: '' },
    ],
    departures: [
      { offsetDays: 220, durationDays: 9, price: 23500, seats: 12 },
    ],
  },
  {
    slug: 'goecha-la-trek',
    title: 'Goecha La Trek',
    shortDescription: 'The closest civilian trek to Kanchenjunga — 11 days, 16,200 ft summit.',
    description:
      'Goecha La gives you the most dramatic Kanchenjunga sunrise in India. Long, high, demanding — through Yuksom, Tshoka, Dzongri and the high meadows of Sikkim.',
    categorySlug: 'trekking',
    difficulty: 'DIFFICULT',
    durationDays: 11,
    location: 'Sikkim',
    basePrice: 22000,
    inclusions: ['All meals', 'Camping gear', 'Trek leader', 'Sikkim permits and KNP fees'],
    exclusions: ['Travel to/from NJP', 'Personal expenses', 'Insurance'],
    itinerary: [
      { day: 1, title: 'NJP → Yuksom', description: '7-hour drive.' },
      { day: 2, title: 'Yuksom → Sachen', description: '8 km through rainforest.' },
      { day: 3, title: 'Sachen → Tshoka', description: '7 km steep climb.' },
      { day: 4, title: 'Tshoka → Dzongri', description: '9 km, gaining altitude fast.' },
      { day: 5, title: 'Acclimatization day at Dzongri', description: 'Climb Dzongri Top for first Kanchenjunga view.' },
      { day: 6, title: 'Dzongri → Thansing', description: '10 km descent and re-climb.' },
      { day: 7, title: 'Thansing → Lamuney', description: '4 km, prep for summit.' },
      { day: 8, title: 'Summit day: Lamuney → Goecha La View Point 1', description: 'Pre-dawn climb to 15,100 ft.' },
      { day: 9, title: 'Lamuney → Kokchurang', description: '' },
      { day: 10, title: 'Kokchurang → Tshoka → Yuksom', description: 'Long descent day.' },
      { day: 11, title: 'Drive to NJP', description: '' },
    ],
    departures: [
      { offsetDays: 170, durationDays: 11, price: 22000, seats: 14 },
    ],
  },
]

async function main() {
  console.log('Clearing existing data...')
  await prisma.tripDeparture.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.tripCategory.deleteMany()

  console.log('Seeding categories...')
  const categoryBySlug = {}
  for (const c of categories) {
    const created = await prisma.tripCategory.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        displayOrder: c.displayOrder,
        coverImage: img(`cat-${c.slug}`),
      },
    })
    categoryBySlug[c.slug] = created.id
  }

  console.log(`Seeding ${tripsData.length} trips...`)
  for (const t of tripsData) {
    const tripImages = [img(`${t.slug}-1`), img(`${t.slug}-2`), img(`${t.slug}-3`)]
    await prisma.trip.create({
      data: {
        slug: t.slug,
        title: t.title,
        shortDescription: t.shortDescription,
        description: t.description,
        categoryId: categoryBySlug[t.categorySlug],
        difficulty: t.difficulty,
        durationDays: t.durationDays,
        location: t.location,
        basePriceInPaise: inr(t.basePrice),
        coverImage: img(t.slug),
        images: tripImages,
        itinerary: t.itinerary,
        inclusions: t.inclusions,
        exclusions: t.exclusions,
        status: 'PUBLISHED',
        departures: {
          create: t.departures.map((d) => {
            const start = daysFromNow(d.offsetDays)
            const end = daysFromNow(d.offsetDays + d.durationDays - 1)
            return {
              startDate: start,
              endDate: end,
              priceInPaise: inr(d.price),
              totalSeats: d.seats,
              availableSeats: d.seats,
              status: 'OPEN',
            }
          }),
        },
      },
    })
  }

  const counts = {
    categories: await prisma.tripCategory.count(),
    trips: await prisma.trip.count(),
    departures: await prisma.tripDeparture.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
