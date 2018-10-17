const express = require('express')
const session = require('express-session')
const connectSqlite3 = require('connect-sqlite3')
const SQLiteStore = connectSqlite3(session)
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressHandlebars = require('express-handlebars')
const fileUpload = require('express-fileupload')
const db = require('./database')
const app = express()
const fs = require('fs')
const bcrypt = require('bcryptjs')
const csrf = require('csurf')

function hashPassword() {

    const password = '123'

    const salt = bcrypt.genSaltSync(10)

    const hash = bcrypt.hashSync(password, salt)

    return hash
}

function comparePassword(userPassword) {

    const hash = hashPassword()

    if (bcrypt.compareSync(userPassword, hash))
        return true
    else
        return false
}

app.use(cookieParser('joakim'))

const csrfProtection = csrf({ cookie: true })

app.use(express.static("public/assets/images"))

app.use(session({
    store:  new SQLiteStore({db: "session-db.db"}),
    secret: 'joakim',
    cookie: {maxAge: 6000000},
    saveUninitialized: false,
    resave: false
}))

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static("public"))

app.use(fileUpload())

app.get("/create-cookie", function(request, response){
    response.cookie("lastVisit", {maxAge: 6000000})
})

app.get("/log-cookie", function(request, response){
    const lastVisit = parseInt(request.cookies.lastVisit)
})

app.engine('hbs', expressHandlebars({
    defaultLayout: 'main',
    extname: '.hbs'
}))

//___________________________________________________________//

app.post('/login', csrfProtection, function(request, response) {

    if (request.body.userName == "Joakim") {

        if (comparePassword(request.body.password)) {

            request.session.isLoggedIn = true

            const model = {
                isLoggedIn: request.session.isLoggedIn,
                csrfToken: request.csrfToken
            }
            response.render("admin_page.hbs", model)
        }
        else {
            response.status(406).send("Error code 422, Wrong credentials entered")
        }
    }

    else{
        response.status(406).send("Error code 422, Wrong credentials entered")
    }
})


app.post('/editGallery/:id', csrfProtection, function(request, response) {

    db.updateGalleryById(request.body.newGalleryTitle, request.body.newGalleryContent, request.params.id, function() {
    })
    response.render("admin_page.hbs", {})
})

app.post('/editBlogPost/:id', csrfProtection, function(request, response) {

    db.updateBlogPostByID(request.body.newBlogTitle, request.body.newBlogContent, request.params.id, function() {
    })
    response.render("admin_page.hbs", {})

})

app.post('/editGuestBook/:id', csrfProtection, function(request, response) {

    db.updateGuestBookEntryByID(request.body.newGuestBookTitle, request.body.newGuestBookContent, request.params.id, function() {
    })
    response.render("admin_page.hbs", {})

})

app.post('/deleteBlogPostByID/:id', csrfProtection, function(request, response) {

    db.deleteBlogPostByID(request.params.id, function() {
    })

    response.redirect("../blog")
})

app.post('/deleteGBEntryByID/:id', csrfProtection, function(request, response) {

    db.deleteGBEntryByID(request.params.id, function() {
    })

    response.redirect("../guest_book")
})

app.post('/deleteGalleryPostByID/:id/:id2', csrfProtection, function(request, response) {

    fs.unlinkSync('public/assets/images/'+request.params.id2)

    db.deleteGalleryByID(request.params.id, function() {
        response.redirect("/gallery")
    })
})

app.post('/writeGuestBookEntry', csrfProtection, function(request, response) {

    db.writeGuestBookEntry(request.body.guestbookTitle, request.body.guestbookContent, request.body.guestbookAuthor, function(error) {
        if(error)
            response.status(500).send("Internal server error, error code: 500" +error.message)
    })
    response.redirect("../guest_book")
})

app.post('/uploadPicture', csrfProtection, function(request, response) {

    if(!request.files)
        return response.status(400).send("No files were uploaded")

    let file = request.files.sampleFile
    let filename = request.files.sampleFile.name

    db.uploadPicture(request.body.pictureTitle, request.body.pictureText, filename, function(error) {
    })

    file.mv('./public/assets/images/'+filename, function(error) {
        if(error) return response.status(500).send("Internal server error, error code: 500" +error.message)
        else {
            response.render("admin_page.hbs")
        }
    })
})

app.post('/writeBlogPost', csrfProtection, function(request, response) {

    db.writeBlogPost(request.body.blogTitle, request.body.blogText, function(error) {
        if (error)
            response.status(500).send("Internal server error, error code: 500")
    })
    response.render("admin_page.hbs", {})
})

//___________________________________________________________//

app.get('/home', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    response.render("home.hbs", model)
})

app.get('/about', csrfProtection,  function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }
    response.render("about.hbs", model)
})

app.get('/blog', csrfProtection, function(request, response) {

    db.getAllBlogPosts(function(error, blog) {
        const model = {
            blogpost: blog,
            csrfToken: request.csrfToken(),
            isLoggedIn: request.session.isLoggedIn
        }
        response.render("blog.hbs", model)
    })
})

app.get('/gallery', csrfProtection, function(request, response) {

    db.getAllGalleryPosts(function(error, gallery) {
        if(error)
            response.status(500).send("Error code 500, Internal server error")

        else {
            const model = {
                gallery: gallery,
                csrfToken: request.csrfToken,
                isLoggedIn: request.session.isLoggedIn
            }
            if(!model.gallery)
                response.status(500).send("Error code 500, Internal server error")

            response.render("gallery.hbs", model)
        }
    })
})

app.get('/guest_book', csrfProtection, function(request, response) {

    let counter  = 1
    if(request.session.counter)
        counter = request.session.counter + 1
    request.session.counter = counter

    db.getAllGuestBookEntries(function(error, guestbook) {
        if(error)
            response.status(500).send("Error code 500, Internal server error")

        else{
            const model = {
                entries: guestbook,
                csrfToken: request.csrfToken,
                isLoggedIn: request.session.isLoggedIn
            }
            response.render("guest_book.hbs", model)
        }
    })
})

app.get('/login', csrfProtection, function(request, response) {

    if(request.session.isLoggedIn)
        response.render("home.hbs", {})

    else {
        const model= {
            csrfToken: request.csrfToken
        }
        response.render("login.hbs", model)
    }
})

app.get('/logout', function(request, response) {

    if (request.session.isLoggedIn === true) {
        request.session.isLoggedIn = false
        response.render("home.hbs")
    }
    else response.render("login,hbs")

})

app.get('/admin_page', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("admin_page.hbs", model)

    else{response.render("login.hbs", {})}
})

app.get('/new_blogpost', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("new_blogpost.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/new_gallery', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("new_gallery.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/edit_gallery', csrfProtection, function(request, response){

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("edit_gallery.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/edit_blogpost', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("edit_blogpost.hbs", model)
    else
        response.render("login.hbs")
})

app.get('/editguestbook', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("editguestbook.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/editGalleryPostByID/:id', csrfProtection, function(request, response) {

    const model = {
        isLoggedIn: request.body.isLoggedIn,
        csrfToken: request.csrfToken,
        galleryPost: null
    }

    db.getSpecificGalleryPostByID(request.params.id, function(error, galleryPost) {
        if(!model.galleryPost)
            response.status(500).send("Error code 500, Internal server error")
        model.galleryPost = galleryPost
        response.render("edit_gallery.hbs", model)
    })
})

app.get('/editBlogPostByID/:id', csrfProtection, function(request, response) {

    const model = {
        isLoggedIn: request.body.isLoggedIn,
        csrfToken: request.csrfToken,
        blogPost: null
    }

    db.getSpecificBlogPostByID(request.params.id, function(error, blogPost){
        if(error)
            response.status(500).send("Internal server error, error code: 500" +error.message)
        else if(!model.blogPost)
            response.status(500).send("Error code 500, Internal server error")
        model.blogPost = blogPost
        response.render("edit_blogpost.hbs", model)
    })
})

app.get('/editGBEntryByID/:id', csrfProtection, function(request, response) {

    const model = {
        isLoggedIn: request.body.isLoggedIn,
        csrfToken: request.csrfToken,
        guestbookPost: null
    }

    db.getSpecificGBPostByID(request.params.id, function(error, guestbookPost) {
        if(error)
            response.status(500).send("Internal server error, error code: 500" +error.message)
        model.guestbookPost = guestbookPost
        response.render("editguestbook.hbs", model)
    })

})

app.get('/delete_blogpost', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("delete_blogpost.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/delete_guestbook', csrfProtection, function(request, response) {

    const model = {
        csrfToken: request.csrfToken,
        isLoggedIn: request.session.isLoggedIn
    }

    if(request.session.isLoggedIn)
        response.render("delete_guestbook.hbs", model)
    else
        response.render("login.hbs", {})
})

app.get('/*', function(request, response) {

    response.render("error.hbs", {})
})

app.listen(8080)