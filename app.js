//Initial setup
var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'), 
	methodOverride = require('method-override'),
	expressSanitizer = require('express-sanitizer');
	
// ****** APP CONFIG ******* 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
//connect mongoose
mongoose.connect('mongodb://localhost/recipe_app', {useMongoClient: true});
mongoose.Promise = global.Promise;
//method override config
app.use(methodOverride('_method'));
//express sanitizer config
app.use(expressSanitizer());

// ******* MONGOOSE CONFIG ******
//setup schema
var recipeSchema = new mongoose.Schema({
	name: String, 
	description: String,
	image: String,
	ingredients: String,
	procedure: String
});

//setup model 
var Recipe = mongoose.model("Recipe", recipeSchema);

/*
//test db - create sample data
Recipe.create({
	name:'Sage and Brown Butter Chicken',
	description: 'A few easy techniques will make tonight’s elegant dish an autumn favorite. To ensure even cooking, we’re roasting our hardier vegetables first: a duo of potatoes and honeynut squash (an exquisitely sweet, miniature butternut). Then, we’re adding apple and shallot for the last half of cooking—just long enough to soften their textures and lend their sweet aromas to the vegetables. Together with a pan sauce of brown (or toasted) butter and sage, it makes a hearty, warming accompaniment for crispy-skinned chicken.',
	image: 'https://media.blueapron.com/recipes/2544/square_newsletter_images/1505511304-1-0003-7267/1016_2PP_Seared-Chicken_87652_WEB_SQ_main_square_2x.jpg',
	ingredients: '1 cup carnolli rice, 2 eggs, 2 cloves garlic, 0.5 lbs broccoli, 2 tbsps butter, 2 tbsps Mascarpone Cheese, 2 tbsps toasted pistachios, 2 tbsps Verjus Blanc, 1 shallot, 0.75 oz Grana Pado Cheese',
	procedure: 'Prepare ingredients, Roast broccoli florets, Start Risotto, Finish Risotto, Cook and peel eggs, Finish and Plate your dish'
});
*/
	
// ******* ROUTES *******
app.get('/',function(req,res){
	res.render('landing');
});

// INDEX
app.get('/recipes', function(req,res){
	Recipe.find({}, function(err, recipes){
		if(err){
			res.render('error');
			console.log(err);
		} else {
			res.render('index', {recipes:recipes});
		}
	});
});

//NEW
app.get('/recipes/new', function(req,res){
	res.render('new');
});

//CREATE
app.post('/recipes', function(req,res){
	//express sanitizer
	req.body.recipe.body = req.sanitize(req.body.recipe.body);
	
	Recipe.create(req.body.recipe, function(err, newRecipe){
		if (err){
			res.render('error');
		} else {
			res.redirect('/recipes');
		}
	});
});

//SHOW
app.get('/recipes/:id', function(req,res){
	Recipe.findById(req.params.id, function(err, foundRecipe){
		if(err){
			res.render('error');
		} else {
			res.render('show', {recipes:foundRecipe});
		}
	});
});

//EDIT
app.get('/recipes/:id/edit', function(req,res){
	Recipe.findById(req.params.id, function(err, foundRecipe){
		if (err){
			res.render('error');
		} else {
			res.render('edit', {recipes:foundRecipe});
		}
	});
});

//UPDATE
app.put('/recipes/:id', function(req,res){
	//express sanitizer
	req.body.recipe.body = req.sanitize(req.body.recipe.body);
	
	Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err, updatedRecipe){
		if (err){
			res.render('error');
		} else {
			res.redirect('/recipes/' + req.params.id);
		}
	});
});

//DELETE
app.delete('/recipes/:id', function(req,res){
	Recipe.findByIdAndRemove(req.params.id, function(err){
		if (err){
			res.render('error');
		} else {
			res.redirect('/recipes');
		}
	});
});

app.get('*', function(req,res){
	res.render('error');
});

// ******* PORT LISTEN *******
app.listen(3000, 'localhost', function(req,res){
	console.log('Server is running!');
});
