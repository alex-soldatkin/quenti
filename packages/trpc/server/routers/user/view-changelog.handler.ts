// TODO: fix versioning chaos
import pjson from "../../../../../apps/next/package.json";
import type { NonNullableUserContext } from "../../lib/types";

const version = pjson.version;

type ViewChangelogOptions = {
  ctx: NonNullableUserContext;
};

export const viewChangelogHandler = async ({ ctx }: ViewChangelogOptions) => {
  await ctx.prisma.user.update({
    where: {
      id: ctx.session.user.id,
    },
    data: {
      changelogVersion: version,
    },
  });
};

export default viewChangelogHandler;
