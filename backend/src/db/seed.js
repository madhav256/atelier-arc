// Seed reproduces the live Atelier Arc catalogue (141 works across 9 genres,
// 15 artists, 8 collections, 10 journal articles) so a fresh database matches production.
// Generated from the live export of 25 September 2026. Never run against production
// without ALLOW_PRODUCTION_SEED=true; it wipes every collection first.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {env} from '../config/env.js';
import {Artist,Artwork,Collection,Article,User,Order,Inquiry,Cart,UserCollection,Notification,InventoryHold,AvailabilityAlert,PaymentEvent,Counter} from '../models/index.js';

const ARTISTS = [
 {
  "name": "Aarav Sen",
  "slug": "aarav-sen",
  "portrait": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "biography": "Aarav Sen works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Mumbai",
  "movement": "Contemporary abstraction",
  "timeline": [
   {
    "year": 2014,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": true,
  "published": true,
  "available": 4
 },
 {
  "name": "Leela Iyer",
  "slug": "leela-iyer",
  "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "biography": "Leela Iyer works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "New Delhi",
  "movement": "New materialism",
  "timeline": [
   {
    "year": 2015,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": true,
  "published": true,
  "available": 8
 },
 {
  "name": "Mira Khanna",
  "slug": "mira-khanna",
  "portrait": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "biography": "Mira Khanna works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Bengaluru",
  "movement": "Contemporary abstraction",
  "timeline": [
   {
    "year": 2017,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": true,
  "published": true,
  "available": 7
 },
 {
  "name": "Nikhil Bose",
  "slug": "nikhil-bose",
  "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "biography": "Nikhil Bose works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Kochi",
  "movement": "Figurative modernism",
  "timeline": [
   {
    "year": 2016,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": true,
  "published": true,
  "available": 9
 },
 {
  "name": "Arjun Vadehra",
  "slug": "arjun-vadehra",
  "portrait": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "biography": "Arjun Vadehra works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "New Delhi",
  "movement": "Contemporary abstraction",
  "timeline": [
   {
    "year": 2018,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Avni Rao",
  "slug": "avni-rao",
  "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "biography": "Avni Rao works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Kochi",
  "movement": "Figurative modernism",
  "timeline": [
   {
    "year": 2018,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 7
 },
 {
  "name": "Dev Mehra",
  "slug": "dev-mehra",
  "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "biography": "Dev Mehra works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Bengaluru",
  "movement": "New materialism",
  "timeline": [
   {
    "year": 2016,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 7
 },
 {
  "name": "Ishani Roy",
  "slug": "ishani-roy",
  "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "biography": "Ishani Roy works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Mumbai",
  "movement": "Figurative modernism",
  "timeline": [
   {
    "year": 2017,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Kabir Anand",
  "slug": "kabir-anand",
  "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "biography": "Kabir Anand works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "New Delhi",
  "movement": "Figurative modernism",
  "timeline": [
   {
    "year": 2014,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Maya Pillai",
  "slug": "maya-pillai",
  "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "biography": "Maya Pillai works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Kochi",
  "movement": "New materialism",
  "timeline": [
   {
    "year": 2014,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Neel Kapoor",
  "slug": "neel-kapoor",
  "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "biography": "Neel Kapoor works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Bengaluru",
  "movement": "Figurative modernism",
  "timeline": [
   {
    "year": 2015,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 7
 },
 {
  "name": "Reva Das",
  "slug": "reva-das",
  "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "biography": "Reva Das works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Mumbai",
  "movement": "New materialism",
  "timeline": [
   {
    "year": 2018,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 9
 },
 {
  "name": "Rohan Lal",
  "slug": "rohan-lal",
  "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "biography": "Rohan Lal works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "New Delhi",
  "movement": "New materialism",
  "timeline": [
   {
    "year": 2017,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Tara Menon",
  "slug": "tara-menon",
  "portrait": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "biography": "Tara Menon works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Kochi",
  "movement": "Contemporary abstraction",
  "timeline": [
   {
    "year": 2015,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 },
 {
  "name": "Zoya Merchant",
  "slug": "zoya-merchant",
  "portrait": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "biography": "Zoya Merchant works across material, memory, and contemporary life. Their measured practice has been shown in independent spaces and private collections across South Asia.",
  "nationality": "Indian",
  "location": "Mumbai",
  "movement": "Contemporary abstraction",
  "timeline": [
   {
    "year": 2016,
    "title": "First institutional exhibition",
    "description": "A formative presentation of new work."
   },
   {
    "year": 2021,
    "title": "Major survey",
    "description": "A career-spanning exhibition."
   }
  ],
  "exhibitions": [],
  "awards": [
   "Arc Studio Fellowship"
  ],
  "featured": false,
  "published": true,
  "available": 8
 }
];
const COLLECTIONS = [
 {
  "name": "Contemporary Masters",
  "slug": "contemporary-masters",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-02.jpg",
  "order": 0,
  "published": true
 },
 {
  "name": "Emerging Artists",
  "slug": "emerging-artists",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-05.jpg",
  "order": 1,
  "published": true
 },
 {
  "name": "Sculptural Works",
  "slug": "sculptural-works",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-08.jpg",
  "order": 2,
  "published": true
 },
 {
  "name": "Works on Paper",
  "slug": "works-on-paper",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-11.jpg",
  "order": 3,
  "published": true
 },
 {
  "name": "Indian Modernism",
  "slug": "indian-modernism",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-14.jpg",
  "order": 4,
  "published": true
 },
 {
  "name": "Abstract Expressionism",
  "slug": "abstract-expressionism",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-17.jpg",
  "order": 5,
  "published": true
 },
 {
  "name": "Limited Editions",
  "slug": "limited-editions",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-20.jpg",
  "order": 6,
  "published": true
 },
 {
  "name": "New Acquisitions",
  "slug": "new-acquisitions",
  "description": "A measured dialogue between material, gesture, and contemporary life.",
  "coverImage": "/art/work-23.jpg",
  "order": 7,
  "published": true
 }
];
const ARTWORKS = [
 {
  "title": "Monsoon Letter",
  "slug": "monsoon-letter",
  "category": "Works on Paper",
  "medium": "Ink and wash on rice paper",
  "dimensions": {
   "width": 42,
   "height": 60,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 44000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Monsoon rain in long streaks of diluted indigo on rice paper, a single terracotta seal. Iyer's ink works are made in one sitting, before the paper dries.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-41.jpg",
    "alt": "Monsoon Letter by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "drawing",
   "paper",
   "study"
  ],
  "style": [
   "ink-wash",
   "monsoon"
  ],
  "colors": [
   "indigo",
   "grey",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Study for a Quiet Room",
  "slug": "study-for-a-quiet-room",
  "category": "Works on Paper",
  "medium": "Pigment and graphite on handmade paper",
  "dimensions": {
   "width": 38,
   "height": 56,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 52000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A study of an empty room with one window of soft light, pigment and graphite layered until the paper itself seems lit. Anand's drawings are rehearsals for silence.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-40.jpg",
    "alt": "Study for a Quiet Room by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "drawing",
   "paper",
   "study"
  ],
  "style": [
   "interior",
   "graphite"
  ],
  "colors": [
   "grey",
   "paper",
   "graphite"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Half-Moon Bazaar",
  "slug": "half-moon-bazaar",
  "category": "Prints",
  "medium": "Screenprint in four colours",
  "dimensions": {
   "width": 50,
   "height": 70,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 25",
  "stock": 20,
  "price": 36000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Overlapping bazaar awnings under a half moon, four flat inks slightly off register. Bose's screenprints keep the evidence of the hand that pulled the squeegee.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-39.jpg",
    "alt": "Half-Moon Bazaar by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "print",
   "edition",
   "works on paper"
  ],
  "style": [
   "screenprint",
   "graphic"
  ],
  "colors": [
   "indigo",
   "terracotta",
   "ochre"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Temple Court",
  "slug": "temple-court",
  "category": "Prints",
  "medium": "Woodcut on handmade paper",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2020,
  "edition": "Edition of 15",
  "stock": 11,
  "price": 48000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A temple courtyard cut in bold black lines on handmade paper, one terracotta accent. Kapoor's woodcuts are printed in small editions on a hand press.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-38.jpg",
    "alt": "Temple Court by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "print",
   "edition",
   "works on paper"
  ],
  "style": [
   "woodcut",
   "graphic"
  ],
  "colors": [
   "black",
   "cream",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Border Ballad",
  "slug": "border-ballad",
  "category": "Textiles",
  "medium": "Block-printed, hand-embroidered khadi",
  "dimensions": {
   "width": 100,
   "height": 140,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 135000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Block-printed khadi with a hand-embroidered running-stitch border. Rao prints each length herself, the small irregularities left in as signature.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-37.jpg",
    "alt": "Border Ballad by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "textile",
   "woven",
   "fibre"
  ],
  "style": [
   "block-print",
   "textile"
  ],
  "colors": [
   "terracotta",
   "indigo",
   "khadi"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Loom Song",
  "slug": "loom-song",
  "category": "Textiles",
  "medium": "Wool and silk tapestry",
  "dimensions": {
   "width": 110,
   "height": 150,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 185000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A wool and silk tapestry in horizontal bands - ochre, umber, terracotta, indigo - woven as a landscape remembered rather than seen. Sen's loom work is slow and deliberate.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-36.jpg",
    "alt": "Loom Song by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "textile",
   "woven",
   "fibre"
  ],
  "style": [
   "tapestry",
   "abstract"
  ],
  "colors": [
   "ochre",
   "umber",
   "indigo"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "River Weave",
  "slug": "river-weave",
  "category": "Textiles",
  "medium": "Handwoven cotton, natural indigo",
  "dimensions": {
   "width": 120,
   "height": 180,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 210000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Handwoven cotton dyed in successive baths of natural indigo, the colour thinning as the river widens. Das weaves on a pit loom over six weeks.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-35.jpg",
    "alt": "River Weave by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "textile",
   "woven",
   "fibre"
  ],
  "style": [
   "indigo",
   "woven"
  ],
  "colors": [
   "indigo",
   "cream"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Ash and Ochre",
  "slug": "ash-and-ochre",
  "category": "Ceramics",
  "medium": "Soda-glazed porcelain",
  "dimensions": {
   "width": 22,
   "height": 30,
   "depth": 22,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 46500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Soda-glazed porcelain with a soft grey-pink blush. Khanna's jars are quiet until you notice the orange-peel texture catching the light.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-34.jpg",
    "alt": "Ash and Ochre by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "ceramics",
   "vessel",
   "studio pottery"
  ],
  "style": [
   "porcelain",
   "minimal"
  ],
  "colors": [
   "blush",
   "grey",
   "porcelain"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "River Clay Suite",
  "slug": "river-clay-suite",
  "category": "Ceramics",
  "medium": "Glazed stoneware, set of three",
  "dimensions": {
   "width": 18,
   "height": 28,
   "depth": 18,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 92000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Three vessels in ochre, celadon and iron-brown, thrown from the same river clay and glazed in one firing. Mehra thinks of them as a single sentence.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-33.jpg",
    "alt": "River Clay Suite by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "ceramics",
   "vessel",
   "studio pottery"
  ],
  "style": [
   "vessel",
   "glazed"
  ],
  "colors": [
   "ochre",
   "celadon",
   "iron"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Ember Jar",
  "slug": "ember-jar",
  "category": "Ceramics",
  "medium": "Wood-fired stoneware",
  "dimensions": {
   "width": 26,
   "height": 34,
   "depth": 26,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 58000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A wood-fired stoneware jar, ash-glazed where the flame chose to land. Lal fires in a single chamber kiln and accepts what the kiln keeps.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-32.jpg",
    "alt": "Ember Jar by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "ceramics",
   "vessel",
   "studio pottery"
  ],
  "style": [
   "wabi-sabi",
   "wood-fired"
  ],
  "colors": [
   "ash",
   "ochre",
   "brown"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Night Bus, Nashik Road",
  "slug": "night-bus-nashik-road",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 75,
   "height": 50,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 12",
  "stock": 9,
  "price": 64000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Rain on a bus window outside Nashik Road, the street's amber lights smeared into long strokes. Roy prints small editions and supervises every sheet.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-31.jpg",
    "alt": "Night Bus, Nashik Road by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "photography",
   "light",
   "edition"
  ],
  "style": [
   "nocturne",
   "documentary"
  ],
  "colors": [
   "indigo",
   "amber",
   "black"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Salt Pans, First Light",
  "slug": "salt-pans-first-light",
  "category": "Photography",
  "medium": "Silver gelatin print",
  "dimensions": {
   "width": 90,
   "height": 60,
   "unit": "cm"
  },
  "year": 2019,
  "edition": "Edition of 8",
  "stock": 4,
  "price": 115000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The salt pans at first light, partitioned into pale geometry. Menon's silver gelatin print keeps the grain of the negative - the hours of standing still are in it.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-30.jpg",
    "alt": "Salt Pans, First Light by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "photography",
   "light",
   "edition"
  ],
  "style": [
   "minimal",
   "landscape"
  ],
  "colors": [
   "white",
   "blush",
   "pale blue"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Colonnade, Four O'Clock",
  "slug": "colonnade-four-oclock",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 102,
   "height": 76,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 10 + 2 AP",
  "stock": 6,
  "price": 86000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Late light through a stone colonnade, held exactly at the hour the shadows lengthen into columns of their own. Merchant prints it on museum-grade stock in a small edition.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-29.jpg",
    "alt": "Colonnade, Four O'Clock by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "photography",
   "light",
   "edition"
  ],
  "style": [
   "architectural",
   "atmospheric"
  ],
  "colors": [
   "amber",
   "stone",
   "ochre"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Folded Light",
  "slug": "folded-light",
  "category": "Sculptures",
  "medium": "Polished steel and river stone",
  "dimensions": {
   "width": 40,
   "height": 48,
   "depth": 34,
   "unit": "cm"
  },
  "year": 2024,
  "edition": "Edition of 3",
  "stock": 3,
  "price": 560000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A ribbon of polished steel folded against rough river stone. Vadehra pairs the made and the found until the eye can no longer rank them.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-28.jpg",
    "alt": "Folded Light by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "sculpture",
   "contemporary",
   "form"
  ],
  "style": [
   "minimal",
   "industrial"
  ],
  "colors": [
   "steel",
   "grey",
   "stone"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Vessel of Silence",
  "slug": "vessel-of-silence",
  "category": "Sculptures",
  "medium": "Carved teak and brass",
  "dimensions": {
   "width": 28,
   "height": 64,
   "depth": 24,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 340000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Carved from a single block of teak and bound with a thin brass band, this closed vessel form is Pillai's meditation on containment - what a room holds, and what it refuses.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-27.jpg",
    "alt": "Vessel of Silence by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "sculpture",
   "contemporary",
   "form"
  ],
  "style": [
   "organic",
   "minimal"
  ],
  "colors": [
   "teak",
   "brass",
   "brown"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Monsoon Sentinel",
  "slug": "monsoon-sentinel",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 38,
   "height": 92,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 785000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A sentinel figure in cast bronze, its dark patina holding the memory of the pour. Mehra works the surface until it stops being metal and starts being weather.",
  "provenance": [
   "The artist's studio."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-26.jpg",
    "alt": "Monsoon Sentinel by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "sculpture",
   "contemporary",
   "form"
  ],
  "style": [
   "figurative",
   "monolithic"
  ],
  "colors": [
   "bronze",
   "umber",
   "black"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Glass Harbour",
  "slug": "glass-harbour",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 100,
   "height": 80,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 12 + 2 AP",
  "stock": 4,
  "price": 56000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Merchant's blues are built in glazes, each layer deepening the last. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-25.jpg",
    "alt": "Glass Harbour by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "coastal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "blue",
   "silver",
   "mist"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "The Eleventh Tide",
  "slug": "the-eleventh-tide",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 80,
   "height": 100,
   "unit": "cm"
  },
  "year": 2020,
  "edition": "Edition of 11 + 2 AP",
  "stock": 3,
  "price": 525000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The composition hovers between reflection and dissolution. Produced as a digital pigment print in a small edition.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2020."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-24.jpg",
    "alt": "The Eleventh Tide by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "coastal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "blue",
   "silver",
   "mist"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Night Swimming",
  "slug": "night-swimming",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 120,
   "height": 90,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 125000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Merchant paints the sea's edge as a field of shifting, liquid colour. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-23.jpg",
    "alt": "Night Swimming by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "coastal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "blue",
   "silver",
   "mist"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Marine Drive, Dissolved",
  "slug": "marine-drive-dissolved",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 75,
   "height": 50,
   "unit": "cm"
  },
  "year": 2026,
  "edition": "Edition of 9 + 2 AP",
  "stock": 4,
  "price": 555000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Merchant's blues are built in glazes, each layer deepening the last. Supplied unframed; framing available on request.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-22.jpg",
    "alt": "Marine Drive, Dissolved by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "coastal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "blue",
   "silver",
   "mist"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Chlorine Blue",
  "slug": "chlorine-blue",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 1050000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The composition hovers between reflection and dissolution. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2025."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-21.jpg",
    "alt": "Chlorine Blue by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "coastal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "blue",
   "silver",
   "mist"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Rain Chorus",
  "slug": "rain-chorus",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 120,
   "height": 84,
   "unit": "cm"
  },
  "year": 2024,
  "edition": "Edition of 12 + 2 AP",
  "stock": 2,
  "price": 58500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Menon distills the backwaters to colour and interval. Supplied with a signed certificate of edition.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-20.jpg",
    "alt": "Rain Chorus by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "chromatic",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "green",
   "aqua",
   "jade"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Canopy Study",
  "slug": "canopy-study",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 76,
   "height": 56,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 1125000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Menon's gradients are slow and deliberate, closer to weather than to gesture. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2023."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-19.jpg",
    "alt": "Canopy Study by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "chromatic",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "green",
   "aqua",
   "jade"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Salt Gradient",
  "slug": "salt-gradient",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 60,
   "height": 90,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 10 + 2 AP",
  "stock": 3,
  "price": 62000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A chromatic study, tuned until the whole surface hums. From a small edition, printed under the artist's supervision.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-18.jpg",
    "alt": "Salt Gradient by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "chromatic",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "green",
   "aqua",
   "jade"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "The Green Hour",
  "slug": "the-green-hour",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 110,
   "height": 150,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 1185000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Menon distills the backwaters to colour and interval. The linen surface is worked and reworked until it settles.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-17.jpg",
    "alt": "The Green Hour by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "chromatic",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "green",
   "aqua",
   "jade"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Backwater Chromatics",
  "slug": "backwater-chromatics",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 150,
   "height": 110,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 28500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Menon's gradients are slow and deliberate, closer to weather than to gesture. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2020."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-16.jpg",
    "alt": "Backwater Chromatics by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "chromatic",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "green",
   "aqua",
   "jade"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Furnace Garden",
  "slug": "furnace-garden",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 60,
   "height": 60,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 64500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Heavy material, handled lightly; the work balances mass and grace. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-15.jpg",
    "alt": "Furnace Garden by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "industrial",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "iron",
   "ember",
   "charcoal"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Shard Atlas",
  "slug": "shard-atlas",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 26,
   "height": 45,
   "depth": 22,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 1250000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Lal works close to the furnace, drawn to metal at the moment it changes state. Hand-built and finished in a glazed stoneware body.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2026."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-14.jpg",
    "alt": "Shard Atlas by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "industrial",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "iron",
   "ember",
   "charcoal"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "The Kiln Keeper",
  "slug": "the-kiln-keeper",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 34,
   "height": 28,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 585000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Lal's objects feel excavated rather than made, as if recovered from a kiln site. The glazed stoneware body carries the marks of its making.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-13.jpg",
    "alt": "The Kiln Keeper by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "industrial",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "iron",
   "ember",
   "charcoal"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Iron Meadow",
  "slug": "iron-meadow",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 30,
   "height": 90,
   "depth": 25,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 32000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Heavy material, handled lightly; the work balances mass and grace. Each cast is finished by hand at the foundry.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-12.jpg",
    "alt": "Iron Meadow by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "industrial",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "iron",
   "ember",
   "charcoal"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Foundry Light",
  "slug": "foundry-light",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 45,
   "height": 60,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 68000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Lal works close to the furnace, drawn to metal at the moment it changes state. Each cast is finished by hand at the foundry.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2023."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-11.jpg",
    "alt": "Foundry Light by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "industrial",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "iron",
   "ember",
   "charcoal"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Patchwork Monsoon",
  "slug": "patchwork-monsoon",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 84,
   "height": 110,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 71500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Das treats salvage as a palette, each fragment carrying its former life. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-10.jpg",
    "alt": "Patchwork Monsoon by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "indigo",
   "madder",
   "pewter"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "The Dye Vat",
  "slug": "the-dye-vat",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 26,
   "height": 45,
   "depth": 22,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 145000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The surface is patched, dyed and mended, and wears its repairs proudly. Fired in the artist's own kiln; each piece unique.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2021."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-09.jpg",
    "alt": "The Dye Vat by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "indigo",
   "madder",
   "pewter"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Bazaar Reliquary",
  "slug": "bazaar-reliquary",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 60,
   "height": 90,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 165000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Das composes with what the bazaar discards, finding ornament in the utilitarian. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-08.jpg",
    "alt": "Bazaar Reliquary by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "indigo",
   "madder",
   "pewter"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Tin Roof Elegy",
  "slug": "tin-roof-elegy",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 120,
   "height": 90,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 1325000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Das treats salvage as a palette, each fragment carrying its former life. Built up in pigment and graphite.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-07.jpg",
    "alt": "Tin Roof Elegy by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "indigo",
   "madder",
   "pewter"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Salvage Bloom",
  "slug": "salvage-bloom",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 150,
   "height": 110,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 74500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The surface is patched, dyed and mended, and wears its repairs proudly. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2026."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-06.jpg",
    "alt": "Salvage Bloom by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "indigo",
   "madder",
   "pewter"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Monsoon Veranda",
  "slug": "monsoon-veranda",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 36500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Kapoor paints the city's gentry at ease, with gentle irony and real affection. Worked on handmade paper; the sheet is floated on archival board.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-05.jpg",
    "alt": "Monsoon Veranda by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "social",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "green",
   "ivory",
   "umber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "The Typewriter Repair",
  "slug": "the-typewriter-repair",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 84,
   "height": 110,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 39000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Kapoor's canvases are crowded with character and perfectly judged. Pigment and graphite on a prepared support; supplied flat.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2024."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-04.jpg",
    "alt": "The Typewriter Repair by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "social",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "green",
   "ivory",
   "umber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Aunts at a Wedding",
  "slug": "aunts-at-a-wedding",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 42,
   "height": 60,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 10 + 2 AP",
  "stock": 3,
  "price": 625000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A social scene rendered with a novelist's eye for detail. Supplied unframed; framing available on request.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-03.jpg",
    "alt": "Aunts at a Wedding by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "social",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "green",
   "ivory",
   "umber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Cubbon Park Readers",
  "slug": "cubbon-park-readers",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 185000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Kapoor paints the city's gentry at ease, with gentle irony and real affection. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-02.jpg",
    "alt": "Cubbon Park Readers by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "social",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "green",
   "ivory",
   "umber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "The Barrister's Lunch",
  "slug": "the-barristers-lunch",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 1395000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Kapoor's canvases are crowded with character and perfectly judged. The linen surface is worked and reworked until it settles.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2021."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-01.jpg",
    "alt": "The Barrister's Lunch by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "social",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "green",
   "ivory",
   "umber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Tide Archive",
  "slug": "tide-archive",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 38,
   "height": 56,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 41500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The making is slow and tidal; the object arrives as if washed ashore. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-25.jpg",
    "alt": "Tide Archive by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "coastal",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "salt",
   "sand",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Laterite Psalm",
  "slug": "laterite-psalm",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 45,
   "height": 60,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 665000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Pillai works with the coast's own materials: salt, fibre and weathered stone. The bronze form is stable, balanced and suited to indoor display.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2019."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-24.jpg",
    "alt": "Laterite Psalm by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "coastal",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "salt",
   "sand",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "The Mending Net",
  "slug": "the-mending-net",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 84,
   "height": 110,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 44000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Pillai lets the material dictate the form, editing only where necessary. Built up in pigment and graphite.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-23.jpg",
    "alt": "The Mending Net by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "coastal",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "salt",
   "sand",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Estuary Relic",
  "slug": "estuary-relic",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 22,
   "height": 40,
   "depth": 20,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 210000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The making is slow and tidal; the object arrives as if washed ashore. Hand-built and finished in a glazed stoneware body.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-22.jpg",
    "alt": "Estuary Relic by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "coastal",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "salt",
   "sand",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Coir and Salt",
  "slug": "coir-and-salt",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 38,
   "height": 120,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 1475000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Pillai works with the coast's own materials: salt, fibre and weathered stone. Cast in bronze with a hand-finished patina.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2024."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-21.jpg",
    "alt": "Coir and Salt by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "coastal",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "salt",
   "sand",
   "terracotta"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "The Poet's Pause",
  "slug": "the-poets-pause",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 76,
   "height": 56,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 695000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Anand's figures carry whole histories in a posture or a pause. The handmade sheet carries the medium beautifully; supplied with a mount.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-20.jpg",
    "alt": "The Poet's Pause by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "domestic",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "maroon",
   "cream",
   "walnut"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Grandfather's Radio",
  "slug": "grandfathers-radio",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 78000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The scene is domestic, the treatment monumental. Pigment and graphite on a prepared support; supplied flat.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2022."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-19.jpg",
    "alt": "Grandfather's Radio by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "domestic",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "maroon",
   "cream",
   "walnut"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Winter Wedding, Nizamuddin",
  "slug": "winter-wedding-nizamuddin",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 10 + 2 AP",
  "stock": 2,
  "price": 725000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Anand paints Delhi's interior lives with the patience of a portraitist. Supplied unframed; framing available on request.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-18.jpg",
    "alt": "Winter Wedding, Nizamuddin by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "domestic",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "maroon",
   "cream",
   "walnut"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "The Chess Lesson",
  "slug": "the-chess-lesson",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 1550000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Anand's figures carry whole histories in a posture or a pause. The linen surface is worked and reworked until it settles.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-17.jpg",
    "alt": "The Chess Lesson by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "domestic",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "maroon",
   "cream",
   "walnut"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Old Delhi Postman",
  "slug": "old-delhi-postman",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 46000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The scene is domestic, the treatment monumental. The linen surface is worked and reworked until it settles.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2019."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-16.jpg",
    "alt": "Old Delhi Postman by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "domestic",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "maroon",
   "cream",
   "walnut"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Three Women, One Umbrella",
  "slug": "three-women-one-umbrella",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 28,
   "height": 38,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 1645000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Roy draws Mumbai's crowds down to the single, telling figure. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-15.jpg",
    "alt": "Three Women, One Umbrella by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "urban",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "grey",
   "rose",
   "turmeric"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Sea Face at Noon",
  "slug": "sea-face-at-noon",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 100,
   "height": 80,
   "unit": "cm"
  },
  "year": 2025,
  "edition": "Edition of 11 + 2 AP",
  "stock": 4,
  "price": 765000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Roy's city is intimate: small rooms, long glances, ordinary grace. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2025."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-14.jpg",
    "alt": "Sea Face at Noon by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "urban",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "grey",
   "rose",
   "turmeric"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Chawl Ballad",
  "slug": "chawl-ballad",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 1725000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A fleeting urban moment, held still and given weight. Built up in pigment and graphite.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-13.jpg",
    "alt": "Chawl Ballad by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "urban",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "grey",
   "rose",
   "turmeric"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "The Tailor's Daughter",
  "slug": "the-tailors-daughter",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 9 + 2 AP",
  "stock": 2,
  "price": 235000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Roy draws Mumbai's crowds down to the single, telling figure. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-12.jpg",
    "alt": "The Tailor's Daughter by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "urban",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "grey",
   "rose",
   "turmeric"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Local Train, 6:14",
  "slug": "local-train-6-14",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 150,
   "height": 110,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 260000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Roy's city is intimate: small rooms, long glances, ordinary grace. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2022."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-11.jpg",
    "alt": "Local Train, 6:14 by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "urban",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "grey",
   "rose",
   "turmeric"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Second Rain",
  "slug": "second-rain",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 30,
   "height": 30,
   "depth": 26,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 795000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The work holds its past lives visibly; nothing is hidden or polished away. The glazed stoneware body carries the marks of its making.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-10.jpg",
    "alt": "Second Rain by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "salvage",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "copper",
   "rust",
   "iron"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Wire and Worship",
  "slug": "wire-and-worship",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 38,
   "height": 120,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 82500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Mehra salvages his materials from the city's discard and returns them transformed. Each cast is finished by hand at the foundry.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2020."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-09.jpg",
    "alt": "Wire and Worship by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "salvage",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "copper",
   "rust",
   "iron"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Panel for a Dry Season",
  "slug": "panel-for-a-dry-season",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 120,
   "height": 90,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 86000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Mehra builds by accretion, layer upon layer of found and rescued matter. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-08.jpg",
    "alt": "Panel for a Dry Season by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "salvage",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "copper",
   "rust",
   "iron"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Rag Hymn",
  "slug": "rag-hymn",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 47500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The work holds its past lives visibly; nothing is hidden or polished away. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-07.jpg",
    "alt": "Rag Hymn by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "salvage",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "copper",
   "rust",
   "iron"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Copper Wound",
  "slug": "copper-wound",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 45,
   "height": 60,
   "depth": 30,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 835000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Mehra salvages his materials from the city's discard and returns them transformed. The bronze form is stable, balanced and suited to indoor display.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2025."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-06.jpg",
    "alt": "Copper Wound by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "salvage",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "copper",
   "rust",
   "iron"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Sunday Bath",
  "slug": "sunday-bath",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 48,
   "height": 64,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 89000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Rao paints daily ritual as something worth monumentalising. Worked on handmade paper; the sheet is floated on archival board.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-05.jpg",
    "alt": "Sunday Bath by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "narrative",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "marigold",
   "jade",
   "rose"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "The Jasmine Vendor",
  "slug": "the-jasmine-vendor",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 42,
   "height": 60,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 11 + 2 AP",
  "stock": 3,
  "price": 1850000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A genre scene elevated by close attention and an affectionate eye. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2023."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-04.jpg",
    "alt": "The Jasmine Vendor by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "narrative",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "marigold",
   "jade",
   "rose"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Boatyard Lullaby",
  "slug": "boatyard-lullaby",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 76,
   "height": 56,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 10 + 2 AP",
  "stock": 2,
  "price": 285000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Rao's women occupy the canvas with quiet authority, drawn from markets, boats and home. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-03.jpg",
    "alt": "Boatyard Lullaby by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "narrative",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "marigold",
   "jade",
   "rose"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Her Mother's Shawl",
  "slug": "her-mothers-shawl",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 110,
   "height": 150,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 315000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Rao paints daily ritual as something worth monumentalising. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-02.jpg",
    "alt": "Her Mother's Shawl by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "narrative",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "marigold",
   "jade",
   "rose"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Spice Sellers, Morning",
  "slug": "spice-sellers-morning",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 150,
   "height": 110,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 30500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A genre scene elevated by close attention and an affectionate eye. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2020."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-01.jpg",
    "alt": "Spice Sellers, Morning by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "narrative",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "marigold",
   "jade",
   "rose"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Dust Halo",
  "slug": "dust-halo",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 80,
   "height": 100,
   "unit": "cm"
  },
  "year": 2019,
  "edition": "Edition of 12 + 2 AP",
  "stock": 2,
  "price": 875000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Vadehra reduces the city to line, plane and a finely judged restraint. Supplied unframed; framing available on request.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-25.jpg",
    "alt": "Dust Halo by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "minimal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ash",
   "ochre",
   "graphite"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Night Grid",
  "slug": "night-grid",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 90,
   "height": 90,
   "unit": "cm"
  },
  "year": 2026,
  "edition": "Edition of 11 + 2 AP",
  "stock": 4,
  "price": 345000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Vadehra works at the edge of minimalism, where small decisions carry the whole. The edition is printed to archival standard.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2026."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-24.jpg",
    "alt": "Night Grid by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "minimal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ash",
   "ochre",
   "graphite"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "A Long Ochre Line",
  "slug": "a-long-ochre-line",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 56,
   "height": 38,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 92000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "An exercise in austerity: a few elements, held in exact relation. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-23.jpg",
    "alt": "A Long Ochre Line by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "minimal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ash",
   "ochre",
   "graphite"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Ash and Meridian",
  "slug": "ash-and-meridian",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 60,
   "height": 90,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 375000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Vadehra reduces the city to line, plane and a finely judged restraint. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-22.jpg",
    "alt": "Ash and Meridian by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "minimal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ash",
   "ochre",
   "graphite"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Winter Sun, Barakhamba",
  "slug": "winter-sun-barakhamba",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 915000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Vadehra works at the edge of minimalism, where small decisions carry the whole. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2023."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-21.jpg",
    "alt": "Winter Sun, Barakhamba by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "minimal",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ash",
   "ochre",
   "graphite"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "The Card Players",
  "slug": "the-card-players",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 70,
   "height": 50,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 12 + 2 AP",
  "stock": 3,
  "price": 395000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The figures hold the centre of the canvas, unhurried and entirely at ease. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-20.jpg",
    "alt": "The Card Players by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "coastal",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "vermilion",
   "ochre",
   "indigo"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Harbour Wedding",
  "slug": "harbour-wedding",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 11 + 2 AP",
  "stock": 2,
  "price": 1975000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Bose paints working lives with a formal tenderness usually reserved for portraits. Printed as an archival pigment print on museum-grade stock.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2021."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-19.jpg",
    "alt": "Harbour Wedding by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "coastal",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "vermilion",
   "ochre",
   "indigo"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Two Figures at Dusk",
  "slug": "two-figures-at-dusk",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 48,
   "height": 64,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 425000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Bose's Kerala is rendered in warm, deliberate colour, observed rather than staged. The handmade sheet carries the medium beautifully; supplied with a mount.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-18.jpg",
    "alt": "Two Figures at Dusk by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "coastal",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "vermilion",
   "ochre",
   "indigo"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Vermilion Afternoon",
  "slug": "vermilion-afternoon",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 110,
   "height": 150,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 35500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "The figures hold the centre of the canvas, unhurried and entirely at ease. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Kochi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-17.jpg",
    "alt": "Vermilion Afternoon by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "coastal",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "vermilion",
   "ochre",
   "indigo"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "The Net Menders",
  "slug": "the-net-menders",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 150,
   "height": 110,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 42500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Bose paints working lives with a formal tenderness usually reserved for portraits. Signed on the reverse; presented unframed.",
  "provenance": [
   "The artist's studio, Kochi.",
   "Acquired directly from the artist in 2026."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-16.jpg",
    "alt": "The Net Menders by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "figurative",
   "coastal",
   "contemporary"
  ],
  "style": [
   "painterly",
   "linear"
  ],
  "colors": [
   "vermilion",
   "ochre",
   "indigo"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Terrace Rain",
  "slug": "terrace-rain",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 100,
   "height": 80,
   "unit": "cm"
  },
  "year": 2025,
  "edition": "Edition of 12 + 2 AP",
  "stock": 4,
  "price": 450000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Khanna's surfaces are built in thin veils, each one altering the light beneath. From a small edition, printed under the artist's supervision.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-15.jpg",
    "alt": "Terrace Rain by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "atmospheric",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "teal",
   "moss",
   "amber"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "A Quiet Voltage",
  "slug": "a-quiet-voltage",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 80,
   "height": 100,
   "unit": "cm"
  },
  "year": 2024,
  "edition": "Edition of 11 + 2 AP",
  "stock": 0,
  "price": 945000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "Colour arrives in intervals here, measured like breath. The edition is printed to archival standard.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2024."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-14.jpg",
    "alt": "A Quiet Voltage by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "atmospheric",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "teal",
   "moss",
   "amber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Light, Suspended",
  "slug": "light-suspended",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 80,
   "height": 100,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 10 + 2 AP",
  "stock": 2,
  "price": 2150000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Khanna paints the weather of a place rather than the place itself. From a small edition, printed under the artist's supervision.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-13.jpg",
    "alt": "Light, Suspended by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "atmospheric",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "teal",
   "moss",
   "amber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Garden of Intervals",
  "slug": "garden-of-intervals",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 95500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Khanna's surfaces are built in thin veils, each one altering the light beneath. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Bengaluru."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-12.jpg",
    "alt": "Garden of Intervals by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "atmospheric",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "teal",
   "moss",
   "amber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Monsoon Frequency",
  "slug": "monsoon-frequency",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 475000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Colour arrives in intervals here, measured like breath. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Bengaluru.",
   "Acquired directly from the artist in 2021."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-11.jpg",
    "alt": "Monsoon Frequency by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "atmospheric",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "teal",
   "moss",
   "amber"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Held Earth",
  "slug": "held-earth",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 30,
   "height": 30,
   "depth": 26,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 195000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Iyer treats material as memory, coaxing weight and warmth out of humble matter. Hand-built and finished in a glazed stoneware body.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-10.jpg",
    "alt": "Held Earth by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "bone",
   "rust",
   "sand"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Riverbed Arithmetic",
  "slug": "riverbed-arithmetic",
  "category": "Ceramics",
  "medium": "Glazed stoneware",
  "dimensions": {
   "width": 26,
   "height": 45,
   "depth": 22,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 0,
  "price": 2325000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "Iyer works slowly, in layers, until the material begins to speak for itself. The glazed stoneware body carries the marks of its making.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2019."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-09.jpg",
    "alt": "Riverbed Arithmetic by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "bone",
   "rust",
   "sand"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "The Soft Quarry",
  "slug": "the-soft-quarry",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 30,
   "height": 90,
   "depth": 25,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 45500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Made by hand and left unfinished in places, the work keeps the record of its making. Each cast is finished by hand at the foundry.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; stable and structurally sound.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships in a custom crate within 10-14 days, fully insured.",
  "images": [
   {
    "url": "/art/work-08.jpg",
    "alt": "The Soft Quarry by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "bone",
   "rust",
   "sand"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Silt Ledger",
  "slug": "silt-ledger",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 56,
   "height": 76,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 265000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Iyer treats material as memory, coaxing weight and warmth out of humble matter. Pigment and graphite on a prepared support; supplied flat.",
  "provenance": [
   "The artist's studio, New Delhi."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-07.jpg",
    "alt": "Silt Ledger by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "bone",
   "rust",
   "sand"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Weight of Linen",
  "slug": "weight-of-linen",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 84,
   "height": 110,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 29500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "Iyer works slowly, in layers, until the material begins to speak for itself. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, New Delhi.",
   "Acquired directly from the artist in 2024."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-06.jpg",
    "alt": "Weight of Linen by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "material",
   "textural",
   "contemporary"
  ],
  "style": [
   "layered",
   "tactile"
  ],
  "colors": [
   "bone",
   "rust",
   "sand"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "A Field of Small Hours",
  "slug": "a-field-of-small-hours",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 100,
   "height": 100,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 0,
  "price": 2650000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "A study in held tension: structure asserted, then quietly dissolved. Layers of pigment and graphite give the work its depth.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-05.jpg",
    "alt": "A Field of Small Hours by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "urban",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ochre",
   "umber",
   "slate"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Signal Drift",
  "slug": "signal-drift",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 120,
   "height": 84,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 11 + 2 AP",
  "stock": 0,
  "price": 975000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "Sen builds the canvas in slow strata, letting hard geometry weather into atmosphere. The edition is printed to archival standard.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2022."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-04.jpg",
    "alt": "Signal Drift by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "urban",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ochre",
   "umber",
   "slate"
  ],
  "orientation": "landscape",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Concrete Pastoral",
  "slug": "concrete-pastoral",
  "category": "Digital Art",
  "medium": "Digital pigment print",
  "dimensions": {
   "width": 60,
   "height": 60,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 10 + 2 AP",
  "stock": 0,
  "price": 335000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "Sen's recent works trade gesture for patience, each layer a record of decisions revised. Produced as a digital pigment print in a small edition.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships flat between archival boards within 5-7 days, fully insured.",
  "images": [
   {
    "url": "/art/work-03.jpg",
    "alt": "Concrete Pastoral by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "urban",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ochre",
   "umber",
   "slate"
  ],
  "orientation": "square",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Violet Hour Study",
  "slug": "violet-hour-study",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 76,
   "height": 102,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 48500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A study in held tension: structure asserted, then quietly dissolved. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Mumbai."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-02.jpg",
    "alt": "Violet Hour Study by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "urban",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ochre",
   "umber",
   "slate"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Harbour Static",
  "slug": "harbour-static",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 120,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 0,
  "price": 98500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "Sen builds the canvas in slow strata, letting hard geometry weather into atmosphere. Painted in oil on linen, the surface rewards close looking.",
  "provenance": [
   "The artist's studio, Mumbai.",
   "Acquired directly from the artist in 2019."
  ],
  "exhibitionHistory": [],
  "condition": "Excellent; studio condition.",
  "certificate": "Signed by the artist and accompanied by the atelier's certificate of authenticity.",
  "shipping": "Ships crated within 7-10 days, fully insured.",
  "images": [
   {
    "url": "/art/work-01.jpg",
    "alt": "Harbour Static by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "tags": [
   "abstract",
   "urban",
   "contemporary"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "ochre",
   "umber",
   "slate"
  ],
  "orientation": "portrait",
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Pale Arch",
  "slug": "pale-arch",
  "category": "Photography",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 50,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 2025000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-20.jpg",
    "alt": "Pale Arch by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Temple Blue",
  "slug": "temple-blue",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 60,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 2072500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-02.jpg",
    "alt": "Temple Blue by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Rust Season",
  "slug": "rust-season",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 70,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2026,
  "edition": "Edition of 8",
  "stock": 0,
  "price": 2120000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-09.jpg",
    "alt": "Rust Season by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Bone Song",
  "slug": "bone-song",
  "category": "Ceramics",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 80,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": null,
  "stock": 1,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-16.jpg",
    "alt": "Bone Song by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "verdant"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Distant Rooms",
  "slug": "distant-rooms",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 90,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 2215000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-23.jpg",
    "alt": "Distant Rooms by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Afterimage",
  "slug": "afterimage",
  "category": "Digital Art",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 100,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 2262500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-05.jpg",
    "alt": "Afterimage by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Quiet Harbour",
  "slug": "quiet-harbour",
  "category": "Paintings",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 110,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 2310000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-12.jpg",
    "alt": "Quiet Harbour by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "monochrome"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Monsoon Ledger",
  "slug": "monsoon-ledger",
  "category": "Sculptures",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 50,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 2357500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-19.jpg",
    "alt": "Monsoon Ledger by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Indigo Ledger",
  "slug": "indigo-ledger",
  "category": "Photography",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 90,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": null,
  "stock": 1,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-02.jpg",
    "alt": "Indigo Ledger by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Courtyard, Noon",
  "slug": "courtyard-noon",
  "category": "Prints",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 100,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 932500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-09.jpg",
    "alt": "Courtyard, Noon by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Held Breath",
  "slug": "held-breath",
  "category": "Works on Paper",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 110,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 980000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-16.jpg",
    "alt": "Held Breath by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "verdant"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Terracotta Psalm",
  "slug": "terracotta-psalm",
  "category": "Ceramics",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 50,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 1027500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-23.jpg",
    "alt": "Terracotta Psalm by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Low Tide at Juhu",
  "slug": "low-tide-at-juhu",
  "category": "Mixed Media",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 60,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 0,
  "price": 1075000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-05.jpg",
    "alt": "Low Tide at Juhu by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Archive of Dust",
  "slug": "archive-of-dust",
  "category": "Digital Art",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 70,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 1122500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-12.jpg",
    "alt": "Archive of Dust by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "monochrome"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Evening Raga",
  "slug": "evening-raga",
  "category": "Paintings",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 80,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2024,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 1170000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-19.jpg",
    "alt": "Evening Raga by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Tender Ground",
  "slug": "tender-ground",
  "category": "Sculptures",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 90,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 1217500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-01.jpg",
    "alt": "Tender Ground by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Brass and Shadow",
  "slug": "brass-and-shadow",
  "category": "Photography",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 100,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 1265000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-08.jpg",
    "alt": "Brass and Shadow by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "verdant"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Nine Doors",
  "slug": "nine-doors",
  "category": "Prints",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 110,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": null,
  "stock": 1,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-15.jpg",
    "alt": "Nine Doors by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Stillwater",
  "slug": "stillwater",
  "category": "Works on Paper",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 50,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 1360000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-22.jpg",
    "alt": "Stillwater by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "Red Earth Study",
  "slug": "red-earth-study",
  "category": "Ceramics",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 60,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 1407500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-04.jpg",
    "alt": "Red Earth Study by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "monochrome"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "The Listening Wall",
  "slug": "the-listening-wall",
  "category": "Mixed Media",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 70,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 1455000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-11.jpg",
    "alt": "The Listening Wall by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Kiln Light",
  "slug": "kiln-light",
  "category": "Digital Art",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 80,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 1502500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-18.jpg",
    "alt": "Kiln Light by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Northern Window",
  "slug": "northern-window",
  "category": "Paintings",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 90,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2023,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 1550000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-25.jpg",
    "alt": "Northern Window by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "verdant"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Dune Script",
  "slug": "dune-script",
  "category": "Sculptures",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 100,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 0,
  "price": 1597500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-07.jpg",
    "alt": "Dune Script by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Slow Fire",
  "slug": "slow-fire",
  "category": "Photography",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 110,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 1645000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-14.jpg",
    "alt": "Slow Fire by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "reva-das"
 },
 {
  "title": "Garden of Absence",
  "slug": "garden-of-absence",
  "category": "Prints",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 50,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 1692500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-21.jpg",
    "alt": "Garden of Absence by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Chalk Moon",
  "slug": "chalk-moon",
  "category": "Works on Paper",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 60,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": "Edition of 8",
  "stock": 8,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-03.jpg",
    "alt": "Chalk Moon by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Tidewater",
  "slug": "tidewater",
  "category": "Ceramics",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 70,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 1787500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-10.jpg",
    "alt": "Tidewater by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "verdant"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "The Open Hand",
  "slug": "the-open-hand",
  "category": "Mixed Media",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 80,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 1835000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-17.jpg",
    "alt": "The Open Hand by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "Winter in Shimla",
  "slug": "winter-in-shimla",
  "category": "Digital Art",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 90,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 1882500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-24.jpg",
    "alt": "Winter in Shimla by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Cartography of Rest",
  "slug": "cartography-of-rest",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 100,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 1930000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-06.jpg",
    "alt": "Cartography of Rest by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "Loom",
  "slug": "loom",
  "category": "Sculptures",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 110,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 1977500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-13.jpg",
    "alt": "Loom by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Quiet Geometry",
  "slug": "quiet-geometry",
  "category": "Sculptures",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 60,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 77500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-08.jpg",
    "alt": "Quiet Geometry by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "verdant"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "video": {
   "url": "/film/work-08.mp4",
   "poster": "/art/work-08.jpg",
   "mime": "video/mp4",
   "duration": 8,
   "width": 720,
   "height": 900,
   "caption": "A slow look across the surface",
   "placeholder": true
  },
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Memory of Stone",
  "slug": "memory-of-stone",
  "category": "Photography",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 70,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 1,
  "price": 125000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-15.jpg",
    "alt": "Memory of Stone by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "Blue Interval",
  "slug": "blue-interval",
  "category": "Prints",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 80,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": null,
  "stock": 1,
  "price": 172500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-22.jpg",
    "alt": "Blue Interval by Mira Khanna",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "mira-khanna"
 },
 {
  "title": "Night Orchard",
  "slug": "night-orchard",
  "category": "Works on Paper",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 90,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 220000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-04.jpg",
    "alt": "Night Orchard by Reva Das",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "monochrome"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "video": {
   "url": "/film/work-04.mp4",
   "poster": "/art/work-04.jpg",
   "mime": "video/mp4",
   "duration": 8,
   "width": 720,
   "height": 900,
   "caption": "A slow look across the surface",
   "placeholder": true
  },
  "artistSlug": "reva-das"
 },
 {
  "title": "The Long Light",
  "slug": "the-long-light",
  "category": "Ceramics",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 100,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 267500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-11.jpg",
    "alt": "The Long Light by Kabir Anand",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "artistSlug": "kabir-anand"
 },
 {
  "title": "Field Notes",
  "slug": "field-notes",
  "category": "Mixed Media",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 110,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 315000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-18.jpg",
    "alt": "Field Notes by Tara Menon",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "tara-menon"
 },
 {
  "title": "Threshold",
  "slug": "threshold",
  "category": "Digital Art",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 50,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2025,
  "edition": null,
  "stock": 1,
  "price": 362500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-25.jpg",
    "alt": "Threshold by Dev Mehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "verdant"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "dev-mehra"
 },
 {
  "title": "Soft Architecture",
  "slug": "soft-architecture",
  "category": "Paintings",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 60,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2026,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 410000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-07.jpg",
    "alt": "Soft Architecture by Ishani Roy",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "ishani-roy"
 },
 {
  "title": "River Without Banks",
  "slug": "river-without-banks",
  "category": "Sculptures",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 70,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": null,
  "stock": 1,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-14.jpg",
    "alt": "River Without Banks by Arjun Vadehra",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "arjun-vadehra"
 },
 {
  "title": "Salt Line",
  "slug": "salt-line",
  "category": "Photography",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 80,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2019,
  "edition": null,
  "stock": 1,
  "price": 505000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-21.jpg",
    "alt": "Salt Line by Maya Pillai",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ced",
   "name": "Sculptural Works",
   "slug": "sculptural-works"
  },
  "tags": [
   "contemporary",
   "figurative",
   "cool"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "maya-pillai"
 },
 {
  "title": "A Room in Kochi",
  "slug": "a-room-in-kochi",
  "category": "Prints",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 90,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2020,
  "edition": null,
  "stock": 0,
  "price": 552500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "sold",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-03.jpg",
    "alt": "A Room in Kochi by Neel Kapoor",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cee",
   "name": "Works on Paper",
   "slug": "works-on-paper"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "neel-kapoor"
 },
 {
  "title": "Vessel for Rain",
  "slug": "vessel-for-rain",
  "category": "Works on Paper",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 100,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2021,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 600000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-10.jpg",
    "alt": "Vessel for Rain by Zoya Merchant",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cef",
   "name": "Indian Modernism",
   "slug": "indian-modernism"
  },
  "tags": [
   "contemporary",
   "figurative",
   "verdant"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "zoya-merchant"
 },
 {
  "title": "Ochre Hours",
  "slug": "ochre-hours",
  "category": "Ceramics",
  "medium": "Archival pigment print",
  "dimensions": {
   "width": 110,
   "height": 72,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2022,
  "edition": null,
  "stock": 1,
  "price": 647500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-17.jpg",
    "alt": "Ochre Hours by Rohan Lal",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf0",
   "name": "Abstract Expressionism",
   "slug": "abstract-expressionism"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "horizon",
   "atmospheric"
  ],
  "colors": [
   "5b4f47"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "rohan-lal"
 },
 {
  "title": "The Weight of Air",
  "slug": "the-weight-of-air",
  "category": "Mixed Media",
  "medium": "Handmade paper",
  "dimensions": {
   "width": 50,
   "height": 84,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2023,
  "edition": null,
  "stock": 1,
  "price": 695000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-24.jpg",
    "alt": "The Weight of Air by Avni Rao",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf1",
   "name": "Limited Editions",
   "slug": "limited-editions"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "arch",
   "minimal"
  ],
  "colors": [
   "22333b"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "avni-rao"
 },
 {
  "title": "Second Horizon",
  "slug": "second-horizon",
  "category": "Digital Art",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 60,
   "height": 96,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2024,
  "edition": null,
  "stock": 1,
  "price": 742500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-06.jpg",
    "alt": "Second Horizon by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cf2",
   "name": "New Acquisitions",
   "slug": "new-acquisitions"
  },
  "tags": [
   "contemporary",
   "abstract",
   "cool"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "aarav-sen"
 },
 {
  "title": "Laterite",
  "slug": "laterite",
  "category": "Paintings",
  "medium": "Pigment and graphite",
  "dimensions": {
   "width": 70,
   "height": 108,
   "depth": 1,
   "unit": "cm"
  },
  "year": 2025,
  "edition": "Edition of 8",
  "stock": 8,
  "price": 790000,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-13.jpg",
    "alt": "Laterite by Leela Iyer",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "geometric",
   "minimal"
  ],
  "colors": [
   "8c6b50"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "leela-iyer"
 },
 {
  "title": "Small Sun",
  "slug": "small-sun",
  "category": "Sculptures",
  "medium": "Cast bronze",
  "dimensions": {
   "width": 80,
   "height": 120,
   "depth": 2,
   "unit": "cm"
  },
  "year": 2026,
  "edition": null,
  "stock": 1,
  "price": 837500,
  "currency": "INR",
  "priceOnRequest": false,
  "availability": "available",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-20.jpg",
    "alt": "Small Sun by Nikhil Bose",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7cec",
   "name": "Emerging Artists",
   "slug": "emerging-artists"
  },
  "tags": [
   "contemporary",
   "abstract",
   "warm"
  ],
  "style": [
   "strata",
   "gestural"
  ],
  "colors": [
   "d2b48c"
  ],
  "type": "original",
  "featured": false,
  "published": true,
  "artistSlug": "nikhil-bose"
 },
 {
  "title": "After the Monsoon",
  "slug": "after-the-monsoon",
  "category": "Paintings",
  "medium": "Oil on linen",
  "dimensions": {
   "width": 50,
   "height": 60,
   "depth": 0,
   "unit": "cm"
  },
  "year": 2018,
  "edition": "Edition of 8",
  "stock": 0,
  "price": null,
  "currency": "INR",
  "priceOnRequest": true,
  "availability": "sold",
  "description": "A contemplative work balancing structure and atmosphere, made through a patient sequence of layering and removal.",
  "provenance": [
   "Artist studio",
   "Private collection, Mumbai"
  ],
  "exhibitionHistory": [],
  "condition": "Excellent",
  "certificate": "Signed certificate of authenticity",
  "shipping": "Specialist art handling with insured delivery.",
  "images": [
   {
    "url": "/art/work-01.jpg",
    "alt": "After the Monsoon by Aarav Sen",
    "width": 1000,
    "height": 1250,
    "variants": []
   }
  ],
  "collection": {
   "_id": "6ab4b22cb94dbbe556df7ceb",
   "name": "Contemporary Masters",
   "slug": "contemporary-masters"
  },
  "tags": [
   "contemporary",
   "figurative",
   "warm"
  ],
  "style": [
   "colour-field",
   "gestural"
  ],
  "colors": [
   "152a38"
  ],
  "type": "original",
  "featured": true,
  "published": true,
  "video": {
   "url": "/film/work-01.mp4",
   "poster": "/art/work-01.jpg",
   "mime": "video/mp4",
   "duration": 8,
   "width": 720,
   "height": 900,
   "caption": "A slow look across the surface",
   "placeholder": true
  },
  "artistSlug": "aarav-sen"
 }
];
const ARTICLES = [
 {
  "title": "Inside the Studio of Leela Iyer",
  "slug": "inside-the-studio-of-leela-iyer",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-03.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-09-24T05:16:28.958Z",
  "readingTime": 6,
  "type": "Artist Stories",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## A room that works slowly\n\nThe first thing you notice in Leela Iyer's studio is that nothing in it is in a hurry. The room sits on the second floor of a Barsati in South Delhi, up a flight of stairs that has not been painted in years, and when she opens the door the smell arrives before the view does: linseed oil, old paper, and the faint sweetness of the tea she has already let go cold twice this morning.\n\nThe studio is not large. A bed she no longer sleeps in is pushed against one wall and covered with drawings. A wooden easel holds a canvas that has been \"almost finished\" since winter. Along the window, where the northern light comes in without any drama, a long table carries the real evidence of her practice: jars of brushes sorted by wear, a glass palette grey with use, and a stack of primed boards leaning in order of size like books on a shelf.\n\nShe works standing, in silence, in the mornings. Afternoons are for looking.\n\n## The discipline of staying in one place\n\nIyer's paintings are built the slow way, in layers that have to dry before the next one can be laid down, and this technical fact has become the organising principle of her life. She plans her weeks around drying times. She will not travel when a work is at a fragile stage. Friends have learned that \"the painting is wet\" is a complete sentence and a real reason.\n\n\"I used to fight it,\" she says, wiping a brush she has already wiped three times. \"I wanted to be the kind of painter who finishes something in a burst. Then I realised the slowness was not the obstacle. It was the method.\"\n\nWatch a single work over months and you understand what she means. A painting begins as a thin, almost transparent wash, the colour of weak tea. Over weeks she adds body: a second layer that sets the structure, a third that complicates it. Then, at some point she cannot schedule, the painting starts to argue back, and the argument is the work. She scrapes down. She rebuilds. The final surface keeps the memory of everything underneath it, which is why her finished canvases have that unsettled depth, as if the colour were still deciding.\n\n## What the room keeps\n\nEvery studio has a museum of things the artist cannot throw away, and Iyer's is specific. A tin of her grandmother's buttons. A photograph of the house in Kerala she left at nine, the light in it doing something she has spent twenty years trying to do on purpose. A failed painting, the worst one she ever made, hung where she can see it from the easel. \"For honesty,\" she says.\n\nThere is also a wall of small works on paper, dozens of them, made quickly at the end of long days. They are looser than the canvases, almost casual, and they are where her subjects first appear: the bend of a river that may be a remembered one, a figure turned away from the viewer, a house with too many windows. When a canvas is giving her trouble she looks at the paper works instead of at the canvas. \"The paintings are where I am careful. These are where I find out what I actually want to paint.\"\n\nIt is tempting, in a market that loves a tidy story, to file Iyer under \"memory\" and be done. The work resists this. The remembered house is drawn with an architect's patience. The river is measured. What reads as nostalgia from across the room resolves, up close, into a set of very deliberate decisions about edges and weight.\n\n## On finishing\n\nAsk her when a painting is done and she gives the answer of someone who has been asked before and minds less each time. \"It's finished when it stops needing me. You can feel it. The room changes.\"\n\nShe means this literally. A work in progress faces the easel; a finished one is turned to the wall for a week, and if she can walk past it for seven days without wanting to fix something, it may leave. Some paintings never get their week. One canvas near the door has been turned to the wall three times and called back three times.\n\nCollectors sometimes ask her how long a painting takes, and she has stopped apologising for the answer. Between the first wash and the last glance, the honest number is usually a year, sometimes more. The year is visible. That is the whole point.\n\n## Leaving\n\nOn the way out she makes tea neither of us will finish and says the thing that stays with me on the stairs down. \"People think painting is about what you put in. Mostly it's about what you can bear to leave out, and how long you're willing to stand there before you decide.\"\n\nDownstairs, Delhi is loud again. Upstairs, the paintings are drying, on their own schedule, in the northern light.\n\n## The materials, and why they matter\n\nHer materials are ordinary in the way that good tools are ordinary. A medium she mixes herself, more stand oil than anything, kept in a bottle that has outlived several landlords. Pigments from the same two suppliers she has used for a decade, because she knows exactly how their cadmiums behave. Brushes are retired to a second jar and then a third, and the oldest ones, worn to stiff nubs, do the scraping-down that gives her surfaces their weathered calm.\n\nShe primes her own boards and stretches her own canvases, not out of purism but out of distrust. \"A ground you didn't make is a room you haven't seen before you move in,\" she says. The preparation is part of the year's work. When a collector runs a hand near the edge of a finished piece, that even, quiet tooth in the surface is the weeks she spent before the first wash went on.\n\nThere is one concession to speed. Photographs. She takes hundreds on the train to Kerala, of nothing in particular: platforms, laundry, the backs of houses. They are never references in the literal sense. She does not paint from them. They are more like a way of asking the world a question, and the paintings, months later, are the answers she happened to find.\n\n## The market and the slow painter\n\nA slower practice means fewer works, and fewer works means a different relationship with the people who buy them. Iyer makes eight paintings in a good year. The gallery has learned to present her on that rhythm: a small showing, works held rather than pushed, prices that move with the labour actually in the surface.\n\nIt would be easy to frame this as a stance, a rebuke to a faster art world. She does not frame it that way. \"I'm not making a point. I'm making paintings. The point, if there is one, is for the person who lives with the work.\" She pauses. \"You hang a painting in your house and it has to keep its side of the conversation for thirty years. A year of mine is a fair trade for thirty of yours.\"\n\nThe studio, in the end, explains the work better than any statement could. It is a room arranged around waiting: wet paintings, drying layers, a week of turning to the wall. What leaves it has been waited for, properly, and you can tell.",
  "published": true
 },
 {
  "title": "How to Live With a Large Painting",
  "slug": "how-to-live-with-a-large-painting",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-07.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-09-12T05:16:28.958Z",
  "readingTime": 7,
  "type": "Collector Guides",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The fear is the point\n\nMost people stand in front of a large painting and feel two things at once: pulled in, and slightly afraid. The pull is why galleries hang big work. The fear is why so few of those works go home. Collectors worry the painting will swallow the room, that they will tire of it, that their life is not big enough for the object. After years of placing large canvases in ordinary homes, we can say the worry is almost always backwards. A large painting does not ask you to live up to it. It asks only that you let it work.\n\nConsider what a big canvas actually does. Tara Menon's The Green Hour, at 110 by 150 centimetres, does not decorate a wall so much as replace it. The surface holds a dense, humid green that shifts as you cross the room, and the scale means your body is inside the painting's weather before your eyes have finished reading it. A small picture is something you look at. A large painting is something you stand in.\n\nThat difference is the whole argument for living with one.\n\n## Choosing a work you will not outgrow\n\nThe question we hear most is not about wall space. It is this: what if I tire of it? The honest answer is that you will tire of a painting that only performs. Work chosen for a first impression, all contrast and incident, exhausts itself quickly, the way a loud song does. Work chosen for its depth does the opposite. It withholds. Months in, you notice a passage of colour you had never seen, a decision the artist made near the edge that suddenly explains the whole.\n\nThis is why we encourage collectors to spend time with a large work before committing, and why our viewings are unhurried by design. Sit with the painting for half an hour. If it keeps giving you things after the novelty fades, it will keep giving for decades. A canvas like Menon's Backwater Chromatics rewards exactly this test: the first read is calm, almost quiet, and the complications arrive slowly, in the lower registers of the composition, where the colour stops behaving.\n\nScale also forgives subject matter you might not expect to live with. A demanding image at twenty centimetres is a provocation. The same image at a metre and a half becomes a landscape you enter, and the difficulty settles into something more like weather. Do not choose the safest work. Choose the one you keep returning to.\n\n## Start with the wall you already have\n\nYou do not need a double-height stairwell or a minimalist loft. You need one uninterrupted wall, roughly the width of a sofa or a bed, and the discipline to leave it alone. The most common mistake we see is not buying too big. It is crowding. A large painting wants air around its edges, the way a speaker wants a quiet room. If the wall is broken up by switches, shelves, or a row of smaller frames, the canvas reads as oversized clutter rather than as a presence.\n\nMeasure before you fall in love. The rule we use in the gallery is simple: the work should take up between two-thirds and three-quarters of the furniture width beneath it, and its centre should sit at eye level, around 145 centimetres from the floor. Ishani Roy's Local Train, 6:14 is 150 centimetres wide, and over a standard three-seat sofa it lands exactly in that band. Hung any higher it becomes a ceiling ornament. Hung at the right height it becomes the room's anchor, and everything else, the lamps, the books, the slightly worn rug, relaxes into place around it.\n\nIf your rooms are small, do not assume large work is ruled out. A modest room with one big painting feels deliberate. A modest room with eight small ones feels like a corridor. Scale is about confidence, not square footage.\n\n## Light is the second frame\n\nLarge surfaces are honest. They show every lighting mistake you make. A single downlight placed too close will carve a hot oval into the top third of the canvas and leave the bottom in dusk. Direct afternoon sun will, over years, do worse than that.\n\nWhat big paintings want is broad, soft, indirect light. Daylight from a window adjacent to the wall, never opposite it, is ideal; the raking light lets the surface texture, the linen weave, the drag of the brush, do its quiet work. In the evening, a picture light or a wash from two angled spots will carry the room. Reva Das's Salvage Bloom, all 150 centimetres of it, lives or dies on this. Its layered surface reads as flat decoration under a bare bulb and as weather under a proper wash. The painting does not change. The light does.\n\n## Living with it, day by day\n\nHere is what collectors tell us a year later, and it is always the same story in different words. The first week, you look at the painting constantly. The second month, you stop looking, and this frightens people, but it should not. The work has gone from being a guest to being a resident. Then, somewhere around the sixth month, it starts doing its real job: it sets the emotional register of the room. You come home tired, and the painting is there holding a kind of calm you did not have to earn that day.\n\nLarge work also changes how you use a room. People gravitate toward it. Chairs get turned. Conversations happen under it. One collector told us her teenage son started doing his homework beneath Menon's Backwater Chromatics, a canvas that runs 150 centimetres across, because, in his words, it felt less lonely than his desk. That is not a review you will find in a catalogue, but it is the truest thing we know about scale.\n\n## It will outlast your furniture\n\nOne more thing worth knowing before you commit: a large painting reorders the lifespan of everything else you own. Sofas are replaced. Paint colours come and go. The canvas stays. Collectors who bought big work a decade ago now plan rooms around it, and when they move house, the first measurement they send us is not the bedroom count but the living room wall. This sounds like a burden and reads, in practice, as a kind of continuity. Homes change cities, jobs change shape, children grow up and leave, and the painting is still there on the new wall, holding the same weather it held in the old house.\n\nThere is also the matter of what a big work does for the other things you live with. A serious canvas raises the game of an entire room. The ceramics on the shelf look chosen rather than accumulated. The old wooden bench you never got around to replacing suddenly reads as patina. We have watched collectors spend months after an installation quietly editing, removing the noise the painting made visible. That editing is free, and it is one of the great unlisted benefits of the purchase.\n\n## The practical matters, briefly\n\nYes, you need to think about weight and fixings. A stretched canvas of this size typically runs eight to fifteen kilograms, which means two proper wall fixings into studs or masonry, not a single nail and hope. We arrange delivery and installation for precisely this reason, and we will say plainly: do not hang a large painting alone. Two people, a level, and patience.\n\nThink too about the journey into the room. Measure doorways, stair turns, and lift interiors before purchase. A 150-centimetre canvas does not bend. We have never had to abandon a delivery, but we have twice had to wait while a collector's framed mirror was moved out of a hallway. Ten minutes of measuring saves an awkward afternoon.\n\nAnd insurance: a work of this value belongs on your policy as a named item. It takes one phone call.\n\n## What it gives back\n\nA large painting is the closest thing domestic life has to architecture. It changes the proportions of a room without moving a single wall. It commits you to looking, and in return it keeps paying attention on your behalf, on the days you are too busy to notice it and the evenings you sit down in front of it with nothing left in the day but looking.\n\nStart with one wall, one work, honestly lit. The rest of the room will reorganise itself around the decision, and within a year you will wonder how the house ever felt finished without it.",
  "published": true
 },
 {
  "title": "A New Material Language",
  "slug": "a-new-material-language",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-11.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-08-31T05:16:28.958Z",
  "readingTime": 8,
  "type": "Exhibition Reviews",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## Beyond oil on canvas\n\nWalk through the gallery this season and something is quietly different. The wall labels tell the story before the works do: glazed stoneware, cast bronze, handmade paper, pigment and graphite. Oil on linen is still here, and it is not going anywhere. But the centre of gravity in Indian contemporary practice has shifted, and the shift is not about imagery. It is about what the work is made of, and what that material knows.\n\nMaterial is never neutral. It arrives at the studio with its own history, its own physics, and its own habits, and every artist who works seriously learns this within the first year. A bronze carries the memory of the foundry: heat, risk, the pour that either holds or ruins months of work. Handmade paper carries the watermark of its making, the fibre's uneven thirst. Stoneware carries the kiln's temperament, and any ceramicist will tell you the kiln keeps its own counsel. When an artist chooses a material, they choose a collaborator with its own opinions. The most interesting work being made in India right now comes from artists who have stopped treating materials as vehicles and started treating them as languages.\n\n## The kiln and the foundry\n\nRohan Lal's Shard Atlas is a good place to start. It is glazed stoneware, forty-five centimetres tall, and it does not behave like a pot. The surface is fractured into a cartography of shards, each one glazed a slightly different temperature of the same blue-grey, so the whole object reads like a map of somewhere that does not exist. Up close you can see where the glaze ran, where it pooled, where the kiln got ambitious. Lal does not correct these events. He composes with them. The Kiln Keeper, its companion piece, makes the relationship explicit: the work is about the making, and the making is a negotiation with fire.\n\nLeela Iyer arrived at the same territory from the opposite direction. Her early ceramic works, Held Earth and Riverbed Arithmetic, are vessels only in the loosest sense; they are arguments about weight, mass, and how much pressure a form can hold before it becomes landscape. Her recent move into cast bronze, The Soft Quarry, surprised people who thought they knew her practice, but the logic is exact. Bronze lets her keep the mass and lose the fragility. The work is still about the earth. It has simply learned a harder grammar.\n\nMaya Pillai's bronzes come from the coast, and they carry it. Coir and Salt stands 120 centimetres tall and looks, from across the room, like fibre rather than metal, as though the bronze had been teased into rope before it cooled. That is the point. Pillai casts from forms built with actual coir, and the material leaves its fingerprint in the bronze forever. Laterite Psalm does the same trick with the red stone of her home ground. These are not sculptures of coastal materials. They are coastal materials, translated into permanence.\n\n## Paper, the quiet radical\n\nThe most radical material in the gallery is also the humblest. Handmade paper has a long history in Indian craft, and a shorter, sharper one in contemporary practice, where artists have discovered that a sheet of paper is not a surface but a substance. Neel Kapoor's Monsoon Veranda is built from paper he specified down to the fibre, and the work's subject, a veranda holding the first hour of rain, lives inside the sheet rather than on top of it. The pigment sits in the paper at different depths. You read the image the way you read water.\n\nReva Das works the same ground from another angle. Monsoon Ledger and Courtyard, Noon use handmade paper as an archive of touch: every dent and fibre shadow is preserved under the drawing. Kabir Anand's The Poet's Pause does something stranger. The paper is sized so unevenly that the graphite sinks and floats in bands, and the portrait that emerges looks like a memory arriving rather than a likeness being recorded. Avni Rao's Rust Season pushes furthest: the paper itself is stained with iron before the drawing begins, so the ground is already a painting before a single mark is made.\n\nThis is what a new material language looks like in practice. Not novelty for its own sake, not the spectacle of strange stuff, but artists finding out what a material can say that no other material can.\n\n## The hybrid middle\n\nBetween the heavy materials and the light ones sits the quiet workhorse of the current catalogue: pigment and graphite. It sounds like a drawing medium and behaves like a territory. Artists use it to hold the line between painting and drawing open, refusing to close the gap, and the results have a particular charge, part image, part handwriting.\n\nArjun Vadehra's Ash and Meridian is the clearest example in the gallery right now. The graphite lays down a strict geometry, almost architectural, and then the pigment arrives in drifts, softening edges the drawing worked hard to establish. The picture reads as a negotiation between control and weather. Tara Menon's Canopy Study does the reverse: pigment first, a wash of green density, and graphite afterward, mapping the structure of branches the way a surveyor might. Ishani Roy's Chawl Ballad uses the medium at its most tender. The figures are drawn with a draughtsman's patience, but the pigment that surrounds them is allowed to bloom and stain, so the people appear held, almost protected, by the medium's uncertainty.\n\nWhat unites these works is tempo. Oil can be fast or slow, but it hides its hours. Pigment and graphite keep theirs legible. You can see the order of operations, the revisions, the places where the artist pressed harder on a bad day. Collectors often tell us these are the works they live with most closely, and we think the legibility is why: the making stays present in the object, and presence is company.\n\n## Why collectors are responding\n\nThere is a practical side to this, and it would be dishonest to skip it. Work in ceramic, bronze, and paper asks different things of a home than canvas does, and collectors are discovering the pleasures of those differences. A stoneware piece wants a plinth or a strong shelf and a sidelight, and it rewards you every time the sun moves. A bronze forgives almost everything except being ignored. Works on handmade paper ask for framing with museum glass and a wall away from direct light, and in return they offer an intimacy that canvas rarely matches: you look at them the way you read a letter, close and private.\n\nThere is also a generational texture to the shift. Younger collectors, particularly first-time buyers, often begin with works on paper because the entry point is gentler and the scale suits city apartments. What surprises them is how quickly the material itself becomes the attraction. We have watched collectors arrive asking for a painting and leave thinking about a sheet of paper they cannot stop describing.\n\n## What to ask before you buy\n\nMaterial-led work rewards a slightly different set of questions at the point of purchase, and none of them are difficult. For ceramics, ask about the firing and the stability of the glaze; a good gallery will know the kiln history and will tell you honestly whether a surface is matte and thirsty or sealed. For bronze, ask about the patina and how it was fixed, because a living patina will keep changing, beautifully but genuinely, and you should know whether you are buying a finished surface or a continuing one. For works on paper, ask about the sheet itself, its fibre and sizing, and insist on museum-grade framing with a spacer so the work never touches the glass.\n\nAsk, too, about the artist's relationship with the material. The answer is often the best part of the story, and it is the part that deepens the work in your home. Knowing that Pillai casts from coir, or that Kapoor specifies his paper fibre, changes what you see every time you walk past. Provenance is usually discussed as paperwork. With material-driven work, it is also knowledge: the object's biography, told in the language it was made in.\n\n## What the shift means\n\nEvery generation of artists renegotiates the terms of what art is allowed to be made of. The Indian moderns did it with cement and corrugated metal; the generation before them did it by taking miniature techniques off the page. What is happening now is quieter and, we think, more durable: a turn toward materials that carry process in their bodies, that keep the record of their own making visible in the finished work.\n\nFor a gallery, this changes how we hang, light, and talk about the rooms. For a collector, it changes what living with art can mean. And for the artists, if the work in our current catalogue is any evidence, it has opened a register that feels genuinely new: objects that are not images of the world but pieces of it, fired, cast, beaten, and sized into forms that will outlast every conversation we are having about them.\n\nIt is worth saying, finally, that none of this displaces painting. The strongest rooms in the gallery this year are the mixed ones, where an oil on linen holds the wall and a stoneware piece answers it from across the floor. Material languages are not competitors. They are accents, and a collection, like a sentence, gets more interesting the more registers it can speak in.\n\nThe next time you visit, read the wall labels first. Then look at the work. The material is the message, and right now it is saying remarkable things.",
  "published": true
 },
 {
  "title": "Collecting With Intention",
  "slug": "collecting-with-intention",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-15.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-08-19T05:16:28.958Z",
  "readingTime": 9,
  "type": "Market Insights",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The difference between buying and collecting\n\nNobody sets out to accumulate. It happens by degrees: a print from a fair, a canvas bought on holiday, something inherited, something a friend made. Then one day you look at your walls and realise they hold a record of impulses rather than a point of view. There is nothing wrong with that. But there is a difference between owning art and building a collection, and the difference is intention.\n\nIntention does not mean rigidity. The collectors we admire most change their minds constantly. It means that each acquisition answers a question the collection is asking, even if the question is as simple as: what moves me, and do I want to live inside the answer? This essay is about how to find that question for yourself, and how to let it guide the practical decisions that follow.\n\n## Start with looking, not buying\n\nEvery serious collector we know spent a long season, sometimes years, looking before they bought well. This is not a delay tactic. It is how taste becomes knowledge. Visit galleries without a wallet. Go to openings and leave without a catalogue. Follow a handful of artists across several shows and notice what changes in their work and what changes in you. The eye is a muscle, and it trains on repetition.\n\nKeep notes, even rough ones. A phone photograph of a work that stopped you, with a sentence about why, is worth more than any advisor's shortlist. After six months of this, patterns appear that you could not have predicted: you return to quiet surfaces, or to certain kinds of line, or to work made from materials with a history. That pattern is your question beginning to form. Tara Menon's prints are a useful example: collectors who love Salt Gradient almost always discover they had been circling her work for months without realising it, pulled by the same quality of held, humid light across everything she makes.\n\n## Buy the best example you can, not the most you can\n\nThe most common structural mistake in a young collection is spreading a budget thin. Three adequate works will teach you less, give you less, and hold their meaning less durably than one excellent one. When the choice is between a minor piece by a celebrated name and a major piece by an emerging one, take the major piece nearly every time. Quality compounds. Quantity just accumulates.\n\nThis is where a gallery earns its keep. Ask us which work in a show the artist would keep if they could keep only one. Ask which piece the other artists in the room keep returning to. The answers are never secret, and they reframe a wall of options into a short list of real contenders. Within our own catalogue, we will tell you plainly: Ishani Roy's Chawl Ballad is the work her peers talk about, and the conversation around it has not stopped since it arrived.\n\n## A word about money, plainly\n\nLet us be direct about the two anxieties that surround price. The first: is it worth it? A work is worth what it costs when you would buy it again knowing everything you know after living with it. No spreadsheet settles that question; only honest looking does. The second anxiety: will it appreciate? Perhaps. Markets move, careers rise, and some of the artists in this gallery will be significantly more expensive in ten years. But any advisor who leads with return is selling you a financial product with a picture attached. Buy the work because the room of your life is better with it in it. If appreciation follows, treat it as a dividend on attention, not the point of the exercise.\n\nThere is also a practical truth the market conversation obscures: serious work exists at every level. Rohan Lal's Iron Meadow, a cast bronze of real presence, costs less than many people's annual coffee budget. Neel Kapoor's Monsoon Veranda on handmade paper sits at an entry point that first-time collectors regularly describe, afterward, as the moment their home became theirs. Intention is not a function of budget. It is a function of clarity.\n\n## Build relationships, not transactions\n\nThe collectors who build the strongest collections share one habit: they are known. Not in the social sense, but in the working one. They tell their gallery what they loved and what left them cold. They ask about artists before the work arrives. They visit studios when invited. Over time this does something no budget can: it gives them first sight of the right works, rather than first sight of everything.\n\nArtists belong in this web of relationships too, and meeting them changes the works you already own. A studio visit re-reads your walls: after watching Kabir Anand work graphite into sized paper for an afternoon, collectors tell us The Poet's Pause looks different forever, slower and braver. Ask your gallery for introductions. The good ones are generous with them, because they know what it does.\n\nThis is also how collecting stays honest. A good gallery will sometimes talk you out of a purchase, because the work is wrong for where your collection is heading, and you should want that. We keep notes on what our collectors live with, and some of our proudest moments are emails that begin: remember what you said about waiting. The transaction matters for an afternoon. The relationship shapes decades of walls.\n\n## The mistakes that teach\n\nEvery collector we know has a story about a purchase that went wrong, and the stories are remarkably consistent. The first mistake: buying to fill a wall. A room with an empty space exerts a strange pressure, and the pressure produces purchases that solve the room instead of serving the collection. The fix is boring and effective: never shop for a space. Shop for the work, and let the right space reveal itself afterward; it always does.\n\nThe second mistake: buying to match. A painting chosen to harmonise with a sofa will be invisible within a year, because furniture is background and art that agrees with the background becomes background. The works that hold a room are the ones that argue with it a little. The third mistake is subtler: buying the name. A weak work by a strong artist is still a weak work, and it will embarrass the wall every single day, quietly, in a way guests cannot name but everyone feels.\n\nThe fourth mistake is the opposite of all of these: not buying the work you cannot stop thinking about, because it was slightly above the number you had in your head, or slightly wrong for the plan. Collectors regret the ones that got away with a particular sharpness. Years later they describe the lost work in perfect detail. Ask any of them which purchases they regret. The list is always short. Ask which non-purchases they regret. The list is long.\n\n## Living with a growing collection\n\nAs a collection grows, it develops a geography. Not everything hangs at once, and this is a pleasure, not a storage problem. Rotation is how collections stay alive to their owners: a work that rests for a season returns to the wall with its force restored, and the works around it are seen freshly in its light. Serious collectors treat their walls the way curators treat their galleries, as arguments that need revising.\n\nRotation also teaches you what the collection is actually about. When works move, affinities appear that no plan could have predicted: a Menon print suddenly converses with a Pillai bronze across a hallway, and you understand something about both that the catalogue never said. Keep notes on these discoveries. They are the collection thinking.\n\nLight and care scale with the collection too. Works on paper want shade and stable humidity; bronzes want occasional hands and no chemicals; canvases want distance from kitchens and incense. None of this is onerous, but it is easier to build the habits with three works than with thirty. A collection is a household of objects with needs, and intention includes housekeeping.\n\n## Documentation is an act of care\n\nFrom your first serious purchase, keep the records as though the work will outlive you, because it will. The invoice, the certificate, the condition report at purchase, the story of how you found it. Photograph the work in your home each year. If you reframe or restore, keep that paperwork too. None of this is bureaucracy. It is the work's biography, and one day it will matter to someone you love, or to a museum registrar, or to a future owner who will treasure the fact that you cared.\n\nIntention extends, in the end, to what the collection is for. Some collections are built to be given away, piece by piece, to children who grew up beneath them. Some are built to stay together as a statement about a time and a place and a way of seeing. Some are simply built to be lived with, fully, and dispersed without ceremony. All of these are legitimate. What they share is that someone decided.\n\n## The discipline of the pass\n\nIntention shows itself most clearly in the works you do not buy. Every strong collection is shadowed by a collection of passes: works admired, considered, and released. The pass is a skill. It requires knowing that admiration is not the same as desire, and that a work can be excellent and still wrong for the question your collection is asking. We watch collectors develop this muscle, and the moment it arrives is unmistakable: they start leaving shows empty-handed and happy, talking about a single work rather than surveying everything.\n\nThere is a practical side to the pass as well. Attention and budget are both finite. Every acquisition closes doors, and the collectors who understand this buy slowly, on purpose, with a confidence that reads from across the room. They are not the people who buy the most. They are the people whose walls you remember.\n\nOne last practical note, because it comes up in nearly every conversation: insure the collection as it grows, and review the cover yearly. Works outgrow their first valuations quietly, and the moment to discover that is not after a leak or a move. A named-items policy costs less than people expect and buys a kind of calm that lets the collection stay what it should be, a source of pleasure rather than a ledger of worries.\n\n## Begin where you are\n\nIf you own one work you love, you already have a collection of one, and the question is what it asks for next. If you own nothing yet, you have the rarest advantage in collecting: a clean wall and an unwritten question. Come and look. Tell us what stopped you and what did not. The intentional collection is not built by people with more money or more confidence. It is built by people who kept asking what they wanted to live with, and waited for the work that answered.",
  "published": true
 },
 {
  "title": "The Shape of Memory",
  "slug": "the-shape-of-memory",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-19.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-08-07T05:16:28.958Z",
  "readingTime": 10,
  "type": "Studio Visits",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## What the work remembers\n\nEvery artist works twice: once in the studio, and once in the long archive of their own past. The second labour is invisible but it shapes everything the first one touches. The strongest work in the gallery this year carries memory not as subject matter, something depicted, but as structure, the way the image is built. To look at these works properly, you have to understand how memory itself behaves: not as a recording, but as a reconstruction, reassembled each time it is called on, altered a little by every act of remembering.\n\nThat distinction is the key to a whole strain of contemporary Indian practice. The artists here are not illustrating their pasts. They are rebuilding them, with the distortions left in, and the distortions are where the truth lives.\n\n## The object that holds the person\n\nStart with the things. Kabir Anand's Grandfather's Radio is, on its surface, a portrait of an appliance: a wooden-cased radio, lovingly observed, every dial and grille rendered in pigment and graphite with a draughtsman's patience. But nobody stands in front of it and thinks about radios. Visitors talk about their grandfathers. They talk about specific rooms, specific hours of the day, the particular gravity of a house where news arrived through a single warm valve. Anand has said in conversation that he drew the radio from memory rather than from the object, which survived, and that the drawing is wrong in several particulars. The wrongness is the work. Memory does not retrieve the radio. It retrieves the listening.\n\nIshani Roy works the same seam with figures. Three Women, One Umbrella is small, just 28 by 38 centimetres, and it stops people across the full length of the gallery. The three women are pressed together under a single umbrella in weather you can almost feel, and the intimacy of the huddle is rendered with such specificity that viewers routinely insist they have seen these exact women, in this exact rain. They have, of course, seen their own aunts, their own mothers, their own neighbours. Roy's figures are built from the composite memory of a Bombay childhood, and they are general in the precise way that makes them universal. The smaller the work, the larger the crowd it contains.\n\n## Houses, streets, and the architecture of recall\n\nMemory lives in places before it lives in people. Avni Rao's Her Mother's Shawl is ostensibly a portrait of a textile, oil on linen, and the shawl is painted with the attention usually reserved for faces: the drape, the worn border, the particular red of a dye that has survived forty winters of careful washing. The mother is not in the picture. She does not need to be. The shawl holds her shape the way a held coat holds warmth, and Rao's brushwork, loose at the edges, exact at the folds, mirrors exactly how recall works on us: sharp at the point of contact, soft everywhere else.\n\nNeel Kapoor takes the architecture head-on. Aunts at a Wedding gives us the interior of a Bangalore house in full celebration, but the eye keeps sliding off the figures and onto the house itself: the mosaic floor, the swing, the doorway through which more light and more aunties are arriving. It is a wedding picture in which the building is the bride. Kapoor understands that we remember rooms more faithfully than we remember faces, and he builds the picture accordingly. The Typewriter Repair does the same with a commercial street, the little shop where a machine is coaxed back to life, and collectors who grew up in pre-digital India stand before it with the stillness of people hearing their own pulse.\n\n## The coastline of forgetting\n\nZoya Merchant's work asks the harder question: what happens to memory when the place itself is dissolving? Marine Drive, Dissolved is a recent archival pigment print, and the title is the thesis. The great curve of the bay is present, the art deco line of the buildings is present, but everything is in the process of slipping, detail draining out of the image like tide going out through sand. It is a picture of a city remembering itself with effort. Night Swimming, an oil from 2019, approaches from the other side: memory as immersion, the dark water of a remembered night closed over the swimmer's head, the city reduced to a distant smear of light. Collectors respond to these works with an intensity that surprises them. We think it is because the works are honest about the fact that remembering and losing are the same gesture, performed slowly.\n\nAarav Sen's A Field of Small Hours makes the same point in miniature. The pigment and graphite surface is built from dozens of small incidents, none of them resolved, like a mind turning over the day's unimportant moments at 3 a.m. It is one of those works that looks different every time you return to it, because you bring a different store of your own small hours each time.\n\n## The archive beneath the image\n\nNot all memory-work begins inside the artist's own head. A growing number of the strongest practitioners start in other people's archives: family albums found at flea markets, wedding photographs from studios that closed decades ago, boxes of negatives nobody claimed. Nikhil Bose is the gallery's clearest example. Harbour Wedding is an archival pigment print built from a found photograph, a wedding party on a Kochi jetty sometime in the middle of the last century, and Bose's intervention is subtle to the point of invisibility: he enlarges, he crops, he adjusts the tonal weather, and the photograph begins to release what it always held. The strangers in the picture remain strangers, but they become legible. You know how the day felt.\n\nThe Card Players does the same with an interior: four men around a table, cards suspended mid-trick, a fan barely keeping up with the afternoon. The source photograph was anonymous in both senses, author unknown, subjects unnamed. Bose treats that anonymity as a material. By refusing to invent identities for the figures, he keeps the image honest, and the honesty is what viewers feel. It is their own family's unnamed photographs looking back at them. Every Indian household keeps a box of these. Bose's work is what the box would say if it could.\n\nThis archival turn raises real questions, and the gallery does not dodge them: questions of consent, of privacy, of who owns a stranger's remembered afternoon. The artists take the questions seriously. The figures in these works are not exposed or explained; they are sheltered by the work's attention. There is a difference between using someone's image and keeping it company, and the difference is visible on the wall.\n\n## The memory we share\n\nPersonal memory is only half the story. The other half is the memory a city holds collectively, the weather a whole generation breathed without remarking on it. Arjun Vadehra has made this his ground. Winter Sun, Barakhamba is a Delhi painting about a Delhi experience so common that nobody had thought to paint it: the low, amber, particulate sunlight of a north Indian winter afternoon, falling through the roundabouts of the imperial plan. Every Delhi-raised viewer recognises it instantly, with the jolt of a memory they did not know was stored. Dust Halo and Ash and Meridian extend the project into abstraction: the city's air itself as a medium, its haze given shape and, improbably, tenderness.\n\nKabir Anand's Old Delhi Postman belongs to this register too. The postman is a portrait, but the painting is really about a vanished system, the human network that carried letters through the lanes, and the particular social gravity of the man who knew everyone's news before they did. When it hung in the gallery last season, visitors kept telling the same story in different accents: the postman of their own childhood, the bicycle, the bag, the gossip. A single canvas became a meeting point for a hundred private archives. That is what collective memory looks like when an artist gives it a door.\n\n## How the artists check their facts\n\nOne of the pleasures of working closely with memory-based artists is watching them interrogate their own recall. Anand sketches from memory, then checks the sketch against surviving objects, then, and this is the important part, keeps the discrepancies he prefers. Rao photographs her mother's shawl, then paints without the photographs, then compares, then abandons the comparison. The method varies, but the principle is constant: memory is consulted as an authority, not corrected as a witness.\n\nThis matters because it inverts the usual hierarchy of the real. A photograph of the radio would be more accurate. The painting is more true. Accuracy belongs to the object; truth belongs to the relationship, and the relationship is what the work is about. Collectors who understand this stop asking what a work depicts and start asking what it holds, and the second question is the beginning of connoisseurship in this field.\n\n## Why this work matters now\n\nThere is a reason memory has become load-bearing in Indian art at this particular moment. The country is changing at a speed that erases the raw material of recall: neighbourhoods, trades, house types, whole textures of daily life, gone within a generation. The artists doing this work are, among other things, running an archive of the senses. But to call the work preservation would undersell it. Preservation fixes things in place. These artists are doing something more alive: showing us what the past looks like from inside a moving present, distorted, tender, and true.\n\nIt is worth adding that memory-work asks something of its audience that spectacle does not: time. These pictures do not detonate. They seep. The first viewing gives you the surface; the fifth gives you the structure; the twentieth gives you yourself, caught mid-remembering in front of someone else's. We have learned to leave extra chairs near the Roys and the Anands, because visitors sit down in front of them without deciding to. In a gallery culture built on movement, stillness is the review that matters most.\n\nFor collectors, memory-work offers a particular kind of companionship. These are not pictures you finish. They meet you at whatever stage of your own remembering you have reached, and they change as your own past changes shape. A Roy or an Anand bought at thirty is a different work at fifty, not because the surface has altered but because you have. Few categories of art reward long ownership so directly.\n\n## Living with the remembered\n\nOne caution, offered honestly: memory-work can be misread as nostalgia, and the misreading flattens it. Nostalgia wants the past back, whole and improved. These artists want something harder: to keep the past in motion, unfinished, still capable of surprising the people who carry it. The works are warm, but they are not soft. Look longer and the warmth has an edge, the recognition of everything the remembered world got wrong, everyone it left out. The best of these pictures hold affection and judgement in the same frame, and that double exposure is what lifts them from sentiment into art.\n\nPractically, memory-work asks for intimate hanging: eye level, good soft light, rooms where people sit rather than pass through. These are works for the study, the reading chair, the end of the hallway where the house goes quiet. They reward closeness, and they repay it for decades.\n\nThe deeper point is one the gallery believes in completely: a home hung with memory-work becomes a place where remembering is practised, daily, without sentimentality. The works hold their makers' pasts. Gradually, without any decision on your part, they begin to hold yours too. Guests will notice. Not immediately, and never as a remark about the art, but as a remark about the house: that it feels inhabited, layered, somehow older than its years. That feeling is the works doing their job.\n\nThat is the shape of memory, and it is the shape of the best rooms we know.",
  "published": true
 },
 {
  "title": "On Hanging Work at Eye Level",
  "slug": "on-hanging-work-at-eye-level",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-23.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-07-26T05:16:28.958Z",
  "readingTime": 11,
  "type": "Artist Stories",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The most consequential four centimetres in your home\n\nAsk a museum registrar where a painting belongs and you will get a number, not an opinion: the centre of the work sits at 145 centimetres from the floor, give or take a few, because that is where the average standing adult's eyes actually are. The rule sounds bureaucratic. It is anything but. Those few centimetres decide whether a work meets you or floats above you, whether a room feels arranged or feels right, and whether the art you chose with such care is ever really seen.\n\nThis essay is about that number, when to follow it, and, just as importantly, when to break it well.\n\n## Why the rule exists\n\nThe 145-centimetre convention did not come from decorators. It came from looking. Nineteenth-century salons hung work floor to ceiling, stacked like brickwork, and the paintings at the top simply died there, unseen, straining necks until everyone stopped trying. The modern museum solved the problem by hanging a single line of work at the viewer's eye, and the discovery was immediate: people looked longer, remembered more, and complained less about sore feet. The rule is really a finding. Art is encountered by a body, and the body has a height.\n\nAt home the stakes are the same. Hang a work too high and it becomes architecture; visitors register it the way they register cornices. Hang it at eye level and it becomes a person in the room, something with a gaze to meet. Neel Kapoor's Cubbon Park Readers, at 76 by 102 centimetres, demonstrates this beautifully: hung with its centre at 145, the readers sit across from you like companions on the next bench. Hung even twenty centimetres higher, they become a frieze, and the friendship is over.\n\n## The exceptions that prove it\n\nRules this simple collect exceptions, and the exceptions are where connoisseurship begins.\n\nOver furniture, the rule bends. A canvas above a sofa or sideboard wants a relationship with the object beneath it, usually fifteen to twenty-five centimetres of air between frame top and furniture line, even when that pulls the centre above 145. The trick is to keep the work low enough that it still belongs to the people in the room rather than to the ceiling. Zoya Merchant's Glass Harbour, 100 by 80, over a console: the bottom edge sits a hand's width above the surface, and the print reads as part of a composed still life rather than as something that happens to be nearby.\n\nVery tall works rewrite the rule entirely. A canvas like Tara Menon's The Green Hour, 150 centimetres tall, cannot centre at 145 without brushing both floor and crown; instead, hang it so the compositional centre, not the geometric one, meets the eye. Every serious painting has a point where its weight gathers. Find that point by standing back, and let it, not the tape measure's midpoint, make the decision.\n\nThen there is the salon hang, the deliberate return of the stacked wall, and it works precisely because it breaks the rule as a group rather than by accident. A tight grid of small works, a wall of Reva Das's pigment-and-graphite pieces, say, hung with consistent five-centimetre gaps, reads as a single large composition. The eye forgives the high pieces because the wall itself has become the artwork. What it will not forgive is a single small frame floating at two metres with nothing around it: not a statement, just a mistake with a nail in it.\n\n## Rooms have eyes too\n\nEye level is not one number; it is a posture, and posture changes by room. In hallways and living rooms, people stand, and 145 holds. In dining rooms, people sit, and a work meant to accompany long dinners should drop toward the seated eye, around 120 to 130 centimetres. Studies and reading chairs ask for the same courtesy. We have rehung more dining rooms than any other kind of room, and the change is always audible: conversation about the work begins the evening it comes down to meet the table.\n\nChildren's sightlines are the exception nobody plans for and everybody should. A home where the youngest viewer is ninety centimetres tall is a home with two eye levels, and the collectors who handle this best do not lower the art. They place one work deliberately low in a corridor or stairwell, at true child height, and rotate it. The effect on children is disproportionate and wonderful: a picture that is theirs, at their height, met on their terms. Several of our collectors' children have developed fierce preferences about what hangs there, and those preferences are the beginnings of an eye.\n\n## Distance is the second dimension\n\nHeight decides how a work meets you; distance decides how it unfolds. The old gallery rule says the ideal first view happens at roughly twice the work's diagonal, and while homes rarely offer gallery distances, the principle survives translation: give every significant work one vantage point in the house from which it can be seen whole, unobstructed, without furniture in the way. For Ishani Roy's Local Train, 6:14, 150 centimetres wide, that vantage is about four metres back, which in most apartments means the opposite wall of the same room. Plan for it. Leave the sightline open. The painting will repay the courtesy every single day, because a work seen whole from across the room and closely from beneath it is two works, and you get both.\n\nCorridor hanging deserves a word here. Corridors offer no distance at all, so they suit small, intimate works, drawings, prints, works on paper, that are made for the arm's-length look. Maya Pillai's Tide Archive, at 38 by 56, is a corridor picture: you meet it the way you meet someone in a hallway, close and briefly, and it is scaled to make that meeting rich.\n\n## Groups, pairs, and the mathematics of gaps\n\nHanging one work well is arithmetic. Hanging several is composition, and composition has its own rules. For a pair, the two works become a single unit with a shared centre: hang them so the midpoint of the pair, not each frame, sits at eye level, with a gap of five to eight centimetres between, close enough that the wall reads as one statement. Kabir Anand's The Chess Lesson and Held Breath, both 76 by 102, make a natural pair; hung together they argue quietly about fathers and attention, and the argument needs them near.\n\nFor grids, the discipline is the gap. Same frames, same gaps, relentlessly: five centimetres is the gallery standard, measured with a spacer cut from card, never by eye. A grid of nine small prints hung with identical gaps reads as confidence. The same nine with wavering gaps reads as a collection of accidents. For the looser cluster, the salon-style arrangement around a central anchor work, lay the whole thing out on the floor first, photograph it, and transfer the positions up the wall working outward from the anchor, keeping every gap between five and ten centimetres. The anchor hangs at eye level; the others orbit it.\n\nOne more number worth memorising: the relationship between works and doorframes, switches, and corners. Keep at least fifteen centimetres between a frame and any architectural interruption. Crowded edges make expensive work look anxious.\n\n## Frames change the height\n\nA frame is not a border; it is a lens, and it changes where the work's visual centre sits. A heavy, dark frame pulls the eye downward and outward, so a dark-framed canvas can hang a touch lower than the number suggests. A thin metal frame or a float mount releases the image upward, and the same canvas wants a few centimetres more height. Works on paper under museum glass add their own complication: the glass catches reflections, and the higher a glazed work hangs, the more ceiling it mirrors back at you. Keep glazed work at or slightly below the standard line, and check it from your actual chair in the evening, when lamps are on, because that is when reflections campaign for attention.\n\nStairwells are the final special case, and the rule there is rhythm, not level. Works rising along a stair should keep a constant relationship to the treads beneath them, climbing the way the handrail climbs, each frame's centre the same height above its own step. Hung that way, the stair becomes a processional, and the pictures are met one by one, at the eye level of a body in motion, which is the only eye level a stairwell has.\n\n## The mechanics, done properly\n\nNone of the above matters if the work is not safe. Indian homes present a familiar set of wall types, and each has its own etiquette. Reinforced concrete, the standard in city apartments, holds anything if you drill it properly: a masonry bit, wall plugs rated for the load, and two fixings for anything over five kilograms, always two. Brick beneath plaster is forgiving and strong. The enemy is the hollow partition, the drywalled or board wall that sounds empty when tapped; it will hold small works on proper cavity fixings, but a large canvas belongs on a structural wall, full stop.\n\nTwo fixings are not just about weight. They are about level. A work on a single point pivots; doors close, and the frame drifts a degree a month until the picture lists like a ship. Two fixings, levelled once, hold a work true for years. Add the small felt bumpers to the bottom corners and the frame sits parallel to the wall, air circulates behind it, and the slight shadow line the frame casts becomes even all the way round, which is one of those details nobody names and everybody sees.\n\nRenters, take heart. The era of the adhesive hook has matured; the best current systems hold surprising weight and remove cleanly, though we would still not trust them above a sofa anyone sleeps under. For serious work in a rental, lean larger pieces. A 150-centimetre canvas leaning on a low cabinet, anchored discreetly at the top with a single security fixing, is a legitimate, even elegant, presentation, and it has a long history in artists' own homes.\n\n## Light, briefly, because it cannot be separated\n\nA hanging decision is a lighting decision. The same 145-centimetre centre that meets the eye also determines how light falls across the surface, and the two must be planned together. Picture lights want the work's centre slightly below the lamp's throw; angled ceiling spots want to hit the surface at roughly thirty degrees, steep enough to avoid glare, shallow enough to avoid shadows from the frame's top edge. Hang first with the light off, live with it for a day, then aim the light in the evening, when the room's true conditions show themselves. The collectors who get this wrong almost always aimed their lights at noon.\n\n## The walk test\n\nWhen a room is hung, we run one final check, and you should too: the walk test. Enter the room the way a guest does. Stop where a guest stops. Sit where you actually sit. From each position, ask the simplest question in connoisseurship: does the work meet me here, or am I meeting it? If you find yourself lifting your chin, the work is high. If you find yourself discovering it by accident, it may be hidden behind a sightline the room's traffic never crosses. Adjust in small increments, five centimetres at a time, and re-test. Bring a second pair of eyes if you can. Not for their opinion on the art, but for their height: eye level is personal, and a household of different statures needs a compromise everyone can live with. Rooms reach a point of rightness that is unmistakable, and it is almost always within four centimetres of where the museum registrar told you to start.\n\n## When to rehang\n\nA hanging is not a verdict; it is a draft. Live with a new placement for a fortnight before you consider it settled, because rooms reveal themselves over days, not hours. The morning light flatters what the evening light betrays. A work that sang in the gallery can go quiet at home, not because the work changed but because the room is asking for something slightly different: three centimetres lower, a half-step to the left, a wall with more silence around it. Rehanging is not an admission of error. It is the last stage of the purchase, and the collectors who treat it that way end up with rooms that feel inevitable.\n\n## What eye level really means\n\nStrip away the numbers and the rule is a piece of respect. Hanging at eye level says the work is a presence to be met, not an ornament to be glanced at, and the house reorganises itself around that courtesy. The sofa turns a few degrees. The reading chair migrates. People slow down in the corridor. None of this requires money, only attention: a tape measure, a level, two fixings, and the willingness to stand still and check.\n\nHang the work where your eyes actually live. Everything else in the room, and most of what matters in living with art, follows from that one decision.",
  "published": true
 },
 {
  "title": "Paper, Pigment, Patience",
  "slug": "paper-pigment-patience",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-02.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-07-14T05:16:28.958Z",
  "readingTime": 12,
  "type": "Collector Guides",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The quietest medium in the room\n\nIn every gallery hang, there is a hierarchy of attention, and it is usually wrong. The big canvases take the eye first; the bronzes take it second. The works on paper wait. They have always waited. And yet if you watch where serious collectors, curators, and artists themselves linger longest, it is so often in front of the small sheets: a drawing, a study in pigment and graphite, something on handmade paper that seems to be breathing faintly under the glass. Paper is the medium of patience, and patience, in art as in everything else, is where the depth is.\n\nThis is an essay about that medium: what it is, why it demands slowness from everyone who touches it, and why a collection without works on paper is a collection with a missing register.\n\n## What a sheet of paper actually is\n\nMachine-made paper is a surface. Handmade paper is a substance, and the difference matters more than any other fact in this essay. A handmade sheet begins as fibre: cotton rag, sometimes jute or hemp, beaten in water until the fibres fibrillate, split and fray at their ends so they will lock together. The pulp is lifted on a mould, couched onto felt, pressed, and dried, and every stage leaves evidence. The deckle edge, that soft, uneven rim, is the sheet's fingerprint. The slight variations in thickness are its heartbeat. When Neel Kapoor specified the fibre for Monsoon Veranda, he was not being precious. He was choosing the ground the way a singer chooses a room.\n\nThen comes sizing, the bath of gelatin or starch that decides how the sheet will receive what is put on it. A heavily sized sheet resists; pigment sits on top, crisp and bright. A softly sized sheet drinks; the pigment sinks in and the image seems to come from inside the paper rather than from its face. Kabir Anand's The Poet's Pause uses uneven sizing deliberately, so the graphite sinks in bands and floats in others, and the portrait seems to arrive through water. That effect cannot be painted. It can only be negotiated with the sheet, and the negotiation takes years to learn.\n\n## Pigment, the oldest technology\n\nPigment is ground colour, earth and mineral and sometimes leaf and insect, bound to the sheet with the lightest possible touch of medium. It is the oldest colouring technology humans possess, and it behaves accordingly: it does not dry so much as settle. Where oil paint sits on canvas in a skin, pigment on paper lives in the fibre, held by friction and sizing and nothing else. This is why works on paper feel the way they do, matte, breathable, with a colour that seems lit from inside the sheet rather than reflected off it.\n\nIt is also why they take time. Oil forgives; it stays wet, it blends, it can be scraped back. Pigment on paper keeps its own ledger. Every wash is final, every graphite line a commitment. Reva Das's Monsoon Ledger is built from dozens of passes, each one irreversible, and looking at it you can feel the accumulation of decisions, the way geological strata read in a road cut. There is no undo in this medium. There is only the next decision, made well.\n\nTara Menon's Canopy Study shows the partnership at its most exact: pigment first, a dense green weather of wash, then graphite laid over it like a surveyor's grid, mapping branch and interval. The two materials do different kinds of thinking. Pigment dreams. Graphite remembers. The picture is the conversation between them.\n\n## An old lineage in a young market\n\nNone of this is new, and the lineage is part of the value. Indian art on paper carries one of the longest continuous traditions anywhere: the miniature schools, where painters worked with single-hair brushes on burnished sheets, holding whole courts and forests in the span of a hand; the Company school, where Indian artists documented botany, trades, and festivals for colonial patrons with a precision that still startles; the Bengal school, which made paper the ground of a national reimagining; and the moderns, who drew relentlessly, often more freely on paper than they dared on canvas. When you buy a contemporary work on paper, you are buying into that river, and the artists know it. Kapoor's veranda and Anand's portraits are in direct conversation with the miniature tradition's intimacy: small fields, total attention, the world held at arm's length.\n\nThe tradition also explains the medium's particular authority in India. Paper here was never the poor cousin of canvas; it was the original ground, the support of the subcontinent's most exacting painting. The contemporary revival of handmade paper as a serious medium is not nostalgia for that history. It is a continuation of it, by artists who understand that a sheet made from cotton rag beaten in water is a different instrument from a sheet made by machine, and that the difference is audible in the finished work.\n\n## The patience of the maker\n\nSpend a morning with an artist who works on paper and the first thing you notice is the tempo. There is no flourish. Maya Pillai's Tide Archive works, built up from tide-line observations on the Kochi shore, accrete the way the shore itself does: line by line, deposit by deposit, at a pace that would look like idleness to anyone watching for drama. The drama is there, but it is compressed into attention. Her recent The Mending Net, at 84 by 110 centimetres, holds thousands of individual marks, each one a decision about pressure, and the net that emerges from them has the specific gravity of something repaired rather than something made.\n\nNikhil Bose's Two Figures at Dusk, on handmade paper, carries a different kind of patience: the patience of waiting for the exact density of evening. The sheet was stained and restained to hold a light that lasts perhaps twenty minutes in the world, and the figures stand inside it the way people actually stand at dusk, slightly relinquished by the day. You cannot hurry that kind of looking, and you cannot fake the surface that records it.\n\nAvni Rao's Rust Season begins before the drawing does: the paper is stained with iron, aged forward before a mark is made, so the ground of the image is already a meditation on time. Patience here is not just a working method. It is the subject.\n\n## A necessary distinction: drawings and prints\n\nOne clarification, because new collectors tangle these, and the tangle costs money. A work in pigment and graphite is unique: one sheet, one making, no siblings. An archival pigment print, for all the dignity of the phrase, is a fine-art print: the artist's image, printed under their supervision in a numbered edition, signed, and finite. Both belong in serious collections, but they are different goods at different prices, and the difference is scarcity, not sincerity. A print like Zoya Merchant's Glass Harbour gives you the artist's image at an entry point a unique work cannot; a unique sheet like Menon's Canopy Study gives you the hours of the making itself, unrepeated anywhere on earth.\n\nThe rule of thumb we give collectors: buy prints for images you love, buy unique works for artists you believe in, and never confuse the two at the point of sale. A good gallery will always tell you plainly which of the two you are looking at. If you are ever unsure, ask to see the edition number; prints carry one, drawings do not.\n\n## The patience of the viewer\n\nPaper asks something of the person looking, too, and it asks without apology: come closer. These are not works that perform across a room. They work at reading distance, the length of an arm, and they unfold in layers that only proximity reveals. The first layer is the image. The second is the surface, the sizing's thirst, the fibre's shadow. The third is time: the visible residue of the hours the making took. A collector once told us that living with a Pillai drawing was like living with a very slow clock, one that ticked in centuries. She meant it as praise, and it is precise.\n\nThis is why works on paper belong in the intimate rooms, the study, the bedroom corridor, the wall beside the reading chair, and why they reward the households that give them quiet. Hung well, they create zones of slowness in a fast house. Children, who have no respect for art-world hierarchies at all, understand this instantly: put a Kapoor paper work at their height and they will stand in front of it with a stillness they give to nothing else on the walls.\n\n## How to look at a work on paper\n\nBecause the medium is quiet, it helps to know how to approach it, and the approach is simple enough to describe. First, the room read: from across the space, take in the sheet as a whole, its tonal weather, the way it holds the wall. Second, the reading distance: step to arm's length and let the image resolve, the figures, the structure, the decisions. Third, and this is the step most viewers skip, the surface distance: come close enough to see the fibre, the sizing, the way a wash pools at its edge or a graphite line changes pressure mid-thought. This is where the medium keeps its secrets, and it is the distance museums assume and galleries forget to mention. Give a Menon or a Pillai those three distances, in that order, and the work will keep you for twenty minutes. We have timed it.\n\nNotice, too, what the artist has left alone. The empty margins of a sheet, the passages where the paper's own colour is the only mark, are decisions as deliberate as any line. In the miniature tradition the ground was the silence the painting rose from; in contemporary work on paper, the untouched sheet does the same work. Collectors who learn to see the silence start buying differently: less noise, more breath.\n\n## Caring for the medium\n\nPatience, in the context of ownership, is mostly just care performed slowly and consistently. Paper is vulnerable to three things: light, moisture, and acidity. Light first, because it is the one collectors underestimate. Ultraviolet fades pigment and embrittles fibre, and the damage is cumulative and irreversible, so works on paper want walls away from direct sun and, ideally, glazing with museum glass, which blocks nearly all UV and, as a bonus, nearly erases its own reflection. Rotate paper works if your rooms are bright; a season on the wall and a season resting in a dark portfolio is the rhythm museums use, and it costs nothing.\n\nMoisture second: paper breathes, and in humid climates it can cockle, that gentle rippling you sometimes see across a sheet. Mild cockling under changing humidity is the medium being alive, not being damaged, but persistent damp invites foxing, the brown spots of mould's early work. Keep paper off exterior walls in monsoon season, let air move behind the frame, and the sheet will outlast its frame many times over. Acidity third, and it is solved entirely at framing: acid-free mount board, acid-free backing, the work hinged rather than glued. Any framer who works with museums will do this as a matter of course; ask, and pay the small premium, because an acidic mount will stain a sheet from behind in a decade and the stain is forever.\n\nFramed this way, works on paper ask for almost nothing else. No varnish, no cleaning, no climate anxiety beyond ordinary good sense. The medium that demands the most patience from its makers demands the least fuss from its keepers, provided the fundamentals were done once, properly, at the start.\n\n## The market's quiet consensus\n\nA word about value, because it would be evasive to leave it out. Works on paper have historically traded below paintings of equal quality by the same artists, and collectors have historically treated this as a discount. It is better understood as an inefficiency. The very factors that suppress the category's prices, modest scale, perceived fragility, the absence of spectacle, are the factors that make it, for a living collection, the most rewarding register to buy in. Museums have always known this. Study the great collections and you find the works on paper were bought earliest, kept longest, and lent most reluctantly.\n\nThe category rewards the patient buyer twice: once at purchase, when quality is affordable in a way it rarely is on canvas, and once across ownership, as the works prove, year after year, that intimacy compounds. Ishani Roy's pigment-and-graphite works are the gallery's standing example: collectors who bought them early describe them now with the particular satisfaction of people who were right before the room agreed.\n\n## If you take one thing from this essay\n\nTake this: the next time you are in a gallery, any gallery, walk past the canvases first. Go to the small works, the sheets under glass, the drawings everyone else will get to later. Stand at the three distances. Watch how the artists in the catalogue you already admire, the Roys and the Anands and the Kapoors, put their very best thinking into the medium that asks the most of them and announces the least. The art world measures noise because noise is easy to measure. The history of art measures attention, and attention, in this medium, is the whole currency.\n\n## The register your collection is missing\n\nEvery collection we have helped build past its first few years has arrived at the same discovery: the walls needed a quiet voice. Not everything should announce. A home hung only with statement works is like a conversation in which everyone is talking at once, impressive and exhausting. Works on paper are the lower register that lets the rest of the collection speak: the pause between sentences, the held note under the chord.\n\nStart with one sheet, honestly framed, in the quietest room you have. Give it a month of mornings. We have watched this experiment run dozens of times, and it always ends the same way: the collector stops in the corridor more often, sits longer in the chair, and eventually calls to ask what else on paper we are holding. Paper, pigment, patience. The medium keeps its promises slowly, which is to say, completely.",
  "published": true
 },
 {
  "title": "What Provenance Tells You",
  "slug": "what-provenance-tells-you",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-06.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-07-02T05:16:28.958Z",
  "readingTime": 13,
  "type": "Exhibition Reviews",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The biography of an object\n\nEvery work of art has two lives. The first is the one you can see: the surface, the image, the presence on the wall. The second is invisible but just as real: the chain of hands and rooms and decisions the work has passed through since the day it left the studio. That second life is the work's provenance, and learning to read it is one of the most useful skills a collector can acquire, because provenance is not paperwork. It is the object's biography, and biographies tell you things that surfaces cannot.\n\nThe word itself is French, from provenir, to come from. What the work comes from, and whom, and where it has been since: that is the whole of it. But within that simple definition sits everything from authenticity to value to the quiet pride of knowing exactly what you own. This essay is about how to read that biography, what it can and cannot tell you, and how to make sure the works you buy begin writing theirs properly from day one.\n\n## What provenance is made of\n\nStrip the concept to its parts and provenance is a surprisingly concrete list. First, the work's origin: the artist, the date, and the documentation of its making. For a contemporary work bought through a gallery, this is the easy case, and it is one of the great underappreciated luxuries of buying living artists. The certificate of authenticity, signed by the artist or issued by the gallery on the artist's direct authority, anchors the chain at its source. There is no gap, no mystery, no missing decades. The work's life began yesterday and you watched it begin.\n\nSecond, the ownership chain: who has owned the work, in sequence, from the studio to you. For a first purchase this chain is short and clean, artist to gallery to collector, and it is recorded in the invoice, which is why the invoice is not a receipt to be filed and forgotten but the foundational document of the work's legal life. Third, the exhibition history: every show the work has appeared in, with dates and venues. Exhibition history is the work's public record, and it matters more than new collectors expect, because a work that has been shown is a work that has been seen, vetted, and written into the artist's story.\n\nFourth, publication: every catalogue, book, or serious review in which the work appears. A reproduced work is anchored in the literature, and the literature is forever. Fifth, the condition record: reports describing the work's physical state at points in time, which together show how it has been kept. A work that has lived its life in careful hands reads differently on this record than one that has been through damp storage and amateur framing, and the difference eventually shows up in the price, the insurability, and the work's own longevity.\n\n## The documents, one by one\n\nBecause the file matters, it is worth knowing what each document in it should contain. The certificate of authenticity is the anchor, and a proper one names the artist, the title, the date, the medium in full, the dimensions, and carries the artist's signature or the issuing gallery's stamp alongside a statement of the work's uniqueness or its edition number. A certificate missing any of these is a form, not a document. For editioned works, prints and photographs, the edition line is the certificate's whole point: the number of the impression and the size of the edition, in the artist's hand where possible, because edition integrity is the foundation of the print market's trust.\n\nThe invoice is the legal spine. It should describe the work with the same completeness as the certificate, name seller and buyer, date the transaction, and record the price, because the price is part of the work's history of value. File it with the certificate, never separately; the two documents corroborate each other, and together they are the first link of the ownership chain. The condition report, for any work of significant value, describes the surface honestly at the time of sale: the state of the canvas or sheet, the frame, any pre-existing marks. Read it before you buy, not after. Its purpose is not to alarm you but to give you the baseline against which every future change is measured, and against which every future insurer, appraiser, or buyer will judge your stewardship.\n\nExhibition catalogues and press cuttings round out the file, and they are the easiest documents to neglect because they feel ephemeral. They are not. The small catalogue from the artist's early solo, the review that reproduced your work, the invitation card with its image: each is a dated public anchor for the work's existence, and each becomes harder to find with every passing year. Collect them as they happen. Hindsight cannot.\n\n## How to read a provenance, and what the gaps say\n\nReading provenance is like reading a CV: the entries matter, but the gaps matter more. A continuous chain, studio to gallery to collector, documented at every step, tells you the work has been accounted for at every moment of its life. Gaps invite questions, and the questions are not paranoid. Where was the work between these two dates? Why did it change hands so quickly, three owners in four years? Why does the certificate date from years after the purchase it is meant to certify? In the older reaches of the Indian market, where mid-century works routinely surface with informal histories, family collections, old dealers long closed, these questions are the daily work of due diligence, and there are researchers and archives devoted to answering them.\n\nFor contemporary works, the red flags are different and simpler. Be cautious of certificates issued by third parties with no documented relationship to the artist. Be cautious of works offered without invoices, or with invoices that describe the work vaguely, because a vague description is a door left open for substitution. Be cautious, above all, of pressure. A seller who hurries you past the paperwork is telling you something about the paperwork. Good provenance survives slow reading. It is one of its defining properties.\n\nIt is worth saying plainly what provenance is not. It is not a guarantee of quality, plenty of dull works have immaculate biographies, and it is not, for contemporary work, primarily an anti-forgery tool, though it is that too. It is, at heart, the difference between knowing what you own and merely having it.\n\n## When the chain is already long: buying resale\n\nEverything so far describes the first purchase, but sooner or later every collector meets the secondary market, a work with previous owners, and the reading skills become load-bearing. For a resale work, ask for the full chain in writing before any money moves: the original purchase documentation, each subsequent transfer, and the current seller's own invoice. Verify what you can. A gallery that sold the work originally will usually confirm the fact from its records; artists and their studios can often confirm certificates issued in their name. Where an artist has a catalogue raisonné, the definitive scholarly listing of their works, inclusion is the strongest anchor the market offers, and the paperwork to request inclusion is worth the patience it takes.\n\nBe particularly careful with works that appear on the market implausibly soon after their first sale, works whose asking price bears no relation to the artist's current level, and works offered privately by sellers reluctant to be named in documentation. Each pattern has innocent explanations, and each deserves the questions anyway. The secondary market rewards the unhurried buyer and punishes, expensively, the charmed one. If a story about a work excites you more than the work itself does, that is the moment to slow down.\n\n## Why it changes the work's future\n\nProvenance compounds. The work you buy today with a clean, documented chain carries that clarity forward into every future transaction: resale, insurance, donation, inheritance. The collector who keeps records is not being fussy; they are building an asset's future liquidity and a family's future clarity. Insurers ask for documentation when you name a work on a policy. Appraisers ask for it when values are reviewed. Auction houses ask for it when consignments are considered, and the strength of the file shapes the estimate as surely as the strength of the image. Museums, should a work ever be offered or promised to one, conduct provenance review as a matter of course, and a thin file can stall a generous gift for years.\n\nThere is a subtler return, too, and we see it often: provenance deepens the owner's own relationship with the work. The collector who can tell you that their Menon print was shown in the artist's 2022 solo, reproduced in the exhibition catalogue, and acquired the week the show opened owns something richer than the person who cannot remember where the print came from. Same object on the wall. Different depth of possession. Provenance is memory with receipts.\n\n## The Indian context, honestly\n\nThe Indian market has lived through the full spectrum of provenance quality, and honesty requires saying so. The modern masters traded for decades in a market where documentation was casual, and the result is a legacy of contested attributions, works of uncertain parentage, and a professional class of researchers, archivists, and catalogue raisonné committees devoted to sorting the record. The lesson the market learned from that era is the lesson contemporary collectors get for free: document everything, from the start, while the start is still within reach.\n\nThe happy consequence is that buying contemporary Indian art today, through a serious gallery, is the cleanest provenance environment the market has ever offered. Artists are alive and reachable. Galleries keep digital records. Certificates are standard. The works in our own catalogue arrive with their documentation complete at the moment of purchase: certificate, invoice with full description and image, condition noted, exhibition history where it exists. The chain begins with links already forged. Your only task is not to break it.\n\n## Records that outlive institutions\n\nOne honest question new collectors rarely think to ask: what happens to the record if the gallery closes? The answer is that a well-kept personal file is precisely the insurance. The gallery's records, the artist's archive, and the collector's own folder are three independent witnesses, and the work's history is safest when all three agree, but the only witness you control is the third. This is also why the quiet digitisation of art-world records matters: galleries increasingly maintain searchable archives of every work sold, artists' studios log their output, and a work documented in several independent systems is a work whose history can survive any single institution's failure. Ask your gallery what records it keeps and for how long. A serious one will have a serious answer.\n\n## Your part: keeping the record alive\n\nThis is where the essay turns from reading to writing, because from the moment of purchase, the provenance is yours to keep. The habits are simple and they are best formed early. Keep every document the gallery gives you, and keep it in two places, physical and digital. Photograph the work in your home, dated, so its condition over time is a matter of record. If the work is lent, shown, reframed, restored, or moved into storage, note it. If you sell or gift the work, pass the file on, complete, because that is what keeps the chain unbroken, and the unbroken chain is what protects the work's value for everyone who will ever own it, including, perhaps, your own grandchildren.\n\nCollectors sometimes ask whether all this is really necessary for a first purchase, a modest work, an early-stage collection. The answer is that it matters most exactly then, because habits are cheapest at the beginning. The collector of three works who keeps perfect records becomes, without effort, the collector of thirty works whose file is the envy of the auction house. The one who does not spends years, eventually, reconstructing what a folder would have preserved.\n\n## Gifts, inheritance, and the file your family inherits\n\nCollections outlive collectors, and the provenance file is, in the end, a letter to whoever comes next. Families inherit works with surprising frequency and understand them with surprising rarity: the painting above the sideboard is familiar as furniture and opaque as property. Which artist? Bought when, from whom, for how much, worth what now? A complete file answers every one of those questions in the collector's own absence, and the difference it makes is not sentimental at all. It decides whether the next generation can insure the work, sell it fairly, donate it credibly, or simply know what it is they love.\n\nEstate conversations with advisors routinely surface the same regret: works of real value whose records were never assembled, forcing families into expensive authentication and appraisal work that a folder would have made unnecessary. If your collection has grown past a few pieces, a simple inventory, one page per work with its documents scanned alongside, is an afternoon's task and a generation's gift. Some collectors add a line in their own words about why each work was bought. That line is not provenance in the strict sense. It is better: it is the part of the biography only you could write, and it is the part the family will read first.\n\n## A short story the file tells\n\nHere is what complete provenance looks like in practice, from a work we placed several years ago. The certificate, signed by the artist at the studio visit where the work was reserved. The gallery invoice, issued the same month, describing the work to the centimetre. The catalogue of the group show where it hung the following spring, the work reproduced on page eleven. A condition report from a routine reframing two years later, noting the surface unchanged. And, this year, a note from the collector recording the work's loan to a friend's curated apartment exhibition, with photographs of it installed. Five documents, eight years, one unbroken thread. Should that work ever change hands, its next owner will know it the way you know a person you have corresponded with for years. That is the standard. It is not exceptional; it is simply what happens when nobody breaks the chain.\n\nIt is also worth knowing that the habit of documentation changes how you buy. Collectors who keep files start asking better questions at the point of purchase, because they know what the file will need. The questions improve the purchases. The purchases improve the file. The loop is one of the quiet engines of connoisseurship, and it begins with a single folder.\n\n## What provenance tells you, finally\n\nStrip it back and provenance tells you three things. It tells you the work is what it claims to be. It tells you the work has been cared for, or not. And it tells you that the object on your wall is not an anonymous commodity but a specific thing with a specific past, anchored in time and signed by its passage through the world. That third thing is not sentiment. It is what distinguishes a collection from a decoration scheme, and it is available, free, to every buyer who simply asks for the documents and keeps them.\n\nOne final reassurance for the collector just starting out: none of this requires expertise, and none of it requires money. It requires only the decision to treat each work as something with a future as well as a present. The galleries, the artists, the insurers, and the auction houses all play their parts. Yours is the smallest and the most important.\n\nAsk, keep, record, pass on. The work will do the rest.",
  "published": true
 },
 {
  "title": "Kochi After the Biennale",
  "slug": "kochi-after-the-biennale",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-10.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-06-20T05:16:28.958Z",
  "readingTime": 14,
  "type": "Market Insights",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The city between editions\n\nEvery two years, the art world remembers Kochi. The Kochi-Muziris Biennale opens in December, the warehouses of Fort Kochi fill with installations, the ferries fill with curators, and for four months this old harbour town becomes, by general agreement, the most interesting place in India to look at art. Then the edition closes. The international visitors fly home, the pavilions come down, the attention moves on to the next fair, the next city, the next season.\n\nThis essay is about what remains. Because the Biennale's real achievement is not what happens during its editions. It is what the editions left behind: a city that makes and looks at art all year, in the long unwitnessed stretches between the world's visits, and a group of artists whose work has been shaped, quietly and permanently, by living at the intersection of a global event and an intensely local life.\n\n## What the Biennale actually changed\n\nIt is easy to forget how unlikely the whole thing was. When the first edition opened in 2012, sceptics asked whether India could sustain a biennale at all, let alone one in a town of heritage warehouses and spice godowns at the country's southwestern edge. The answer turned out to be yes, emphatically, and the deeper answer was that Kochi was never an arbitrary choice. The city has been a trading crossroads for six centuries: Portuguese, Dutch, British, Jewish, Chinese, Arab, and Gujarati presences layered over the Malabar coast's own cultures, all of it visible in the architecture, the food, the waterfront's Chinese fishing nets silhouetted against the evening. A biennale did not import cosmopolitanism to Kochi. It gave the city's existing cosmopolitanism a stage.\n\nThe effects compounded in ways nobody quite planned. Warehouses that might have been demolished became venues and were saved. A generation of Keralite schoolchildren grew up treating contemporary art as a normal civic presence, something their city does, the way other cities do cricket or cinema. Local patronage, modest at first, developed an appetite. And artists who might have drifted to Delhi or Mumbai for infrastructure found a reason to stay: an audience, a context, and a peculiar quality of light and time that the coast gives and the metros cannot.\n\n## The infrastructure that stayed\n\nThe Biennale's founding was itself a statement about where art gets made: two artists, Bose Krishnamachari and Riyas Komu, both Keralites, built the institution rather than waiting for one, and the artist-led character has marked every edition since. But the more durable legacy is physical and institutional. Aspinwall House, the sprawling nineteenth-century compound on the Fort Kochi waterfront that serves as the main venue, proved that the city's heritage warehouses could hold world-scale exhibitions, and the proof changed how the whole district valued its buildings. Pepper House, another restored godown, keeps a cafe, a residency, and exhibition spaces running year-round. David Hall, the Dutch-era bungalow turned gallery, programs shows long after the pavilions close. Durbar Hall in Ernakulam, across the water, gives the mainland city a serious exhibition hall. Kashi Art Gallery, in its converted house off the Fort Kochi tourist trail, has been showing contemporary work and feeding artists since before the Biennale existed, and it remains the place where the local art world actually talks.\n\nThis is the part of the biennale model that rarely gets discussed: the event is temporary by design, so its value has to be measured in what persists. By that measure Kochi's return has been remarkable. A district that had a handful of art spaces before 2012 now has an ecology of them, with audiences to match, and the ecology runs on a twelve-month calendar, not a four-month one.\n\n## The light, first of all\n\nAsk the artists what keeps them and they will eventually all say the same thing, though they say it differently: the light. Kochi's light is maritime and humid, diffused through high moisture, and it behaves unlike the light of anywhere else in the country. It arrives sideways off the water in the morning, goes white and merciless at noon, and spends the long evenings turning amber, then rose, then a particular dense green-grey that locals recognise as the colour of the last hour before the sea breeze. Tara Menon has built an entire practice inside that last hour. The Green Hour, the largest of her canvases in our catalogue, is named for it directly, and Backwater Chromatics pursues the same register into the backwaters, where the light arrives doubled, once from the sky and once off the water.\n\nMenon's works are often described as landscapes, and they are, but the description misses their method. These are not views. They are durations. The pigment is layered to hold the way coastal light changes over an hour of looking, so the painting shifts as you stand before it the way the evening shifts as you stand in it. Collectors who hang Menon's work in dry northern cities report the same phenomenon: the room develops weather. That is not atmosphere in the vague sense. It is a specific coastal climate, transplanted.\n\n## The harbour's memory\n\nIf Menon works the light, Nikhil Bose works the record. Kochi's harbour is one of the most photographed places in India, and it has been photographed for over a century, which means the city possesses something rare: a deep visual archive of itself. Bose mines that archive. Harbour Wedding, built from a found photograph of a wedding party on a Kochi jetty in the middle of the last century, and The Card Players, from an interior of the same era, are works of salvage as much as art. The jetty in the photograph still exists. The wedding clothes, the ferry, the quality of a harbour afternoon before the container port changed the water's traffic: those survive only in images like these, and in what artists make of them.\n\nBose's newer work has turned from the archive to the living waterfront. The Net Menders, an oil completed this year, paints the men and women who repair the fishing nets along the shore, a trade as old as the harbour and as contemporary as tomorrow's catch. There is a directness to it that the archival works deliberately lacked: no mediation, no found frame, just the painter standing in the same light the menders work in. Vermilion Afternoon and Afterimage, a cast bronze, extend the same attention into abstraction and three dimensions. Taken together, the practice amounts to a single long project: a portrait of a working harbour across a century, made by someone who lives inside the picture.\n\n## An older visual culture underneath\n\nIt would be a mistake to credit the Biennale with inventing Kochi's visual life, because the coast has been making images for far longer than contemporary art has existed. Kerala's temple mural tradition, with its distinctive palette and its figures built from pure colour, runs back centuries. Theyyam, the ritual performance tradition of the northern districts, is one of the most visually complete art forms anywhere: costume, face-painting, fire, and choreography fused into a single act of transformation. The churches and mosques and synagogues of the coast carry their own long image-histories, and Mattancherry's Paradesi synagogue, with its willow-pattern floor of hand-painted Chinese tiles, is a one-room lesson in how global this harbour's visual culture has always been.\n\nThe contemporary artists working in Kochi today are not working on a blank shore. They are the newest layer of a very old stratigraphy, and the best of them know it. You can feel the mural tradition's confidence with flat colour in the background of Menon's greens, the ritual arts' understanding of transformation in Pillai's castings of one material into another. The Biennale did not bring art to Kochi. It brought a new audience to a city that had been looking at itself, with great sophistication, for a very long time.\n\n## What the water remembers\n\nMaya Pillai's work starts where the land gives out. Her materials are the coast's own: coir, salt, laterite, the red stone that the whole of Kerala's older architecture is built from. Coir and Salt, standing 120 centimetres, is bronze that behaves like rope; Laterite Psalm is bronze that behaves like the stone cliffs north of the city. The casting process is a kind of translation, ephemeral coastal stuff given permanent form, and it mirrors what the Biennale itself did for the city: took something local and perishable, a harbour culture, a quality of attention, and cast it into something durable.\n\nHer works on paper come at the same coast from the intimate end. Tide Archive records the shore's daily negotiation with the sea in pigment and graphite, and The Mending Net, at 84 by 110, holds thousands of marks that read, from a distance, as the mesh of a repaired net and, from close up, as a meditation on maintenance, the unglamorous, essential labour of keeping things whole. It is hard to look at Pillai's work for long without concluding that it is about the Biennale's central lesson too: culture, like a net, survives by being mended, not by being replaced.\n\n## Avni Rao and the interior coast\n\nThe fourth member of the gallery's Kochi constellation works furthest from the water, and in some ways closest to the city's heart. Avni Rao paints interiors and street life: Spice Sellers, Morning, with its heaped chillies and turmeric rendered in a palette the market itself mixed, and Her Mother's Shawl, the portrait of a textile that holds a person the way the city holds its layers. Rao's Kochi is the one the biennale crowds walk through on their way between venues and rarely see: the working Mattancherry streets, the spice godowns whose smells are older than any nation that claimed them, the houses where four religions' festivals share a single lane.\n\nRust Season, her recent work on handmade paper, is the most Kochi object in the catalogue in one specific sense: it is stained with iron, pre-aged before a mark was made, in a city where the sea air corrodes everything metal within sight of the water. Rust is not decay in Rao's hands. It is the local colour of time.\n\n## Between editions: the year-round city\n\nSo what does the art city look like in the long months when the world is not watching? Smaller, steadier, and, the artists will tell you, more honest. The galleries that stayed open after 2012 learned to program for the people who actually live there: school groups, harbour families, the growing class of Keralite professionals who buy work for their homes. Studio visits, which during a biennale are impossible, become the city's real cultural currency. A collector who visits Kochi in an off year and spends two days moving between studios will see more, and understand more, than a week of pavilion-hopping ever delivered.\n\nThere is also the matter of what an off-season visit does to the eye. During an edition, attention is managed: routes, maps, must-see lists, the gentle tyranny of the curated itinerary. Between editions, attention is your own again. You notice the way the rain sits on the godown roofs, the exact blue of the harbour at four in the afternoon, the smell of ginger drying in a Mattancherry yard, and you begin to understand that the artists were never depicting these things. They were collaborating with them. The city's textures are not the background of the work. They are half the authorship.\n\nThe rhythm has its own pleasures. The monsoon months, when the Biennale would never schedule, are when the coast is most itself: the rain arrives in walls, the harbour goes slate-grey, and the studios, by all accounts, do their best work. Menon's rain pieces, Rain Chorus among them, could only have been made by someone who watched the monsoon arrive over water for years. There is a lesson in that for anyone who thinks of art cities as event venues. The event is the advertisement. The city is the content.\n\n## The collector's Kochi\n\nFor collectors, the post-Biennale Kochi offers something the market's bigger centres struggle to match: proximity. In Delhi or Mumbai, an artist's practice is mediated by layers of infrastructure. In Kochi, you can stand in the studio where the work is drying, walk the jetty that appears in the painting, and buy the piece with the harbour's salt still, metaphorically and occasionally literally, on it. Works bought this way carry their context with them forever. The Menon canvas on a Delhi wall is not an escape from Kochi. It is a window back into it, opened daily.\n\nStay in Fort Kochi itself rather than on the Ernakulam side; the heritage hotels and restored merchant houses put the whole district on foot, and the morning walk to the water, before the heat, is when the place shows you what the artists see. Take the ferry across at least once, at dusk, with the commuters, because the crossing is the city's daily painting and it runs every few minutes for a few rupees. End at the fishing nets as the light goes. Every visitor does, and it does not matter: the sight earns its cliché fresh each evening, and after three days you will understand why a painter would give a career to that hour.\n\nEat where the artists eat, ask your studio hosts, and you will be directed well. The district's cafes, several of them attached to galleries, have long perfected the art of the slow afternoon, and some of the best studio introductions in Kochi happen not by appointment but across a shared table. This is a city that still runs on conversation. Budget time for it.\n\nPracticalities, briefly. Kochi rewards the slow visit: two full days minimum, one for Fort Kochi and Mattancherry, one for studios by appointment. The gallery arranges studio introductions for serious collectors, and the artists are, without exception, more generous with their time in the quiet months. Shipping from Kochi to anywhere in the country is routine; the works travel crated, insured, and documented, and the coastal humidity does not travel with them. What does travel is the light. That, collectors tell us, is the whole point.\n\n## Why this matters beyond Kochi\n\nThe Kochi story has become a reference point for a wider argument in Indian art: that the country's cultural life does not have to be centralised to be serious. Before 2012, the assumption ran that ambitious art happened in Delhi and Mumbai and was exported outward. Kochi reversed the flow, and the reversal held. A harbour town at the country's edge built the subcontinent's most significant recurring exhibition, kept it artist-led, and used it to strengthen, rather than replace, its own local scene. Other cities have studied the model, and several have tried to copy it. The lesson most of them miss is the one this essay has been circling: the Biennale worked because Kochi was already the kind of place it is. The event amplified the city. It did not invent it.\n\nFor the artists, the meaning is simpler, and one of them put it to us in terms we have not been able to improve on: the Biennale taught Kochi that the world would come. The years since have taught the world that Kochi would still be working when it left. Both lessons were necessary. The second one is the reason the work in our catalogue looks the way it does.\n\nOne more observation, because it bears on how the work should be lived with elsewhere: Kochi art travels unusually well. Perhaps it is the humidity baked into its making, perhaps the palette of water and laterite, but these works have a way of changing the climate of dry, air-conditioned rooms a thousand kilometres inland. Collectors in Delhi and Bengaluru tell us the Kochi pieces on their walls are the ones guests ask about first. The harbour, it turns out, is portable, and it never quite stops working on you.\n\n## After the attention\n\nEvery biennale city faces the same test when the edition ends: whether the attention left anything behind that can stand on its own. Kochi passes the test more completely with each cycle, and the evidence is not in the visitor numbers or the press clippings. It is in the work. Four of the strongest practices in our gallery are made in this city, in the unwitnessed months, out of light and archive, water and stone. The Biennale gave Kochi a stage. The artists gave it a reason to keep one.\n\nCome between editions. The warehouses are quieter, the ferries are emptier, and the city is making art the way it mends nets: steadily, locally, and with every intention of still being at it, at full strength, the next time the world remembers to look.",
  "published": true
 },
 {
  "title": "Light and the Private Collection",
  "slug": "light-and-the-private-collection",
  "subtitle": "A considered view of artists, objects, and the rooms they transform.",
  "coverImage": "/art/work-14.jpg",
  "author": "Atelier Arc Editorial",
  "publishedAt": "2026-06-08T05:16:28.958Z",
  "readingTime": 15,
  "type": "Studio Visits",
  "tags": [
   "collecting",
   "contemporary art"
  ],
  "content": "## The element nobody buys\n\nA private collection is usually described by what it contains: the artists, the periods, the works. Almost nobody describes the element that decides, every single day, whether those works live or merely exist. Light. It is the medium in which all the others are perceived, the one component of a collection that touches every object without being an object itself, and it is, in our experience, the single greatest point of difference between collections that sing and collections that sit in silence.\n\nMuseums treat light as a science and a budget line. Homes inherit light by accident and adjust it by habit. This essay is an argument for treating the light in your home as part of the collection itself: something chosen, maintained, and revised with the same care as anything on the walls.\n\n## How works of art actually receive light\n\nBegin with the physics, briefly, because the physics has opinions. A painting is not an image. It is a surface, and a surface shows you what light allows it to show. The same canvas under different light is, in every meaningful sense, a different object. The varnish deepens or flattens. The impasto casts its own small shadows or disappears into a single plane. The colours shift their relationships: under warm light the ochres advance and the blues retreat; under cool light the reverse. Artists know this intimately. A canvas painted under north light in a Delhi winter studio is calibrated to a quality of light the artist was seeing, and when it hangs under a bare warm bulb in a corridor, some of the calibration is simply lost.\n\nWorks on paper respond differently again: matte, unvarnished, they take light into the fibre rather than bouncing it off a skin, which is why they tolerate softer light so gracefully and punish glare so harshly. Bronze and stoneware are the most theatrical of all, because they are all surface, all reflection and shadow; a bronze lit from one side is a drama, lit flat from the front is a paperweight. Zoya Merchant's Pale Arch demonstrates this in the gallery daily: move its light ten degrees and the sculpture's interior shadow reorganises the whole piece.\n\nNone of this is connoisseur's mysticism. It is the everyday mechanics of seeing, and every decision in this essay follows from it.\n\n## Daylight: the gift and the risk\n\nDaylight is the light artists trust, and for good reason: it is broad, it is full-spectrum, and it moves, which means the work is always slightly alive, different at nine than at four, different in June than in January. A collection hung well in daylight has a daily programme running on it for free. Arjun Vadehra's Winter Sun, Barakhamba hung on a wall that catches actual winter sun is a small miracle of correspondence: the painting and the light it depicts, meeting every afternoon.\n\nThe risk is real and must be stated plainly: ultraviolet light damages art. It fades pigments, embrittles paper, yellows varnish, and the damage is cumulative and permanent. The rules that follow are not gallery fastidiousness; they are the difference between a collection that reaches your grandchildren intact and one that arrives faded. Direct sun should never touch a work of art, full stop. Bright diffused daylight is ideal for oil and acrylic on canvas, acceptable with care for photographs and prints behind UV-filtering glazing, and to be rationed for works on paper, which want the gentlest end of the spectrum. The practical test: if sunlight ever falls directly on the wall at any time of day, at any time of year, that wall is not for light-sensitive work. Check in every season, because the sun's path moves and a wall safe in winter can be exposed in May.\n\nRooms in Indian homes present a particular pattern here, and it is mostly good news: deep verandas, shaded courtyards, and inward-facing rooms, the traditional architecture of heat management, create exactly the bright-but-indirect conditions art loves. The modern glass-walled apartment is the harder brief. Sheer blinds are the collector's quiet ally in such rooms: they take the violence out of the light while keeping its breadth.\n\n## Artificial light: the evening collection\n\nCollections are mostly looked at in the evening, which means the artificial lighting plan is, functionally, the collection's main exhibition design. Three instruments do nearly all the work. The picture light, mounted on or above the frame, gives an intimate, focused reading: excellent for smaller works, drawings, and the kind of painting you want people to approach. The angled ceiling spot, aimed at roughly thirty degrees, gives a broader and more sculptural light; two spots crossed from either side will model a large canvas beautifully and kill the single-source glare that flattens texture. The wall washer, a wide, even field of light across the whole surface, suits works whose power is in their overall tonal field, the Menons and Vadehras of this catalogue.\n\nTwo disciplines matter more than the choice of instrument. The first is colour temperature: warm light, around 2700 to 3000 kelvin, flatters the warm palettes of much Indian contemporary painting and suits domestic rooms; cooler light flattens them. Mixing temperatures within a sightline, a warm lamp beside a cool ceiling spot, is the single most common mistake we correct in collectors' homes, and the correction transforms rooms in an evening. The second discipline is intensity: art lighting should be brighter than the surrounding room, but gently so, a ratio of roughly three to one, enough to focus the eye without staging the wall like a shop window.\n\nAnd a word for LED, which has quietly solved problems that plagued collectors for decades: modern LEDs emit negligible UV, run cool enough to hang close to works without heat risk, and hold their colour for years. If your collection is still lit by halogen, the upgrade is the single highest-value conservation decision available to you, and it costs less than a modest frame.\n\n## Sculpture and objects: light as material\n\nThree-dimensional work makes light a collaborator rather than a condition. Rohan Lal's The Kiln Keeper changes character completely with its lighting: under a single hard source from above and to one side, the glazed surfaces throw deep shadows and the piece has the gravity of a shrine object; under diffuse light it becomes friendlier, more decorative, and somehow less itself. This is not a case of good and bad lighting. It is a case of choosing which version of the work you want to live with, and knowing that the choice is yours to make and remake.\n\nThe practical principles are few. Sculpture wants shadows; flat, frontal light is its enemy. A single dominant source with soft fill beats even illumination every time. Plinths want to be lit as part of the object, not as furniture. And bronzes with living patinas, surfaces that will keep slowly changing, repay a light that rakes, because the raking light is what lets you watch the change happen. Maya Pillai's Coir and Salt is hung in the gallery with a dedicated spot for exactly this reason: the rope-like texture is a shadow-play, and without the angle there is no texture, only shape.\n\n## The numbers, kept in proportion\n\nConservation science does put figures to all this, and collectors should know them without being tyrannised by them. Works on paper, textiles, and watercolour are asked to live at around 50 lux, the light level of a softly lit room, with limited annual exposure. Oil and acrylic paintings are comfortable at 150 to 200 lux, a normal domestic evening level. Stone, ceramic, and metal are robust at higher levels still. The figures are museum targets, and museums chase them with meters and computerised shutters. At home, the spirit of the numbers is what matters: sensitive works get the gentlest light and the occasional rest; robust works carry the bright walls. A cheap lux meter, or even a phone app, will tell you more about your collection's conditions in ten minutes than a decade of guessing.\n\nExposure, remember, is the product of intensity and time, and that fact gives you a dial most collectors never think to turn. A beloved work on paper that must live in a bright room can simply spend part of each year in a dark portfolio, resting. Rotation, discussed elsewhere in this journal as a way of keeping walls fresh, is also a conservation strategy, and the works will not mind. Paper that rests half the year at zero lux can afford its months on the wall.\n\n## Photographs and prints under light\n\nEditioned work deserves its own note, because it is the category where light decisions are most often wrong. An archival pigment print is, as the name promises, stable: the pigments are chosen for permanence, and framed behind UV-filtering museum glass, such prints live comfortably in ordinary bright rooms for decades. Zoya Merchant's photographic works are sold glazed this way precisely so that collectors do not have to choose between the image and the light. But two enemies remain: direct sun, which no glazing fully excuses, and the bargain frame, whose ordinary glass and acidic mount quietly undo the word archival. The print that survives beautifully is the print whose framing was taken as seriously as its purchase.\n\nThere is a subtler point about photographs, too, and it is about how they are lit for viewing rather than for preservation. A photographic print has no impasto, no texture to model; it wants even, reflection-free light, and it is killed by the single downlight that makes paintings glow. If your prints live under ceiling spots aimed for canvases, they are wearing someone else's clothes. Give them the wall-wash, or the soft ambient of a well-lit room, and they will return the courtesy with the deep, even blacks they were printed to hold.\n\n## The viewing day\n\nHere is a way of thinking about your collection that we recommend to every collector we work with: it has a viewing day, a schedule written in light, and learning the schedule is one of ownership's quiet pleasures. Morning light, entering from the east, is cool and raking and flatters texture: the impasto canvases and the bronzes take their first showing of the day. Noon flattens everything, and the collection rests; the works on paper, in their shaded rooms, carry these hours best. The afternoon turns warm and directional, and the west walls come alive: this is the Vadehra hour, the Menon hour, when paintings built from warm light receive it. Evening belongs to the artificial plan, the spots and picture lights, and the collection puts on its formal self, the version guests see.\n\nNone of this requires planning; it happens in every home, willed or not. The point is to know it, and to hang with it. Walk your rooms at different hours for a week before you hang anything significant. Note where the light is generous and where it is merely bright. The week's observations will tell you more about where each work belongs than any floor plan.\n\n## Colour rendering: the number on the box\n\nOne technical detail repays attention when you buy lamps, and it hides on the packaging under the letters CRI: colour rendering index, a scale to 100 that measures how truthfully a light source reveals colour. Daylight scores, effectively, 100. Cheap LEDs can score in the low 80s, and the deficit is not abstract: reds go muddy, subtle ochre relationships collapse, and a painting you love can look, under poor CRI, like a photograph of itself. The fix is trivially easy and permanently important. Buy lamps rated CRI 90 or above, 95 if the budget allows, and the difference will be visible the evening you install them. Collectors who have made the switch describe it consistently: it is like cleaning a window you did not know was dirty.\n\nDimmers, similarly, deserve a sentence they rarely get. Dimming extends lamp life, saves energy, and lets a room serve both the bright social evening and the low, late hour of solitary looking. It also, incidentally, reduces light exposure over the work's lifetime, a small conservation dividend paid nightly. A collection on dimmers is a collection with a volume control, and once you have lived with one you will not go back.\n\n## A practical audit, room by room\n\nBecause the theory converts simply, here is the method we use when we assess a collector's home. Room by room, at different times of day: first, map the daylight, where direct sun falls and when, where the bright indirect zones are, which walls stay gently lit all day. Second, inventory the artificial light: the fittings, their temperature, their aim, and, just as important, the switches, because a lighting plan that requires four switches in the right combination is a plan that will be used for a fortnight and abandoned. Third, match works to conditions, sensitive to gentle, robust to bright, sculptural to angled. Fourth, and only then, buy or adjust fittings.\n\nThe audit almost always produces the same handful of corrections. A work on paper migrated away from a window it has lived beside too long. A great canvas liberated from a dark corner by a single added spot. A corridor gallery given one circuit and one switch so the evening walk-through becomes a habit instead of a production. And always, the discovery of one wall the collector had never considered, quietly perfect, waiting.\n\n## The cost of getting it wrong\n\nIt would be incomplete to leave the risks at the level of aesthetics, because light damage eventually becomes a financial fact. A faded work is worth less, full stop: appraisers note light damage, conservators can often date it, and the market prices it in without sentiment. Insurance, too, has opinions; a claim involving a work hung in conditions its documentation warned against is a claim with complications. None of this should frighten anyone into hanging their collection in the dark. Works of art are made to be seen, and a life in darkness is its own kind of loss. The point is only that light management is not an affectation of the over-cautious. It is ordinary stewardship, of the same order as insuring the work or hanging it level, and the collectors who practise it simply own better-preserved, better-valued, better-looking collections in year twenty than the collectors who did not.\n\n## Light as hospitality\n\nThere is a social dimension to all of this that deserves its own paragraph, because collections are, among other things, how homes receive people. Guests read a collection's light before they read its art. A brightly lit wall says look; a dim one says pass by. The collector who understands this can conduct an evening: the entry sequence lit to slow people down, the great canvas held at its best angle for the moment guests arrive in the living room, the intimate works kept for the later, smaller hours when the party has thinned and the real looking begins. This is not manipulation. It is hospitality in its oldest sense, arranging the house so that the best of it can be shared.\n\nChildren read the light too, and more honestly than adults. They will find the works that are lit to be found, and ignore the ones that are not, no matter how famous the artist. If you want the next generation to grow up inside the collection, light their routes through the house accordingly: the corridor to the kitchen, the stairwell they thunder down, the wall opposite the table where they do their homework. Collections are inherited in every sense, and the inheritance begins in what the house chooses to illuminate.\n\n## The first evening\n\nEvery collector remembers the moment the lesson landed. A work arrives, it is hung with ceremony, the family gathers, and something is off: the canvas that blazed in the gallery sits mute on the home wall. The instinct is to doubt the work. Resist it. In nine cases out of ten the work is innocent and the light is guilty, and the cure is an evening with a lamp, a ladder, and patience. Move the source, change the angle, warm the temperature, and watch the painting return. Collectors who have been through this ritual once never unlearn it. They become, without noticing, people who walk into any room and read its light before its furniture, and their collections are the visible proof of the habit.\n\n## The seasonal revision\n\nLight changes with the year, and the collection should be allowed to change with it. The monsoon weeks, when daylight goes soft and grey for days, are the season when works on paper shine: their matte surfaces hold the low light beautifully while the glossier canvases wait for the sun's return. Winter's low, amber sun, the same light Vadehra paints, reaches deeper into rooms than summer's overhead glare, and walls that are shaded in June are luminous in January. Serious collectors adjust: a rotation with the seasons, a re-aiming of spots twice a year, a fresh look at each room when the light turns. It is a small ritual, an afternoon twice a year, and it keeps the collection in conversation with the world outside the windows.\n\n## What light teaches\n\nSpend a year attending to the light in your home and something shifts that has nothing to do with conservation or display. You begin to see the collection as the artists saw their work: not as finished objects but as surfaces waiting for the conditions that complete them. The painting is the same object at noon and at dusk, but it is not the same painting, and knowing the difference, living with it daily, is the deepest education in art that ownership offers.\n\nThat is what light gives a private collection: not just visibility, but time. The works change with the hours, the seasons, the years of your own looking, and a collection lit with attention is never quite the same collection twice. Buy the works you love, hang them with care, and then give them the one element they were all made for. The art will repay the light, hour by hour, for as long as you live with it.",
  "published": true
 }
];

await mongoose.connect(env.mongoUri);
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') throw new Error('Refusing to wipe a production database');
await Promise.all([Artist,Artwork,Collection,Article,User,Order,Inquiry,Cart,UserCollection,Notification,InventoryHold,AvailabilityAlert,PaymentEvent,Counter].map((m) => m.deleteMany({})));

const artists = await Artist.insertMany(ARTISTS);
const bySlug = Object.fromEntries(artists.map((a) => [a.slug, a._id]));
await Collection.insertMany(COLLECTIONS);
await Artwork.insertMany(ARTWORKS.map(({artistSlug, ...w}) => ({...w, artist: bySlug[artistSlug]})));
// Placeholder films (a slow pass over the work, generated with ffmpeg) until studio footage exists.
for (const [slug, n] of [['after-the-monsoon', '01'], ['quiet-geometry', '08'], ['night-orchard', '04']]) await Artwork.updateOne({slug}, {video: {url: `/film/work-${n}.mp4`, poster: `/art/work-${n}.jpg`, mime: 'video/mp4', duration: 8, width: 720, height: 900, caption: 'A slow look across the surface', placeholder: true}});
await Article.insertMany(ARTICLES.map((a) => ({...a, publishedAt: new Date(a.publishedAt)})));

const devPassword = process.env.SEED_PASSWORD || 'ChangeMe123!';
const hash = await bcrypt.hash(devPassword, 12);
await User.create([
  {name: 'Gallery Administrator', email: 'admin@atelierarc.example', passwordHash: hash, role: 'admin', verified: true},
  {name: 'Anika Shah', email: 'advisor@atelierarc.example', passwordHash: hash, role: 'advisor', verified: true},
  {name: 'Rahul Verma', email: 'advisor2@atelierarc.example', passwordHash: hash, role: 'advisor', verified: true},
  {name: 'Demo Collector', email: 'collector@atelierarc.example', passwordHash: hash, role: 'customer', verified: true},
]);
console.log(`Seeded ${artists.length} artists, ${ARTWORKS.length} artworks, ${COLLECTIONS.length} collections, ${ARTICLES.length} articles, admin + 2 advisors + 1 collector`);
await mongoose.disconnect();
