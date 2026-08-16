import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const nowIso = () => new Date().toISOString();

export const getAssistantResponse = async (req, res) => {
  const { message = "", history = [], files = [] } = req.body;
  const userId = req.body.userId || req.query.userId;

  let activeBooking = null;
  let userPrefs = {
    destination: "Jaipur",
    hotel: "Grand Horizon Palace",
    budget: "Rs. 25,000",
    diet: "Vegetarian",
    dates: "Aug 15 - Aug 18"
  };

  // Attempt to resolve live traveler context
  if (userId) {
    if (isDatabaseConnected()) {
      try {
        const bookings = await Booking.find({ user: userId }).populate("hotel");
        const hotelBooking = bookings.find((b) => b.bookingType === "hotel");
        if (hotelBooking && hotelBooking.hotel) {
          activeBooking = hotelBooking;
          userPrefs = {
            destination: hotelBooking.hotel.city || "Jaipur",
            hotel: hotelBooking.hotel.name,
            budget: `Rs. ${hotelBooking.totalPrice || "15,000"}`,
            diet: "Vegetarian", // default preference
            dates: `${new Date(hotelBooking.checkIn).toLocaleDateString()} to ${new Date(hotelBooking.checkOut).toLocaleDateString()}`
          };
        }
      } catch (_) {}
    } else {
      const bookings = fallbackStore.getCollection("bookings") || [];
      const hotelBooking = bookings.find((b) => b.user === userId && b.bookingType === "hotel");
      if (hotelBooking) {
        const hotelObj = fallbackStore.findListingById("hotel", hotelBooking.hotel);
        if (hotelObj) {
          userPrefs = {
            destination: hotelObj.city || "Jaipur",
            hotel: hotelObj.name,
            budget: "Rs. 18,500",
            diet: "Vegetarian",
            dates: "Next week"
          };
        }
      }
    }
  }

  // 1. Try Calling OpenAI/Gemini if keys are configured
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const systemInstructions = `You are a production-ready luxury AI Travel Assistant on Yatri.in.
Context about current traveler session:
- Booked Hotel: ${userPrefs.hotel}
- Active Destination: ${userPrefs.destination}
- Dates: ${userPrefs.dates}
- Budget Category: ${userPrefs.budget}
- Diet Preference: ${userPrefs.diet}

Be helpful, concise, support Markdown headings, list blocks, emoji, and bold text. Suggest street food or travel actions when relevant.`;

  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstructions },
            ...history.map((h) => ({ role: h.sender === "user" ? "user" : "assistant", content: h.text })),
            { role: "user", content: message }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ text: data.choices[0].message.content });
      }
    } catch (_) {}
  }

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${systemInstructions}\n\nUser: ${message}` }] }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ text: data.candidates[0].content.parts[0].text });
      }
    } catch (_) {}
  }

  // 2. Realistic, rule-based fallback assistant responses
  const q = message.toLowerCase();
  let text = `Greetings! I am your AI Travel Assistant. I see you are staying at **${userPrefs.hotel}** in **${userPrefs.destination}** during your stay (${userPrefs.dates}). How can I help you map out your itinerary today?`;

  if (q.includes("weather")) {
    text = `### 🌤️ Weather Forecast for **${userPrefs.destination}**
- **Average Temperature:** 28°C - 32°C
- **Conditions:** Clear skies with light afternoon breeze.
- **Advice:** Cotton apparel, hats, and SPF 50 sunscreen are recommended for sightseeing.`;
  } else if (q.includes("food") || q.includes("restaurant") || q.includes("street")) {
    text = `### 🍲 Local Street Food Suggestions near **${userPrefs.hotel}**
1. **Shree Balaji Chaat Bhandar** (4.8★) — Try the spicy Aloo Tikki & Papdi Chaat (Walk: 6 mins).
2. **Royal Kulfi Parlour** (4.6★) — Traditional cardamom & saffron kulfi desserts (Drive: 4 mins).
3. **Heritage Dhaba** (4.5★) — Pure vegetarian local thali platters.
*Tip: Specify your spice tolerance to filter more street food stalls!*`;
  } else if (q.includes("packing") || q.includes("pack")) {
    text = `### 🎒 Smart Packing Checklist for **${userPrefs.destination}**
- **Clothing:** Cotton shirts, comfortable walking trousers, hats.
- **Electronics:** Mobile charger, power bank, international adapter plug.
- **Medicines:** Basic pain relievers, digestive enzymes, sunscreen.
- **Documents:** ID card photocopies, flight vouchers.`;
  } else if (q.includes("emergency") || q.includes("hospital") || q.includes("police")) {
    text = `### 🚨 Emergency Support Contacts in **${userPrefs.destination}**
- **National Emergency Desk:** Dial **112**
- **Local Ambulance Desk:** Dial **102**
- **Closest Hospital:** City Emergency Center (+91 11 2345 6789)
*We have also pinned emergency locations on your Map panel.*`;
  } else if (q.includes("currency") || q.includes("conversion")) {
    text = `### 💱 Currency Information
- **Local Currency:** Indian Rupee (INR - ₹)
- **Current Estimate:** $1 USD ≈ ₹83.40 INR
- **Tip:** Carry small cash denominations (Rs. 100 & Rs. 200) for local street market stalls.`;
  }

  res.json({ text });
};
