export interface ParentInterface {
  email: string;
  fullname: string;
  contact_number: string;
  address: {
    purok: string;
    baranggay: string;
    municipality: string;
    province: string;
  };
  image?: string | null;
}
