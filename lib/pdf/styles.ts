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
  bg: '#ffffff',
  text: '#5c4a33',
  accent: '#d4ff00',
  secondary: '#eef151',
  muted: '#a8a29e',
  white: '#ffffff',
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
    fontSize: 18,
    fontWeight: 700,
    backgroundColor: colors.accent,
    padding: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderLeft: 4,
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
