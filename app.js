var express= require("express");
var mongoose= require("mongoose");
var bodyParser= require("body-parser");
var app=express();
var methodOverride= require("method-override");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb://localhost/restful_blog_app");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
// 	image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
// 	body: "HELLO THIS IS A BLOG POST!"
// });
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

app.get("/blogs/new", function(req,res){
	res.render("new");
});


app.post("/blogs", function(req,res){
	Blog.create(req.body.blog, function(err, newBlog){
	if(err){
		res.render("new");
	}	else {
		res.redirect("/blogs");
	}
	});
});

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.render("/blogs");
		}else {
			res.render("show", {blog: foundBlog});
		}
	});
});
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, editBlog){
		if(err){
			res.render("/blogs");
		}else {
			res.render("edit", {blog: editBlog});
		}
	});
});

app.put("/blogs/:id", function(req,res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			re.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err)
			{
				res.redirect("/blogs");
			}
		else {
			res.redirect("/blogs");
		}
	});
});



app.listen(3000,function(req,res){
	console.log("Blog App has started!");
});