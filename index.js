const got = require('got');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

(async () => {
    try {
        const response = await got('https://www.flashscore.ru/team/chelsea/4fGZN2oK/');
        const $ = cheerio.load(response.body);

        const teamName = $('div.teamHeader__name').text().trim();
        const country = $('a.breadcrumb__link').eq(-1).text();

        const teamLogo = $('div.teamHeader__logo').attr('style');
        const slicedTeamLogo = teamLogo.slice(teamLogo.indexOf('(') + 1, teamLogo.length - 1);
        const logoFinalLook = `https://www.flashscore.ru${slicedTeamLogo}`;

        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Kharkovsky21!?',
            database: 'productfootball'
        });

        let checkSQL = 'SELECT 1 from teaminfo where teamName = ?';

        const [answerSQL] = await connection.execute(checkSQL, [teamName]);
        if (answerSQL.length !== 0) {
            console.log(`Команда ${teamName} уже есть в таблице`)
        } else {
            let sql = 'INSERT INTO teaminfo SET teamName = ?, country = ?, teamLogo = ?'
            await connection.execute(sql, [teamName, country, logoFinalLook])
            console.log(`Команда ${teamName} добавлена!`)
        }
        await connection.end();
    } catch(e) {
        console.log(`Error: ${e}`);
    }
})();



