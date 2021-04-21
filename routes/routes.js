const { Router } = require('express')
const {v4 : uuidv4} = require('uuid')
const {User,Tweet,Sessions} = require('../models/User')
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination:async function(req,file,cb){
        
        cb(null, path.join(__dirname , '..' ,'public'))
    },
    filename:async function(req,file,cb){
        
        let sess = await Sessions.findOne({where:{SID:req.cookies.SID}}).catch(err=> console.log(err))
        let original =file.originalname
        let extn = file.originalname
        extn = extn.lastIndexOf('.')
        ext = original.slice(extn,)
        //console.log(ext + ' ' + sess.userId)
        let tagname = 'dp' + sess.userId + ext
        await User.update({dpUrl:tagname},{where:{id:sess.userId}}).catch(err=> console.log(err))
        await Sessions.update({dpUrl:tagname},{where:{id:sess.userId}}).catch(err=> console.log(err))
        await User.findAll().then(user=>console.log(user))
        await Sessions.findAll().then(sess=>console.log(sess))
        cb(null, tagname )
    }
})
const upload = multer({storage:storage})
const router = Router()

//console.log(path.join(__dirname , '/..' ,'/public/'))
 
 
//gets home page 
router.get('/',async function(req, res) {
    let tweets = await Tweet.findAll({include: User}).catch(err=>console.log(err))
    let data ={tweets}
    //console.log(data)
    res.render('pages/index.ejs',data)
})
// gets create a user, sign up page
router.get('/createUser', function(req, res) {
    res.render('pages/createUser.ejs')
})
//posts create user details to db
router.post('/createUser', async function(req, res) {
    let { username, password } = req.body
   // console.log(req.body)
   
    await User.create({
        username,
        password,
        dpUrl: '/default.jpg'
    }).catch(err=>console.log(err))

    //console.log( user )

    res.redirect('/')
})

//gets login page
router.get('/login', async function(req, res) {
    res.redirect('/')
})

//posts login details to db for checking
router.post('/login', async function(req, res) {
    let { username, password } = req.body
    console.log(req.body)
    //check cookie exists
    if(req.cookies.SID == undefined){
        //check db if user exists
        let user_exists =  await User.findOne({where:{username:username,password:password}}).catch(err=>console.log(err))
    
        //console.log( user_exists  )
    
        if(user_exists){
            let id = uuidv4()
            //create cookie
            res.cookie('SID', id , {expires: new Date(Date.now() + 900000), httpOnly: true})
            //create session
           
            await Sessions.create({
                Username: user_exists.username,
                userId:user_exists.id ,
                SID: id,
                dpUrl: '/default.jpg',
                login: Date.now(),
                logout: null}).catch(err=>console.log(err))
               // await Sessions.findAll().then(s=> console.log(s))
                //set propic
        let data = {user_exists}
        //console.log(data)
        //console.log(user_exists.dpUrl)
            //route to createTweet page
            res.render('pages/createTweet.ejs',data)
        }
    
    }else{
        res.redirect('/logout')
    }

    
})
//gets tweet page
router.get('/createTweet', async function(req, res) {
    //console.log(req.file)
    //check cookie exists
    let cookies = req.cookies.SID
    if(cookies !== undefined && cookies !== null){
        let user_exists =  await Sessions.findOne({where:{SID:cookies}}).catch(err=>console.log(err))
        let data = {user_exists}
    res.render('pages/createTweet.ejs',data)
    }else{
        res.redirect('/error')
    }
})

//creates tweet
router.post('/createTweet', async function(req, res) {
    let cookie = req.cookies.SID
    let content = req.body.content
    console.log(content + cookie, "createTweet req.body")

    let session = await Sessions.findOne({where:{
        SID:cookie
        }
    }).catch(err=>console.log(err))

    console.log(session.dataValues.userId, 'createTweet User retrieval')

    if (session) {
        let tweet = await Tweet.create({
            tweet:content,
            timeCreated: new Date(),
            UserId: session.dataValues.userId
        }).then(s=> console.log(s)).catch(err=>console.log(err))

        res.redirect('/')
    } else {
        res.redirect('/error')
    }
})

//delete tweet
router.get('/delTweet', async function(req, res) {
    let tweetdelete = req.query.tweetdelete
//console.log(id)
    console.log(req.query, "createTweet req.body")

    let user = await Sessions.findOne({
        where: { SID:req.cookies.SID}
    }).catch(err=>console.log(err))

    console.log(user, 'deleteTweet User retrieval')
//only if session is active you can delete tweets
    if (user) {
        await Tweet.destroy({
            where: { id:tweetdelete}
        }).then(s=> console.log(s)).catch(err=>console.log(err))

        res.redirect('/')
    } else {
        res.redirect('/error')
    }
})

//upload dp
router.post('/profile',upload.single('propic'), async function(req, res) {
    console.log(req.file)
    let user_exists =  await Sessions.findOne({where:{SID:req.cookies.SID}}).catch(err=>console.log(err))
        let data = {user_exists}
    res.render('pages/createTweet.ejs',data)
})

// logs out user
router.get('/logout', async function(req, res) {
    //close session identified by cookies.SID
      await Sessions.update({logout: Date.now()}, {where:{SID:req.cookies.SID}}).catch(err=>console.log(err))
      await Sessions.findAll().then(sess=>console.log(sess))
   //destroy cookie
   res.cookie('SID', '' , {expires: new Date(Date.now() - 900000)})

      res.redirect('/')
}) 

//errors
router.get('/error',function(req,res){
    res.render('pages/error.ejs')
})

//404
router.all('*',function(req,res){
    res.render('pages/error.ejs')
})

module.exports = router