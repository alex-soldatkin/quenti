import { deleteObjectAssets } from "@quenti/images/server";

import { isClassTeacherOrThrow } from "../../lib/queries/classes";
import type { NonNullableUserContext } from "../../lib/types";
import type { TDeleteSchema } from "./delete.schema";

type DeleteOptions = {
  ctx: NonNullableUserContext;
  input: TDeleteSchema;
};

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  await isClassTeacherOrThrow(input.id, ctx.session.user.id, "mutation");

  await ctx.prisma.class.delete({
    where: {
      id: input.id,
    },
  });

  await deleteObjectAssets("class", input.id);
};

export default deleteHandler;