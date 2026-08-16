/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f0f9ff",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7"
        },
        luxury: {
          blue: "#0f2a4a",
          sky: "#38bdf8",
          emerald: "#10b981",
          gold: "#f5c542"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(14, 165, 233, 0.28)",
        gold: "0 18px 50px rgba(245, 197, 66, 0.22)"
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        }
      },
      animation: {
        gradient: "gradientShift 12s ease infinite",
        float: "float 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
