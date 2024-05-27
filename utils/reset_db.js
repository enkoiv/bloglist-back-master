const mongoose = require('mongoose')
const config = require('./config')
const User = require('../models/user')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')


const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }
]

async function main() {
    console.log(`Connecting to MongoDB at ${config.MONGODB_URI}`)
    mongoose.set('strictQuery', false);
    try {
        await mongoose.connect(config.MONGODB_URI)
        console.log(`connected to MongoDB`)
    } catch (error) {
        console.log("Connecting to mongodb failed: ", error.toString())
        console.log("Did you remember to add your own .env file with MONGODB_URI?")
        process.exit(1)
    }

    console.log("Deleting all users")
    await User.deleteMany({})
    console.log("Deleting all blogs")
    await Blog.deleteMany({})

    const password = "password"
    const passwordHash = await bcrypt.hash(password, 10)


    const user = new User({
        username: "user",
        name: "Demo User",
        passwordHash
    })

    console.log(`Creating new user "${user.name}" with username: "${user.username}" and password: "${password}"`)
    await user.save()
    console.log(`Adding ${initialBlogs.length} blogs with "${user.name}" as user`)
    const saves = initialBlogs.map(blog => new Blog({ ...blog, user: user._id }).save())
    const blogs = await Promise.all(saves)
    console.log(`Adding blogs to the user's "${user.name}" bloglist`)
    user.blogs = user.blogs.concat(blogs.map(b => b._id))
    await user.save()
    console.log(`Closing connection to MongoDB, there should be now ${user.name} with ${blogs.length} blogs`)
    console.log("Remember, that your .env file should contain also your SECRET for JWT token signing!")
    mongoose.connection.close()
}

main()