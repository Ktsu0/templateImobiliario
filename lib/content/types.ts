export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
}

export interface Property {
  id: string;
  title: string;
  transaction: "venda" | "aluguel";
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  suites: number;
  area: number;
  parkingSpots: number;
  status: "venda" | "aluguel" | "lancamento" | "exclusivo";
  featured: boolean;
  photos: string[];
}
