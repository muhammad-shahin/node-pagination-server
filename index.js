const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vzygubu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client
      .db('reactPaginationDB')
      .collection('products');

    // get products by pagination
    app.get('/products', async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await productCollection
        .find()
        .skip((page - 1) * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get count of total products
    app.get('/productsCount', async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // get products by ids
    app.post('/productByIds', async (req, res) => {
      const productIds = req.body;
      const objectProductIds = productIds.map((id) => new ObjectId(id));
      console.log(objectProductIds);
      const query = { _id: { $in: objectProductIds } };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get('/', (req, res) => {
  res.send('Welcome to React Pagination Server');
});

app.listen(port, () => {
  console.log(`React Pagination server is running on port: ${port}`);
});
