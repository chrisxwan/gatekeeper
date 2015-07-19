var Twitter = require('twitter-node-client').Twitter;
var natural = require('natural');


/* MUST HAVES */
/** Step 1. Grab Twitter trending tweets globally (excluding hashtags)
  * Step 2. Parse the HTML DOM using jQuery. 
  *         Grab elements with ID substring "hyperfeed_story_id" > Grab p tag > Concatenate
  * Step 3. Use Natural to evaluate similarities
  * Step 4. Write background process to detect AJAX load
  */

/* NICE TO HAVES */
/** 1. Degree of conservatism.
  * 2. Permanent storage.
  */