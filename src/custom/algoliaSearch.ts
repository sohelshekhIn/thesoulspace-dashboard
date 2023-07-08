const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

const index = client.initIndex("api::product.product");

const syncEntryWithAlgolia = async (event: any, operation: string) => {
  const { result } = event;
  //    get product data from strapi entity api
  const response: any = await strapi
    .service("api::product.product")
    .findOne(result.id, {
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
          fields: ["url"],
        },
        categories: {
          fields: ["id", "Name"],
        },
      },
    });

  if (operation === "create") {
    index
      .saveObject({ objectID: result.id, ...response })
      .then(() => {
        // console.log(objectID);
      })
      .catch((err: any) => {
        throw new Error(
          `Error while creating entry wirh Algolia: ${err.message}`
        );
      });
  } else if (operation === "update") {
    index
      .partialUpdateObject(
        { objectID: result.id, ...response },
        { createIfNotExists: true }
      )
      .then(() => {
        // console.log(objectID);
      })
      .catch((err: any) => {
        throw new Error(
          `Error while updating entry with Algolia: ${err.message}`
        );
      });
  } else if (operation === "delete") {
    index
      .deleteObject(result.id)
      .then(() => {
        // console.log(objectID);
      })
      .catch((err: any) => {
        throw new Error(
          `Error while deleting entry in Algolia: ${err.message}`
        );
      });
  }
};

const syncAllEntriesWithAlgolia = async (operation: string) => {
  const { results: response } = await strapi
    .service("api::product.product")
    .find({
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
          fields: ["url"],
        },
        categories: {
          fields: ["id", "Name"],
        },
      },
    });
  const objects = response.map((product: any) => {
    return { objectID: product.id, ...product };
  });

  if (operation === "create") {
    index
      .saveObjects(objects)
      .then(() => {
        // console.log(objectIDs);
      })
      .catch((err: any) => {
        throw new Error(
          `Error while creating entries in Algolia: ${err.message}`
        );
      });
  } else if (operation === "update") {
    index
      .partialUpdateObjects(objects, { createIfNotExists: true })
      .then(() => {
        // console.log(objectIDs);
      })
      .catch((err: any) => {
        throw new Error(
          `Error while updating entried with Algolia: ${err.message}`
        );
      });
  }
};

export { syncEntryWithAlgolia, syncAllEntriesWithAlgolia };
