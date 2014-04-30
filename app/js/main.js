//create self excuting function so all the code is scoped to this function
(function () {

	// declare some global variables
	var Forecast,
	Forecasts,
	SearchView,
	ForecastView,
	ForecastItemView;


	// define extension to backbone model
	Forecast = Backbone.Model.extend({

		url: function () {
			return "http://api.wunderground.com/api/7eaec3b21b154448/conditions/q/" + this.get("zip") + ".json";
		},

		// what to do when we sync data
		sync: function (method, model, options) {
			options.dataType = 'jsonp';
			return Backbone.sync(method, model, options);
		},

		// how to check 
		validate: function (options) {
			// do a simple check
			if (!options.zip) {
				//return and error
				return "Please enter zip code";
			}
		},

		// what to do next
		parse: function (data, request) {
			var observation = data.current_observation;
			return {
				id: observation.display_location.zip,
				url: observation.icon_url,
				state: observation.display_location.state_name,
				zip: observation.display_location.zip,
				city: observation.display_location.city,
				temperature: observation.temp_f,
				wind: observation.wind_mph,
				feelslike: observation.feelslike_f,
				image: observation.image.url
			}
		}
	});

	// define collection here
	Forecasts = Backbone.Collection.extend({
		model: Forecast
	});

	// setting everyting that happens in the search view to be this code
	SearchView = Backbone.View.extend({
		events: {
			'click #search': 'addZip'
		},
		initialize: function () {
			this.collection.on('add', this.clear, this);
		},
		// called whenever we click on the search button
		addZip: function (e) {
			e.preventDefault();
			this.model = new Forecast();
			// check below to see if a zipcode is in the value
			if(this.model.set({zip: this.$('#zip').val()})) {
				this.collection.add(this.model);
			}		
},
// add utlitiy function 
clear: function () {
	this.$('#zip').val('');
}
	});

ForecastView = Backbone.View.extend({
	// what it's listening for...
	events: {
		'click .delete': 'destroy'
	},
	initialize: function () {
		// run our own custom render methods... this actually allow us to interact w/ our HTML
		this.collection.on('add', this.render, this);
		this.collection.on('remove', this.remove, this);
	},
	// this is the data that goes in the 'tr' tag
	render: function (model) {
		var view = new ForecastItemView({
			id: model.get('zip'),
			model: model 
		});

		// append that individual forecast to our table body
		// find it's parent and tell it to fade in slow (backbone + underscore)
		
		// this is the data that goes in the 'tr' tag
		this.$('tbody')
		.append(view.el)
		.closest('table')
		.fadeIn('slow');
		// a way to make sure we are always passing along in this forecastview
		return this;
	}, 
	remove: function (model) {
		// just using jquery to get the model that has that id and remove it
		$('#'+ model.get('zip')).remove();
		if (!this.collection.length) {
			// now if out collection is empty then fade it out
			this.$el.fadeOut('slow');
		}
	},
	destroy: function (e) {
		var id = $(e.currentTarget).closet('tr').attr('id'),
		// now get the model with that info from the collection
		model = this.collection.get(id);

		this.collection.remove(model);
	}
});

ForecastItemView = Backbone.View.extend({
	tagName: 'tr',
	// must match with HTML ID tags
	template: _.template($('#forecast-template').html()),
	initialize: function () {
		// binding one method to this view
		_.bindAll(this, 'render');
		this.model.fetch({
			success: this.render
		})
	},
	// now that it's successful, render data out
	render: function (model) {
		// marry this data with the template
		var content = this.template(model.toJSON());
		// put that married template into our tr tag
		this.$el.html(content);
		return this;
	}
});


// now we are actually going to USE or DEFINED FORECAST COLLECTION
var forecasts = new Forecasts();
var searchView = new SearchView({
	el: $('#weather'),
	collection: forecasts
});

// CREATE + INSTATITATIE A NEW SEARCH VIEW
var forecastView = new ForecastView({
	// attach that to an element
	el: $('#output'),
	// tie to the collection forecasts
	collection: forecasts
});



})();



















