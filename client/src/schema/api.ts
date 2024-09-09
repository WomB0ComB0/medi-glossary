import { z } from 'zod';

const Definition = z.object({
  meta: z.object({
    id: z.string(),
    uuid: z.string(),
    src: z.string(),
    section: z.string(),
    stems: z.array(z.string()),
    offensive: z.boolean(),
  }),
  hom: z.number().optional(),
  hwi: z.object({
    hw: z.string(),
    prs: z.array(
      z.object({
        mw: z.string(),
        sound: z.object({
          audio: z.string(),
        }),
      }),
    ),
  }),
  fl: z.string(),
  def: z.array(
    z.object({
      sseq: z.array(
        z.array(
          z.tuple([
            z.literal('sense'),
            z.object({
              sn: z.string().optional(),
              dt: z.array(z.tuple([z.literal('text'), z.string()])),
              sdsense: z
                .object({
                  sd: z.string(),
                  dt: z.array(z.tuple([z.literal('text'), z.string()])),
                })
                .optional(),
            }),
          ]),
        ),
      ),
    }),
  ),
  shortdef: z.array(z.string()),
});

export const SearchQueryResult = z.array(Definition);

export type SearchQueryResultType = z.infer<typeof SearchQueryResult>;
