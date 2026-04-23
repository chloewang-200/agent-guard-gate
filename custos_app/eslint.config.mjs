import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["node_modules/**", ".next/**", "next-env.d.ts", "dist/**"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
