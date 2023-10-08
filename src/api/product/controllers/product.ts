/**
 * product controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async find(ctx) {
      let query = {};
      // check if filters exist
      const filters = ctx.query.filters;
      if (ctx.query.server === "true") {
        // Server request: return only specific fields based on filters
        query = {
          populate: {
            Product_Image: {
              fields: ["url", "width", "height", "formats"],
            },
            categories: {
              fields: ["id", "Name"],
            },
          },
          fields: ["id", "Name", "Price", "slug"],
          filters: filters,
        };
      } else {
        query = {
          fields: [
            "id",
            "Name",
            "Price",
            "Short_Description",
            "slug",
            "Product_Description",
          ],
          populate: {
            Product_Image: {
              fields: ["url", "width", "height", "formats"],
            },
            categories: {
              fields: ["id", "Name"],
            },
          },
          filters: filters,
        };
      }

      const response: any = await strapi
        .service("api::product.product")
        .find(query);

      let results = response.results;
      const pagination = response.pagination;

      // if (ctx.query.server === "true") {
      for (const result of results) {
        result.Product_Image = result.Product_Image;
        for (const image of result.Product_Image) {
          // loop through the formats
          for (const format in image.formats) {
            let detailsOfFormat = {};
            detailsOfFormat["url"] = image.formats[format].url;
            detailsOfFormat["width"] = image.formats[format].width;
            detailsOfFormat["height"] = image.formats[format].height;
            image.formats[format] = detailsOfFormat;
          }
        }
      }
      // } else
      if (ctx.query.category !== undefined) {
        // if category is defined, filter the products based on the category
        const category = ctx.query.category;
        const filteredResults = [];
        for (const result of results) {
          for (const cat of result.categories) {
            if (cat.Name === category) {
              filteredResults.push(result);
              break;
            }
          }
        }
        results = filteredResults;
      }

      return {
        data: results,
        pagination,
      };
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      const response: any = await strapi
        .service("api::product.product")
        .findOne(id, {
          fields: [
            "id",
            "Name",
            "Price",
            "Short_Description",
            "slug",
            "Product_Description",
          ],
          populate: {
            Product_Image: {
              fields: ["url", "width", "height", "formats"],
            },
            categories: {
              fields: ["id", "Name"],
            },
          },
        });

      for (const image of response.Product_Image) {
        // loop through the formats
        for (const format in image.formats) {
          let detailsOfFormat = {};
          detailsOfFormat["url"] = image.formats[format].url;
          detailsOfFormat["width"] = image.formats[format].width;
          detailsOfFormat["height"] = image.formats[format].height;
          image.formats[format] = detailsOfFormat;
        }
      }

      return {
        data: response,
      };
    },
  })
);

// import { factories } from "@strapi/strapi";

// export default factories.createCoreController("api::product.product");
