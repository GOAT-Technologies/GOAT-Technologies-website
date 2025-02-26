// @ts-nocheck
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { default: mongoose } = require("mongoose");
const Enquiry = require('./models/enquiry-model');
const sendMail = require('./utils/mailer');
const uuid = require("uuid");
const Blog = require('./models/blog-model');
const authenticateToken = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug")

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/auth', authRoutes);

app.get("/blog/new", async (req, res) => {
  try {
res.render("blog/new-blog");
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'fail', message: 'internal server error' });
  }
});

app.post("/blog/new", async (req, res) => {
  try {
    const data = req.body;
    if (!data.blog_title || !data.blog_description) {
      res.render("blog/new-blog", { data, error: { message: 'Title and description are required' } });
      return;
    }
    const newBlog = new Blog({ ...data });
    await newBlog.save();
    res.render("blog/editor", { data, blog_id: newBlog._id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'fail', message: 'internal server error' });
  }
});

app.post("/blog/save", async (req, res) => {
  try {
    const { id, data } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
    res.status(200).send({ status: 'ok', updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'fail', message: 'internal server error' });
  }
});

app.get("/blog/all", async (req, res) => {
  try {
    const blogs = await Blog.find({ publish: true }).select(['_id', 'blog_title', 'blog_description', 'blog_lead_img', 'author']);
    res.status(200).send({ status: 'ok', blogs });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'fail', message: 'internal server error' });
  }
});

app.get("/blog/:blog_id/:blog_title", async (req, res) => {
  try {
    const blog_id = req.params.blog_id;
    const blog = await Blog.findById(blog_id);
    if (!blog) {
      res.render("blog/404");
      return;
    }
    res.render("blog/single", { blog });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'fail', message: 'internal server error' });
  }
});

app.get("/blog/editor", async (req, res, next) => {
  try {
    res.render("blog/editor")
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'fail', message: 'internal server error.' })
  }
})

// Route to serve the blog editor page
app.get('/blog-editor', authenticateToken, (req, res) => {
  res.sendFile(__dirname + '/public/resources/blog-editor.html');
});

// Route to handle blog post creation
app.post('/create-blog', authenticateToken, (req, res) => {
  // Handle blog post creation logic
});

app.post('/submit-form', async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    const requiredFields = ['name', 'Last-Name', 'Email-id', 'Select-Country', 'Enquiry-For'];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    const newEnquiry = new Enquiry(req.body);
    newEnquiry
      .save()
      .then(async () => {
        console.log('Saved the enquiry from ', req.body['Email-id']);
        await sendMail({
          to: "markmwangi14317@gmail.com",
          subject: `Enquiry on ${req.body['Enquiry-For']}`,
          html: `
            <div style="margin: 12px; font-size: 16px;">
              <p>Hello,</p>
              <p>
                I am <span style="color: sky-blue; font-weight: 600;">${req.body.name} ${req.body['Last-Name']}</span> from <b>${req.body.City ? req.body.City + ', ' : ''}${req.body['Select-Country']}</b>.
                ${req.body.Company ? 'Company name: ' + req.body.Company : ''} 
              </p>
              <br />
              <p>
                My Enquiry is on: <b>${req.body['Enquiry-For'].startsWith('Our') ?
              'GOAT Technologies ' + req.body['Enquiry-For'].split(' ')[1] : req.body['Enquiry-For']
            }<b>.
              </p>
              <p>
               ${req.body['Contact-form-Message'] ? req.body['Contact-form-Message'] : ''}  
              </p>
              <br />
              Here are my contacts:
              <p> Email: ${req.body['Email-id']}</p>
              <p>Telephone: ${req.body['Phone-Number'] ? req.body['Phone-Number'] + "<br />" : "<br />"}</p>
            </div>
          `
        })
        res.status(200).json({ message: 'Form submitted successfully' });
      })
      .catch((error) => {
        console.error('[Moongose Enquiry Save Error]: ', error);
        res.status(500).json({ message: 'Enquiry Save Failed' });
      })

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
  .then(() => {
    console.info('[Mongoose Connect] Successful')
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("[Moongose Connect Error] ", error);
  })


module.exports = app;