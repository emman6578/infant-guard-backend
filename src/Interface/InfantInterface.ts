import { Gender } from "@prisma/client";

export interface InfantInterface {
  fullname: string;
  birthday: {
    month: string;
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
  health_center: string;
  family_no: number;
  image?: string;
  parent_id: string;
  //TODO: revise this after changing the schema this should be on another model
  immunization_progress?: string;
  immunization_status?: string;
  immunization_vaccine?: string;
}
