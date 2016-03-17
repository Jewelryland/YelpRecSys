# Notes on the Dataset
	
Each file is composed of a single object type, one json-object per-line.
	
Take a look at [some examples](https://github.com/Yelp/dataset-examples) to get you started.

## MetaData

### Cities
   
- U.K.: (0)Edinburgh 
- Germany: (1)Karlsruhe
- Canada: (2)Montreal and (3)Waterloo
- U.S.: (4)Pittsburgh, (5)Charlotte, (6)Urbana-Champaign, (7)Phoenix, (8)Las Vegas, (9)Madison

### Global Means

- Global Mean Rating of Users: 
- Global Mean Rating of Businesses:

	
## business
> Opening Businesses: 66878
>
> 
 
	/*
		if 'open' is False then ignore the business.
		We have the following 12 states:
			AZ 28125 / NV 18226 / ON 430 / WI 2384 /
			 QC 4416 / SC 226 / EDH 2743 / PA 3211 / 
			 MLN 136 / BW 983 / NC 5346 / IL 604
		Other 16 states with business amount less than 100 has been removed.
		
	*/
	
	{
	    'type': 'business',
	    'business_id': (encrypted business id), // [0-9a-zA-z_\-] * 22
	    'name': (business name),
	    'neighborhoods': [(hood names)], // 0-3 in list
	    //'full_address': (localized address),
	    'city': (city),
	    'state': (state),
	    //'latitude': latitude,
	    //'longitude': longitude,
	    'stars': (star rating, rounded to half-stars),
	    'review_count': review count,
	    'categories': [(localized category names)]
	    'open': True / False (corresponds to closed, not business hours),
	    'hours': {
	        (day_of_week): {
	            'open': (HH:MM),
	            'close': (HH:MM)
	        },
	        ...
	    }, //simply to opening on weekends or not
	    'attributes': {
	        (attribute_name): (attribute_value),
	        ...
	    }, //not using these first, but may take into consider later
	}
	

## review	
> May have redundant businesses that has permanently closed.
> 
> Simply votes to a total num.
	
	{
	    'type': 'review',
	    'review_id': ([0-9a-zA-z_\-] * 22)
	    'business_id': (encrypted business id),
	    'user_id': (encrypted user id),
	    'stars': (star rating, rounded to int-stars),
	    'text': (review text),
	    'date': (date, formatted like '2012-03-14'),
	    'votes': {(vote type): (count)},
	}
	
	
## user
	
> User num: 552339
> 
> Each year's elite user num: {2005: 119, 2006: 700, 2007: 1904, 2008: 2921, 2009: 5168, 2010: 8215, 2011: 10232, 2012: 13623, 2013: 14130, 2014: 15416, 2015: 18236}
> 
> Total elite users num: 31461
>
> Avg elite user's year num of being elite: 2.88
>
> Avg compliment num a user receives: 19.996
>
> Avg compliment num an elite user receives: 305.638
>
> Compliment Types: {'photos', 'writer', 'cool', 'list', 'profile', 'funny', 'plain', 'hot', 'note', 'more', 'cute'}
> 
> Votes Num Count: {'useful': 28260265, 'funny': 13701046, 'cool': 15504328}
	
	{
	    'type': 'user',
	    'user_id': (encrypted user id), //[0-9a-zA-z_\-] * 22
	    'name': (first name),
	    'review_count': (review count),
	    'average_stars': (floating point average, like 4.31),
	    'votes': {(vote type): (count)}, //"funny", "useful" and "cool" types => regard as equal
	    'friends': [(friend user_ids)],
	    'elite': [(years_elite)],
	    'yelping_since': (date, formatted like '2012-03'),
	    'compliments': {
	        (compliment_type): (num_compliments_of_this_type),
	        ...
	    },
	    'fans': (num_fans),
	}
	
## check-in	
> Congregate `checkin_info` to a total number,
>  and merge these info into `TABLE business`;
> 
>  without timestamp this info is not very useful.

	{
	    'type': 'checkin',
	    'business_id': (encrypted business id),
	    'checkin_info': {
	        '0-0': (number of checkins from 00:00 to 01:00 on all Sundays),
	        '1-0': (number of checkins from 01:00 to 02:00 on all Sundays),
	        ...
	        '14-4': (number of checkins from 14:00 to 15:00 on all Thursdays),
	        ...
	        '23-6': (number of checkins from 23:00 to 00:00 on all Saturdays)
	    }, # if there was no checkin for a hour-day block it will not be in the dict
	}
	
	
## tip
	
	{
	    'type': 'tip',
	    'text': (tip text),
	    'business_id': (encrypted business id),
	    'user_id': (encrypted user id),
	    'date': (date, formatted like '2012-03-14'),
	    'likes': (count), # a cold usage?
	}
	
## photos (from the photos auxiliary file)
	
	This file is formatted as a JSON list of objects.
	
	[
	    {
	        "photo_id": (encrypted photo id),
	        "business_id" : (encrypted business id),
	        "caption" : (the photo caption, if any),
	        "label" : (the category the photo belongs to, if any)
	    },
	    {...}
	]