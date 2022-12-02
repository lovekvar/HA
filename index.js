const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')
const dotenv = require('dotenv');
const xl = require('excel4node');
const Web3 = require('web3');
const delay = require('delay');
dotenv.config();

//Import package
const { Client, auth } = require("twitter-api-sdk");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER));

const twitterClient = new Client(process.env.TWITTER_BEARER_TOKEN);
const wb = new xl.Workbook();
var ws;
var nextToken = '';
var dataPoints = 0;
var rowIndex = 2;
var person = 1;
var domain_row_map = {};
var domain_address_map = {};
var row_domain_map = {};

const generate_domain = (word)=>{
    if(word.length <= 4){
        return word;
    } else {
        for(let i = word.length - 5; i >= 0; i--){
            // console.log(word[i]);
            if( !( (('a' <= word[i]) && ('z' >= word[i])) || (('A' <= word[i]) && ('Z' >= word[i])) || (('0' <= word[i]) && ('9' >= word[i]))) ){
                // console.log(i, word[i]);
                return word.substring(i+1);
            }
        }
    }
    return word;
}

const headingColumnNames = {
    'description' : 4,
    'id' : 1,
    'username' : 2,
    'name' : 3,
    'ethField' : 5,
    'walletAddress' : 6
}

const twitterIDs = {
    1 : {
        username : 'MetabloxNetwork',
        id : '1579998219014402049'
    },
    2 : {
        username : 'SupremeKongNFT',
        id : '1487764654789120007'
    },
    3 : {
        username : 'capsule_house',
        id : '1430634497146454020'
    },
    4 : {
        username : 'MekaVerse',
        id : '1431223416439312393'
    },
    5 : {
        username : 'TheHashmasks',
        id : '1315596439389691904'
    }
  }

const max_length = Object.keys(twitterIDs).length;

const setWalletAddress = async(initial, final)=>{
    let a = [];
    for(let j = initial; j < final; j++){
        a.push(j);
    }
    for await (let k of a){
        try {
            console.log('domain', row_domain_map[k]);
            let walletAddress = await web3.eth.ens.getAddress(row_domain_map[k]);
            // await delay(1000);
            ws.cell(k , 6).string(walletAddress);
            console.log("got it   ", walletAddress);
        } catch (err) {
            ws.cell(k, 6).string('Could not process');
            console.log(err);
        }
        // console.log(k);
    }
}

const getFollowers = async (id, token = '') => {
    try {
        const getUsersFollowers = await twitterClient.users.usersIdFollowers(
            id, {max_results: 1000, pagination_token: token, "user.fields": ['description', 'id', 'name', 'username']}
        );
        let data = getUsersFollowers.data;
        dataPoints += data.length;
        console.log(dataPoints);
        // console.log(getUsersFollowers.meta);
        if(typeof getUsersFollowers.meta.next_token != 'undefined'){
            nextToken = getUsersFollowers.meta.next_token;
        } else {
            nextToken = '';
        }

        let initial = rowIndex;

        data.forEach((record) => {
            let p1 = record['name'].search('.eth');
            let ethField = '';
            if(p1 == -1){
                p1 = record['description'].search('.eth');
                if(p1 == -1){
                    return;
                } else {
                    ethField = generate_domain(record['description'].substring(0, (p1 + 4)));
                }
            } else {
                ethField = generate_domain(record['name'].substring(0, (p1 + 4)));
            }

            if(ethField[ethField.length - 4] != '.'){
                return;
            }
            
            row_domain_map[rowIndex] = ethField;
            // domain_row_map[ethField] = rowIndex;
            // console.log(ethField, domain_row_map[ethField]);
            Object.keys(record).forEach(columnName =>{
                ws.cell(rowIndex, headingColumnNames[columnName]).string(record[columnName]);
            });
            ws.cell(rowIndex, 5).string(ethField);
            rowIndex++;
        });
        let final = rowIndex;
        setWalletAddress(initial, final);
        wb.write('data.xlsx');
    } catch (error) {
        console.log(error);
    }
    await delay(60500);
    if(nextToken != ''){
        getFollowers(id, nextToken);
    } else if (person < max_length) {
        wb.write('data.xlsx');
        console.log('person', person);
        person++;
        dataPoints = 0;
        rowIndex = 2;
        ws = wb.addWorksheet(`${twitterIDs[person].username}`);
        for(let heading in headingColumnNames){
            ws.cell(1, headingColumnNames[heading])
                .string(heading)
        };
        getFollowers(twitterIDs[person].id);
            }
  };


ws = wb.addWorksheet(`${twitterIDs[person].username}`);
for(let heading in headingColumnNames){
    ws.cell(1, headingColumnNames[heading])
        .string(heading)
};
getFollowers(twitterIDs[person].id);
