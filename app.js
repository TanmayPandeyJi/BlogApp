var express= require("express");
var mongoose= require("mongoose");
var passport= require("passport");
var LocalStrategy= require("passport-local");
var passportLocalMongoose= require("passport-local-mongoose");
var flash = require("connect-flash");
var bodyParser= require("body-parser");
var app=express();
var methodOverride= require("method-override");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// mongoose.connect("mongodb://localhost/restful_blog_app");
mongoose.connect("mongodb+srv://Tanmay:tanmay@cluster0-jhx5n.mongodb.net/test?retryWrites=true&w=majority");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	author: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

var UserSchema = new mongoose.Schema({
	// firstName: String,
	// lastName: String,
	username: String,
	password: String
});

UserSchema.plugin(passportLocalMongoose);

var User= mongoose.model("User", UserSchema);


app.use(require("express-session")({
	secret: "Blogs are boring",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.get("/",function(req,res){
     	res.redirect("/blogs");
});


app.get("/blogs",function(req,res){
	Blog.find({},function(err, blogs){
		if(err){
			console.log(err);
		}else {
			res.render("index",{blogs: blogs});
		}
	});
});

app.get("/blogs/new",isLoggedIn, function(req,res){
	res.render("new");
});


app.post("/blogs",isLoggedIn, function(req,res){
	Blog.create(req.body.blog, function(err, newBlog){
	if(err){
		res.render("new");
	}	else {
		req.flash("success","Blog added successfully!");
		res.redirect("/blogs");
	}
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else {
			res.render("show", {blog: foundBlog});
		}
	});
});
app.get("/blogs/:id/edit", checkBlogOwnership, function(req,res){
	Blog.findById(req.params.id, function(err, editBlog){
		if(err){
			res.redirect("/blogs");
		}else {
			res.render("edit", {blog: editBlog});
		}
	});
});

app.put("/blogs/:id",checkBlogOwnership, function(req,res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			re.redirect("/blogs");
		} else {
			req.flash("success","Blog edited successfully!");
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id",checkBlogOwnership, function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err)
			{
				res.redirect("/blogs");
			}
		else {
			req.flash("success","Blog deleted successfully!");
			res.redirect("/blogs");
		}
	});
});


app.get("/register", function(req,res){
	res.render("register");
});

app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err.message);
			req.flash("error", err.message);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to Blog Site" + user.username);
			res.redirect("/blogs");
		});
	});
});

app.get("/login", function(req, res){
	res.render("login");
});

app.post("/login", passport.authenticate("local",
	{
	  successRedirect: "/blogs",
	  failureRedirect: "/login",
	successFlash: "Welcome to the Blog Site!",
	failureFlash: "Please enter correct username or password!"
}), function(req, res){
});

app.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/blogs");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that");
	res.redirect("/login");
}


function checkBlogOwnership(req, res, next){
	if (req.isAuthenticated()){
		Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			req.flash("error","Campground not found")
			res.redirect("back");
		} else{
			if(foundBlog.author===req.user.username){
			next();
			} else {
				req.flash("error","You don't have permission to do that!");
				res.redirect("/blogs/" + req.params.id);
			}
		}
	});
	} else {
		req.flash("error","You need to be logged in to do that!");
		res.redirect("/blogs/" + req.params.id);
	}
}


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The BlogApp Server Has Started!");
});