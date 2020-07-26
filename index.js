const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const manga = require('./routers/manga')
const chapter = require('./routers/chapter')
const cors = require('cors')

app.use(cors())
app.use('/api',require('./routers/handleError').router,manga)
app.use(express.static('./public'))
app.use('/api/chapter',chapter)
app.listen(PORT, function () {
    console.log('Listening on PORT:'+ PORT)
})