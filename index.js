const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path')
const manga = require('./routers/manga')
const chapter = require('./routers/chapter')
const comic = require('./routers/comic')
const cors = require('cors')

app.use(cors())
app.use('/api',manga,require('./routers/handleError'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
app.use(express.urlencoded({ extended:false}))
app.use('/api',comic)
app.use('/api/chapter',chapter)
app.listen(PORT, function () {
    console.log('Listening on PORT:'+ PORT)
})