export type GenerateJsonInput = {
  system: string;
  user: string;
  schema: unknown;
};

export type AiClient = {
  generateJson(input: GenerateJsonInput): Promise<unknown>;
};
