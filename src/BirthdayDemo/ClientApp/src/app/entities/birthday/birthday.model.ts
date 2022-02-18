import * as dayjs from "dayjs";
import { ICategory } from "app/entities/category/category.model";

export interface IBirthday {
  id?: number;
  lname?: string | null;
  fname?: string | null;
  sign?: string | null;
  dob?: dayjs.Dayjs | null;
  isAlive?: boolean | null;
  categories?: ICategory[] | null;
}

export class Birthday implements IBirthday {
  constructor(
    public id?: number,
    public lname?: string | null,
    public fname?: string | null,
    public sign?: string | null,
    public dob?: dayjs.Dayjs | null,
    public isAlive?: boolean | null,
    public categories?: ICategory[] | null
  ) {
    this.isAlive = this.isAlive ?? false;
  }
}

export function getBirthdayIdentifier(birthday: IBirthday): number | undefined {
  return birthday.id;
}
