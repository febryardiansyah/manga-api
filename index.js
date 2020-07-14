const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const manga = require('./routers/manga')
const chapter = require('./routers/chapter')
const comic = require('./routers/comic')

app.use('/api',manga)
app.use('/api',comic)
app.use('/api/chapter',chapter)
app.listen(PORT, function () {
    console.log('Listening on PORT:'+ PORT)
})