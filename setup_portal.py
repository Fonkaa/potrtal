import os

# Create tailwind.config.js
with open("tailwind.config.js", "w", encoding="utf-8") as f:
    f.write('''/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
''')

# Create postcss.config.js
with open("postcss.config.js", "w", encoding="utf-8") as f:
    f.write('''module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
''')

# Update app/globals.css
os.makedirs("app", exist_ok=True)
with open("app/globals.css", "w", encoding="utf-8") as f:
    f.write('''@tailwind base;
@tailwind components;
@tailwind utilities;
''')

print("Tailwind configuration files created successfully!")