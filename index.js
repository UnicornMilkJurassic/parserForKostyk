const got = require('got');
const cheerio = require('cheerio');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kharkovsky21!?',
    database: 'productfootball'
});

connection.connect(err => {
    if(err){
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});


function closeConnection () {
    connection.end(err => {
        if(err) throw err
        console.log('Connection closed as id' + connection.threadId);
    });
};

(async () => {
    try {
        const response = await got('https://www.flashscore.ru/team/chelsea/4fGZN2oK/');
        const $ = cheerio.load(response.body);

        const teamName = $('div.teamHeader__name').text().replace(/\s+/g, '');
        const country = $('a.breadcrumb__link').eq(-1).text();

        const teamLogo = $('div.teamHeader__logo').attr('style');
        const slicedTeamLogo = teamLogo.slice(teamLogo.indexOf('(') + 1, teamLogo.length - 1);
        const logoFinalLook = `https://www.flashscore.ru${slicedTeamLogo}`;

        let checkSQL = `SELECT 1 from teaminfo where teamName = "${teamName}"`
        connection.query(checkSQL, (err, result) => {
            if (err) throw err
            console.log('Result', result)
            if (result.length !== 0) {
                console.log(`Команда ${teamName} уже добавлена`)
                closeConnection()
            } else {
                let post = {id: 1, teamName: teamName, country: country, teamLogo: logoFinalLook}
                let sql = 'INSERT INTO teaminfo SET ?'
                connection.query(sql, post, (err, result) => {
                    if (err) throw err
                    console.log('Команда добавлена!', result)
                    closeConnection()
                });
            }
        });
    } catch(e) {
        console.log(`Error: ${e}`)
    }
})();



