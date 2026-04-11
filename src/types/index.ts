export interface ArticuloImpreso {
  id: string;
  titulo: string;
  publicacion: string;
  fecha: string;
  imagen: string;
  descripcion?: string;
}

export interface ArticuloDigital {
  id: string;
  titulo: string;
  publicacion: string;
  url: string;
  imagen?: string;
}

export interface PostInstagram {
  id: string;
  titulo: string;
  url: string;
  tipo: 'carrusel' | 'video' | 'imagen';
  fecha: string;
  descripcion?: string;
  likes?: number;
}
