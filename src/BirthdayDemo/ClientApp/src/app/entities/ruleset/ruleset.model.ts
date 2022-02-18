export interface IRuleset {
  id?: number;
  name?: string | null;
  jsonString?: string | null;
}

export class Ruleset implements IRuleset {
  constructor(
    public id?: number,
    public name?: string | null,
    public jsonString?: string | null
  ) {}
}

export function getRulesetIdentifier(ruleset: IRuleset): number | undefined {
  return ruleset.id;
}
