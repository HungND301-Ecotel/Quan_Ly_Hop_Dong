import z from 'zod';

export const SignPositionsSchema = z.object({
  postions: z.array(
    z.object({
      userId: z.string().nonempty(),
      sequenceOrder: z.coerce.number<number>(),
      signatureType: z.coerce.number<number>(),
      positionX: z.coerce.number<number>(),
      positionY: z.coerce.number<number>(),
      pageNumber: z.coerce.number<number>(),
      width: z.coerce.number<number>(),
      height: z.coerce.number<number>(),
      id: z.string().optional(),
    })
  ),
});

export type SignPositionsValues = z.infer<typeof SignPositionsSchema>;

export const SignPostionsDefault: SignPositionsValues = {
  postions: [],
};
