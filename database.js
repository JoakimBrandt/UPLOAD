const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('thelords_db.db')

const createBlogTableQuery = "CREATE TABLE IF NOT EXISTS blog_table (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, Post TEXT NOT NULL)"
const createGuestBookTableQuery = "CREATE TABLE IF NOT EXISTS guest_book_table (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT NOT NULL, Content TEXT NOT NULL, Author TEXT NOT NULL)"
const createGalleryTableQuery = "CREATE TABLE IF NOT EXISTS gallery_table (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT, Text TEXT, Path TEXT)"

db.run(createGuestBookTableQuery, function(error) {
    if(error) console.log("Database says " +error.message)
    else{console.log("Successfully created table 'Guest Book'")}
})

db.run(createGalleryTableQuery, function(error) {
    if(error) console.log("Database says ", +error.message)
    else{console.log("Successfully created table 'Gallery Table'")}
})

db.run(createBlogTableQuery, function(error) {
    if(error) console.log("Database says " +error.message)
    else{console.log("Successfully created table 'Blog'")}
})

exports.writeGuestBookEntry = function(title, content, author) {

    const insertQuery = "INSERT INTO guest_book_table(Title, Content, Author) VALUES(?, ?, ?)"

    db.run(insertQuery, [title, content, author], function(error) {
        if(error) console.log("Database says " +error.message)
        else{console.log("Successfully created guest book entry to Guest Book")}
    })
}

exports.writeBlogPost = function(title, content) {

    const insertQuery = "INSERT INTO blog_table(Title, Post) VALUES(?, ?)"

    db.run(insertQuery, [title, content], function(error) {
            if(error) console.log("Database says " +error.message)
            else{console.log("Successfully created the insertion to Blog")}
    })
}

exports.uploadPicture = function(title, text, path) {

    const insertQuery = "INSERT INTO gallery_table (title, text, path) VALUES (?, ?, ?)"

    db.run(insertQuery, [title, text, path], function(error) {
        if(error) console.log("Could not insert picture into gallery table, " +error.message)
        else{ console.log("Picture successfully uploaded") }
    })
}

exports.getAllBlogPosts = function(callback) {

    const getQuery = "SELECT * FROM blog_table ORDER BY id DESC"

    db.all(getQuery, function(error, blog) {
        if(error) console.log("Database says " +error.message)
        else { callback(error, blog) }
    })
}

exports.getAllGuestBookEntries = function(callback) {

    const getQuery = "SELECT * FROM guest_book_table ORDER BY id DESC"

    db.all(getQuery, function(error, entries) {
        if(error) console.log("Database says " +error.message)
        else {callback(error, entries)}
    })
}

exports.getSpecificGalleryPostByID = function(id, callback) {

    const getQuery = "SELECT * FROM gallery_table WHERE Id = ?"

    db.get(getQuery, [id], function(error, galleryPost) {
        if(error)  console.log("Could not get the specific gallery entry, " +error.message)
        else{ callback(error, galleryPost) }
    })
}

exports.getSpecificBlogPostByID = function(id, callback) {

    const getQuery = "SELECT * FROM blog_table WHERE Id = ?"

    db.get(getQuery, [id], function(error, blogPost) {
        if(error) console.log("Could not get the specific blog entry, " +error.message)
        else{ callback(error, blogPost) }
    })
}

exports.getSpecificGBPostByID = function(id, callback) {
    const getQuery = "SELECT * FROM guest_book_table WHERE Id = ?"

    db.get(getQuery, [id], function(error, guestbookPost) {
        if(error) console.log("Could not get the specific guest book entry, " +error.message)
        else { callback(error, guestbookPost) }
    })
}

exports.getAllGalleryPosts = function(callback) {

    const getGalleryQuery ="SELECT * FROM gallery_table ORDER BY id DESC"

    db.all(getGalleryQuery, function(error, gallery) {
        if(error) console.log("Database says " +error.message)
        else{ callback(error, gallery) }
    })
}

exports.deleteBlogPostByID = function(id, callback) {

    const deleteQuery = "DELETE FROM blog_table WHERE Id = ?"

    db.run(deleteQuery, [id], function(error) {
        if(error) console.log("Could not delete entry from database, " +error.message)
        else {
            console.log("Entry deleted")
            callback(error) }
    })
}

exports.deleteGalleryByID = function(id, callback) {

    const deleteQuery = "DELETE FROM gallery_table WHERE Id = ?"

    db.run(deleteQuery, [id], function(error) {
        if(error) console.log("Could not delete picture from database, " +error.message)
        else{
            console.log("Picture deleted")
            callback(error) }
    })
}

exports.deleteGBEntryByID = function(id, callback) {

    const deleteQuery = "DELETE FROM guest_book_table WHERE Id = ?"

    db.run(deleteQuery, [id], function(error) {
        if(error) console.log("Could not delete entry from database, " +error.message)
        else{
            console.log("Entry deleted")
            callback(error)}
    })
}

exports.updateBlogPostByID = function(newTitle, newContent, id, callback) {

    const updateQuery = "UPDATE blog_table SET Title = ?, Post = ? WHERE Id = ?"

    db.run(updateQuery, [newTitle, newContent, id], function(error) {
        if(error) console.log("Database says updateBlogPostByID", +error.message)
        else{
            console.log("Successfully updated the blog post")}
            callback(error)
    })
}

exports.updateGalleryById = function( newTitle, newContent, id, callback) {

    const updateQuery ="UPDATE gallery_table SET Title = ?, Text = ? WHERE Id = ?"

    db.run(updateQuery, [newTitle, newContent, id], function(error) {
        if(error) console.log("Database says ", +error.message)
        else{
            console.log("Successfully updated the gallery")}
            callback(error)
    })
}

exports.updateGuestBookEntryByID = function(newTitle, newContent, id, callback) {
    const updateQuery="UPDATE guest_book_table SET Title = ?, Content = ? WHERE Id = ?"

    db.run(updateQuery, [newTitle, newContent, id], function(error) {
        if(error) console.log("Database says ", +error.message)
        else{
            console.log("Successfully updated the entry")}
            callback(error)
    })
}