import { StyleSheet, Font } from '@react-pdf/renderer'
import path from 'path'

// Registro de fuentes
const fontsDir = path.join(process.cwd(), 'public/fonts')

Font.register({
  family: 'Neue Haas Display',
  fonts: [
    { src: path.join(fontsDir, 'NeueHaasDisplayThin.ttf'), fontWeight: 100 },
    { src: path.join(fontsDir, 'NeueHaasDisplayLight.ttf'), fontWeight: 300 },
    { src: path.join(fontsDir, 'NeueHaasDisplayRoman.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'NeueHaasDisplayMediu.ttf'), fontWeight: 500 }, // Note the filename typo in public/fonts
    { src: path.join(fontsDir, 'NeueHaasDisplayBold.ttf'), fontWeight: 700 },
    { src: path.join(fontsDir, 'NeueHaasDisplayBlack.ttf'), fontWeight: 900 },
  ],
})

export const colors = {
  bg: '#121212',
  text: '#ffffff',
  accent: '#eef151',
  secondary: '#d4ff00',
  muted: 'rgba(255, 255, 255, 0.4)',
  white: '#ffffff',
  cardBg: 'rgba(255, 255, 255, 0.05)',
}

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.bg,
    fontFamily: 'Neue Haas Display',
    color: colors.text,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 400,
    color: colors.muted,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.accent,
    borderBottom: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 4,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.85)',
    hyphens: 'none',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    padding: 15,
    backgroundColor: colors.cardBg,
    borderRadius: 2,
    borderLeft: 2,
    borderLeftColor: colors.accent,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: 'center',
    color: colors.muted,
    borderTop: 0.5,
    borderTopColor: colors.muted,
    paddingTop: 10,
  },
})
