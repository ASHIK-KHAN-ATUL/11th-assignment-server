const express = require('express')
const cors = require('cors')
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

// DB_USER = LibroHub
// DB_PASS = 3KZMi8YdODltk1rL



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wrydc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // books related apis
    const bookCollection = client.db('LibroHub').collection('books')
    const borrowCollection = client.db('LibroHub').collection('borrowedBooks')

    app.get('/books', async(req, res)=> {

      const category = req.query.category;
      let query = {};
      if(category){
        query = { category : category}
      }

      const cursor = bookCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/books', async(req, res)=> {
      const newBooks = req.body;
      const result = await bookCollection.insertOne(newBooks);
      res.send(result);
    })

    app.get('/books/:id', async(req, res)=> {
      const id = req.params;
      const result = await bookCollection.findOne({_id: new ObjectId(id)});
      res.send(result)
    })

    app.patch('/books/:id', async(req, res)=>{
      const id =req.params.id;

      const result= await bookCollection.updateOne(
        {_id : new ObjectId(id)},
        {$inc:{quantity: 1}}
      )
      res.send(result);
    })


    app.put('/books/:id', async(req , res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBook = req.body;

      const book = {
        $set:{
          name: updatedBook.name,
          image: updatedBook.image,
          category: updatedBook.category,
          quantity: updatedBook.quantity,
          rating: updatedBook.rating,
          author: updatedBook.author,
          description: updatedBook.description,
          bookContent: updatedBook.bookContent,
          bookAdderName: updatedBook.bookAdderName,
          bookAdderEmail: updatedBook.bookAdderEmail
        }
      }
      const result = await bookCollection.updateOne(filter, book)
      res.send(result)
    })


    app.post('/borrow/:id', async(req, res)=> {

      const id = req.params.id;
      const borrowBookDetails = req.body;

        await bookCollection.updateMany(
          { quantity: { $type: "string" } },
          [
            { $set: { quantity: { $toInt: "$quantity" } } }
          ]
        );

        await bookCollection.updateOne(
            {_id: new ObjectId(id)},
            {$inc:{quantity: -1}}
          );
          const result = await borrowCollection.insertOne(borrowBookDetails);
          res.send(result)
    })

    app.get('/bookBorrowed', async(req, res)=>{

      const email = req.query.email;
      let query = {};
      if(email){
        query = {userEmail : email }
      }
      const cursor = borrowCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    

    app.delete('/bookBorrowed/:id' , async(req,  res)=>{
      const id = req.params.id;

      await bookCollection.updateOne(
        {_id: new ObjectId(id)},
        {$inc:{quantity: +1}}
      );

      const query = {_id: new ObjectId(id)}
      const result = await borrowCollection.deleteOne(query)
      res.send(result); 
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Assignt 11 runing')
})

app.listen(port, () => {
    console.log(`Assignment 11 running on: ${port}`)
})