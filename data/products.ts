export interface Product {
  id: number
  title: string
  price: string
  category: string
  location: string
  image: string
  images?: string[]
  description: string
}

export const products: Product[] = [
  { id: 1, title: 'Basecamp at Dusk Below Meru', price: '$150.000', category: 'Favoritos', location: 'Garwhal Himalaya, India, 2011', image: '/assets/photos/gallery-1.jpg', description: 'Impresión de alta calidad en papel fotográfico mate.' },
  { id: 2, title: 'Mount Waddington Sunrise', price: '$180.000', category: 'Paisaje', location: 'BC, Canada, 2018', image: '/assets/photos/gallery-2.jpg', description: 'Una vista majestuosa capturada en el momento perfecto.' },
  { id: 3, title: 'James Pearson Climbing the First ascent of the Arch of Bishekele', price: '$160.000', category: 'Aventura', location: 'Ennedi Desert, Chad, Africa, 2010', image: '/assets/photos/gallery-3.jpg', description: 'La escala humana frente a la inmensidad del desierto.' },
  { id: 4, title: 'Greenland Expedition', price: '$200.000', category: 'Aventura', location: 'Greenland, 2019', image: '/assets/photos/gallery-4.jpg', description: 'Exploración en los glaciares de Groenlandia.' },
  { id: 5, title: 'Everest Camp IV', price: '$250.000', category: 'Favoritos', location: 'Mount Everest, Nepal, 2012', image: '/assets/photos/gallery-5.jpg', description: 'La última parada antes de la cima. Una perspectiva única del Everest.' },
  { id: 6, title: 'Tetons Reflection', price: '$140.000', category: 'Paisaje', location: 'Wyoming, USA, 2015', image: '/assets/photos/gallery-6.jpg', description: 'El reflejo perfecto de las montañas en el lago.' },
  {
    id: 7,
    title: 'Jarupia - El libro de la Ciénaga',
    price: '$150.000',
    category: 'Libros',
    location: 'Ayapel, Córdoba',
    image: '/assets/photos/jarupia-real.webp',
    images: [
      '/assets/photos/jarupia-real.webp',
      '/assets/photos/jarupia/image-1.webp',
      '/assets/photos/jarupia/image-2.webp',
      '/assets/photos/jarupia/image-3.webp',
      '/assets/photos/jarupia/image-4.webp',
      '/assets/photos/jarupia/image-5.webp',
    ],
    description: 'Un libro que mezcla la fantasía con la realidad en la Ciénaga de Ayapel.',
  },
]

export const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))]
