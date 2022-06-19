







const puppeteer = require('puppeteer');
var mysql = require('mysql');

var con = mysql.createConnection({host: "localhost",user: "root",password: "",database: "2d"});

con.connect(function(err) {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Connecter a Mysql avec succés(System by louiskle#0001)");
    }
});


puppeteer.launch().then(async browser => {

    let i = 29;
    while (i < 50) {

        console.log("-------------------------------");
        console.log("Ataque de la page  " + i);
        console.log("\\/\\/\\/\\/\\/\\/\\/");

            const page = await browser.newPage();
            await page.goto('https://www.2ememain.be/l/immo/p/'+ i +'/#Language:fr-BE');
            await page.waitForSelector('body');
        
            let grabPosts = await page.evaluate(() => {
                
                let allPosts = document.body.querySelectorAll('.mp-Listing');
        
                scrapeItems = [];
                allPosts.forEach(item => {
                    let P_Title = item.querySelector('.mp-Listing-title');
                    let P_Prix = item.querySelector('.mp-Listing-price');
                    let P_ville = item.querySelector('.mp-Listing-location');
                    let P_mcarre = item.querySelector('.mp-Listing-attributes');

                    scrapeItems.push({
                        P_Title: P_Prix ? P_Title.innerText : null,
                        P_Prix: P_Prix ? P_Prix.innerText : null,
                        P_ville: P_ville ? P_ville.innerText : null,
                        P_mcarre: P_mcarre ? P_mcarre.innerText : null,
                    });
        
                });
        
                let items = scrapeItems;
        
                return items;
            });

            grabPosts.forEach(it => {

                if(it.P_Title != null && it.P_Prix != null && it.P_ville != null && it.P_mcarre != null){
                    let I_Title = it.P_Title;
                    let I_Prix = it.P_Prix;
                    let I_ville = it.P_ville;
                    let I_mcarre = it.P_mcarre;

                    I_mcarreindex = I_mcarre.indexOf("m²");
                    I_mcarre = I_mcarre.substring(I_mcarreindex-4, I_mcarreindex)
                    I_mcarre = + I_mcarre

                    I_Prix = I_Prix.replace(" ","");
                    I_Prix = I_Prix.replace("€","");
                    I_Prix = I_Prix.replace(".","");
                    I_Prix = I_Prix.split(",");
                    I_Prix = I_Prix[0];
                    I_Prix = + I_Prix;

                    I_Title = I_Title.replace("'"," ");
                    I_Title = I_Title.replace("\""," ");

                    I_ville = I_ville.replace("'"," ");
                    I_ville = I_ville.replace("\""," ");

                    if(I_Prix != undefined && I_Prix >= 10000 && I_mcarre > 0 && I_mcarre < 999){
                        con.query("SELECT * FROM `code_postaux_belge` WHERE `Localite` = '"+ I_ville +"'", function (err, result, fields) {
                            if (err) {
                                console.log(err)
                            }
                            if(result.length > 0 && Math.round(I_Prix / I_mcarre) > 200 && Math.round(I_Prix / I_mcarre) < 50000){

                                con.query("SELECT * FROM `bat` WHERE `titre` = '"+ I_Title +"' AND `prix` = "+ I_Prix +" AND `ville` = '"+ result[0].Code +"'", function (err, res, fields) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    if(res.length == 0){
                                        con.query("INSERT INTO `bat`(`titre`, `prix`, `ville`, `mcarre`, `prix_mcarre`) VALUES ('"+ I_Title +"',"+ I_Prix +",'"+ result[0].Code +"',"+ I_mcarre +","+ Math.round(I_Prix / I_mcarre) +")", function (err, result) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            console.log("+1 Bat en base de donnée  : " + i);
                                        });

                                    }

                                });
                            }else{
                                console.log("Déja en BDD " + i)
                            }

                        });
                        
                    }
                }
            });
        
        console.log("-------------------------------");
        console.log("-------------------------------");
        
        i++
        
    }


    await browser.close();
        

}).catch(function (err) {
    console.error(err);
});




