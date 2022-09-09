const _ = require("lodash");
const express = require("express");
const cors = require("cors");
const csv = require("csvtojson");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const convertCsvToJson = async () => {
    const csvFile = "./products.csv";
    const json = await csv().fromFile(csvFile);

    const jsonWithPhotoValues = json.map((product) => {
        const photoId = Math.floor(Math.random() * 1000) + 1;
        const productPhoto = `https://picsum.photos/seed/${photoId}/200/`;

        return {
            ...product,
            photo: productPhoto,
        };
    });

    return jsonWithPhotoValues;
};

app.get("/products", async (request, response) => {
    try {
        const json = await convertCsvToJson();

        const { category, brand, page, cap } = request.query;

        const pageStartIndex = (page - 1) * cap;
        const pageEndIndex = page * cap;

        const filteredResponse = _.filter(json, (product) => {
            return (
                (product.brand === brand && product.category === category) ||
                (product.brand === brand && !category) ||
                (product.category === category && !brand)
            );
        });

        const paginatedResponse = _.slice(
            filteredResponse,
            pageStartIndex,
            pageEndIndex
        );

        response.json(json);
    } catch (error) {
        console.log("Error on sending blog response: ", error);
    }
});

app.get("/search/:query", async (request, response) => {
    try {
        const query = request.params.query.toLowerCase();
        const products = await convertCsvToJson();

        const { page, cap } = request.query;

        const pageStartIndex = (page - 1) * cap;
        const pageEndIndex = page * cap;

        searchedProduct = _.filter(products, (product) => {
            const brand = product.brand.toLowerCase();
            const label = product.display_name.toLowerCase();
            const category = product.category.toLowerCase();

            return (
                brand.includes(query) ||
                label.includes(query) ||
                category.includes(query)
            );
        });

        const paginated = _.slice(
            searchedProduct,
            pageStartIndex,
            pageEndIndex
        );

        console.log(paginated.length);

        response.json(paginated);
    } catch (error) {
        console.log("error on loading data: ", error);
    }
});

app.get("/products/:id", async (request, response) => {
    try {
        const productId = request.params.id;
        const products = await convertCsvToJson();

        const productInfo = products.find(
            (product) => product.id === productId
        );

        response.json(productInfo);
    } catch (error) {
        console.log("error on loading data: ", error);
    }
});

app.listen(port, () => console.log("server started at port ", port));
