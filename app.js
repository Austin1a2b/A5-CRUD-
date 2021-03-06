//設定加載模組
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const restaurantData = require('./models/restaurantListData')

//載入靜態檔案
app.use(express.static('public'))
// 載入下一行 , 後續才能使用 req.body.
app.use(express.urlencoded({ extended: true }))

//設定使用樣板引擎
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//設定 port
const port = 3000

//設定 資料庫 
mongoose.connect('mongodb://localhost/restaurant_list')
const db = mongoose.connection
//連線狀態檢查
db.on('error', () => { console.log('mongodb error!') })
db.once('open', () => { console.log('connection success') })


//index 頁面路由架構  
app.get('/', (req, res) => {
  restaurantData.find()
    .lean()
    .then(restaurantsList => res.render('index', { restaurantsList: restaurantsList }))
    .catch(error => console.error(error))
})

// new 頁面- 新增一家餐廳
app.get('/restaurants/new', (req, res) => {
  res.render('new',)
})

//接收new的表單內容 , 並儲存到資料庫
app.post('/restaurants/new', (req, res) => {
  const { name, nameEn, category, location, phone, rating, image, description, googleMap } = req.body
  return restaurantData.create({ name, nameEn, category, location, phone, rating, image, description, googleMap })
    .then(res.redirect('/'))
    .catch(error => console.log(error))
})

//show 頁面路由架構 
app.get('/restaurants/show/:restaurant_id', (req, res) => {
  const restaurant_id = req.params.restaurant_id
  restaurantData.findById(restaurant_id)
    .lean()
    .then(restaurant => res.render('show', { restaurant: restaurant }))
    .catch(error => console.error(error))
})

// edit頁面 路由架構 
app.get('/restaurants/:restaurant_id/edit', (req, res) => {
  const restaurant_id = req.params.restaurant_id
  restaurantData.findById(restaurant_id)
    .lean()
    .then(restaurant => res.render('edit', { restaurant: restaurant }))
    .catch(error => console.error(error))
})

//接收表單資料,更新資料庫內容,=> 餐廳詳細資料的網頁
app.post('/restaurants/:restaurant_id/edit', (req, res) => {
  const restaurant_id = req.params.restaurant_id
  const { name, nameEn, category, location, phone, rating, image, description, googleMap } = req.body
  return restaurantData.findById(restaurant_id)
    .then(restaurantdata => {
      restaurantdata.name = name
      restaurantdata.nameEn = nameEn
      restaurantdata.category = category
      restaurantdata.location = location
      restaurantdata.phone = phone
      restaurantdata.image = image
      restaurantdata.description = description
      restaurantdata.rating = rating
      restaurantdata.googleMap = googleMap
      return restaurantdata.save()
    })
    .then(() => res.redirect(`/restaurants/show/${restaurant_id}`))
    .catch(error => console.error(error))
})

//刪除功能
app.post('/restaurants/:restaurant_id/delete', (req, res) => {
  const id = req.params.restaurant_id
  return restaurantData.findById(id)
    .then(restaurant => restaurant.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//搜尋功能 
app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  restaurantData.find()
    .lean()
    .then((restaurantList) => {
      const searchResult = restaurantList.filter(restaurant => {
        return (restaurant.name.toLowerCase().includes(keyword.toLowerCase()) ||
          restaurant.category.toLowerCase().includes(keyword.toLowerCase()))
      })
      res.render('index', { restaurantsList: searchResult })
    })
})

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})