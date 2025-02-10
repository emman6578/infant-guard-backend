import { Gender } from "@prisma/client";

export interface InfantInterface {
  fullname: string;
  birthday: {
    month: number;
    day: number;
    year: number;
  };
  place_of_birth: string;
  address: {
    purok: string;
    baranggay: string;
    municipality: string;
    province: string;
  };
  height: number;
  gender: Gender;
  weight: number;
  mothers_name: string;
  fathers_name: string;
  contact_number: string;
  health_center: string;
  family_no: number;
  parent_id: string;
  image?: string;
}
