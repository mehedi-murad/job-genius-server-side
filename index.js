const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9kydno.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const articleCollection = client.db('jobGenius').collection('articles');
    const jobCollection = client.db('jobGenius').collection('jobs');
    const myJobCollection = client.db('jobGenius').collection('myJobs');
    const resumeCollection = client.db('jobGenius').collection('resume');

    //for myjobspost endpoint
    app.post('/myjobs', async(req, res) => {
      const myPostJobs = req.body;
      console.log(myPostJobs)
      const result = await myJobCollection.insertOne(myPostJobs)
      res.send(result)
    })

    //for getting my jobs post endpoint
    app.get('/myjobs', async(req, res) => {
      let query = {};
      if(req.query?.email){
          query = {email: req.query.email}
      }
      const result = await myJobCollection.find(query).toArray()
      res.send(result)
    })


    //for getting update single myjobs data
    app.get('/myjobs/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await myJobCollection.findOne(query);
      res.send(result)
    })

    //for updating info to the client side
    app.put('/myjobs/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const updatedJobsPost = req.body;
      const JobsPost = {
        $set: {
          jobTitle: updatedJobsPost.jobTitle, 
          jobType: updatedJobsPost.jobType, 
          salary: updatedJobsPost.salary, 
          postDate: updatedJobsPost.postDate, 
          deadline: updatedJobsPost.deadline, 
          jobDesc: updatedJobsPost.jobDesc, 
          name: updatedJobsPost.name
        }
      }
      const result = await myJobCollection.updateOne(filter, JobsPost, options)
      res.send(result)
    })

    //for deleting myJobs endpoint
    app.delete('/myjobs/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await myJobCollection.deleteOne(query)
      res.send(result)
    })

    //for resume collection post endpoint
    app.post('/resume', async(req, res) => {
      const resumePost = req.body;
      console.log(resumePost)
      const result = await resumeCollection.insertOne(resumePost)
      res.send(result)
    })


    //for email wise applied jobs search(resume)
    app.get('/resume', async(req, res) => {
      let query = {};
      if(req.query?.email){
          query = {email: req.query.email}
      }
      const result = await resumeCollection.find(query).toArray()
      res.send(result)
    })

    //for resume delete endpoint
    app.delete('/resume/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await resumeCollection.deleteOne(query)
      res.send(result)
    })

    //for resume status changing endpoint
    app.patch('/resume/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateStatus = req.body;
      const updateInfo = {
        $set: {
          status: updateStatus.status
        }
      }
      const result = await resumeCollection.updateOne(filter, updateInfo)
      res.send(result)
    })

    //for articles endPoint
    app.get('/articles', async(req, res) =>{
      const cursor = articleCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    //for all jobs endpoint
    app.get('/jobs', async(req, res) =>{
      const cursor = jobCollection.find()
      const allJobs = await cursor.toArray();
      res.send(allJobs)
    })



    //for onsite job endpoint
    app.get('/jobs/onsite', async(req, res) =>{
      const cursor = jobCollection.find({job_type: 'Onsite'})
      const onsiteJobs = await cursor.toArray();
      res.send(onsiteJobs)
    })

    //for remote job endpoint
    app.get('/jobs/remote', async(req, res) =>{
      const cursor = jobCollection.find({job_type: 'Remote'})
      const remoteJobs = await cursor.toArray();
      res.send(remoteJobs)
    })

    //for hybrid job endpoint
    app.get('/jobs/hybrid', async(req, res) =>{
      const cursor = jobCollection.find({job_type: 'Hybrid'})
      const hybridJobs = await cursor.toArray();
      res.send(hybridJobs)
    })

    //for part-time job endpoint
    app.get('/jobs/part-time', async(req, res) =>{
      const cursor = jobCollection.find({job_type: 'PartTime'})
      const partTimeJobs = await cursor.toArray();
      res.send(partTimeJobs)
    })
    //for job details endpoint
    app.get('/jobs/:id', async(req,res) =>{
      const id = req.params.id;
      // console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await jobCollection.findOne(query)
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Job Portal is running')
})

app.listen(port, () =>{
    console.log(`job portal is running on port ${port}`)
})