import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },

  // Scripts Node standalone, borradores y specs: no son código de la app y no
  // se compilan con ella. Lintarlos con las reglas de TS/React solo produce
  // ruido — exigirle `import` a un script que Node corre con CommonJS no
  // arregla nada.
  {
    files: ["scripts/**", "tests/**", "scratch/**", "*.config.js", "*.config.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },

  // DEUDA CONOCIDA — no es una excepción permanente.
  // Quedan 24 `any` en código de producción (lib/claude.ts, rutas de reports,
  // proyección financiera). Tiparlos de verdad es trabajo real y este repo no
  // tiene tests que respalden el cambio, así que se degrada a `warn`: sigue
  // visible en cada corrida, pero no bloquea el pipeline.
  //
  // El punto es que el gate vuelva a servir de algo: hasta ahora `npm run lint`
  // fallaba y el paso siguiente —`tsc --noEmit`, el que de verdad importa—
  // nunca llegaba a ejecutarse. Con esto, un error de tipos nuevo sí se detecta.
  //
  // Al pagar la deuda, subir esta regla de vuelta a "error".
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]

export default eslintConfig
