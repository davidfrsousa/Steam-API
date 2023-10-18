import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

//URL of steam api
const STEAM_API = "https://api.steampowered.com";
const STORE_API = "https://store.steampowered.com/api";

//use static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Server listen on port 3000
app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});

//Initial request to homepage, render index page
app.get('/', (req,res)=>{  
    res.render('index.ejs');
});

//Express route, POST request to search appid of game
app.post('/searchId', async (req,res)=>{
    //read and store name requested
    const name = req.body['name'];
    try{
        //create get request through axios
        const result = await axios.get(`${STEAM_API}/ISteamApps/GetAppList/v2/`);
        //store apps list
        const list = result.data.applist.apps;
        //create content list to be passed to front-end
        let content = [];
        //iterate through list of ids and search for names that include what was requested
        list.forEach(element => {
            if(element.name.includes(name)){
                //push elements that includes name requested to the list
                content.push({id:element.appid,name:element.name});
            }
        });
        //render index page and pass content list to front-end
        res.render('index.ejs',{content});
    }catch(error){
        //logs error in console
        console.log(error.response.data);
        //render index page with no content
        res.render('index.ejs');
    }
});

//Express route, POST request to search info of specific appid
app.post('/searchInfo', async (req,res)=>{
    //read and store appid requested
    const appid = req.body['appid'];
    try {
        //create get request to steam api through axios
        const result = await axios.get(`${STORE_API}/appdetails/?appids=${appid}`);
        //store name of request appid
        const name = result.data[appid].data.name;
        //store appid
        const s_appid = result.data[appid].data.steam_appid;
        let price;
        //checks if there's a price for set game, if not set price to free
        if(result.data[appid].data.price_overview){
            price = result.data[appid].data.price_overview.final_formatted;    
        }else{
            price = 'Free';
        }
        //store image of game to be passed to front-end
        const image_prof = result.data[appid].data.screenshots[0].path_full;
        //store genre of game
        const genre = result.data[appid].data.genres[0].description;
        //render index page with content passed to front-end
        res.render('index.ejs',{name: name, appid:s_appid, price: price, image:image_prof, genre:genre});
    } catch (error) {
        //logs error to console
        console.log(error.message);
        //render index page with no arguments
        res.render('index.ejs');
    }
});