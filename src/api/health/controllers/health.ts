/**
 * A set of functions called "actions" for `health`
 */

export default {
  health: async (ctx, next) => {
    try {
      // ping database in strapi
      const hello = await strapi.entityService.findOne(
        "api::db-health.db-health",
        1
      );
      if (hello.status === "ok") {
        ctx.body = "ok";
      }
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
  },
};
