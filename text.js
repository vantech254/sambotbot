const req = require('request');
var word = "complex";
var dictionary_api_url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
req(dictionary_api_url, function(err,response,  body){
    if(err)
    {
        console.log("Internal Server Error!");
    }else
    {
        
        const parsed = JSON.parse(body);
        let phonetic = parsed[0].phonetic;
        let audio_url_chunk = parsed[0].phonetics[0].audio;
        let audio_url = "https:"+audio_url_chunk;
        let array_res =[];
        for(var i=0; i<parsed[0].meanings.length; i++)
        {
            var partOfSpeech = parsed[0].meanings[i].partOfSpeech;
            var definition = parsed[0].meanings[i].definitions[0].definition;
            array_res.push([partOfSpeech, definition])
        }
        console.log(array_res);
        for(var i = 0; i<array_res.length; i++)
        {
            array_res[i].join(" ;");
            console.log(array_res[i]);
        }
        
    }

});