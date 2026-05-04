import gallery1 from '../assets/photos/gallery-1.jpg'
import gallery2 from '../assets/photos/gallery-2.jpg'
import gallery3 from '../assets/photos/gallery-3.jpg'
import gallery4 from '../assets/photos/gallery-4.jpg'
import gallery5 from '../assets/photos/gallery-5.jpg'
import gallery6 from '../assets/photos/gallery-6.jpg'
import jarupiaImg from '../assets/photos/jarupia-real.webp'

// Jarupia specific images
import jarupia1 from '../assets/photos/jarupia/image-1.webp'
import jarupia2 from '../assets/photos/jarupia/image-2.webp'
import jarupia3 from '../assets/photos/jarupia/image-3.webp'
import jarupia4 from '../assets/photos/jarupia/image-4.webp'
import jarupia5 from '../assets/photos/jarupia/image-5.webp'

export const products = [
    {
        id: 1,
        title: "Basecamp at Dusk Below Meru",
        price: "$150.000",
        category: "Favoritos",
        location: "Garwhal Himalaya, India, 2011",
        image: gallery1,
        description: "Impresión de alta calidad en papel fotográfico mate."
    },
    {
        id: 2,
        title: "Mount Waddington Sunrise",
        price: "$180.000",
        category: "Paisaje",
        location: "BC, Canada, 2018",
        image: gallery2,
        description: "Una vista majestuosa capturada en el momento perfecto."
    },
    {
        id: 3,
        title: "James Pearson Climbing the First ascent of the Arch of Bishekele",
        price: "$160.000",
        category: "Aventura",
        location: "Ennedi Desert, Chad, Africa, 2010",
        image: gallery3,
        description: "La escala humana frente a la inmensidad del desierto."
    },
    {
        id: 4,
        title: "Greenland Expedition",
        price: "$200.000",
        category: "Aventura",
        location: "Greenland, 2019",
        image: gallery4,
        description: "Exploración en los glaciares de Groenlandia."
    },
    {
        id: 5,
        title: "Everest Camp IV",
        price: "$250.000",
        category: "Favoritos",
        location: "Mount Everest, Nepal, 2012",
        image: gallery5,
        description: "La última parada antes de la cima. Una perspectiva única del Everest."
    },
    {
        id: 6,
        title: "Tetons Reflection",
        price: "$140.000",
        category: "Paisaje",
        location: "Wyoming, USA, 2015",
        image: gallery6,
        description: "El reflejo perfecto de las montañas en el lago."
    },
    {
        id: 7,
        title: "Jarupia - El libro de la Ciénaga",
        price: "$150.000",
        category: "Libros",
        location: "Ayapel, Córdoba",
        image: jarupiaImg,
        images: [jarupiaImg, jarupia1, jarupia2, jarupia3, jarupia4, jarupia5],
        description: "Un libro que mezcla la fantasía con la realidad en la Ciénaga de Ayapel. Incluye una colección de 5 fotografías/postales originales."
    }
]

export const categories = ["Todos", "Favoritos", "Aventura", "Paisaje", "Libros"]
