var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User        = require("./models/user")

mongoose.connect("mongodb://localhost/yelp_camp_copy");
//mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");        //default template is 'ejs'

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	Description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);




         // PASSPORT CONFIGURATION 

app.use(require("express-session")({  //This is a new (:/) method to require the package with certains fixed values
	secret: "Karan is the best",//this is used to encode/decode the session data
	resave: false,///////////dont know what this does  GOOGLE IT!!
	saveUninitialized: false//AGAIN, GOOGLE IT
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); //give local strategy to passport
passport.serializeUser(User.serializeUser());     //serialize/deserialize comes from passport-local-mongoose
passport.deserializeUser(User.deserializeUser());




////////////////////////
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
///////////////////////




app.get("/",function(req,res){
	//console.log()
	res.render("landing");
});

//RESTFUL ROUTE : INDEX//
app.get("/campgrounds",isLoggedIn,function(req,res){
	//Get all campgrounds from the database
	var username = req.session.passport.user;
	Campground.find({},function(err,allCampgrounds){//-------------> //This will find all the objects in the database,
		if(err){                                    //-------------> //and will be used in the camprounds.ejs as 'campground' and will be printed out using cammpground.forEach()
			console.log(err);
		} else {
			res.render("campgrounds",{campgrounds : allCampgrounds,username:username});
			//console.log(req.headers);
		}
	});
	//res.render("campgrounds",{campgrounds : campgrounds}); ---------> Version 1 of this app(when theren was array instead of a database :/)
});


                                           //  ~ SECRET PAGES : TO BE ACCESSED BY USERS ONLY ~

//RESTFUL ROUTE : CREATE//
app.post("/campgrounds",isLoggedIn,function(req,res){
	//get data from form and add to campgrounds array  -------------> Version 1 of this app
	var name1 = req.body.name;
	var image1 = req.body.image;
	var Description = req.body.Description;
	var newCampground = {name : name1,image : image1, Description : Description};//   1 is added to clear the difference 
	//Push into CampgroundDatabase
	Campground.create(new Campground(newCampground),function(err,abc){ //-----------> Version 2 of this app
		if(err){
			console.log(err);
		} else {
			console.log("Item added to database!");
			console.log(abc);
		}
	});
	//campgrounds.push({name: req.body.name , image: req.body.image}); -----> Version 1 of the app
	
	//redirect to campground page//
	res.redirect("/campgrounds");       //default redirect is get request
});

//RESTFUL ROUTE : NEW//
app.get("/campgrounds/new",isLoggedIn,function(req,res){
	res.render("new");
});

//RESTFUL ROUTE : SHOW//
app.get("/campgrounds/:id",isLoggedIn,function(req,res){ //This get request should be after get request to /campgrounds/new
	//find the campground with provided id
	
	var id = req.params.id;
	console.log(id);
	Campground.findById(id,function(err,campground){
		if(err){
			console.log(err);
		} else {
			//render show template with that camp
			res.render("show",{campground : campground});
		}
	});
});	


                                                              // ~ Log In ~
app.get("/login",function(req,res){
	res.render("login");
});

app.post("/login",passport.authenticate("local",{
	failureRedirect : "/login",
	successRedirect : "/campgrounds"
}),function(req,res){});

                                                              //  ~ Sign Up ~

app.get("/signup",function(req,res){
	res.render("signup");
});

app.post("/signup",function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser,req.body.password,function(err,user){  //User.register is provided by passport-local-mongoose
		if(err){
			console.log(err);
			return res.redirect("/signup");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/login");
			console.log("New user added to database:");
			console.log(user);
		});
	});
});

                                                           //  ~ LOGOUT ~
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/login");
});


                                                           //  ~ SERVER START ~
app.listen(3000,function(){
	console.log("YelpCamp server started");
});