/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryBg: "var(--primary-bg-color)",
        secondaryBg: "var(--secondary-bg-color)",
        tertiaryBg: "var(--tertiary-bg-color)",
        lightDrawerBg: "var(--lightDrawerBg)",
        primaryBtn: "var(--primary-btn-color)",
        secondaryBtn: "var(--secondary-btn-color)",
        greenBtn: "var(--tertiary-btn-color)",
        redBtn: "var(--quaternary-btn-color)",
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        tertiary: "var(--tertiary-color)",
        quaternary: "var(--quaternary-color)",
        fifth: "var(--fifth-color)",
        disabledBottom: "var(--disabled-bottom)",
        profit: "var(--profit-color)",
        loss: "var(--loss-color)",
        icon: "var(--icon-color)",
        btnCommon: "var(--btn-common)",
      },
      fontFamily: {
        primary: "var(--primary-font-family)",
      },
      fontSize: {
        base: "var(--primary-font-size)",
        lg: "var(--secondary-font-size)",
        xl: "var(--tertiary-font-size)",
        xxl: "var(--xl-font-size)",
        sm: "var(--sm-font-size)",
        xs: "var(--xs-font-size)",
      },
      fontWeight: {
        primary: "var(--primary-font-weight)",
        secondary: "var(--secondary-font-weight)",
        tertiary: "var(--tertiary-font-weight)",
        // normal
        // semibold
      },
      borderColor: {
        primary: "var(--primary-border-color)",
        secondary: "var(--secondary-border-color)",
        tertiary: "var(--tertiary-border-color)",
      },
      borderRadius: {
        10: "var(--primary-border-radius)",
        20: "var(--secondary-border-radius)",
        40: "var(--tertiary-border-radius)",
      },
      backgroundImage: {
        "profit-balance": "var(--primary-card-bg)",
        "position-list": "var(--secondary-card-bg)",
      },
      placeholderColor: {
        placeholder: "var(--placeholder)",
      },
    },
  },
  plugins: [require("daisyui")],
};
