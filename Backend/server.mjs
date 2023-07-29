import express from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { customAlphabet } from 'nanoid'
import path from "path";
import cors from 'cors';
import { log } from 'console';

const __dirname = path.resolve();

const app = express();
const port = 3000;

//console.log(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "../frontend")));

const dbName = 'productsDB';
const collectionName = 'products';

const nanoid = customAlphabet("1234567890", 10);

console.log("testing nanoid : ", nanoid());

const uri = "mongodb+srv://dbuser:dbpassword@cluster0.ygowwij.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

//enabling cors
app.use(cors());

// Sample data for products
// let products = [
//   {
//     id: 1,
//     name: 'Product 1',
//     category: 'Home',
//     description: 'Product 1 description',
//     imageURL: 'assets/img/1.jfif',
//     price: 10,
//     isActive: true
//   },
//   {
//     id: 2,
//     name: 'Product 2',
//     category: 'Beauty',
//     description: 'Product 2 description',
//     imageURL: 'assets/img/2.jfif',
//     price: 19,
//     isActive: true
//   },
//   {
//     id: 3,
//     name: 'Product 3',
//     category: 'Clothing',
//     description: 'Product 3 description',
//     imageURL: 'assets/img/3.jfif',
//     price: 15,
//     isActive: false
//   }
// ];

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send(`<h1>Welcome to Products API</h1>
    
    <p>Use any of the below API Endpoints</p>

    <ul>
        <li>{{baseURL}}/products <b>GET Request</b></li>
        <li>{{baseURL}}/product/:id <b>GET Request</b></li>
        <li>{{baseURL}}/product <b>POST Request</b></li>
        <li>{{baseURL}}/product/:id <b>PUT Request</b></li>
        <li>{{baseURL}}/product/:id <b>DELETE Request</b></li>
    </ul>

    <h3>Sample Product Schema</h3>
    <p>
    {
        id: 2,
        name: 'Product 2',
        category: 'Category 2',
        description: 'Product 2 description',
        imageURL: 'https://example.com/image2.jpg',
        price: 19.99,
        isActive: true
      }
    </p>
    `);
});

// GET /products - Get all products
app.get('/products', async (req, res) => {
  await client.connect();

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const findQuery = {};

  let _searchResult = [];
  let _products = [];

  //try {
    _searchResult = await collection.find(findQuery);//.sort({ name: 1 });
    await _searchResult.forEach(product => {
      console.log(`${product.name}`);
      _products.push({
        id: product._id,
        name: product.name,
        category: product.category,
        description: product.description,
        imageURL: product.imageURL,
        price: product.price,
        isActive: product.isActive
      });
    });
    console.log(_products);
  // } catch (err) {
  //   console.error(`Something went wrong trying to find the documents: ${err}\n`);
  // }

  await client.close();
  res.status(200).json({ message: "Success", data: _products });
});

// GET /product/:id - Get a specific product by id
app.get('/product/:id', async (req, res) => {
  const _product_id = req.params.id;
  //const product = products.find(product => product.id === id);

  let _product;
  await client.connect();

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  console.log(_product_id);
  const findOneQuery = { _id: new ObjectId(_product_id) };

  //try {
  _product = await collection.findOne(findOneQuery);
  console.log(_product);
  if (!_product) {
    res.status(404).json({ message: 'Product not found', data: null });
  } else {
    res.status(200).json({ message: 'Product found', data: _product });
  }
  // } catch (err) {
  //   console.error(`Something went wrong trying to find one document: ${err}\n`);
  // }

  await client.close();
});

// POST /product - Add a new product
app.post('/product', async (req, res) => {
  const { name, category, description, imageURL, price, isActive } = req.body;

  // Validate required information
  if (!name || !category || !price || !imageURL) {
    res.status(400).json({ message: 'Missing required information', data: null });
    return;
  }

  //const id = Math.floor(Math.random() * 1000) + 1; // Generate a random id
  const newProduct = { //id,
  name, category, description, imageURL, price, isActive };

  await client.connect();

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  try {
    const result = await collection.insertOne(newProduct);
    console.log(`Successfully inserted record with _id: ${result.insertedId}`);

    //products.push(newProduct);
    await client.close();

    res.status(201).json({ message: 'Success', data: newProduct });
  } catch (err) {
    console.error(`Something went wrong trying to insert the new document: ${err}\n`);

    await client.close();
    //products.push(newProduct);
    res.status(201).json({ message: 'Error', data: err });
  }
});

// PUT /product/:id - Update a product
app.put('/product/:id', async (req, res) => {
  const _product_id = req.params.id;
  const { name, category, description, imageURL, price, isActive } = req.body;

  // Validate required information
  if (!name || !category || !price) {
    res.status(400).json({ message: 'Missing required information', data: null });
    return;
  }

  await client.connect();

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const findOneQuery = { id: new ObjectId(_product_id) };

  const _product = await collection.findOne(findOneQuery);

  //const productIndex = products.findIndex(product => product.id === id);

  //try {

  if (!_product) {
    await client.close();
    res.status(404).json({ message: 'Product not found', data: null });
  } else {
    // products[productIndex] = {
    //   id,
    //   name,
    //   category,
    //   description,
    //   imageURL,
    //   price,
    //   isActive
    // };

    const updateDoc = {
      $set:
      {
        name: name,
        category: category,
        price: price,
        description: description,
        imageURL: imageURL,
        isActive: isActive
      }
    };

    const updateOptions = { returnOriginal: false };

    let _updatedProduct;
    try {
      const updateResult = await collection.findOneAndUpdate(
        findOneQuery,
        updateDoc,
        updateOptions,
      );
      _updatedProduct = updateResult.value;
      console.log(`Here is the updated document:\n${JSON.stringify(updateResult.value)}\n`);
    } catch (err) {
      console.error(`Something went wrong trying to update one document: ${err}\n`);
    }

    await client.close();
    res.status(200).json({ message: 'Success', data: _updatedProduct });
    //res.status(200).json({ message: 'Product not found', data: _product });
  }

});

// DELETE /product/:id - Delete a product
app.delete('/product/:id', async (req, res) => {

  const _product_id = req.params.id;

  await client.connect();

  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const findOneQuery = { id: new ObjectId(_product_id) };

  console.log(`Product ID is ${_product_id}`);
  const _product = await collection.findOne(findOneQuery);

  //try {

  if (!_product) {
    console.log(`Product not found with id ${_product_id}`);
    await client.close();
    res.status(404).json({ message: 'Product not found', data: null });
  } else {
    console.log(`Product found with id ${_product_id}, now going to delete`);
    let _updatedProduct;
    try {
      const deleteResult = await collection.deleteOne(findOneQuery);
      console.log(`Product deleted with ID ${_product_id}`);
      //console.log(`Deleted ${deleteResult.deletedCount} documents\n`);
    } catch (err) {
      console.error(`Something went wrong trying to delete one document: ${err}\n`);
    }

    await client.close();
    res.status(200).json({ message: 'Success', data: _product });
    //const deletedProduct = products.splice(productIndex, 1)[0];
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});