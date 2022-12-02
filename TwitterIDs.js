const dotenv = require('dotenv');
const delay = require('delay');
dotenv.config();

const { Client, auth } = require("twitter-api-sdk");

const twitterClient = new Client(process.env.TWITTER_BEARER_TOKEN);
const twitterUrls = ['https://twitter.com/capsule_house', 'https://twitter.com/TheHashmasks', 'https://twitter.com/Supremekongnft', 'https://twitter.com/MetabloxNetwork', 'https://twitter.com/MekaVerse'];
const getTwitterId = async (username)=>{
    try {
        const usernameLookup = await twitterClient.users.findUserByUsername(
          username, {"user.fields" : ['id']}
        );
        console.log(usernameLookup);
        // twitterIDs.push(usernameLookup.data.id);
        twitterIDs[usernameLookup.data.username] = usernameLookup.data.id;
      } catch (error) {
        console.log(error);
      }
}
const getTwitterIds = async()=>{
    await delay(2000);
    console.log(twitterIDs);
}
var twitterIDs = {};
// var twitterIDs = [];
twitterUrls.forEach((e, ind)=>{
    let username = e.substring(20);
    let userID = getTwitterId(username);
});
getTwitterIds();

// [
//     '1579998219014402049',
//     '1487764654789120007',
//     '1430634497146454020',
//     '1431223416439312393',
//     '1315596439389691904'
//   ]


