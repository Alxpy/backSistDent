
export interface ITreatment {
  name: string;
  description?: string;
  image?: string; // URL de la imagen
  price: number; // BOB
  duration: number; // Minutos
  // clinicId: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}