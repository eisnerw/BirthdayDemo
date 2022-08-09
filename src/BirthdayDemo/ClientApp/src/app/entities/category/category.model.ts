import { IBirthday } from "app/entities/birthday/birthday.model";

export interface ICategory {
  id?: number;
  categoryName?: string | null;
  selected?: boolean | null;
  notCategorized?: boolean | null;
  focusType?: string | null;
  focusId?: string | null;
  jsonString?: string | null;
  description?: string | null;
  ids?: string[] | null;
}

export class Category implements ICategory {
  constructor(
    public id?: number,
    public categoryName?: string | null,
    public selected?: boolean | null,
    public notCategorized?: boolean | null,
    public focusType?: string | null,
    public focusId?: string | null,
    public jsonString?: string | null,
    public description?: string | null,
    public ids?: string[] | null
  ) {
    this.selected = this.selected ?? false;
    this.notCategorized = this.notCategorized ?? false;
  }
}

export function getCategoryIdentifier(category: ICategory): number | undefined {
  return category.id;
}
