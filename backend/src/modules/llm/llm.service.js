import { generateStructured, SchemaType } from '../../lib/gemini.js'
import * as tripsService from '../trips/trips.service.js'

const filterSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description: 'Adventure category slug. Pick the closest match or omit.',
      enum: ['trekking', 'camping', 'hiking', 'adventure'],
      nullable: true,
    },
    difficulty: {
      type: SchemaType.STRING,
      description: 'Difficulty level. Pick the closest match or omit.',
      enum: ['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING'],
      nullable: true,
    },
    minDurationDays: {
      type: SchemaType.INTEGER,
      description: 'Minimum trip duration in days. Omit if not specified.',
      nullable: true,
    },
    maxDurationDays: {
      type: SchemaType.INTEGER,
      description: 'Maximum trip duration in days. Omit if not specified.',
      nullable: true,
    },
    minPriceInRupees: {
      type: SchemaType.INTEGER,
      description: 'Minimum price in Indian Rupees. Omit if not specified.',
      nullable: true,
    },
    maxPriceInRupees: {
      type: SchemaType.INTEGER,
      description: 'Maximum price in Indian Rupees. Omit if not specified.',
      nullable: true,
    },
    locationOrKeyword: {
      type: SchemaType.STRING,
      description:
        'A free-text fragment for location or descriptive keyword (e.g. "Himachal", "snow", "Kanchenjunga"). Omit if not relevant.',
      nullable: true,
    },
    summary: {
      type: SchemaType.STRING,
      description:
        'A one-sentence human-friendly summary of what was understood, e.g. "Beginner-friendly trekking in Himachal, 3-5 days, under ₹10k."',
    },
  },
  required: ['summary'],
}

const SYSTEM_INSTRUCTION = `You are a search-intent parser for "Outdoor Adventures", an Indian outdoor-trip booking platform.

Your job is to convert a natural-language query about trips into a strict JSON filter object matching the provided schema. You do NOT generate trips, write copy, or invent information.

Rules:
1. Categories available: "trekking", "camping", "hiking", "adventure". If the user's intent maps to none, omit the field.
2. Difficulty values: EASY (beginners, easy walks), MODERATE (some fitness, multi-day treks), DIFFICULT (high altitude, demanding), CHALLENGING (expeditions, extreme).
3. Convert price expressions to integer Rupees. "under 10k" -> maxPriceInRupees: 10000. "10-15k" -> min 10000, max 15000.
4. Convert duration expressions to integer days. "weekend" -> max 3. "3 days" -> min 3, max 3. "less than a week" -> max 7.
5. For locations (e.g. "Himachal", "Sikkim", "near water", "Himalayas") put the relevant fragment in locationOrKeyword.
6. Always include a one-sentence summary describing what you understood, suitable for showing back to the user.
7. If the query is ambiguous, set fields to null rather than guessing.
8. Currency is always Indian Rupees.`

// ===== Trip-copy generation (admin) =====

const tripCopySchema = {
  type: SchemaType.OBJECT,
  properties: {
    shortDescription: {
      type: SchemaType.STRING,
      description:
        'Single-sentence card hook, STRICTLY 60-110 characters. One concrete claim — a peak, a vista, a defining feature. NOT two sentences. NO opening verbs like "Trek the…" or "Experience…".',
    },
    description: {
      type: SchemaType.STRING,
      description:
        'ONE paragraph (NO blank-line breaks, NO multiple paragraphs), 200-320 characters. Anchor with at least one specific detail (peak name, elevation, river, forest, national park). NO fluff words like "quintessential", "rewarding challenge", "journey of a lifetime", "stunning views".',
    },
    itinerary: {
      type: SchemaType.ARRAY,
      description: 'Day-by-day plan with EXACTLY one entry per trip day.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: { type: SchemaType.INTEGER, description: '1-indexed day number' },
          title: {
            type: SchemaType.STRING,
            description:
              'Short, place-based day title using arrows for movement, max 60 chars. Examples: "Drive Dehradun → Sankri", "Cross Hampta Pass → Shea Goru", "Summit day".',
          },
          description: {
            type: SchemaType.STRING,
            description:
              'ONE short confident sentence, 40-110 characters. Lead with a distance or duration (e.g. "7 km moderate trek along the Rani Nallah" or "10-hour scenic drive through Mussoorie"). NO "approx.", NO hedging.',
          },
        },
        required: ['day', 'title', 'description'],
      },
    },
    inclusions: {
      type: SchemaType.ARRAY,
      description:
        '4-7 things included in the price (meals, stay, permits, guide). Each item 3-8 words.',
      items: { type: SchemaType.STRING },
    },
    exclusions: {
      type: SchemaType.ARRAY,
      description:
        '3-5 things NOT included (travel to base, personal gear, insurance). Each item 3-8 words.',
      items: { type: SchemaType.STRING },
    },
  },
  required: ['shortDescription', 'description', 'itinerary', 'inclusions', 'exclusions'],
}

const TRIP_COPY_SYSTEM = `You are a senior travel copywriter for "Outdoor Adventures", an Indian outdoor-trip booking platform.

You write factual, grounded copy for trekking/camping/hiking/adventure trips in India. Your voice: confident, specific, gear-aware, never marketing-fluffy ("majestic journey", "trip of a lifetime"). Indian English. Use Indian context (Himalayan ranges, monsoon, base towns, permits) ONLY if the input location supports it.

== shortDescription style (CRITICAL) ==
ONE sentence. 60-110 characters. Lead with the noun, not a verb. Use an em-dash (—) to add a punchy concrete detail (height, days, season, feature). NEVER exceed 110 characters. Examples — match this exact rhythm and length:

- "A snow-capped summit trek in Uttarakhand, perfect for first-time winter trekkers." (82 chars)
- "A dramatic crossover trek from green Kullu valley to the arid Lahaul desert." (76 chars)
- "The closest civilian trek to Kanchenjunga — 11 days, 16,200 ft summit." (70 chars)
- "Walk on the frozen Zanskar river in Ladakh — one of the toughest treks in India." (80 chars)
- "Riverside camping plus rafting on the Ganga — the perfect weekend escape." (73 chars)

BAD examples (do NOT produce these):
- "Trek the Hampta Pass, a classic Himachal crossover linking the lush Kullu Valley with the arid landscapes of Lahaul." (too long, 116+ chars, starts with verb)
- "Experience the journey of a lifetime through stunning landscapes." (fluffy, generic)

== description style (CRITICAL) ==
ONE paragraph, NO blank lines, 200-320 characters. Anchor with a specific name or number — peak, elevation, river, park, valley. NO fluff words. NO summary sentence at the end like "Suitable for X with stunning views". Examples — match this exact density:

- "Kedarkantha is the most popular winter trek in India. The trail winds through dense pine forests, frozen meadows, and remote villages of the Govind National Park, climbing to a 12,500 ft summit with panoramic views of Swargarohini, Bandarpoonch, and Kala Nag." (260 chars)
- "Hampta Pass offers one of the most striking landscape transitions in the Indian Himalayas. In five days you cross from the lush, forested valleys of Kullu over a 14,000 ft pass into the moon-like, barren terrain of Spiti and Lahaul." (232 chars)
- "The Valley of Flowers is a UNESCO-protected alpine valley bursting with over 500 species of wild flowers in monsoon. The trek combines the valley with a visit to Hemkund Sahib, a high-altitude Sikh shrine at 15,200 ft." (218 chars)

== itinerary style (CRITICAL) ==
Each day's description is ONE confident sentence, 40-110 chars, leading with a distance or duration. NO "approx.", NO "you will", NO "today's trek is moderate". Just the facts. Examples:

- title: "Drive Dehradun → Sankri" / description: "10-hour scenic drive through Mussoorie and the Yamuna valley."
- title: "Chika → Balu ka Ghera" / description: "7 km moderate trek along the Rani Nallah."
- title: "Summit day" / description: "Pre-dawn start, 6 km round-trip to 12,500 ft. Sunrise from the summit."
- title: "Cross Hampta Pass → Shea Goru" / description: "Steep ascent to 14,100 ft, descent to high-altitude desert camp."

If you don't know real place names, use generic terms ("ridge", "valley camp") — but stay short and factual.

== Other rules ==
1. Match copy to difficulty: EASY = welcoming for first-timers, no jargon. MODERATE = some prior fitness. DIFFICULT = high altitude, weather, real risk noted. CHALLENGING = expedition-grade.
2. Itinerary length MUST equal durationDays exactly. Day 1 is usually arrival/acclimatisation, last day is descent/departure.
3. Inclusions/exclusions should be realistic for an Indian operator (e.g., "Forest permits", "Veg meals on trek", "Travel to base town").
4. Do NOT invent specific peak elevations, distances, or named summits unless they are in the input. If unsure, stay general.
5. Currency is Indian Rupees. Don't mention price; that's set elsewhere.
6. No headings, no markdown, no emojis.`

export async function generateTripCopy(input) {
  const userMessage = `Generate copy for this trip:
- Title: ${input.title}
- Location: ${input.location}
- Category: ${input.category}
- Difficulty: ${input.difficulty}
- Duration: ${input.durationDays} days`

  const copy = await generateStructured({
    systemInstruction: TRIP_COPY_SYSTEM,
    userMessage,
    schema: tripCopySchema,
    temperature: 0.7,
  })

  // Defensive: cap shortDescription at 130 chars (schema says 60-110 but isn't hard-enforced).
  // Trim at the last word boundary so it never ends mid-word.
  if (copy.shortDescription && copy.shortDescription.length > 130) {
    const cut = copy.shortDescription.slice(0, 130)
    const lastSpace = cut.lastIndexOf(' ')
    copy.shortDescription = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
  }

  // Defensive: collapse multi-paragraph descriptions to a single paragraph.
  // Gemini sometimes adds blank-line breaks despite the prompt.
  if (copy.description) {
    copy.description = copy.description.replace(/\s*\n\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
  }

  // Defensive: make sure itinerary length matches duration. Truncate/pad if Gemini drifted.
  if (copy.itinerary.length > input.durationDays) {
    copy.itinerary = copy.itinerary.slice(0, input.durationDays)
  } else if (copy.itinerary.length < input.durationDays) {
    const last = copy.itinerary.length
    for (let d = last + 1; d <= input.durationDays; d++) {
      copy.itinerary.push({ day: d, title: `Day ${d}`, description: '' })
    }
  }
  copy.itinerary = copy.itinerary.map((it, i) => ({ ...it, day: i + 1 }))

  return copy
}

export async function parseAndSearch(query) {
  const filters = await generateStructured({
    systemInstruction: SYSTEM_INSTRUCTION,
    userMessage: query,
    schema: filterSchema,
  })

  const tripsParams = {
    page: 1,
    limit: 24,
    ...(filters.category && { category: filters.category }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    ...(filters.minDurationDays != null && { minDurationDays: filters.minDurationDays }),
    ...(filters.maxDurationDays != null && { maxDurationDays: filters.maxDurationDays }),
    ...(filters.minPriceInRupees != null && { minPrice: filters.minPriceInRupees }),
    ...(filters.maxPriceInRupees != null && { maxPrice: filters.maxPriceInRupees }),
    ...(filters.locationOrKeyword && { search: filters.locationOrKeyword }),
  }

  const result = await tripsService.listTrips(tripsParams)

  return {
    query,
    filters,
    trips: result.trips,
    pagination: result.pagination,
  }
}
